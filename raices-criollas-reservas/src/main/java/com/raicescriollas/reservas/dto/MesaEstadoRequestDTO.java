package com.raicescriollas.reservas.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesaEstadoRequestDTO {

    @NotNull(message = "El estado activo es obligatorio")
    private Boolean activo;
}
