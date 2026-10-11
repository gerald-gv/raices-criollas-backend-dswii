package com.raicescriollas.pedidos.config;

import java.util.Base64;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http.csrf(csrf -> csrf.disable())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(a -> a
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						// Panel administrativo: solo ROLE_ADMIN
						.requestMatchers("/pedidos/admin/**").hasAuthority("ROLE_ADMIN")
						.anyRequest().authenticated())
				.oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(converter())));
		return http.build();
	}

	private JwtAuthenticationConverter converter() {
		var authorities = new JwtGrantedAuthoritiesConverter();
		authorities.setAuthoritiesClaimName("roles");
		authorities.setAuthorityPrefix(""); // los roles ya vienen como ROLE_XXX
		var converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(authorities);
		return converter;
	}

	@Bean
	JwtDecoder jwtDecoder(@Value("${app.jwt.secret}") String secret) {
		SecretKeySpec key = new SecretKeySpec(Base64.getDecoder().decode(secret.trim()), "HmacSHA256");
		return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
	}
}
