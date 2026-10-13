package com.raicescriollas.reservas.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CotizacionResponseDTO {

    private Long mesaId;
    private String numeroMesa;
    private Integer capacidadMesa;
    private Integer cantidadPersonas;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Long duracionMinutos;
    private String moneda;
    private BigDecimal precioBaseMesa;
    private BigDecimal tarifaBaseMesa;
    private BigDecimal tarifaPorPersona;
    private BigDecimal subtotalPersonas;
    private BigDecimal montoTotal;
    private Boolean disponible;
    private String mensaje;
    private String desglose;
}
