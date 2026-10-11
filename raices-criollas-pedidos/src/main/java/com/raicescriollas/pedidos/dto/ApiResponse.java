package com.raicescriollas.pedidos.dto;

public record ApiResponse<T>(boolean success, String mensaje, T data) {
}
