# PROMPT_INSPECCIONES.md
# Especificación completa — App de Inspecciones Sanitarias
# Dirección General de Regulación Sanitaria — Ministerio de Salud, Córdoba, Argentina
# Última actualización: Abril 2026

---

## 1. DESCRIPCIÓN GENERAL

Aplicación web para gestión de inspecciones sanitarias. Permite a inspectores completar
formularios dinámicos en tablets Android, agregar fotos, firmar digitalmente, y generar
un PDF oficial del acta directamente — sin pasar por Google Docs.

El PDF generado replica el formato oficial del Ministerio de Salud de Córdoba:
logo institucional en el encabezado de cada página, tablas de ítems con SI/NO (NO en rojo),
secciones dinámicas según la tipología del establecimiento, fotos una por página,
y bloque de firmas al final.

---

## 2. STACK TECNOLÓGICO

- **Frontend:** React (Vite), Tailwind CSS, optimizado para tablets Android
- **Backend:** Node.js + Express
- **Base de datos:** Supabase (PostgreSQL)
- **Generación de PDF:** Puppeteer (renderiza HTML a PDF en el servidor)
- **Motor de plantillas PDF:** Handlebars (para inyectar datos en el HTML del acta)
- **Firma digital:** signature_pad (canvas, firma con dedo en tablet)
- **Almacenamiento de archivos:** Google Drive API (PDFs e imágenes)
- **Autenticación:** JWT simple con DNI
- **Hosting:** Railway (backend) + Vercel (frontend)

---

## 3. ROLES Y PERMISOS

### Inspector
- Inicia sesión seleccionando su nombre de un dropdown (no tipea el DNI manualmente)
- Ve solo sus propias actas
- Puede crear actas, completar formularios, subir fotos, firmar y generar PDF
- No puede ver actas de otros inspectores
- No puede modificar actas ya firmadas/cerradas

### Arquitecto
- Inicia sesión con usuario y contraseña
- Crea Informes de Arquitectura (documento distinto al acta del inspector)
- Tiene su propia plantilla PDF
- Los informes se guardan en una carpeta compartida de Drive

### Supervisor
- Rol oculto — no aparece en el dropdown de login público
- Accede por URL especial: /supervisor-login
- Ve todas las actas de todos los inspectores
- Puede ver historial, estados, y marcar "Subido a CIDI"
- Dashboard con listado general y filtros

---

## 4. INSPECTORES (datos reales — completar)

```js
const INSPECTORES = [
  { nombre: "FABIAN AVILA", dni: "92854906" },
  // Agregar los ~12 inspectores reales con sus DNIs
]
```

---

## 5. BASE DE DATOS — SUPABASE

### Tabla: `usuarios`
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('inspector', 'arquitecto', 'supervisor')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);
```

### Tabla: `establecimientos`
```sql
CREATE TABLE establecimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  localidad TEXT,
  tipologia TEXT NOT NULL,
  expediente TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Tabla: `actas`
```sql
CREATE TABLE actas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expediente TEXT,
  inspector_id UUID REFERENCES usuarios(id),
  establecimiento_id UUID REFERENCES establecimientos(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  virtual BOOLEAN DEFAULT false,
  presencial BOOLEAN DEFAULT true,
  responsable_nombre TEXT,
  responsable_dni TEXT,
  responsable_caracter TEXT,
  datos_formulario JSONB,
  observaciones TEXT,
  emplazamiento_dias INTEGER,
  firma_inspector_base64 TEXT,
  firma_responsable_base64 TEXT,
  fotos_urls TEXT[],
  pdf_url TEXT,
  subido_cidi BOOLEAN DEFAULT false,
  estado TEXT DEFAULT 'borrador' CHECK (estado IN ('borrador', 'firmado', 'cerrado')),
  created_at TIMESTAMP DEFAULT now()
);
```

