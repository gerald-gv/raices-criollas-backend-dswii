package com.raicescriollas.payment.exception;

public class PagoNoReembolsableException extends RuntimeException {
    public PagoNoReembolsableException(String motivo) {
        super(motivo);
    }
}
