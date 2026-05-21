-- Agregar columna 'subtitulo' a template_campos
ALTER TABLE IF EXISTS template_campos
ADD COLUMN IF NOT EXISTS subtitulo TEXT;

COMMENT ON COLUMN template_campos.subtitulo IS 'Texto opcional que se muestra como subtítulo debajo de la etiqueta del campo en el formulario.';
