package com.raicescriollas.pedidos.exception;

import com.raicescriollas.pedidos.dto.ApiResponse;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.NoSuchElementException;


@RestControllerAdvice
public class ApiExceptionHandler {
	
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<Void>> invalid(IllegalArgumentException e) {
		return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
	}

	// Transicion de estado no permitida, cancelar un pedido que ya no esta recien registrado...
	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiResponse<Void>> conflict(IllegalStateException e) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiResponse<>(false, e.getMessage(), null));
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiResponse<Void>> missing(NoSuchElementException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, e.getMessage(), null));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> validation(MethodArgumentNotValidException e) {
		return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Datos de entrada invalidos", null));
	}

	// Cuerpo ilegible, p. ej. un estado que no existe en el enum
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResponse<Void>> unreadable(HttpMessageNotReadableException e) {
		return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Cuerpo de la peticion invalido", null));
	}

	@ExceptionHandler(FeignException.NotFound.class)
	public ResponseEntity<ApiResponse<Void>> menuMissing(FeignException.NotFound e) {
		return ResponseEntity.badRequest()
				.body(new ApiResponse<>(false, "El plato no existe o no esta disponible en Menu", null));
	}

	@ExceptionHandler(FeignException.class)
	public ResponseEntity<ApiResponse<Void>> menuError(FeignException e) {
		return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
				.body(new ApiResponse<>(false, "No se pudo consultar el microservicio Menu", null));
	}
}
