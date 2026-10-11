package com.raicescriollas.pedidos.repository;

import com.raicescriollas.pedidos.entity.Pedido;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface PedidoRepository extends JpaRepository<Pedido, Long> {
	
	List<Pedido> findByClienteIdOrderByFechaDesc(Long clienteId);

	// Panel administrativo (findAll(Pageable) ya viene de JpaRepository)
	Page<Pedido> findByEstado(String estado, Pageable pageable);
}
