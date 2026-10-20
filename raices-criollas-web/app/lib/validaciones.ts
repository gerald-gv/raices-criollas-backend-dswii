// Letras (con tildes y ñ), separadas por espacio, guion, apostrofe o punto
export const NOMBRE_PATTERN = "\\p{L}+([ '’.\\-]\\p{L}+)*";
export const NOMBRE_TITLE = "Solo letras y espacios";

// Celular peruano: 9 digitos que empiezan con 9, con o sin +51
export const TELEFONO_PATTERN = "(\\+?51[ \\-]?)?9\\d{2}[ \\-]?\\d{3}[ \\-]?\\d{3}";
export const TELEFONO_TITLE = "Celular de 9 dígitos que empiece con 9. Ejemplo: 987 654 321";


