package com.raicescriollas.pedidos.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReemplazarCarritoRequest(@NotNull @Size(max = 50) List<@Valid AgregarItemRequest> items) {
}
