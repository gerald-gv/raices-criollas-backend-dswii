package com.raicescriollas.menu.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.raicescriollas.menu.entity.Plato;
import com.raicescriollas.menu.repository.PlatoRepository;

@Service
public class PlatoService extends ICRUDimpl<Plato, Long> {

    private final PlatoRepository repo;

    public PlatoService(PlatoRepository repo) {
        this.repo = repo;
    }

    @Override
    public JpaRepository<Plato, Long> repo() {
        return repo;
    }

    // --- consultas cliente ---

    /**
     * Listado/busqueda de platos disponibles para el cliente.
     * Todos los parametros son opcionales (null = sin filtro).
     */
    public List<Plato> buscarDisponibles(String nombre, Long categoriaId,
                                         BigDecimal precioMin, BigDecimal precioMax) {
        return repo.buscarDisponibles(nombre, categoriaId, precioMin, precioMax);
    }

    public Plato buscarDisponible(Long id) {
        return repo.findByIdAndDisponibleTrue(id).orElse(null);
    }

    // --- consultas admin ---

    public List<Plato> listarPorCategoria(Long categoriaId) {
        return repo.findByCategoria_Id(categoriaId);
    }

    public void activar(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDisponible(true);
        actualizar(plato);
    }

    public void desactivar(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDisponible(false);
        actualizar(plato);
    }
}