const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const handlebars = require('handlebars')

// Detectar la ruta de Chromium disponible (para Railway/producción)
function getChromiumPath() {
  // 1. Intentar SIN executablePath primero (usa el Chrome que encuentra Puppeteer)
  // No retornamos nada para que launchBrowser no pase executablePath
  try {
    const bundled = puppeteer.executablePath();
    if (bundled && bundled.includes('chrome')) {
      console.log(`[PDF] Usando Chrome bundled: ${bundled}`);
      return bundled;
    }
  } catch {}
  
  // 2. Intentar ruta de Nixpacks
  const nixPaths = [
    '/nix/var/nix/profiles/default/bin/chromium',
    '/nix/var/nix/profiles/default/bin/chromium-browser',
  ];
  for (const p of nixPaths) {
    try {
      const stat = fs.statSync(p);
      if (stat && stat.size > 1000) { // Si tiene contenido
        console.log(`[PDF] Nix Chrome OK: ${p}`);
        return p;
      }
    } catch {}
  }
  
  // 3. which chromium
  try {
    const found = execSync('which chromium 2>/dev/null || which chromium-browser 2>/dev/null || echo ""', {
      encoding: 'utf8', timeout: 3000
    }).trim();
    if (found && found.startsWith('/')) return found;
  } catch {}
  
  // 4..return empty - puppeteerBuscará en su PATH default
  return '';
}

async function launchBrowser() {
  const executablePath = getChromiumPath();
  const hasValidPath = executablePath && (executablePath.startsWith('/') || executablePath.startsWith('C:'));
  
  const launchOpts = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--disable-extensions',
      '--disable-accelerated-2d-canvas',
      '--disable-web-security',
      '--font-render-hintng=none',
      '--run-all-compositor-stages-before-draw',
    ],
  };
  
  if (hasValidPath) {
    launchOpts.executablePath = executablePath;
    console.log(`[PDF] Lanzando Chrome con path: ${executablePath}`);
  } else {
    console.log(`[PDF] Lanzando Chrome (sin path fixed)`);
  }
  
  return puppeteer.launch(launchOpts);
}

// Registrar helpers personalizados
handlebars.registerHelper('gt', (a, b) => a > b)
handlebars.registerHelper('lt', (a, b) => a < b)
handlebars.registerHelper('eq', (a, b) => a === b)
handlebars.registerHelper('gte', (a, b) => a >= b)
handlebars.registerHelper('lte', (a, b) => a <= b)
handlebars.registerHelper('and', (a, b) => a && b)
handlebars.registerHelper('orFunc', function(...args) {
  const options = args.pop();
  const values = args;
  return values.some(v => v);
});

// Helper para normalizar valores de SI/NO
handlebars.registerHelper('normalizeSiNo', function(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'si' || value.toLowerCase() === 'true' || value === '1';
  }
  return !!value; // Convertir a booleano
});

// Función para normalizar todos los valores booleanos en un objeto
function normalizarBooleanos(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const resultado = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (let key in resultado) {
    if (resultado.hasOwnProperty(key)) {
      const valor = resultado[key];
      const tipo = typeof valor;
      
      // Si es string que parece booleano, convertir
      if (tipo === 'string') {
        const valorLower = valor.toLowerCase();
        if (valorLower === 'true' || valorLower === 'si' || valor === '1') {
          resultado[key] = true;
        } else if (valorLower === 'false' || valorLower === 'no' || valor === '0' || valor === '') {
          resultado[key] = false;
        }
      }
      // Si es un objeto anidado, normalizar recursivamente (para arrays de UTIs/UCOs)
      else if (tipo === 'object' && valor !== null) {
        resultado[key] = normalizarBooleanos(valor);
      }
    }
  }
  
  return resultado;
}

function mapSeccion(value) {
  if (!value || typeof value !== 'string') return '';
  const key = value.trim().toLowerCase();
  const translations = {
    conclusion: 'conclusion_inspeccion',
    conclusion_inspeccion: 'conclusion_inspeccion',
    hemodialisis_serologia: 'hemodialisis_serologia',
    hemodialisis_serologia_personal: 'hemodialisis_serologia_personal',
    hemodialisis_serologia_pacientes: 'hemodialisis_serologia_pacientes',
  };
  return translations[key] || key;
}

