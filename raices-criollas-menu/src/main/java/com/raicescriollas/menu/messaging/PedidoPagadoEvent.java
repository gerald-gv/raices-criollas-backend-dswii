package com.raicescriollas.menu.messaging;

import java.util.List;

/**
 * Contrato del evento publicado por pedidos-service cuando un pedido se paga.
 *
 * Esta clase es independiente de la que tiene pedidos-service: ambas
 * deserializan el mismo JSON sin compartir código entre microservicios.
 *
 * JSON esperado:
 * {
 *   "pedidoId": 42,
 *   "clienteId": 7,
 *   "items": [
 *     { "platoId": 1, "cantidad": 2 },
 *     { "platoId": 3, "cantidad": 1 }
 *   ]
 * }
 */
public record PedidoPagadoEvent(
        Long pedidoId,
        Long clienteId,
        List<ItemEvent> items
) {
    public record ItemEvent(Long platoId, Integer cantidad) {}
}
