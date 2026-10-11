package com.raicescriollas.pedidos.service;

import com.raicescriollas.pedidos.client.PlatoClient;

import com.raicescriollas.pedidos.dto.*;
import com.raicescriollas.pedidos.entity.*;
import com.raicescriollas.pedidos.repository.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class PedidosService {
	
	private final CarritoRepository carritos;
	private final PedidoRepository pedidos;
	private final PlatoClient menu;

	public PedidosService(CarritoRepository carritos, PedidoRepository pedidos, PlatoClient menu) {
		this.carritos = carritos;
		this.pedidos = pedidos;
		this.menu = menu;
	}

	@Transactional(readOnly = true)
	public CarritoResponse verCarrito(Long clienteId) {
		validarCliente(clienteId);
		return carritos.findByClienteId(clienteId).map(this::mapCarrito)
				.orElse(new CarritoResponse(clienteId, List.of()));
	}

	@Transactional
	public CarritoResponse agregar(Long clienteId, AgregarItemRequest request) {
		validarCliente(clienteId);
		if (request.platoId() <= 0)
			throw new IllegalArgumentException("platoId debe ser positivo");
		consultarPlato(request.platoId());
		Carrito carrito = carritos.findByClienteId(clienteId).orElseGet(() -> {
			Carrito c = new Carrito();
			c.setClienteId(clienteId);
			return c;
		});
		ItemCarrito item = null;
		for (ItemCarrito actual : carrito.getItems())
			if (actual.getPlatoId().equals(request.platoId())) {
				item = actual;
				break;
			}
		if (item == null) {
			item = new ItemCarrito();
			item.setCarrito(carrito);
			item.setPlatoId(request.platoId());
			item.setCantidad(request.cantidad());
			carrito.getItems().add(item);
		} else
			item.setCantidad(Math.addExact(item.getCantidad(), request.cantidad()));
		return mapCarrito(carritos.save(carrito));
	}

	@Transactional
	public CarritoResponse eliminarItem(Long clienteId, Long platoId) {
		validarCliente(clienteId);
		Carrito carrito = carritos.findByClienteId(clienteId)
				.orElseThrow(() -> new NoSuchElementException("Carrito no encontrado"));
		boolean eliminado = carrito.getItems().removeIf(i -> i.getPlatoId().equals(platoId));
		if (!eliminado)
			throw new NoSuchElementException("Plato no encontrado en el carrito");
		return mapCarrito(carritos.save(carrito));
	}

	@Transactional
	public PedidoResponse confirmar(Long clienteId) {
		validarCliente(clienteId);
		Carrito carrito = carritos.findByClienteId(clienteId)
				.orElseThrow(() -> new IllegalArgumentException("Carrito vacio"));
		if (carrito.getItems().isEmpty())
			throw new IllegalArgumentException("Carrito vacio");
		Pedido pedido = new Pedido();
		pedido.setClienteId(clienteId);
		pedido.setEstado("REGISTRADO");
		pedido.setFecha(LocalDateTime.now());
		BigDecimal total = BigDecimal.ZERO;
		for (ItemCarrito item : carrito.getItems()) {
			PlatoClient.PlatoData plato = consultarPlato(item.getPlatoId());
			DetallePedido detalle = new DetallePedido();
			detalle.setPedido(pedido);
			detalle.setPlatoId(plato.id());
			detalle.setNombrePlato(plato.nombre());
			detalle.setCantidad(item.getCantidad());
			detalle.setPrecioUnitario(plato.precio());
			detalle.setSubtotal(plato.precio().multiply(BigDecimal.valueOf(item.getCantidad())));
			total = total.add(detalle.getSubtotal());
			pedido.getDetalles().add(detalle);
		}
		pedido.setTotal(total);
		Pedido guardado = pedidos.save(pedido);
		carritos.delete(carrito);
		return mapPedido(guardado);
	}

	@Transactional(readOnly = true)
	public PedidoResponse buscarPedido(Long id) {
		return mapPedido(pedidos.findById(id).orElseThrow(() -> new NoSuchElementException("Pedido no encontrado")));
	}

	@Transactional(readOnly = true)
	public List<PedidoResponse> listarPedidos(Long clienteId) {
		validarCliente(clienteId);
		List<PedidoResponse> resultado = new ArrayList<>();
		for (Pedido p : pedidos.findByClienteIdOrderByFechaDesc(clienteId))
			resultado.add(mapPedido(p));
		return resultado;
	}

	private PlatoClient.PlatoData consultarPlato(Long id) {
		PlatoClient.MenuResponse r = menu.obtenerPlato(id);
		if (r == null || !r.success() || r.data() == null || !Boolean.TRUE.equals(r.data().disponible())
				|| r.data().precio() == null || r.data().precio().signum() <= 0)
			throw new IllegalArgumentException("El plato no esta disponible");
		return r.data();
	}

	private void validarCliente(Long id) {
		if (id == null || id <= 0)
			throw new IllegalArgumentException("clienteId debe ser positivo");
	}

	private CarritoResponse mapCarrito(Carrito c) {
		List<ItemCarritoResponse> items = new ArrayList<>();
		for (ItemCarrito i : c.getItems())
			items.add(new ItemCarritoResponse(i.getPlatoId(), i.getCantidad()));
		return new CarritoResponse(c.getClienteId(), items);
	}

	private PedidoResponse mapPedido(Pedido p) {
		List<DetallePedidoResponse> detalles = new ArrayList<>();
		for (DetallePedido d : p.getDetalles())
			detalles.add(new DetallePedidoResponse(d.getPlatoId(), d.getNombrePlato(), d.getCantidad(),
					d.getPrecioUnitario(), d.getSubtotal()));
		return new PedidoResponse(p.getId(), p.getClienteId(), p.getFecha(), p.getEstado(), p.getTotal(), detalles);
	}
}
