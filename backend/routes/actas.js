const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');
const { fetchFirmas, fetchFotos, getActaWithRelations, replaceFotos, upsertFirma } = require('../services/actaQueries');
const { getVencimientos, enviarAlertasPendientes, getEstadoAlertas } = require('../services/vencimientoService');

const router = express.Router();
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

    if (estado) query = query.eq('estado', estado);
    if (fechaDesde) query = query.gte('fecha', fechaDesde);
    if (fechaHasta) query = query.lte('fecha', fechaHasta);
    if (subido_cidi !== undefined) query = query.eq('subido_cidi', subido_cidi === 'true');

    const { data, error } = await query;

    if (error) {
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

// ─── Vencimientos ─────────────────────────────────────────────────────────────
router.get('/vencimientos', async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }
    const { inspector_id, estado, fechaDesde, fechaHasta, status_vencimiento } = req.query;
    const actas = await getVencimientos({ inspector_id, estado, fechaDesde, fechaHasta, statusVencimiento: status_vencimiento });
    const actaIds = actas.map(a => a.id);
    const alertasMap = await getEstadoAlertas(actaIds);
    const result = actas.map(a => ({ ...a, ...(alertasMap[a.id] || { alertaEnviada: false, fechaEnvio: null }) }));
    res.json(result);
  } catch (err) {
    console.error('Error fetching vencimientos:', err);
    res.status(500).json({ error: err.message || 'Error al obtener vencimientos' });
  }
});

