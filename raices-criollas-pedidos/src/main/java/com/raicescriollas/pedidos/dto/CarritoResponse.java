package com.raicescriollas.pedidos.dto;

import java.math.BigDecimal;
import java.util.List;

public record CarritoResponse(Long clienteId, List<ItemCarritoResponse> items, BigDecimal total) {
}
