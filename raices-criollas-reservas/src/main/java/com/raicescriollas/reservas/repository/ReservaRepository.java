package com.raicescriollas.reservas.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.raicescriollas.reservas.entity.Reserva;
import com.raicescriollas.reservas.enums.EstadoReserva;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByClienteIdOrderByFechaInicioDesc(Long clienteId);

    Optional<Reserva> findByIdAndClienteId(Long id, Long clienteId);

    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.mesa.id = :mesaId " +
           "AND r.estado IN (:estadosBloqueantes) " +
           "AND r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio " +
           "AND (:reservaId IS NULL OR r.id != :reservaId)")
    boolean existsOverlappingReservations(
            @Param("mesaId") Long mesaId,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("estadosBloqueantes") Collection<EstadoReserva> estadosBloqueantes,
            @Param("reservaId") Long reservaId
    );

    @Query("SELECT r FROM Reserva r WHERE " +
           "(:mesaId IS NULL OR r.mesa.id = :mesaId) AND " +
           "(:estado IS NULL OR r.estado = :estado) AND " +
           "(:desde IS NULL OR r.fechaInicio >= :desde) AND " +
           "(:hasta IS NULL OR r.fechaInicio <= :hasta) " +
           "ORDER BY r.fechaInicio DESC")
    List<Reserva> findWithFilters(
            @Param("mesaId") Long mesaId,
            @Param("estado") EstadoReserva estado,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );
}
