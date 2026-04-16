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
- Selecciona la tipología del informe al crear uno nuevo (carga artículos desde DB)
- Genera PDF con nombre: "Evaluación técnica Arquitectura - Establecimiento - Expediente.pdf"
- Los informes se guardan en una carpeta compartida de Drive
- Usa PC exclusivamente (no hay consideraciones mobile para su interfaz)

### Supervisor
- Rol oculto — no aparece en el dropdown de login público
- Accede por URL especial: /supervisor-login
- Ve todas las actas de todos los inspectores
- Puede ver historial, estados, y marcar "Subido a CIDI"
- Dashboard con listado general y filtros
- Tiene acceso al panel de Admin Templates

### Admin
- Accede por URL especial: /admin-login
- Gestiona templates dinámicos de actas de inspectores
- Gestiona tipologías e ítems de informes de arquitecto
- Puede configurar encabezado y texto de emplazamiento del PDF
- Panel en /admin/templates con tres tabs: "Tipologías y campos", "Encabezado y emplazamiento", "Informes de Arquitecto"

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
  rol TEXT NOT NULL CHECK (rol IN ('inspector', 'arquitecto', 'supervisor', 'admin')),
  activo BOOLEAN DEFAULT true,
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
  establecimiento_nombre TEXT,
  establecimiento_direccion TEXT,
  establecimiento_localidad TEXT,
  expediente TEXT,
  fecha DATE,
  datos_formulario JSONB,  -- incluye: generales, checks, observaciones, tipo, tipologia_id, tipologia_nombre
  observaciones TEXT,
  estado TEXT DEFAULT 'borrador',
  tipo TEXT DEFAULT 'geriatrico',
  created_at TIMESTAMP DEFAULT now()
);
```

### Tablas del sistema de templates dinámicos (actas de inspector)
```sql
-- Tipologías de establecimiento
CREATE TABLE template_tipologia (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Secciones de cada tipología
CREATE TABLE template_secciones (
  id SERIAL PRIMARY KEY,
  tipologia_id INTEGER REFERENCES template_tipologia(id) ON DELETE CASCADE,
  parent_seccion_id INTEGER REFERENCES template_secciones(id) ON DELETE CASCADE,  -- para subsecciones
  titulo TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  texto_previo TEXT,
  texto_posterior TEXT,
  tipo TEXT DEFAULT 'normal',      -- 'normal' o 'residentes'
  repetible BOOLEAN DEFAULT false, -- puede repetirse múltiples veces
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Campos de cada sección
CREATE TABLE template_campos (
  id SERIAL PRIMARY KEY,
  seccion_id INTEGER REFERENCES template_secciones(id) ON DELETE CASCADE,
  etiqueta TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('si_no','texto','textarea','numero','fecha','select','check')),
  orden INTEGER DEFAULT 0,
  requerido BOOLEAN DEFAULT false,
  placeholder TEXT,
  opciones JSONB,  -- solo para tipo 'select'
  token TEXT,     -- identificador para el PDF
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Respuestas del inspector por acta
CREATE TABLE actas_respuestas (
  id SERIAL PRIMARY KEY,
  acta_id UUID REFERENCES actas(id) ON DELETE CASCADE,
  campo_id INTEGER REFERENCES template_campos(id),
  valor TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración de encabezado y emplazamiento del PDF
CREATE TABLE encabezado_config (
  id SERIAL PRIMARY KEY,
  nombre TEXT DEFAULT 'default',
  texto_html TEXT,
  texto_emplazamiento TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tablas del sistema de informes de arquitecto
```sql
-- Tipologías de informe de arquitecto
CREATE TABLE informe_tipologia (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Artículos/ítems por tipología
CREATE TABLE informe_items (
  id SERIAL PRIMARY KEY,
  tipologia_id INTEGER REFERENCES informe_tipologia(id) ON DELETE CASCADE,
  nro TEXT NOT NULL,           -- ej: "13.a.1", "27"
  descripcion TEXT NOT NULL,
  grupo TEXT,                  -- sección colapsable, ej: "Circulaciones", "Baños"
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. SISTEMA DE TEMPLATES DINÁMICOS (actas de inspector)

Las secciones y campos del formulario del inspector se cargan desde la BD, no están hardcodeados.
El admin configura tipologías → secciones → campos desde el panel `/admin/templates`.

### Flujo de datos:
1. `template_tipologia` define los tipos de establecimiento disponibles
2. Cada tipología tiene `template_secciones` con título, orden y textos opcionales
3. Cada sección tiene `template_campos` con tipo (si_no, texto, textarea, etc.), etiqueta y token
4. Al guardar el acta, las respuestas se guardan en `actas_respuestas` vinculadas por `campo_id`
5. Al generar el PDF, se recuperan las respuestas con sus secciones y se renderizan dinámicamente

### Tipos de campo soportados:
- `si_no` — botones SI / NO (NO en rojo)
- `texto` — input de texto corto
- `textarea` — texto largo
- `numero` — input numérico
- `fecha` — date picker
- `select` — desplegable con opciones configurables
- `check` — checkbox

### Secciones colapsables (inspector en tablet):
`SeccionDinamica.jsx` renderiza cada sección como acordeón:
- Primera sección abierta por defecto, resto cerradas
- Header touch-friendly (56px mínimo), con número de sección y flecha ▲/▼
- El body con los campos se muestra/oculta al tocar el header

---

## 7. INFORMES DE ARQUITECTO

### Formulario (`InformeArqGeriatricos.jsx`)
Tres pasos (tabs):
1. **Datos Generales** — campos fijos agrupados en secciones:
   - Expediente (digital, papel, fojas)
   - Establecimiento (nombre, arquitecto, dirección, barrio, etc.)
   - Nomenclatura Catastral
   - Radiofísica (14 campos SI/NO — solo se imprimen si tienen valor)
   - Otros (Laboratorio, Hemodiálisis, Oncológicos, Pileta)
   - Observaciones y Conclusión
2. **Artículos** — lista de artículos cargados desde `informe_items` según `tipologia_id`.
   Si los artículos tienen `grupo` asignado, se muestran como acordeón colapsable.
   Al tildar un artículo, aparece textarea para observaciones.
3. **Vista Previa** — resumen del informe antes de generar PDF.

### Tipologías y artículos dinámicos:
- Al crear un informe, se selecciona la tipología en un modal
- Los artículos se cargan desde `informe_items` según `tipologia_id`
- El campo `grupo` en `informe_items` agrupa artículos en secciones colapsables
- Fallback: si no hay tipología configurada, usa artículos hardcodeados de geriátricos

### PDFs de arquitecto:
- **Geriátricos** → `base_geriatrico.html` (via `generarInformeGeriatricoPDF`)
- **Otras tipologías** → `base_informe_arq.html` (via `generarInformeArqPDF`)
  - Campos dinámicos: solo imprime los que tienen valor
  - Artículos agrupados por `grupo`
  - Secciones Radiofísica y Otros aparecen solo si hay datos
- Nombre del archivo: `"Evaluación técnica Arquitectura - {nombreEst} - {expediente}.pdf"`
- Sin firma ni línea de firma — solo nombre, matrícula y cargo del arquitecto

### Panel admin (TabInformes en AdminTemplates):
- Crear/editar tipologías de informe
- Crear/editar artículos con campos: N° de artículo, Sección/Grupo (opcional), Descripción
- El grupo aparece como badge violeta en la lista

---

## 8. ESTRUCTURA DEL PROYECTO

```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx                  — login inspectores (dropdown)
│   │   │   ├── Dashboard.jsx              — actas del inspector
│   │   │   ├── NuevaActa.jsx              — wizard para crear acta
│   │   │   ├── VerActa.jsx                — vista detalle de acta con secciones dinámicas
│   │   │   ├── SeccionDinamica.jsx        — secciones colapsables del formulario (inspector)
│   │   │   ├── FirmaCanvas.jsx            — firma digital con signature_pad
│   │   │   ├── SubidaFotos.jsx            — carga múltiple de fotos
│   │   │   ├── SupervisorDash.jsx         — dashboard supervisor (todas las actas)
│   │   │   ├── AdminLogin.jsx             — login para rol admin
│   │   │   ├── AdminTemplates.jsx         — panel admin: templates + informes arq
│   │   │   ├── InformeArquitecto.jsx      — listado de informes del arquitecto
│   │   │   └── InformeArqGeriatricos.jsx  — formulario de informe (todas las tipologías)
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   └── api.js                     — axios + todos los API clients
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── actas.js
│   │   ├── establecimientos.js
│   │   ├── informes.js
│   │   ├── informes-templates.js  — CRUD tipologías e items de arquitecto
│   │   ├── templates.js           — CRUD templates dinámicos de inspector
│   │   ├── pdf.js                 — generación de PDFs (actas + informes)
│   │   └── fotos.js
│   ├── templates/
│   │   ├── base_inspector.html    — template acta de inspector
│   │   ├── base_geriatrico.html   — template informe arquitecto geriátricos
│   │   ├── base_informe_arq.html  — template informe arquitecto otras tipologías
│   │   ├── base_notificacion.html
│   │   ├── img6.jpg               — logo membrete
│   │   ├── logo_ministerio.png
│   │   └── logo_cordoba.png
│   ├── services/
│   │   ├── pdfService.js          — generarActaPDF, generarInformeGeriatricoPDF, generarInformeArqPDF
│   │   ├── driveService.js
│   │   └── supabaseClient.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
│
└── CLAUDE.md
```

---

## 9. ENDPOINTS DE LA API

### Autenticación
```
POST /api/auth/login                     { dni, rol, password? } → { token, usuario }
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/usuarios-login            — lista usuarios activos para dropdown
```

### Actas
```
GET    /api/actas
GET    /api/actas/:id
POST   /api/actas
PUT    /api/actas/:id
POST   /api/actas/:id/firmar
DELETE /api/actas/:id                    (solo supervisor)
PATCH  /api/actas/:id/cidi               (toggle subido a CIDI)
```

### PDF
```
POST /api/pdf/generar/:id                → acta inspector → PDF + Drive
POST /api/pdf/generar-notificacion/:id   → PDF notificación
POST /api/pdf/geriatrico                 → informe arquitecto → PDF (bifurca por tipología)
POST /api/pdf/informe/:id                → informe arquitecto legacy (por id)
```

### Templates dinámicos (inspector)
```
GET  /api/templates/encabezado
PUT  /api/templates/encabezado
GET  /api/templates/tipologias           ?todas=true para incluir inactivas
GET  /api/templates/tipologias/:id
GET  /api/templates/tipologias/por-nombre/:nombre
POST /api/templates/tipologias           (solo admin/supervisor)
PUT  /api/templates/tipologias/:id       (solo admin/supervisor)
DELETE /api/templates/tipologias/:id     (desactiva)
POST /api/templates/tipologias/:id/secciones
PUT  /api/templates/secciones/:id
DELETE /api/templates/secciones/:id
POST /api/templates/secciones/:id/campos
PUT  /api/templates/campos/:id
DELETE /api/templates/campos/:id
GET  /api/templates/actas/:actaId/respuestas
POST /api/templates/actas/:actaId/respuestas
```

### Informes de arquitecto
```
GET    /api/informes
GET    /api/informes/:id
POST   /api/informes
PUT    /api/informes/:id
```

### Templates de informes de arquitecto
```
GET  /api/informes-templates/tipologias              ?todas=true
GET  /api/informes-templates/tipologias/:id/items
GET  /api/informes-templates/tipologias/por-nombre/:nombre
POST /api/informes-templates/tipologias              (solo admin/supervisor)
PUT  /api/informes-templates/tipologias/:id          (solo admin/supervisor)
POST /api/informes-templates/tipologias/:id/items    (solo admin/supervisor)
PUT  /api/informes-templates/items/:id               (solo admin/supervisor)
DELETE /api/informes-templates/items/:id             (solo admin/supervisor)
```

### Fotos
```
POST /api/fotos/subir                    → multipart/form-data, retorna URLs
```

---

## 10. API CLIENT (frontend/src/utils/api.js)

```js
export const authAPI        // login, logout, me, getUsuariosLogin
export const actasAPI       // getAll, getById, create, update, firmar, toggleCidi, delete
export const pdfAPI         // generarActa, generarInforme, generarNotificacion, generarActaBase64
export const fotosAPI       // subir
export const informesAPI    // getAll, getById, create, update
export const templatesAPI   // encabezado, tipologías, secciones, campos, respuestas
export const informesTemplatesAPI  // getTipologias, getTipologiaPorNombre, getItems,
                                   // crearTipologia, actualizarTipologia,
                                   // crearItem, actualizarItem, eliminarItem
export default api          // instancia axios base
```

---

## 11. GENERACIÓN DE PDF — LÓGICA ACTUAL

### Actas de inspector (`generarActaPDF`)
1. Carga respuestas del acta desde `actas_respuestas` con dos queries separadas:
   - Query 1: respuestas + campos (con `seccion_id`)
   - Query 2: secciones por sus IDs
2. Agrupa campos por sección y construye `secciones_render`
3. Renderiza `base_inspector.html` con Handlebars
4. Genera PDF con Puppeteer (header con logos, footer con numeración)

### Informes de arquitecto (`POST /api/pdf/geriatrico`)
```
tipologia_nombre === 'Geriátricos'
  → generarInformeGeriatricoPDF → base_geriatrico.html
  
tipologia_nombre !== 'Geriátricos'
  → generarInformeArqPDF → base_informe_arq.html
    - Prepara gruposArticulos: { nombre, articulos[] } por campo 'grupo'
    - tieneRadiofisica / tieneOtros: flags para imprimir esas secciones
```

### Templates HTML
- **`base_inspector.html`**: secciones dinámicas via Handlebars loops
- **`base_geriatrico.html`**: título/subtítulo dinámicos (`{{tituloInforme}}`, `{{subtituloInforme}}`), artículos flat
- **`base_informe_arq.html`**: campos con `{{#if}}` (solo imprime si tiene valor), artículos agrupados via `{{#each gruposArticulos}}`

---

## 12. FLUJO COMPLETO DEL INSPECTOR

1. Abre la app en tablet Android
2. Selecciona su nombre del dropdown → autentica con DNI
3. Ve dashboard con actas anteriores y botón "Nueva Acta"
4. Completa formulario wizard:
   - Paso 1: Datos del establecimiento + tipología
   - Paso 2: Datos del responsable presente
   - Paso 3: Tipo de inspección, fecha y hora
   - Paso 4: Selección de secciones a completar
   - Paso 5: Secciones dinámicas con acordeón — cada sección colapsable, primera abierta
   - Paso 6: Observaciones y emplazamiento
5. Sube fotos (galería/cámara, múltiples a la vez, previews)
6. Firma inspector + firma responsable en canvas (signature_pad)
7. Genera PDF → backend renderiza con Puppeteer → sube a Drive

---

## 13. FLUJO COMPLETO DEL ARQUITECTO

1. Login en /login con usuario y contraseña (rol: arquitecto)
2. Ve listado de sus informes
3. "Nuevo Informe" → modal para seleccionar tipología
4. Formulario de 3 tabs:
   - Datos Generales (campos fijos + radiofísica/otros universales)
   - Artículos (cargados desde DB según tipología, con acordeón si tienen grupos)
   - Vista Previa
5. Guardar → crea/actualiza registro en `informes`
6. Descargar PDF → `POST /api/pdf/geriatrico` con tipologia_nombre → PDF descargado

---

## 14. UI/UX

### Inspectores (tablet Android)
- Fuente mínima 16px, botones mínimo 48px de alto
- Sin hover states — todo pensado para touch
- Secciones colapsables con headers de 56px (touch-friendly)
- Los ítems SI/NO se responden con botones toggle grandes
- Los valores NO se muestran en ROJO (coherencia con el PDF)
- Sin scroll horizontal

### Arquitectos (PC)
- No hay consideraciones mobile/responsive para sus componentes
- Interfaz con inline styles (objeto `S = {...}`) en lugar de Tailwind
- Formulario en tabs horizontales, grids de 2 columnas

---

## 15. VARIABLES DE ENTORNO

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
```

---

## 16. PENDIENTES / NOTAS IMPORTANTES

- **Supabase SQL pendiente**: `ALTER TABLE informe_items ADD COLUMN IF NOT EXISTS grupo TEXT;`
  (necesario para grupos de artículos en informes de arquitecto)
- Los inspectores reales con sus DNIs deben cargarse en la tabla `usuarios`
- Las tipologías de inspector deben configurarse desde `/admin/templates`
- Las tipologías de arquitecto (con sus artículos y grupos) se configuran desde el mismo panel, tab "Informes de Arquitecto"
- `base_arquitecto.html` existe pero es legacy — no se usa en el flujo actual

---

*Fin del documento — versión abril 2026*
