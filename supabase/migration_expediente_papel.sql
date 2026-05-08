-- Agregar columna 'expediente_papel' a actas
-- Permite registrar el número de expediente en papel separado del digital

ALTER TABLE IF EXISTS actas
ADD COLUMN IF NOT EXISTS expediente_papel TEXT DEFAULT NULL;

COMMENT ON COLUMN actas.expediente_papel IS 'Número de expediente en papel. Ej: 0114-097341/1991. El campo expediente existente corresponde al expediente digital.';
