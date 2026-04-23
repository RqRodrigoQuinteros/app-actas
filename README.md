# App de Inspecciones Sanitarias
### Dirección General de Regulación Sanitaria — Ministerio de Salud, Córdoba, Argentina

Aplicación web para la gestión integral de inspecciones sanitarias. Permite a los inspectores completar formularios dinámicos desde tablets y celulares, agregar fotos, firmar digitalmente y generar un PDF oficial del acta — sin pasar por herramientas externas.

---

## ¿Qué hace la aplicación?

1. El inspector inicia sesión seleccionando su nombre de un listado
2. Crea un acta nueva completando un formulario paso a paso (wizard)
3. El formulario muestra secciones dinámicas según la **tipología del establecimiento**
4. Sube fotos desde la cámara o galería del dispositivo (con compresión automática)
5. Firma digitalmente con el dedo en pantalla (inspector y responsable del establecimiento)
6. Genera un **PDF oficial** con el formato del Ministerio de Salud de Córdoba
7. El PDF se guarda automáticamente en **Google Drive**

---

## Tipologías soportadas

| Tipología | Secciones incluidas |
|-----------|-------------------|
| Clínica / Internación | Registros, Datos Generales, Consultorios, Radiofísica, Internación, Enfermería, Quirófano, Obstetricia, Laboratorio, Guardia, UCO, UTI, UTIN, Hemodinamia, Hospital de Día |
| Quirúrgicos | Inscripción, Dirección y Funcionamiento, Enfermería, Área Internación, Equipamiento, Esterilización |
| Hemodiálisis | Dirección y Funcionamiento, Análisis de Agua, Serología |
| Centros Ambulatorios | Inscripción, Dirección y Funcionamiento, Esterilización |
| Estética / Oncológico | Inscripción, Dirección y Funcionamiento, Consultorios |
| Ópticas | Local, Taller, Gabinete de Contactología |
| Unidades Móviles de Emergencia | Inscripción y Habilitación, Flota Vehicular, Medidas por Unidad, Estado, Habitáculo, Equipamiento, Recursos Humanos |
| Unidades de Traslado (Baja Complejidad) | Inscripción y Habilitación, Flota Vehicular, Medidas por Unidad, Estado, Habitáculo, Equipamiento |
| Unidades de Traslado Social | Inscripción y Habilitación, Flota Vehicular, Medidas por Unidad, Estado, Habitáculo, Equipamiento |

---

## Roles y permisos

| Rol | Acceso | Permisos |
|-----|--------|----------|
| **Inspector** | Login público con dropdown | Crear/editar actas propias, firmar, generar PDF |
| **Arquitecto** | Login con usuario y contraseña | Crear/editar informes de arquitectura, generar PDF |
| **Supervisor** | URL especial `/supervisor-login` | Ver todas las actas, filtrar, eliminar, marcar "Subido a CIDI" |
| **Admin** | URL especial `/admin` | Gestionar tipologías, secciones y campos del formulario dinámico |

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| Generación de PDF | Puppeteer + Handlebars |
| Firma digital | signature_pad |
| Almacenamiento | Google Drive API v3 |
| Autenticación | JWT |
| Hosting | Railway (backend) + Vercel (frontend) |

---

## Estructura del proyecto

```
/
├── backend/
│   ├── routes/          # Auth, actas, informes, PDF, fotos, templates
│   ├── services/        # pdfService, driveService, supabaseClient
│   ├── templates/       # Plantillas HTML base (inspector, arquitecto, geriátrico, notificación)
│   ├── middleware/      # Autenticación JWT
│   └── index.js
│
├── frontend/
│   └── src/
│       ├── components/  # Login, Dashboard, NuevaActa, EditarActa, VerActa,
│       │                # SeccionDinamica, SubidaFotos, FirmaCanvas,
│       │                # SupervisorDash, AdminTemplates, InformeArquitecto, etc.
│       ├── context/     # AuthContext
│       └── utils/       # api.js, constants.js
│
└── supabase/
    └── schema.sql       # Tablas: usuarios, actas, informes, establecimientos,
                         # template_tipologia, template_secciones, template_campos,
                         # actas_respuestas
```

---

## Instalación local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completar con credenciales reales
node index.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Agregar las variables de entorno correspondientes

---

## Variables de entorno

### Backend (`backend/.env`)

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key
JWT_SECRET=tu-secreto-largo

GOOGLE_SERVICE_ACCOUNT_EMAIL=cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
DRIVE_ROOT_FOLDER_ID=id-carpeta-raiz-drive
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## Funcionalidades implementadas

- [x] Login de inspectores con dropdown (sin tipear DNI)
- [x] Login de supervisor por URL especial
- [x] Login de arquitecto con usuario/contraseña
- [x] Dashboard de actas del inspector con estados
- [x] Wizard de creación de actas paso a paso
- [x] Formularios dinámicos por tipología configurables desde el panel admin
- [x] Secciones con subsecciones anidadas (colapsables)
- [x] Secciones repetibles (ej: UTI, UCO, unidades móviles)
- [x] Subsecciones dentro de secciones repetibles
- [x] Ítems SI/NO con botones grandes optimizados para tablet
- [x] Valores NO resaltados en rojo (formulario y PDF)
- [x] Tabla por unidad con checkboxes dinámicos (tipologías de móviles)
- [x] Flota vehicular con texto libre vinculada a tablas de unidades
- [x] Subida de fotos desde galería o cámara directa (con compresión automática)
- [x] Firma digital con el dedo (inspector y responsable)
- [x] Edición de actas existentes (datos, fotos, firmas, formulario dinámico)
- [x] Generación de PDF con formato oficial del Ministerio
- [x] Secciones vacías omitidas automáticamente del PDF
- [x] Fotos incluidas en el PDF
- [x] Subida automática a Google Drive por carpeta de inspector
- [x] Generación de notificación de emplazamiento (PDF separado)
- [x] Panel de supervisor con filtros por inspector, fecha y estado
- [x] Toggle "Subido a CIDI" por acta
- [x] Informes de arquitectura con plantilla propia
- [x] Informes geriátricos
- [x] Panel de administración de templates (tipologías, secciones, campos, subsecciones)
- [x] Clonado de tipologías desde el admin

---

## Licencia

Copyright © 2025 Rodrigo Gabriel Quinteros. Todos los derechos reservados.
