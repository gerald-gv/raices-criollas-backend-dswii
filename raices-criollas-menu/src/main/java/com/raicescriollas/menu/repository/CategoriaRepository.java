package com.raicescriollas.menu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.raicescriollas.menu.entity.Categoria;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByActivoTrue();
    Optional<Categoria> findByIdAndActivoTrue(Long id);
}