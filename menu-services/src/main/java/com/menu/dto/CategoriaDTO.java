package com.menu.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class CategoriaDTO {
    private Long id;

    @NotBlank(message = "{categoria.nombre.blank}")
    @Size(min = 3, message = "{categoria.nombre.min}")
    @Size(max = 100, message = "{categoria.nombre.max}")
    private String nombre;

    @Size(max = 255, message = "{categoria.descripcion.max}")
    private String descripcion;

    private Boolean activo;
}