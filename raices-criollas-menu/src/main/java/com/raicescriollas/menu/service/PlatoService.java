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
import com.raicescriollas.menu.utils.BusinessException;
import com.raicescriollas.menu.utils.ModeloNotFoundException;

@Service
public class PlatoService extends ICRUDimpl<Plato, Long> {

    private final PlatoRepository repo;
    private final CategoriaRepository categoriaRepo;

    private static final int MAX_DESTACADOS = 5;

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
     * Si el plato viene marcado como destacado, se valida el límite de 5.
     */
    public Plato registrar(PlatoConCategoria datos) throws Exception {
        Categoria categoria = categoriaRepo.findById(datos.categoriaId())
                .orElseThrow(() -> new ModeloNotFoundException("Categoría no encontrada"));

        Plato plato = datos.plato();
        plato.setCategoria(categoria);
        plato.setId(null);

        // El stock inicial determina la disponibilidad
        int stockInicial = plato.getStock() != null ? plato.getStock() : 0;
        plato.setStock(stockInicial);
        plato.setDisponible(stockInicial > 0);

        if (Boolean.TRUE.equals(plato.getDestacado())) {
            long actuales = repo.countByDestacadoTrue();
            if (actuales >= MAX_DESTACADOS) {
                throw new BusinessException(
                        "Ya hay " + MAX_DESTACADOS + " platos destacados. Desmarca uno antes de destacar otro.");
            }
        } else {
            plato.setDestacado(false);
        }

        return repo.save(plato);
    }

    /**
     * Actualiza un plato existente validando que la categoria exista.
     * Si no se envía imagen, conserva la anterior.
     * Si se activa el destacado, se valida el límite de 5.
     * Si se modifica el stock, recalcula la disponibilidad.
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

        // Si no se envía stock, conservar el existente
        if (plato.getStock() == null) {
            plato.setStock(existente.getStock());
        }

        // El stock controla la disponibilidad: si llega a 0, se desactiva
        if (plato.getStock() == 0) {
            plato.setDisponible(false);
        }

        // Validar límite solo si se está activando el destacado (no estaba antes)
        boolean yaDestacado = Boolean.TRUE.equals(existente.getDestacado());
        boolean quiereDestacar = Boolean.TRUE.equals(plato.getDestacado());
        if (quiereDestacar && !yaDestacado) {
            long actuales = repo.countByDestacadoTrue();
            if (actuales >= MAX_DESTACADOS) {
                throw new BusinessException(
                        "Ya hay " + MAX_DESTACADOS + " platos destacados. Desmarca uno antes de destacar otro.");
            }
        }

        return repo.save(plato);
    }

    public void activar(Long id) throws Exception {
        Plato plato = buscar(id);
        if (plato.getStock() == 0) {
            throw new BusinessException("No se puede activar un plato con stock 0. Repón el stock primero.");
        }
        plato.setDisponible(true);
        repo.save(plato);
    }

    public void desactivar(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDisponible(false);
        repo.save(plato);
    }

    // --- stock ---

    /**
     * Reduce el stock en la cantidad indicada.
     * Si el stock resultante llega a 0 el plato se desactiva automáticamente.
     */
    public Plato reducirStock(Long id, int cantidad) throws Exception {
        if (cantidad <= 0) {
            throw new BusinessException("La cantidad a reducir debe ser mayor a 0.");
        }

        Plato plato = buscar(id);
        int nuevoStock = plato.getStock() - cantidad;

        if (nuevoStock < 0) {
            throw new BusinessException(
                    "Stock insuficiente. Stock actual: " + plato.getStock() + ", cantidad solicitada: " + cantidad + ".");
        }

        plato.setStock(nuevoStock);

        if (nuevoStock == 0) {
            plato.setDisponible(false);
        }

        return repo.save(plato);
    }

    /**
     * Repone stock. Si el plato estaba desactivado por stock 0,
     * se reactiva automáticamente.
     */
    public Plato reponerStock(Long id, int cantidad) throws Exception {
        if (cantidad <= 0) {
            throw new BusinessException("La cantidad a reponer debe ser mayor a 0.");
        }

        Plato plato = buscar(id);
        int nuevoStock = plato.getStock() + cantidad;
        plato.setStock(nuevoStock);
        plato.setDisponible(true);

        return repo.save(plato);
    }

    // --- destacados ---

    public List<Plato> listarDestacados() {
        return repo.findDestacados();
    }

    public void destacar(Long id) throws Exception {
        Plato plato = buscar(id);
        if (Boolean.TRUE.equals(plato.getDestacado())) return; // ya está destacado, noop

        long actuales = repo.countByDestacadoTrue();
        if (actuales >= MAX_DESTACADOS) {
            throw new BusinessException(
                    "Ya hay " + MAX_DESTACADOS + " platos destacados. Desmarca uno antes de destacar otro.");
        }

        plato.setDestacado(true);
        repo.save(plato);
    }

    public void quitarDestacado(Long id) throws Exception {
        Plato plato = buscar(id);
        plato.setDestacado(false);
        repo.save(plato);
    }

    /** DTO interno para transportar plato + categoriaId hacia el servicio. */
    public record PlatoConCategoria(Plato plato, Long categoriaId) {}
}