const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const ACTAS_FALLBACK_COLUMNS = [
  'tipo_inspeccion',
  'emplazamiento_tipo',
  'emplazamiento_valor',
  'fotos_urls',
  'datos_formulario',
  'firma_inspector_base64',
  'firma_responsable_base64',
  'director_tecnico_nombre',
  'director_tecnico_apellido',
  'director_tecnico_dni',
  'director_tecnico_matricula',
  'propietario',
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

async function fetchFirmas(actaId) {
  try {
    const { data, error } = await supabase
      .from('actas_firmas')
      .select('firma_base64, tipo')
      .eq('acta_id', actaId);

    if (error) {
      console.error('Error fetching firmas for acta', actaId, error);
      return {};
    }

    return (data || []).reduce((acc, item) => {
      if (item.tipo === 'inspector') acc.firma_inspector_base64 = item.firma_base64 || null;
      if (item.tipo === 'responsable') acc.firma_responsable_base64 = item.firma_base64 || null;
      return acc;
    }, { firma_inspector_base64: null, firma_responsable_base64: null });
  } catch (err) {
    console.error('Error fetching firmas for acta', actaId, err);
    return {};
  }
}

async function fetchFotos(actaId) {
  try {
    const { data, error } = await supabase
      .from('actas_fotos')
      .select('url')
      .eq('acta_id', actaId)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching fotos for acta', actaId, error);
      return { fotos_urls: [] };
    }

    const fotos = (data || []).map((item) => item.url).filter(Boolean);
    return { fotos_urls: fotos };
  } catch (err) {
    console.error('Error fetching fotos for acta', actaId, err);
    return { fotos_urls: [] };
  }
}

async function replaceFotos(actaId, urls) {
  if (!Array.isArray(urls)) return;

  const { error: deleteError } = await supabase
    .from('actas_fotos')
    .delete()
    .eq('acta_id', actaId);

  if (deleteError) throw deleteError;

  if (urls.length === 0) return;

  const rows = urls.map((url, index) => ({ acta_id: actaId, url, orden: index }));
  const { error: insertError } = await supabase
    .from('actas_fotos')
    .insert(rows);

  if (insertError) throw insertError;
}

async function upsertFirma(actaId, tipo, firmaBase64) {
  if (!firmaBase64) return;

  const { data: existing, error: selectError } = await supabase
    .from('actas_firmas')
    .select('id')
    .eq('acta_id', actaId)
    .eq('tipo', tipo)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    throw selectError;
  }

  if (existing && existing.id) {
    const { error } = await supabase
      .from('actas_firmas')
      .update({ firma_base64: firmaBase64 })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('actas_firmas')
      .insert({ acta_id: actaId, tipo, firma_base64: firmaBase64 });
    if (error) throw error;
  }
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
        responsable_nombre, virtual, presencial, inspector_id,
        tipo_inspeccion, observaciones,
        emplazamiento_tipo, emplazamiento_valor, emplazamiento_dias,
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
          .select('id, expediente, estado, fecha, hora, subido_cidi, created_at, establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia, responsable_nombre, virtual, presencial, inspector_id, tipo_inspeccion, observaciones, emplazamiento_tipo, emplazamiento_valor, emplazamiento_dias')
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

    const firmas = await fetchFirmas(id);
    const fotos = await fetchFotos(id);
    const merged = {
      ...data,
      ...firmas,
      ...fotos,
    };
    if ((!merged.fotos_urls || merged.fotos_urls.length === 0) && Array.isArray(data.fotos_urls)) {
      merged.fotos_urls = data.fotos_urls;
    }

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener acta' });
  }
});

