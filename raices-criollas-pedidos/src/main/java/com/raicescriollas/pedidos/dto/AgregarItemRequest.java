package com.raicescriollas.pedidos.dto;

import jakarta.validation.constraints.Min;

import jakarta.validation.constraints.NotNull;


public record AgregarItemRequest(@NotNull Long platoId, @NotNull @Min(1) Integer cantidad) {
}
