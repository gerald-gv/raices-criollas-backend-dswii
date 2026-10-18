package com.raicescriollas.payment.service.impl;

import com.raicescriollas.payment.client.PedidoClient;
import com.raicescriollas.payment.client.ReservaClient;
import com.raicescriollas.payment.dto.CrearPagoRequest;
import com.raicescriollas.payment.dto.PagoResponse;
import com.raicescriollas.payment.dto.PreferenciaCreada;
import com.raicescriollas.payment.dto.ReembolsoMP;
import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.entity.TipoOrigen;
import com.raicescriollas.payment.entity.TipoTransaccion;
import com.raicescriollas.payment.entity.TransaccionPago;
import com.raicescriollas.payment.exception.IdempotencyKeyInUseException;
import com.raicescriollas.payment.exception.PagoNoReembolsableException;
import com.raicescriollas.payment.exception.PagoNotFoundException;
import com.raicescriollas.payment.exception.PedidoNoPagableException;
import com.raicescriollas.payment.exception.PedidoNotFoundException;
import com.raicescriollas.payment.exception.ReservaNotFoundException;
import com.raicescriollas.payment.exception.ServicioNoDisponibleException;
import com.raicescriollas.payment.repository.PagoRepository;
import com.raicescriollas.payment.repository.TransaccionPagoRepository;
import com.raicescriollas.payment.service.IMercadoPagoService;
import com.raicescriollas.payment.service.IPagoService;
import feign.FeignException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements IPagoService {

    private static final String ESTADO_PEDIDO_PAGABLE = "PENDIENTE_PAGO";
    private static final String ESTADO_RESERVA_PAGABLE = "PENDIENTE";
    private static final long MARGEN_MINUTOS = 2;

    private final PagoRepository repo;
    private final TransaccionPagoRepository transaccionRepository;
    private final IMercadoPagoService mercadoPagoService;
    private final PedidoClient pedidoClient;
    private final ReservaClient reservaClient;

    @Value("${app.pedidos.vigencia-minutos:30}")
    private long vigenciaMinutos;

    @Value("${app.pedidos.zona-horaria:America/Lima}")
    private String zonaHoraria;

    @Value("${app.reservas.zona-horaria:America/Lima}")
    private String zonaHorariaReservas;

    @Override
    @Transactional
    public PagoResponse crear(CrearPagoRequest request, Long usuarioId, String idempotencyKey, String authorization) {
        Optional<Pago> existente = repo.findByIdempotencyKey(idempotencyKey);

        if (existente.isPresent()) {
            Pago pago = existente.get();
            boolean mismaSolicitud = pago.getUsuarioId().equals(usuarioId)
                    && Objects.equals(pago.getPedidoId(), request.pedidoId())
                    && Objects.equals(pago.getReservaId(), request.reservaId());

            if (!mismaSolicitud) {
                throw new IdempotencyKeyInUseException();
            }
            return PagoResponse.from(pago);
        }

        return request.reservaId() != null
                ? crearParaReserva(request.reservaId(), usuarioId, idempotencyKey, authorization)
                : crearParaPedido(request.pedidoId(), usuarioId, idempotencyKey, authorization);
    }

    private PagoResponse crearParaPedido(Long pedidoId, Long usuarioId, String idempotencyKey, String authorization) {
        PedidoClient.PedidoData pedido = obtenerPedido(pedidoId, authorization);

        if (!pedido.clienteId().equals(usuarioId)) {
            throw new PedidoNotFoundException();   // no se revela que existe
        }
        if (!ESTADO_PEDIDO_PAGABLE.equals(pedido.estado())) {
            throw new PedidoNoPagableException("El pedido no admite pago en su estado actual");
        }
        if (pedido.total() == null || pedido.total().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PedidoNoPagableException("El pedido no tiene un total valido");
        }
        if (repo.existsByPedidoIdAndEstado(pedido.id(), EstadoPago.APROBADO)) {
            throw new PedidoNoPagableException("El pedido ya fue pagado");
        }

        OffsetDateTime venceEn = vencimientoPedido(pedido.fecha());

        Optional<Pago> reutilizable = repo
                .findFirstByPedidoIdAndUsuarioIdAndEstadoOrderByCreadoEnDesc(
                        pedido.id(), usuarioId, EstadoPago.PENDIENTE)
                .filter(p -> esReutilizable(p, venceEn, pedido.total()));

        if (reutilizable.isPresent()) {
            log.info("Pedido {}: se reutiliza el pago pendiente {}", pedido.id(), reutilizable.get().getId());
            return PagoResponse.from(reutilizable.get());
        }

        Pago pago = Pago.builder()
                .tipo(TipoOrigen.PEDIDO)
                .pedidoId(pedido.id())
                .usuarioId(usuarioId)
                .monto(pedido.total())
                .idempotencyKey(idempotencyKey)
                .venceEn(venceEn.toInstant())
                .build();

        return cobrar(pago, venceEn);
    }

    private PagoResponse crearParaReserva(Long reservaId, Long usuarioId, String idempotencyKey, String authorization) {
        ReservaClient.ReservaData reserva = obtenerReserva(reservaId, authorization);

        if (!reserva.clienteId().equals(usuarioId)) {
            throw new ReservaNotFoundException();   // no se revela que existe
        }
        if (!ESTADO_RESERVA_PAGABLE.equals(reserva.estado())
                || !ESTADO_RESERVA_PAGABLE.equals(reserva.estadoPago())) {
            throw new PedidoNoPagableException("La reserva no admite pago en su estado actual");
        }
        if (reserva.montoTotal() == null || reserva.montoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PedidoNoPagableException("La reserva no tiene un monto valido");
        }
        if (repo.existsByReservaIdAndEstado(reserva.id(), EstadoPago.APROBADO)) {
            throw new PedidoNoPagableException("La reserva ya fue pagada");
        }

        OffsetDateTime venceEn = vencimientoReserva(reserva.fechaExpiracionPago());

        Optional<Pago> reutilizable = repo
                .findFirstByReservaIdAndUsuarioIdAndEstadoOrderByCreadoEnDesc(
                        reserva.id(), usuarioId, EstadoPago.PENDIENTE)
                .filter(p -> esReutilizable(p, venceEn, reserva.montoTotal()));

        if (reutilizable.isPresent()) {
            log.info("Reserva {}: se reutiliza el pago pendiente {}", reserva.id(), reutilizable.get().getId());
            return PagoResponse.from(reutilizable.get());
        }

        Pago pago = Pago.builder()
                .tipo(TipoOrigen.RESERVA)
                .reservaId(reserva.id())
                .usuarioId(usuarioId)
                .monto(reserva.montoTotal())
                .moneda(reserva.moneda() != null ? reserva.moneda() : "PEN")
                .idempotencyKey(idempotencyKey)
                .venceEn(venceEn.toInstant())
                .build();

        return cobrar(pago, venceEn);
    }

    private PagoResponse cobrar(Pago pago, OffsetDateTime venceEn) {
        Pago guardado = repo.save(pago);

        PreferenciaCreada preferencia = mercadoPagoService.crearPreferencia(guardado, venceEn);
        guardado.setMpPreferenceId(preferencia.preferenceId());
        guardado.setUrlPago(preferencia.urlPago());

        return PagoResponse.from(repo.save(guardado));
    }

    private boolean esReutilizable(Pago pago, OffsetDateTime venceEn, BigDecimal monto) {
        return pago.getUrlPago() != null
                && pago.getVenceEn() != null
                && !pago.getVenceEn().isBefore(venceEn.toInstant())
                && pago.getMonto().compareTo(monto) == 0;
    }

    @Override
    public PagoResponse obtener(Long id, Long usuarioId) {
        return repo.findByIdAndUsuarioId(id, usuarioId)
                .map(PagoResponse::from)
                .orElseThrow(PagoNotFoundException::new);
    }

    @Override
    public List<PagoResponse> listarPorPedido(Long pedidoId, Long usuarioId) {
        return repo.findByPedidoIdAndUsuarioId(pedidoId, usuarioId).stream()
                .map(PagoResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public PagoResponse reembolsar(Long id) {
        // Sin filtrar por usuario: solo el admin llega aqui (lo exige el controlador)
        Pago pago = repo.findByIdParaActualizar(id).orElseThrow(PagoNotFoundException::new);

        if (pago.getEstado() == EstadoPago.REEMBOLSADO) {
            return PagoResponse.from(pago);          // idempotente
        }
        if (pago.getEstado() != EstadoPago.APROBADO || pago.getMpPaymentId() == null) {
            throw new PagoNoReembolsableException("Solo se puede reembolsar un pago aprobado");
        }

        ReembolsoMP reembolso = mercadoPagoService.reembolsar(
                Long.valueOf(pago.getMpPaymentId()),
                pago.getMonto(),
                "reembolso-pago-" + pago.getId());

        boolean yaRegistrada = transaccionRepository.existsByPagoIdAndMpPaymentIdAndEstadoMp(
                pago.getId(), pago.getMpPaymentId(), "refunded");
        if (!yaRegistrada) {
            transaccionRepository.save(TransaccionPago.builder()
                    .pago(pago)
                    .tipo(TipoTransaccion.REEMBOLSO)
                    .mpPaymentId(pago.getMpPaymentId())
                    .estadoMp("refunded")
                    .monto(pago.getMonto())
                    .respuestaRaw(reembolso.respuestaRaw())
                    .build());
        }

        pago.setEstado(EstadoPago.REEMBOLSADO);
        log.info("Pago {} reembolsado (reembolso MP {})", pago.getId(), reembolso.id());

        return PagoResponse.from(repo.save(pago));
    }

    @Override
    public List<PagoResponse> listarPorReserva(Long reservaId, Long usuarioId) {
        return repo.findByReservaIdAndUsuarioId(reservaId, usuarioId).stream()
                .map(PagoResponse::from)
                .toList();
    }

    private OffsetDateTime vencimientoPedido(LocalDateTime fechaPedido) {
        if (fechaPedido == null) {
            throw new PedidoNoPagableException("El pedido no tiene una fecha valida");
        }
        OffsetDateTime vence = fechaPedido
                .atZone(ZoneId.of(zonaHoraria))
                .plusMinutes(vigenciaMinutos)
                .toOffsetDateTime();
        return validarMargen(vence);
    }

    private OffsetDateTime vencimientoReserva(LocalDateTime expiracion) {
        if (expiracion == null) {
            throw new PedidoNoPagableException("La reserva no tiene una fecha de expiracion valida");
        }
        OffsetDateTime vence = expiracion
                .atZone(ZoneId.of(zonaHorariaReservas))
                .toOffsetDateTime();
        return validarMargen(vence);
    }

    private OffsetDateTime validarMargen(OffsetDateTime vence) {
        if (vence.isBefore(OffsetDateTime.now().plusMinutes(MARGEN_MINUTOS))) {
            throw new PedidoNoPagableException("El plazo para pagar esta por vencer o ya vencio. Genera uno nuevo");
        }
        return vence;
    }

    private PedidoClient.PedidoData obtenerPedido(Long pedidoId, String authorization) {
        try {
            PedidoClient.PedidoApiResponse respuesta = pedidoClient.obtenerPedido(pedidoId, authorization);
            if (respuesta == null || respuesta.data() == null) {
                throw new PedidoNotFoundException();
            }
            return respuesta.data();
        } catch (FeignException.NotFound e) {
            throw new PedidoNotFoundException();
        } catch (FeignException e) {
            log.error("Error al consultar Pedidos. Estado: {}", e.status(), e);
            throw new ServicioNoDisponibleException();
        }
    }

    private ReservaClient.ReservaData obtenerReserva(Long reservaId, String authorization) {
        try {
            ReservaClient.ReservaApiResponse respuesta = reservaClient.obtenerReserva(reservaId, authorization);
            if (respuesta == null || respuesta.data() == null) {
                throw new ReservaNotFoundException();
            }
            return respuesta.data();
        } catch (FeignException.NotFound | FeignException.Forbidden e) {
            // Reservas responde 403 si la reserva es de otro usuario: no se revela que existe
            throw new ReservaNotFoundException();
        } catch (FeignException e) {
            log.error("Error al consultar Reservas. Estado: {}", e.status(), e);
            throw new ServicioNoDisponibleException();
        }
    }
}