router.post('/', async (req, res) => {
  console.log('=== POST /actas ===');
  console.log('propietario:', req.body.propietario, '| dt_nombre:', req.body.director_tecnico_nombre);
  try {
    const {
      inspector_id,
      expediente,
      expediente_papel,
      fecha,
      hora,
      virtual,
      presencial,
      tipo_inspeccion,
      director_tecnico_nombre,
      director_tecnico_apellido,
      director_tecnico_dni,
      director_tecnico_matricula,
      propietario,
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      observaciones,
      emplazamiento_dias,
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      establecimiento_tipologia,
      datos_formulario,
      fotos_urls,
      firma_inspector_base64,
      firma_responsable_base64,
    } = req.body;

    const actaData = {
      inspector_id,
      expediente,
      expediente_papel: expediente_papel || null,
      fecha,
      hora,
      virtual: virtual || false,
      presencial: presencial !== false,
      tipo_inspeccion: tipo_inspeccion || 'RUTINA',
      director_tecnico_nombre,
      director_tecnico_apellido,
      director_tecnico_dni,
      director_tecnico_matricula,
      propietario,
      responsable_nombre,
      responsable_dni,
      responsable_caracter,
      observaciones,
      emplazamiento_dias: emplazamiento_dias || 0,
      establecimiento_nombre,
      establecimiento_direccion,
      establecimiento_localidad,
      establecimiento_tipologia,
      datos_formulario: datos_formulario || {},
      estado: 'borrador'
    };

    let insertResult = await supabase
      .from('actas')
      .insert(actaData)
      .select()
      .single();

    if (!insertResult.error && insertResult.data) {
      const actaId = insertResult.data.id;
      if (firma_inspector_base64) {
        await upsertFirma(actaId, 'inspector', firma_inspector_base64);
      }
      if (firma_responsable_base64) {
        await upsertFirma(actaId, 'responsable', firma_responsable_base64);
      }
      if (Array.isArray(fotos_urls)) {
        await replaceFotos(actaId, fotos_urls);
      }
    }

    if (insertResult.error) {
      console.error('=== INSERT error:', insertResult.error.message);
      if (removeMissingColumnsFromPayload(insertResult.error, actaData)) {
        console.log('=== Reintentando sin columnas faltantes...');
        insertResult = await supabase.from('actas').insert(actaData).select().single();
      }
    }

    console.log('=== INSERT result - propietario:', insertResult.data?.propietario, '| dt:', insertResult.data?.director_tecnico_nombre, '| error:', insertResult.error?.message);
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

    const fotosUrls = Array.isArray(updates.fotos_urls) ? updates.fotos_urls : null;
    delete updates.fotos_urls;
    delete updates.firma_inspector_base64;
    delete updates.firma_responsable_base64;

    if (updates.datos_formulario) {
      updates.estado = 'borrador';
    }

    let updateResult = await supabase
      .from('actas')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (!updateResult.error && fotosUrls !== null) {
      await replaceFotos(id, fotosUrls);
    }

    if (updateResult.error && removeMissingColumnsFromPayload(updateResult.error, updates)) {
      console.log('=== PUT: reintentando update sin columnas faltantes');
      updateResult = await supabase
        .from('actas')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (!updateResult.error && fotosUrls !== null) {
        await replaceFotos(id, fotosUrls);
      }
    }

    if (updateResult.error) throw updateResult.error;

    if (!updateResult.data) {
      console.warn('=== PUT: update devolvió 0 filas (maybeSingle). Payload:', JSON.stringify(updates));
      const { data: fallbackActa } = await supabase
        .from('actas')
        .select('*')
        .eq('id', id)
        .single();
      if (fallbackActa) {
        const fotos = await fetchFotos(id);
        const mergedData = { ...fallbackActa, ...fotos };
        if ((!mergedData.fotos_urls || mergedData.fotos_urls.length === 0) && Array.isArray(fallbackActa.fotos_urls)) {
          mergedData.fotos_urls = fallbackActa.fotos_urls;
        }
        return res.json(mergedData);
      }
      return res.status(500).json({ error: 'Error al actualizar acta: no se encontró el registro' });
    }

    const fotos = await fetchFotos(id);
    const mergedData = { ...updateResult.data, ...fotos };
    if ((!mergedData.fotos_urls || mergedData.fotos_urls.length === 0) && Array.isArray(updateResult.data.fotos_urls)) {
      mergedData.fotos_urls = updateResult.data.fotos_urls;
    }
    res.json(mergedData);
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

    if (firma_inspector_base64) {
      await upsertFirma(id, 'inspector', firma_inspector_base64);
    }
    if (firma_responsable_base64) {
      await upsertFirma(id, 'responsable', firma_responsable_base64);
    }

    const firmas = await fetchFirmas(id);
    if (firmas.firma_inspector_base64 && firmas.firma_responsable_base64) {
      const { error: estadoError } = await supabase
        .from('actas')
        .update({ estado: 'firmado' })
        .eq('id', id);
      if (estadoError) throw estadoError;
    }

    const { data: actaData, error: actaError } = await supabase
      .from('actas')
      .select('*, inspector:usuarios!actas_inspector_id_fkey(nombre, dni)')
      .eq('id', id)
      .single();

    if (actaError || !actaData) throw actaError || new Error('Acta no encontrada');
    res.json({ ...actaData, ...firmas });
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

    const puedeEliminar = rol === 'supervisor' || rol === 'admin' || (rol === 'inspector' && acta.inspector_id === userId);

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
