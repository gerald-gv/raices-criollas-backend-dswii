package com.raicescriollas.pedidos.messaging;

import java.util.List;

/**
 * Contrato del evento que pedidos-service publica cuando un pedido se paga.
 *
 * JSON resultante:
 * {
 *   "pedidoId": 42,
 *   "clienteId": 7,
 *   "items": [
 *     { "platoId": 1, "cantidad": 2 },
 *     { "platoId": 3, "cantidad": 1 }
 *   ]
 * }
 *
 * menu-service define su propio record equivalente para deserializar este mismo JSON,
 * sin compartir clases Java entre servicios.
 */
public record PedidoPagadoEvent(
        Long pedidoId,
        Long clienteId,
        List<ItemEvent> items
) {
    public record ItemEvent(Long platoId, Integer cantidad) {}
}
