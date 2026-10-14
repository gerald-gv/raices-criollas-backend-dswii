package com.raicescriollas.auth.dto;

import com.raicescriollas.auth.utils.Validaciones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePerfilRequest(
		@NotBlank(message = "Escribe tu nombre") @Size(max = 100)
		@Pattern(regexp = Validaciones.NOMBRE, message = "Solo letras y espacios") String nombre,
		@NotBlank(message = "Escribe tu apellido") @Size(max = 100)
		@Pattern(regexp = Validaciones.NOMBRE, message = "Solo letras y espacios") String apellido,
		@Pattern(regexp = Validaciones.TELEFONO, message = "Celular no válido: 9 dígitos que empiecen con 9") String telefono
		) {

}
