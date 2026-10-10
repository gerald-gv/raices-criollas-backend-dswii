-- =============================================================================
-- PROYECTO: Raíces Criollas - Microservicio de Reservas
-- ARCHIVO: 01_crear_base_datos.sql
-- DESCRIPCIÓN: Creación de la base de datos independiente 'reservas_db'
-- =============================================================================
-- INSTRUCCIONES PARA PGADMIN 4:
-- 1. Abra pgAdmin 4 y conéctese a su servidor PostgreSQL local (localhost:5432).
-- 2. Haga clic derecho sobre la base de datos por defecto 'postgres'.
-- 3. Seleccione 'Query Tool' (Herramienta de consulta).
-- 4. Ejecute el siguiente comando (F5 o botón de 'Play').
--
-- NOTA IMPORTANTE:
-- - Este comando se ejecuta UNA SOLA VEZ.
-- - Debe ejecutarse conectado a la base de datos 'postgres' (o cualquier otra base
--   existente), ya que PostgreSQL no permite conectarse a una base de datos que aún
--   no ha sido creada.
-- - Si la base de datos 'reservas_db' ya existe, NO es necesario ejecutar este script;
--   continúe directamente con el archivo '02_esquema_reservas.sql'.
-- =============================================================================

-- 1. (Opcional) Verificar si la base de datos ya existe antes de crearla:
-- SELECT 1 FROM pg_database WHERE datname = 'reservas_db';

-- 2. Crear la base de datos independiente para el microservicio de Reservas:
CREATE DATABASE reservas_db
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Peru.1252'
    LC_CTYPE = 'Spanish_Peru.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Si su PostgreSQL utiliza configuración regional estándar o Linux/Docker, puede usar:
-- CREATE DATABASE reservas_db WITH OWNER = postgres ENCODING = 'UTF8';

COMMENT ON DATABASE reservas_db
    IS 'Base de datos independiente para el microservicio raices-criollas-reservas';
