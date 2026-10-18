package com.raicescriollas.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

import jakarta.validation.constraints.AssertTrue;

public record CrearPagoRequest(
        Long pedidoId,
        Long reservaId
) {
    @AssertTrue(message = "Indica pedidoId o reservaId, pero solo uno")
    public boolean isUnSoloOrigen() {
        return (pedidoId != null) ^ (reservaId != null);
    }
}