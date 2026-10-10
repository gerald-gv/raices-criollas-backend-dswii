package com.raicescriollas.menu.controller;

import java.math.BigDecimal;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.menu.dto.PlatoDTO;
import com.raicescriollas.menu.entity.Plato;
import com.raicescriollas.menu.service.PlatoService;
import com.raicescriollas.menu.service.ResumenService;
import com.raicescriollas.menu.utils.ApiResponse;
import com.raicescriollas.menu.utils.ModeloNotFoundException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/platos")
public class PlatoController {

    private final PlatoService service;
    private final ResumenService resumenService;
    private final ModelMapper mapper;

    public PlatoController(PlatoService service, ModelMapper mapper, ResumenService resumenService) {
        this.service = service;
        this.mapper = mapper;
        this.resumenService = resumenService;
    }

    // =========================================================
    // Endpoints publicos (cliente)
    // =========================================================

    /**
     * Listado y busqueda de platos disponibles.
     * Todos los parametros son opcionales y combinables:
     *   GET /platos/disponibles
     *   GET /platos/disponibles?nombre=pollo
     *   GET /platos/disponibles?categoriaId=2
     *   GET /platos/disponibles?precioMin=10&precioMax=50
     *   GET /platos/disponibles?nombre=pollo&categoriaId=2&precioMax=40
     */
    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<?>> listarDisponibles(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax) {

        List<PlatoDTO> listaDTO = service
                .buscarDisponibles(nombre, categoriaId, precioMin, precioMax)
                .stream()
                .map(p -> mapper.map(p, PlatoDTO.class))
                .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Platos disponibles encontrados", listaDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> buscarDisponible(@PathVariable Long id) {

        Plato plato = service.buscarDisponible(id);

        if (plato == null) {
            throw new ModeloNotFoundException("Plato no encontrado o no esta disponible");
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato encontrado", mapper.map(plato, PlatoDTO.class)));
    }

    // Endpoints administrativos

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> listarTodos(
            @PageableDefault(size = 10, sort = "id",
                    direction = Sort.Direction.ASC) Pageable pageable) {

        Page<PlatoDTO> paginaDTO = service.listarTodos(pageable)
                .map(p -> mapper.map(p, PlatoDTO.class));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Platos encontrados", paginaDTO));
    }
    
    @GetMapping("/admin/resumen")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> resumen() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Resumen del menu", resumenService.obtenerResumen()));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscarAdmin(@PathVariable Long id) throws Exception {

        Plato plato = service.buscar(id);

        if (plato == null) {
            throw new ModeloNotFoundException("Plato no encontrado");
        }

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato encontrado", mapper.map(plato, PlatoDTO.class)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> registrar(
            @Valid @RequestBody PlatoDTO dto) throws Exception {

        Plato plato = mapper.map(dto, Plato.class);
        plato.setId(null);
        plato.setDisponible(true);

        PlatoDTO bean = mapper.map(service.registrar(plato), PlatoDTO.class);

        return new ResponseEntity<>(
                new ApiResponse<>(true, "Plato registrado correctamente", bean),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PlatoDTO dto) throws Exception {

        Plato plato = mapper.map(dto, Plato.class);
        plato.setId(id);

        PlatoDTO bean = mapper.map(service.actualizar(plato), PlatoDTO.class);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato actualizado correctamente", bean));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> eliminar(@PathVariable Long id) throws Exception {

        service.eliminar(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato eliminado correctamente", null));
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> activar(@PathVariable Long id) throws Exception {

        service.activar(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato activado correctamente", null));
    }

    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> desactivar(@PathVariable Long id) throws Exception {

        service.desactivar(id);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato desactivado correctamente", null));
    }
}