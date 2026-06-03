-- Migration: mueve firmas de actas a tabla separada

CREATE TABLE IF NOT EXISTS actas_firmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acta_id UUID REFERENCES actas(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('inspector', 'responsable')),
  firma_base64 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_actas_firmas_acta_tipo ON actas_firmas(acta_id, tipo);

CREATE OR REPLACE FUNCTION update_actas_firmas_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_actas_firmas_updated_at
  BEFORE UPDATE ON actas_firmas
  FOR EACH ROW
  EXECUTE FUNCTION update_actas_firmas_updated_at_column();
