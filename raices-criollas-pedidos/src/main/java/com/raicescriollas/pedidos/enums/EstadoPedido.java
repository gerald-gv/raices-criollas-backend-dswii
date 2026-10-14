package com.raicescriollas.pedidos.enums;

public enum EstadoPedido {
	PENDIENTE_PAGO, PAGADO, PREPARANDO, LISTO, ENVIANDO, ENTREGADO, CANCELADO;

	public boolean puedePasarA(EstadoPedido destino) {
		return switch (this) {
		case PENDIENTE_PAGO -> destino == PAGADO || destino == CANCELADO;
		case PAGADO -> destino == PREPARANDO;
		case PREPARANDO -> destino == LISTO;
		case LISTO -> destino == ENVIANDO;
		case ENVIANDO -> destino == ENTREGADO;
		case ENTREGADO, CANCELADO -> false;
		};
	}
}
