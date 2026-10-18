package com.raicescriollas.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@FeignClient(name = "raices-criollas-reservas")
public interface ReservaClient {

    @GetMapping("/reservas/{id}")
    ReservaApiResponse obtenerReserva(@PathVariable("id") Long id,
                                      @RequestHeader("Authorization") String authorization);

    @PutMapping("/reservas/interno/{id}/pagado")
    void marcarPagada(@PathVariable("id") Long id,
                      @RequestHeader("Authorization") String authorization);

    record ReservaApiResponse(boolean success, String mensaje, ReservaData data) {
    }

    record ReservaData(Long id,
                       Long clienteId,
                       BigDecimal montoTotal,
                       String moneda,
                       String estado,
                       String estadoPago,
                       LocalDateTime fechaExpiracionPago) {
    }
}