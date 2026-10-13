package com.raicescriollas.pedidos.client;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

/**
 * Cliente Feign para menu-service.
 * Solo se usa para consultar datos de platos (precio, disponibilidad)
 * al agregar al carrito y al confirmar el pedido.
 *
 * El descuento y reposición de stock ya no se hacen vía REST:
 * se delegan a RabbitMQ mediante eventos asíncronos.
 */
@FeignClient(name = "raices-criollas-menu")
public interface PlatoClient {

	@GetMapping("/platos/{id}")
	MenuResponse obtenerPlato(@PathVariable("id") Long id);
	
	// Solo lectura, revisa si alcanza el stock sin descontar nada. Se llama con el JWT del cliente.
	// Menu responde 409 con el motivo si algun plato no alcanza.
	@PutMapping("/platos/stock/verificar")
	void verificarStock(@RequestHeader("Authorization") String bearer, @RequestBody List<ItemStock> items);

	record ItemStock(Long platoId, Integer cantidad) {}

	record MenuResponse(boolean success, String mensaje, PlatoData data) {}

	record PlatoData(Long id, String nombre, BigDecimal precio, Boolean disponible, String imagen) {}
}

