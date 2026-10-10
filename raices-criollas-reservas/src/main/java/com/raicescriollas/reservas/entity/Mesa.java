package com.raicescriollas.reservas.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "mesas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_mesa", nullable = false, unique = true, length = 50)
    private String numeroMesa;

    @Column(nullable = false)
    private Integer capacidad;

    @Column(length = 255)
    private String ubicacion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
