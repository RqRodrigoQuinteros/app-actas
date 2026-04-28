# Tarea: Implementar tipologías de Unidades Móviles
## App de Inspecciones Sanitarias — Dirección General de Regulación Sanitaria, Córdoba

---

## Contexto del proyecto

Aplicación web (React + Node.js + Supabase) para inspectores sanitarios. Los inspectores
completan formularios en tablets Android, firman digitalmente y generan PDFs oficiales.

El formulario de cada tipología de establecimiento se configura dinámicamente desde la BD:
`template_tipologia` → `template_secciones` → `template_campos` → `actas_respuestas`.

El CLAUDE.md en la raíz del proyecto tiene la especificación completa del sistema.
**Leelo antes de empezar.**

---

## Estado actual — qué YA está implementado

### Frontend
- `SeccionDinamica.jsx` — renderiza secciones colapsables con campos dinámicos.
  Tipos soportados actualmente: `si_no`, `texto`, `textarea`, `numero`, `fecha`, `select`, `check`.
  Recibe prop `flotaInstancias[]` pero **no la usa todavía** (no hay lógica para `tabla_unidades`).

- `NuevaActa.jsx` y `EditarActa.jsx` — ya derivan `flotaInstancias` desde la sección
  repetible cuyo título contiene "flota" y la pasan a `SeccionDinamica` via prop.

- `AdminTemplates.jsx` — panel admin de templates. `TIPOS_CAMPO` tiene solo los 7 tipos
  actuales. **No incluye** `tabla_unidades` todavía.

- `actaHelpers.js` — helpers para cálculo automático de camas y "poner todo SI".

### Backend
- `templates.js` — `tiposValidos` tiene solo los 7 tipos actuales.
  **No incluye** `tabla_unidades`.

- `pdfService.js` — `generarActaPDF` genera `seccionesHTML` como string HTML puro
  (no usa Handlebars loops para campos, lo hace en JS). Para cada campo renderiza una fila
  `<tr><td>etiqueta</td><td class="valor-si|valor-no">valor</td></tr>`.
  Usa `acta.secciones_render[]` (array de secciones con campos y tokens).
  **No tiene lógica para `tabla_unidades`.**

- `base_inspector.html` — el `{{{seccionesHTML}}}` se inyecta como HTML raw.
  El CSS existente tiene `.tabla-campos`, `.valor-si` (verde), `.valor-no` (rojo).

---

## Qué hay que implementar

### 1. Nuevo tipo de campo: `tabla_unidades`

**Concepto:** Un campo `tabla_unidades` representa una fila en una tabla donde las
columnas son las unidades móviles declaradas en la Flota Vehicular. El inspector
marca con checkbox (✓) cuáles unidades cumplen ese ítem.

**Cómo se vincula con la flota:**
- La Flota Vehicular es una **sección repetible** (ya existe este concepto) cuyo
  título contiene la palabra "flota".
- Cada instancia de la sección repetible = 1 unidad móvil (con Marca, Modelo, Dominio).
- Si el inspector carga 4 unidades en flota → todas las tablas de `tabla_unidades`
  deben mostrar 4 columnas (U1, U2, U3, U4).

**Cómo se guarda el valor:**
- Como JSON string en `actas_respuestas.valor`, ej: `"[true,false,true,true]"`
- Un booleano por unidad, en el mismo orden que la flota.
- No requiere cambios en el schema de BD.

---

### 2. Archivos a modificar y qué hacer en cada uno

#### `backend/routes/templates.js`
Agregar `'tabla_unidades'` al array `tiposValidos`.

#### `frontend/src/components/AdminTemplates.jsx`
En `TIPOS_CAMPO`, agregar:
```js
{ value: 'tabla_unidades', label: 'Tabla por Unidad (checkbox ✓)' }
```
Cuando se selecciona este tipo en el formulario de campo, mostrar una nota informativa:
> "Cada campo genera una fila con checkboxes, una columna por unidad declarada en Flota Vehicular."

#### `frontend/src/components/SeccionDinamica.jsx`

En `RenderCampo`, agregar el caso `tabla_unidades`:

