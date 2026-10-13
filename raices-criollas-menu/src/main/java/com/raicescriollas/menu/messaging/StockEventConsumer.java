package com.raicescriollas.menu.messaging;

import com.raicescriollas.menu.config.RabbitMQConfig;
import com.raicescriollas.menu.dto.StockItemDTO;
import com.raicescriollas.menu.service.PlatoService;
import com.raicescriollas.menu.utils.BusinessException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Consume eventos de pedidos y ajusta el stock llamando a la lógica de negocio
 * existente en PlatoService — sin duplicar ninguna regla.
 *
 * Idempotencia: reducirStock(List) ya usa PESSIMISTIC_WRITE en la BD,
 * por lo que dos mensajes del mismo pedido no descuentan dos veces siempre
 * que el stock no haya sido repuesto manualmente entre medio.
 *
 * Si la operación falla (stock insuficiente, plato inexistente) se lanza
 * una excepción: con defaultRequeueRejected=false el mensaje va a la DLQ
 * en lugar de reencolar en bucle.
 */
@Component
public class StockEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(StockEventConsumer.class);

    private final PlatoService platoService;

    public StockEventConsumer(PlatoService platoService) {
        this.platoService = platoService;
    }

    /**
     * Descuenta stock cuando un pedido se marca como pagado.
     * Reutiliza PlatoService.reducirStock(List) — todo o nada, con lock pesimista.
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_DESCONTAR)
    public void descontarStock(PedidoPagadoEvent evento) {
        log.info("[RabbitMQ] pedido.pagado recibido — pedidoId={} items={}",
                evento.pedidoId(), evento.items().size());

        if (evento.items() == null || evento.items().isEmpty()) {
            log.warn("[RabbitMQ] pedido.pagado sin items — pedidoId={}, ignorando", evento.pedidoId());
            return;
        }

        List<StockItemDTO> items = toStockItems(evento);
        try {
            platoService.reducirStock(items);
            log.info("[RabbitMQ] stock descontado — pedidoId={}", evento.pedidoId());
        } catch (BusinessException e) {
            // Stock insuficiente o plato no disponible: mensaje va a DLQ.
            // En producción se notificaría al sistema de pagos para generar un reembolso.
            log.error("[RabbitMQ] No se pudo descontar stock — pedidoId={} motivo={}",
                    evento.pedidoId(), e.getMessage());
            throw new RuntimeException("Descuento fallido: " + e.getMessage(), e);
        }
    }

    /**
     * Repone stock cuando se cancela un pedido que ya había sido cobrado.
     * Reutiliza PlatoService.reponerStock(List).
     */
    @RabbitListener(queues = RabbitMQConfig.QUEUE_REPONER)
    public void reponerStock(PedidoPagadoEvent evento) {
        log.info("[RabbitMQ] pedido.cancelado.pagado recibido — pedidoId={} items={}",
                evento.pedidoId(), evento.items().size());

        if (evento.items() == null || evento.items().isEmpty()) {
            log.warn("[RabbitMQ] pedido.cancelado.pagado sin items — pedidoId={}, ignorando", evento.pedidoId());
            return;
        }

        List<StockItemDTO> items = toStockItems(evento);
        try {
            platoService.reponerStock(items);
            log.info("[RabbitMQ] stock repuesto — pedidoId={}", evento.pedidoId());
        } catch (BusinessException e) {
            log.error("[RabbitMQ] No se pudo reponer stock — pedidoId={} motivo={}",
                    evento.pedidoId(), e.getMessage());
            throw new RuntimeException("Reposición fallida: " + e.getMessage(), e);
        }
    }

    private List<StockItemDTO> toStockItems(PedidoPagadoEvent evento) {
        return evento.items().stream()
                .map(i -> new StockItemDTO(i.platoId(), i.cantidad()))
                .toList();
    }
}