const SECCIONES_POR_TIPOLOGIA = {
  quirurgicos: [
    'conclusion_inspeccion',
    'registros',
    'datos_generales',
    'consultorios_externos',
    'consultorios_salud_mental',
    'la_institucion_posee',
    'sector_internacion',
    'enfermeria',
    'area_quirurgica',
    'obstetricia',
    'laboratorio',
    'guardia',
    'uco',
    'uti',
    'utin',
    'hemodinamia',
    'hospital_dia',
    'quirurgicos_inscripcion',
    'quirurgicos_direccion_funcionamiento',
    'quirurgicos_enfermeria',
    'quirurgicos_area_internacion',
    'quirurgicos_equipamiento',
    'quirurgicos_esterilizacion'
  ],
  hemodialisis: [
    'conclusion_inspeccion',
    'registros',
    'datos_generales',
    'sector_internacion',
    'enfermeria',
    'hemodialisis_direccion_funcionamiento',
    'hemodialisis_analisis_agua',
    'hemodialisis_serologia'
  ],
  estetica: [
    'conclusion_inspeccion',
    'registros',
    'datos_generales',
    'estetica_inscripcion',
    'estetica_direccion_funcionamiento',
    'estetica_consultorios'
  ],
  opticas: [
    'conclusion_inspeccion',
    'registros',
    'opticas_local',
    'opticas_taller',
    'opticas_gabinete_contactologia'
  ],
  centambulatorios: [
    'conclusion_inspeccion',
    'registros',
    'datos_generales',
    'consultorios_externos',
    'sector_internacion',
    'enfermeria',
    'centamb_inscripcion',
    'centamb_direccion_funcionamiento',
    'centamb_esterilizacion'
  ],
  clinica: [
    'conclusion_inspeccion',
    'registros',
    'datos_generales',
    'consultorios_externos',
    'consultorios_salud_mental',
    'la_institucion_posee',
    'radiofisica',
    'sector_internacion',
    'enfermeria',
    'area_quirurgica',
    'obstetricia',
    'laboratorio',
    'guardia',
    'uco',
    'uti',
    'utin',
    'hemodinamia',
    'hospital_dia'
  ],
};

// Secciones base (siempre presentes) por tipología
const TIPOLOGIAS_CON_SELECTOR = ['clinica'];

const SECCIONES_BASE = {
  clinica: ['conclusion_inspeccion', 'registros', 'datos_generales'],
};

handlebars.registerHelper('mod', function(a, b) {
  return a % b;
});

handlebars.registerHelper('add', function(a, b) {
  return a + b;
});

handlebars.registerHelper('chunk', function(array, size) {
  if (!Array.isArray(array)) return [];
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
});

// Wrapper para secciones: solo renderiza si la tabla tiene al menos una fila con datos
handlebars.registerHelper('seccionWrapper', function(options) {
  const contenido = options.fn(this);
  const tieneFilas = /\<tr[\s>]/i.test(contenido);
  if (!tieneFilas) return '';
  return `<div class="seccion">${contenido}</div>`;
});

handlebars.registerHelper('siNo', function(value) {
  return value ? 'SI' : 'NO';
});

handlebars.registerHelper('valorClass', function(value) {
  const normalized = typeof value === 'string' ? value.toLowerCase().trim() : value;
  const isNo = normalized === false || normalized === 'false' || normalized === '0' || normalized === 'no';
  return isNo ? 'valor-no' : '';
});

handlebars.registerHelper('hasValue', function(value) {
  return value !== undefined && value !== null && value !== '';
});

handlebars.registerHelper('valorSiNo', function(value) {
  if (value === true || value === 'true' || value === 'SI' || value === 'si') return 'SI';
  if (value === false || value === 'false' || value === 'NO' || value === 'no') return 'NO';
  return '';
});

const formatFechaTexto = (fechaStr) => {
  if (!fechaStr) return '';
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  let fecha = new Date(fechaStr);
  if (Number.isNaN(fecha.getTime())) {
    const partes = String(fechaStr).split('/').map(p => p.trim());
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const anio = partes[2];
      if (!Number.isNaN(dia) && !Number.isNaN(mes) && anio) {
        return `${dia} de ${meses[mes - 1] || partes[1]} de ${anio}`;
      }
    }
    return fechaStr;
  }

  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};

