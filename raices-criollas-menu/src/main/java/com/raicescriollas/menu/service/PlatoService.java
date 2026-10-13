package com.raicescriollas.menu.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.menu.dto.StockItemDTO;
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
    @Transactional
    public Plato reducirStock(Long id, int cantidad) throws Exception {
        if (cantidad <= 0) {
            throw new BusinessException("La cantidad a reducir debe ser mayor a 0.");
        }

        Plato plato = buscarParaActualizar(id);
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
     * Revisa si alcanza el stock de varios platos sin descontar nada (lo usa pedidos antes de mandar al cliente a pagar).
     * No reserva, solo evita cobrar algo que ya no hay. El descuento real llega por RabbitMQ al aprobarse el pago.
     */
    @Transactional(readOnly = true)
    public void verificarStock(List<StockItemDTO> items) {
        for (Map.Entry<Long, Integer> item : agrupar(items).entrySet()) {
            Plato plato = repo.findById(item.getKey())
                    .orElseThrow(() -> new BusinessException("Un plato de tu pedido ya no existe."));

            if (!Boolean.TRUE.equals(plato.getDisponible())) {
                throw new BusinessException("«" + plato.getNombre() + "» ya no está disponible.");
            }
            if (plato.getStock() < item.getValue()) {
                throw new BusinessException("No hay stock suficiente de «" + plato.getNombre() + "». Reduce la cantidad o quítalo del pedido.");
            }
        }
    }

    /**
     * Repone stock. Si el plato estaba desactivado por stock 0,
     * se reactiva automáticamente.
     */
    @Transactional
    public Plato reponerStock(Long id, int cantidad) throws Exception {
        if (cantidad <= 0) {
            throw new BusinessException("La cantidad a reponer debe ser mayor a 0.");
        }

        Plato plato = buscarParaActualizar(id);
        int nuevoStock = plato.getStock() + cantidad;
        plato.setStock(nuevoStock);
        plato.setDisponible(true);

        return repo.save(plato);
    }

    /**
     * Reduce el stock de varios platos en una sola transacción (lo usa pedidos).
     * Todo o nada: si un plato no alcanza, ninguno se descuenta. El mensaje no revela cantidades.
     */
    @Transactional
    public void reducirStock(List<StockItemDTO> items) {
        // Se agrupa por plato y se recorre por id: dos pedidos a la vez bloquean en el mismo orden y no se traban
        for (Map.Entry<Long, Integer> item : agrupar(items).entrySet()) {
            Plato plato = buscarParaActualizar(item.getKey());

            if (!Boolean.TRUE.equals(plato.getDisponible())) {
                throw new BusinessException("«" + plato.getNombre() + "» ya no está disponible.");
            }
            if (plato.getStock() < item.getValue()) {
                throw new BusinessException("Stock insuficiente de «" + plato.getNombre() + "».");
            }

            plato.setStock(plato.getStock() - item.getValue());
            if (plato.getStock() == 0) {
                plato.setDisponible(false);
            }
            repo.save(plato);
        }
    }

    /**
     * Devuelve stock de varios platos (pedido cancelado). Solo reactiva el plato si estaba agotado:
     * si el administrador lo ocultó a propósito, sigue oculto.
     */
    @Transactional
    public void reponerStock(List<StockItemDTO> items) {
        for (Map.Entry<Long, Integer> item : agrupar(items).entrySet()) {
            Plato plato = buscarParaActualizar(item.getKey());

            if (plato.getStock() == 0) {
                plato.setDisponible(true);
            }
            plato.setStock(plato.getStock() + item.getValue());
            repo.save(plato);
        }
    }

    private Map<Long, Integer> agrupar(List<StockItemDTO> items) {
        if (items == null || items.isEmpty()
                || items.stream().anyMatch(i -> i.platoId() == null || i.cantidad() == null || i.cantidad() < 1)) {
            throw new BusinessException("La lista de platos no es válida.");
        }

        return items.stream().collect(Collectors.toMap(
                StockItemDTO::platoId, StockItemDTO::cantidad, Integer::sum, TreeMap::new));
    }

    private Plato buscarParaActualizar(Long id) {
        return repo.findByIdForUpdate(id)
                .orElseThrow(() -> new ModeloNotFoundException("Plato no encontrado"));
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