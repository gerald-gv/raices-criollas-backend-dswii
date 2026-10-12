package com.raicescriollas.pedidos.enums;

public enum EstadoPedido {
	PENDIENTE_PAGO, PAGADO, PREPARANDO, LISTO, ENTREGADO, CANCELADO;

	public boolean puedePasarA(EstadoPedido destino) {
		return switch (this) {
		case PENDIENTE_PAGO -> destino == PAGADO || destino == CANCELADO;
		case PAGADO -> destino == PREPARANDO || destino == CANCELADO;
		case PREPARANDO -> destino == LISTO || destino == CANCELADO;
		case LISTO -> destino == ENTREGADO;
		case ENTREGADO, CANCELADO -> false;
		};
	}
}
