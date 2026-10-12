package com.raicescriollas.payment.exception;

public class PagoNotFoundException extends RuntimeException{
    public PagoNotFoundException() { super("Pago no encontrado"); }
}
