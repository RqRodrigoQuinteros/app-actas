const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const ACTAS_FALLBACK_COLUMNS = [
  'secciones_seleccionadas',
  'tipo_inspeccion',
  'emplazamiento_tipo',
  'emplazamiento_valor',
  'fotos_urls',
  'datos_formulario',
  'firma_inspector_base64',
  'firma_responsable_base64'
];

function removeMissingColumnsFromPayload(error, payload) {
  if (!error?.message || typeof payload !== 'object') return false;
  let removed = false;
  const message = error.message.toLowerCase();
  ACTAS_FALLBACK_COLUMNS.forEach((column) => {
    if (payload.hasOwnProperty(column) && message.includes(column)) {
      delete payload[column];
      removed = true;
    }
  });
  return removed;
}

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { rol, id: userId } = req.user;
    const { inspector_id, estado, fechaDesde, fechaHasta, subido_cidi } = req.query;

    let query = supabase
      .from('actas')
      .select(`
        id, expediente, estado, fecha, hora, subido_cidi, created_at,
        establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia,
        responsable_nombre, virtual, presencial, inspector_id, secciones_seleccionadas,
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

    if (subido_cidi !== undefined) {
      query = query.eq('subido_cidi', subido_cidi === 'true');
    }

    const { data, error } = await query;

    if (error) {
      // Exponer mensaje real para diagnóstico, y fallback si el JOIN falla
      if (error.message && error.message.toLowerCase().includes('usuarios')) {
        console.warn('JOIN con usuarios falló, reintentando sin join:', error.message);
        let q2 = supabase
          .from('actas')
          .select('id, expediente, estado, fecha, hora, subido_cidi, created_at, establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia, responsable_nombre, virtual, presencial, inspector_id, secciones_seleccionadas')
          .order('created_at', { ascending: false });
        if (rol === 'inspector') q2 = q2.eq('inspector_id', userId);
        else if (inspector_id) q2 = q2.eq('inspector_id', inspector_id);
        if (estado) q2 = q2.eq('estado', estado);
        if (fechaDesde) q2 = q2.gte('fecha', fechaDesde);
        if (fechaHasta) q2 = q2.lte('fecha', fechaHasta);
        if (subido_cidi !== undefined) q2 = q2.eq('subido_cidi', subido_cidi === 'true');
        const { data: d2, error: e2 } = await q2;
        if (e2) throw e2;
        return res.json(d2 || []);
      }
      throw error;
    }
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching actas:', err);
    res.status(500).json({ error: err.message || 'Error al obtener actas' });
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
      tipo_inspeccion,
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      secciones_seleccionadas,
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
      tipo_inspeccion: tipo_inspeccion || 'RUTINA',
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      secciones_seleccionadas: secciones_seleccionadas || [],
      observaciones,
      emplazamiento_dias: emplazamiento_dias || 0,
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      establecimiento_tipologia,
      estado: 'borrador'
    };

    let insertResult = await supabase
      .from('actas')
      .insert(actaData)
      .select()
      .single();

    if (insertResult.error && removeMissingColumnsFromPayload(insertResult.error, actaData)) {
      insertResult = await supabase
        .from('actas')
        .insert(actaData)
        .select()
        .single();
    }

    if (insertResult.error) throw insertResult.error;
    res.status(201).json(insertResult.data);
  } catch (err) {
    console.error('Error creating acta:', err);
    res.status(500).json({ error: err.message || 'Error al crear acta' });
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

    let updateResult = await supabase
      .from('actas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateResult.error && removeMissingColumnsFromPayload(updateResult.error, updates)) {
      updateResult = await supabase
        .from('actas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    }

    if (updateResult.error) throw updateResult.error;
    res.json(updateResult.data);
  } catch (err) {
    console.error('Error updating acta:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar acta' });
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
    const { rol, id: userId } = req.user;

    const { data: acta } = await supabase
      .from('actas')
      .select('inspector_id, estado')
      .eq('id', id)
      .single();

    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    const puedeEliminar = rol === 'supervisor' || (rol === 'inspector' && acta.inspector_id === userId);

    if (!puedeEliminar) {
      return res.status(403).json({ error: 'No puedes eliminar esta acta' });
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