### Tabla: `informes` (arquitectos)
```sql
CREATE TABLE informes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  arquitecto_id UUID REFERENCES usuarios(id),
  establecimiento_id UUID REFERENCES establecimientos(id),
  fecha DATE NOT NULL,
  datos_formulario JSONB,
  observaciones TEXT,
  firma_arquitecto_base64 TEXT,
  fotos_urls TEXT[],
  pdf_url TEXT,
  estado TEXT DEFAULT 'borrador',
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 6. TIPOLOGÍAS Y SECCIONES DINÁMICAS

Hay 14 tipologías de establecimientos. Cada una activa distintas secciones
en el formulario y en el PDF. A continuación las conocidas — completar las restantes.

### Configuración de secciones por tipología

```js
const SECCIONES_POR_TIPOLOGIA = {
  hemodialisis: [
    'conclusion_inspeccion',
    'hemodialisis_direccion',
    'hemodialisis_analisis_agua',
    'hemodialisis_serologia_personal',
    'hemodialisis_serologia_pacientes'
  ],
  quirurgicos: [
    'conclusion_inspeccion',
    'quirurgicos_general',
    'direccion_funcionamiento'
  ],
  obra: [
    'conclusion_inspeccion'
    // Solo observaciones de texto libre, sin tablas adicionales
  ],
  consultorios: [
    'conclusion_inspeccion',
    'consultorios_general',
    'direccion_funcionamiento'
  ],
  // Completar las 14 tipologías reales del Ministerio
}
```

### Sección fija en TODAS las tipologías: `conclusion_inspeccion`

Tabla con los siguientes ítems (valor SI / NO):
- Observado
- Director Técnico
- Laboratorio
- Hemoterapia
- Radiofísica
- Hemodiálisis

Los valores **NO** se muestran en **rojo negrita** tanto en el formulario como en el PDF.

---

## 7. ESTRUCTURA DEL PROYECTO

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NuevaActa.jsx
│   │   │   ├── SeccionDinamica.jsx
│   │   │   ├── FirmaCanvas.jsx
│   │   │   ├── SubidaFotos.jsx
│   │   │   ├── SupervisorDash.jsx
│   │   │   └── InformeArquitecto.jsx
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── actas.js
│   │   ├── informes.js
│   │   ├── pdf.js
│   │   └── drive.js
│   ├── templates/
│   │   ├── base_inspector.html
│   │   ├── base_arquitecto.html
│   │   └── secciones/
│   │       ├── conclusion_inspeccion.html
│   │       ├── hemodialisis_direccion.html
│   │       ├── hemodialisis_analisis_agua.html
│   │       ├── hemodialisis_serologia_personal.html
│   │       ├── hemodialisis_serologia_pacientes.html
│   │       ├── quirurgicos_general.html
│   │       ├── direccion_funcionamiento.html
│   │       └── ... (una por sección de cada tipología)
│   ├── services/
│   │   ├── pdfService.js
│   │   ├── driveService.js
│   │   └── supabaseClient.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
│
└── PROMPT_INSPECCIONES.md
```

---

## 8. ENDPOINTS DE LA API

### Autenticación
```
POST /api/auth/login          { dni, rol } → { token, usuario }
POST /api/auth/logout
GET  /api/auth/me
```

### Actas
```
GET    /api/actas
GET    /api/actas/:id
POST   /api/actas
PUT    /api/actas/:id
POST   /api/actas/:id/firmar
DELETE /api/actas/:id         (solo supervisor)
PATCH  /api/actas/:id/cidi    (toggle subido a CIDI)
```

### PDF
```
POST /api/pdf/generar/:id     → genera PDF, lo sube a Drive, retorna { pdf_url }
POST /api/pdf/informe/:id     → ídem para informes de arquitecto
```

### Fotos
```
POST /api/fotos/subir         → multipart/form-data, múltiples archivos, retorna URLs
```

### Establecimientos
```
GET  /api/establecimientos
POST /api/establecimientos
GET  /api/establecimientos/:id
```

### Informes (arquitecto)
```
GET    /api/informes
POST   /api/informes
PUT    /api/informes/:id
```

---

## 9. FLUJO COMPLETO DEL INSPECTOR

