const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const { rol, id: userId } = req.user;

    let query = supabase
      .from('pedidos_inspeccion')
      .select(`
        id, expediente, establecimiento_nombre, establecimiento_direccion, establecimiento_tipologia,
        pedido_por, estado, motivo_duplicado, acta_relacionada_id, created_at, asignado_at, tomado_at,
        creado_por:usuarios!pedidos_inspeccion_creado_por_fkey(nombre),
        inspector_asignado:usuarios!pedidos_inspeccion_inspector_asignado_id_fkey(id, nombre)
      `)
      .order('created_at', { ascending: false });

    if (rol === 'carga_inspeccion') {
      query = query.eq('creado_por', userId);
    } else if (rol === 'inspector') {
      query = query.eq('inspector_asignado_id', userId);
    } else if (!['supervisor', 'admin'].includes(rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo pedidos:', err);
    res.status(500).json({ error: err.message || 'Error al obtener pedidos' });
  }
});

router.get('/buscar-coincidencias', async (req, res) => {
  try {
    if (req.user.rol !== 'carga_inspeccion') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { expediente, direccion } = req.query;
    if (!(expediente && expediente.trim()) && !(direccion && direccion.trim())) {
      return res.status(400).json({ error: 'expediente o direccion es requerido' });
    }

    let query = supabase
      .from('actas')
      .select('id, expediente, establecimiento_nombre, establecimiento_direccion, establecimiento_tipologia, fecha, estado')
      .order('fecha', { ascending: false })
      .limit(10);

    if (expediente && expediente.trim() && direccion && direccion.trim()) {
      query = query.or(`expediente.ilike.%${expediente.trim()}%,establecimiento_direccion.ilike.%${direccion.trim()}%`);
    } else if (expediente && expediente.trim()) {
      query = query.ilike('expediente', `%${expediente.trim()}%`);
    } else {
      query = query.ilike('establecimiento_direccion', `%${direccion.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error buscando coincidencias:', err);
    res.status(500).json({ error: err.message || 'Error al buscar coincidencias' });
  }
});

// ── Tipologías de pedido (lista propia, distinta de template_tipologia) ──────
router.get('/tipologias', async (req, res) => {
  try {
    const { todas } = req.query;
    let query = supabase.from('pedido_tipologia').select('*').order('orden').order('nombre');
    if (todas !== 'true') query = query.eq('activo', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo tipologías de pedido:', err);
    res.status(500).json({ error: err.message || 'Error al obtener tipologías' });
  }
});

router.post('/tipologias', async (req, res) => {
  try {
    if (!['supervisor', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'nombre es requerido' });
    }
    const { data, error } = await supabase
      .from('pedido_tipologia')
      .insert({ nombre: nombre.trim() })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando tipología de pedido:', err);
    res.status(500).json({ error: err.message || 'Error al crear tipología' });
  }
});

router.put('/tipologias/:id', async (req, res) => {
  try {
    if (!['supervisor', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { nombre, activo } = req.body;
    const update = {};
    if (nombre !== undefined) update.nombre = nombre.trim();
    if (activo !== undefined) update.activo = activo;

    const { data, error } = await supabase
      .from('pedido_tipologia')
      .update(update)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando tipología de pedido:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar tipología' });
  }
});

router.delete('/tipologias/:id', async (req, res) => {
  try {
    if (!['supervisor', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { error } = await supabase
      .from('pedido_tipologia')
      .update({ activo: false })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('Error desactivando tipología de pedido:', err);
    res.status(500).json({ error: err.message || 'Error al desactivar tipología' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (req.user.rol !== 'carga_inspeccion') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const {
      expediente, establecimiento_nombre, establecimiento_direccion, establecimiento_tipologia,
      pedido_por, confirmar_duplicado, motivo_duplicado, acta_relacionada_id
    } = req.body;

    if (!expediente || !establecimiento_nombre || !establecimiento_direccion || !establecimiento_tipologia || !pedido_por) {
      return res.status(400).json({ error: 'Expediente, establecimiento, dirección, tipología y pedido por son requeridos' });
    }

    const confirmado = confirmar_duplicado === true && !!(motivo_duplicado && motivo_duplicado.trim());

    if (!confirmado) {
      const { data: coincidencias, error: errCheck } = await supabase
        .from('actas')
        .select('id')
        .or(`expediente.ilike.%${expediente.trim()}%,establecimiento_direccion.ilike.%${establecimiento_direccion.trim()}%`)
        .limit(1);

      if (errCheck) throw errCheck;

      if (coincidencias && coincidencias.length > 0) {
        return res.status(409).json({
          error: 'Existen actas previas para este expediente o domicilio',
          requiereConfirmacion: true
        });
      }
    }

    const { data, error } = await supabase
      .from('pedidos_inspeccion')
      .insert({
        expediente: expediente.trim(),
        establecimiento_nombre: establecimiento_nombre.trim(),
        establecimiento_direccion: establecimiento_direccion.trim(),
        establecimiento_tipologia,
        pedido_por,
        creado_por: req.user.id,
        motivo_duplicado: confirmado ? motivo_duplicado.trim() : null,
        acta_relacionada_id: confirmado ? (acta_relacionada_id || null) : null,
        estado: 'pendiente'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creando pedido:', err);
    res.status(500).json({ error: err.message || 'Error al crear pedido' });
  }
});

router.patch('/:id/asignar', async (req, res) => {
  try {
    if (!['supervisor', 'admin'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { inspector_id } = req.body;
    if (!inspector_id) {
      return res.status(400).json({ error: 'inspector_id es requerido' });
    }

    const { data, error } = await supabase
      .from('pedidos_inspeccion')
      .update({
        inspector_asignado_id: inspector_id,
        asignado_por: req.user.id,
        asignado_at: new Date().toISOString(),
        estado: 'asignado'
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error asignando pedido:', err);
    res.status(500).json({ error: err.message || 'Error al asignar pedido' });
  }
});

router.patch('/:id/tomar', async (req, res) => {
  try {
    if (req.user.rol !== 'inspector') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { data: pedido, error: errFetch } = await supabase
      .from('pedidos_inspeccion')
      .select('inspector_asignado_id')
      .eq('id', req.params.id)
      .single();

    if (errFetch || !pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (pedido.inspector_asignado_id !== req.user.id) {
      return res.status(403).json({ error: 'Este pedido no está asignado a vos' });
    }

    const { data, error } = await supabase
      .from('pedidos_inspeccion')
      .update({ estado: 'tomado', tomado_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error tomando pedido:', err);
    res.status(500).json({ error: err.message || 'Error al tomar pedido' });
  }
});

router.patch('/:id/completar', async (req, res) => {
  try {
    if (req.user.rol !== 'inspector') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { data: pedido, error: errFetch } = await supabase
      .from('pedidos_inspeccion')
      .select('inspector_asignado_id')
      .eq('id', req.params.id)
      .single();

    if (errFetch || !pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (pedido.inspector_asignado_id !== req.user.id) {
      return res.status(403).json({ error: 'Este pedido no está asignado a vos' });
    }

    const { data, error } = await supabase
      .from('pedidos_inspeccion')
      .update({ estado: 'completado', completado_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error completando pedido:', err);
    res.status(500).json({ error: err.message || 'Error al completar pedido' });
  }
});

module.exports = router;
