-- Migración: Agregar campos de Director Técnico a tabla actas
-- Descripción: Agrega campos para director_tecnico_nombre, director_tecnico_apellido, director_tecnico_dni, director_tecnico_matricula

ALTER TABLE actas 
ADD COLUMN IF NOT EXISTS director_tecnico_nombre TEXT,
ADD COLUMN IF NOT EXISTS director_tecnico_apellido TEXT,
ADD COLUMN IF NOT EXISTS director_tecnico_dni TEXT,
ADD COLUMN IF NOT EXISTS director_tecnico_matricula TEXT;

-- Estos campos se usarán antes de los datos del responsable en el formulario
-- El responsable_nombre, responsable_dni, responsable_caracter se mantienen al final
