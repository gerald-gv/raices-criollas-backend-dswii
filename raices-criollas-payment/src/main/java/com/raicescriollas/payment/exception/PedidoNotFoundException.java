package com.raicescriollas.payment.exception;

public class PedidoNotFoundException extends RuntimeException {
    public PedidoNotFoundException() {
        super("Pedido no encontrado");
    }
}
