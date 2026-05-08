const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

function soloAdmin(req, res, next) {
  if (req.user.rol !== 'supervisor' && req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores pueden modificar templates de informes' });
  }
  next();
}

// ============================================================
// TIPOLOGÍAS
// ============================================================

// GET /api/informes-templates/tipologias
router.get('/tipologias', async (req, res) => {
  try {
    const { todas } = req.query;
    let query = supabase
      .from('informe_tipologia')
      .select('*')
      .order('nombre');

    if (!todas) query = query.eq('activo', true);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo tipologías de informe:', err);
    res.status(500).json({ error: 'Error al obtener tipologías' });
  }
});

// GET /api/informes-templates/tipologias/:id/items
router.get('/tipologias/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('informe_items')
      .select('*')
      .eq('tipologia_id', id)
      .order('orden');

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo items de informe:', err);
    res.status(500).json({ error: 'Error al obtener items' });
  }
});

// GET /api/informes-templates/tipologias/por-nombre/:nombre
router.get('/tipologias/por-nombre/:nombre', async (req, res) => {
  try {
    const { nombre } = req.params;
    const { data: tipologia, error: errTip } = await supabase
      .from('informe_tipologia')
      .select('*')
      .ilike('nombre', nombre)
      .eq('activo', true)
      .single();

    if (errTip || !tipologia) {
      return res.status(404).json({ error: 'No hay template para esta tipología' });
    }

    const { data: items, error: errItems } = await supabase
      .from('informe_items')
      .select('*')
      .eq('tipologia_id', tipologia.id)
      .order('orden');

    if (errItems) throw errItems;
    res.json({ ...tipologia, items: items || [] });
  } catch (err) {
    console.error('Error obteniendo tipología por nombre:', err);
    res.status(500).json({ error: 'Error al obtener tipología' });
  }
});

// POST /api/informes-templates/tipologias  (solo admin/supervisor)
router.post('/tipologias', soloAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' });

    const { data, error } = await supabase
      .from('informe_tipologia')
      .insert({ nombre, descripcion })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(400).json({ error: 'Ya existe una tipología con ese nombre' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando tipología de informe:', err);
    res.status(500).json({ error: 'Error al crear tipología' });
  }
});

// PUT /api/informes-templates/tipologias/:id  (solo admin/supervisor)
router.put('/tipologias/:id', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (activo !== undefined) updates.activo = activo;

    const { data, error } = await supabase
      .from('informe_tipologia')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando tipología de informe:', err);
    res.status(500).json({ error: 'Error al actualizar tipología' });
  }
});

// DELETE /api/informes-templates/tipologias/:id  (solo admin/supervisor)
router.delete('/tipologias/:id', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar primero los items de esta tipología
    await supabase
      .from('informe_items')
      .delete()
      .eq('tipologia_id', id);

    // Eliminar la tipología
    const { error } = await supabase
      .from('informe_tipologia')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Tipología eliminada permanentemente' });
  } catch (err) {
    console.error('Error eliminando tipología de informe:', err);
    res.status(500).json({ error: 'Error al eliminar tipología' });
  }
});

// ============================================================
// ITEMS
// ============================================================

// POST /api/informes-templates/tipologias/:id/items  (solo admin/supervisor)
router.post('/tipologias/:id/items', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nro, descripcion, orden, grupo, subgrupo, refs } = req.body;

    if (!nro || !descripcion) {
      return res.status(400).json({ error: 'nro y descripcion son requeridos' });
    }

    let ordenFinal = orden;
    if (ordenFinal === undefined) {
      const { data: ultimo } = await supabase
        .from('informe_items')
        .select('orden')
        .eq('tipologia_id', id)
        .order('orden', { ascending: false })
        .limit(1)
        .single();
      ordenFinal = ultimo ? ultimo.orden + 1 : 0;
    }

    const { data, error } = await supabase
      .from('informe_items')
      .insert({ tipologia_id: parseInt(id), nro, descripcion, orden: ordenFinal, grupo: grupo || null, subgrupo: subgrupo || null, refs: refs || null })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando item de informe:', err);
    res.status(500).json({ error: 'Error al crear item' });
  }
});

