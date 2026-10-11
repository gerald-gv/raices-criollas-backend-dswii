package com.raicescriollas.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.raicescriollas.auth.dto.TokenResponse;
import com.raicescriollas.auth.service.impl.JwtService;

@RestController 
@RequestMapping ("/internal")
public class ServiceTokenController {

    @Value ("${app.internal.secret}")   // clave compartida entre microservicios
    private String internalSecret;

    private final JwtService jwtService;
    public ServiceTokenController(JwtService jwtService) {
    this.jwtService = jwtService;
    }
    @PostMapping ("/service-token")
    public ResponseEntity<TokenResponse> obtener(@RequestBody ServiceTokenRequest req) {
        if (!internalSecret.equals(req.secret())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String token = jwtService.generateServiceToken(req.serviceName());
        return ResponseEntity.ok(new TokenResponse(token, "Bearer", jwtService.accessTokenTtlSeconds()));
    }

    public record ServiceTokenRequest(String serviceName, String secret) {}
}