-- =============================================================================
-- PROYECTO: Raíces Criollas - Microservicio de Reservas
-- ARCHIVO: 04_migracion_precios_y_pagos.sql
-- DESCRIPCIÓN: Migración no destructiva para incorporar Precios y Estados de Pago
-- BASE DE DATOS: reservas_db
-- =============================================================================
-- INSTRUCCIONES PARA PGADMIN 4:
-- 1. Abra el Query Tool conectado específicamente a 'reservas_db'.
-- 2. Ejecute este script completo para actualizar una base de datos existente
--    sin pérdida de datos de mesas ni de reservas previas.
-- =============================================================================

-- =============================================================================
-- 1. MODIFICACIÓN DE TABLA: mesas
-- Agregar tarifa base por mesa (precio_base en PEN)
-- =============================================================================
ALTER TABLE mesas 
    ADD COLUMN IF NOT EXISTS precio_base NUMERIC(10, 2) NOT NULL DEFAULT 20.00;

-- Asegurar que los registros existentes tengan valor válido
UPDATE mesas SET precio_base = 20.00 WHERE precio_base IS NULL;

-- Restricción de precio positivo (incorporada de forma segura)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_mesas_precio_base_positivo'
    ) THEN
        ALTER TABLE mesas 
            ADD CONSTRAINT chk_mesas_precio_base_positivo CHECK (precio_base >= 0);
    END IF;
END $$;

COMMENT ON COLUMN mesas.precio_base IS 'Tarifa base de reserva de la mesa en Soles (PEN)';

-- =============================================================================
-- 2. MODIFICACIÓN DE TABLA: reservas
-- Incorporar monto_total, moneda, estado_pago y fecha_expiracion_pago
-- =============================================================================
ALTER TABLE reservas 
    ADD COLUMN IF NOT EXISTS monto_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE reservas 
    ADD COLUMN IF NOT EXISTS moneda VARCHAR(3) NOT NULL DEFAULT 'PEN';

ALTER TABLE reservas 
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE';

ALTER TABLE reservas 
    ADD COLUMN IF NOT EXISTS fecha_expiracion_pago TIMESTAMP WITHOUT TIME ZONE;

-- Asegurar consistencia de datos existentes
UPDATE reservas SET monto_total = 0.00 WHERE monto_total IS NULL;
UPDATE reservas SET moneda = 'PEN' WHERE moneda IS NULL;
UPDATE reservas SET estado_pago = 'PENDIENTE' WHERE estado_pago IS NULL;

-- Restricciones de validación de negocio para reservas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_reservas_monto_total_positivo'
    ) THEN
        ALTER TABLE reservas 
            ADD CONSTRAINT chk_reservas_monto_total_positivo CHECK (monto_total >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_reservas_estado_pago_valido'
    ) THEN
        ALTER TABLE reservas 
            ADD CONSTRAINT chk_reservas_estado_pago_valido 
            CHECK (estado_pago IN ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO'));
    END IF;
END $$;

COMMENT ON COLUMN reservas.monto_total IS 'Importe total calculado por el backend para la reserva';
COMMENT ON COLUMN reservas.moneda IS 'Código ISO de la moneda (PEN)';
COMMENT ON COLUMN reservas.estado_pago IS 'Estado del ciclo de pago: PENDIENTE, PAGADO, FALLIDO o REEMBOLSADO';
COMMENT ON COLUMN reservas.fecha_expiracion_pago IS 'Fecha y hora límite de pago para liberar automáticamente la disponibilidad';

-- =============================================================================
-- 3. ÍNDICES DE RENDIMIENTO ADICIONALES
-- =============================================================================

-- Índice optimizado para disponibilidad y prevención de solapamientos con expiración
CREATE INDEX IF NOT EXISTS idx_reservas_mesa_horario_pago 
    ON reservas (mesa_id, estado, estado_pago, fecha_inicio, fecha_fin, fecha_expiracion_pago);

-- Índice optimizado para consultas de reservas por estado de pago y expiración
CREATE INDEX IF NOT EXISTS idx_reservas_pago_expiracion 
    ON reservas (estado, estado_pago, fecha_expiracion_pago);

-- =============================================================================
-- 4. VERIFICACIÓN DE ESTRUCTURA Y CONSISTENCIA
-- =============================================================================
-- Comprobar columnas añadidas en 'mesas'
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'mesas' AND column_name = 'precio_base';

-- Comprobar columnas añadidas en 'reservas'
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'reservas' 
  AND column_name IN ('monto_total', 'moneda', 'estado_pago', 'fecha_expiracion_pago');
