const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const handlebars = require('handlebars')

// Registrar helpers personalizados
handlebars.registerHelper('gt', (a, b) => a > b)
handlebars.registerHelper('lt', (a, b) => a < b)
handlebars.registerHelper('eq', (a, b) => a === b)
handlebars.registerHelper('gte', (a, b) => a >= b)
handlebars.registerHelper('lte', (a, b) => a <= b)
handlebars.registerHelper('and', (a, b) => a && b)
handlebars.registerHelper('or', function(...args) {
  const values = args.slice(0, -1);
  return values.some(v => v);
});

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

async function generarActaPDF(acta, logoMinisterioBase64, logoCordobaBase64) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const baseTemplatePath = path.join(__dirname, '../templates/base_inspector.html');
      const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf8');

      const secciones = SECCIONES_POR_TIPOLOGIA[acta.establecimiento_tipologia] || ['conclusion_inspeccion'];
      
      const seccionesHTML = secciones.map(s => {
        const filePath = path.join(__dirname, `../templates/secciones/${s}.html`);
        if (fs.existsSync(filePath)) {
          const sectionTemplateContent = fs.readFileSync(filePath, 'utf8');
          const sectionTemplate = handlebars.compile(sectionTemplateContent);
          const datosParaSeccion = acta.datos_formulario || {};
          return sectionTemplate(datosParaSeccion);
        } else {
          console.log(`Archivo no encontrado: ${filePath}`);
          return '';
        }
      }).join('\n');

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

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });
      
      const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
      const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10mm; font-size: 9pt; font-family: Arial, sans-serif;">
            ${headerLogoMinisterio}
            <div style="text-align: center;">
              <div style="font-weight: bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div>
              <div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div>
            </div>
            ${headerLogoCordoba}
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
      console.log(`Intento ${attempt}/${maxRetries} falló:`, err.message);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }
  throw lastError;
}

async function generarInformePDF(informe, logoMinisterioBase64, logoCordobaBase64) {
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' });
  
  const headerLogoMinisterio = logoMinisterioBase64 ? `<img src="${logoMinisterioBase64}" style="height: 40px;" />` : '';
  const headerLogoCordoba = logoCordobaBase64 ? `<img src="${logoCordobaBase64}" style="height: 40px;" />` : '';
  
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 10mm; font-size: 9pt; font-family: Arial, sans-serif;">
        ${headerLogoMinisterio}
        <div style="text-align: center;">
          <div style="font-weight: bold;">DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA</div>
          <div>MINISTERIO DE SALUD - PROVINCIA DE CÓRDOBA</div>
        </div>
        ${headerLogoCordoba}
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
  SECCIONES_POR_TIPOLOGIA
};
