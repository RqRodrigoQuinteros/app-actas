const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { expediente, establecimiento, inspector, arquitecto } = req.query;

    if (!expediente && !establecimiento && !inspector && !arquitecto) {
      return res.status(400).json({ error: 'Completá al menos un campo para buscar' });
    }

    let resultados = [];
    const exp = expediente ? expediente.trim() : null;
    const est = establecimiento ? establecimiento.trim() : null;
    const insp = inspector ? inspector.trim() : null;
    const arq = arquitecto ? arquitecto.trim() : null;

    console.log('[consultas] Filtros recibidos:', { exp, est, insp, arq });

    // ─── Buscar inspectores por nombre ───
    let inspIds = [];
    if (insp) {
      try {
        const { data: users } = await supabase
          .from('usuarios')
          .select('id')
          .ilike('nombre', `%${insp}%`)
          .eq('rol', 'inspector')
          .limit(50);
        inspIds = (users || []).map(u => u.id);
      } catch (e) {
        console.error('Error buscando inspectores:', e.message);
      }
    }

    // ─── Buscar arquitectos por nombre ───
    let arqIds = [];
    if (arq) {
      try {
        console.log('[consultas] Buscando arquitecto:', arq);
        const { data: users, error } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .ilike('nombre', `%${arq}%`)
          .eq('rol', 'arquitecto')
          .limit(50);
        if (error) console.error('[consultas] Error buscando arquitectos:', error.message);
        arqIds = (users || []).map(u => u.id);
        if (users?.length) console.log('[consultas] Arquitectos encontrados:', users.map(u => u.nombre).join(', '));
        else console.log('[consultas] No se encontraron arquitectos con ese nombre');
      } catch (e) {
        console.error('[consultas] Error buscando arquitectos:', e.message);
      }
    }

    const queryActas = exp || est || insp;
    const queryInformes = exp || est || arq;

    // ─── Buscar en actas ───
    if (queryActas) {
      try {
        let q = supabase
          .from('actas')
          .select(`id, expediente, fecha, estado, pdf_url, created_at,
            establecimiento_nombre, establecimiento_direccion, establecimiento_localidad,
            inspector:usuarios!actas_inspector_id_fkey(nombre, dni)`);

        if (exp) q = q.ilike('expediente', `%${exp}%`);
        if (est) q = q.ilike('establecimiento_nombre', `%${est}%`);
        if (inspIds.length > 0) q = q.in('inspector_id', inspIds);
        else if (insp) q = q.eq('id', '00000000-0000-0000-0000-000000000000');

        const { data: actas, error: errActas } = await q.order('created_at', { ascending: false }).limit(50);
        if (errActas) console.error('Error en actas:', errActas.message);

        if (actas) {
          actas.forEach(a => resultados.push({
            id: a.id, expediente: a.expediente, fecha: a.fecha,
            estado: a.estado, pdf_url: a.pdf_url, created_at: a.created_at,
            establecimiento_nombre: a.establecimiento_nombre,
            inspector: a.inspector,
            _tipo: 'acta',
            _titulo: a.establecimiento_nombre || 'Establecimiento sin nombre',
            _responsable: a.inspector?.nombre || 'Inspector desconocido',
          }));
        }
      } catch (e) {
        console.error('Error en bloque actas:', e.message);
      }
    }

    // ─── Buscar en informes ───
    if (queryInformes) {
      try {
        let qIds = supabase
          .from('informes')
          .select('id');

        if (exp) qIds = qIds.ilike('expediente', `%${exp}%`);
        if (est) qIds = qIds.ilike('establecimiento_nombre', `%${est}%`);
        if (arqIds.length > 0) qIds = qIds.in('arquitecto_id', arqIds);
        else if (arq) qIds = qIds.eq('id', '00000000-0000-0000-0000-000000000000');

        const { data: filteredIds, error: errIds } = await qIds.order('created_at', { ascending: false }).limit(50);
        if (errIds) console.error('[consultas] Error filtrando informes:', errIds.message);
        console.log('[consultas] IDs informes encontrados:', filteredIds?.length || 0);

        if (filteredIds && filteredIds.length > 0) {
          const idList = filteredIds.map(i => i.id);
          const { data: informes, error: errInf } = await supabase
            .from('informes')
            .select(`id, expediente, fecha, estado, created_at,
              establecimiento_nombre, establecimiento_direccion, establecimiento_localidad,
              datos_formulario,
              arquitecto:usuarios!informes_arquitecto_id_fkey(nombre, dni)`)
            .in('id', idList)
            .order('created_at', { ascending: false });

          if (errInf) console.error('[consultas] Error obteniendo datos de informes:', errInf.message);

          if (informes) {
            informes.forEach(i => resultados.push({
              id: i.id, expediente: i.expediente, fecha: i.fecha,
              estado: i.estado, created_at: i.created_at, pdf_url: null,
              establecimiento_nombre: i.establecimiento_nombre,
              datos_formulario: i.datos_formulario,
              arquitecto: i.arquitecto,
              _tipo: 'informe',
              _titulo: i.establecimiento_nombre || 'Establecimiento sin nombre',
              _responsable: i.arquitecto?.nombre || 'Arquitecto desconocido',
            }));
          }
        }
      } catch (e) {
        console.error('[consultas] Error en bloque informes:', e.message);
      }
    }

    resultados.sort((a, b) => {
      const da = a.fecha || a.created_at || '';
      const db = b.fecha || b.created_at || '';
      return db.localeCompare(da);
    });

    res.json(resultados);
  } catch (err) {
    console.error('Error en consultas:', err);
    res.status(500).json({ error: 'Error al realizar la consulta' });
  }
});

module.exports = router;