async function generarActaPDF(acta, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PDF] Generando acta ${acta.id || 'sin ID'}, intento ${attempt}`);
      
      const baseTemplatePath = path.join(__dirname, '../templates/base_inspector.html');
      const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');
      console.log(`[PDF] Template base cargado`);

      console.log(`[PDF] Generando secciones dinámicas desde datos_formulario`);
      
      // Generar seccionesHTML dinámicamente desde datos_formulario (tokens desde actas_respuestas)
      const df = acta.datos_formulario || {};

      const seccionesHTML = (() => {
        const secciones = acta.secciones_render || [];
        if (secciones.length === 0) return '';

        const valorASiNo = (val) => {
          if (val === true || val === 'true') return { texto: 'SI', esBool: true, esSi: true };
          if (val === false || val === 'false') return { texto: 'NO', esBool: true, esSi: false };
          return { texto: String(val), esBool: false, esSi: false };
        };

        // Detecta si un valor es un array JSON de booleanos (formato tabla_unidades)
        const parsearArrayBool = (val) => {
          if (!val || typeof val !== 'string') return null;
          if (!val.startsWith('[')) return null;
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr) && arr.every(v => typeof v === 'boolean')) return arr;
          } catch {}
          return null;
        };

        // Un campo es "tabla por unidad" si su tipo lo dice O si su valor es array de booleanos
        const esTablaPorUnidad = (c) => {
          if (c.tipo === 'tabla_unidades') return true;
          return parsearArrayBool(df[c.token]) !== null;
        };

        // Detectar flota desde secciones_render ("Flota Vehicular #N")
        const flotasSections = secciones.filter(s => /flota vehicular/i.test(s.titulo));
        const flotaParaTabla = flotasSections.map(sec => ({
          marca:   df[(sec.campos.find(c => /marca/i.test(c.etiqueta))   || {}).token] || '',
          modelo:  df[(sec.campos.find(c => /modelo/i.test(c.etiqueta))  || {}).token] || '',
          dominio: df[(sec.campos.find(c => /dominio/i.test(c.etiqueta)) || {}).token] || '',
        }));

        // nUnidades: desde flota, o desde primer array bool encontrado
        let nUnidades = flotaParaTabla.length;
        if (nUnidades === 0) {
          outer: for (const sec of secciones) {
            for (const c of (sec.campos || [])) {
              const arr = parsearArrayBool(df[c.token]);
              if (arr && arr.length > 0) { nUnidades = arr.length; break outer; }
            }
          }
        }

        // Separar secciones: flota / normales / por unidad
        const seccionesNormales = secciones
          .filter(s => !/flota vehicular/i.test(s.titulo))
          .filter(s => !(s.campos || []).some(esTablaPorUnidad));

        const seccionesTabla = secciones
          .filter(s => !/flota vehicular/i.test(s.titulo))
          .filter(s => (s.campos || []).some(esTablaPorUnidad));

        // ── Flota combinada ────────────────────────────────────────────────────
        let flotaHTML = '';
        if (flotaParaTabla.length > 0) {
          const filas = flotaParaTabla.map((f, i) => `
            <tr>
              <td style="text-align:center;width:8%">${i + 1}</td>
              <td>${f.marca}</td><td>${f.modelo}</td><td>${f.dominio}</td>
            </tr>`).join('');
          flotaHTML = `
            <div class="seccion">
              <h3>Flota Vehicular</h3>
              <table class="tabla-campos">
                <thead><tr style="background:#f3f4f6">
                  <th style="text-align:center;width:8%">N°</th>
                  <th>Marca</th><th>Modelo</th><th>Dominio</th>
                </tr></thead>
                <tbody>${filas}</tbody>
              </table>
            </div>`;
        }

        // ── Secciones normales (SI/NO, texto, etc.) ───────────────────────────
        const normalesHTML = seccionesNormales.map(sec => {
          const filas = (sec.campos || [])
            .filter(c => df[c.token] !== undefined && df[c.token] !== null && df[c.token] !== '')
            .map(c => {
              const { texto, esBool, esSi } = valorASiNo(df[c.token]);
              const clase = esBool ? (esSi ? 'valor-si' : 'valor-no') : '';
              return `<tr><td style="width:70%;word-wrap:break-word">${c.etiqueta}</td><td class="${clase}" style="text-align:center;font-weight:bold;width:30%;min-width:80px">${texto}</td></tr>`;
            }).join('');
          if (!filas) return '';
          return `
            <div class="seccion">
              <h3>${sec.titulo}</h3>
              ${sec.texto_previo ? `<p style="font-size:10pt;color:#555;font-style:italic;margin-bottom:8px">${sec.texto_previo}</p>` : ''}
              <table class="tabla-campos"><tbody>${filas}</tbody></table>
              ${sec.texto_posterior ? `<p style="font-size:10pt;color:#555;font-style:italic;margin-top:8px">${sec.texto_posterior}</p>` : ''}
            </div>`;
        }).filter(Boolean).join('\n');

        // ── Una tabla por unidad ──────────────────────────────────────────────
        let porUnidadHTML = '';
        if (nUnidades > 0 && seccionesTabla.length > 0) {
          porUnidadHTML = Array.from({ length: nUnidades }, (_, ui) => {
            const flota = flotaParaTabla[ui] || {};
            const subtitulo = [flota.marca, flota.modelo, flota.dominio].filter(Boolean).join(' – ');

            const filasUnidad = seccionesTabla.map(sec => {
              const camposTabla = (sec.campos || []).filter(esTablaPorUnidad);
              if (camposTabla.length === 0) return '';

              const filasSec = camposTabla.map(c => {
                const checks = parsearArrayBool(df[c.token]) || [];
                const checked = checks[ui] === true;
                return `<tr>
                  <td style="width:85%;word-wrap:break-word;padding:3px 8px">${c.etiqueta}</td>
                  <td style="text-align:center;width:15%;font-size:14pt;font-weight:bold;color:${checked ? '#16a34a' : '#9ca3af'}">${checked ? '✓' : '–'}</td>
                </tr>`;
              }).join('');

              return `
                <tr style="background:#f3f4f6">
                  <td colspan="2" style="padding:5px 8px;font-weight:700;font-size:9pt;text-transform:uppercase;letter-spacing:0.04em">${sec.titulo}</td>
                </tr>
                ${filasSec}`;
            }).join('');

            if (!filasUnidad) return '';
            return `
              <div class="seccion">
                <h3>Unidad N° ${ui + 1}${subtitulo ? ` — ${subtitulo}` : ''}</h3>
                <table class="tabla-campos"><tbody>${filasUnidad}</tbody></table>
              </div>`;
          }).filter(Boolean).join('\n');
        }

        return [flotaHTML, normalesHTML, porUnidadHTML].filter(Boolean).join('\n');
      })();

      console.log(`[PDF] Secciones renderizadas dinámicamente`);

      const template = handlebars.compile(baseTemplate);
      const htmlFinal = template({
        expediente: acta.expediente || '',
        fecha: formatFechaTexto(acta.fecha),
        hora: acta.hora,
        tipo_inspeccion: acta.tipo_inspeccion || 'RUTINA',
        virtual: acta.virtual ? 'SI' : 'NO',
        presencial: acta.presencial ? 'SI' : 'NO',
        inspector_nombre: acta.inspector_nombre || '',
        inspector_dni: acta.inspector_dni || '',
        establecimiento_nombre: acta.establecimiento_nombre || '',
        establecimiento_direccion: acta.establecimiento_direccion || '',
        establecimiento_localidad: acta.establecimiento_localidad || '',
        tipologia: acta.tipologia || '',
        responsable_nombre: acta.responsable_nombre || '',
        responsable_dni: acta.responsable_dni || '',
        responsable_caracter: acta.responsable_caracter || '',
        seccionesHTML,
        observaciones: acta.observaciones || '',
        emplazamiento_valor: acta.emplazamiento_valor || acta.emplazamiento_dias || 0,
        emplazamiento_tipo: (() => {
          const tipo = acta.emplazamiento_tipo || 'HORAS';
          const valor = acta.emplazamiento_valor || acta.emplazamiento_dias || 0;
          if (valor === 1) {
            return tipo === 'HORAS' ? 'HORA' : (tipo === 'DIAS' || tipo === 'DÍAS' ? 'DÍA' : tipo);
          }
          return tipo;
        })(),
        firma_inspector: acta.firma_inspector_base64 || '',
        firma_responsable: acta.firma_responsable_base64 || '',
        fotos: acta.fotos_urls || [],
        logo_ministerio_base64: logoMinisterioBase64 || '',
        logo_cordoba_base64: logoCordobaBase64 || ''
      });

      console.log(`[PDF] HTML generado, tamaño: ${htmlFinal.length} chars`);

      const browser = await launchBrowser();
      console.log(`[PDF] Puppeteer launch OK`);

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.setContent(htmlFinal, { waitUntil: 'load' });
      console.log(`[PDF] Contenido seteado en página`);

      const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
      const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
      const headerContent = membreteBase64
        ? `<img src="${membreteBase64}" style="height: 50px; max-width: 100%; object-fit: contain;" />`
        : `<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">${headerLogoMinisterio}<div style="text-align:center;font-size:9pt;"><div style="font-weight:bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div><div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div></div>${headerLogoCordoba}</div>`;

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '25mm', bottom: '15mm', left: '20mm', right: '20mm' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width: 100%; padding: 0 20mm; box-sizing: border-box; text-align: center;">
            ${headerContent}
          </div>
        `,
        footerTemplate: `
          <div style="width: 100%; text-align: center; font-size: 10px; font-family: Arial, sans-serif;">
            Página <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        `
      });
      console.log(`[PDF] PDF generado, tamaño: ${pdfBuffer.length} bytes`);

      await browser.close();
      console.log(`[PDF] Browser cerrado, retorna PDF`);
      return pdfBuffer;
    } catch (err) {
      lastError = err;
      console.log(`[PDF] ERROR intento ${attempt}/${maxRetries}:`, err.message, err.stack);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
  throw lastError;
}

