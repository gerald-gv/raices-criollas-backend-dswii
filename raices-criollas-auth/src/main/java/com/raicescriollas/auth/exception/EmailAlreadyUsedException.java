package com.raicescriollas.auth.exception;

public class EmailAlreadyUsedException extends RuntimeException {
    public EmailAlreadyUsedException() { super("El email ya está registrado"); }
}
