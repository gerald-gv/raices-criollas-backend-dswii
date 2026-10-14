package com.raicescriollas.auth.utils;

public final class Validaciones {

	private Validaciones() {
	}

	public static final String NOMBRE = "^\\p{L}+([ '’.\\-]\\p{L}+)*$";

	public static final String TELEFONO = "^(\\+?51[ -]?)?9\\d{2}[ -]?\\d{3}[ -]?\\d{3}$";

	public static final String EMAIL = "^[^@\\s]+@[^@\\s]+\\.[A-Za-z]{2,}$";

	public static final String PASSWORD = "^(?=.*\\p{L})(?=.*\\d).{8,72}$";

	public static String normalizarTelefono(String telefono) {
		if (telefono == null || telefono.isBlank())
			return null;
		String digitos = telefono.replaceAll("\\D", "");
		return digitos.length() == 11 && digitos.startsWith("51") ? digitos.substring(2) : digitos;
	}
}
