const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Middleware: solo supervisores pueden modificar templates
function soloSupervisor(req, res, next) {
  if (req.user.rol !== 'supervisor' && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo supervisores pueden modificar templates' });
  }
  next();
}

// ============================================================
// ENCABEZADO CONFIG
// ============================================================

// GET /api/templates/encabezado
// Devuelve el encabezado activo (cualquier rol puede leerlo, lo necesita el PDF)
router.get('/encabezado', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('encabezado_config')
      .select('*')
      .eq('activo', true)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error obteniendo encabezado:', err);
    res.status(500).json({ error: 'Error al obtener encabezado' });
  }
});

// PUT /api/templates/encabezado
// Actualiza el texto del encabezado activo (solo supervisor)
router.put('/encabezado', soloSupervisor, async (req, res) => {
  try {
    const { texto_html, texto_emplazamiento } = req.body;

    if (!texto_html) {
      return res.status(400).json({ error: 'texto_html es requerido' });
    }

    const { data, error } = await supabase
      .from('encabezado_config')
      .update({ texto_html, texto_emplazamiento })
      .eq('activo', true)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando encabezado:', err);
    res.status(500).json({ error: 'Error al actualizar encabezado' });
  }
});

// ============================================================
// TIPOLOGÍAS
// ============================================================

// GET /api/templates/tipologias
// Lista todas las tipologías (activas o todas si ?todas=true)
router.get('/tipologias', async (req, res) => {
  try {
    const { todas } = req.query;

    let query = supabase
      .from('template_tipologia')
      .select('*')
      .order('nombre');

    if (!todas) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo tipologías:', err);
    res.status(500).json({ error: 'Error al obtener tipologías' });
  }
});

// GET /api/templates/tipologias/:id
// Devuelve una tipología con sus secciones y campos completos
router.get('/tipologias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: tipologia, error: errTip } = await supabase
      .from('template_tipologia')
      .select('*')
      .eq('id', id)
      .single();

    if (errTip || !tipologia) {
      return res.status(404).json({ error: 'Tipología no encontrada' });
    }

    const { data: secciones, error: errSec } = await supabase
      .from('template_secciones')
      .select(`
        *,
        campos:template_campos(*)
      `)
      .eq('tipologia_id', id)
      .order('orden');

    if (errSec) throw errSec;

    // Ordenar campos dentro de cada sección
    const seccionesOrdenadas = (secciones || []).map(s => ({
      ...s,
      campos: (s.campos || []).sort((a, b) => a.orden - b.orden)
    }));

    res.json({ ...tipologia, secciones: seccionesOrdenadas });
  } catch (err) {
    console.error('Error obteniendo tipología:', err);
    res.status(500).json({ error: 'Error al obtener tipología' });
  }
});

// GET /api/templates/tipologias/por-nombre/:nombre
// Busca tipología por nombre (para matchear con establecimiento_tipologia del acta)
router.get('/tipologias/por-nombre/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;

    const { data: tipologia, error: errTip } = await supabase
      .from('template_tipologia')
      .select('*')
      .ilike('nombre', nombre)
      .eq('activo', true)
      .single();

    if (errTip || !tipologia) {
      return res.status(404).json({ error: 'No hay template para esta tipología' });
    }

    const { data: secciones, error: errSec } = await supabase
      .from('template_secciones')
      .select(`
        *,
        campos:template_campos(*)
      `)
      .eq('tipologia_id', tipologia.id)
      .order('orden');

    if (errSec) throw errSec;

    const seccionesOrdenadas = (secciones || []).map(s => ({
      ...s,
      campos: (s.campos || []).sort((a, b) => a.orden - b.orden)
    }));

    res.json({ ...tipologia, secciones: seccionesOrdenadas });
  } catch (err) {
    console.error('Error obteniendo tipología por nombre:', err);
    res.status(500).json({ error: 'Error al obtener tipología' });
  }
});

