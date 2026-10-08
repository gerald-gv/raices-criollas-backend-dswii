package com.raicescriollas.auth.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.raicescriollas.auth.utils.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
 
    // Credenciales incorrectas, cuenta bloqueada o deshabilitada: mismo mensaje siempre
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse<?>> handleInvalidCredentials(InvalidCredentialsException ex) {
    	
        return new ResponseEntity<>( new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.UNAUTHORIZED);
    }
 
    @ExceptionHandler(EmailAlreadyUsedException.class)
    public ResponseEntity<ApiResponse<?>> handleEmailAlreadyUsed(EmailAlreadyUsedException ex) {
        return new ResponseEntity<>( new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.CONFLICT);
    }
 
    // Errores de @Valid: en "data"
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));
 
        return new ResponseEntity<>( new ApiResponse<>(false, "Errores de validacion", errores),HttpStatus.BAD_REQUEST);
    }
}