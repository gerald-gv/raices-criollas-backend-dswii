package com.raicescriollas.reservas.dto;

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
    private Boolean activo;
}
