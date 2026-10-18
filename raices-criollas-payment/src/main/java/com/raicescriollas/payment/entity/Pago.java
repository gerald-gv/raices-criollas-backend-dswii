package com.raicescriollas.payment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "pagos", indexes = {
        @Index(name = "idx_pagos_pedido_id", columnList = "pedido_id"),
        @Index(name = "idx_pagos_reserva_id", columnList = "reserva_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private TipoOrigen tipo = TipoOrigen.PEDIDO;

    @Column(name = "pedido_id")
    private Long pedidoId;

    @Column(name = "reserva_id")
    private Long reservaId;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(nullable = false, length = 3)
    @Builder.Default
    private String moneda = "PEN";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoPago estado = EstadoPago.PENDIENTE;

    @Column(name = "mp_preference_id", length = 100)
    private String mpPreferenceId;

    @Column(name = "mp_payment_id", length = 50)
    private String mpPaymentId;

    @Column(name = "url_pago", length = 500)
    private String urlPago;

    @Column(name = "referencia_externa", unique = true, length = 36)
    @Builder.Default
    private String referenciaExterna = UUID.randomUUID().toString();

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "creado_en", nullable = false, updatable = false)
    @Builder.Default
    private Instant creadoEn = Instant.now();

    @Column(name = "actualizado_en", nullable = false)
    @Builder.Default
    private Instant actualizadoEn = Instant.now();

    @Column(name = "vence_en")
    private Instant venceEn;

    @PreUpdate
    void alActualizar() {
        this.actualizadoEn = Instant.now();
    }
}
