package com.raicescriollas.menu.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- Nombres deben coincidir exactamente con los de pedidos-service ---

    public static final String EXCHANGE        = "raices.exchange";

    public static final String QUEUE_DESCONTAR = "menu.stock.descontar";
    public static final String QUEUE_REPONER   = "menu.stock.reponer";

    public static final String RK_PAGADO    = "pedido.pagado";
    public static final String RK_CANCELADO = "pedido.cancelado.pagado";

    public static final String DLQ_DESCONTAR = "menu.stock.descontar.dlq";
    public static final String DLQ_REPONER   = "menu.stock.reponer.dlq";

    // --- Exchange ---

    @Bean
    public DirectExchange raicesExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    // --- Colas con DLQ ---

    @Bean
    public Queue queueDescontar() {
        return QueueBuilder.durable(QUEUE_DESCONTAR)
                .withArgument("x-dead-letter-exchange", "")
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

    @Bean
    public Queue dlqDescontar() {
        return QueueBuilder.durable(DLQ_DESCONTAR).build();
    }

    @Bean
    public Queue dlqReponer() {
        return QueueBuilder.durable(DLQ_REPONER).build();
    }

    // --- Bindings ---

    @Bean
    public Binding bindingDescontar(Queue queueDescontar, DirectExchange raicesExchange) {
        return BindingBuilder.bind(queueDescontar).to(raicesExchange).with(RK_PAGADO);
    }

    @Bean
    public Binding bindingReponer(Queue queueReponer, DirectExchange raicesExchange) {
        return BindingBuilder.bind(queueReponer).to(raicesExchange).with(RK_CANCELADO);
    }

    // --- Serialización JSON ---

    @Bean
    public JacksonJsonMessageConverter messageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         JacksonJsonMessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    /**
     * Configura el listener container para usar JSON y limitar reintentos.
     * defaultRequeueRejected=false: si el listener lanza una excepción no recuperable,
     * el mensaje va a la DLQ en lugar de reencolar indefinidamente.
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            JacksonJsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