```jsx
if (campo.tipo === 'tabla_unidades') {
  const nUnidades = flotaInstancias?.length || 0;

  // Si no hay flota cargada todavía → aviso amarillo
  if (nUnidades === 0) {
    return (
      <div style={{ padding: '10px', background: '#fefce8', border: '1px solid #fde68a',
        borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
        ⚠️ <strong>{campo.etiqueta}</strong> — Completá primero la Flota Vehicular.
      </div>
    );
  }

  // Parsear valor actual: "[true,false,true]"
  let checks = [];
  try { checks = JSON.parse(valor); } catch { checks = []; }
  if (!Array.isArray(checks)) checks = [];
  while (checks.length < nUnidades) checks.push(false);
  checks = checks.slice(0, nUnidades);

  const toggle = (idx) => {
    const nueva = [...checks];
    nueva[idx] = !nueva[idx];
    onChange(campo.id, JSON.stringify(nueva));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center',
      borderBottom: '1px solid #e5e7eb', padding: '4px 0' }}>
      <span style={{ flex: 1, fontSize: '13px', color: '#374151', paddingRight: '8px' }}>
        {campo.etiqueta}
      </span>
      <div style={{ display: 'flex', gap: '4px' }}>
        {checks.map((checked, idx) => (
          <button key={idx} type="button" onClick={() => toggle(idx)}
            title={`Unidad ${idx + 1}`}
            style={{
              width: '36px', height: '36px', borderRadius: '6px',
              border: checked ? '2px solid #16a34a' : '2px solid #d1d5db',
              background: checked ? '#dcfce7' : '#f9fafb',
              color: checked ? '#16a34a' : '#9ca3af',
              fontWeight: 700, fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            {checked ? '✓' : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
```

Para las secciones que contienen campos `tabla_unidades`, renderizar un header de columnas
antes del primer campo, mostrando "U1", "U2", ... "Un":

```jsx
// Antes del bloque de campos, si hay tabla_unidades y hay flota:
{campos.some(c => c.tipo === 'tabla_unidades') && flotaInstancias.length > 0 && (
  <div style={{ display: 'flex', alignItems: 'center',
    borderBottom: '2px solid #e5e7eb', paddingBottom: '4px', marginBottom: '4px' }}>
    <span style={{ flex: 1, fontSize: '11px', fontWeight: 700,
      color: '#6b7280', textTransform: 'uppercase' }}>Ítem</span>
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: flotaInstancias.length }, (_, i) => (
        <div key={i} style={{ width: '36px', textAlign: 'center',
          fontSize: '11px', fontWeight: 700, color: '#6b7280' }}>
          U{i + 1}
        </div>
      ))}
    </div>
  </div>
)}
```

Lo mismo aplica dentro de `Subseccion` — pasarle `flotaInstancias` y renderizar
el header + campos `tabla_unidades` igual.

#### `backend/services/pdfService.js`

En la función `generarActaPDF`, dentro del loop que genera `seccionesHTML`, agregar
manejo del tipo `tabla_unidades`.

Actualmente cada campo genera una fila simple `<tr><td>etiqueta</td><td>valor</td></tr>`.
Para `tabla_unidades` hay que generar una fila con N celdas de checkbox.

La información de flota vehicular viene en `acta.datos_formulario` como
`secciones_extra[seccion_id]` (array de instancias, cada una con `marca`, `modelo`, `dominio`).

Lógica sugerida:

```js
// Al inicio de generarActaPDF, detectar flota:
const seccionesExtra = df.secciones_extra || {};
// Buscar la sección de flota en secciones_render:
const seccionFlota = (acta.secciones_render || []).find(s => /flota/i.test(s.titulo));
const flotaInstancias = seccionFlota
  ? (seccionesExtra[seccionFlota.id] || [])
  : [];
const nUnidades = flotaInstancias.length;

// En el map de campos, agregar antes del filtro existente:
// Para tabla_unidades, no filtrar por valor vacío — siempre renderizar si hay flota
if (c.tipo === 'tabla_unidades' && nUnidades > 0) {
  let checks = [];
  try { checks = JSON.parse(df[c.token] || '[]'); } catch { checks = []; }
  while (checks.length < nUnidades) checks.push(false);

  const celdas = checks.map((checked, i) =>
    `<td style="text-align:center;width:${Math.floor(200/nUnidades)}px">
      ${checked ? '<span style="color:#16a34a;font-weight:bold;font-size:14pt">✓</span>'
                : '<span style="color:#ccc">–</span>'}
    </td>`
  ).join('');

  return `<tr>
    <td style="width:60%">${c.etiqueta}</td>
    ${celdas}
  </tr>`;
}
```

Para secciones que tienen campos `tabla_unidades`, agregar una fila de encabezado
con los números de unidad al inicio de la tabla:

```js
const tieneTablasUnidades = (sec.campos || []).some(c => c.tipo === 'tabla_unidades');

const headerTabla = tieneTablasUnidades && nUnidades > 0
  ? `<tr style="background:#f3f4f6">
      <th style="text-align:left;padding:4px 6px;width:60%">Ítem</th>
      ${Array.from({ length: nUnidades }, (_, i) =>
        `<th style="text-align:center;font-size:9pt">U${i+1}</th>`
      ).join('')}
    </tr>`
  : '';
```

**Importante:** La sección de Flota Vehicular en el PDF debe renderizarse diferente —
como tabla con columnas Unidad / Marca / Modelo / Dominio (texto libre, no checkboxes).
Los datos vienen de `df.secciones_extra[seccionFlota.id]`.

