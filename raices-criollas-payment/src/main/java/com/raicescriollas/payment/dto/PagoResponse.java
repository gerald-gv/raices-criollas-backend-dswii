package com.raicescriollas.payment.dto;

import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import com.raicescriollas.payment.entity.TipoOrigen;

import java.math.BigDecimal;
import java.time.Instant;

public record PagoResponse(
        Long id,
        TipoOrigen tipo,
        Long pedidoId,
        Long reservaId,
        BigDecimal monto,
        String moneda,
        EstadoPago estado,
        String urlPago,
        Instant creadoEn,
        Instant venceEn
) {
    public static PagoResponse from(Pago pago) {
        return new PagoResponse(
                pago.getId(),
                pago.getTipo(),
                pago.getPedidoId(),
                pago.getReservaId(),
                pago.getMonto(),
                pago.getMoneda(),
                pago.getEstado(),
                pago.getUrlPago(),
                pago.getCreadoEn(),
                pago.getVenceEn()
        );
    }
}
