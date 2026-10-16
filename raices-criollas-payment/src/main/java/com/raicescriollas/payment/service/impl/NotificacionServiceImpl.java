package com.raicescriollas.payment.service.impl;

import com.raicescriollas.payment.client.PedidoClient;
import com.raicescriollas.payment.dto.PagoMP;
import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.entity.TipoTransaccion;
import com.raicescriollas.payment.entity.TransaccionPago;
import com.raicescriollas.payment.exception.ServicioNoDisponibleException;
import com.raicescriollas.payment.repository.PagoRepository;
import com.raicescriollas.payment.repository.TransaccionPagoRepository;
import com.raicescriollas.payment.service.IMercadoPagoService;
import com.raicescriollas.payment.service.INotificacionService;
import feign.FeignException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionServiceImpl implements INotificacionService {

    private final IMercadoPagoService mercadoPagoService;
    private final PagoRepository pagoRepository;
    private final TransaccionPagoRepository transaccionRepository;
    private final PedidoClient pedidoClient;
    private final ServiceTokenProvider serviceTokens;

    @Override
    @Transactional
    public void procesarPago(String mpPaymentId) {
        Long id;
        try {
            id = Long.valueOf(mpPaymentId);
        } catch (NumberFormatException e) {
            log.warn("Aviso con id de pago invalido: {}", mpPaymentId);
            return;
        }
        consultarYAplicar(id);
    }

    @Override
    @Transactional
    public void sincronizar(Long pagoId) {
        Optional<Pago> pago = pagoRepository.findById(pagoId);
        if (pago.isEmpty() || pago.get().getReferenciaExterna() == null) {
            return;
        }

        String referencia = pago.get().getReferenciaExterna();
        List<Long> idsMp = mercadoPagoService.buscarIdsDePagos(referencia);
        log.debug("Sincronizando pago {}: Mercado Pago informa {} pago(s) con la referencia {}",
                pagoId, idsMp.size(), referencia);

        for (Long idMp : idsMp) {
            consultarYAplicar(idMp);
        }
    }

    private void consultarYAplicar(Long mpPaymentId) {
        Optional<PagoMP> consulta = mercadoPagoService.consultarPago(mpPaymentId);
        if (consulta.isEmpty() || consulta.get().status() == null) {
            return;
        }
        PagoMP mp = consulta.get();

        Optional<Pago> encontrado = buscarPago(mp.externalReference());
        if (encontrado.isEmpty()) {
            log.warn("El pago {} de Mercado Pago no corresponde a ningun pago nuestro (referencia: {})",
                    mp.id(), mp.externalReference());
            return;
        }
        Pago pago = encontrado.get();

        if (pago.getMonto().compareTo(mp.monto()) != 0) {
            log.error("Monto distinto en el pago {}: esperado {} y Mercado Pago informa {}",
                    pago.getId(), pago.getMonto(), mp.monto());
            return;
        }

        EstadoPago nuevo = traducir(mp.status());

        boolean yaRegistrada = transaccionRepository
                .existsByPagoIdAndMpPaymentIdAndEstadoMp(pago.getId(), mp.id(), mp.status());
        if (!yaRegistrada) {
            transaccionRepository.save(TransaccionPago.builder()
                    .pago(pago)
                    .tipo(nuevo == EstadoPago.REEMBOLSADO ? TipoTransaccion.REEMBOLSO : TipoTransaccion.COBRO)
                    .mpPaymentId(mp.id())
                    .estadoMp(mp.status())
                    .monto(mp.monto())
                    .respuestaRaw(mp.respuestaRaw())
                    .build());
        }

        if (transicionValida(pago.getEstado(), nuevo)) {
            if (nuevo == EstadoPago.APROBADO) {
                avisarPedidoPagado(pago);
            }
            pago.setEstado(nuevo);
            pago.setMpPaymentId(mp.id());
            pagoRepository.save(pago);
            log.info("Pago {} pasa a {}", pago.getId(), nuevo);
        } else {
            log.info("Pago {} se mantiene en {} (Mercado Pago informa: {})",
                    pago.getId(), pago.getEstado(), mp.status());
        }
    }

    private Optional<Pago> buscarPago(String externalReference) {
        if (externalReference == null) {
            return Optional.empty();
        }
        return pagoRepository.findByReferenciaExternaParaActualizar(externalReference);
    }

    private EstadoPago traducir(String statusMp) {
        return switch (statusMp) {
            case "approved" -> EstadoPago.APROBADO;
            case "rejected" -> EstadoPago.RECHAZADO;
            case "cancelled" -> EstadoPago.CANCELADO;
            case "refunded" -> EstadoPago.REEMBOLSADO;
            default -> EstadoPago.PENDIENTE;
        };
    }

    private boolean transicionValida(EstadoPago actual, EstadoPago nuevo) {
        return switch (actual) {
            case PENDIENTE -> nuevo != EstadoPago.PENDIENTE;
            case RECHAZADO -> nuevo != EstadoPago.RECHAZADO;
            case APROBADO -> nuevo == EstadoPago.REEMBOLSADO;
            case CANCELADO, REEMBOLSADO -> false;
        };
    }

    private void avisarPedidoPagado(Pago pago) {
        try {
            try {
                pedidoClient.marcarPagado(pago.getPedidoId(), serviceTokens.bearer());
            } catch (FeignException.Unauthorized e) {
                serviceTokens.invalidar();
                pedidoClient.marcarPagado(pago.getPedidoId(), serviceTokens.bearer());
            }
        } catch (FeignException.Conflict | FeignException.NotFound e) {
            log.error("REVISION MANUAL: el pago {} fue aprobado pero Pedidos no pudo marcar el pedido {} como pagado (estado {})",
                    pago.getId(), pago.getPedidoId(), e.status());
        } catch (FeignException e) {
            log.error("Pedidos no respondio al aviso de pago del pedido {}. Estado: {}",
                    pago.getPedidoId(), e.status());
            throw new ServicioNoDisponibleException();
        }
    }
}