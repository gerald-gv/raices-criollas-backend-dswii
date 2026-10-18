package com.raicescriollas.payment.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@FeignClient(name = "raices-criollas-pedidos")
public interface PedidoClient {

    @GetMapping("/pedidos/{id}")
    PedidoApiResponse obtenerPedido(@PathVariable("id") Long id,
                                    @RequestHeader("Authorization") String authorization);

    @PutMapping("/pedidos/interno/{id}/pagado")
    void marcarPagado(@PathVariable("id") Long id,
                      @RequestHeader("Authorization") String authorization);

    record PedidoApiResponse(boolean success, String mensaje, PedidoData data) {
    }

    record PedidoData(Long id, Long clienteId, LocalDateTime fecha, String estado, BigDecimal total) {
    }

}