1. Abre la app en tablet Android
2. Selecciona su nombre del dropdown → se autentica con su DNI
3. Ve dashboard con actas anteriores y botón "Nueva Acta"
4. Completa formulario paso a paso (wizard):
   - Paso 1: Datos del establecimiento (expediente, nombre, dirección, localidad, tipología)
   - Paso 2: Datos del responsable presente (nombre, DNI, carácter)
   - Paso 3: Tipo de inspección (virtual/presencial), fecha y hora
   - Paso 4: Secciones dinámicas según tipología (ítems SI/NO con botones grandes)
   - Paso 5: Observaciones (texto libre)
   - Paso 6: Plazo de emplazamiento
5. Sube fotos: abre galería/cámara, selecciona múltiples a la vez, ve previews
6. Firma en canvas con el dedo (signature_pad)
7. El responsable del establecimiento también firma en el canvas
8. Toca "Generar Acta" → backend genera el PDF con Puppeteer
9. PDF se guarda en la carpeta Drive del inspector automáticamente
10. Inspector puede ver, compartir o imprimir el PDF

---

## 10. GENERACIÓN DEL PDF — LÓGICA COMPLETA

### `backend/services/pdfService.js`

```js
const puppeteer = require('puppeteer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

const SECCIONES_POR_TIPOLOGIA = {
  hemodialisis: [
    'conclusion_inspeccion',
    'hemodialisis_direccion',
    'hemodialisis_analisis_agua',
    'hemodialisis_serologia_personal',
    'hemodialisis_serologia_pacientes'
  ],
  quirurgicos: [
    'conclusion_inspeccion',
    'quirurgicos_general',
    'direccion_funcionamiento'
  ],
  obra: ['conclusion_inspeccion'],
  // completar...
}

async function generarActaPDF(acta) {
  const baseTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/base_inspector.html'), 'utf8'
  )

  const secciones = SECCIONES_POR_TIPOLOGIA[acta.tipologia] || ['conclusion_inspeccion']

  const seccionesHTML = secciones.map(s => {
    const filePath = path.join(__dirname, `../templates/secciones/${s}.html`)
    const sectionTemplate = handlebars.compile(fs.readFileSync(filePath, 'utf8'))
    return sectionTemplate(acta.datos_formulario || {})
  }).join('\n')

  const template = handlebars.compile(baseTemplate)
  const htmlFinal = template({
    expediente: acta.expediente,
    fecha: acta.fecha,
    hora: acta.hora,
    virtual: acta.virtual ? 'SI' : 'NO',
    presencial: acta.presencial ? 'SI' : 'NO',
    inspector_nombre: acta.inspector_nombre,
    inspector_dni: acta.inspector_dni,
    establecimiento_nombre: acta.establecimiento_nombre,
    establecimiento_direccion: acta.establecimiento_direccion,
    establecimiento_localidad: acta.establecimiento_localidad,
    responsable_nombre: acta.responsable_nombre,
    responsable_dni: acta.responsable_dni,
    responsable_caracter: acta.responsable_caracter,
    seccionesHTML,
    observaciones: acta.observaciones,
    emplazamiento_dias: acta.emplazamiento_dias,
    firma_inspector: acta.firma_inspector_base64,
    firma_responsable: acta.firma_responsable_base64,
    fotos: acta.fotos_urls || []
  })

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setContent(htmlFinal, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
  })
  await browser.close()

  return pdfBuffer
}

module.exports = { generarActaPDF }
```

---

## 11. PLANTILLA HTML BASE DEL ACTA

### Estructura de `base_inspector.html`

