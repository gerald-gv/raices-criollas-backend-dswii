package com.raicescriollas.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CrearPagoRequest(
        @NotNull(message = "El pedido es obligatorio") Long pedidoId
) {
}
