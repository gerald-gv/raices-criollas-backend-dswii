package com.menu.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Plato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no debe superar los 150 caracteres")
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Size(max = 500, message = "La descripción no debe superar los 500 caracteres")
    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Column(name = "precio", nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @NotNull(message = "La disponibilidad es obligatoria")
    @Column(name = "disponible", nullable = false)
    private Boolean disponible = true;

    @Size(max = 500, message = "La URL de la imagen no debe superar los 500 caracteres")
    @Column(name = "imagen", length = 500)
    private String imagen;

    @NotNull(message = "La categoría es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
}