// PUT /api/informes-templates/items/:id  (solo admin/supervisor)
router.put('/items/:id', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nro, descripcion, orden, grupo, subgrupo, refs } = req.body;
    const updates = {};
    if (nro !== undefined) updates.nro = nro;
    if (descripcion !== undefined) updates.descripcion = descripcion;
    if (orden !== undefined) updates.orden = orden;
    if (grupo !== undefined) updates.grupo = grupo || null;
    if (subgrupo !== undefined) updates.subgrupo = subgrupo || null;
    if (refs !== undefined) updates.refs = refs || null;

    const { data, error } = await supabase
      .from('informe_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando item de informe:', err);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
});

async function reordenarInformeItems(items) {
  const BASE_TEMP = 100000;
  for (let i = 0; i < items.length; i++) {
    const { error } = await supabase.from('informe_items').update({ orden: BASE_TEMP + i }).eq('id', items[i].id);
    if (error) { console.error('[reordenarInformeItems] temp update error:', error); return error; }
  }
  for (let i = 0; i < items.length; i++) {
    const { error } = await supabase.from('informe_items').update({ orden: i }).eq('id', items[i].id);
    if (error) { console.error('[reordenarInformeItems] final update error:', error); return error; }
  }
  return null;
}

// PUT /api/informes-templates/items/:id/mover-arriba  (solo admin/supervisor)
router.put('/items/:id/mover-arriba', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: itemActual, error: errActual } = await supabase
      .from('informe_items').select('id, tipologia_id, orden').eq('id', id).single();
    if (errActual || !itemActual) return res.status(404).json({ error: 'Artículo no encontrado' });

    const { data: todos, error: errTodos } = await supabase
      .from('informe_items').select('id, orden').eq('tipologia_id', itemActual.tipologia_id).order('orden');
    if (errTodos) throw errTodos;

    const idx = (todos || []).findIndex(i => i.id == itemActual.id);
    if (idx <= 0) return res.json({ message: 'El artículo ya está al inicio' });

    [todos[idx], todos[idx - 1]] = [todos[idx - 1], todos[idx]];
    const err = await reordenarInformeItems(todos);
    if (err) return res.status(500).json({ error: 'Error al guardar orden' });

    res.json({ message: 'Artículo movido hacia arriba' });
  } catch (err) {
    console.error('Error moviendo artículo arriba:', err);
    res.status(500).json({ error: 'Error al mover artículo' });
  }
});

// PUT /api/informes-templates/items/:id/mover-abajo  (solo admin/supervisor)
router.put('/items/:id/mover-abajo', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: itemActual, error: errActual } = await supabase
      .from('informe_items').select('id, tipologia_id, orden').eq('id', id).single();
    if (errActual || !itemActual) return res.status(404).json({ error: 'Artículo no encontrado' });

    const { data: todos, error: errTodos } = await supabase
      .from('informe_items').select('id, orden').eq('tipologia_id', itemActual.tipologia_id).order('orden');
    if (errTodos) throw errTodos;

    const idx = (todos || []).findIndex(i => i.id == itemActual.id);
    if (idx < 0 || idx >= (todos || []).length - 1) return res.json({ message: 'El artículo ya está al final' });

    [todos[idx], todos[idx + 1]] = [todos[idx + 1], todos[idx]];
    const err = await reordenarInformeItems(todos);
    if (err) return res.status(500).json({ error: 'Error al guardar orden' });

    res.json({ message: 'Artículo movido hacia abajo' });
  } catch (err) {
    console.error('Error moviendo artículo abajo:', err);
    res.status(500).json({ error: 'Error al mover artículo' });
  }
});

// DELETE /api/informes-templates/items/:id  (solo admin/supervisor)
router.delete('/items/:id', soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('informe_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    console.error('Error eliminando item de informe:', err);
    res.status(500).json({ error: 'Error al eliminar item' });
  }
});

module.exports = router;
