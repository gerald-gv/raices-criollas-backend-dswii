package com.raicescriollas.payment.repository;

import com.raicescriollas.payment.entity.TransaccionPago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransaccionPagoRepository extends JpaRepository<TransaccionPago, Long> {
    List<TransaccionPago> findByPagoIdOrderByCreadoEnAsc(Long pagoId);
    boolean existsByPagoIdAndMpPaymentIdAndEstadoMp(Long pagoId, String mpPaymentId, String estadoMp);
}
