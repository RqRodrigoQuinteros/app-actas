const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../services/supabaseClient');

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
  upload.array('fotos', 100)(req, res, (err) => {
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

// Bucket name from env or default
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'actas';

// Upload files to Supabase Storage and create actas_fotos rows
router.post('/subir', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    const { files } = req;
    const actaId = req.body.acta_id || req.query.acta_id;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron archivos' });
    }

    const uploadedUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname) || '';
      const filename = `${uuidv4()}${ext}`;
      const folder = actaId ? `actas/${actaId}` : 'actas/temp';
      const key = `${folder}/${filename}`;

      // Upload to supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(key, file.buffer, { contentType: file.mimetype, upsert: false });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ error: 'Error al subir archivo al storage' });
      }

      // Get public URL
      let publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;
      try {
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
        if (pub?.publicUrl) {
          publicUrl = pub.publicUrl;
        }
      } catch (e) {
        console.warn('Error getting public url', e);
      }

      // If actaId provided, insert metadata row in actas_fotos
      if (actaId) {
        const { error: insertError } = await supabase
          .from('actas_fotos')
          .insert({ acta_id: actaId, url: publicUrl || key, orden: i });

        if (insertError) {
          console.error('Error inserting actas_fotos row:', insertError);
          return res.status(500).json({ error: 'Error al guardar metadatos de la foto' });
        }
      }

      uploadedUrls.push(publicUrl || key);
    }

    res.json({ urls: uploadedUrls, message: `${uploadedUrls.length} archivo(s) subido(s)` });
  } catch (err) {
    console.error('Error uploading files:', err);
    res.status(500).json({ error: 'Error al subir archivos' });
  }
});

module.exports = router;

// Endpoint para subir una firma (single file) y guardar metadata en actas_firmas
router.post('/firmar', authenticateToken, upload.single('firma'), async (req, res) => {
  try {
    const file = req.file;
    const { acta_id: actaId, tipo } = req.body; // tipo: 'inspector' | 'responsable'

    if (!file) return res.status(400).json({ error: 'No se proporcionó la firma' });
    if (!actaId) return res.status(400).json({ error: 'acta_id es requerido' });
    if (!tipo || (tipo !== 'inspector' && tipo !== 'responsable')) return res.status(400).json({ error: 'tipo inválido' });

    const ext = path.extname(file.originalname) || '';
    const filename = `${uuidv4()}${ext}`;
    const key = `actas/${actaId}/firmas/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(key, file.buffer, { contentType: file.mimetype, upsert: false });

    if (uploadError) {
      console.error('Supabase upload error (firma):', uploadError);
      return res.status(500).json({ error: 'Error al subir la firma al storage' });
    }

    // obtener public URL
    let publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${key}`;
    try {
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
      if (pub?.publicUrl) {
        publicUrl = pub.publicUrl;
      }
    } catch (e) {
      console.warn('Error getting public url for firma', e);
    }

    // Upsert en actas_firmas: si existe row con acta_id+tipo, actualizar; si no, insertar
    const { data: existing, error: selErr } = await supabase
      .from('actas_firmas')
      .select('id')
      .eq('acta_id', actaId)
      .eq('tipo', tipo)
      .single();

    if (selErr && selErr.code !== 'PGRST116') {
      console.error('Error selecting actas_firmas', selErr);
      return res.status(500).json({ error: 'Error al guardar metadatos de la firma' });
    }

    if (existing && existing.id) {
      const { error: updErr } = await supabase
        .from('actas_firmas')
        .update({ firma_base64: publicUrl || key })
        .eq('id', existing.id);
      if (updErr) {
        console.error('Error updating actas_firmas', updErr);
        return res.status(500).json({ error: 'Error al actualizar metadatos de la firma' });
      }
    } else {
      const { error: insErr } = await supabase
        .from('actas_firmas')
        .insert({ acta_id: actaId, tipo, firma_base64: publicUrl || key });
      if (insErr) {
        console.error('Error inserting actas_firmas', insErr);
        return res.status(500).json({ error: 'Error al guardar metadatos de la firma' });
      }
    }

    res.json({ url: publicUrl || key, message: 'Firma subida' });
  } catch (err) {
    console.error('Error en /firmar:', err);
    res.status(500).json({ error: 'Error al procesar la firma' });
  }
});
