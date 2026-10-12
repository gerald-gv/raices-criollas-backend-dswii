package com.raicescriollas.payment.exception;

public class ServicioNoDisponibleException extends RuntimeException {
    public ServicioNoDisponibleException() {
        super("No se pudo consultar el pedido. Intenta nuevamente");
    }
}
