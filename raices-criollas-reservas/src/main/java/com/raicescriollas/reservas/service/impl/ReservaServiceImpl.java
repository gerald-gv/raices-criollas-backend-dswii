package com.raicescriollas.reservas.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.dto.ReservaRequestDTO;
import com.raicescriollas.reservas.dto.ReservaResponseDTO;
import com.raicescriollas.reservas.entity.Mesa;
import com.raicescriollas.reservas.entity.Reserva;
import com.raicescriollas.reservas.enums.EstadoReserva;
import com.raicescriollas.reservas.exception.BusinessException;
import com.raicescriollas.reservas.exception.ResourceNotFoundException;
import com.raicescriollas.reservas.repository.MesaRepository;
import com.raicescriollas.reservas.repository.ReservaRepository;
import com.raicescriollas.reservas.service.IReservaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservaServiceImpl implements IReservaService {

    private final ReservaRepository reservaRepository;
    private final MesaRepository mesaRepository;

    private static final List<EstadoReserva> ESTADOS_BLOQUEANTES = List.of(
            EstadoReserva.PENDIENTE,
            EstadoReserva.CONFIRMADA
    );

    @Override
    @Transactional
    public ReservaResponseDTO crearReserva(ReservaRequestDTO dto, Long clienteId) {
        if (clienteId == null) {
            throw new AccessDeniedException("Identificador de cliente no válido");
        }
        if (dto.getFechaInicio() == null || dto.getFechaFin() == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias");
        }
        if (!dto.getFechaInicio().isBefore(dto.getFechaFin())) {
            throw new BusinessException("La fecha de inicio debe ser anterior a la fecha de finalización");
        }
        if (dto.getFechaInicio().isBefore(LocalDateTime.now())) {
            throw new BusinessException("No se puede realizar una reserva en una fecha u hora pasada");
        }
        if (dto.getCantidadPersonas() == null || dto.getCantidadPersonas() <= 0) {
            throw new BusinessException("La cantidad de personas debe ser mayor que cero");
        }

        // Bloqueo pesimista para evitar condiciones de carrera al reservar concurrentemente
        Mesa mesa = mesaRepository.findByIdWithLock(dto.getMesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + dto.getMesaId()));

        if (Boolean.FALSE.equals(mesa.getActivo())) {
            throw new BusinessException("La mesa seleccionada se encuentra inactiva y no admite reservas");
        }

        if (dto.getCantidadPersonas() > mesa.getCapacidad()) {
            throw new BusinessException(String.format(
                    "La cantidad de personas (%d) supera la capacidad máxima de la mesa (%d)",
                    dto.getCantidadPersonas(), mesa.getCapacidad()
            ));
        }

        // Detección de solapamientos: reservaExistente.inicio < nuevoFin && reservaExistente.fin > nuevoInicio
        boolean solapada = reservaRepository.existsOverlappingReservations(
                mesa.getId(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                ESTADOS_BLOQUEANTES,
                null
        );

        if (solapada) {
            throw new BusinessException("La mesa no está disponible para el intervalo de tiempo seleccionado");
        }

        Reserva reserva = Reserva.builder()
                .clienteId(clienteId)
                .mesa(mesa)
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .cantidadPersonas(dto.getCantidadPersonas())
                .estado(EstadoReserva.CONFIRMADA)
                .observaciones(dto.getObservaciones())
                .build();

        return toDTO(reservaRepository.save(reserva));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarMisReservas(Long clienteId) {
        if (clienteId == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        return reservaRepository.findByClienteIdOrderByFechaInicioDesc(clienteId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservaResponseDTO obtenerMiReserva(Long id, Long clienteId) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        if (!reserva.getClienteId().equals(clienteId)) {
            throw new AccessDeniedException("No tiene permisos para consultar esta reserva");
        }

        return toDTO(reserva);
    }

    @Override
    @Transactional
    public ReservaResponseDTO cancelarMiReserva(Long id, Long clienteId) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        if (!reserva.getClienteId().equals(clienteId)) {
            throw new AccessDeniedException("No tiene permisos para cancelar esta reserva");
        }

        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new BusinessException("La reserva ya se encuentra cancelada");
        }
        if (reserva.getEstado() == EstadoReserva.COMPLETADA) {
            throw new BusinessException("No se puede cancelar una reserva que ya ha sido completada");
        }
        if (reserva.getFechaInicio().isBefore(LocalDateTime.now())) {
            throw new BusinessException("No se puede cancelar una reserva cuya fecha y hora ya ha iniciado o pasado");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        return toDTO(reservaRepository.save(reserva));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas(Long mesaId, EstadoReserva estado, LocalDateTime desde, LocalDateTime hasta) {
        return reservaRepository.findWithFilters(mesaId, estado, desde, hasta)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReservaResponseDTO obtenerPorId(Long id, Long clienteId, boolean isAdmin) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        if (!isAdmin && !reserva.getClienteId().equals(clienteId)) {
            throw new AccessDeniedException("No tiene permisos para consultar esta reserva");
        }

        return toDTO(reserva);
    }

    @Override
    @Transactional
    public ReservaResponseDTO cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        if (nuevoEstado == null) {
            throw new IllegalArgumentException("El nuevo estado no puede ser nulo");
        }

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        // Si se reactiva una reserva cancelada a pendiente o confirmada, validar que no se solape
        if ((nuevoEstado == EstadoReserva.CONFIRMADA || nuevoEstado == EstadoReserva.PENDIENTE)
                && reserva.getEstado() == EstadoReserva.CANCELADA) {
            boolean solapada = reservaRepository.existsOverlappingReservations(
                    reserva.getMesa().getId(),
                    reserva.getFechaInicio(),
                    reserva.getFechaFin(),
                    ESTADOS_BLOQUEANTES,
                    reserva.getId()
            );
            if (solapada) {
                throw new BusinessException("No se puede reactivar la reserva porque el horario ya está ocupado por otra reserva");
            }
        }

        reserva.setEstado(nuevoEstado);
        return toDTO(reservaRepository.save(reserva));
    }

    private ReservaResponseDTO toDTO(Reserva reserva) {
        if (reserva == null) {
            return null;
        }

        MesaResponseDTO mesaDTO = null;
        if (reserva.getMesa() != null) {
            Mesa m = reserva.getMesa();
            mesaDTO = MesaResponseDTO.builder()
                    .id(m.getId())
                    .numeroMesa(m.getNumeroMesa())
                    .capacidad(m.getCapacidad())
                    .ubicacion(m.getUbicacion())
                    .activo(m.getActivo())
                    .build();
        }

        return ReservaResponseDTO.builder()
                .id(reserva.getId())
                .clienteId(reserva.getClienteId())
                .mesa(mesaDTO)
                .fechaInicio(reserva.getFechaInicio())
                .fechaFin(reserva.getFechaFin())
                .cantidadPersonas(reserva.getCantidadPersonas())
                .estado(reserva.getEstado())
                .observaciones(reserva.getObservaciones())
                .fechaCreacion(reserva.getFechaCreacion())
                .fechaActualizacion(reserva.getFechaActualizacion())
                .build();
    }
}
