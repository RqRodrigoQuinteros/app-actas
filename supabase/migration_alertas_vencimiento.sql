-- Migration: Sistema de Alertas de Vencimiento
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar columna email a usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Tabla para trackear alertas enviadas
CREATE TABLE IF NOT EXISTS alertas_vencimiento (
  id SERIAL PRIMARY KEY,
  acta_id UUID REFERENCES actas(id) ON DELETE CASCADE,
  inspector_id UUID REFERENCES usuarios(id),
  fecha_envio TIMESTAMPTZ DEFAULT now(),
  tipo TEXT DEFAULT 'vencimiento',
  estado TEXT DEFAULT 'enviado' CHECK (estado IN ('enviado', 'fallido', 'reenviado')),
  error_msg TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_alertas_vencimiento_acta_id ON alertas_vencimiento(acta_id);
CREATE INDEX IF NOT EXISTS idx_alertas_vencimiento_inspector_id ON alertas_vencimiento(inspector_id);
CREATE INDEX IF NOT EXISTS idx_alertas_vencimiento_estado ON alertas_vencimiento(estado);
