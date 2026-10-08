package com.raicescriollas.menu.controller;

import java.util.List;

import org.modelmapper.ModelMapper;
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
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.menu.dto.CategoriaDTO;
import com.raicescriollas.menu.entity.Categoria;
import com.raicescriollas.menu.service.CategoriaService;
import com.raicescriollas.menu.utils.ApiResponse;
import com.raicescriollas.menu.utils.ModeloNotFoundException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/categorias")
public class CategoriaController {

    private final CategoriaService service;
    private final ModelMapper mapper;

    public CategoriaController(CategoriaService service, ModelMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> listarTodos() throws Exception {

        List<Categoria> lista = service.listarTodos();

        List<CategoriaDTO> listaDTO = lista.stream()
                .map(categoria -> mapper.map(categoria, CategoriaDTO.class))
                .toList();

        ApiResponse<List<CategoriaDTO>> response =
                new ApiResponse<>(
                        true,
                        "Categorias encontradas",
                        listaDTO
                );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> buscarActiva(
            @PathVariable Long id) {

        Categoria categoria =
                service.buscarActiva(id);

        if (categoria == null) {
            throw new ModeloNotFoundException(
                    "Categoria no encontrada o no esta activa"
            );
        }

        CategoriaDTO bean =
                mapper.map(categoria, CategoriaDTO.class);

        ApiResponse<CategoriaDTO> response =
                new ApiResponse<>(
                        true,
                        "Categoria encontrada",
                        bean
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> buscarAdmin(
            @PathVariable Long id) throws Exception {

        Categoria categoria =
                service.buscar(id);

        if (categoria == null) {
            throw new ModeloNotFoundException(
                    "Categoria no encontrada"
            );
        }

        CategoriaDTO bean =
                mapper.map(categoria, CategoriaDTO.class);

        ApiResponse<CategoriaDTO> response =
                new ApiResponse<>(
                        true,
                        "Categoria encontrada",
                        bean
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }
    @GetMapping("/activas")
    public ResponseEntity<ApiResponse<?>> listarActivas() {

        List<Categoria> lista = service.listarActivas();

        List<CategoriaDTO> listaDTO = lista.stream()
                .map(categoria -> mapper.map(categoria, CategoriaDTO.class))
                .toList();

        ApiResponse<List<CategoriaDTO>> response =
                new ApiResponse<>(
                        true,
                        "Categorias activas encontradas",
                        listaDTO
                );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> registrar(
            @Valid @RequestBody CategoriaDTO dto) throws Exception {

        Categoria categoria =
                mapper.map(dto, Categoria.class);

        categoria.setId(null);

        Categoria resultado =
                service.registrar(categoria);

        CategoriaDTO bean =
                mapper.map(resultado, CategoriaDTO.class);

        ApiResponse<CategoriaDTO> response =
                new ApiResponse<>(
                        true,
                        "Categoria registrada correctamente",
                        bean
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaDTO dto) throws Exception {

        Categoria categoria =
                mapper.map(dto, Categoria.class);

        categoria.setId(id);

        Categoria resultado =
                service.actualizar(categoria);

        CategoriaDTO bean =
                mapper.map(resultado, CategoriaDTO.class);

        ApiResponse<CategoriaDTO> response =
                new ApiResponse<>(
                        true,
                        "Categoria actualizada correctamente",
                        bean
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> eliminar(
            @PathVariable Long id) throws Exception {

        service.eliminar(id);

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        "Categoria eliminada correctamente",
                        null
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}/activar")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> activar(
            @PathVariable Long id) throws Exception {

        service.activar(id);

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        "Categoria activada correctamente",
                        null
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}/desactivar")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<?>> desactivar(
            @PathVariable Long id) throws Exception {

        service.desactivar(id);

        ApiResponse<String> response =
                new ApiResponse<>(
                        true,
                        "Categoria desactivada correctamente",
                        null
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.OK
        );
    }
}