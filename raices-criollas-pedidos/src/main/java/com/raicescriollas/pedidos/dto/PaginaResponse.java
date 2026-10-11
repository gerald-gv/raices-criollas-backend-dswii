package com.raicescriollas.pedidos.dto;

import java.util.List;

public record PaginaResponse<T>(List<T> content, long totalElements, int totalPages, int page, int size) {
	
}
