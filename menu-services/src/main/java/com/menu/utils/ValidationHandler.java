package com.menu.utils;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

@RestControllerAdvice
public class ValidationHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationErrors(
            MethodArgumentNotValidException e) {

        Map<String, String> errores = new HashMap<>();

        e.getBindingResult().getFieldErrors().forEach(error -> {
            errores.put(error.getField(), error.getDefaultMessage());
        });

        ApiResponse<Map<String, String>> response =
                new ApiResponse<>(
                        false,
                        "Errores de validacion",
                        errores
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(ModeloNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> manejarModeloNotFoundException(
            ModeloNotFoundException ex,
            WebRequest request) {

        ApiResponse<String> response =
                new ApiResponse<>(
                        false,
                        ex.getMessage(),
                        null
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<?>> handleBusinessException(
            BusinessException ex) {

        ApiResponse<String> response =
                new ApiResponse<>(
                        false,
                        ex.getMessage(),
                        null
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(
            Exception ex) {

        ApiResponse<String> response =
                new ApiResponse<>(
                        false,
                        "Error interno del servidor",
                        ex.getMessage()
                );

        return new ResponseEntity<>(
                response,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}