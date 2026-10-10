package com.raicescriollas.reservas.service;

import java.time.LocalDateTime;
import java.util.List;

import com.raicescriollas.reservas.dto.ReservaRequestDTO;
import com.raicescriollas.reservas.dto.ReservaResponseDTO;
import com.raicescriollas.reservas.enums.EstadoReserva;

public interface IReservaService {

    ReservaResponseDTO crearReserva(ReservaRequestDTO dto, Long clienteId);

    List<ReservaResponseDTO> listarMisReservas(Long clienteId);

    ReservaResponseDTO obtenerMiReserva(Long id, Long clienteId);

    ReservaResponseDTO cancelarMiReserva(Long id, Long clienteId);

    List<ReservaResponseDTO> listarTodas(Long mesaId, EstadoReserva estado, LocalDateTime desde, LocalDateTime hasta);

    ReservaResponseDTO obtenerPorId(Long id, Long clienteId, boolean isAdmin);

    ReservaResponseDTO cambiarEstado(Long id, EstadoReserva nuevoEstado);
}
