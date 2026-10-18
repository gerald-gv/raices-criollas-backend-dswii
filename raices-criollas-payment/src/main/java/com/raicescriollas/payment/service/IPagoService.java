package com.raicescriollas.payment.service;

import com.raicescriollas.payment.dto.CrearPagoRequest;
import com.raicescriollas.payment.dto.PagoResponse;

import java.util.List;

public interface IPagoService {
    PagoResponse crear(CrearPagoRequest request, Long usuarioId, String idempotencyKey, String authorization);
    PagoResponse obtener(Long id, Long usuarioId);
    List<PagoResponse> listarPorPedido(Long pedidoId, Long usuarioId);
    PagoResponse reembolsar(Long id);
    List<PagoResponse> listarPorReserva(Long reservaId, Long usuarioId);
}
