package com.raicescriollas.pedidos.repository;

import com.raicescriollas.pedidos.entity.Pedido;


import feign.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


public interface PedidoRepository extends JpaRepository<Pedido, Long> {
	
	List<Pedido> findByClienteIdOrderByFechaDesc(Long clienteId);

	// Panel administrativo (findAll(Pageable) ya viene de JpaRepository)
	Page<Pedido> findByEstado(String estado, Pageable pageable);

	List<Pedido> findByClienteIdAndEstado(Long clienteId, String estado);

	List<Pedido> findByEstadoAndFechaBefore(String estado, LocalDateTime limite);


	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select p from Pedido p where p.id = :id")
	Optional<Pedido> findByIdParaActualizar(@Param("id") Long id);
}

