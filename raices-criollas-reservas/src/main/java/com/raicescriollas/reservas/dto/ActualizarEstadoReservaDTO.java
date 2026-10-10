package com.raicescriollas.reservas.dto;

import com.raicescriollas.reservas.enums.EstadoReserva;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEstadoReservaDTO {

    @NotNull(message = "El estado de la reserva es obligatorio")
    private EstadoReserva estado;
}
