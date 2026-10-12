package com.raicescriollas.payment.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.raicescriollas.payment.utils.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PagoNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(PagoNotFoundException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IdempotencyKeyInUseException.class)
    public ResponseEntity<ApiResponse<?>> handleIdempotencyConflict(IdempotencyKeyInUseException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ApiResponse<?>> handleMissingHeader(MissingRequestHeaderException ex) {
        return new ResponseEntity<>(
                new ApiResponse<>(false, "Falta el header obligatorio: " + ex.getHeaderName(), null),
                HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> errores.put(e.getField(), e.getDefaultMessage()));

        return new ResponseEntity<>(new ApiResponse<>(false, "Errores de validacion", errores), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(PasarelaPagoException.class)
    public ResponseEntity<ApiResponse<?>> handlePasarela(PasarelaPagoException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(PedidoNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handlePedidoNotFound(PedidoNotFoundException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PedidoNoPagableException.class)
    public ResponseEntity<ApiResponse<?>> handlePedidoNoPagable(PedidoNoPagableException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ServicioNoDisponibleException.class)
    public ResponseEntity<ApiResponse<?>> handleServicioNoDisponible(ServicioNoDisponibleException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage(), null), HttpStatus.SERVICE_UNAVAILABLE);
    }
}
