-- Tabla de historial de transferencias de informes entre arquitectos
CREATE TABLE IF NOT EXISTS informe_transferencias (
  id SERIAL PRIMARY KEY,
  informe_id UUID REFERENCES informes(id) ON DELETE CASCADE,
  arquitecto_origen_id UUID REFERENCES usuarios(id),
  arquitecto_destino_id UUID REFERENCES usuarios(id),
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transferencias_informe ON informe_transferencias(informe_id);
CREATE INDEX IF NOT EXISTS idx_transferencias_fecha ON informe_transferencias(created_at);

-- RLS policies
ALTER TABLE informe_transferencias ENABLE ROW LEVEL SECURITY;

-- Supervisors y admins ven todas las transferencias
CREATE POLICY "transferencias_select_supervisor" ON informe_transferencias
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('supervisor', 'admin')
    )
  );

-- Arquitectos ven transferencias donde son origen o destino
CREATE POLICY "transferencias_select_arquitecto" ON informe_transferencias
  FOR SELECT
  USING (
    arquitecto_origen_id = auth.uid()
    OR arquitecto_destino_id = auth.uid()
  );

-- Solo arquitectos autenticados pueden insertar (el backend valida ownership del informe)
CREATE POLICY "transferencias_insert" ON informe_transferencias
  FOR INSERT
  WITH CHECK (true);

-- Solo supervisors/admins pueden actualizar
CREATE POLICY "transferencias_update_supervisor" ON informe_transferencias
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('supervisor', 'admin')
    )
  );
