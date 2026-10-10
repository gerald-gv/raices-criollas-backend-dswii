package com.raicescriollas.reservas.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaRequestDTO {

    @NotNull(message = "El id de la mesa es obligatorio")
    private Long mesaId;

    @NotNull(message = "La fecha y hora de inicio es obligatoria")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha y hora de finalización es obligatoria")
    private LocalDateTime fechaFin;

    @NotNull(message = "La cantidad de personas es obligatoria")
    @Min(value = 1, message = "La cantidad de personas debe ser mayor que cero")
    private Integer cantidadPersonas;

    private String observaciones;
}
