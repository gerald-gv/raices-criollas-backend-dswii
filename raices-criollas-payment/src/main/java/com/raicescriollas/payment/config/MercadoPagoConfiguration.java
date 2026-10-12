package com.raicescriollas.payment.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MercadoPagoConfiguration {

    @Value("${app.mercadopago.access-token}")
    private String accessToken;

    @PostConstruct
    void init() {
        MercadoPagoConfig.setAccessToken(accessToken);
    }
}
