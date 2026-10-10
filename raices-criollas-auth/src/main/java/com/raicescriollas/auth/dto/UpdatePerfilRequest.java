package com.raicescriollas.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePerfilRequest(
		@NotBlank @Size(max = 100) String nombre,
        @NotBlank @Size(max = 100) String apellido,
        @Pattern(regexp = "^[0-9+()\\-\\s]{6,20}$", message = "Teléfono no válido") String telefono
		) {

}
