package com.raicescriollas.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
		@NotBlank String passwordActual,
        @NotBlank @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres") String passwordNueva
		
		) {

}
