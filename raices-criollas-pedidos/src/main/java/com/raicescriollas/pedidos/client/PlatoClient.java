package com.raicescriollas.pedidos.client;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@FeignClient(name = "raices-criollas-menu")
public interface PlatoClient {
	
	@GetMapping("/platos/{id}")
	MenuResponse obtenerPlato(@PathVariable("id") Long id);

	record MenuResponse(boolean success, String mensaje, PlatoData data) {
	}

	record PlatoData(Long id, String nombre, BigDecimal precio, Boolean disponible) {
	}
}
