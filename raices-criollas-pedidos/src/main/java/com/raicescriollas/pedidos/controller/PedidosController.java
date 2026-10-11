package com.raicescriollas.pedidos.controller;

import com.raicescriollas.pedidos.dto.*;

import com.raicescriollas.pedidos.service.PedidosService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/pedidos")
public class PedidosController {
	
	private final PedidosService service;

	public PedidosController(PedidosService service) {
		this.service = service;
	}

	@GetMapping("/carrito/{clienteId}")
	public ResponseEntity<ApiResponse<CarritoResponse>> verCarrito(@PathVariable Long clienteId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Carrito consultado", service.verCarrito(clienteId)));
	}

	@PostMapping("/carrito/{clienteId}/items")
	public ResponseEntity<ApiResponse<CarritoResponse>> agregar(@PathVariable Long clienteId,
			@Valid @RequestBody AgregarItemRequest r) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Plato agregado", service.agregar(clienteId, r)));
	}

	@DeleteMapping("/carrito/{clienteId}/items/{platoId}")
	public ResponseEntity<ApiResponse<CarritoResponse>> quitar(@PathVariable Long clienteId,
			@PathVariable Long platoId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Plato retirado", service.eliminarItem(clienteId, platoId)));
	}

	@PostMapping("/carrito/{clienteId}/confirmar")
	public ResponseEntity<ApiResponse<PedidoResponse>> confirmar(@PathVariable Long clienteId) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(new ApiResponse<>(true, "Pedido registrado", service.confirmar(clienteId)));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PedidoResponse>> consultar(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedido encontrado", service.buscarPedido(id)));
	}

	@GetMapping("/cliente/{clienteId}")
	public ResponseEntity<ApiResponse<List<PedidoResponse>>> listar(@PathVariable Long clienteId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedidos encontrados", service.listarPedidos(clienteId)));
	}
}
