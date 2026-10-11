package com.raicescriollas.pedidos.controller;

import com.raicescriollas.pedidos.dto.*;

import com.raicescriollas.pedidos.service.PedidosService;
import com.raicescriollas.pedidos.utils.SecurityUtils;

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

	// Carrito

	@GetMapping("/carrito")
	public ResponseEntity<ApiResponse<CarritoResponse>> verCarrito() {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Carrito consultado", service.verCarrito(SecurityUtils.getCurrentUserId())));
	}

	@PostMapping("/carrito/items")
	public ResponseEntity<ApiResponse<CarritoResponse>> agregar(@Valid @RequestBody AgregarItemRequest r) {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Plato agregado", service.agregar(SecurityUtils.getCurrentUserId(), r)));
	}

	@PutMapping("/carrito/items/{platoId}")
	public ResponseEntity<ApiResponse<CarritoResponse>> actualizarCantidad(@PathVariable Long platoId,
			@Valid @RequestBody ActualizarCantidadRequest r) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Cantidad actualizada",
				service.actualizarCantidad(SecurityUtils.getCurrentUserId(), platoId, r.cantidad())));
	}

	@DeleteMapping("/carrito/items/{platoId}")
	public ResponseEntity<ApiResponse<CarritoResponse>> quitar(@PathVariable Long platoId) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Plato retirado",
				service.eliminarItem(SecurityUtils.getCurrentUserId(), platoId)));
	}

	@DeleteMapping("/carrito")
	public ResponseEntity<ApiResponse<CarritoResponse>> vaciar() {
		return ResponseEntity
				.ok(new ApiResponse<>(true, "Carrito vaciado", service.vaciar(SecurityUtils.getCurrentUserId())));
	}

	@PostMapping("/carrito/confirmar")
	public ResponseEntity<ApiResponse<PedidoResponse>> confirmar() {
		return ResponseEntity.status(HttpStatus.CREATED).body(
				new ApiResponse<>(true, "Pedido registrado", service.confirmar(SecurityUtils.getCurrentUserId())));
	}

	// Pedidos lado del cliente

	@GetMapping("/mis-pedidos")
	public ResponseEntity<ApiResponse<List<PedidoResponse>>> misPedidos() {
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedidos encontrados",
				service.listarPedidos(SecurityUtils.getCurrentUserId())));
	}

	// Un cliente solo ve los suyos; un admin puede ver cualquiera
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<PedidoResponse>> consultar(@PathVariable Long id) {
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedido encontrado",
				service.buscarPedido(id, SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin())));
	}

	@PatchMapping("/{id}/cancelar")
	public ResponseEntity<ApiResponse<PedidoResponse>> cancelar(@PathVariable Long id) {
		
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedido cancelado", service.cancelarMiPedido(id, SecurityUtils.getCurrentUserId())));
	}

	// ADMIN

	@GetMapping("/admin")
	public ResponseEntity<ApiResponse<PaginaResponse<PedidoResponse>>> listarTodos(
			@RequestParam(required = false) String estado, @RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "10") int size) {
		
		return ResponseEntity.ok(new ApiResponse<>(true, "Pedidos encontrados", service.listarTodos(estado, page, size)));
	}

	@PatchMapping("/admin/{id}/estado")
	public ResponseEntity<ApiResponse<PedidoResponse>> cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest r) {
		
		return ResponseEntity.ok(new ApiResponse<>(true, "Estado actualizado", service.cambiarEstado(id, r.estado())));
	}
}

