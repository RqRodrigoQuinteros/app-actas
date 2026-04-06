const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
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

router.post('/subir', authenticateToken, upload.array('fotos', 20), async (req, res) => {
  try {
    const { files } = req;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const urls = files.map((file, index) => {
      const uniqueName = `${uuidv4()}_${index}_${file.originalname}`;
      return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    });

    res.json({ urls, message: `${files.length} archivo(s) subido(s)` });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
});

module.exports = router;
