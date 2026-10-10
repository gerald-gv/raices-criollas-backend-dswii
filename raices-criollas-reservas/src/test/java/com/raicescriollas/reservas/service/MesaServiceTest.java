package com.raicescriollas.reservas.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.raicescriollas.reservas.dto.MesaRequestDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.entity.Mesa;
import com.raicescriollas.reservas.exception.BusinessException;
import com.raicescriollas.reservas.repository.MesaRepository;
import com.raicescriollas.reservas.service.impl.MesaServiceImpl;

@ExtendWith(MockitoExtension.class)
class MesaServiceTest {

    @Mock
    private MesaRepository mesaRepository;

    @InjectMocks
    private MesaServiceImpl mesaService;

    private Mesa mesa1;

    @BeforeEach
    void setUp() {
        mesa1 = Mesa.builder()
                .id(1L)
                .numeroMesa("M-01")
                .capacidad(4)
                .ubicacion("Salón Principal")
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Listar mesas disponibles con fechas válidas")
    void listarDisponibles_FechasValidas_Exito() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).withHour(12);
        LocalDateTime fin = inicio.plusHours(2);

        when(mesaRepository.findMesasDisponibles(eq(3), eq(inicio), eq(fin), any()))
                .thenReturn(List.of(mesa1));

        List<MesaResponseDTO> disponibles = mesaService.listarDisponibles(inicio, fin, 3);

        assertEquals(1, disponibles.size());
        assertEquals("M-01", disponibles.get(0).getNumeroMesa());
    }

    @Test
    @DisplayName("Listar disponibles falla con fechas invertidas")
    void listarDisponibles_FechasInvertidas_LanzaBusinessException() {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).withHour(14);
        LocalDateTime fin = LocalDateTime.now().plusDays(1).withHour(12);

        assertThrows(BusinessException.class, () ->
                mesaService.listarDisponibles(inicio, fin, 3)
        );
    }

    @Test
    @DisplayName("Crear mesa con número duplicado lanza BusinessException")
    void crearMesa_NumeroDuplicado_LanzaBusinessException() {
        MesaRequestDTO dto = MesaRequestDTO.builder()
                .numeroMesa("M-01")
                .capacidad(4)
                .build();

        when(mesaRepository.existsByNumeroMesa("M-01")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                mesaService.crearMesa(dto)
        );

        assertTrue(ex.getMessage().contains("Ya existe una mesa registrada"));
    }

    @Test
    @DisplayName("Actualizar mesa con número duplicado en otra mesa lanza BusinessException")
    void actualizarMesa_NumeroDuplicadoOtroId_LanzaBusinessException() {
        MesaRequestDTO dto = MesaRequestDTO.builder()
                .numeroMesa("M-02")
                .capacidad(4)
                .build();

        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));
        when(mesaRepository.existsByNumeroMesaAndIdNot("M-02", 1L)).thenReturn(true);

        assertThrows(BusinessException.class, () ->
                mesaService.actualizarMesa(1L, dto)
        );
    }

    @Test
    @DisplayName("Cambiar estado de mesa a inactivo exitosamente")
    void cambiarEstado_Exito() {
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));
        when(mesaRepository.save(any(Mesa.class))).thenAnswer(i -> i.getArgument(0));

        MesaResponseDTO respuesta = mesaService.cambiarEstado(1L, false);

        assertNotNull(respuesta);
        assertFalse(respuesta.getActivo());
        verify(mesaRepository).save(any(Mesa.class));
    }
}