// POST /api/templates/tipologias
// Crea una tipología nueva (solo supervisor)
router.post('/tipologias', soloSupervisor, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }

    const { data, error } = await supabase
      .from('template_tipologia')
      .insert({ nombre, descripcion })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Ya existe una tipología con ese nombre' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando tipología:', err);
    res.status(500).json({ error: 'Error al crear tipología' });
  }
});

// PUT /api/templates/tipologias/:id
// Actualiza nombre/descripcion/activo de una tipología (solo supervisor)
router.put('/tipologias/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (activo !== undefined) updates.activo = activo;

    const { data, error } = await supabase
      .from('template_tipologia')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando tipología:', err);
    res.status(500).json({ error: 'Error al actualizar tipología' });
  }
});

// DELETE /api/templates/tipologias/:id
// Desactiva una tipología (no borra, por integridad con actas existentes)
router.delete('/tipologias/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('template_tipologia')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Tipología desactivada', data });
  } catch (err) {
    console.error('Error desactivando tipología:', err);
    res.status(500).json({ error: 'Error al desactivar tipología' });
  }
});

// ============================================================
// SECCIONES
// ============================================================

// POST /api/templates/tipologias/:tipologiaId/secciones
// Agrega una sección a una tipología
router.post('/tipologias/:tipologiaId/secciones', soloSupervisor, async (req, res) => {
  try {
    const { tipologiaId } = req.params;
    const { titulo, texto_previo, texto_posterior, orden } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'titulo es requerido' });
    }

    // Si no se manda orden, la pone al final
    let ordenFinal = orden;
    if (ordenFinal === undefined) {
      const { data: ultima } = await supabase
        .from('template_secciones')
        .select('orden')
        .eq('tipologia_id', tipologiaId)
        .order('orden', { ascending: false })
        .limit(1)
        .single();
      ordenFinal = ultima ? ultima.orden + 1 : 0;
    }

    const { tipo, repetible } = req.body;

    const { data, error } = await supabase
      .from('template_secciones')
      .insert({
        tipologia_id: parseInt(tipologiaId),
        titulo,
        texto_previo: texto_previo || null,
        texto_posterior: texto_posterior || null,
        orden: ordenFinal,
        tipo: tipo || 'normal',
        repetible: repetible ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando sección:', err);
    res.status(500).json({ error: 'Error al crear sección' });
  }
});

// PUT /api/templates/secciones/:id
// Edita título, textos u orden de una sección
router.put('/secciones/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, texto_previo, texto_posterior, orden, tipo, repetible } = req.body;

    const updates = {};
    if (titulo !== undefined) updates.titulo = titulo;
    if (texto_previo !== undefined) updates.texto_previo = texto_previo;
    if (texto_posterior !== undefined) updates.texto_posterior = texto_posterior;
    if (orden !== undefined) updates.orden = orden;
    if (tipo !== undefined) updates.tipo = tipo;
    if (repetible !== undefined) updates.repetible = repetible;

    const { data, error } = await supabase
      .from('template_secciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando sección:', err);
    res.status(500).json({ error: 'Error al actualizar sección' });
  }
});

// DELETE /api/templates/secciones/:id
// Borra una sección y sus campos (CASCADE en la BD)
router.delete('/secciones/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('template_secciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Sección eliminada' });
  } catch (err) {
    console.error('Error eliminando sección:', err);
    res.status(500).json({ error: 'Error al eliminar sección' });
  }
});

// ============================================================
// CAMPOS
// ============================================================

