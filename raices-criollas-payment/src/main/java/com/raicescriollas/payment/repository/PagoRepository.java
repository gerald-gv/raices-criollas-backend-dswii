package com.raicescriollas.payment.repository;

import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPedidoId(Long pedidoId);

    Optional<Pago> findByIdempotencyKey(String idempotencyKey);

    Optional<Pago> findByIdAndUsuarioId(Long id, Long usuarioId);

    List<Pago> findByPedidoIdAndUsuarioId(Long pedidoId, Long usuarioId);

    boolean existsByPedidoIdAndEstado(Long pedidoId, EstadoPago estado);
}
