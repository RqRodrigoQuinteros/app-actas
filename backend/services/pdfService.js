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
        if (valor.toLowerCase() === 'true' || valor === '1') {
          resultado[key] = true;
        } else if (valor.toLowerCase() === 'false' || valor === '0' || valor === '') {
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
  oncologico: [
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
  obra: ['conclusion_inspeccion'],
  laboratorio: [
    'conclusion_inspeccion',
    'laboratorio_general'
  ],
  consultorios: [
    'conclusion_inspeccion',
    'consultorios_general'
  ],
  hemoterapia: [
    'conclusion_inspeccion',
    'hemoterapia_general'
  ],
  radiodiagnostico: [
    'conclusion_inspeccion',
    'radiodiagnostico_general'
  ],
  internacion: [
    'conclusion_inspeccion',
    'internacion_general'
  ],
  emergencias: [
    'conclusion_inspeccion',
    'emergencias_general'
  ],
  salud_mental: [
    'conclusion_inspeccion',
    'salud_mental_general'
  ],
  odontologia: [
    'conclusion_inspeccion',
    'odontologia_general'
  ],
  farmacia: [
    'conclusion_inspeccion',
    'farmacia_general'
  ],
  otro: ['conclusion_inspeccion']
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

handlebars.registerHelper('siNo', function(value) {
  return value ? 'SI' : 'NO';
});

handlebars.registerHelper('valorClass', function(value) {
  return value ? '' : 'valor-no';
});

handlebars.registerHelper('hasValue', function(value) {
  return value !== undefined && value !== null && value !== '';
});

handlebars.registerHelper('valorSiNo', function(value) {
  if (value === true || value === 'true' || value === 'SI' || value === 'si') return 'SI';
  if (value === false || value === 'false' || value === 'NO' || value === 'no') return 'NO';
  return '';
});

async function generarActaPDF(acta, logoMinisterioBase64, logoCordobaBase64, membreteBase64) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PDF] Generando acta ${acta.id || 'sin ID'}, intento ${attempt}`);
      
      const baseTemplatePath = path.join(__dirname, '../templates/base_inspector.html');
      const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');
      console.log(`[PDF] Template base cargado`);

      const mapSeccion = s => s === 'conclusion' ? 'conclusion_inspeccion' : s;
      const secciones = acta.secciones_inspeccionadas && acta.secciones_inspeccionadas.length > 0
        ? acta.secciones_inspeccionadas.map(mapSeccion)
        : SECCIONES_POR_TIPOLOGIA[acta.establecimiento_tipologia] || ['conclusion_inspeccion'];
      
      console.log(`[PDF] Secciones a renderizar: ${secciones.join(', ')}`);
      
      const df = acta.datos_formulario || {};
      const contextoSecciones = {
        ...df,
        utis: Array.isArray(df.utis) && df.utis.length > 0
          ? df.utis
          : (df.nro_camas_uti || df.planos_uti || df.c_c_e_uti || df.martrans_nouco_uti || df.suptot_uti)
            ? [{ nombre: '', nro_camas: df.nro_camas_uti, planos: df.planos_uti, c_c_e: df.c_c_e_uti, martrans_nouco: df.martrans_nouco_uti, suptot: df.suptot_uti }]
            : [],
        ucos: Array.isArray(df.ucos) && df.ucos.length > 0
          ? df.ucos
          : (df.nro_camas_uco || df.planos_uco || df.c_c_e_uco)
            ? [{
                nombre: '', nro_camas: df.nro_camas_uco, planos: df.planos_uco, c_c_e: df.c_c_e_uco,
                s_v: df.s_v_uco, b_d: df.b_d, v_i_e: df.v_i_e_uco, m: df.m_uco,
                u_z_c_s: df.u_z_c_s_uco, s_i_p_l: df.s_i_p_l_uco, o_d_e: df.o_d_e_uco,
                mon: df.mon_uco, l_r_m_u: df.l_r_m_u_uco, a_l: df.a_l_uco, d_c_a: df.d_c_a_uco,
                s_m: df.s_m_uco, g_e: df.g_e_uco, a_c_d: df.a_c_d_uco, f_c_c: df.f_c_c_uco,
                pr: df.pr_uco, c_o_a: df.c_o_a_uco, d_c: df.d_c_uco, ro: df.ro_uco,
                p_a_r: df.p_a_r_uco, a_p: df.a_p_uco, v_p_d_c: df.v_p_d_c_uco,
                l_i_m: df.l_i_m_uco, l_c_c: df.l_c_c_uco, e_v_h: df.e_v_h_uco,
                v_v_p: df.v_v_p_uco, h_c: df.h_c_uco, c_l: df.c_l_uco, p_u: df.p_u_uco,
                d_t_e: df.d_t_e_uco, s_i: df.s_i_uco, herm: df.herm_uco, s_t_s: df.s_t_s_uco,
                i_n: df.i_n_uco, i_a: df.i_a_uco, i_i: df.i_i_uco, v_a_e_p: df.v_a_e_p_uco,
                e_asp: df.e_asp_uco, res_mec_vol: df.res_mec_vol_uco, e_des_sin: df.e_des_sin_uco,
                bo_inf: df.bo_inf_uco, car1: df.car1_uco, lari: df.lari_uco, masc: df.masc_uco,
                res_ambu: df.res_ambu_uco, tens: df.tens_uco, nebu: df.nebu_uco,
                el_in_endo: df.el_in_endo_uco, sis_por_as: df.sis_por_as_uco,
                cat_naso: df.cat_naso_uco, e_pun_raq: df.e_pun_raq_uco, e_pun_abd: df.e_pun_abd_uco,
                car_par: df.car_par_uco, ox_pul_por: df.ox_pul_por_uco, elec: df.elec_uco,
                mar2cat: df.mar2cat_uco, eqrx: df.eqrx_uco, el_traq: df.el_traq_uco,
                bol: df.bol_uco, ada: df.ada_uco, car_cur: df.car_cur_uco,
                ins_exa: df.ins_exa_uco, il_ind: df.il_ind_uco, sis_tor: df.sis_tor_uco,
                cat_ves: df.cat_ves_uco, cat_cat_ven: df.cat_cat_ven_uco,
                e_pun_tor: df.e_pun_tor_uco, bot24: df.bot24_uco
              }]
            : [],
      };
      
      // Normalizar todos los valores booleanos en contextoSecciones
      const contextoNormalizado = normalizarBooleanos(contextoSecciones);

      const seccionesHTML = secciones.map(s => {
        const filePath = path.join(__dirname, `../templates/secciones/${s}.html`);
        if (fs.existsSync(filePath)) {
          const sectionTemplateContent = fs.readFileSync(filePath, 'utf8');
          const sectionTemplate = handlebars.compile(sectionTemplateContent);
          return sectionTemplate(contextoNormalizado);
        } else {
          console.log(`[PDF] WARN: Archivo no encontrado: ${filePath}`);
          return '';
        }
      }).join('\n');
      console.log(`[PDF] Secciones renderizadas`);

      const template = handlebars.compile(baseTemplate);
      const htmlFinal = template({
        expediente: acta.expediente || '',
        fecha: acta.fecha,
        hora: acta.hora,
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
        fecha: acta.fecha,
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

module.exports = {
  generarActaPDF,
  generarInformePDF,
  generarNotificacionPDF,
  SECCIONES_POR_TIPOLOGIA
};