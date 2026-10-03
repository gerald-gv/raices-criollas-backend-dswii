package com.raicescriollas.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @NotBlank @Email @Size(max = 150) String email,
        @Size(max = 20) String telefono,
        @NotBlank @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres") String password
		) {
	
}
