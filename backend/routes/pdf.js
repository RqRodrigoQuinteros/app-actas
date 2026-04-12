const express = require('express');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const supabase = require('../services/supabaseClient');
const { generarActaPDF, generarInformePDF, generarNotificacionPDF } = require('../services/pdfService');

const router = express.Router();

function cargarLogoBase64(filename) {
  try {
    const logoPath = path.join(__dirname, '../templates', filename);
    if (fs.existsSync(logoPath)) {
      const ext = path.extname(filename).slice(1).toLowerCase();
      const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
      return `data:${mimeType};base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }
  } catch (e) {
    console.warn(`No se pudo cargar el logo: ${filename}`);
  }
  return '';
}

router.post('/generar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: acta, error } = await supabase
      .from('actas')
      .select('*, inspector:usuarios!actas_inspector_id_fkey(nombre, dni)')
      .eq('id', id)
      .single();

    if (error || !acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && acta.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const actaCompleta = {
      ...acta,
      inspector_nombre: acta.inspector?.nombre || '',
      inspector_dni: acta.inspector?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const pdfBuffer = await generarActaPDF(actaCompleta, logoMinisterio, logoCordoba, logoMembrete);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="acta.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF del acta:', err);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

router.post('/informe/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: informe, error } = await supabase
      .from('informes')
      .select('*, arquitecto:usuarios!informes_arquitecto_id_fkey(nombre, dni)')
      .eq('id', id)
      .single();

    if (error || !informe) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    const informeCompleto = {
      ...informe,
      arquitecto_nombre: informe.arquitecto?.nombre || '',
      arquitecto_dni: informe.arquitecto?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const pdfBuffer = await generarInformePDF(informeCompleto, logoMinisterio, logoCordoba, logoMembrete);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="informe.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF del informe:', err);
    res.status(500).json({ error: 'Error al generar el PDF del informe' });
  }
});

router.post('/generar-notificacion/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: acta, error } = await supabase
      .from('actas')
      .select('*, inspector:usuarios!actas_inspector_id_fkey(nombre, dni)')
      .eq('id', id)
      .single();

    if (error || !acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    if (rol === 'inspector' && acta.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const actaCompleta = {
      ...acta,
      inspector_nombre: acta.inspector?.nombre || '',
      inspector_dni: acta.inspector?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const pdfBuffer = await generarNotificacionPDF(actaCompleta, logoMinisterio, logoCordoba, logoMembrete);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="notificacion.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF de notificación:', err);
    res.status(500).json({ error: 'Error al generar el PDF de notificación' });
  }
});

module.exports = router;
