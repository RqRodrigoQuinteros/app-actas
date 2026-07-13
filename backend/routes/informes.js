const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken, requireOwnership } = require('../middleware/auth');

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

router.get('/transferencias', async (req, res) => {
  try {
    const { rol } = req.user;

    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const { data, error } = await supabase
      .from('informe_transferencias')
      .select(`
        *,
        informe:informes(id, establecimiento_nombre, expediente, fecha),
        arquitecto_origen:usuarios!informe_transferencias_arquitecto_origen_id_fkey(nombre, dni),
        arquitecto_destino:usuarios!informe_transferencias_arquitecto_destino_id_fkey(nombre, dni)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching transferencias:', err);
    res.status(500).json({ error: 'Error al obtener transferencias' });
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
      observaciones,
      tipo
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
        estado: 'borrador',
        tipo
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

router.put('/:id', requireOwnership('informes', 'arquitecto_id'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('informes')
      .update(req.body)
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

router.patch('/:id/cidi', requireOwnership('informes', 'arquitecto_id'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: current } = await supabase
      .from('informes')
      .select('subido_cidi')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('informes')
      .update({ subido_cidi: !(current?.subido_cidi) })
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

router.post('/:id/transferir', async (req, res) => {
  try {
    const { id } = req.params;
    const { arquitecto_destino_id, motivo } = req.body;
    const { rol, id: userId } = req.user;

    if (!arquitecto_destino_id) {
      return res.status(400).json({ error: 'Debe seleccionar un arquitecto destino' });
    }

    // Obtener el informe actual
    const { data: informe, error: informeError } = await supabase
      .from('informes')
      .select('id, arquitecto_id')
      .eq('id', id)
      .single();

    if (informeError || !informe) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    // Verificar permiso: arquitecto dueño o supervisor
    if (rol === 'arquitecto' && informe.arquitecto_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a este informe' });
    }

    if (rol !== 'arquitecto' && rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    // Verificar que el destino existe y es arquitecto
    const { data: destino, error: destinoError } = await supabase
      .from('usuarios')
      .select('id, nombre, rol')
      .eq('id', arquitecto_destino_id)
      .single();

    if (destinoError || !destino) {
      return res.status(404).json({ error: 'Arquitecto destino no encontrado' });
    }

    if (destino.rol !== 'arquitecto') {
      return res.status(400).json({ error: 'El destino debe ser un arquitecto' });
    }

    // Actualizar el informe
    const { data: actualizado, error: updateError } = await supabase
      .from('informes')
      .update({ arquitecto_id: arquitecto_destino_id })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Registrar la transferencia
    const { error: transferError } = await supabase
      .from('informe_transferencias')
      .insert({
        informe_id: id,
        arquitecto_origen_id: informe.arquitecto_id,
        arquitecto_destino_id,
        motivo: motivo || null,
      });

    if (transferError) {
      console.error('Error registering transfer:', transferError);
    }

    res.json({ informe: actualizado, transferencia: { desde: informe.arquitecto_id, hacia: arquitecto_destino_id } });
  } catch (err) {
    console.error('Error transferring informe:', err);
    res.status(500).json({ error: 'Error al transferir informe' });
  }
});

router.delete('/:id', requireOwnership('informes', 'arquitecto_id'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('informes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Informe eliminado' });
  } catch (err) {
    console.error('Error deleting informe:', err);
    res.status(500).json({ error: 'Error al eliminar informe' });
  }
});

module.exports = router;
