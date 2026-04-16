const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { rol, id: userId } = req.user;

    if (rol !== 'arquitecto' && rol !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    let query = supabase
      .from('informes')
      .select(`
        *,
        arquitecto:usuarios!informes_arquitecto_id_fkey(nombre, dni)
      `)
      .order('created_at', { ascending: false });

    if (rol === 'arquitecto') {
      query = query.eq('arquitecto_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching informes:', err);
    res.status(500).json({ error: 'Error al obtener informes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data, error } = await supabase
      .from('informes')
      .select(`
        *,
        arquitecto:usuarios!informes_arquitecto_id_fkey(nombre, dni)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    if (rol === 'arquitecto' && data.arquitecto_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a este informe' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener informe' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { rol, id: userId } = req.user;

    if (rol !== 'arquitecto') {
      return res.status(403).json({ error: 'Solo arquitectos pueden crear informes' });
    }

    const {
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      expediente,
      fecha,
      datos_formulario,
      observaciones
    } = req.body;

    const { data, error } = await supabase
      .from('informes')
      .insert({
        arquitecto_id: userId,
        establecimiento_nombre,
        establecimiento_direccion,
        establecimiento_localidad,
        expediente,
        fecha,
        datos_formulario,
        observaciones,
        estado: 'borrador'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating informe:', err);
    res.status(500).json({ error: 'Error al crear informe' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: existingInforme } = await supabase
      .from('informes')
      .select('arquitecto_id, estado')
      .eq('id', id)
      .single();

    if (!existingInforme) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    if (rol === 'arquitecto' && existingInforme.arquitecto_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a este informe' });
    }

    const updates = req.body;

    const { data, error } = await supabase
      .from('informes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating informe:', err);
    res.status(500).json({ error: 'Error al actualizar informe' });
  }
});

// PATCH /api/informes/:id/cidi - Toggle subido a CIDI
router.patch('/:id/cidi', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: existingInforme } = await supabase
      .from('informes')
      .select('arquitecto_id')
      .eq('id', id)
      .single();

    if (!existingInforme) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    if (rol === 'arquitecto' && existingInforme.arquitecto_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a este informe' });
    }

    // Toggle: invertir el valor actual
    const { data: current } = await supabase
      .from('informes')
      .select('subido_cidi')
      .eq('id', id)
      .single();

    const nuevoValor = !(current?.subido_cidi);

    const { data, error } = await supabase
      .from('informes')
      .update({ subido_cidi: nuevoValor })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error toggling cidi:', err);
    res.status(500).json({ error: 'Error al actualizar CIDI' });
  }
});

module.exports = router;
