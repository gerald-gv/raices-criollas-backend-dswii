-- =============================================================================
-- PROYECTO: Raíces Criollas - Microservicio de Reservas
-- ARCHIVO: 03_datos_prueba_reservas.sql
-- DESCRIPCIÓN: Carga inicial de datos de prueba para catálogo de mesas
-- =============================================================================
-- INSTRUCCIONES PARA PGADMIN 4:
-- 1. Abra el Query Tool conectado específicamente a 'reservas_db'.
-- 2. Ejecute este script para poblar el catálogo de mesas.
-- 3. Utiliza la cláusula ON CONFLICT (numero_mesa) para permitir ejecuciones
--    repetidas sin provocar errores de duplicidad.
--
-- NOTA IMPORTANTE SOBRE RESERVAS Y CLIENTES:
-- - Por diseño arquitectónico, NO se insertan reservas con clientes inventados.
--   Las reservas deben generarse a través de la API autenticada utilizando los
--   tokens reales emitidos por el microservicio Auth, garantizando la integridad
--   de los identificadores de usuario (sub).
-- =============================================================================

INSERT INTO mesas (numero_mesa, capacidad, ubicacion, activo) VALUES
('M-01', 2, 'Salón Principal - Cerca a la Ventana', TRUE),
('M-02', 2, 'Salón Principal - Zona Centro', TRUE),
('M-03', 4, 'Salón Principal - Esquina Romántica', TRUE),
('M-04', 4, 'Salón Principal - Zona Central', TRUE),
('M-05', 4, 'Terraza Exterior - Vista al Jardín', TRUE),
('M-06', 6, 'Terraza Exterior - Zona Fresca', TRUE),
('M-07', 6, 'Balcón Criollo - Segundo Nivel', TRUE),
('M-08', 8, 'Salón Tradición - Zona Familiar', TRUE),
('M-09', 10, 'Área VIP Privada - Salón Bicentenario', TRUE),
('M-10', 4, 'Mesa de Mantenimiento - Inactiva', FALSE)
ON CONFLICT (numero_mesa) DO UPDATE SET
    capacidad = EXCLUDED.capacidad,
    ubicacion = EXCLUDED.ubicacion,
    activo = EXCLUDED.activo;

-- =============================================================================
-- CONSULTAS DE VERIFICACIÓN
-- =============================================================================
-- Listar todas las mesas registradas ordenadas por número:
SELECT id, numero_mesa, capacidad, ubicacion, activo 
FROM mesas 
ORDER BY id ASC;

-- Contar mesas activas por capacidad:
SELECT capacidad, COUNT(*) AS cantidad_mesas 
FROM mesas 
WHERE activo = TRUE 
GROUP BY capacidad 
ORDER BY capacidad ASC;
