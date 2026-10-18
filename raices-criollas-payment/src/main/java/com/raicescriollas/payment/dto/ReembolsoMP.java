package com.raicescriollas.payment.dto;

import java.math.BigDecimal;

public record ReembolsoMP(
        String id,
        String status,
        BigDecimal monto,
        String respuestaRaw
) {
}
