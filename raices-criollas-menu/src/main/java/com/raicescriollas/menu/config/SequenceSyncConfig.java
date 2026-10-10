package com.raicescriollas.menu.config;

import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Sincroniza las secuencias de PostgreSQL con el MAX(id) de cada tabla
 * al arrancar el microservicio.
 *
 * Por qué es necesario: cuando se insertan filas directamente por SQL
 * (p. ej. datos iniciales) o se restaura un backup, la secuencia interna
 * de la columna IDENTITY puede quedar por detrás del ID más alto existente.
 * El siguiente INSERT intentaría reutilizar un ID ya ocupado y fallaría con
 * duplicate key violation.
 *
 * Estrategia:
 *   - Usa pg_get_serial_sequence para obtener el nombre real de la secuencia
 *     sin depender de convenciones de nombre inventadas.
 *   - Usa setval(..., MAX(id), true) para que el PRÓXIMO valor sea MAX(id)+1.
 *   - Si la tabla está vacía, setval recibe 1 con is_called=false, de modo que
 *     el primer INSERT recibirá el id 1 sin saltar valores.
 *   - Es idempotente y seguro ante reinicios.
 */
@Component
public class SequenceSyncConfig implements ApplicationListener<ApplicationReadyEvent> {

    private record TablaColumna(String tabla, String columna) {}

    private static final List<TablaColumna> TABLAS = List.of(
            new TablaColumna("categorias", "id"),
            new TablaColumna("platos",     "id")
    );

    private final JdbcTemplate jdbc;

    public SequenceSyncConfig(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        for (TablaColumna tc : TABLAS) {
            sincronizar(tc.tabla(), tc.columna());
        }
    }

    private void sincronizar(String tabla, String columna) {
        try {
            // Obtener el nombre real de la secuencia asociada a la columna
            String secuencia = jdbc.queryForObject(
                    "SELECT pg_get_serial_sequence(?, ?)",
                    String.class, tabla, columna
            );

            if (secuencia == null) {
                // La columna no tiene secuencia asociada (caso inesperado)
                return;
            }

            // Obtener el MAX(id) actual; null si la tabla está vacía
            Long maxId = jdbc.queryForObject(
                    "SELECT MAX(" + columna + ") FROM " + tabla,
                    Long.class
            );

            if (maxId == null) {
                // Tabla vacía: resetear a 1 con is_called=false
                // → el primer INSERT obtendrá id=1
                jdbc.execute("SELECT setval('" + secuencia + "', 1, false)");
            } else {
                // Tabla con datos: setval con is_called=true
                // → el próximo INSERT obtendrá maxId+1
                jdbc.queryForObject(
                        "SELECT setval(?, ?)",
                        Long.class, secuencia, maxId
                );
            }
        } catch (Exception e) {
            // Log sin lanzar excepción para no bloquear el arranque
            System.err.printf(
                    "[SequenceSyncConfig] No se pudo sincronizar secuencia de %s.%s: %s%n",
                    tabla, columna, e.getMessage()
            );
        }
    }
}
