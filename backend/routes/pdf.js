const express = require('express');
const supabase = require('../services/supabaseClient');
const { generarActaPDF, generarInformePDF } = require('../services/pdfService');
// const { uploadFile, getInspectorFolder, getInformesFolder } = require('../services/driveService'); // Comentado para generación local únicamente
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/generar/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, id: userId } = req.user;

    const { data: acta, error } = await supabase
      .from('actas')
      .select(`
        *,
        inspector:usuarios!actas_inspector_id_fkey(nombre, dni)
      `)
      .eq('id', id)
      .single();

    if (error || !acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }

    console.log('=== GET /pdf/generar/:id ===');
    console.log('Acta recuperada de BD:', JSON.stringify({
      id: acta.id,
      expediente: acta.expediente,
      datos_formulario: acta.datos_formulario,
      firma_inspector_base64: acta.firma_inspector_base64 ? 'PRESENTE' : 'AUSENTE',
      firma_responsable_base64: acta.firma_responsable_base64 ? 'PRESENTE' : 'AUSENTE',
      fotos_urls: acta.fotos_urls,
      fotos_count: acta.fotos_urls?.length || 0
    }, null, 2));

    // Map inspector data for PDF generation
    acta.inspector_nombre = acta.inspector?.nombre || '';
    acta.inspector_dni = acta.inspector?.dni || '';

    const logoMinisterio = process.env.LOGO_MINISTERIO_BASE64 || '';
    const logoCordoba = process.env.LOGO_CORDOBA_BASE64 || '';

    const pdfBuffer = await generarActaPDF(acta, logoMinisterio, logoCordoba);

    // Generación local únicamente - no se sube a Drive
    // let pdfUrl = null;
    // try {
    //   const inspectorFolderId = await getInspectorFolder(acta.inspector?.nombre || 'Sin_nombre');
    //   const fileName = `Acta_${acta.expediente || acta.id}_${acta.fecha}.pdf`;
    //   const uploadResult = await uploadFile(pdfBuffer, fileName, 'application/pdf', inspectorFolderId);
    //   pdfUrl = uploadResult.webViewLink;
    // } catch (driveError) {
    //   console.error('Error uploading to Drive:', driveError);
    // }

    const { data: updatedActa } = await supabase
      .from('actas')
      .update({ 
        // pdf_url: pdfUrl, // No se actualiza URL ya que es local
        estado: 'cerrado'
      })
      .eq('id', id)
      .select()
      .single();

    // Devolver PDF como JSON con buffer en base64 para compatibilidad con frontend
    const base64 = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer.toString('base64')
      : Buffer.from(pdfBuffer, 'binary').toString('base64');
    console.log('Generando PDF para acta:', id);
    console.log('Datos del acta:', {
      firma_inspector: acta.firma_inspector_base64 ? 'Presente' : 'Ausente',
      firma_responsable: acta.firma_responsable_base64 ? 'Presente' : 'Ausente',
      fotos_count: acta.fotos_urls?.length || 0
    });
    res.json({
      pdfBuffer: base64,
      filename: `Acta_${acta.expediente || acta.id}_${acta.fecha}.pdf`
    });
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({ error: 'Error al generar PDF' });
  }
});

router.post('/informe/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.user;

    if (rol !== 'arquitecto') {
      return res.status(403).json({ error: 'Solo arquitectos pueden generar informes' });
    }

    const { data: informe, error } = await supabase
      .from('informes')
      .select(`
        *,
        arquitecto:usuarios!informes_arquitecto_id_fkey(nombre, dni)
      `)
      .eq('id', id)
      .single();

    if (error || !informe) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    // Map arquitecto data for PDF generation
    informe.arquitecto_nombre = informe.arquitecto?.nombre || '';
    informe.arquitecto_dni = informe.arquitecto?.dni || '';

    const logoMinisterio = process.env.LOGO_MINISTERIO_BASE64 || '';
    const logoCordoba = process.env.LOGO_CORDOBA_BASE64 || '';

    const pdfBuffer = await generarInformePDF(informe, logoMinisterio, logoCordoba);

    // Generación local únicamente - no se sube a Drive
    // let pdfUrl = null;
    // try {
    //   const informesFolderId = await getInformesFolder();
    //   const fileName = `Informe_${informe.expediente || informe.id}_${informe.fecha}.pdf`;
    //   const uploadResult = await uploadFile(pdfBuffer, fileName, 'application/pdf', informesFolderId);
    //   pdfUrl = uploadResult.webViewLink;
    // } catch (driveError) {
    //   console.error('Error uploading to Drive:', driveError);
    // }

    const { data: updatedInforme } = await supabase
      .from('informes')
      .update({ 
        // pdf_url: pdfUrl, // No se actualiza URL ya que es local
        estado: 'cerrado'
      })
      .eq('id', id)
      .select()
      .single();

    // Devolver PDF como JSON con buffer en base64 para compatibilidad con frontend
    const base64 = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer.toString('base64')
      : Buffer.from(pdfBuffer, 'binary').toString('base64');
    res.json({
      pdfBuffer: base64,
      filename: `Informe_${informe.expediente || informe.id}_${informe.fecha}.pdf`
    });
  } catch (err) {
    console.error('Error generating informe PDF:', err);
    res.status(500).json({ 
    error: 'Error al generar PDF',
    detalle: err.message,      // ← agrega esto
    stack: err.stack           // ← y esto
  });
  }
});

module.exports = router;
