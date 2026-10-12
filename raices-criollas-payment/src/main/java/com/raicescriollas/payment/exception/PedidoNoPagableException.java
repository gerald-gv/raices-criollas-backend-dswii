package com.raicescriollas.payment.exception;

public class PedidoNoPagableException extends RuntimeException {
  public PedidoNoPagableException(String motivo) {
    super(motivo);
  }
}