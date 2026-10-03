package com.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.menu.entity.Plato;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface PlatoRepository extends JpaRepository<Plato, Long> {

    // --- consultas admin (sin restriccion de activo en categoria) ---
    List<Plato> findByCategoria_Id(Long categoriaId);

    boolean existsByCategoria_Id(Long categoriaId);

    // --- consultas cliente (disponibles, categoria activa) ---

    /**
     * Busqueda combinada para el cliente. Cada parametro es opcional:
     * si se pasa null se ignora ese filtro.
     * Siempre filtra plato disponible y categoria activa.
     */
    @Query("""
            SELECT p FROM Plato p
            JOIN p.categoria c
            WHERE p.disponible = true
              AND c.activo = true
              AND (:nombre      IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
              AND (:categoriaId IS NULL OR c.id = :categoriaId)
              AND (:precioMin   IS NULL OR p.precio >= :precioMin)
              AND (:precioMax   IS NULL OR p.precio <= :precioMax)
            ORDER BY p.nombre ASC
            """)
    List<Plato> buscarDisponibles(
            @Param("nombre")      String nombre,
            @Param("categoriaId") Long categoriaId,
            @Param("precioMin")   BigDecimal precioMin,
            @Param("precioMax")   BigDecimal precioMax
    );

    Optional<Plato> findByIdAndDisponibleTrue(Long id);
}