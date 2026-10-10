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
import com.raicescriollas.reservas.config.JwtConfig;
import com.raicescriollas.reservas.config.SecurityConfig;
import com.raicescriollas.reservas.dto.MesaEstadoRequestDTO;
import com.raicescriollas.reservas.dto.MesaRequestDTO;
import com.raicescriollas.reservas.dto.MesaResponseDTO;
import com.raicescriollas.reservas.service.IMesaService;

@WebMvcTest(MesaController.class)
@Import({SecurityConfig.class, JwtConfig.class})
@ActiveProfiles("test")
class MesaControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IMesaService mesaService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("Consulta pública GET /mesas/disponibles sin autenticación retorna 200 OK")
    void listarDisponibles_SinAutenticacion_Retorna200Ok() throws Exception {
        when(mesaService.listarDisponibles(any(), any(), eq(4)))
                .thenReturn(List.of(
                        MesaResponseDTO.builder().id(1L).numeroMesa("M-01").capacidad(4).activo(true).build()
                ));

        mockMvc.perform(get("/mesas/disponibles")
                .param("fechaInicio", "2026-10-15T13:00:00")
                .param("fechaFin", "2026-10-15T15:00:00")
                .param("cantidadPersonas", "4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].numeroMesa").value("M-01"));
    }

    @Test
    @DisplayName("Registrar mesa con ROLE_CLIENTE retorna 403 Forbidden")
    void registrarMesa_ConRolCliente_Retorna403Forbidden() throws Exception {
        MesaRequestDTO request = MesaRequestDTO.builder()
                .numeroMesa("M-05")
                .capacidad(4)
                .build();

        mockMvc.perform(post("/mesas")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.mensaje").value("No tiene permisos para acceder a este recurso"));
    }

    @Test
    @DisplayName("Registrar mesa con ROLE_ADMIN retorna 201 Created")
    void registrarMesa_ConRolAdmin_Retorna201Created() throws Exception {
        MesaRequestDTO request = MesaRequestDTO.builder()
                .numeroMesa("M-05")
                .capacidad(4)
                .build();

        MesaResponseDTO response = MesaResponseDTO.builder()
                .id(5L)
                .numeroMesa("M-05")
                .capacidad(4)
                .activo(true)
                .build();

        when(mesaService.crearMesa(any(MesaRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/mesas")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(5))
                .andExpect(jsonPath("$.data.numeroMesa").value("M-05"));
    }

    @Test
    @DisplayName("Cambiar estado de mesa con ROLE_CLIENTE retorna 403 Forbidden")
    void cambiarEstado_ConRolCliente_Retorna403Forbidden() throws Exception {
        MesaEstadoRequestDTO request = MesaEstadoRequestDTO.builder()
                .activo(false)
                .build();

        mockMvc.perform(patch("/mesas/1/estado")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CLIENTE")))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}
