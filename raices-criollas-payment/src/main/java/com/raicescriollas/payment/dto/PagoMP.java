package com.raicescriollas.payment.dto;

import java.math.BigDecimal;

public record PagoMP(
        String id,
        String status,
        String externalReference,
        BigDecimal monto,
        String respuestaRaw
) {
}
