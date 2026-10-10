package com.raicescriollas.menu.controller;

import java.math.BigDecimal;
import java.util.List;
import java.io.IOException;
import java.util.Map;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

import com.raicescriollas.menu.dto.PlatoDTO;
import com.raicescriollas.menu.entity.Plato;
import com.raicescriollas.menu.service.ImagenService;
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
    private final ImagenService imagenService;

    public PlatoController(PlatoService service, ModelMapper mapper,
                           ResumenService resumenService, ImagenService imagenService) {
        this.service = service;
        this.mapper = mapper;
        this.resumenService = resumenService;
        this.imagenService = imagenService;
    }

    // Endpoints publicos (cliente)

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

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato encontrado", mapper.map(plato, PlatoDTO.class)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> registrar(
            @Valid @RequestBody PlatoDTO dto) throws Exception {

        Plato plato = mapper.map(dto, Plato.class);

        Plato guardado = service.registrar(
                new PlatoService.PlatoConCategoria(
                        plato, dto.getCategoriaId()));

        return new ResponseEntity<>(
                new ApiResponse<>(
                        true,
                        "Plato registrado correctamente",
                        mapper.map(guardado, PlatoDTO.class)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PlatoDTO dto) throws Exception {

        Plato plato = mapper.map(dto, Plato.class);
        Plato actualizado = service.actualizar(id,
                new PlatoService.PlatoConCategoria(plato, dto.getCategoriaId()));

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato actualizado correctamente",
                        mapper.map(actualizado, PlatoDTO.class)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> eliminar(@PathVariable Long id) throws Exception {
        service.eliminar(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Plato eliminado correctamente", null));
    }    @PutMapping("/{id}/activar")
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

    /**
     * Sube una imagen a Cloudinary y devuelve la URL segura.
     * El frontend llama a este endpoint primero, obtiene la URL
     * y la incluye en el JSON al registrar/actualizar el plato.
     */
    @PostMapping(value = "/imagen", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> subirImagen(
            @RequestParam("archivo") MultipartFile archivo) {
        try {
            String url = imagenService.subirImagen(archivo);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "No se pudo subir la imagen"));
        }
    }
}
