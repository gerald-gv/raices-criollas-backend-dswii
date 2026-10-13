package com.raicescriollas.pedidos.messaging;

import com.raicescriollas.pedidos.config.RabbitMQConfig;
import com.raicescriollas.pedidos.entity.Pedido;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Publica eventos de pedido en RabbitMQ.
 *
 * La publicación es best-effort: si el broker no está disponible se registra el error
 * pero NO revierte la transacción ya confirmada.
 *
 * Limitación académica: guardar el pedido y publicar el evento no son atómicos.
 * En producción se usaría el patrón Outbox para garantizar que el evento
 * siempre se envía si el pedido se guardó.
 */
@Component
public class PedidoEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PedidoEventPublisher.class);

    private final RabbitTemplate rabbit;

    public PedidoEventPublisher(RabbitTemplate rabbit) {
        this.rabbit = rabbit;
    }

    /**
     * Publica pedido.pagado con los ítems del pedido para que menu-service descuente el stock.
     */
    public void publicarPedidoPagado(Pedido pedido) {
        PedidoPagadoEvent evento = construir(pedido);
        try {
            rabbit.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_PAGADO, evento);
            log.info("[RabbitMQ] pedido.pagado publicado — pedidoId={} items={}",
                    pedido.getId(), evento.items().size());
        } catch (Exception e) {
            // El pedido ya fue guardado: registramos el fallo pero no lanzamos excepción.
            // En producción aquí guardaríamos el evento en la tabla outbox para reintentar.
            log.error("[RabbitMQ] No se pudo publicar pedido.pagado — pedidoId={} error={}",
                    pedido.getId(), e.getMessage(), e);
        }
    }

    /**
     * Publica pedido.cancelado.pagado para que menu-service reponga el stock
     * cuando se cancela un pedido que ya había sido cobrado.
     */
    public void publicarPedidoCanceladoPagado(Pedido pedido) {
        PedidoPagadoEvent evento = construir(pedido);
        try {
            rabbit.convertAndSend(RabbitMQConfig.EXCHANGE, RabbitMQConfig.RK_CANCELADO, evento);
            log.info("[RabbitMQ] pedido.cancelado.pagado publicado — pedidoId={} items={}",
                    pedido.getId(), evento.items().size());
        } catch (Exception e) {
            log.error("[RabbitMQ] No se pudo publicar pedido.cancelado.pagado — pedidoId={} error={}",
                    pedido.getId(), e.getMessage(), e);
        }
    }

    private PedidoPagadoEvent construir(Pedido pedido) {
        List<PedidoPagadoEvent.ItemEvent> items = pedido.getDetalles().stream()
                .map(d -> new PedidoPagadoEvent.ItemEvent(d.getPlatoId(), d.getCantidad()))
                .toList();
        return new PedidoPagadoEvent(pedido.getId(), pedido.getClienteId(), items);
    }
}
