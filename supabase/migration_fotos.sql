-- Migration: separa fotos de actas en tabla actas_fotos

CREATE TABLE IF NOT EXISTS actas_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  acta_id UUID REFERENCES actas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actas_fotos_acta_id ON actas_fotos(acta_id);

CREATE OR REPLACE FUNCTION update_actas_fotos_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_actas_fotos_updated_at'
  ) THEN
    CREATE TRIGGER update_actas_fotos_updated_at
      BEFORE UPDATE ON actas_fotos
      FOR EACH ROW
      EXECUTE FUNCTION update_actas_fotos_updated_at_column();
  END IF;
END;
$$;
