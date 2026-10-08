package com.raicescriollas.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.auth.dto.LoginRequest;
import com.raicescriollas.auth.dto.RegisterRequest;
import com.raicescriollas.auth.dto.TokenResponse;
import com.raicescriollas.auth.service.IAuthService;
import com.raicescriollas.auth.utils.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
 
    private final IAuthService authService;
 
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<TokenResponse>> register(@Valid @RequestBody RegisterRequest request) {
 
        TokenResponse token = authService.register(request);
 
        return new ResponseEntity<>( new ApiResponse<>(true, "Usuario registrado correctamente", token),HttpStatus.CREATED);
    }
 
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login( @Valid @RequestBody LoginRequest request) {
 
        TokenResponse token = authService.login(request);
 
        return ResponseEntity.ok(new ApiResponse<>(true, "Inicio de sesion exitoso", token));
    }
}