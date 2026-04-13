-- =============================================
-- Script SQL para App de Inspecciones Sanitarias
-- Ministerio de Salud - Provincia de Córdoba
-- =============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('inspector', 'arquitecto', 'supervisor')),
  activo BOOLEAN DEFAULT true,
  es_supervisor BOOLEAN DEFAULT false,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: establecimientos
-- =============================================
CREATE TABLE IF NOT EXISTS establecimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  localidad TEXT,
  tipologia TEXT NOT NULL,
  expediente TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: actas
-- =============================================
CREATE TABLE IF NOT EXISTS actas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expediente TEXT,
  inspector_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  establecimiento_id UUID REFERENCES establecimientos(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  virtual BOOLEAN DEFAULT false,
  presencial BOOLEAN DEFAULT true,
  responsable_nombre TEXT,
  responsable_dni TEXT,
  responsable_caracter TEXT,
  datos_formulario JSONB DEFAULT '{}',
  secciones_seleccionadas TEXT[] DEFAULT '{}',
  observaciones TEXT,
  emplazamiento_dias INTEGER DEFAULT 0,
  emplazamiento_valor INTEGER DEFAULT 0,
  emplazamiento_tipo TEXT DEFAULT 'HORAS' CHECK (emplazamiento_tipo IN ('HORAS', 'DÍAS', 'DIAS')),
  tipo_inspeccion TEXT DEFAULT 'RUTINA' CHECK (tipo_inspeccion IN ('HABILITACION', 'RUTINA', 'DENUNCIA')),
  firma_inspector_base64 TEXT,
  firma_responsable_base64 TEXT,
  fotos_urls TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  subido_cidi BOOLEAN DEFAULT false,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'firmado', 'cerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: informes (arquitectos)
-- =============================================
CREATE TABLE IF NOT EXISTS informes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arquitecto_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  establecimiento_id UUID REFERENCES establecimientos(id) ON DELETE SET NULL,
  expediente TEXT,
  fecha DATE NOT NULL,
  datos_formulario JSONB DEFAULT '{}',
  observaciones TEXT,
  firma_arquitecto_base64 TEXT,
  fotos_urls TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'cerrado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_actas_inspector_id ON actas(inspector_id);
CREATE INDEX IF NOT EXISTS idx_actas_establecimiento_id ON actas(establecimiento_id);
CREATE INDEX IF NOT EXISTS idx_actas_fecha ON actas(fecha);
CREATE INDEX IF NOT EXISTS idx_actas_estado ON actas(estado);

CREATE INDEX IF NOT EXISTS idx_informes_arquitecto_id ON informes(arquitecto_id);
CREATE INDEX IF NOT EXISTS idx_informes_fecha ON informes(fecha);

CREATE INDEX IF NOT EXISTS idx_establecimientos_tipologia ON establecimientos(tipologia);

-- =============================================
-- FUNCIONES Y TRIGGERS
-- =============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para usuarios
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para establecimientos
CREATE TRIGGER update_establecimientos_updated_at
  BEFORE UPDATE ON establecimientos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actas
CREATE TRIGGER update_actas_updated_at
  BEFORE UPDATE ON actas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para informes
CREATE TRIGGER update_informes_updated_at
  BEFORE UPDATE ON informes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE establecimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actas ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Solo supervisores pueden ver todos los usuarios" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u2
      WHERE u2.id = auth.uid() AND u2.rol = 'supervisor'
    )
  );

-- Políticas para establecimientos
CREATE POLICY "Cualquier usuario puede ver establecimientos" ON establecimientos
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear establecimientos" ON establecimientos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar establecimientos" ON establecimientos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para actas
CREATE POLICY "Inspectores ven solo sus actas" ON actas
  FOR SELECT USING (
    inspector_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid() AND rol = 'supervisor'
    )
  );

CREATE POLICY "Inspectores pueden crear actas" ON actas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'inspector'
    )
  );

CREATE POLICY "Inspectores pueden actualizar sus actas" ON actas
  FOR UPDATE USING (
    inspector_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'supervisor'
    )
  );

CREATE POLICY "Solo supervisores pueden eliminar actas" ON actas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'supervisor'
    )
  );

-- Políticas para informes
CREATE POLICY "Arquitectos ven solo sus informes" ON informes
  FOR SELECT USING (
    arquitecto_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'supervisor'
    )
  );

CREATE POLICY "Arquitectos pueden crear informes" ON informes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'arquitecto'
    )
  );

CREATE POLICY "Arquitectos pueden actualizar sus informes" ON informes
  FOR UPDATE USING (
    arquitecto_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'supervisor'
    )
  );

-- =============================================
-- DATOS DE PRUEBA
-- =============================================

-- Insertar inspectores de prueba
INSERT INTO usuarios (nombre, dni, rol, activo) VALUES
  ('FABIAN AVILA', '92854906', 'inspector', true),
  ('JUAN PEREZ', '12345678', 'inspector', true),
  ('MARIA GONZALEZ', '87654321', 'inspector', true),
  ('PEDRO RODRIGUEZ', '11223344', 'inspector', true),
  ('ANA MARTINEZ', '55667788', 'inspector', true);

-- Insertar arquitectos de prueba
INSERT INTO usuarios (nombre, dni, rol, activo) VALUES
  ('CARLOS LOPEZ', '99887766', 'arquitecto', true),
  ('LAURA SANCHEZ', '55443322', 'arquitecto', true);

-- Insertar supervisor de prueba
INSERT INTO usuarios (nombre, dni, rol, activo, es_supervisor) VALUES
  ('SUPERVISOR GENERAL', '11111111', 'supervisor', true, true);

-- Insertar establecimientos de prueba
INSERT INTO establecimientos (nombre, direccion, localidad, tipologia, expediente) VALUES
  ('Hospital Provincial', 'Av. Argentina 123', 'Córdoba Capital', 'quirurgicos', 'EXP-2024-001'),
  ('Centro de Salud San Martín', 'San Martín 456', 'Córdoba Capital', 'consultorios', 'EXP-2024-002'),
  ('Clínica del Sol', 'Belgrano 789', 'Villa María', 'hemodialisis', 'EXP-2024-003'),
  ('Laboratorio Central', 'Dean Funes 101', 'Córdoba Capital', 'laboratorio', 'EXP-2024-004');

-- =============================================
-- NOTAS FINALES
-- =============================================
-- 1. Configurar la autenticación en Supabase (Auth providers)
-- 2. Agregar las variables de entorno en el backend:
--    - SUPABASE_URL
--    - SUPABASE_SERVICE_KEY
--    - JWT_SECRET
-- 3. Configurar Google Drive API con cuenta de servicio
-- 4. Agregar logos del Ministerio en base64 como variables de entorno
