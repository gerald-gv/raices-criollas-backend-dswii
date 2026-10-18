package com.raicescriollas.payment.repository;

import com.raicescriollas.payment.entity.EstadoPago;
import com.raicescriollas.payment.entity.Pago;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByPedidoId(Long pedidoId);

    Optional<Pago> findByIdempotencyKey(String idempotencyKey);

    Optional<Pago> findByIdAndUsuarioId(Long id, Long usuarioId);

    List<Pago> findByPedidoIdAndUsuarioId(Long pedidoId, Long usuarioId);

    boolean existsByPedidoIdAndEstado(Long pedidoId, EstadoPago estado);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pago p where p.referenciaExterna = :ref")
    Optional<Pago> findByReferenciaExternaParaActualizar(@Param("ref") String ref);

    List<Pago> findByEstadoInAndCreadoEnAfter(Collection<EstadoPago> estados, Instant desde);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Pago p where p.id = :id")
    Optional<Pago> findByIdParaActualizar(@Param("id") Long id);

    List<Pago> findByEstadoAndVenceEnBefore(EstadoPago estado, Instant limite);

    Optional<Pago> findFirstByPedidoIdAndUsuarioIdAndEstadoOrderByCreadoEnDesc(
            Long pedidoId, Long usuarioId, EstadoPago estado);

    List<Pago> findByReservaIdAndUsuarioId(Long reservaId, Long usuarioId);

    boolean existsByReservaIdAndEstado(Long reservaId, EstadoPago estado);

    Optional<Pago> findFirstByReservaIdAndUsuarioIdAndEstadoOrderByCreadoEnDesc(
            Long reservaId, Long usuarioId, EstadoPago estado);
}
