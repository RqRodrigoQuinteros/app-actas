-- Agregar columna 'formula' a template_campos
-- Permite guardar fórmulas personalizadas para campos de tipo tabla_equipamiento

ALTER TABLE IF EXISTS template_campos
ADD COLUMN IF NOT EXISTS formula TEXT DEFAULT NULL;

-- Comentario para documentar la columna
COMMENT ON COLUMN template_campos.formula IS 'Fórmula para calcular cantidad requerida en campos tabla_equipamiento. Ej: quirofanos * 2 + 1. Referencias: usar tokens de campos numéricos anteriores.';
