package com.raicescriollas.pedidos.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- Nombres de exchange, colas y routing keys ---

    public static final String EXCHANGE        = "raices.exchange";

    public static final String QUEUE_DESCONTAR = "menu.stock.descontar";
    public static final String QUEUE_REPONER   = "menu.stock.reponer";

    public static final String RK_PAGADO    = "pedido.pagado";
    public static final String RK_CANCELADO = "pedido.cancelado.pagado";

    // Dead-Letter Queues: mensajes que no se pueden procesar van aquí en lugar de perderse
    public static final String DLQ_DESCONTAR = "menu.stock.descontar.dlq";
    public static final String DLQ_REPONER   = "menu.stock.reponer.dlq";

    // --- Exchange ---

    @Bean
    public DirectExchange raicesExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    // --- Colas principales con DLQ configurada ---

    @Bean
    public Queue queueDescontar() {
        return QueueBuilder.durable(QUEUE_DESCONTAR)
                .withArgument("x-dead-letter-exchange", "")          // DLQ usa el exchange por defecto
                .withArgument("x-dead-letter-routing-key", DLQ_DESCONTAR)
                .build();
    }

    @Bean
    public Queue queueReponer() {
        return QueueBuilder.durable(QUEUE_REPONER)
                .withArgument("x-dead-letter-exchange", "")
                .withArgument("x-dead-letter-routing-key", DLQ_REPONER)
                .build();
    }

    // --- Dead-Letter Queues (durables, sin DLQ propia para evitar cadenas infinitas) ---

    @Bean
    public Queue dlqDescontar() {
        return QueueBuilder.durable(DLQ_DESCONTAR).build();
    }

    @Bean
    public Queue dlqReponer() {
        return QueueBuilder.durable(DLQ_REPONER).build();
    }

    // --- Bindings: exchange + routing key → cola ---

    @Bean
    public Binding bindingDescontar(Queue queueDescontar, DirectExchange raicesExchange) {
        return BindingBuilder.bind(queueDescontar).to(raicesExchange).with(RK_PAGADO);
    }

    @Bean
    public Binding bindingReponer(Queue queueReponer, DirectExchange raicesExchange) {
        return BindingBuilder.bind(queueReponer).to(raicesExchange).with(RK_CANCELADO);
    }

    // --- Serialización JSON (JacksonJsonMessageConverter reemplaza al deprecado Jackson2JsonMessageConverter) ---

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    /**
     * Sobreescribe el RabbitTemplate por defecto para usar JSON.
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         JacksonJsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }
}
