const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../services/supabaseClient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  try {
    const { dni, rol, password } = req.body;

    if (!dni || !rol) {
      return res.status(400).json({ error: 'DNI y rol son requeridos' });
    }

    if ((rol === 'supervisor' || rol === 'admin') && !password) {
      return res.status(400).json({ error: 'DNI y contraseña son requeridos' });
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

    if (rol === 'supervisor' || rol === 'admin') {
      if (!usuario.password) {
        return res.status(401).json({ error: 'Usuario sin contraseña configurada' });
      }
      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
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

router.get('/usuarios-login', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre, dni, rol')
      .in('rol', ['inspector', 'arquitecto'])
      .eq('activo', true)
      .order('rol')
      .order('nombre');

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error obteniendo usuarios:', err);
    res.status(500).json({ error: 'Error interno' });
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

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
