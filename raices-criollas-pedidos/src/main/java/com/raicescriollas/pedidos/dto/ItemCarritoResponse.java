package com.raicescriollas.pedidos.dto;

import java.math.BigDecimal;

public record ItemCarritoResponse(Long platoId, Integer cantidad, String nombre, String imagen,
		BigDecimal precioUnitario, BigDecimal subtotal, boolean disponible) {
}
