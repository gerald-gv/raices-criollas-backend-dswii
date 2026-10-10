package com.raicescriollas.auth.exception;

public class CampoInvalidoException extends RuntimeException {
    private final String campo;
    public CampoInvalidoException(String campo, String mensaje) { super(mensaje); this.campo = campo; }
    public String getCampo() { return campo; }
}