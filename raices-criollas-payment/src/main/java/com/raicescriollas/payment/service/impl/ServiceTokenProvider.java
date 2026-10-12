package com.raicescriollas.payment.service.impl;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.raicescriollas.payment.client.AuthClient;

@Component
public class ServiceTokenProvider {

    private static final String SERVICE_NAME = "payment-service";
    private static final long MARGEN_SEGUNDOS = 60;

    private final AuthClient auth;
    private final String secret;
    private String token;
    private Instant venceEn = Instant.EPOCH;

    public ServiceTokenProvider(AuthClient auth, @Value("${app.internal.secret}") String secret) {
        this.auth = auth;
        this.secret = secret;
    }

    public synchronized String bearer() {
        if (token == null || Instant.now().isAfter(venceEn)) {
            renovar();
        }
        return "Bearer " + token;
    }

    public synchronized void invalidar() {
        token = null;
    }

    private void renovar() {
        AuthClient.ServiceTokenResponse r =
                auth.obtenerToken(new AuthClient.ServiceTokenRequest(SERVICE_NAME, secret));
        token = r.accessToken();
        venceEn = Instant.now().plusSeconds(Math.max(r.expiresIn() - MARGEN_SEGUNDOS, 0));
    }
}