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

function toBuffer(pdfBuffer) {
  if (Buffer.isBuffer(pdfBuffer)) return pdfBuffer;
  if (pdfBuffer instanceof Uint8Array) return Buffer.from(pdfBuffer);
  if (typeof pdfBuffer === 'object' && pdfBuffer.type === 'Buffer' && Array.isArray(pdfBuffer.data)) {
    return Buffer.from(pdfBuffer.data);
  }
  throw new Error('PDF generation returned invalid buffer');
}

// Enriquecer acta con respuestas dinámicas desde actas_respuestas
async function enriquecerConRespuestas(acta) {
  const { data: respuestas } = await supabase
    .from('actas_respuestas')
    .select('valor, campo:template_campos(token, tipo)')
    .eq('acta_id', acta.id);

  if (!respuestas || respuestas.length === 0) return acta;

  // Construir objeto { token: valor } para que el template Handlebars los use
  const datosFormulario = {};
  for (const r of respuestas) {
    if (!r.campo?.token) continue;
    const token = r.campo.token;
    // Convertir SI/NO a booleano para mantener compatibilidad con helpers Handlebars
    if (r.campo.tipo === 'si_no') {
      datosFormulario[token] = r.valor === 'SI';
    } else {
      datosFormulario[token] = r.valor;
    }
  }

  return { ...acta, datos_formulario: datosFormulario };
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

    if (error || !acta) return res.status(404).json({ error: 'Acta no encontrada' });
    if (rol === 'inspector' && acta.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const actaEnriquecida = await enriquecerConRespuestas(acta);
    const actaCompleta = {
      ...actaEnriquecida,
      inspector_nombre: acta.inspector?.nombre || '',
      inspector_dni: acta.inspector?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const buffer = toBuffer(await generarActaPDF(actaCompleta, logoMinisterio, logoCordoba, logoMembrete));

    const safeName = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 40);
    const pdfFilename = `acta_${safeName(acta.expediente)}_${safeName(acta.establecimiento_nombre)}_${acta.fecha || ''}.pdf`;
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${pdfFilename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Error generando PDF del acta:', err);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

router.post('/generar-base64/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: acta, error } = await supabase
      .from('actas')
      .select('*, inspector:usuarios!actas_inspector_id_fkey(nombre, dni)')
      .eq('id', id)
      .single();

    if (error || !acta) return res.status(404).json({ error: 'Acta no encontrada' });
    if (rol === 'inspector' && acta.inspector_id !== userId) {
      return res.status(403).json({ error: 'No tienes acceso a esta acta' });
    }

    const actaEnriquecida = await enriquecerConRespuestas(acta);
    const actaCompleta = {
      ...actaEnriquecida,
      inspector_nombre: acta.inspector?.nombre || '',
      inspector_dni: acta.inspector?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const buffer = toBuffer(await generarActaPDF(actaCompleta, logoMinisterio, logoCordoba, logoMembrete));
    const base64 = buffer.toString('base64');
    const safeName = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 40);
    const pdfFilename = `acta_${safeName(acta.expediente)}_${safeName(acta.establecimiento_nombre)}_${acta.fecha || ''}.pdf`;
    res.json({ pdfBuffer: base64, filename: pdfFilename });
  } catch (err) {
    console.error('Error generando PDF base64 del acta:', err);
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

    if (error || !informe) return res.status(404).json({ error: 'Informe no encontrado' });

    const informeCompleto = {
      ...informe,
      arquitecto_nombre: informe.arquitecto?.nombre || '',
      arquitecto_dni: informe.arquitecto?.dni || '',
    };

    const logoMembrete = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba = cargarLogoBase64('logo_cordoba.png');

    const buffer = toBuffer(await generarInformePDF(informeCompleto, logoMinisterio, logoCordoba, logoMembrete));

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="informe_${id}.pdf"`);
    res.send(buffer);
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

    if (error || !acta) return res.status(404).json({ error: 'Acta no encontrada' });
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

    const buffer = toBuffer(await generarNotificacionPDF(actaCompleta, logoMinisterio, logoCordoba, logoMembrete));

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="notificacion_${id}.pdf"`);
    res.send(buffer);
  } catch (err) {
    console.error('Error generando PDF de notificación:', err);
    res.status(500).json({ error: 'Error al generar el PDF de notificación' });
  }
});

router.post('/geriatrico', authenticateToken, async (req, res) => {
  try {
    const { rol } = req.user;
    if (rol !== 'arquitecto' && rol !== 'supervisor') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const datos = req.body;
    if (!datos || !datos.nombreEst) {
      return res.status(400).json({ error: 'Datos del informe incompletos' });
    }

    const { generarInformeGeriatricoPDF } = require('../services/pdfService');

    const logoMembrete   = cargarLogoBase64('img6.jpg');
    const logoMinisterio = cargarLogoBase64('logo_ministerio.png');
    const logoCordoba    = cargarLogoBase64('logo_cordoba.png');

    const buffer = toBuffer(await generarInformeGeriatricoPDF(datos, logoMinisterio, logoCordoba, logoMembrete));

    const nombreArchivo = `geriatrico_${datos.expDigital || datos.nombreEst || 'informe'}.pdf`
      .replace(/[^a-zA-Z0-9_.\-]/g, '_');

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Error generando PDF geriátrico:', err);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

module.exports = router;