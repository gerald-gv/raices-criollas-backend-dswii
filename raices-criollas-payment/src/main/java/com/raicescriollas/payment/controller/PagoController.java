package com.raicescriollas.payment.controller;

import com.raicescriollas.payment.dto.CrearPagoRequest;
import com.raicescriollas.payment.dto.PagoResponse;
import com.raicescriollas.payment.service.INotificacionService;
import com.raicescriollas.payment.service.IPagoService;
import com.raicescriollas.payment.utils.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final IPagoService pagoService;
    private final INotificacionService notificacionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PagoResponse>> crear(
            @Valid @RequestBody CrearPagoRequest request,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @AuthenticationPrincipal Jwt jwt
            ) {
        PagoResponse pago = pagoService.crear(request, usuarioId(jwt), idempotencyKey,
                "Bearer " + jwt.getTokenValue());

        return new ResponseEntity<>(new ApiResponse<>(true, "Pago creado correctamente", pago), HttpStatus.CREATED);

    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PagoResponse>> obtener(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        PagoResponse pago = pagoService.obtener(id, usuarioId(jwt));

        return ResponseEntity.ok(new ApiResponse<>(true, "Pago encontrado", pago));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PagoResponse>>> listarPorPedido(
            @RequestParam long pedidoId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        List<PagoResponse> pagos = pagoService.listarPorPedido(pedidoId, usuarioId(jwt));

        return ResponseEntity.ok(new ApiResponse<>(true, "Pagos del pedido", pagos));
    }

    @PostMapping("/{id}/sincronizar")
    public ResponseEntity<ApiResponse<PagoResponse>> sincronizar(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        pagoService.obtener(id, usuarioId(jwt));
        notificacionService.sincronizar(id);
        PagoResponse pago = pagoService.obtener(id, usuarioId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(true, "Pago sincronizado", pago));
    }

    private Long usuarioId(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
