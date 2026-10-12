package com.raicescriollas.pedidos.service;

import com.raicescriollas.pedidos.client.PlatoClient;

import com.raicescriollas.pedidos.dto.*;
import com.raicescriollas.pedidos.entity.*;
import com.raicescriollas.pedidos.enums.EstadoPedido;
import com.raicescriollas.pedidos.repository.*;

import feign.FeignException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class PedidosService {

	private static final int MAX_CANTIDAD = 99;
	private static final int MAX_PAGE_SIZE = 50;

	private final CarritoRepository carritos;
	private final PedidoRepository pedidos;
	private final PlatoClient menu;
	private final StockService stock;

	public PedidosService(CarritoRepository carritos, PedidoRepository pedidos, PlatoClient menu, StockService stock) {
		this.carritos = carritos;
		this.pedidos = pedidos;
		this.menu = menu;
		this.stock = stock;
	}

	// Carrito 

	@Transactional(readOnly = true)
	public CarritoResponse verCarrito(Long clienteId) {
		validarCliente(clienteId);
		return carritos.findByClienteId(clienteId).map(this::mapCarrito)
				.orElse(new CarritoResponse(clienteId, List.of(), BigDecimal.ZERO));
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
		} else {
			int suma = Math.addExact(item.getCantidad(), request.cantidad());
			if (suma > MAX_CANTIDAD)
				throw new IllegalArgumentException("Maximo " + MAX_CANTIDAD + " unidades por plato");
			item.setCantidad(suma);
		}
		tocar(carrito);
		return mapCarrito(carritos.save(carrito));
	}

	// Sincroniza el carrito con lo que el cliente dejo en pantalla
	@Transactional
	public CarritoResponse reemplazarCarrito(Long clienteId, List<AgregarItemRequest> nuevos) {
		validarCliente(clienteId);

		Map<Long, Integer> cantidades = new LinkedHashMap<>();
		for (AgregarItemRequest i : nuevos) {
			if (i.platoId() <= 0)
				throw new IllegalArgumentException("platoId debe ser positivo");
			if (cantidades.merge(i.platoId(), i.cantidad(), Integer::sum) > MAX_CANTIDAD)
				throw new IllegalArgumentException("Maximo " + MAX_CANTIDAD + " unidades por plato");
		}

		if (cantidades.isEmpty())
			return vaciar(clienteId);

		Carrito carrito = carritos.findByClienteId(clienteId).orElseGet(() -> {
			Carrito c = new Carrito();
			c.setClienteId(clienteId);
			return c;
		});

		carrito.getItems().removeIf(i -> !cantidades.containsKey(i.getPlatoId()));
		for (ItemCarrito actual : carrito.getItems())
			actual.setCantidad(cantidades.remove(actual.getPlatoId()));
		cantidades.forEach((platoId, cantidad) -> {
			ItemCarrito item = new ItemCarrito();
			item.setCarrito(carrito);
			item.setPlatoId(platoId);
			item.setCantidad(cantidad);
			carrito.getItems().add(item);
		});

		tocar(carrito);
		return mapCarrito(carritos.save(carrito));
	}

	// Fija la cantidad exacta de un plato
	@Transactional
	public CarritoResponse actualizarCantidad(Long clienteId, Long platoId, int cantidad) {
		validarCliente(clienteId);
		Carrito carrito = carritos.findByClienteId(clienteId)
				.orElseThrow(() -> new NoSuchElementException("Carrito no encontrado"));
		ItemCarrito item = carrito.getItems().stream().filter(i -> i.getPlatoId().equals(platoId)).findFirst()
				.orElseThrow(() -> new NoSuchElementException("Plato no encontrado en el carrito"));
		item.setCantidad(cantidad);
		tocar(carrito);
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
		tocar(carrito);
		return mapCarrito(carritos.save(carrito));
	}

	@Transactional
	public CarritoResponse vaciar(Long clienteId) {
		validarCliente(clienteId);
		carritos.findByClienteId(clienteId).ifPresent(carritos::delete);
		return new CarritoResponse(clienteId, List.of(), BigDecimal.ZERO);
	}

	// ---------- Continuar compra ----------

	// Crea el pedido PENDIENTE_PAGO con los precios de hoy. No toca el stock
	@Transactional
	public PedidoResponse confirmar(Long clienteId) {
		validarCliente(clienteId);
		Carrito carrito = carritos.findByClienteId(clienteId)
				.orElseThrow(() -> new IllegalArgumentException("Carrito vacio"));
		if (carrito.getItems().isEmpty())
			throw new IllegalArgumentException("Carrito vacio");

		// Un solo pedido pendiente por cliente: si vuelve a continuar, el anterior se reemplaza
		for (Pedido previo : pedidos.findByClienteIdAndEstado(clienteId, EstadoPedido.PENDIENTE_PAGO.name()))
			previo.setEstado(EstadoPedido.CANCELADO.name());

		Pedido pedido = new Pedido();
		pedido.setClienteId(clienteId);
		pedido.setEstado(EstadoPedido.PENDIENTE_PAGO.name());
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
		return mapPedido(pedidos.save(pedido));
	}

	// Pedidos del cliente 

	// Un pedido ajeno responde igual que uno inexistente (404)
	@Transactional(readOnly = true)
	public PedidoResponse buscarPedido(Long id, Long clienteId, boolean admin) {
		return mapPedido(buscarVisible(id, clienteId, admin));
	}

	@Transactional(readOnly = true)
	public List<PedidoResponse> listarPedidos(Long clienteId) {
		validarCliente(clienteId);
		List<PedidoResponse> resultado = new ArrayList<>();
		for (Pedido p : pedidos.findByClienteIdOrderByFechaDesc(clienteId))
			resultado.add(mapPedido(p));
		return resultado;
	}

	@Transactional
	public PedidoResponse cancelarMiPedido(Long id, Long clienteId) {
		Pedido pedido = buscarVisible(id, clienteId, false);
		if (estadoDe(pedido) != EstadoPedido.PENDIENTE_PAGO)
			throw new IllegalStateException("Solo se puede cancelar un pedido que aun no se ha pagado");
		pedido.setEstado(EstadoPedido.CANCELADO.name());
		return mapPedido(pedidos.save(pedido));
	}

	// Panel administrativo

	@Transactional(readOnly = true)
	public PaginaResponse<PedidoResponse> listarTodos(String estado, int page, int size) {
		EstadoPedido filtro = null;
		if (estado != null && !estado.isBlank()) {
			try {
				filtro = EstadoPedido.valueOf(estado.trim().toUpperCase());
			} catch (IllegalArgumentException e) {
				throw new IllegalArgumentException("Estado no valido: " + estado);
			}
		}
		Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), MAX_PAGE_SIZE),
				Sort.by(Sort.Direction.DESC, "fecha", "id"));
		Page<Pedido> resultado = filtro == null ? pedidos.findAll(pageable)
				: pedidos.findByEstado(filtro.name(), pageable);
		List<PedidoResponse> contenido = new ArrayList<>();
		for (Pedido p : resultado.getContent())
			contenido.add(mapPedido(p));
		return new PaginaResponse<>(contenido, resultado.getTotalElements(), resultado.getTotalPages(),
				resultado.getNumber(), resultado.getSize());
	}

	@Transactional
	public PedidoResponse cambiarEstado(Long id, EstadoPedido nuevo) {
		Pedido pedido = pedidos.findById(id).orElseThrow(() -> new NoSuchElementException("Pedido no encontrado"));
		EstadoPedido actual = estadoDe(pedido);

		// PAGADO lo pondra el microservicio de pagos (ahi se descuenta el stock)
		if (nuevo == EstadoPedido.PAGADO)
			throw new IllegalStateException("El pago lo confirma el sistema de pagos; no se puede marcar manualmente");
		if (!actual.puedePasarA(nuevo))
			throw new IllegalStateException("No se puede pasar de " + actual + " a " + nuevo);

		pedido.setEstado(nuevo.name());
		Pedido guardado = pedidos.save(pedido);

		// El stock se descuenta al pagar, solo se devuelve si el pedido ya estaba pagado
		if (nuevo == EstadoPedido.CANCELADO && actual != EstadoPedido.PENDIENTE_PAGO)
			stock.devolver(itemsDe(guardado));
		return mapPedido(guardado);
	}

	// Lo llama el microservicio de pagos cuando Mercado Pago aprueba el cobro
	@Transactional
	public PedidoResponse marcarPagado(Long id) {
		Pedido pedido = pedidos.findByIdParaActualizar(id)
				.orElseThrow(() -> new NoSuchElementException("Pedido no encontrado"));
		EstadoPedido actual = estadoDe(pedido);

		if (actual == EstadoPedido.CANCELADO)
			throw new IllegalStateException("El pedido fue cancelado");

		// Aviso repetido (Mercado Pago reintenta): el pedido ya estaba pagado, no se descuenta dos veces
		if (actual != EstadoPedido.PENDIENTE_PAGO)
			return mapPedido(pedido);

		// Si no alcanza el stock lanza IllegalStateException (409) y el pedido queda como estaba
		stock.descontar(itemsDe(pedido));
		pedido.setEstado(EstadoPedido.PAGADO.name());
		return mapPedido(pedidos.save(pedido));
	}

	// Expiracion

	// Pedidos que nadie pago, se cancelan
	@Transactional
	public int expirarPedidosPendientes(LocalDateTime limite) {
		List<Pedido> vencidos = pedidos.findByEstadoAndFechaBefore(EstadoPedido.PENDIENTE_PAGO.name(), limite);
		for (Pedido p : vencidos)
			p.setEstado(EstadoPedido.CANCELADO.name());
		return vencidos.size();
	}

	// Carritos que el cliente abandono
	@Transactional
	public int expirarCarritos(LocalDateTime limite) {
		List<Carrito> abandonados = carritos.findByActualizadoEnBefore(limite);
		carritos.deleteAll(abandonados);
		return abandonados.size();
	}

	// Utilidades 

	private Pedido buscarVisible(Long id, Long clienteId, boolean admin) {
		return pedidos.findById(id).filter(p -> admin || p.getClienteId().equals(clienteId))
				.orElseThrow(() -> new NoSuchElementException("Pedido no encontrado"));
	}

	private EstadoPedido estadoDe(Pedido pedido) {
		return EstadoPedido.valueOf(pedido.getEstado());
	}

	private void tocar(Carrito carrito) {
		carrito.setActualizadoEn(LocalDateTime.now());
	}

	private List<PlatoClient.ItemStock> itemsDe(Pedido pedido) {
		List<PlatoClient.ItemStock> items = new ArrayList<>();
		for (DetallePedido d : pedido.getDetalles())
			items.add(new PlatoClient.ItemStock(d.getPlatoId(), d.getCantidad()));
		return items;
	}

	// para agregar y continuar la compra, el plato debe existir y estar disponible
	private PlatoClient.PlatoData consultarPlato(Long id) {
		PlatoClient.MenuResponse r = menu.obtenerPlato(id);
		if (r == null || !r.success() || r.data() == null)
			throw new IllegalArgumentException("El plato no esta disponible");
		PlatoClient.PlatoData plato = r.data();
		if (!Boolean.TRUE.equals(plato.disponible()) || plato.precio() == null || plato.precio().signum() <= 0)
			throw new IllegalArgumentException("El plato \"" + plato.nombre() + "\" no esta disponible");
		return plato;
	}

	// para VER el carrito, un plato retirado o un fallo de Menu no debe romper todo el carrito
	private Optional<PlatoClient.PlatoData> buscarPlato(Long id) {
		try {
			PlatoClient.MenuResponse r = menu.obtenerPlato(id);
			return r != null && r.success() ? Optional.ofNullable(r.data()) : Optional.empty();
		} catch (FeignException e) {
			return Optional.empty();
		}
	}

	private void validarCliente(Long id) {
		if (id == null || id <= 0)
			throw new IllegalArgumentException("clienteId debe ser positivo");
	}

	private CarritoResponse mapCarrito(Carrito c) {
		List<ItemCarritoResponse> items = new ArrayList<>();
		BigDecimal total = BigDecimal.ZERO;
		for (ItemCarrito i : c.getItems()) {
			Optional<PlatoClient.PlatoData> plato = buscarPlato(i.getPlatoId());
			BigDecimal precio = plato.map(PlatoClient.PlatoData::precio).orElse(null);
			boolean disponible = plato.isPresent() && Boolean.TRUE.equals(plato.get().disponible()) && precio != null
					&& precio.signum() > 0;
			BigDecimal subtotal = precio == null ? null : precio.multiply(BigDecimal.valueOf(i.getCantidad()));
			if (disponible)
				total = total.add(subtotal);
			items.add(new ItemCarritoResponse(i.getPlatoId(), i.getCantidad(),
					plato.map(PlatoClient.PlatoData::nombre).orElse(null),
					plato.map(PlatoClient.PlatoData::imagen).orElse(null), precio, subtotal, disponible));
		}
		return new CarritoResponse(c.getClienteId(), items, total);
	}

	private PedidoResponse mapPedido(Pedido p) {
		List<DetallePedidoResponse> detalles = new ArrayList<>();
		for (DetallePedido d : p.getDetalles())
			detalles.add(new DetallePedidoResponse(d.getPlatoId(), d.getNombrePlato(), d.getCantidad(),
					d.getPrecioUnitario(), d.getSubtotal()));
		return new PedidoResponse(p.getId(), p.getClienteId(), p.getFecha(), p.getEstado(), p.getTotal(), detalles);
	}
}
