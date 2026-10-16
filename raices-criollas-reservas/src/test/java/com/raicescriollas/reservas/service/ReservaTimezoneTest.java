package com.raicescriollas.reservas.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.raicescriollas.reservas.config.DateTimeConfig;
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
import com.raicescriollas.reservas.repository.MesaRepository;
import com.raicescriollas.reservas.repository.ReservaRepository;
import com.raicescriollas.reservas.service.impl.MesaServiceImpl;
import com.raicescriollas.reservas.service.impl.ReservaServiceImpl;

@ExtendWith(MockitoExtension.class)
class ReservaTimezoneTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private MesaRepository mesaRepository;

    private Clock clockLima1834;
    private MesaServiceImpl mesaService;
    private ReservaServiceImpl reservaService;

    private Mesa mesa1;

    @BeforeEach
    void setUp() {
        // Simular 15/10/2026 a las 18:34:00 en America/Lima (UTC-5 -> 23:34:00 UTC)
        clockLima1834 = Clock.fixed(
                Instant.parse("2026-10-15T23:34:00Z"),
                DateTimeConfig.ZONE_LIMA
        );

        mesaService = new MesaServiceImpl(mesaRepository, clockLima1834);
        reservaService = new ReservaServiceImpl(reservaRepository, mesaRepository, clockLima1834);

        mesa1 = Mesa.builder()
                .id(1L)
                .numeroMesa("M-01")
                .capacidad(4)
                .ubicacion("Salón Principal")
                .precioBase(new BigDecimal("25.00"))
                .activo(true)
                .build();
    }

    @Test
    @DisplayName("Reserva para 15/10/2026 a las 17:00 (hora pasada en Lima): rechazada")
    void reservaHoraPasadaMismoDia_Rechazada() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 17, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 19, 0);

        // 1. Disponibilidad de mesas
        BusinessException exMesa = assertThrows(BusinessException.class, () ->
                mesaService.listarDisponibles(inicio, fin, 2)
        );
        assertEquals("No se puede consultar disponibilidad en fechas u horas pasadas", exMesa.getMessage());

        // 2. Cotización de reserva
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));
        CotizacionRequestDTO cotDto = CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build();
        BusinessException exCot = assertThrows(BusinessException.class, () ->
                reservaService.cotizarReserva(cotDto)
        );
        assertEquals("No se puede realizar una reserva en una fecha u hora pasada", exCot.getMessage());

        // 3. Creación de reserva
        ReservaRequestDTO resDto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build();
        BusinessException exRes = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(resDto, 100L)
        );
        assertEquals("No se puede realizar una reserva en una fecha u hora pasada", exRes.getMessage());
    }

    @Test
    @DisplayName("Reserva Caso A: 15/10/2026 de 19:00 a 21:00 (futura en Lima): permitida")
    void reservaCasoA_19a21_Permitida() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 19, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 21, 0);

        // 1. Disponibilidad de mesas
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);
        when(mesaRepository.findMesasDisponibles(eq(2), eq(inicio), eq(fin), eq(ahoraEsperado)))
                .thenReturn(List.of(mesa1));

        List<MesaResponseDTO> disponibles = mesaService.listarDisponibles(inicio, fin, 2);
        assertNotNull(disponibles);
        assertEquals(1, disponibles.size());
        assertEquals("M-01", disponibles.get(0).getNumeroMesa());

        // 2. Cotización
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio), eq(fin), eq(ahoraEsperado), any()))
                .thenReturn(false);

        CotizacionResponseDTO cotizacion = reservaService.cotizarReserva(CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build());

        assertTrue(cotizacion.getDisponible());
        assertEquals(new BigDecimal("35.00"), cotizacion.getMontoTotal()); // 25 + 2*5 = 35

        // 3. Creación de reserva
        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesa1));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva r = invocation.getArgument(0);
            r.setId(99L);
            return r;
        });

        ReservaResponseDTO reservaCreada = reservaService.crearReserva(ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build(), 100L);

        assertNotNull(reservaCreada);
        assertEquals(EstadoReserva.PENDIENTE, reservaCreada.getEstado());
        assertEquals(EstadoPago.PENDIENTE, reservaCreada.getEstadoPago());
        assertEquals(new BigDecimal("35.00"), reservaCreada.getMontoTotal());
        // Expiración a los 15 minutos exactos desde 18:34 = 18:49
        assertEquals(LocalDateTime.of(2026, 10, 15, 18, 49), reservaCreada.getFechaExpiracionPago());
    }

    @Test
    @DisplayName("Reserva Caso B: 15/10/2026 de 21:00 a 22:00 (futura en Lima): permitida")
    void reservaCasoB_21a22_Permitida() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 21, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 22, 0);
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);

        when(mesaRepository.findMesasDisponibles(eq(2), eq(inicio), eq(fin), eq(ahoraEsperado)))
                .thenReturn(List.of(mesa1));

        List<MesaResponseDTO> disponibles = mesaService.listarDisponibles(inicio, fin, 2);
        assertNotNull(disponibles);
        assertEquals(1, disponibles.size());
    }

    @Test
    @DisplayName("Reserva Caso C: 16/10/2026 de 19:00 a 21:00 (día siguiente): permitida")
    void reservaCasoC_DiaSiguiente_Permitida() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 16, 19, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 16, 21, 0);
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);

        when(mesaRepository.findMesasDisponibles(eq(2), eq(inicio), eq(fin), eq(ahoraEsperado)))
                .thenReturn(List.of(mesa1));

        List<MesaResponseDTO> disponibles = mesaService.listarDisponibles(inicio, fin, 2);
        assertNotNull(disponibles);
        assertEquals(1, disponibles.size());
    }

    @Test
    @DisplayName("Fecha fin anterior o igual a fecha inicio: rechazada")
    void fechaFinAnteriorOIgualAFechaInicio_Rechazada() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 20, 0);
        LocalDateTime finAnterior = LocalDateTime.of(2026, 10, 15, 19, 0);
        LocalDateTime finIgual = LocalDateTime.of(2026, 10, 15, 20, 0);

        BusinessException ex1 = assertThrows(BusinessException.class, () ->
                mesaService.listarDisponibles(inicio, finAnterior, 2)
        );
        assertEquals("La fecha de inicio debe ser anterior a la fecha de finalización", ex1.getMessage());

        BusinessException ex2 = assertThrows(BusinessException.class, () ->
                mesaService.listarDisponibles(inicio, finIgual, 2)
        );
        assertEquals("La fecha de inicio debe ser anterior a la fecha de finalización", ex2.getMessage());
    }

    @Test
    @DisplayName("Reservas superpuestas: bloqueadas correctamente")
    void reservasSuperpuestas_Bloqueadas() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 19, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 21, 0);
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesa1));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio), eq(fin), eq(ahoraEsperado), any()))
                .thenReturn(true);

        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );
        assertEquals("La mesa no está disponible para el intervalo de tiempo seleccionado", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("Reservas pendientes dentro de sus 15 minutos: mantienen la mesa ocupada")
    void reservaPendienteDentroDe15Minutos_MantieneMesaOcupada() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 19, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 21, 0);
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);

        // La consulta a base de datos considera ocupada la mesa si hay reserva PENDIENTE no expirada
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio), eq(fin), eq(ahoraEsperado), any()))
                .thenReturn(true);
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));

        CotizacionResponseDTO cotizacion = reservaService.cotizarReserva(CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build());

        assertFalse(cotizacion.getDisponible());
        assertEquals("La mesa no está disponible para el intervalo de tiempo seleccionado", cotizacion.getMensaje());
    }

    @Test
    @DisplayName("Reservas pendientes expiradas: liberan disponibilidad")
    void reservaPendienteExpirada_LiberaDisponibilidad() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 19, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 21, 0);
        LocalDateTime ahoraEsperado = LocalDateTime.of(2026, 10, 15, 18, 34);

        // Cuando la reserva pendiente expiró (fechaExpiracionPago < ahoraEsperado), el repositorio devuelve false (no solapada)
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio), eq(fin), eq(ahoraEsperado), any()))
                .thenReturn(false);
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));

        CotizacionResponseDTO cotizacion = reservaService.cotizarReserva(CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build());

        assertTrue(cotizacion.getDisponible());
        assertEquals("Mesa disponible para cotización", cotizacion.getMensaje());
    }

    @Test
    @DisplayName("Cotización y creación: aplican exactamente la misma validación temporal")
    void cotizacionYCreacion_AplicanMismaValidacionTemporal() {
        LocalDateTime pasado = LocalDateTime.of(2026, 10, 15, 17, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 19, 0);

        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));

        CotizacionRequestDTO cotDto = CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(pasado)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build();

        ReservaRequestDTO resDto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(pasado)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build();

        BusinessException exCot = assertThrows(BusinessException.class, () ->
                reservaService.cotizarReserva(cotDto)
        );
        BusinessException exCrear = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(resDto, 100L)
        );

        assertEquals(exCot.getMessage(), exCrear.getMessage());
        assertEquals("No se puede realizar una reserva en una fecha u hora pasada", exCot.getMessage());
    }

    @Test
    @DisplayName("Cruce de medianoche UTC cuando todavía es el día anterior en Lima")
    void cruceDeMedianocheUtc_AunDiaAnteriorEnLima() {
        // En Lima son las 20:00 (8:00 PM) del 15/10/2026
        // En UTC ya cruzó la medianoche: 16/10/2026 a la 01:00 AM (2026-10-16T01:00:00Z)
        Clock clockCruceMedianoche = Clock.fixed(
                Instant.parse("2026-10-16T01:00:00Z"),
                DateTimeConfig.ZONE_LIMA
        );

        MesaServiceImpl mesaServiceMedianoche = new MesaServiceImpl(mesaRepository, clockCruceMedianoche);
        ReservaServiceImpl reservaServiceMedianoche = new ReservaServiceImpl(reservaRepository, mesaRepository, clockCruceMedianoche);

        // Se solicita reserva para las 21:00 a 23:00 del 15/10/2026 (1 hora en el futuro en Lima)
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 15, 21, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 15, 23, 0);
        LocalDateTime ahoraLimaEsperado = LocalDateTime.of(2026, 10, 15, 20, 0);

        when(mesaRepository.findMesasDisponibles(eq(2), eq(inicio), eq(fin), eq(ahoraLimaEsperado)))
                .thenReturn(List.of(mesa1));

        // Debe ser PERMITIDA sin excepción de hora pasada
        assertDoesNotThrow(() -> {
            List<MesaResponseDTO> disp = mesaServiceMedianoche.listarDisponibles(inicio, fin, 2);
            assertEquals(1, disp.size());
        });

        // Cotización también debe ser permitida
        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesa1));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio), eq(fin), eq(ahoraLimaEsperado), any()))
                .thenReturn(false);

        CotizacionResponseDTO cot = reservaServiceMedianoche.cotizarReserva(CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .build());

        assertTrue(cot.getDisponible());
    }
}
