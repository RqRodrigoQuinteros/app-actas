const supabase = require('./supabaseClient');
const { enviarAlertaVencimiento } = require('./emailService');

function calcularVencimiento(acta) {
  const fecha = acta.fecha ? new Date(acta.fecha) : null;
  if (!fecha) return null;

  const dias = parseInt(acta.emplazamiento_valor) || parseInt(acta.emplazamiento_dias) || 0;
  const vencimiento = new Date(fecha);
  vencimiento.setDate(vencimiento.getDate() + dias);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);

  const diffTime = vencimiento.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let status;
  if (diffDays < 0) {
    status = 'vencida';
  } else if (diffDays <= 3) {
    status = 'proxima';
  } else {
    status = 'al_dia';
  }

  return { vencimiento, diasVencido: Math.abs(Math.min(diffDays, 0)), status };
}

async function getVencimientos(filtros = {}) {
  let query = supabase
    .from('actas')
    .select(`
      id, expediente, fecha, estado, subido_cidi, created_at,
      establecimiento_nombre, establecimiento_direccion, establecimiento_localidad, establecimiento_tipologia,
      responsable_nombre, virtual, presencial, inspector_id,
      emplazamiento_tipo, emplazamiento_valor, emplazamiento_dias,
      inspector:usuarios!actas_inspector_id_fkey(nombre, dni, email)
    `)
    .order('created_at', { ascending: false });

  if (filtros.inspector_id) query = query.eq('inspector_id', filtros.inspector_id);
  if (filtros.estado) query = query.eq('estado', filtros.estado);
  if (filtros.fechaDesde) query = query.gte('fecha', filtros.fechaDesde);
  if (filtros.fechaHasta) query = query.lte('fecha', filtros.fechaHasta);

  const { data: actas, error } = await query;
  if (error) throw error;

  const actasConVto = (actas || []).map(acta => {
    const vto = calcularVencimiento(acta);
    return { ...acta, ...vto };
  });

  if (filtros.statusVencimiento) {
    return actasConVto.filter(a => a.status === filtros.statusVencimiento);
  }
  return actasConVto;
}

async function enviarAlertasPendientes() {
  console.log('[VENCIMIENTO] Iniciando revisión de vencimientos...');

  const actas = await getVencimientos();
  const vencidas = actas.filter(a => a.status === 'vencida' && a.estado !== 'borrador');

  const agrupadas = {};
  for (const acta of vencidas) {
    if (!acta.inspector) continue;
    const inspectorId = acta.inspector_id;
    if (!agrupadas[inspectorId]) {
      agrupadas[inspectorId] = {
        inspectorNombre: acta.inspector.nombre,
        inspectorEmail: acta.inspector.email,
        actas: [],
      };
    }
    agrupadas[inspectorId].actas.push({
      id: acta.id,
      establecimiento_nombre: acta.establecimiento_nombre,
      expediente: acta.expediente,
      fecha: acta.fecha,
      diasVencido: acta.diasVencido,
    });
  }

  let enviados = 0;
  let fallidos = 0;

  for (const [inspectorId, grupo] of Object.entries(agrupadas)) {
    const { data: alertasExistentes } = await supabase
      .from('alertas_vencimiento')
      .select('acta_id')
      .in('acta_id', grupo.actas.map(a => a.id))
      .eq('estado', 'enviado');

    const idsYaAlertados = new Set((alertasExistentes || []).map(a => a.acta_id));
    const actasPendientes = grupo.actas.filter(a => !idsYaAlertados.has(a.id));

    if (actasPendientes.length === 0) {
      console.log(`[VENCIMIENTO] ${grupo.inspectorNombre}: todas las actas ya tienen alerta`);
      continue;
    }

    console.log(`[VENCIMIENTO] ${grupo.inspectorNombre}: ${actasPendientes.length} acta(s) pendiente(s)`);

    const resultado = await enviarAlertaVencimiento({
      inspectorNombre: grupo.inspectorNombre,
      inspectorEmail: grupo.inspectorEmail,
      actas: actasPendientes,
    });

    const estadoAlerta = resultado.success ? 'enviado' : 'fallido';
    if (resultado.success) enviados++; else fallidos++;

    const registros = actasPendientes.map(a => ({
      acta_id: a.id,
      inspector_id: inspectorId,
      tipo: 'vencimiento',
      estado: estadoAlerta,
      error_msg: resultado.error || null,
    }));

    const { error: insertError } = await supabase
      .from('alertas_vencimiento')
      .insert(registros);

    if (insertError) {
      console.error(`[VENCIMIENTO] Error registrando alertas:`, insertError.message);
    }
  }

  console.log(`[VENCIMIENTO] Revisión completada: ${enviados} enviados, ${fallidos} fallidos`);
  return { revisadas: vencidas.length, enviados, fallidos };
}

async function getEstadoAlertas(actaIds) {
  if (!actaIds || actaIds.length === 0) return {};

  const { data } = await supabase
    .from('alertas_vencimiento')
    .select('acta_id, estado, fecha_envio')
    .in('acta_id', actaIds)
    .order('created_at', { ascending: false });

  const mapa = {};
  for (const row of data || []) {
    if (!mapa[row.acta_id]) mapa[row.acta_id] = { alertaEnviada: row.estado === 'enviado', fechaEnvio: row.fecha_envio };
  }
  return mapa;
}

module.exports = { getVencimientos, enviarAlertasPendientes, getEstadoAlertas, calcularVencimiento };
