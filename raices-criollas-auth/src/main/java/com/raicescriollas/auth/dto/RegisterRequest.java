package com.raicescriollas.auth.dto;

import com.raicescriollas.auth.utils.Validaciones;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank @Size(max = 100) 
		@Pattern(regexp = Validaciones.NOMBRE, message = "Solo letras y espacios") String nombre,
		@NotBlank(message = "Escribe tu apellido") @Size(max = 100)
		@Pattern(regexp = Validaciones.NOMBRE, message = "Solo letras y espacios") String apellido,
		@NotBlank(message = "Escribe tu correo") @Email(message = "Correo no válido") @Size(max = 150)
		@Pattern(regexp = Validaciones.EMAIL, message = "Correo no válido") String email,
		@Pattern(regexp = Validaciones.TELEFONO, message = "Celular no válido: 9 dígitos que empiecen con 9") String telefono,
        @NotBlank @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres") String password
		) {
	
}
