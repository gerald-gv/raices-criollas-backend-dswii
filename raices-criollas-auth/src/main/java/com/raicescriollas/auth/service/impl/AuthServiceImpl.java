package com.raicescriollas.auth.service.impl;

import java.time.Duration;
import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.raicescriollas.auth.dto.LoginRequest;
import com.raicescriollas.auth.dto.RegisterRequest;
import com.raicescriollas.auth.dto.TokenResponse;
import com.raicescriollas.auth.entity.Rol;
import com.raicescriollas.auth.entity.Usuario;
import com.raicescriollas.auth.exception.EmailAlreadyUsedException;
import com.raicescriollas.auth.exception.InvalidCredentialsException;
import com.raicescriollas.auth.repository.RolRepository;
import com.raicescriollas.auth.repository.UsuarioRepository;
import com.raicescriollas.auth.service.IAuthService;
import com.raicescriollas.auth.service.ITokenService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_TIME = Duration.ofMinutes(15);

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final ITokenService tokenService;

    @Override
    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailAlreadyUsedException();
        }
        Rol rolCliente = rolRepository.findByNombre("ROLE_CLIENTE")
                .orElseThrow(() -> new IllegalStateException("Falta el rol ROLE_CLIENTE"));

        Usuario usuario = Usuario.builder()
                .nombre(request.nombre().trim())
                .apellido(request.apellido().trim())
                .email(email)
                .telefono(request.telefono())
                .passwordHash(passwordEncoder.encode(request.password()))
                .rol(rolCliente)
                .build();
        usuarioRepository.save(usuario);

        return issueToken(usuario);
    }

    // dontRollbackOn sirve para que el contador de intentos fallidos se guarde aunque se lance la excepcion
    @Override
    @Transactional(dontRollbackOn  = InvalidCredentialsException.class)
    public TokenResponse login(LoginRequest request) {
        Usuario user = usuarioRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(InvalidCredentialsException::new);

        boolean locked = user.getLockedUntil() != null && user.getLockedUntil().isAfter(Instant.now());
        if (!user.isEnabled() || locked) {
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(Instant.now().plus(LOCK_TIME));
                user.setFailedAttempts(0);
            }
            throw new InvalidCredentialsException();   // mismo mensaje siempre: no revela si el email existe
        }

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        return issueToken(user);
    }

    private TokenResponse issueToken(Usuario user) {
    	return new TokenResponse( tokenService.generateAccessToken(user), "Bearer", tokenService.accessTokenTtlSeconds());
    }
}