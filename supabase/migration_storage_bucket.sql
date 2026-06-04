-- ============================================================
-- Crear bucket 'actas' para almacenar fotos y firmas
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO storage.buckets (id, name, public)
VALUES ('actas', 'actas', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Lectura pública actas" ON storage.objects;
CREATE POLICY "Lectura pública actas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'actas');

DROP POLICY IF EXISTS "Subida autenticada actas" ON storage.objects;
CREATE POLICY "Subida autenticada actas"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'actas');

DROP POLICY IF EXISTS "Eliminación autenticada actas" ON storage.objects;
CREATE POLICY "Eliminación autenticada actas"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'actas');
