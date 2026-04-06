const express = require('express');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { tipologia, search } = req.query;
    
    let query = supabase
      .from('establecimientos')
      .select('*')
      .order('nombre');

    if (tipologia) {
      query = query.eq('tipologia', tipologia);
    }

    if (search) {
      query = query.ilike('nombre', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching establecimientos:', err);
    res.status(500).json({ error: 'Error al obtener establecimientos' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('establecimientos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener establecimiento' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { nombre, direccion, localidad, tipologia, expediente } = req.body;

    const { data, error } = await supabase
      .from('establecimientos')
      .insert({ nombre, direccion, localidad, tipologia, expediente })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    console.error('Error creating establecimiento:', err);
    res.status(500).json({ error: 'Error al crear establecimiento' });
  }
});

module.exports = router;
