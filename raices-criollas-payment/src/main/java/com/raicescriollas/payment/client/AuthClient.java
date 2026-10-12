package com.raicescriollas.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "raices-criollas-auth")
public interface AuthClient {

    @PostMapping("/internal/service-token")
    ServiceTokenResponse obtenerToken(@RequestBody ServiceTokenRequest request);

    record ServiceTokenRequest(String serviceName, String secret) {
    }

    record ServiceTokenResponse(String accessToken, String tokenType, long expiresIn) {
    }
}