package com.raicescriollas.menu.dto;

import java.math.BigDecimal;

import lombok.Data;

/**
 * Proyección pública de un plato.
 * Omite campos internos como el stock que no deben exponerse a clientes.
 */
@Data
public class PlatoPublicoDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private Boolean disponible;
    private Boolean destacado;
    private String imagen;
    private Long categoriaId;
}
