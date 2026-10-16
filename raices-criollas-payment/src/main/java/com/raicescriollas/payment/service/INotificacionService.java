package com.raicescriollas.payment.service;

import jakarta.transaction.Transactional;

public interface INotificacionService {
    void procesarPago(String mpPaymentId);

    void sincronizar(Long pagoId);
}