async function generarInformePDF(informe, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const baseTemplatePath = path.join(__dirname, '../templates/base_arquitecto.html');
  const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

  const template = handlebars.compile(baseTemplate);
  const htmlFinal = template({
    expediente: informe.expediente || '',
    fecha: informe.fecha,
    arquitecto_nombre: informe.arquitecto_nombre || '',
    arquitecto_dni: informe.arquitecto_dni || '',
    establecimiento_nombre: informe.establecimiento_nombre || '',
    establecimiento_direccion: informe.establecimiento_direccion || '',
    establecimiento_localidad: informe.establecimiento_localidad || '',
    datos_formulario: informe.datos_formulario || {},
    observaciones: informe.observaciones || '',
    firma_arquitecto: informe.firma_arquitecto_base64 || '',
    logo_ministerio_base64: logoMinisterioBase64 || '',
    logo_cordoba_base64: logoCordobaBase64 || ''
  });

  const browser = await launchBrowser();

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setContent(htmlFinal, { waitUntil: 'load' });

  const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
  const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
  const headerContent = membreteBase64
    ? `<img src="${membreteBase64}" style="height: 50px; max-width: 100%; object-fit: contain;" />`
    : `<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">${headerLogoMinisterio}<div style="text-align:center;font-size:9pt;"><div style="font-weight:bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div><div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div></div>${headerLogoCordoba}</div>`;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '25mm', bottom: '15mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; padding: 0 20mm; box-sizing: border-box; text-align: center;">
        ${headerContent}
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 10px; font-family: Arial, sans-serif;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </div>
    `
  });

  await browser.close();
  return pdfBuffer;
}


async function generarNotificacionPDF(acta, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const baseTemplatePath = path.join(__dirname, '../templates/base_notificacion.html');
      const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

      const template = handlebars.compile(baseTemplate);
      const htmlFinal = template({
        expediente: acta.expediente || '',
        fecha: formatFechaTexto(acta.fecha),
        hora: acta.hora,
        inspector_nombre: acta.inspector_nombre || '',
        inspector_dni: acta.inspector_dni || '',
        establecimiento_nombre: acta.establecimiento_nombre || '',
        establecimiento_direccion: acta.establecimiento_direccion || '',
        establecimiento_localidad: acta.establecimiento_localidad || '',
        responsable_nombre: acta.responsable_nombre || '',
        responsable_dni: acta.responsable_dni || '',
        responsable_caracter: acta.responsable_caracter || '',
        observaciones: acta.observaciones || '',
        emplazamiento_valor: acta.emplazamiento_valor || acta.emplazamiento_dias || 0,
        emplazamiento_tipo: (() => {
          const tipo = acta.emplazamiento_tipo || 'HORAS';
          const valor = acta.emplazamiento_valor || acta.emplazamiento_dias || 0;
          if (valor === 1) {
            return tipo === 'HORAS' ? 'HORA' : (tipo === 'DIAS' || tipo === 'DÍAS' ? 'DÍA' : tipo);
          }
          return tipo;
        })(),
        firma_inspector: acta.firma_inspector_base64 || '',
        firma_responsable: acta.firma_responsable_base64 || '',
        logo_ministerio_base64: logoMinisterioBase64 || '',
        logo_cordoba_base64: logoCordobaBase64 || '',
      });

      const browser = await launchBrowser();

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);
      await page.setContent(htmlFinal, { waitUntil: 'load' });

      const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
      const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
      const headerContent = membreteBase64
        ? `<img src="${membreteBase64}" style="height: 50px; max-width: 100%; object-fit: contain;" />`
        : `<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">${headerLogoMinisterio}<div style="text-align:center;font-size:9pt;"><div style="font-weight:bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div><div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div></div>${headerLogoCordoba}</div>`;

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '25mm', bottom: '15mm', left: '20mm', right: '20mm' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width: 100%; padding: 0 20mm; box-sizing: border-box; text-align: center;">
            ${headerContent}
          </div>
        `,
        footerTemplate: `
          <div style="width: 100%; text-align: center; font-size: 10px; font-family: Arial, sans-serif;">
            Página <span class="pageNumber"></span> de <span class="totalPages"></span>
          </div>
        `
      });

      await browser.close();
      return pdfBuffer;
    } catch (err) {
      lastError = err;
      console.log(`Notificación intento ${attempt}/3 falló:`, err.message);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastError;
}

