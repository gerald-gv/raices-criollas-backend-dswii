package com.raicescriollas.pedidos.repository;

import com.raicescriollas.pedidos.entity.Carrito;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;


public interface CarritoRepository extends JpaRepository<Carrito, Long> {
	
	@EntityGraph(attributePaths = "items")
	Optional<Carrito> findByClienteId(Long clienteId);
}
