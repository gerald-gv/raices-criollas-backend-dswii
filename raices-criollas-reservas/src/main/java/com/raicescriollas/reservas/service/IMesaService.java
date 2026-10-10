package com.raicescriollas.reservas.service;

import java.time.LocalDateTime;
import java.util.List;

import com.raicescriollas.reservas.dto.MesaRequestDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;

public interface IMesaService {

    List<MesaResponseDTO> listarDisponibles(LocalDateTime fechaInicio, LocalDateTime fechaFin, Integer cantidadPersonas);

    MesaResponseDTO crearMesa(MesaRequestDTO dto);

    List<MesaResponseDTO> listarTodas();

    MesaResponseDTO obtenerPorId(Long id);

    MesaResponseDTO actualizarMesa(Long id, MesaRequestDTO dto);

    MesaResponseDTO cambiarEstado(Long id, Boolean activo);
}
