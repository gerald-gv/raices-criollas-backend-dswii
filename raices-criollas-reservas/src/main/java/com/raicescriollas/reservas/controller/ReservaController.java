package com.raicescriollas.reservas.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.reservas.dto.ActualizarEstadoReservaDTO;
import com.raicescriollas.reservas.dto.ReservaRequestDTO;
import com.raicescriollas.reservas.dto.ReservaResponseDTO;
import com.raicescriollas.reservas.enums.EstadoReserva;
import com.raicescriollas.reservas.service.IReservaService;
import com.raicescriollas.reservas.utils.ApiResponse;
import com.raicescriollas.reservas.utils.SecurityUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final IReservaService reservaService;

    // Crear una reserva para el cliente autenticado (el ID se extrae del JWT)
    @PostMapping
    public ResponseEntity<ApiResponse<ReservaResponseDTO>> crearReserva(@Valid @RequestBody ReservaRequestDTO dto) {
        Long clienteId = SecurityUtils.getCurrentUserId();
        ReservaResponseDTO reserva = reservaService.crearReserva(dto, clienteId);
        return new ResponseEntity<>(new ApiResponse<>(true, "Reserva creada exitosamente", reserva), HttpStatus.CREATED);
    }

    // Consultar el historial de reservas del cliente autenticado
    @GetMapping("/mis-reservas")
    public ResponseEntity<ApiResponse<List<ReservaResponseDTO>>> listarMisReservas() {
        Long clienteId = SecurityUtils.getCurrentUserId();
        List<ReservaResponseDTO> misReservas = reservaService.listarMisReservas(clienteId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Historial de reservas obtenido exitosamente", misReservas));
    }

    // Consultar una reserva propia por ID
    @GetMapping("/mis-reservas/{id}")
    public ResponseEntity<ApiResponse<ReservaResponseDTO>> obtenerMiReserva(@PathVariable Long id) {
        Long clienteId = SecurityUtils.getCurrentUserId();
        ReservaResponseDTO reserva = reservaService.obtenerMiReserva(id, clienteId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reserva obtenida exitosamente", reserva));
    }

    // Cancelar una reserva propia
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse<ReservaResponseDTO>> cancelarMiReserva(@PathVariable Long id) {
        Long clienteId = SecurityUtils.getCurrentUserId();
        ReservaResponseDTO reserva = reservaService.cancelarMiReserva(id, clienteId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reserva cancelada exitosamente", reserva));
    }

    // Consultar todas las reservas con filtros (solo ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ReservaResponseDTO>>> listarTodas(
            @RequestParam(required = false) Long mesaId,
            @RequestParam(required = false) EstadoReserva estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta
    ) {
        List<ReservaResponseDTO> reservas = reservaService.listarTodas(mesaId, estado, desde, hasta);
        return ResponseEntity.ok(new ApiResponse<>(true, "Listado de reservas obtenido exitosamente", reservas));
    }

    // Consultar una reserva respetando permisos (ADMIN puede ver cualquiera; CLIENTE solo la suya)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReservaResponseDTO>> obtenerPorId(@PathVariable Long id) {
        Long clienteId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isAdmin();
        ReservaResponseDTO reserva = reservaService.obtenerPorId(id, clienteId, isAdmin);
        return ResponseEntity.ok(new ApiResponse<>(true, "Reserva obtenida exitosamente", reserva));
    }

    // Cambiar estado de una reserva (solo ADMIN)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<ReservaResponseDTO>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoReservaDTO dto
    ) {
        ReservaResponseDTO reserva = reservaService.cambiarEstado(id, dto.getEstado());
        return ResponseEntity.ok(new ApiResponse<>(true, "Estado de la reserva actualizado exitosamente", reserva));
    }
}
