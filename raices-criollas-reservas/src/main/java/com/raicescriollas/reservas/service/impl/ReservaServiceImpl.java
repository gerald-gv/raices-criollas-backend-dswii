package com.raicescriollas.reservas.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.reservas.dto.CotizacionRequestDTO;
import com.raicescriollas.reservas.dto.CotizacionResponseDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.dto.ReservaRequestDTO;
import com.raicescriollas.reservas.dto.ReservaResponseDTO;
import com.raicescriollas.reservas.entity.Mesa;
import com.raicescriollas.reservas.entity.Reserva;
import com.raicescriollas.reservas.enums.EstadoPago;
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

    @Value("${app.reservas.tiempo-expiracion-minutos:15}")
    private long tiempoExpiracionMinutos = 15;

    @Value("${app.reservas.tarifa-base-mesa-default:20.00}")
    private BigDecimal tarifaBaseMesaDefault = new BigDecimal("20.00");

    @Value("${app.reservas.tarifa-por-persona-default:5.00}")
    private BigDecimal tarifaPorPersonaDefault = new BigDecimal("5.00");

    @Override
    @Transactional(readOnly = true)
    public CotizacionResponseDTO cotizarReserva(CotizacionRequestDTO dto) {
        if (dto.getMesaId() == null) {
            throw new IllegalArgumentException("El identificador de mesa es obligatorio");
        }
        Mesa mesa = mesaRepository.findById(dto.getMesaId())
                .orElseThrow(() -> new ResourceNotFoundException("Mesa no encontrada con ID: " + dto.getMesaId()));

        return calcularCotizacion(mesa, dto.getFechaInicio(), dto.getFechaFin(), dto.getCantidadPersonas());
    }

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

        LocalDateTime ahora = LocalDateTime.now();

        // Detección de solapamiento considerando reservas CONFIRMADAS o PENDIENTES NO EXPIRADAS
        boolean solapada = reservaRepository.existsOverlappingReservations(
                mesa.getId(),
                dto.getFechaInicio(),
                dto.getFechaFin(),
                ahora,
                null
        );

        if (solapada) {
            throw new BusinessException("La mesa no está disponible para el intervalo de tiempo seleccionado");
        }

        // Cálculo formal del precio en el backend (el cliente no puede manipular el importe)
        CotizacionResponseDTO cotizacion = calcularCotizacion(mesa, dto.getFechaInicio(), dto.getFechaFin(), dto.getCantidadPersonas());

        // La reserva nace en estado PENDIENTE de pago con fecha de expiración temporal
        LocalDateTime fechaExpiracion = ahora.plusMinutes(tiempoExpiracionMinutos);

        Reserva reserva = Reserva.builder()
                .clienteId(clienteId)
                .mesa(mesa)
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .cantidadPersonas(dto.getCantidadPersonas())
                .montoTotal(cotizacion.getMontoTotal())
                .moneda(cotizacion.getMoneda())
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .fechaExpiracionPago(fechaExpiracion)
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
        if (reserva.getEstadoPago() == EstadoPago.PENDIENTE) {
            reserva.setEstadoPago(EstadoPago.FALLIDO);
        }

        return toDTO(reservaRepository.save(reserva));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservaResponseDTO> listarTodas(Long mesaId, EstadoReserva estado, EstadoPago estadoPago, LocalDateTime desde, LocalDateTime hasta) {
        return reservaRepository.findWithFilters(mesaId, estado, estadoPago, desde, hasta)
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
    public ReservaResponseDTO cambiarEstado(Long id, EstadoReserva nuevoEstado, EstadoPago nuevoEstadoPago) {
        if (nuevoEstado == null && nuevoEstadoPago == null) {
            throw new IllegalArgumentException("Debe proporcionar al menos un estado a actualizar");
        }

        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva no encontrada con ID: " + id));

        LocalDateTime ahora = LocalDateTime.now();

        // Si se reactiva a CONFIRMADA o PENDIENTE desde CANCELADA, validar disponibilidad
        if (nuevoEstado != null && (nuevoEstado == EstadoReserva.CONFIRMADA || nuevoEstado == EstadoReserva.PENDIENTE)
                && reserva.getEstado() == EstadoReserva.CANCELADA) {
            boolean solapada = reservaRepository.existsOverlappingReservations(
                    reserva.getMesa().getId(),
                    reserva.getFechaInicio(),
                    reserva.getFechaFin(),
                    ahora,
                    reserva.getId()
            );
            if (solapada) {
                throw new BusinessException("No se puede reactivar la reserva porque el horario ya está ocupado por otra reserva");
            }
        }

        if (nuevoEstado != null) {
            reserva.setEstado(nuevoEstado);
        }

        if (nuevoEstadoPago != null) {
            // Protección contra pagos tardíos en reservas expiradas
            if (nuevoEstadoPago == EstadoPago.PAGADO) {
                if (reserva.getFechaExpiracionPago() != null 
                        && reserva.getFechaExpiracionPago().isBefore(ahora) 
                        && reserva.getEstado() == EstadoReserva.PENDIENTE) {
                    throw new BusinessException("La reserva ha expirado y no puede confirmarse como pagada");
                }
                reserva.setEstado(EstadoReserva.CONFIRMADA);
            }
            reserva.setEstadoPago(nuevoEstadoPago);
        }

        return toDTO(reservaRepository.save(reserva));
    }

    @Override
    @Transactional
    public ReservaResponseDTO cambiarEstado(Long id, EstadoReserva nuevoEstado) {
        return cambiarEstado(id, nuevoEstado, null);
    }

    private CotizacionResponseDTO calcularCotizacion(Mesa mesa, LocalDateTime inicio, LocalDateTime fin, Integer personas) {
        if (inicio == null || fin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin son obligatorias");
        }
        if (!inicio.isBefore(fin)) {
            throw new BusinessException("La fecha de inicio debe ser anterior a la fecha de finalización");
        }
        if (inicio.isBefore(LocalDateTime.now())) {
            throw new BusinessException("No se puede realizar una reserva en una fecha u hora pasada");
        }
        if (personas == null || personas <= 0) {
            throw new BusinessException("La cantidad de personas debe ser mayor que cero");
        }

        // Modelo de precios: Tarifa base de mesa + (Tarifa por persona * cantidad de personas)
        BigDecimal tarifaBase = (mesa.getPrecioBase() != null ? mesa.getPrecioBase() : tarifaBaseMesaDefault)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal tarifaPersona = tarifaPorPersonaDefault.setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotalPersonas = tarifaPersona.multiply(BigDecimal.valueOf(personas)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal montoTotal = tarifaBase.add(subtotalPersonas).setScale(2, RoundingMode.HALF_UP);

        if (montoTotal.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El importe total de la reserva no puede ser negativo");
        }

        long duracionMinutos = Duration.between(inicio, fin).toMinutes();

        String desglose = String.format(
                "Tarifa base de mesa: S/ %.2f + %d personas a S/ %.2f c/u: S/ %.2f",
                tarifaBase, personas, tarifaPersona, subtotalPersonas
        );

        boolean disponible = true;
        String mensaje = "Mesa disponible para cotización";

        if (Boolean.FALSE.equals(mesa.getActivo())) {
            disponible = false;
            mensaje = "La mesa seleccionada se encuentra inactiva y no admite reservas";
        } else if (personas > mesa.getCapacidad()) {
            disponible = false;
            mensaje = String.format(
                    "La cantidad de personas (%d) supera la capacidad máxima de la mesa (%d)",
                    personas, mesa.getCapacidad()
            );
        } else {
            boolean solapada = reservaRepository.existsOverlappingReservations(
                    mesa.getId(),
                    inicio,
                    fin,
                    LocalDateTime.now(),
                    null
            );
            if (solapada) {
                disponible = false;
                mensaje = "La mesa no está disponible para el intervalo de tiempo seleccionado";
            }
        }

        return CotizacionResponseDTO.builder()
                .mesaId(mesa.getId())
                .numeroMesa(mesa.getNumeroMesa())
                .capacidadMesa(mesa.getCapacidad())
                .cantidadPersonas(personas)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .duracionMinutos(duracionMinutos)
                .moneda("PEN")
                .precioBaseMesa(tarifaBase)
                .tarifaBaseMesa(tarifaBase)
                .tarifaPorPersona(tarifaPersona)
                .subtotalPersonas(subtotalPersonas)
                .montoTotal(montoTotal)
                .disponible(disponible)
                .mensaje(mensaje)
                .desglose(desglose)
                .build();
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
                    .precioBase(m.getPrecioBase())
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
                .montoTotal(reserva.getMontoTotal())
                .moneda(reserva.getMoneda())
                .estado(reserva.getEstado())
                .estadoPago(reserva.getEstadoPago())
                .fechaCreacion(reserva.getFechaCreacion())
                .fechaExpiracionPago(reserva.getFechaExpiracionPago())
                .observaciones(reserva.getObservaciones())
                .fechaActualizacion(reserva.getFechaActualizacion())
                .build();
    }
}
