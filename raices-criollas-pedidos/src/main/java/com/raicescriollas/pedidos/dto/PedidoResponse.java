package com.raicescriollas.pedidos.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


public record PedidoResponse(Long id, Long clienteId, LocalDateTime fecha, String estado, BigDecimal total,
		String direccionEntrega, String telefonoContacto, List<DetallePedidoResponse> detalles) {
}
