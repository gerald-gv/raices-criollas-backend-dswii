package com.raicescriollas.auth.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.raicescriollas.auth.dto.ChangePasswordRequest;
import com.raicescriollas.auth.dto.DireccionRequest;
import com.raicescriollas.auth.dto.UpdatePerfilRequest;
import com.raicescriollas.auth.dto.UsuarioResponse;
import com.raicescriollas.auth.entity.Usuario;
import com.raicescriollas.auth.exception.CampoInvalidoException;
import com.raicescriollas.auth.exception.InvalidCredentialsException;
import com.raicescriollas.auth.repository.UsuarioRepository;
import com.raicescriollas.auth.service.IPerfilService;
import com.raicescriollas.auth.utils.Validaciones;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PerfilServiceImpl implements IPerfilService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UsuarioResponse obtener(Long userId) {
        return UsuarioResponse.from(buscar(userId));
    }

    @Override
    @Transactional
    public UsuarioResponse actualizar(Long userId, UpdatePerfilRequest request) {
        Usuario usuario = buscar(userId);
        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());
        usuario.setTelefono(Validaciones.normalizarTelefono(request.telefono()));
        return UsuarioResponse.from(usuario);   // el cambio se guarda al cerrar la transaccion
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarDireccion(Long userId, DireccionRequest request) {
        Usuario usuario = buscar(userId);
        usuario.setDireccion(request.direccion().trim());
        usuario.setDistrito(request.distrito().trim());
        usuario.setReferencia(request.referencia() == null || request.referencia().isBlank() ? null : request.referencia().trim());
        usuario.setTelefono(Validaciones.normalizarTelefono(request.telefono()));
        return UsuarioResponse.from(usuario);
    }

    @Override
    @Transactional
    public void cambiarPassword(Long userId, ChangePasswordRequest request) {
        Usuario usuario = buscar(userId);

        if (!passwordEncoder.matches(request.passwordActual(), usuario.getPasswordHash())) {
            throw new CampoInvalidoException("passwordActual", "La contraseña actual no es correcta");
        }
        if (passwordEncoder.matches(request.passwordNueva(), usuario.getPasswordHash())) {
            throw new CampoInvalidoException("passwordNueva", "La nueva contraseña debe ser distinta a la actual");
        }
        usuario.setPasswordHash(passwordEncoder.encode(request.passwordNueva()));
    }

    private Usuario buscar(Long userId) {
        return usuarioRepository.findById(userId)
                .orElseThrow(InvalidCredentialsException::new);   // token de un usuario que ya no existe -> 401
    }
}