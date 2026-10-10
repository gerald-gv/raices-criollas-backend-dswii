package com.raicescriollas.reservas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.reservas.dto.MesaRequestDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.entity.Mesa;
import com.raicescriollas.reservas.enums.EstadoReserva;
import com.raicescriollas.reservas.exception.BusinessException;
import com.raicescriollas.reservas.exception.ResourceNotFoundException;
import com.raicescriollas.reservas.repository.MesaRepository;
import com.raicescriollas.reservas.service.IMesaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MesaServiceImpl implements IMesaService {

    private final MesaRepository mesaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MesaResponseDTO> listarDisponibles(LocalDateTime fechaInicio, LocalDateTime fechaFin, Integer cantidadPersonas) {
        if (fechaInicio == null || fechaFin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias");
        }
        if (!fechaInicio.isBefore(fechaFin)) {
            throw new BusinessException("La fecha de inicio debe ser anterior a la fecha de finalización");
        }
        if (fechaInicio.isBefore(LocalDateTime.now())) {
            throw new BusinessException("No se puede consultar disponibilidad en fechas u horas pasadas");
        }
        if (cantidadPersonas == null || cantidadPersonas <= 0) {
            throw new BusinessException("La cantidad de personas debe ser mayor que cero");
        }

        List<EstadoReserva> estadosBloqueantes = List.of(EstadoReserva.PENDIENTE, EstadoReserva.CONFIRMADA);
        return mesaRepository.findMesasDisponibles(cantidadPersonas, fechaInicio, fechaFin, estadosBloqueantes)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public MesaResponseDTO crearMesa(MesaRequestDTO dto) {
        if (mesaRepository.existsByNumeroMesa(dto.getNumeroMesa())) {
            throw new BusinessException("Ya existe una mesa registrada con el número: " + dto.getNumeroMesa());
        }
        if (dto.getCapacidad() == null || dto.getCapacidad() <= 0) {
            throw new BusinessException("La capacidad máxima debe ser mayor que cero");
        }

        Mesa mesa = Mesa.builder()
                .numeroMesa(dto.getNumeroMesa().trim())
                .capacidad(dto.getCapacidad())
                .ubicacion(dto.getUbicacion())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return toDTO(mesaRepository.save(mesa));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MesaResponseDTO> listarTodas() {
        return mesaRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MesaResponseDTO obtenerPorId(Long id) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + id));
        return toDTO(mesa);
    }

    @Override
    @Transactional
    public MesaResponseDTO actualizarMesa(Long id, MesaRequestDTO dto) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + id));

        if (mesaRepository.existsByNumeroMesaAndIdNot(dto.getNumeroMesa(), id)) {
            throw new BusinessException("Ya existe otra mesa registrada con el número: " + dto.getNumeroMesa());
        }
        if (dto.getCapacidad() == null || dto.getCapacidad() <= 0) {
            throw new BusinessException("La capacidad máxima debe ser mayor que cero");
        }

        mesa.setNumeroMesa(dto.getNumeroMesa().trim());
        mesa.setCapacidad(dto.getCapacidad());
        mesa.setUbicacion(dto.getUbicacion());
        if (dto.getActivo() != null) {
            mesa.setActivo(dto.getActivo());
        }

        return toDTO(mesaRepository.save(mesa));
    }

    @Override
    @Transactional
    public MesaResponseDTO cambiarEstado(Long id, Boolean activo) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + id));

        mesa.setActivo(activo);
        return toDTO(mesaRepository.save(mesa));
    }

    private MesaResponseDTO toDTO(Mesa mesa) {
        if (mesa == null) {
            return null;
        }
        return MesaResponseDTO.builder()
                .id(mesa.getId())
                .numeroMesa(mesa.getNumeroMesa())
                .capacidad(mesa.getCapacidad())
                .ubicacion(mesa.getUbicacion())
                .activo(mesa.getActivo())
                .build();
    }
}