// POST /api/templates/secciones/:seccionId/campos
// Agrega un campo a una sección
router.post('/secciones/:seccionId/campos', soloSupervisor, async (req, res) => {
  try {
    const { seccionId } = req.params;
    const { etiqueta, tipo, opciones, requerido, placeholder, token, orden } = req.body;

    if (!etiqueta || !token) {
      return res.status(400).json({ error: 'etiqueta y token son requeridos' });
    }

    const tiposValidos = ['si_no', 'texto', 'textarea', 'numero', 'fecha', 'select', 'check'];
    if (tipo && !tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: `tipo debe ser uno de: ${tiposValidos.join(', ')}` });
    }

    if (tipo === 'select' && (!opciones || !Array.isArray(opciones) || opciones.length === 0)) {
      return res.status(400).json({ error: 'Para tipo select, opciones debe ser un array no vacío' });
    }

    // Si no se manda orden, lo pone al final
    let ordenFinal = orden;
    if (ordenFinal === undefined) {
      const { data: ultimo } = await supabase
        .from('template_campos')
        .select('orden')
        .eq('seccion_id', seccionId)
        .order('orden', { ascending: false })
        .limit(1)
        .single();
      ordenFinal = ultimo ? ultimo.orden + 1 : 0;
    }

    const { data, error } = await supabase
      .from('template_campos')
      .insert({
        seccion_id: parseInt(seccionId),
        etiqueta,
        tipo: tipo || 'si_no',
        opciones: opciones || null,
        requerido: requerido || false,
        placeholder: placeholder || null,
        token,
        orden: ordenFinal
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Ya existe un campo con ese token en esta sección' });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando campo:', err);
    res.status(500).json({ error: 'Error al crear campo' });
  }
});

// PUT /api/templates/campos/:id
// Edita un campo
router.put('/campos/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;
    const { etiqueta, tipo, opciones, requerido, placeholder, token, orden } = req.body;

    const updates = {};
    if (etiqueta !== undefined) updates.etiqueta = etiqueta;
    if (tipo !== undefined) updates.tipo = tipo;
    if (opciones !== undefined) updates.opciones = opciones;
    if (requerido !== undefined) updates.requerido = requerido;
    if (placeholder !== undefined) updates.placeholder = placeholder;
    if (token !== undefined) updates.token = token;
    if (orden !== undefined) updates.orden = orden;

    const { data, error } = await supabase
      .from('template_campos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando campo:', err);
    res.status(500).json({ error: 'Error al actualizar campo' });
  }
});

// DELETE /api/templates/campos/:id
// Borra un campo
router.delete('/campos/:id', soloSupervisor, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('template_campos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Campo eliminado' });
  } catch (err) {
    console.error('Error eliminando campo:', err);
    res.status(500).json({ error: 'Error al eliminar campo' });
  }
});

// ============================================================
// RESPUESTAS DE ACTAS
// ============================================================

// GET /api/templates/actas/:actaId/respuestas
// Trae todas las respuestas de un acta
router.get('/actas/:actaId/respuestas', async (req, res) => {
  try {
    const { actaId } = req.params;

    const { data, error } = await supabase
      .from('actas_respuestas')
      .select('*, campo:template_campos(etiqueta, tipo, token, orden, seccion:template_secciones(titulo, orden))')
      .eq('acta_id', actaId);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo respuestas:', err);
    res.status(500).json({ error: 'Error al obtener respuestas' });
  }
});

// POST /api/templates/actas/:actaId/respuestas
// Guarda o actualiza las respuestas de un acta (upsert masivo)
// Body: { respuestas: [{ campo_id, valor }] }
router.post('/actas/:actaId/respuestas', async (req, res) => {
  try {
    const { actaId } = req.params;
    const { respuestas } = req.body;

    if (!Array.isArray(respuestas) || respuestas.length === 0) {
      return res.status(400).json({ error: 'respuestas debe ser un array no vacío' });
    }

    // Verificar que el acta existe y que el usuario tiene acceso
    const { data: acta } = await supabase
      .from('actas')
      .select('inspector_id, estado')
      .eq('id', actaId)
      .single();

    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (acta.estado === 'cerrado') {
      return res.status(400).json({ error: 'No se pueden modificar respuestas de un acta cerrada' });
    }

    if (req.user.rol === 'inspector' && acta.inspector_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const payload = respuestas.map(r => ({
      acta_id: actaId,
      campo_id: r.campo_id,
      valor: r.valor !== undefined ? String(r.valor) : null
    }));

    const { data, error } = await supabase
      .from('actas_respuestas')
      .upsert(payload, { onConflict: 'acta_id,campo_id' })
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error guardando respuestas:', err);
    res.status(500).json({ error: 'Error al guardar respuestas' });
  }
});

module.exports = router;