// ─── Exportar CSV ──────────────────────────────────────────────────────────────
router.get('/exportar', async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }
    const { inspector_id, estado, fechaDesde, fechaHasta, tipologia } = req.query;

    let query = supabase
      .from('actas')
      .select(`
        id, expediente, fecha, hora, estado, subido_cidi, created_at,
        establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia,
        responsable_nombre, responsable_dni, responsable_caracter,
        virtual, presencial, inspector_id,
        emplazamiento_tipo, emplazamiento_valor, emplazamiento_dias,
        observaciones,
        inspector:usuarios!actas_inspector_id_fkey(nombre, dni)
      `)
      .order('created_at', { ascending: false });

    if (inspector_id) query = query.eq('inspector_id', inspector_id);
    if (estado) query = query.eq('estado', estado);
    if (fechaDesde) query = query.gte('fecha', fechaDesde);
    if (fechaHasta) query = query.lte('fecha', fechaHasta);
    if (tipologia) query = query.eq('establecimiento_tipologia', tipologia);

    const { data, error } = await query;
    if (error) throw error;

    const json2csv = require('json2csv');
    const fields = [
      'id', 'expediente', 'fecha', 'hora', 'estado',
      'establecimiento_nombre', 'establecimiento_direccion', 'establecimiento_localidad', 'establecimiento_tipologia',
      'responsable_nombre', 'responsable_dni',
      'virtual', 'presencial',
      'emplazamiento_tipo', 'emplazamiento_valor',
      'observaciones', 'subido_cidi', 'created_at',
    ];
    const rows = (data || []).map(r => ({
      ...r,
      inspector: r.inspector?.nombre || '',
      inspector_dni: r.inspector?.dni || '',
      virtual: r.virtual ? 'Si' : 'No',
      presencial: r.presencial ? 'Si' : 'No',
      subido_cidi: r.subido_cidi ? 'Si' : 'No',
    }));
    const parser = new json2csv.Parser({ fields: [...fields, 'inspector', 'inspector_dni'] });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=actas_export_${new Date().toISOString().slice(0, 10)}.csv`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('Error exporting actas:', err);
    res.status(500).json({ error: err.message || 'Error al exportar actas' });
  }
});

// ─── Eventos para calendario visual ────────────────────────────────────────────
router.get('/eventos-calendario', async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }
    const { mes } = req.query;
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({ error: 'Formato de mes inválido. Use YYYY-MM' });
    }
    const [anio, mesNum] = mes.split('-').map(Number);
    const fechaDesde = new Date(anio, mesNum - 1, 1).toISOString().slice(0, 10);
    const fechaHasta = new Date(anio, mesNum, 0).toISOString().slice(0, 10);

    const { getVencimientos, getEstadoAlertas } = require('../services/vencimientoService');
    const actas = await getVencimientos({ fechaDesde, fechaHasta });
    const actaIds = actas.map(a => a.id);
    const alertasMap = await getEstadoAlertas(actaIds);

    const eventos = actas.map(a => ({
      id: a.id,
      title: a.establecimiento_nombre || '—',
      date: a.vencimiento ? a.vencimiento.toISOString().slice(0, 10) : '',
      status: a.status,
      expediente: a.expediente,
      inspector: a.inspector?.nombre || '—',
      alertaEnviada: alertasMap[a.id]?.alertaEnviada || false,
    }));

    res.json(eventos);
  } catch (err) {
    console.error('Error fetching calendario events:', err);
    res.status(500).json({ error: err.message || 'Error al obtener eventos del calendario' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const merged = await getActaWithRelations(id);
    if (merged.error) return res.status(404).json({ error: merged.error });

    if (rol === 'inspector' && merged.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    res.json(merged);
  } catch (err) {
    console.error('Error fetching acta:', err);
    res.status(500).json({ error: 'Error al obtener acta' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      inspector_id, expediente, expediente_papel, fecha, hora,
      virtual, presencial, tipo_inspeccion,
      director_tecnico_nombre, director_tecnico_apellido, director_tecnico_dni, director_tecnico_matricula,
      propietario, responsable_nombre, responsable_dni, responsable_caracter,
      observaciones, emplazamiento_dias,
      establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia,
      datos_formulario, fotos_urls,
      firma_inspector_base64, firma_responsable_base64,
    } = req.body;

    const { data, error } = await supabase
      .from('actas')
      .insert({
        inspector_id, expediente, expediente_papel: expediente_papel || null,
        fecha, hora, virtual: virtual || false, presencial: presencial !== false,
        tipo_inspeccion: tipo_inspeccion || 'RUTINA',
        director_tecnico_nombre, director_tecnico_apellido, director_tecnico_dni, director_tecnico_matricula,
        propietario, responsable_nombre, responsable_dni, responsable_caracter,
        observaciones, emplazamiento_dias: emplazamiento_dias || 0,
        establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia,
        datos_formulario: datos_formulario || {},
        estado: 'borrador'
      })
      .select()
      .single();

    if (error) throw error;

    const actaId = data.id;
    const ops = [];
    if (firma_inspector_base64) ops.push(upsertFirma(actaId, 'inspector', firma_inspector_base64));
    if (firma_responsable_base64) ops.push(upsertFirma(actaId, 'responsable', firma_responsable_base64));
    if (Array.isArray(fotos_urls)) ops.push(replaceFotos(actaId, fotos_urls));
    await Promise.all(ops);

    res.status(201).json(data);
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

    const { data: existingActa } = await supabase
      .from('actas')
      .select('inspector_id, estado')
      .eq('id', id)
      .single();

    if (!existingActa) return res.status(404).json({ error: 'Acta no encontrada' });
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
    delete updates.sin_emplazamiento;

    if (updates.datos_formulario) updates.estado = 'borrador';

    const { data, error } = await supabase
      .from('actas')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (fotosUrls !== null) await replaceFotos(id, fotosUrls);

    if (!data) {
      const { data: fallbackActa } = await supabase
        .from('actas')
        .select('*')
        .eq('id', id)
        .single();
      if (fallbackActa) {
        const fotos = await fetchFotos(id);
        return res.json({ ...fallbackActa, ...fotos });
      }
      return res.status(500).json({ error: 'Error al actualizar acta: no se encontró el registro' });
    }

    const fotos = await fetchFotos(id);
    const mergedData = { ...data, ...fotos };
    if ((!mergedData.fotos_urls || mergedData.fotos_urls.length === 0) && Array.isArray(data.fotos_urls)) {
      mergedData.fotos_urls = data.fotos_urls;
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
      .select('inspector_id, estado, virtual')
      .eq('id', id)
      .single();

    if (!existingActa) return res.status(404).json({ error: 'Acta no encontrada' });
    if (rol === 'inspector' && existingActa.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }
    if (existingActa.estado === 'cerrado') {
      return res.status(400).json({ error: 'Esta acta ya está cerrada' });
    }

    const ops = [];
    if (firma_inspector_base64) ops.push(upsertFirma(id, 'inspector', firma_inspector_base64));
    if (firma_responsable_base64) ops.push(upsertFirma(id, 'responsable', firma_responsable_base64));
    await Promise.all(ops);

    const firmas = await fetchFirmas(id);
    const firmaInspectorOK = firmas.firma_inspector_base64;
    const firmaResponsableOK = existingActa.virtual || firmas.firma_responsable_base64;
    if (firmaInspectorOK && firmaResponsableOK) {
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

    if (!acta) return res.status(404).json({ error: 'Acta no encontrada' });
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

    if (!acta) return res.status(404).json({ error: 'Acta no encontrada' });

    const puedeEliminar = rol === 'supervisor' || rol === 'admin' || (rol === 'inspector' && acta.inspector_id === userId);
    if (!puedeEliminar) return res.status(403).json({ error: 'No puedes eliminar esta acta' });

    const { error } = await supabase.from('actas').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Acta eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar acta' });
  }
});

// ─── Reenviar alerta manual ────────────────────────────────────────────────────
router.post('/reenviar-alerta/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.user;
    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const { data: acta } = await supabase
      .from('actas')
      .select('id, fecha, emplazamiento_valor, emplazamiento_dias, establecimiento_nombre, expediente, inspector_id, inspector:usuarios!actas_inspector_id_fkey(nombre, dni, email)')
      .eq('id', id)
      .single();

    if (!acta) return res.status(404).json({ error: 'Acta no encontrada' });

    const vencimientoService = require('../services/vencimientoService');
    const vto = vencimientoService.calcularVencimiento(acta);

    const { enviarAlertaVencimiento } = require('../services/emailService');
    const resultado = await enviarAlertaVencimiento({
      inspectorNombre: acta.inspector?.nombre || 'Inspector',
      inspectorEmail: acta.inspector?.email,
      actas: [{
        id: acta.id,
        establecimiento_nombre: acta.establecimiento_nombre,
        expediente: acta.expediente,
        fecha: acta.fecha,
        diasVencido: vto ? vto.diasVencido : 0,
      }],
    });

    const estadoAlerta = resultado.success ? 'reenviado' : 'fallido';
    await supabase.from('alertas_vencimiento').insert({
      acta_id: acta.id,
      inspector_id: acta.inspector_id,
      tipo: 'vencimiento',
      estado: estadoAlerta,
      error_msg: resultado.error || null,
    });

    res.json({ success: resultado.success, message: resultado.success ? 'Alerta reenviada' : resultado.error, error: resultado.error });
  } catch (err) {
    console.error('Error reenviando alerta:', err);
    res.status(500).json({ error: err.message || 'Error al reenviar alerta' });
  }
});

module.exports = router;
