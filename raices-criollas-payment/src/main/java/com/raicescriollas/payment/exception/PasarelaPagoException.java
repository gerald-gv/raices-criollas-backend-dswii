package com.raicescriollas.payment.exception;

public class PasarelaPagoException extends RuntimeException {
    public PasarelaPagoException() {
        super("No se pudo iniciar el cobro con Mercado Pago. Intenta nuevamente");
    }

    public PasarelaPagoException(String mensaje) {
        super(mensaje);
    }
}