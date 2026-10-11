package com.raicescriollas.pedidos.utils;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

public final class SecurityUtils {

	private SecurityUtils() {
	}

	public static Long getCurrentUserId() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt))
			throw new AccessDeniedException("Usuario no autenticado");
		try {
			return Long.parseLong(jwt.getSubject());
		} catch (NumberFormatException e) {
			throw new AccessDeniedException("Identificador de usuario invalido en el token");
		}
	}

	public static boolean isAdmin() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			return false;
		for (GrantedAuthority a : auth.getAuthorities())
			if ("ROLE_ADMIN".equals(a.getAuthority()))
				return true;
		return false;
	}
}
