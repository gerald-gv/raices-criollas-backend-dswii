package com.raicescriollas.reservas.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.raicescriollas.reservas.entity.Mesa;
import com.raicescriollas.reservas.enums.EstadoReserva;

import jakarta.persistence.LockModeType;

@Repository
public interface MesaRepository extends JpaRepository<Mesa, Long> {

    Optional<Mesa> findByNumeroMesa(String numeroMesa);

    boolean existsByNumeroMesa(String numeroMesa);

    boolean existsByNumeroMesaAndIdNot(String numeroMesa, Long id);

    List<Mesa> findByActivoTrue();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM Mesa m WHERE m.id = :id")
    Optional<Mesa> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT m FROM Mesa m WHERE m.activo = true AND m.capacidad >= :cantidadPersonas AND m.id NOT IN (" +
           "SELECT r.mesa.id FROM Reserva r " +
           "WHERE r.estado IN (:estadosBloqueantes) " +
           "AND r.fechaInicio < :fechaFin AND r.fechaFin > :fechaInicio)")
    List<Mesa> findMesasDisponibles(
            @Param("cantidadPersonas") Integer cantidadPersonas,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin,
            @Param("estadosBloqueantes") Collection<EstadoReserva> estadosBloqueantes
    );
}
