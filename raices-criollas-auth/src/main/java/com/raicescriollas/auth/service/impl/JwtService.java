package com.raicescriollas.auth.service.impl;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.raicescriollas.auth.entity.Usuario;
import com.raicescriollas.auth.service.ITokenService;

@Service
public class JwtService implements ITokenService {

    private final JwtEncoder encoder;
    private final String issuer;
    private final long accessMinutes;

    public JwtService(JwtEncoder encoder,
    		@Value("${app.jwt.issuer}") String issuer,
    		@Value("${app.jwt.access-token-minutes}") long accessMinutes) {
        this.encoder = encoder;
        this.issuer = issuer;
        this.accessMinutes = accessMinutes;
    }

    @Override
    public String generateAccessToken(Usuario usuario) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(usuario.getId().toString())
                .issuedAt(now)
                .expiresAt(now.plus(accessMinutes, ChronoUnit.MINUTES))
                .claim("email", usuario.getEmail())
                .claim("roles", List.of(usuario.getRol().getNombre()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    @Override
    public long accessTokenTtlSeconds() {
        return accessMinutes * 60;
    }
}