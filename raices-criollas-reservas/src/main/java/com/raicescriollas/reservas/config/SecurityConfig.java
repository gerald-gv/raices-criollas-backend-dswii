package com.raicescriollas.reservas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.raicescriollas.reservas.utils.ApiResponse;

import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                // Consulta pública de mesas disponibles
                .requestMatchers(HttpMethod.GET, "/mesas/disponibles").permitAll()

                // Gestión administrativa de mesas (solo ROLE_ADMIN)
                .requestMatchers(HttpMethod.POST, "/mesas").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/mesas").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/mesas/*").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/mesas/*/estado").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/mesas/*").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENTE")

                // Endpoints de reservas para clientes y admin
                .requestMatchers(HttpMethod.POST, "/reservas").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENTE")
                .requestMatchers(HttpMethod.GET, "/reservas/mis-reservas/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENTE")
                .requestMatchers(HttpMethod.PATCH, "/reservas/*/cancelar").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENTE")

                // Consulta general y cambio de estado de reservas (solo ROLE_ADMIN)
                .requestMatchers(HttpMethod.GET, "/reservas").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/reservas/*/estado").hasAuthority("ROLE_ADMIN")

                // Consulta de reserva individual (propia para CLIENTE o cualquiera para ADMIN en Service)
                .requestMatchers(HttpMethod.GET, "/reservas/*").hasAnyAuthority("ROLE_ADMIN", "ROLE_CLIENTE")

                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(o -> o
                .jwt(j -> j.jwtAuthenticationConverter(converter()))
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            );

        return http.build();
    }

    private JwtAuthenticationConverter converter() {
        var authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("roles");
        authorities.setAuthorityPrefix(""); // Los roles ya vienen con prefijo ROLE_
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authorities);
        return converter;
    }

    @Bean
    AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ApiResponse<Void> apiResponse = new ApiResponse<>(false, "Autenticación requerida o token inválido", null);
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            ApiResponse<Void> apiResponse = new ApiResponse<>(false, "No tiene permisos para acceder a este recurso", null);
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }
}
