package com.raicescriollas.menu.service;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.raicescriollas.menu.entity.Categoria;
import com.raicescriollas.menu.repository.CategoriaRepository;
import com.raicescriollas.menu.repository.PlatoRepository;
import com.raicescriollas.menu.utils.BusinessException;

@Service
public class CategoriaService extends ICRUDimpl<Categoria, Long> {

    private final CategoriaRepository repo;
    private final PlatoRepository platorepo;

    public CategoriaService(CategoriaRepository repo, PlatoRepository platorepo) {
        this.repo = repo;
        this.platorepo = platorepo;
    }

    @Override
    public JpaRepository<Categoria, Long> repo() {
        return repo;
    }
    public List<Categoria> listarActivas() {
        return repo.findByActivoTrue();
    }
    public void activar(Long id) throws Exception {
        Categoria categoria = buscar(id);
        categoria.setActivo(true);
        actualizar(categoria);
    }

    public void desactivar(Long id) throws Exception {
        Categoria categoria = buscar(id);
        categoria.setActivo(false);
        actualizar(categoria);
    }

    public void eliminar(Long id) throws Exception {
        buscar(id); // lanza ModeloNotFoundException si no existe

        if (platorepo.existsByCategoria_Id(id)) {
            throw new BusinessException(
                    "No se puede eliminar la categoria porque tiene platos asociados"
            );
        }

        repo.deleteById(id);
    }
    public Categoria buscarActiva(Long id) {

        return repo.findByIdAndActivoTrue(id)
                .orElse(null);
    }
}