const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const INSPECTORES = [
  { nombre: "FABIAN AVILA", dni: "92854906" },
];

router.post('/login', async (req, res) => {
  try {
    const { dni, rol } = req.body;

    if (!dni || !rol) {
      return res.status(400).json({ error: 'DNI y rol son requeridos' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('dni', dni)
      .eq('rol', rol)
      .eq('activo', true)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (rol === 'supervisor' && !usuario.es_supervisor) {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, dni: usuario.dni, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, usuario });
  } catch (err) {
    console.error('Error login:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/inspectores', async (req, res) => {
  res.json(INSPECTORES);
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
