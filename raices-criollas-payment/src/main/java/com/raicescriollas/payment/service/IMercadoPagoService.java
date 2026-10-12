package com.raicescriollas.payment.service;

import com.raicescriollas.payment.dto.PagoMP;
import com.raicescriollas.payment.dto.PreferenciaCreada;
import com.raicescriollas.payment.entity.Pago;

import java.util.Optional;

public interface IMercadoPagoService {
    PreferenciaCreada crearPreferencia(Pago pago);
    Optional<PagoMP> consultarPago(Long mpPaymentId);
}
