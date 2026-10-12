package com.raicescriollas.pedidos.service;

import java.util.List;
import java.util.function.Consumer;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.raicescriollas.pedidos.client.PlatoClient;
import com.raicescriollas.pedidos.client.PlatoClient.ItemStock;

import feign.FeignException;

//Reserva y devuelve stock en Menu con el token de servicio.
@Service
public class StockService {

	private static final String SIN_STOCK = "No hay stock suficiente para completar el pedido.";

	private final PlatoClient menu;
	private final ServiceTokenProvider tokens;
	private final ObjectMapper mapper;

	public StockService(PlatoClient menu, ServiceTokenProvider tokens, ObjectMapper mapper) {
		this.menu = menu;
		this.tokens = tokens;
		this.mapper = mapper;
	}

	// Descuenta el stock (lo usara el flujo de pago cuando exista). Si algun plato no alcanza, Menu no descuenta ninguno y se lanza IllegalStateException (409)
	public void descontar(List<ItemStock> items) {
		ejecutar(bearer -> menu.reducirStock(bearer, items));
	}

	// Devuelve el stock (pedido pagado que se cancela, o error posterior al descuento)
	public void devolver(List<ItemStock> items) {
		ejecutar(bearer -> menu.reponerStock(bearer, items));
	}

	// Si Menu responde 401 el token vencio, se pide uno nuevo y se reintenta una sola vez
	private void ejecutar(Consumer<String> llamada) {
		try {
			enviar(llamada);
		} catch (FeignException.Unauthorized e) {
			tokens.invalidar();
			enviar(llamada);
		}
	}

	private void enviar(Consumer<String> llamada) {
		try {
			llamada.accept(tokens.bearer());
		} catch (FeignException.Conflict e) {
			throw new IllegalStateException(mensajeDe(e));
		}
	}

	// Menu explica el conflicto ("Stock insuficiente de «X»") sin revelar cantidades
	private String mensajeDe(FeignException e) {
		try {
			JsonNode mensaje = mapper.readTree(e.contentUTF8()).path("mensaje");
			return mensaje.isTextual() && !mensaje.asText().isBlank() ? mensaje.asText() : SIN_STOCK;
		} catch (Exception ignorada) {
			return SIN_STOCK;
		}
	}
}
