package com.raicescriollas.reservas.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MesaRequestDTO {

    @NotBlank(message = "El número o código de mesa es obligatorio")
    private String numeroMesa;

    @NotNull(message = "La capacidad máxima es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor que cero")
    private Integer capacidad;

    private String ubicacion;

    @DecimalMin(value = "0.0", inclusive = true, message = "El precio base no puede ser negativo")
    private BigDecimal precioBase;

    private Boolean activo;
}
