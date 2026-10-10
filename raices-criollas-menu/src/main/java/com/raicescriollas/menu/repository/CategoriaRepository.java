package com.raicescriollas.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.raicescriollas.menu.entity.Categoria;
import com.raicescriollas.menu.repository.projection.ResumenCategoriaProjection;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
	
	
	@Query("""
	        SELECT c.id AS categoriaId,
	               c.activo AS activo,
	               COUNT(p.id) AS total,
	               SUM(CASE WHEN p.disponible = true THEN 1L ELSE 0L END) AS disponibles
	        FROM Categoria c
	        LEFT JOIN Plato p ON p.categoria = c
	        GROUP BY c.id, c.activo
	        ORDER BY c.id
	        """)
	List<ResumenCategoriaProjection> resumenPorCategoria();
	
    List<Categoria> findByActivoTrue();
    Optional<Categoria> findByIdAndActivoTrue(Long id);
}