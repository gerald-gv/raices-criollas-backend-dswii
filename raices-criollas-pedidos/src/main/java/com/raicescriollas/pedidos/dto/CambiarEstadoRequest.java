package com.raicescriollas.pedidos.dto;

import com.raicescriollas.pedidos.enums.EstadoPedido;

import jakarta.validation.constraints.NotNull;

public record CambiarEstadoRequest(@NotNull EstadoPedido estado) {
}