Renderizar la flota así:
```js
if (/flota/i.test(sec.titulo) && nUnidades > 0) {
  const filas = flotaInstancias.map((inst, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${inst.marca || inst[Object.keys(inst).find(k => /marca/i.test(k))] || ''}</td>
      <td>${inst.modelo || inst[Object.keys(inst).find(k => /modelo/i.test(k))] || ''}</td>
      <td>${inst.dominio || inst[Object.keys(inst).find(k => /dominio/i.test(k))] || ''}</td>
    </tr>
  `).join('');
  return `
    <div class="seccion">
      <h3>${sec.titulo}</h3>
      <table class="tabla-campos">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="text-align:center;width:10%">N°</th>
            <th>Marca</th><th>Modelo</th><th>Dominio</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>`;
}
```

---

### 3. Cómo se guardan los datos de flota y tabla_unidades

**Flota vehicular** — ya existente como sección repetible:
```json
// acta.datos_formulario.secciones_extra[seccion_id]
[
  { "campo_id_marca": "Ford", "campo_id_modelo": "Transit", "campo_id_dominio": "AB123CD" },
  { "campo_id_marca": "Renault", "campo_id_modelo": "Master", "campo_id_dominio": "EF456GH" }
]
```

**Campos tabla_unidades** — guardados en `actas_respuestas`:
```
campo_id: 42   valor: "[true,false,true,true]"
campo_id: 43   valor: "[true,true,false,true]"
```

**El token del campo** se usa en el PDF para mapear la respuesta.
En `pdfService.js` las respuestas ya se mapean como `df[c.token] = valor` antes
de llamar al generador de HTML.

---

### 4. Flujo completo para una tipología de móviles

1. Admin crea tipología "Unidades Móviles de Emergencia" en `/admin/templates`
2. Crea sección **"Flota Vehicular"** → marca como **repetible** → agrega campos
   tipo `texto`: "Marca", "Modelo", "Dominio"
3. Crea secciones con campos tipo `tabla_unidades`:
   - "De las Medidas" → campos: "Largo 2.30 m.", "Alto 1.70 m.", "Ancho 1.70 m.", etc.
   - "Del Estado de la Unidad" → campos: "Número de Interno", "Iluminación interna", etc.
   - "Del Habitáculo del Paciente" → campos: "Acceso trasero y lateral", etc.
   - "Equipamiento" → campos: "Tubo de oxígeno", "Camilla", etc.
4. Inspector en tablet:
   - Completa la sección Flota Vehicular agregando instancias (ej: 4 unidades)
   - Las secciones con `tabla_unidades` muestran 4 columnas U1-U4 automáticamente
   - Marca checkboxes por unidad para cada ítem
5. PDF generado muestra la flota como tabla texto + las tablas de ítems con ✓/–

---

### 5. Notas importantes

- El sistema de secciones repetibles (incluida Flota Vehicular) **ya funciona** —
  no tocar esa lógica.
- Los campos `tabla_unidades` solo aparecen en `SeccionDinamica` (secciones normales),
  no dentro de secciones repetibles — la flota es la repetible, las tablas de ítems son normales.
- `flotaInstancias` ya llega como prop a `SeccionDinamica` en `NuevaActa` y `EditarActa`.
  Solo falta que `SeccionDinamica` lo use para renderizar `tabla_unidades`.
- Mantener toda la UI existente touch-friendly (botones mínimo 36px, sin hover states).
- No modificar la lógica de guardado de `actas_respuestas` — los valores de
  `tabla_unidades` se guardan exactamente igual que cualquier otro campo.
- Las tipologías de Traslado Baja Complejidad y Traslado Social tienen la misma
  estructura que Emergencia pero con menos equipamiento y medidas distintas —
  se configuran como tipologías separadas en el admin, no requieren cambios de código.

---

### 6. Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| `backend/routes/templates.js` | Agregar `'tabla_unidades'` a `tiposValidos` |
| `frontend/src/components/AdminTemplates.jsx` | Agregar tipo a `TIPOS_CAMPO` + nota informativa |
| `frontend/src/components/SeccionDinamica.jsx` | Renderizar `tabla_unidades` con checkboxes + header de columnas |
| `backend/services/pdfService.js` | Renderizar flota como tabla texto + tabla_unidades con ✓/– por columna |

**No requiere cambios en:**
- Schema de BD (Supabase)
- `NuevaActa.jsx` — ya pasa `flotaInstancias`
- `EditarActa.jsx` — ya pasa `flotaInstancias`
- `api.js` — sin endpoints nuevos
- Templates HTML (`base_inspector.html`) — el HTML se genera en JS, no en Handlebars

