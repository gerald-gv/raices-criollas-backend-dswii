package com.raicescriollas.auth.service;

import com.raicescriollas.auth.dto.LoginRequest;
import com.raicescriollas.auth.dto.RegisterRequest;
import com.raicescriollas.auth.dto.TokenResponse;

public interface IAuthService {
    TokenResponse register(RegisterRequest request);
    TokenResponse login(LoginRequest request);
}