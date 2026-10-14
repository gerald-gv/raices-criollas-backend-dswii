package com.raicescriollas.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.auth.dto.ChangePasswordRequest;
import com.raicescriollas.auth.dto.DireccionRequest;
import com.raicescriollas.auth.dto.UpdatePerfilRequest;
import com.raicescriollas.auth.dto.UsuarioResponse;
import com.raicescriollas.auth.service.IPerfilService;
import com.raicescriollas.auth.utils.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth/me")
@RequiredArgsConstructor
public class PerfilController {

    private final IPerfilService perfilService;

    @GetMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtener(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", perfilService.obtener(userId(jwt))));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizar(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UpdatePerfilRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Perfil actualizado", perfilService.actualizar(userId(jwt), request)));
    }

    @PutMapping("/direccion")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizarDireccion(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody DireccionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Dirección guardada", perfilService.actualizarDireccion(userId(jwt), request)));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordRequest request) {
        
    	perfilService.cambiarPassword(userId(jwt), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Contraseña actualizada", null));
    }

    private Long userId(Jwt jwt) { 
    	return Long.parseLong(jwt.getSubject());
    }
}