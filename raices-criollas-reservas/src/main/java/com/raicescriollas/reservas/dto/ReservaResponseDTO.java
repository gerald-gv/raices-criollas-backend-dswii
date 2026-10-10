package com.raicescriollas.reservas.dto;

import java.time.LocalDateTime;

import com.raicescriollas.reservas.enums.EstadoReserva;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservaResponseDTO {

    private Long id;
    private Long clienteId;
    private MesaResponseDTO mesa;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer cantidadPersonas;
    private EstadoReserva estado;
    private String observaciones;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
