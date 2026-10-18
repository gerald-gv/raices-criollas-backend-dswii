package com.raicescriollas.payment.exception;

public class ReservaNotFoundException extends RuntimeException {
    public ReservaNotFoundException() {
        super("Reserva no encontrada");
    }
}
