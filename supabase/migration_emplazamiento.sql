-- =============================================
-- Migración: Agregar campos emplazamiento_valor y emplazamiento_tipo
-- Para App de Inspecciones Sanitarias
-- =============================================

-- Agregar columnas si no existen
ALTER TABLE actas ADD COLUMN IF NOT EXISTS emplazamiento_valor INTEGER DEFAULT 0;
ALTER TABLE actas ADD COLUMN IF NOT EXISTS emplazamiento_tipo TEXT DEFAULT 'HORAS' CHECK (emplazamiento_tipo IN ('HORAS', 'DÍAS', 'DIAS'));

-- Migrar datos existentes: copiar emplazamiento_dias a emplazamiento_valor
UPDATE actas SET emplacement_valor = emplazamiento_dias WHERE emplazamiento_valor IS NULL OR emplacement_valor = 0;

-- Actualizar migrated: schema.sql con los nuevos campos
-- REEMPLAZAR en la definición de la tabla actas (líneas 54-55):
-- ANTES:
--   emplazamiento_dias INTEGER DEFAULT 0,
-- DESPUÉS:
--   emplazamiento_dias INTEGER DEFAULT 0,
--   emplazamiento_valor INTEGER DEFAULT 0,
--   emplazamiento_tipo TEXT DEFAULT 'HORAS' CHECK (emplazamiento_tipo IN ('HORAS', 'DÍAS', 'DIAS')),
