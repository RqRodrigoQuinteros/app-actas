-- Nuevas columnas para configurar pasos obligatorios por tipología
ALTER TABLE template_tipologia ADD COLUMN IF NOT EXISTS requiere_propietario_director BOOLEAN DEFAULT true;
ALTER TABLE template_tipologia ADD COLUMN IF NOT EXISTS requiere_responsable BOOLEAN DEFAULT true;
ALTER TABLE template_tipologia ADD COLUMN IF NOT EXISTS requiere_firma_responsable BOOLEAN DEFAULT true;
