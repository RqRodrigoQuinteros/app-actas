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

    if (!dni || !rol || !password) {
      return res.status(400).json({ error: 'DNI, rol y contraseña son requeridos' });
    }

    // Superadmin desde variables de entorno
    const SUPER_ADMIN_DNI = process.env.SUPER_ADMIN_DNI || '';
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || '';
    if (SUPER_ADMIN_DNI && dni === SUPER_ADMIN_DNI && password === SUPER_ADMIN_PASSWORD) {
      const superadminUsuario = {
        id: '00000000-0000-0000-0000-000000000000',
        nombre: process.env.SUPER_ADMIN_NOMBRE || 'Super Admin',
        dni: SUPER_ADMIN_DNI,
        rol: rol === 'supervisor' ? 'supervisor' : 'admin'
      };
      const token = jwt.sign(
        { id: superadminUsuario.id, nombre: superadminUsuario.nombre, dni: superadminUsuario.dni, rol: superadminUsuario.rol },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ token, usuario: superadminUsuario });
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

    let passwordValida = false;
    if (usuario.password) {
      passwordValida = await bcrypt.compare(password, usuario.password);
    } else {
      passwordValida = password === usuario.dni;
    }

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
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
      .select('id, nombre, dni, rol, email')
      .in('rol', ['inspector', 'arquitecto', 'auditor'])
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

router.put('/usuarios/:dni/email', authenticateToken, async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== 'supervisor' && rol !== 'admin') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }
    const { dni } = req.params;
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update({ email })
      .eq('dni', dni)
      .select('nombre, dni, email')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error actualizando email:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar email' });
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