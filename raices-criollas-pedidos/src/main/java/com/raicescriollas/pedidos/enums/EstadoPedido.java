package com.raicescriollas.pedidos.enums;

public enum EstadoPedido {
	REGISTRADO, PREPARANDO, LISTO, ENTREGADO, CANCELADO;

	public boolean puedePasarA(EstadoPedido destino) {
		return switch (this) {
		case REGISTRADO -> destino == PREPARANDO || destino == CANCELADO;
		case PREPARANDO -> destino == LISTO || destino == CANCELADO;
		case LISTO -> destino == ENTREGADO;
		case ENTREGADO, CANCELADO -> false;
		};
	}
}
