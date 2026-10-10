package com.raicescriollas.auth.service;

import com.raicescriollas.auth.dto.ChangePasswordRequest;
import com.raicescriollas.auth.dto.UpdatePerfilRequest;
import com.raicescriollas.auth.dto.UsuarioResponse;

public interface IPerfilService {
    UsuarioResponse obtener(Long userId);
    UsuarioResponse actualizar(Long userId, UpdatePerfilRequest request);
    void cambiarPassword(Long userId, ChangePasswordRequest request);
}