Cada página del PDF debe tener el header del Ministerio. Se logra con CSS `@page`
y un header fijo. La estructura general:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; }

    .header-ministerio {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 10px;
    }

    h1.titulo-acta {
      text-align: center;
      text-decoration: underline;
      font-size: 14pt;
    }

    .subtitulo { text-align: center; margin-bottom: 20px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    td, th { border: 1px solid black; padding: 6px 10px; }
    .valor-no { color: red; font-weight: bold; }

    .page-break { page-break-before: always; }

    .foto-pagina {
      page-break-before: always;
      display: flex;
      flex-direction: column;
    }
    .foto-pagina img {
      width: 100%;
      max-height: 230mm;
      object-fit: contain;
    }

    .firmas {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
    }
    .bloque-firma {
      width: 45%;
      text-align: center;
    }
    .linea-firma {
      border-top: 1px solid black;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>

  <!-- HEADER MINISTERIO -->
  <div class="header-ministerio">
    <img src="{{logo_ministerio_base64}}" height="50" />
    <img src="{{logo_cordoba_base64}}" height="50" />
  </div>

  <p style="text-align:right">Expte. N°: {{expediente}}</p>

  <h1 class="titulo-acta">ACTA DE INSPECCION</h1>
  <p class="subtitulo">INSPECCIÓN: VIRTUAL:{{virtual}} - PRESENCIAL:{{presencial}}</p>

  <p>
    En el dia {{fecha}} siendo las {{hora}} horas, el/la que suscribe inspector/a
    {{inspector_nombre}} DNI:{{inspector_dni}} comisionado por la Dirección General de
    Regulación Sanitaria, del Ministerio de Salud de la provincia de Córdoba, a los fines
    de efectuar inspección al Establecimiento {{establecimiento_nombre}} sito en calle
    {{establecimiento_direccion}} Localidad: {{establecimiento_localidad}} se constituye
    en el lugar a fin de cumplir las exigencias de la Ley 6.222 Decreto 033/08 y Resolución
    Ministerial N° 1226/2025 según el formulario de Inspección provisto por la repartición.
    Se solicita la presencia del responsable del Establecimiento y se hace presente el
    Sr./Sra. {{responsable_nombre}} DNI {{responsable_dni}} en su carácter de
    {{responsable_caracter}} efectuada la inspección, se constata:
  </p>

  <!-- SECCIONES DINÁMICAS SEGÚN TIPOLOGÍA -->
  {{{seccionesHTML}}}

  <!-- OBSERVACIONES -->
  {{#if observaciones}}
  <p><strong>Observaciones:</strong></p>
  <p>{{observaciones}}</p>
  {{/if}}

  <!-- EMPLAZAMIENTO -->
  <p>
    SE EMPLAZA POR EL TÉRMINO DE <strong>{{emplazamiento_dias}} HORAS/DÍAS</strong>
    A CUMPLIMENTAR LAS OBSERVACIONES FORMULADAS BAJO APERCIBIMIENTO DE CLAUSURA,
    SUMARIO Y DENUNCIA PENAL SI CORRESPONDIERE, EN CASO DE INCUMPLIMIENTO.
  </p>

  <!-- FIRMAS -->
  <div class="firmas">
    <div class="bloque-firma">
      {{#if firma_inspector}}
        <img src="{{firma_inspector}}" width="180" />
      {{/if}}
      <div class="linea-firma"></div>
      <p>Firma inspector</p>
      <p>{{inspector_nombre}} &nbsp;&nbsp; {{inspector_dni}}</p>
      <p>Aclaración &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DNI</p>
    </div>
    <div class="bloque-firma">
      {{#if firma_responsable}}
        <img src="{{firma_responsable}}" width="180" />
      {{/if}}
      <div class="linea-firma"></div>
      <p>Firma Responsable</p>
      <p>{{responsable_nombre}} &nbsp;&nbsp; {{responsable_dni}}</p>
      <p>Aclaración &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; DNI</p>
    </div>
  </div>

  <!-- FOTOS: una por página -->
  {{#each fotos}}
  <div class="foto-pagina">
    <div class="header-ministerio">
      <img src="{{../logo_ministerio_base64}}" height="50" />
      <img src="{{../logo_cordoba_base64}}" height="50" />
    </div>
    <img src="{{this}}" />
  </div>
  {{/each}}

</body>
</html>
```

---

## 12. EJEMPLO DE SECCIÓN MODULAR

### `secciones/hemodialisis_analisis_agua.html`

```html
<h3>ANÁLISIS DE AGUA</h3>
<table>
  <tr>
    <td>Fisico, Quimico</td>
    <td class="{{#unless datos.analisis_agua_fisico_quimico}}valor-no{{/unless}}">
      {{#if datos.analisis_agua_fisico_quimico}}SI{{else}}NO{{/if}}
    </td>
  </tr>
  <tr>
    <td>Bacteriologico</td>
    <td class="{{#unless datos.analisis_agua_bacteriologico}}valor-no{{/unless}}">
      {{#if datos.analisis_agua_bacteriologico}}SI{{else}}NO{{/if}}
    </td>
  </tr>
  <tr>
    <td>Fecha ultimo fisico-quimico</td>
    <td>{{datos.fecha_fisico_quimico}}</td>
  </tr>
  <tr>
    <td>Fecha ultimo bacteriologico</td>
    <td>{{datos.fecha_bacteriologico}}</td>
  </tr>
</table>
```

---

## 13. COMPONENTE DE FIRMA (Frontend)

```jsx
// FirmaCanvas.jsx
import SignaturePad from 'signature_pad'
import { useRef, useEffect } from 'react'

export default function FirmaCanvas({ onFirma, label }) {
  const canvasRef = useRef()
  const padRef = useRef()

  useEffect(() => {
    padRef.current = new SignaturePad(canvasRef.current, {
      backgroundColor: 'rgb(255,255,255)'
    })
  }, [])

  const guardar = () => {
    if (padRef.current.isEmpty()) return
    onFirma(padRef.current.toDataURL('image/png'))
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold">{label}</p>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="border border-gray-400 rounded touch-none"
      />
      <div className="flex gap-2">
        <button onClick={() => padRef.current.clear()}
          className="px-4 py-2 bg-gray-200 rounded">
          Limpiar
        </button>
        <button onClick={guardar}
          className="px-4 py-2 bg-blue-600 text-white rounded">
          Confirmar firma
        </button>
      </div>
    </div>
  )
}
```

---

## 14. COMPONENTE DE FOTOS MÚLTIPLES (Frontend)

```jsx
// SubidaFotos.jsx
import { useState } from 'react'

export default function SubidaFotos({ onFotosChange }) {
  const [previews, setPreviews] = useState([])

  const handleChange = (e) => {
    const archivos = Array.from(e.target.files)
    const urls = archivos.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...urls])
    onFotosChange(archivos)
  }

  const eliminar = (idx) => {
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center justify-center w-full h-16
        border-2 border-dashed border-gray-400 rounded cursor-pointer
        text-gray-600 text-lg">
        + Agregar fotos
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {previews.map((url, i) => (
          <div key={i} className="relative">
            <img src={url} className="w-24 h-24 object-cover rounded" />
            <button
              onClick={() => eliminar(i)}
              className="absolute top-0 right-0 bg-red-500 text-white
                rounded-full w-5 h-5 text-xs flex items-center justify-center">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 15. GOOGLE DRIVE — ESTRUCTURA DE CARPETAS

```
Drive raíz (cuenta de servicio del Ministerio)
├── Inspecciones/
│   ├── FABIAN AVILA/
│   │   └── (PDFs de actas)
│   ├── INSPECTOR 2/
│   │   └── ...
│   └── ... (una carpeta por inspector)
└── Informes Arquitectura/
    └── (PDFs de informes)
```

Usar **Google Drive API v3** con una **cuenta de servicio** (service account).
El backend sube los archivos automáticamente sin intervención del usuario.

---

## 16. VARIABLES DE ENTORNO

### Backend (`.env`)
```env
PORT=3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=xxxx
JWT_SECRET=xxxx_secreto_largo

GOOGLE_SERVICE_ACCOUNT_EMAIL=xxxx@xxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxx\n-----END PRIVATE KEY-----"
DRIVE_ROOT_FOLDER_ID=xxxx
```

### Frontend (`.env`)
```env
VITE_API_URL=https://tu-backend.railway.app
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxx
```

---

## 17. UI/UX — CONSIDERACIONES PARA TABLET ANDROID

- Fuente mínima 16px, botones mínimo 48px de alto
- Sin hover states — todo pensado para touch
- Formulario tipo wizard con pasos numerados y barra de progreso
- Los ítems SI/NO se responden con botones toggle grandes (no radio buttons pequeños)
- Los valores NO se muestran en ROJO en el formulario (coherencia con el PDF)
- Sin scroll horizontal en ninguna pantalla
- Orientación landscape preferida para la pantalla de firma
- Los previews de fotos deben ser lo suficientemente grandes para verificar en campo

---

## 18. FORMATO DEL ACTA PDF — DETALLES VISUALES

Basado en los PDFs reales del Ministerio:

- **Página:** A4, márgenes 20mm todos los lados
- **Header de cada página:** Logo "DIRECCIÓN GENERAL DE REGULACIÓN SANITARIA /
  MINISTERIO DE SALUD" a la izquierda + Logo "Córdoba Hacer para crecer /
  Gobierno de la Provincia" a la derecha
- **Título:** "ACTA DE INSPECCION" centrado, subrayado, negrita
- **Subtítulo:** "INSPECCIÓN: VIRTUAL:SI/NO - PRESENCIAL:SI/NO" centrado
- **Párrafo introductorio:** Texto justificado, fuente 11pt
- **Tablas:** Borde negro, celda izquierda con la descripción, celda derecha con el valor.
  SI en negro normal. **NO en rojo negrita.**
- **Títulos de sección:** Negrita, mayúsculas (ej: "ANÁLISIS DE AGUA")
- **Fotos:** Una por página, ancho completo del área imprimible, con header del ministerio
- **Firmas:** Dos bloques lado a lado: [espacio de imagen firma] / línea / nombre / DNI
- **Numeración de páginas:** Centrada al pie de cada página
- **Emplazamiento:** Texto en mayúsculas, el plazo en negrita

---

## 19. DIFERENCIAS INSPECTOR vs ARQUITECTO

| Característica       | Acta Inspector            | Informe Arquitecto          |
|----------------------|---------------------------|-----------------------------|
| Plantilla base       | `base_inspector.html`     | `base_arquitecto.html`      |
| Secciones            | Dinámicas por tipología   | Estructura propia            |
| Tabla conclusión     | Sí (fija para todas)      | No (diferente estructura)   |
| Firmas               | Inspector + Responsable   | Solo arquitecto             |
| Carpeta Drive        | Carpeta por inspector     | Carpeta compartida           |

---

## 20. DEPENDENCIAS

### Backend (`package.json`)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "puppeteer": "^21.0.0",
    "handlebars": "^4.7.0",
    "@supabase/supabase-js": "^2.0.0",
    "googleapis": "^126.0.0",
    "multer": "^1.4.5",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "signature_pad": "^4.1.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 21. INSTRUCCIONES PARA CLAUDE CODE

Guardá este archivo como `CLAUDE.md` en la raíz del proyecto para que Claude Code
lo lea automáticamente. O usalo manualmente con:

```
lee CLAUDE.md y construí el proyecto completo según la especificación
```

### Sugerencias de prompts por módulo:

**Todo el proyecto:**
```
Lee CLAUDE.md. Crea la estructura de carpetas completa, inicializa
backend y frontend, implementa toda la lógica según la especificación.
```

**Solo backend:**
```
Lee CLAUDE.md. Implementa solo el backend Node.js + Express:
estructura de carpetas, index.js, todas las rutas, servicios
de PDF (Puppeteer + Handlebars), Drive y Supabase.
```

**Solo frontend:**
```
Lee CLAUDE.md. Implementa solo el frontend React: Login con dropdown
de inspectores, Dashboard, formulario NuevaActa como wizard,
componente de firma FirmaCanvas, subida de fotos SubidaFotos,
y dashboard del supervisor.
```

**Solo generación de PDF:**
```
Lee CLAUDE.md. Implementa solo pdfService.js y todas las plantillas
HTML en /templates. El PDF debe replicar exactamente el formato
oficial del Ministerio de Salud de Córdoba descripto en el archivo.
```

**Solo base de datos:**
```
Lee CLAUDE.md. Genera el script SQL completo para crear todas las
tablas en Supabase según la especificación.
```

---

*Fin del documento — versión abril 2026*
