package com.raicescriollas.pedidos.service;

import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.raicescriollas.pedidos.client.AuthClient;
import com.raicescriollas.pedidos.client.AuthClient.ServiceTokenRequest;
import com.raicescriollas.pedidos.client.AuthClient.ServiceTokenResponse;

//Token de servicio, se pide a Auth la primera vez que hace falta y se reutiliza hasta que vence
@Component
public class ServiceTokenProvider {

	private static final String SERVICE_NAME = "pedidos-service";
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
		if (token == null || Instant.now().isAfter(venceEn))
			renovar();
		return "Bearer " + token;
	}

	// Menu rechazo el token (vencio antes de tiempo o Auth roto la clave), el próximo bearer() pide uno nuevo
	public synchronized void invalidar() {
		token = null;
	}

	private void renovar() {
		ServiceTokenResponse r = auth.obtenerToken(new ServiceTokenRequest(SERVICE_NAME, secret));
		token = r.accessToken();
		venceEn = Instant.now().plusSeconds(Math.max(r.expiresIn() - MARGEN_SEGUNDOS, 0));
	}
}