async function generarInformeGeriatricoPDF(datos, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const templatePath = path.join(__dirname, '../templates/base_geriatrico.html');
  const baseTemplate = fs.readFileSync(templatePath, 'utf8');

  const template = handlebars.compile(baseTemplate);
  const htmlFinal = template(datos);

  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setContent(htmlFinal, { waitUntil: 'load' });

  const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
  const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
  const headerContent = membreteBase64
    ? `<img src="${membreteBase64}" style="height: 50px; max-width: 100%; object-fit: contain;" />`
    : `<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">${headerLogoMinisterio}<div style="text-align:center;font-size:9pt;"><div style="font-weight:bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div><div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div></div>${headerLogoCordoba}</div>`;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '28mm', bottom: '15mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; padding: 0 20mm; box-sizing: border-box; text-align: center;">
        ${headerContent}
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 10px; font-family: Arial, sans-serif;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </div>
    `
  });

  await browser.close();
  return pdfBuffer;
}

const CAMPOS_RADIOFISICA = [
  'rad_convencional', 'rad_acelerador', 'rad_ortopanto', 'rad_tomografia',
  'rad_litotricia', 'rad_laser', 'rad_hemodinamia', 'rad_pet',
  'rad_resonancia', 'rad_densitometria', 'hemoterapia',
];

async function generarInformeArqPDF(datos, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const templatePath = path.join(__dirname, '../templates/base_informe_arq.html');
  const baseTemplate = fs.readFileSync(templatePath, 'utf8');

  const template = handlebars.compile(baseTemplate);
  const tieneRadiofisica = CAMPOS_RADIOFISICA.some(k => datos[k]);
  const tieneOtros = ['otro_laboratorio', 'otro_hemodialisis', 'cantUnidadesHemodialisis', 'otro_oncologicos', 'cantUnidadesOncologicos', 'otro_pileta'].some(k => datos[k]);
  const htmlFinal = template({ ...datos, tieneRadiofisica, tieneOtros });

  const browser = await launchBrowser();
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000);
  await page.setContent(htmlFinal, { waitUntil: 'load' });

  const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
  const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
  const headerContent = membreteBase64
    ? `<img src="${membreteBase64}" style="height: 50px; max-width: 100%; object-fit: contain;" />`
    : `<div style="display:flex;justify-content:space-between;align-items:center;width:100%;">${headerLogoMinisterio}<div style="text-align:center;font-size:9pt;"><div style="font-weight:bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div><div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div></div>${headerLogoCordoba}</div>`;

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '28mm', bottom: '15mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; padding: 0 20mm; box-sizing: border-box; text-align: center;">
        ${headerContent}
      </div>
    `,
    footerTemplate: `
      <div style="width: 100%; text-align: center; font-size: 10px; font-family: Arial, sans-serif;">
        Página <span class="pageNumber"></span> de <span class="totalPages"></span>
      </div>
    `
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = {
  generarActaPDF,
  generarInformePDF,
  generarNotificacionPDF,
  generarInformeGeriatricoPDF,
  generarInformeArqPDF,
  SECCIONES_POR_TIPOLOGIA
};