package com.raicescriollas.reservas.service;

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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.raicescriollas.reservas.dto.CotizacionRequestDTO;
import com.raicescriollas.reservas.dto.CotizacionResponseDTO;
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
import com.raicescriollas.reservas.service.impl.ReservaServiceImpl;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private MesaRepository mesaRepository;

    @InjectMocks
    private ReservaServiceImpl reservaService;

    private Mesa mesaActiva;
    private Mesa mesaInactiva;
    private LocalDateTime ahoraMas1Dia;
    private LocalDateTime ahoraMas2Dias;

    @BeforeEach
    void setUp() {
        mesaActiva = Mesa.builder()
                .id(1L)
                .numeroMesa("M-01")
                .capacidad(4)
                .ubicacion("Salón Principal")
                .precioBase(new BigDecimal("20.00"))
                .activo(true)
                .build();

        mesaInactiva = Mesa.builder()
                .id(2L)
                .numeroMesa("M-02")
                .capacidad(6)
                .ubicacion("Terraza")
                .precioBase(new BigDecimal("30.00"))
                .activo(false)
                .build();

        ahoraMas1Dia = LocalDateTime.now().plusDays(1).withHour(13).withMinute(0).withSecond(0).withNano(0);
        ahoraMas2Dias = ahoraMas1Dia.plusHours(2);
    }

    @Test
    @DisplayName("1. Crear reserva válida: nace en PENDIENTE/PENDIENTE con monto calculado y fecha límite de pago")
    void crearReserva_Valida_Exito() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(3)
                .observaciones("Al lado de la ventana")
                .build();

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesaActiva));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(ahoraMas1Dia), eq(ahoraMas2Dias), any(), eq(null)))
                .thenReturn(false);

        Reserva reservaGuardada = Reserva.builder()
                .id(10L)
                .clienteId(100L)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(3)
                .montoTotal(new BigDecimal("35.00"))
                .moneda("PEN")
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .fechaExpiracionPago(LocalDateTime.now().plusMinutes(15))
                .observaciones("Al lado de la ventana")
                .build();

        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaGuardada);

        ReservaResponseDTO respuesta = reservaService.crearReserva(dto, 100L);

        assertNotNull(respuesta);
        assertEquals(10L, respuesta.getId());
        assertEquals(100L, respuesta.getClienteId());
        assertEquals(EstadoReserva.PENDIENTE, respuesta.getEstado());
        assertEquals(EstadoPago.PENDIENTE, respuesta.getEstadoPago());
        assertEquals(new BigDecimal("35.00"), respuesta.getMontoTotal());
        assertEquals("PEN", respuesta.getMoneda());
        assertNotNull(respuesta.getFechaExpiracionPago());
        assertEquals(3, respuesta.getCantidadPersonas());
        verify(reservaRepository).save(any(Reserva.class));
    }

    @Test
    @DisplayName("1b. El backend calcula y persiste históricamente el monto total sin confiar en el cliente")
    void crearReserva_BackendCalculaYPersisteMontoHistorico() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .observaciones("Reserva cena")
                .build();

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesaActiva));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(ahoraMas1Dia), eq(ahoraMas2Dias), any(), eq(null)))
                .thenReturn(false);
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> {
            Reserva r = invocation.getArgument(0);
            r.setId(101L);
            return r;
        });

        ReservaResponseDTO respuesta = reservaService.crearReserva(dto, 50L);

        // Mesa: 20.00 base + (2 personas * 5.00) = 30.00 PEN
        assertEquals(new BigDecimal("30.00"), respuesta.getMontoTotal());
        assertEquals("PEN", respuesta.getMoneda());
        assertEquals(EstadoReserva.PENDIENTE, respuesta.getEstado());
        assertEquals(EstadoPago.PENDIENTE, respuesta.getEstadoPago());

        ArgumentCaptor<Reserva> captor = ArgumentCaptor.forClass(Reserva.class);
        verify(reservaRepository).save(captor.capture());
        Reserva entidadGuardada = captor.getValue();
        assertEquals(new BigDecimal("30.00"), entidadGuardada.getMontoTotal());
        assertEquals("PEN", entidadGuardada.getMoneda());
        assertEquals(EstadoPago.PENDIENTE, entidadGuardada.getEstadoPago());
    }

    @Test
    @DisplayName("2. Rechazar reserva con fecha inválida (fin anterior a inicio)")
    void crearReserva_FechaFinAntesDeInicio_LanzaBusinessException() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas2Dias)
                .fechaFin(ahoraMas1Dia) // fin antes de inicio
                .cantidadPersonas(2)
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );

        assertEquals("La fecha de inicio debe ser anterior a la fecha de finalización", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("2b. Rechazar reserva en el pasado")
    void crearReserva_FechaEnElPasado_LanzaBusinessException() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(LocalDateTime.now().minusDays(1))
                .fechaFin(LocalDateTime.now().plusDays(1))
                .cantidadPersonas(2)
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );

        assertEquals("No se puede realizar una reserva en una fecha u hora pasada", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("3. Rechazar reserva cuando cantidad de personas supera capacidad de mesa")
    void crearReserva_ExcesoDeCapacidad_LanzaBusinessException() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(8) // Mesa tiene capacidad 4
                .build();

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesaActiva));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );

        assertEquals("La cantidad de personas (8) supera la capacidad máxima de la mesa (4)", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("4. Rechazar reserva en una mesa inactiva")
    void crearReserva_MesaInactiva_LanzaBusinessException() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(2L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .build();

        when(mesaRepository.findByIdWithLock(2L)).thenReturn(Optional.of(mesaInactiva));

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );

        assertEquals("La mesa seleccionada se encuentra inactiva y no admite reservas", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("5. Rechazar reserva cuando existe solapamiento horario en la mesa")
    void crearReserva_HorarioSolapado_LanzaBusinessException() {
        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .build();

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesaActiva));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(ahoraMas1Dia), eq(ahoraMas2Dias), any(), eq(null)))
                .thenReturn(true); // Ya existe solapamiento

        BusinessException ex = assertThrows(BusinessException.class, () ->
                reservaService.crearReserva(dto, 100L)
        );

        assertEquals("La mesa no está disponible para el intervalo de tiempo seleccionado", ex.getMessage());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("6. Permitir dos reservas consecutivas (una termina exactamente cuando empieza la otra)")
    void crearReserva_DosReservasConsecutivas_Exito() {
        LocalDateTime inicio2 = ahoraMas1Dia.withHour(14);
        LocalDateTime fin2 = ahoraMas1Dia.withHour(16);

        ReservaRequestDTO dto = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio2)
                .fechaFin(fin2)
                .cantidadPersonas(2)
                .build();

        when(mesaRepository.findByIdWithLock(1L)).thenReturn(Optional.of(mesaActiva));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(inicio2), eq(fin2), any(), eq(null)))
                .thenReturn(false);

        Reserva reserva2 = Reserva.builder()
                .id(20L)
                .clienteId(101L)
                .mesa(mesaActiva)
                .fechaInicio(inicio2)
                .fechaFin(fin2)
                .cantidadPersonas(2)
                .montoTotal(new BigDecimal("30.00"))
                .moneda("PEN")
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .fechaExpiracionPago(LocalDateTime.now().plusMinutes(15))
                .build();

        when(reservaRepository.save(any(Reserva.class))).thenReturn(reserva2);

        ReservaResponseDTO respuesta = reservaService.crearReserva(dto, 101L);

        assertNotNull(respuesta);
        assertEquals(20L, respuesta.getId());
        assertEquals(inicio2, respuesta.getFechaInicio());
    }

    @Test
    @DisplayName("7. Cotización previa exitosa con desglose exacto de tarifa base y comensales")
    void cotizarReserva_Disponible_CalculoDesgloseYTotalExitoso() {
        Mesa mesaPersonalizada = Mesa.builder()
                .id(5L)
                .numeroMesa("M-05")
                .capacidad(6)
                .precioBase(new BigDecimal("30.00"))
                .activo(true)
                .build();

        CotizacionRequestDTO cotizacionRequest = CotizacionRequestDTO.builder()
                .mesaId(5L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(4)
                .build();

        when(mesaRepository.findById(5L)).thenReturn(Optional.of(mesaPersonalizada));
        when(reservaRepository.existsOverlappingReservations(eq(5L), eq(ahoraMas1Dia), eq(ahoraMas2Dias), any(), eq(null)))
                .thenReturn(false);

        CotizacionResponseDTO resultado = reservaService.cotizarReserva(cotizacionRequest);

        assertNotNull(resultado);
        assertEquals(5L, resultado.getMesaId());
        assertEquals("M-05", resultado.getNumeroMesa());
        assertEquals(6, resultado.getCapacidadMesa());
        assertEquals(new BigDecimal("30.00"), resultado.getPrecioBaseMesa());
        assertEquals(new BigDecimal("5.00"), resultado.getTarifaPorPersona());
        assertEquals(4, resultado.getCantidadPersonas());
        // 4 * 5.00 = 20.00
        assertEquals(new BigDecimal("20.00"), resultado.getSubtotalPersonas());
        // 30.00 base + 20.00 personas = 50.00 PEN
        assertEquals(new BigDecimal("50.00"), resultado.getMontoTotal());
        assertEquals("PEN", resultado.getMoneda());
        assertTrue(resultado.getDisponible());
        assertEquals("Mesa disponible para cotización", resultado.getMensaje());
    }

    @Test
    @DisplayName("7b. Cotización previa rechazada cuando personas superan la capacidad de la mesa")
    void cotizarReserva_ExcesoCapacidad_RetornaNoDisponible() {
        CotizacionRequestDTO cotizacionRequest = CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(6) // Capacidad es 4
                .build();

        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesaActiva));

        CotizacionResponseDTO resultado = reservaService.cotizarReserva(cotizacionRequest);

        assertNotNull(resultado);
        assertFalse(resultado.getDisponible());
        assertTrue(resultado.getMensaje().contains("supera la capacidad máxima"));
    }

    @Test
    @DisplayName("7c. Cotización previa informa no disponible cuando la mesa está ocupada por reserva vigente")
    void cotizarReserva_HorarioSolapado_RetornaNoDisponible() {
        CotizacionRequestDTO cotizacionRequest = CotizacionRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .build();

        when(mesaRepository.findById(1L)).thenReturn(Optional.of(mesaActiva));
        when(reservaRepository.existsOverlappingReservations(eq(1L), eq(ahoraMas1Dia), eq(ahoraMas2Dias), any(), eq(null)))
                .thenReturn(true);

        CotizacionResponseDTO resultado = reservaService.cotizarReserva(cotizacionRequest);

        assertNotNull(resultado);
        assertFalse(resultado.getDisponible());
        assertTrue(resultado.getMensaje().contains("no está disponible"));
    }

    @Test
    @DisplayName("8. Consulta de historial aislada estrictamente por usuario")
    void listarMisReservas_AisladaPorUsuario() {
        Long clienteId = 100L;
        Reserva r1 = Reserva.builder()
                .id(1L)
                .clienteId(clienteId)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .montoTotal(new BigDecimal("30.00"))
                .moneda("PEN")
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .build();

        when(reservaRepository.findByClienteIdOrderByFechaInicioDesc(clienteId))
                .thenReturn(List.of(r1));

        List<ReservaResponseDTO> historial = reservaService.listarMisReservas(clienteId);

        assertEquals(1, historial.size());
        assertEquals(clienteId, historial.get(0).getClienteId());
        verify(reservaRepository).findByClienteIdOrderByFechaInicioDesc(clienteId);
    }

    @Test
    @DisplayName("9. Acceso denegado al intentar consultar reserva perteneciente a otro cliente")
    void obtenerMiReserva_OtroCliente_LanzaAccessDeniedException() {
        Long clienteAutenticado = 100L;
        Long clienteDuenio = 999L;

        Reserva r = Reserva.builder()
                .id(50L)
                .clienteId(clienteDuenio)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .estado(EstadoReserva.CONFIRMADA)
                .build();

        when(reservaRepository.findById(50L)).thenReturn(Optional.of(r));

        assertThrows(AccessDeniedException.class, () ->
                reservaService.obtenerMiReserva(50L, clienteAutenticado)
        );
    }

    @Test
    @DisplayName("9b. Acceso denegado al intentar cancelar reserva de otro cliente")
    void cancelarMiReserva_OtroCliente_LanzaAccessDeniedException() {
        Long clienteAutenticado = 100L;
        Long clienteDuenio = 999L;

        Reserva r = Reserva.builder()
                .id(50L)
                .clienteId(clienteDuenio)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .estado(EstadoReserva.CONFIRMADA)
                .build();

        when(reservaRepository.findById(50L)).thenReturn(Optional.of(r));

        assertThrows(AccessDeniedException.class, () ->
                reservaService.cancelarMiReserva(50L, clienteAutenticado)
        );
        verify(reservaRepository, never()).save(any());
    }

    @Test
    @DisplayName("10. Cancelar reserva propia exitosamente")
    void cancelarMiReserva_Propia_Exito() {
        Long clienteId = 100L;

        Reserva r = Reserva.builder()
                .id(50L)
                .clienteId(clienteId)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .build();

        when(reservaRepository.findById(50L)).thenReturn(Optional.of(r));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservaResponseDTO respuesta = reservaService.cancelarMiReserva(50L, clienteId);

        assertEquals(EstadoReserva.CANCELADA, respuesta.getEstado());
    }

    @Test
    @DisplayName("11. Cambiar estado de reserva por ADMIN exitosamente")
    void cambiarEstado_PorAdmin_Exito() {
        Reserva r = Reserva.builder()
                .id(60L)
                .clienteId(100L)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .build();

        when(reservaRepository.findById(60L)).thenReturn(Optional.of(r));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservaResponseDTO respuesta = reservaService.cambiarEstado(60L, EstadoReserva.COMPLETADA);

        assertEquals(EstadoReserva.COMPLETADA, respuesta.getEstado());
    }

    @Test
    @DisplayName("11b. Cambiar estado de reserva y estado de pago por ADMIN exitosamente")
    void cambiarEstado_ConEstadoYEstadoPago_PorAdmin_Exito() {
        Reserva r = Reserva.builder()
                .id(60L)
                .clienteId(100L)
                .mesa(mesaActiva)
                .fechaInicio(ahoraMas1Dia)
                .fechaFin(ahoraMas2Dias)
                .cantidadPersonas(2)
                .estado(EstadoReserva.PENDIENTE)
                .estadoPago(EstadoPago.PENDIENTE)
                .build();

        when(reservaRepository.findById(60L)).thenReturn(Optional.of(r));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReservaResponseDTO respuesta = reservaService.cambiarEstado(60L, EstadoReserva.CONFIRMADA, EstadoPago.PAGADO);

        assertEquals(EstadoReserva.CONFIRMADA, respuesta.getEstado());
        assertEquals(EstadoPago.PAGADO, respuesta.getEstadoPago());
    }
}
