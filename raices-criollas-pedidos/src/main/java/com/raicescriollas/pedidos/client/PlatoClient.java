package com.raicescriollas.pedidos.client;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;


@FeignClient(name = "raices-criollas-menu")
public interface PlatoClient {

	@GetMapping("/platos/{id}")
	MenuResponse obtenerPlato(@PathVariable("id") Long id);

	// Operaciones de stock, solo las acepta Menu con un token ROLE_SERVICE.
	@PutMapping("/platos/stock/reducir")
	void reducirStock(@RequestHeader("Authorization") String bearer, @RequestBody List<ItemStock> items);

	@PutMapping("/platos/stock/reponer")
	void reponerStock(@RequestHeader("Authorization") String bearer, @RequestBody List<ItemStock> items);

	record ItemStock(Long platoId, Integer cantidad) {
	}

	record MenuResponse(boolean success, String mensaje, PlatoData data) {
	}

	record PlatoData(Long id, String nombre, BigDecimal precio, Boolean disponible, String imagen) {
	}
}

