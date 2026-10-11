package com.raicescriollas.pedidos.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "items_carrito", uniqueConstraints = @UniqueConstraint(columnNames = { "carrito_id", "plato_id" }))
public class ItemCarrito {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "carrito_id", nullable = false)
	private Carrito carrito;
	
	@Column(name = "plato_id", nullable = false)
	private Long platoId;
	
	@Column(nullable = false)
	private Integer cantidad;

	public Long getId() {
		return id;
	}

	public Carrito getCarrito() {
		return carrito;
	}

	public void setCarrito(Carrito carrito) {
		this.carrito = carrito;
	}

	public Long getPlatoId() {
		return platoId;
	}

	public void setPlatoId(Long platoId) {
		this.platoId = platoId;
	}

	public Integer getCantidad() {
		return cantidad;
	}

	public void setCantidad(Integer cantidad) {
		this.cantidad = cantidad;
	}
}
