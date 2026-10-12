package com.raicescriollas.payment.service.impl;

import com.raicescriollas.payment.client.PedidoClient;
import com.raicescriollas.payment.dto.CrearPagoRequest;
import com.raicescriollas.payment.dto.PagoResponse;
import com.raicescriollas.payment.dto.PreferenciaCreada;
import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.exception.IdempotencyKeyInUseException;
import com.raicescriollas.payment.exception.PagoNotFoundException;
import com.raicescriollas.payment.exception.PedidoNoPagableException;
import com.raicescriollas.payment.exception.PedidoNotFoundException;
import com.raicescriollas.payment.exception.ServicioNoDisponibleException;
import com.raicescriollas.payment.repository.PagoRepository;
import com.raicescriollas.payment.service.IMercadoPagoService;
import com.raicescriollas.payment.service.IPagoService;
import feign.FeignException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoServiceImpl implements IPagoService {

    private static final String ESTADO_PAGABLE = "PENDIENTE_PAGO";

    private final PagoRepository repo;
    private final IMercadoPagoService mercadoPagoService;
    private final PedidoClient pedidoClient;

    @Override
    @Transactional
    public PagoResponse crear(CrearPagoRequest request, Long usuarioId, String idempotencyKey, String authorization) {
        Optional<Pago> existente = repo.findByIdempotencyKey(idempotencyKey);

        if (existente.isPresent()) {
            Pago pago = existente.get();
            boolean mismaSolicitud = pago.getUsuarioId().equals(usuarioId)
                    && pago.getPedidoId().equals(request.pedidoId());

            if (!mismaSolicitud) {
                throw new IdempotencyKeyInUseException();
            }

            return PagoResponse.from(pago);
        }

        PedidoClient.PedidoData pedido = obtenerPedido(request.pedidoId(), authorization);

        if (!pedido.clienteId().equals(usuarioId)) {
            throw new PedidoNotFoundException();   // no se revela que existe
        }
        if (!ESTADO_PAGABLE.equals(pedido.estado())) {
            throw new PedidoNoPagableException("El pedido no admite pago en su estado actual");
        }
        if (pedido.total() == null || pedido.total().compareTo(BigDecimal.ZERO) <= 0) {
            throw new PedidoNoPagableException("El pedido no tiene un total valido");
        }
        if (repo.existsByPedidoIdAndEstado(pedido.id(), EstadoPago.APROBADO)) {
            throw new PedidoNoPagableException("El pedido ya fue pagado");
        }

        Pago pago = Pago.builder()
                .pedidoId(pedido.id())
                .usuarioId(usuarioId)
                .monto(pedido.total())
                .idempotencyKey(idempotencyKey)
                .build();

        Pago guardado = repo.save(pago);

        PreferenciaCreada preferencia = mercadoPagoService.crearPreferencia(guardado);
        guardado.setMpPreferenceId(preferencia.preferenceId());
        guardado.setUrlPago(preferencia.urlPago());

        return PagoResponse.from(repo.save(guardado));
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
}