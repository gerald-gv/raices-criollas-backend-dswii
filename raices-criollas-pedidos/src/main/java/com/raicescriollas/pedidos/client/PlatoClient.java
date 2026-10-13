package com.raicescriollas.pedidos.client;

import java.math.BigDecimal;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

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

	record MenuResponse(boolean success, String mensaje, PlatoData data) {}

	record PlatoData(Long id, String nombre, BigDecimal precio, Boolean disponible, String imagen) {}
}

