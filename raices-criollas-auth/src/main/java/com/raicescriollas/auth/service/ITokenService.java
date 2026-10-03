package com.raicescriollas.auth.service;

import com.raicescriollas.auth.entity.Usuario;

public interface ITokenService {
	String generateAccessToken(Usuario usuario);
    long accessTokenTtlSeconds();
}
