package com.raicescriollas.menu.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.raicescriollas.menu.entity.Categoria;
import com.raicescriollas.menu.entity.Plato;
import com.raicescriollas.menu.repository.CategoriaRepository;
import com.raicescriollas.menu.repository.PlatoRepository;
import com.raicescriollas.menu.utils.ModeloNotFoundException;

@Service
public class PlatoService extends ICRUDimpl<Plato, Long> {

    private final PlatoRepository repo;
    private final CategoriaRepository categoriaRepo;

    public PlatoService(PlatoRepository repo, CategoriaRepository categoriaRepo) {
        this.repo = repo;
        this.categoriaRepo = categoriaRepo;
    }

    @Override
    public JpaRepository<Plato, Long> repo() {
        return repo;
    }

    // --- paginacion admin ---
    public Page<Plato> listarTodos(Pageable pageable) {
        return repo.findAll(pageable);
    }

    // --- consultas cliente ---

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

    /**
     * Registra un nuevo plato validando que la categoria exista.
     * La URL de imagen viene ya incluida en el DTO como string.
     */
    public Plato registrar(PlatoConCategoria datos) throws Exception {
        Categoria categoria = categoriaRepo.findById(datos.categoriaId())
                .orElseThrow(() -> new ModeloNotFoundException("Categoría no encontrada"));

        Plato plato = datos.plato();
        plato.setCategoria(categoria);
        plato.setId(null);
        plato.setDisponible(true);

        return repo.save(plato);
    }

    /**
     * Actualiza un plato existente validando que la categoria exista.
     * Si no se envía imagen, conserva la anterior.
     */
    public Plato actualizar(Long id, PlatoConCategoria datos) throws Exception {
        Plato existente = buscar(id);
        Categoria categoria = categoriaRepo.findById(datos.categoriaId())
                .orElseThrow(() -> new ModeloNotFoundException("Categoría no encontrada"));

        Plato plato = datos.plato();
        plato.setId(id);
        plato.setCategoria(categoria);

        if (plato.getImagen() == null || plato.getImagen().isBlank()) {
            plato.setImagen(existente.getImagen());
        }

        return repo.save(plato);
    }

    public void activar(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDisponible(true);
        repo.save(plato);
    }

    public void desactivar(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDisponible(false);
        repo.save(plato);
    }

    /** DTO interno para transportar plato + categoriaId hacia el servicio. */
    public record PlatoConCategoria(Plato plato, Long categoriaId) {}
}