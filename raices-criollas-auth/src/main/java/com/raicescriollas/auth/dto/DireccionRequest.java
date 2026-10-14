package com.raicescriollas.auth.dto;

import com.raicescriollas.auth.utils.Validaciones;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DireccionRequest(
		@NotBlank(message = "Escribe la dirección") @Size(max = 200) String direccion,
		@NotBlank(message = "Escribe el distrito") @Size(max = 100) 
		@Pattern(regexp = Validaciones.NOMBRE, message = "Solo letras y espacios")String distrito,
		@Size(max = 200) String referencia,
		@NotBlank(message = "Escribe un teléfono de contacto")
		@Pattern(regexp = Validaciones.TELEFONO, message = "Celular no válido: 9 dígitos que empiecen con 9") String telefono
		) {

}
