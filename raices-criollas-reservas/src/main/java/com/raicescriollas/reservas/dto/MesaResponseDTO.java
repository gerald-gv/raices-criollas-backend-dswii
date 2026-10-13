package com.raicescriollas.reservas.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesaResponseDTO {

    private Long id;
    private String numeroMesa;
    private Integer capacidad;
    private String ubicacion;
    private BigDecimal precioBase;
    private Boolean activo;
}
