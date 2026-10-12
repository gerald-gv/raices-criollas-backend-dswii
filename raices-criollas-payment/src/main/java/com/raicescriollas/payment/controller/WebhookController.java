package com.raicescriollas.payment.controller;

import com.raicescriollas.payment.dto.NotificacionMP;
import com.raicescriollas.payment.service.INotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final INotificacionService notificacionService;

    @PostMapping("/mercadopago")
    public ResponseEntity<Void> recibir(@RequestBody NotificacionMP notificacion) {
        String dataId = notificacion.data() != null ? notificacion.data().id() : null;
        log.info("Webhook recibido: type={}, action={}, data.id={}",
                notificacion.type(), notificacion.action(), dataId);

        if ("payment".equals(notificacion.type()) && dataId != null) {
            notificacionService.procesarPago(dataId);
        } else {
            log.info("Aviso ignorado: no es un pago");
        }
        return ResponseEntity.ok().build();
    }
}
