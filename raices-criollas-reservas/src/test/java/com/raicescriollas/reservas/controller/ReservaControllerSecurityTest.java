package com.raicescriollas.reservas.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.raicescriollas.reservas.config.JwtConfig;
import com.raicescriollas.reservas.config.SecurityConfig;
import com.raicescriollas.reservas.dto.ActualizarEstadoReservaDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.dto.ReservaRequestDTO;
import com.raicescriollas.reservas.dto.ReservaResponseDTO;
import com.raicescriollas.reservas.enums.EstadoReserva;
import com.raicescriollas.reservas.service.IReservaService;

@WebMvcTest(ReservaController.class)
@Import({SecurityConfig.class, JwtConfig.class})
@ActiveProfiles("test")
class ReservaControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IReservaService reservaService;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Test
    @DisplayName("9. Operaciones administrativas: GET /reservas restringido a ADMIN (CLIENTE recibe 403)")
    void listarTodas_ConRolCliente_Retorna403Forbidden() throws Exception {
        mockMvc.perform(get("/reservas")
                .with(jwt().jwt(j -> j.subject("100")).authorities(new SimpleGrantedAuthority("ROLE_CLIENTE"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a este recurso"));
    }

    @Test
    @DisplayName("9b. Operaciones administrativas: GET /reservas permitido para ADMIN")
    void listarTodas_ConRolAdmin_Retorna200Ok() throws Exception {
        when(reservaService.listarTodas(any(), any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/reservas")
                .with(jwt().jwt(j -> j.subject("1")).authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Crear reserva como CLIENTE exitoso extrayendo userId del JWT")
    void crearReserva_ConRolCliente_Retorna201Created() throws Exception {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1).withHour(12);
        LocalDateTime fin = inicio.plusHours(2);

        ReservaRequestDTO request = ReservaRequestDTO.builder()
                .mesaId(1L)
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .observaciones("Mesa exterior")
                .build();

        ReservaResponseDTO response = ReservaResponseDTO.builder()
                .id(10L)
                .clienteId(100L)
                .mesa(MesaResponseDTO.builder().id(1L).numeroMesa("M-01").capacidad(4).activo(true).build())
                .fechaInicio(inicio)
                .fechaFin(fin)
                .cantidadPersonas(2)
                .estado(EstadoReserva.CONFIRMADA)
                .build();

        when(reservaService.crearReserva(any(ReservaRequestDTO.class), eq(100L)))
                .thenReturn(response);

        mockMvc.perform(post("/reservas")
                .with(jwt().jwt(j -> j.subject("100")).authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.clienteId").value(100));
    }

    @Test
    @DisplayName("Petición sin token retorna 401 Unauthorized")
    void peticionSinToken_Retorna401Unauthorized() throws Exception {
        mockMvc.perform(get("/reservas/mis-reservas"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("Autenticación requerida o token inválido"));
    }

    @Test
    @DisplayName("Cambiar estado de reserva como ADMIN exitoso")
    void cambiarEstado_ConRolAdmin_Retorna200Ok() throws Exception {
        ActualizarEstadoReservaDTO request = ActualizarEstadoReservaDTO.builder()
                .estado(EstadoReserva.CANCELADA)
                .build();

        ReservaResponseDTO response = ReservaResponseDTO.builder()
                .id(10L)
                .clienteId(100L)
                .estado(EstadoReserva.CANCELADA)
                .build();

        when(reservaService.cambiarEstado(10L, EstadoReserva.CANCELADA))
                .thenReturn(response);

        mockMvc.perform(patch("/reservas/10/estado")
                .with(jwt().jwt(j -> j.subject("1")).authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.estado").value("CANCELADA"));
    }
}
