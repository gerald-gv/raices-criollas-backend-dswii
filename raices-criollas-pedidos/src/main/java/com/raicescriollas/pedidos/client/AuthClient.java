package com.raicescriollas.pedidos.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "raices-criollas-auth")
public interface AuthClient {

	@GetMapping("/api/auth/me")
	PerfilResponse perfil(@RequestHeader("Authorization") String bearer);

	record PerfilResponse(boolean success, String mensaje, PerfilData data) {}

	record PerfilData(Long id, String telefono, String direccion, String distrito, String referencia) {}
}
