const jwt = require('jsonwebtoken');
const supabase = require('../services/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
    }
  }
  next();
}

function requireOwnership(table, ownerField, allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rol, id: userId } = req.user;

      if (rol === 'supervisor' || rol === 'admin') return next();

      const { data, error } = await supabase
        .from(table)
        .select(ownerField)
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }

      if (data[ownerField] !== userId) {
        return res.status(403).json({ error: 'No tienes acceso a este recurso' });
      }

      req.resource = data;
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
}

module.exports = { authenticateToken, optionalAuth, requireOwnership };
