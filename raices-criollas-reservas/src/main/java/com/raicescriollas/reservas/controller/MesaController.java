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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.raicescriollas.reservas.dto.MesaEstadoRequestDTO;
import com.raicescriollas.reservas.dto.MesaRequestDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.service.IMesaService;
import com.raicescriollas.reservas.utils.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/mesas")
@RequiredArgsConstructor
public class MesaController {

    private final IMesaService mesaService;

    // Consulta pública de mesas disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<ApiResponse<List<MesaResponseDTO>>> listarDisponibles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaFin,
            @RequestParam Integer cantidadPersonas
    ) {
        List<MesaResponseDTO> mesas = mesaService.listarDisponibles(fechaInicio, fechaFin, cantidadPersonas);
        return ResponseEntity.ok(new ApiResponse<>(true, "Mesas disponibles consultadas exitosamente", mesas));
    }

    // Registrar una nueva mesa (solo ADMIN)
    @PostMapping
    public ResponseEntity<ApiResponse<MesaResponseDTO>> registrarMesa(@Valid @RequestBody MesaRequestDTO dto) {
        MesaResponseDTO mesa = mesaService.crearMesa(dto);
        return new ResponseEntity<>(new ApiResponse<>(true, "Mesa registrada exitosamente", mesa), HttpStatus.CREATED);
    }

    // Listar todas las mesas para administración (solo ADMIN)
    @GetMapping
    public ResponseEntity<ApiResponse<List<MesaResponseDTO>>> listarMesas() {
        List<MesaResponseDTO> mesas = mesaService.listarTodas();
        return ResponseEntity.ok(new ApiResponse<>(true, "Listado de mesas obtenido exitosamente", mesas));
    }

    // Consultar una mesa por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MesaResponseDTO>> obtenerMesaPorId(@PathVariable Long id) {
        MesaResponseDTO mesa = mesaService.obtenerPorId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Mesa obtenida exitosamente", mesa));
    }

    // Actualizar datos de una mesa (solo ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MesaResponseDTO>> actualizarMesa(
            @PathVariable Long id,
            @Valid @RequestBody MesaRequestDTO dto
    ) {
        MesaResponseDTO mesa = mesaService.actualizarMesa(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Mesa actualizada exitosamente", mesa));
    }

    // Activar o desactivar una mesa (solo ADMIN)
    @PatchMapping("/{id}/estado")
    public ResponseEntity<ApiResponse<MesaResponseDTO>> cambiarEstadoMesa(
            @PathVariable Long id,
            @Valid @RequestBody MesaEstadoRequestDTO dto
    ) {
        MesaResponseDTO mesa = mesaService.cambiarEstado(id, dto.getActivo());
        String mensaje = Boolean.TRUE.equals(dto.getActivo()) ? "Mesa activada exitosamente" : "Mesa desactivada exitosamente";
        return ResponseEntity.ok(new ApiResponse<>(true, mensaje, mesa));
    }
}
