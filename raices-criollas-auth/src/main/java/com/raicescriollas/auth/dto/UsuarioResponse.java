package com.raicescriollas.auth.dto;

import java.time.Instant;

import com.raicescriollas.auth.entity.Usuario;

public record UsuarioResponse(Long id, String nombre, String apellido, String email,
        String telefono, String rol, Instant creadoEn) {
	
	public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getApellido(), u.getEmail(),
                u.getTelefono(), u.getRol().getNombre(), u.getCreatedAt());
    }
}
