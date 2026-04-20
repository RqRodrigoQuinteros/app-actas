const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB por archivo
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  }
});

// Wrapper para capturar errores de multer (ej: LIMIT_FILE_SIZE) antes del handler
const uploadMiddleware = (req, res, next) => {
  upload.array('fotos', 20)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'La foto es demasiado grande. El máximo es 25 MB por imagen.'
        });
      }
      return res.status(400).json({ error: err.message || 'Error al procesar la imagen' });
    }
    next();
  });
};

router.post('/subir', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    const { files } = req;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const urls = files.map((file) => {
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    });

    res.json({ urls, message: `${files.length} archivo(s) subido(s)` });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
});

module.exports = router;
