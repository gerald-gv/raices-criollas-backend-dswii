package com.raicescriollas.payment.dto;

import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;

import java.math.BigDecimal;
import java.time.Instant;

public record PagoResponse(
        Long id,
        Long pedidoId,
        BigDecimal monto,
        String moneda,
        EstadoPago estado,
        String urlPago,
        Instant creadoEn
) {
   public static PagoResponse from(Pago pago) {
       return new PagoResponse(
               pago.getId(),
               pago.getPedidoId(),
               pago.getMonto(),
               pago.getMoneda(),
               pago.getEstado(),
               pago.getUrlPago(),
               pago.getCreadoEn()
       );
   }
}
