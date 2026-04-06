# App de Inspecciones Sanitarias

Aplicación web para gestión de inspecciones sanitarias del Ministerio de Salud de Córdoba, Argentina.

## Estructura del Proyecto

```
/
├── backend/                  # Servidor Node.js + Express
│   ├── routes/              # Rutas API
│   ├── services/            # Servicios (Supabase, PDF, Drive)
│   ├── templates/           # Plantillas HTML para PDF
│   ├── middleware/           # Middleware de autenticación
│   └── index.js             # Punto de entrada
│
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/         # Contextos (Auth)
│   │   ├── utils/           # Utilidades y constantes
│   │   └── App.jsx          # Componente principal
│   └── ...
│
└── supabase/
    └── schema.sql           # Script SQL para base de datos
```

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Google Cloud con Drive API habilitada

## Instalación

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Base de Datos

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script `supabase/schema.sql` en el SQL Editor
3. Configurar autenticación en Supabase Dashboard

## Variables de Entorno

### Backend (.env)

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=tu-service-key
JWT_SECRET=tu-secreto-largo

GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
DRIVE_ROOT_FOLDER_ID=id-de-carpeta-raiz-en-drive
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

## Funcionalidades

- [x] Login de inspectores con dropdown
- [x] Login de supervisor con contraseña
- [x] Dashboard de actas por inspector
- [x] Creación de actas con wizard de 6 pasos
- [x] Formularios dinámicos según tipología
- [x] Subida de fotos
- [x] Firma digital (inspector y responsable)
- [x] Generación de PDF con Puppeteer
- [x] Subida automática a Google Drive
- [x] Panel de supervisor con filtros
- [x] Toggle "Subido a CIDI"

## Tipos de Usuario

| Rol | Permisos |
|-----|----------|
| Inspector | Crear/editar actas propias, firmar, generar PDF |
| Arquitecto | Crear/editar informes, generar PDF |
| Supervisor | Ver todas las actas, marcar CIDI, eliminar |

## Licencia

Propiedad del Ministerio de Salud - Provincia de Córdoba
