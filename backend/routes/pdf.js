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
  console.log('[PDF] enriquecerConRespuestas - acta.id:', acta.id);

  // Paso 1: obtener respuestas con info del campo (incluyendo seccion_id)
  const { data: respuestas, error } = await supabase
    .from('actas_respuestas')
    .select('valor, campo:template_campos(id, token, tipo, etiqueta, orden, seccion_id)')
    .eq('acta_id', acta.id);

  console.log('[PDF] respuestas count:', respuestas?.length ?? 0);
  console.log('[PDF] respuestas error:', error?.message ?? 'ninguno');
  if (respuestas?.length > 0) {
    console.log('[PDF] primera respuesta raw:', JSON.stringify(respuestas[0], null, 2));
  }

  if (error) {
    console.log('[PDF] ERROR en query respuestas:', error.message);
  }

  // Construir { token: valor } para Handlebars
  const datosFormulario = {};
  if (respuestas && respuestas.length > 0) {
    for (const r of respuestas) {
      if (!r.campo?.token) continue;
      datosFormulario[r.campo.token] = r.campo.tipo === 'si_no'
        ? (r.valor === 'SI' || r.valor === 'true')
        : r.valor;
    }
  }
  console.log('[PDF] datosFormulario keys:', Object.keys(datosFormulario));

  // Paso 2: obtener secciones por sus IDs (query separada, más robusta)
  const seccionIds = [...new Set(
    (respuestas || []).map(r => r.campo?.seccion_id).filter(Boolean)
  )];
  console.log('[PDF] seccionIds:', seccionIds);

  let seccionLookup = {};
  if (seccionIds.length > 0) {
    const { data: secciones, error: errSec } = await supabase
      .from('template_secciones')
      .select('id, titulo, orden, texto_previo, texto_posterior')
      .in('id', seccionIds);
    if (errSec) console.log('[PDF] ERROR en query secciones:', errSec.message);
    if (secciones) {
      seccionLookup = Object.fromEntries(secciones.map(s => [s.id, s]));
    }
  }
  console.log('[PDF] seccionLookup keys:', Object.keys(seccionLookup));

  // Construir estructura de secciones agrupando campos por seccion
  const seccionesMap = {};
  for (const r of (respuestas || [])) {
    if (!r.campo?.token) continue;
    const seccionId = r.campo.seccion_id;
    if (!seccionId || !seccionLookup[seccionId]) {
      console.log('[PDF] WARN: campo sin seccion en lookup:', r.campo.token, 'seccion_id:', seccionId);
      continue;
    }
    const sec = seccionLookup[seccionId];
    if (!seccionesMap[seccionId]) {
      seccionesMap[seccionId] = {
        id: seccionId,
        titulo: sec.titulo,
        orden: sec.orden,
        texto_previo: sec.texto_previo,
        texto_posterior: sec.texto_posterior,
        campos: [],
      };
    }
    seccionesMap[seccionId].campos.push({
      token: r.campo.token,
      etiqueta: r.campo.etiqueta,
      tipo: r.campo.tipo,
      orden: r.campo.orden,
    });
  }

  const secciones_render = Object.values(seccionesMap)
    .sort((a, b) => a.orden - b.orden)
    .map(s => ({ ...s, campos: s.campos.sort((a, b) => a.orden - b.orden) }));

  console.log('[PDF] secciones_render count:', secciones_render.length);

  // Paso 3: procesar secciones repetibles (ej: UTIs) desde datos_formulario.secciones_extra
  const seccionesExtraData = acta.datos_formulario?.secciones_extra || {};
  const extraSeccionIds = Object.keys(seccionesExtraData).map(Number).filter(id => id > 0);
  console.log('[PDF] extraSeccionIds (repetibles):', extraSeccionIds);

  if (extraSeccionIds.length > 0) {
    // Fetchear secciones que no están en el lookup todavía
    const faltantes = extraSeccionIds.filter(id => !seccionLookup[id]);
    if (faltantes.length > 0) {
      const { data: extraSecs } = await supabase
        .from('template_secciones')
        .select('id, titulo, orden, texto_previo, texto_posterior')
        .in('id', faltantes);
      if (extraSecs) extraSecs.forEach(s => { seccionLookup[s.id] = s; });
    }

    // Recolectar todos los campo IDs usados en las instancias
    const allCampoIds = new Set();
    for (const instancias of Object.values(seccionesExtraData)) {
      for (const inst of (instancias || [])) {
        Object.keys(inst).filter(k => k !== '__obs').forEach(k => {
          const n = parseInt(k);
          if (n > 0) allCampoIds.add(n);
        });
      }
    }

    // Fetchear metadata de campos
    const campoLookup = {};
    if (allCampoIds.size > 0) {
      const { data: campos } = await supabase
        .from('template_campos')
        .select('id, etiqueta, tipo, token, orden')
        .in('id', [...allCampoIds]);
      if (campos) campos.forEach(c => { campoLookup[c.id] = c; });
    }
    console.log('[PDF] campoLookup keys (repetibles):', Object.keys(campoLookup));

    // Construir secciones sintéticas para cada instancia (UTI #1, UTI #2, ...)
    for (const [secIdStr, instancias] of Object.entries(seccionesExtraData)) {
      const secId = parseInt(secIdStr);
      const sec = seccionLookup[secId];
      if (!sec || !instancias?.length) continue;

      for (let i = 0; i < instancias.length; i++) {
        const inst = instancias[i];
        const camposInstancia = [];

        for (const [campoIdStr, valor] of Object.entries(inst)) {
          if (campoIdStr === '__obs') continue;
          const campoId = parseInt(campoIdStr);
          const campo = campoLookup[campoId];
          if (!campo) continue;

          const syntheticToken = `__rep_${secId}_${i}_${campoId}`;
          datosFormulario[syntheticToken] = campo.tipo === 'si_no'
            ? (valor === 'SI' || valor === 'true' || valor === true)
            : valor;

          camposInstancia.push({
            token: syntheticToken,
            etiqueta: campo.etiqueta,
            tipo: campo.tipo,
            orden: campo.orden,
          });
        }

        if (camposInstancia.length > 0) {
          secciones_render.push({
            id: `rep_${secId}_${i}`,
            titulo: `${sec.titulo} #${i + 1}`,
            orden: sec.orden + (i * 0.001),
            texto_previo: null,
            texto_posterior: inst.__obs || null,
            campos: camposInstancia.sort((a, b) => a.orden - b.orden),
          });
        }
      }
    }

    // Re-ordenar todas las secciones (normales + repetibles)
    secciones_render.sort((a, b) => a.orden - b.orden);
    console.log('[PDF] secciones_render total (con repetibles):', secciones_render.length);
  }

  return {
    ...acta,
    datos_formulario: { ...datosFormulario, secciones_extra: acta.datos_formulario?.secciones_extra || {} },
    secciones_render,
  };
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
    console.log('[PDF] REQUEST RECIBIDO generar-base64, id:', req.params.id);
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

    // Títulos dinámicos según tipología
    const TITULOS_TIPOLOGIA = {
      'Geriátricos': { tituloInforme: 'Evaluación Técnica Geriátricos', subtituloInforme: 'Fiscalización Edilicia' },
    };
    const tipNombre = datos.tipologia_nombre || 'Geriátricos';
    const titulos = TITULOS_TIPOLOGIA[tipNombre] || {
      tituloInforme: `Evaluación Técnica — ${tipNombre}`,
      subtituloInforme: 'Fiscalización Edilicia',
    };
    const datosConTitulos = { ...datos, ...titulos };

    const esGeriatrico = tipNombre === 'Geriátricos';
    let buffer;
    if (esGeriatrico) {
      buffer = toBuffer(await generarInformeGeriatricoPDF(datosConTitulos, logoMinisterio, logoCordoba, logoMembrete));
    } else {
      const { generarInformeArqPDF } = require('../services/pdfService');
      // Agrupar artículos observados por grupo
      const gruposMap = {};
      (datos.articulosObservados || []).forEach(art => {
        const g = art.grupo || 'General';
        if (!gruposMap[g]) gruposMap[g] = { nombre: g, articulos: [] };
        gruposMap[g].articulos.push(art);
      });
      const datosArq = { ...datosConTitulos, gruposArticulos: Object.values(gruposMap) };
      buffer = toBuffer(await generarInformeArqPDF(datosArq, logoMinisterio, logoCordoba, logoMembrete));
    }

    const partes = [
      'Evaluación técnica Arquitectura',
      datos.nombreEst || '',
      datos.expDigital || datos.expPapel || '',
    ].filter(Boolean).join(' - ');
    const nombreArchivo = `${partes}.pdf`.replace(/[^a-zA-Z0-9_.\-\s]/g, '_');

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Error generando PDF geriátrico:', err);
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});

module.exports = router;