const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { rol, id: userId } = req.user;
    const { inspector_id, estado, fechaDesde, fechaHasta } = req.query;

    let query = supabase
      .from('actas')
      .select(`
        *,
        inspector:usuarios!actas_inspector_id_fkey(nombre, dni)
      `)
      .order('created_at', { ascending: false });

    if (rol === 'inspector') {
      query = query.eq('inspector_id', userId);
    } else if (inspector_id) {
      query = query.eq('inspector_id', inspector_id);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (fechaDesde) {
      query = query.gte('fecha', fechaDesde);
    }

    if (fechaHasta) {
      query = query.lte('fecha', fechaHasta);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching actas:', err);
    res.status(500).json({ error: 'Error al obtener actas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data, error } = await supabase
      .from('actas')
      .select(`
        *,
        inspector:usuarios!actas_inspector_id_fkey(nombre, dni)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && data.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener acta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      inspector_id,
      expediente,
      fecha,
      hora,
      virtual,
      presencial,
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      observaciones,
      emplazamiento_dias,
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      establecimiento_tipologia
    } = req.body;

    const actaData = {
      inspector_id,
      expediente,
      fecha,
      hora,
      virtual: virtual || false,
      presencial: presencial !== false,
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      observaciones,
      emplazamiento_dias: emplazamiento_dias || 0,
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      establecimiento_tipologia,
      estado: 'borrador'
    };

    const { data, error } = await supabase
      .from('actas')
      .insert(actaData)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating acta:', err);
    res.status(500).json({ error: 'Error al crear acta' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;
    const updates = req.body;

    console.log('=== PUT /actas/:id ===');
    console.log('ID:', id);
    console.log('Updates recibidos:', JSON.stringify(updates, null, 2));

    const { data: existingActa } = await supabase
      .from('actas')
      .select('inspector_id, estado')
      .eq('id', id)
      .single();

    if (!existingActa) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && existingActa.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    if (existingActa.estado === 'cerrado') {
      return res.status(400).json({ error: 'No se puede modificar un acta cerrada' });
    }

    if (updates.datos_formulario || updates.firma_inspector_base64 || updates.firma_responsable_base64) {
      updates.estado = 'borrador';
    }

    const { data, error } = await supabase
      .from('actas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error updating acta:', err);
    res.status(500).json({ error: 'Error al actualizar acta' });
  }
});

router.post('/:id/firmar', async (req, res) => {
  try {
    const { id } = req.params;
    const { firma_inspector_base64, firma_responsable_base64 } = req.body;
    const { rol, id: userId } = req.user;

    const { data: existingActa } = await supabase
      .from('actas')
      .select('inspector_id, estado')
      .eq('id', id)
      .single();

    if (!existingActa) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && existingActa.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    if (existingActa.estado === 'cerrado') {
      return res.status(400).json({ error: 'Esta acta ya está cerrada' });
    }

    const updates = {};
    if (firma_inspector_base64) {
      updates.firma_inspector_base64 = firma_inspector_base64;
    }
    if (firma_responsable_base64) {
      updates.firma_responsable_base64 = firma_responsable_base64;
    }

    if (firma_inspector_base64 && firma_responsable_base64) {
      updates.estado = 'firmado';
    }

    const { data, error } = await supabase
      .from('actas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error signing acta:', err);
    res.status(500).json({ error: 'Error al firmar acta' });
  }
});

router.patch('/:id/cidi', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: acta } = await supabase
      .from('actas')
      .select('subido_cidi, inspector_id')
      .eq('id', id)
      .single();

    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && acta.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const { data, error } = await supabase
      .from('actas')
      .update({ subido_cidi: !acta.subido_cidi })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    console.error('Error toggle CIDI:', err);
    res.status(500).json({ error: 'Error al actualizar estado CIDI' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.user;

    if (rol !== 'supervisor') {
      return res.status(403).json({ error: 'Solo el supervisor puede eliminar actas' });
    }

    const { error } = await supabase
      .from('actas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Acta eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar acta' });
  }
});

module.exports = router;
