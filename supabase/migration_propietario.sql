-- Migración: Agregar columna propietario a tabla actas
ALTER TABLE actas
ADD COLUMN IF NOT EXISTS propietario TEXT;
