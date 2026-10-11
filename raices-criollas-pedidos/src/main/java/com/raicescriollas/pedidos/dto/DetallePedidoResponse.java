package com.raicescriollas.pedidos.dto;

import java.math.BigDecimal;

public record DetallePedidoResponse(Long platoId, String nombrePlato, Integer cantidad, BigDecimal precioUnitario,
		BigDecimal subtotal) {
}
