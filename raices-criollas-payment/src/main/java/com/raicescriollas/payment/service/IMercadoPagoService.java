package com.raicescriollas.payment.service;

import com.raicescriollas.payment.dto.PagoMP;
import com.raicescriollas.payment.dto.PreferenciaCreada;
import com.raicescriollas.payment.dto.ReembolsoMP;
import com.raicescriollas.payment.entity.Pago;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface IMercadoPagoService {
    PreferenciaCreada crearPreferencia(Pago pago, OffsetDateTime venceEn);
    Optional<PagoMP> consultarPago(Long mpPaymentId);
    List<Long> buscarIdsDePagos(String externalReference);
    ReembolsoMP reembolsar(Long mpPaymentId, BigDecimal monto, String idempotencyKey);
}
