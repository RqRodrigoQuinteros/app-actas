-- Migration: Pedidos de Inspección (carga -> asignación -> pendientes del inspector)
-- Ejecutar en Supabase SQL Editor
-- Es seguro volver a correr este script completo (usa IF NOT EXISTS / DROP+CREATE).

-- 1. Habilitar el nuevo rol carga_inspeccion en usuarios
-- Nota: se incluye también 'auditor' porque ya existe 1 usuario con ese rol en producción
-- (no documentado en el repo) y la nueva constraint debe seguir permitiéndolo.
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('inspector', 'arquitecto', 'supervisor', 'admin', 'auditor', 'carga_inspeccion'));

-- 2. Tabla de pedidos (patrón desnormalizado, igual que actas)
CREATE TABLE IF NOT EXISTS pedidos_inspeccion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente TEXT NOT NULL,
  establecimiento_nombre TEXT NOT NULL,
  establecimiento_direccion TEXT NOT NULL,
  establecimiento_tipologia TEXT NOT NULL,

  -- Nombre del auditor que pidió la inspección (lista fija en el frontend,
  -- no vinculada a la tabla usuarios)
  pedido_por TEXT NOT NULL DEFAULT '',

  -- 'tomado': el inspector lo tomó y aparece como card destacada en "Mis Actas"
  -- 'completado': el inspector ya creó el acta y descartó la card manualmente
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'asignado', 'tomado', 'completado', 'cancelado')),

  creado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  inspector_asignado_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  asignado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  asignado_at TIMESTAMPTZ,
  tomado_at TIMESTAMPTZ,
  completado_at TIMESTAMPTZ,

  -- Trazabilidad de reinspecciones: si el auditor confirmó cargar el pedido
  -- pese a que ya existía un acta previa para el mismo establecimiento
  acta_relacionada_id UUID REFERENCES actas(id) ON DELETE SET NULL,
  motivo_duplicado TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Por si el script ya se había corrido antes de que se agregaran estos campos
ALTER TABLE pedidos_inspeccion ADD COLUMN IF NOT EXISTS pedido_por TEXT NOT NULL DEFAULT '';
ALTER TABLE pedidos_inspeccion ADD COLUMN IF NOT EXISTS completado_at TIMESTAMPTZ;
ALTER TABLE pedidos_inspeccion DROP CONSTRAINT IF EXISTS pedidos_inspeccion_estado_check;
ALTER TABLE pedidos_inspeccion ADD CONSTRAINT pedidos_inspeccion_estado_check
  CHECK (estado IN ('pendiente', 'asignado', 'tomado', 'completado', 'cancelado'));

CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos_inspeccion(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_inspector_asignado ON pedidos_inspeccion(inspector_asignado_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_creado_por ON pedidos_inspeccion(creado_por);
CREATE INDEX IF NOT EXISTS idx_pedidos_pedido_por ON pedidos_inspeccion(pedido_por);
CREATE INDEX IF NOT EXISTS idx_pedidos_expediente ON pedidos_inspeccion(expediente);

DROP TRIGGER IF EXISTS update_pedidos_inspeccion_updated_at ON pedidos_inspeccion;
CREATE TRIGGER update_pedidos_inspeccion_updated_at
  BEFORE UPDATE ON pedidos_inspeccion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Tabla de tipologías de pedido (lista propia, distinta a template_tipologia
-- que usa el inspector). Configurable desde /admin/templates.
CREATE TABLE IF NOT EXISTS pedido_tipologia (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DROP TRIGGER IF EXISTS update_pedido_tipologia_updated_at ON pedido_tipologia;
CREATE TRIGGER update_pedido_tipologia_updated_at
  BEFORE UPDATE ON pedido_tipologia
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índice de búsqueda por domicilio en actas, usado para detectar reinspecciones
-- (la detección de duplicados ahora es por expediente o domicilio, no por nombre)
CREATE INDEX IF NOT EXISTS idx_actas_establecimiento_direccion ON actas(establecimiento_direccion);
