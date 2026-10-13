package com.raicescriollas.reservas.dto;

import com.raicescriollas.reservas.enums.EstadoPago;
import com.raicescriollas.reservas.enums.EstadoReserva;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEstadoReservaDTO {

    private EstadoReserva estado;

    private EstadoPago estadoPago;
}
