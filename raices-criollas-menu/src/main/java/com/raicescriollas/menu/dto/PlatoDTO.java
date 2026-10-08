package com.raicescriollas.menu.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PlatoDTO {

    private Long id;

    @NotBlank(message = "{plato.nombre.blank}")
    @Size(min = 3, message = "{plato.nombre.min}")
    @Size(max = 150, message = "{plato.nombre.max}")
    private String nombre;

    @Size(max = 500, message = "{plato.descripcion.max}")
    private String descripcion;

    @NotNull(message = "{plato.precio.null}")
    @DecimalMin(value = "0.01", message = "{plato.precio.min}")
    private BigDecimal precio;

    private Boolean disponible;

    @Size(max = 500, message = "{plato.imagen.max}")
    private String imagen;

    @NotNull(message = "{plato.categoria.null}")
    private Long categoriaId;
}