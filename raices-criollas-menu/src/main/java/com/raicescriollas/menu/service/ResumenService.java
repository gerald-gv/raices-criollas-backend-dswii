package com.raicescriollas.menu.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.menu.dto.ResumenCategoriaDTO;
import com.raicescriollas.menu.dto.ResumenMenuDTO;
import com.raicescriollas.menu.repository.CategoriaRepository;

@Service
public class ResumenService {

    private final CategoriaRepository categoriaRepo;

    public ResumenService(CategoriaRepository categoriaRepo) {
        this.categoriaRepo = categoriaRepo;
    }

    @Transactional(readOnly = true)
    public ResumenMenuDTO obtenerResumen() {
        List<ResumenCategoriaDTO> filas = categoriaRepo.resumenPorCategoria().stream()
                .map(f -> new ResumenCategoriaDTO(
                        f.getCategoriaId(), f.getActivo(), f.getTotal(), f.getDisponibles()))
                .toList();

        long totalPlatos = 0, disponibles = 0, categoriasActivas = 0, ocultosPorCategoria = 0;

        for (ResumenCategoriaDTO fila : filas) {
            totalPlatos += fila.total();
            disponibles += fila.disponibles();

            if (Boolean.TRUE.equals(fila.activo())) {
                categoriasActivas++;
            } else {
                ocultosPorCategoria += fila.disponibles();
            }
        }

        return new ResumenMenuDTO(
                totalPlatos,
                disponibles,
                totalPlatos - disponibles,
                (long) filas.size(),
                categoriasActivas,
                ocultosPorCategoria,
                filas);
    }
}