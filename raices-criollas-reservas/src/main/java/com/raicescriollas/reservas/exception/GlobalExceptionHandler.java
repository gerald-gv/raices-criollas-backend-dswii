package com.raicescriollas.reservas.exception;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.raicescriollas.reservas.utils.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 400 - Errores de validación de campos (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));

        return new ResponseEntity<>(
                new ApiResponse<>(false, "Errores de validacion", errores),
                HttpStatus.BAD_REQUEST
        );
    }

    // 400 - Argumentos ilegales o formatos inválidos
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, ex.getMessage(), null),
                HttpStatus.BAD_REQUEST
        );
    }

    // 400 - JSON mal formado o tipos no coincidentes
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, "Formato de solicitud inválido o cuerpo no legible", null),
                HttpStatus.BAD_REQUEST
        );
    }

    // 401 - Problemas de autenticación
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, "Autenticación requerida o token inválido", null),
                HttpStatus.UNAUTHORIZED
        );
    }

    // 403 - Permisos insuficientes (evita convertirse en 500)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, "No tiene permisos para acceder a este recurso", null),
                HttpStatus.FORBIDDEN
        );
    }

    // 404 - Recurso no encontrado
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, ex.getMessage(), null),
                HttpStatus.NOT_FOUND
        );
    }

    // 409 - Conflicto de reglas de negocio (mesa ocupada, capacidad superada, etc.)
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusiness(BusinessException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, ex.getMessage(), null),
                HttpStatus.CONFLICT
        );
    }

    // 500 - Error inesperado seguro (sin exponer detalles internos, SQL ni trazas)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception ex) {
        log.error("Error inesperado en microservicio de Reservas: ", ex);
        return new ResponseEntity<>(
                new ApiResponse<>(false, "Ha ocurrido un error inesperado en el servidor", null),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
