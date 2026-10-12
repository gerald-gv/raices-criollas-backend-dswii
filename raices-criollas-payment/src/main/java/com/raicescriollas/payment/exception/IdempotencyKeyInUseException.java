package com.raicescriollas.payment.exception;

public class IdempotencyKeyInUseException extends RuntimeException {
  public IdempotencyKeyInUseException() {
    super("La clave de idempotencia ya fue usada con otra solicitud");
  }
}
