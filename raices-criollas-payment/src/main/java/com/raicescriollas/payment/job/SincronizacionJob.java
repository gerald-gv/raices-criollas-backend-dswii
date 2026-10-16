package com.raicescriollas.payment.job;

import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.repository.PagoRepository;
import com.raicescriollas.payment.service.INotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.sync.activo", havingValue = "true", matchIfMissing = true)
public class SincronizacionJob {

    private final PagoRepository pagoRepository;
    private final INotificacionService notificacionService;

    @Value("${app.sync.ventana-minutos:35}")
    private long ventanaMinutos;

    @Scheduled(fixedDelayString = "${app.sync.intervalo-ms:30000}",
            initialDelayString = "${app.sync.intervalo-ms:30000}")
    public void sincronizarPendientes() {
        Instant desde = Instant.now().minus(ventanaMinutos, ChronoUnit.MINUTES);

        List<Pago> pendientes = pagoRepository.findByEstadoInAndCreadoEnAfter(
                List.of(EstadoPago.PENDIENTE, EstadoPago.RECHAZADO), desde);

        if (!pendientes.isEmpty()) {
            log.debug("Sincronizando {} pago(s) pendiente(s)", pendientes.size());
        }

        for (Pago pago : pendientes) {
            try {
                notificacionService.sincronizar(pago.getId());
            } catch (Exception e) {
                log.warn("No se pudo sincronizar el pago {}: {}", pago.getId(), e.getMessage());
            }
        }
    }
}