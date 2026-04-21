// SeccionDinamica — renderiza campos dinámicos desde la BD
// Recibe: secciones[] con campos[] y subsecciones[] adentro, respuestas {campo_id: valor}, onChange(campo_id, valor)

import { useState } from 'react';

// ── Renderizador de un campo individual ────────────────────────────────────────
function RenderCampo({ campo, respuestas, onChange }) {
  const valor = respuestas[campo.id] ?? '';

  if (campo.tipo === 'si_no') {
    const esSi = valor === 'SI';
    const esNo = valor === 'NO';
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
        <span className="text-base">{campo.etiqueta}</span>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => onChange(campo.id, esSi ? '' : 'SI')}
            className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${esSi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            SI
          </button>
          <button type="button"
            onClick={() => onChange(campo.id, esNo ? '' : 'NO')}
            className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${esNo ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            NO
          </button>
        </div>
      </div>
    );
  }

  if (campo.tipo === 'check') {
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
        <input type="checkbox" checked={valor === 'true'}
          onChange={e => onChange(campo.id, e.target.checked ? 'true' : 'false')}
          className="w-5 h-5 cursor-pointer" />
        <span className="text-base">{campo.etiqueta}</span>
      </div>
    );
  }

  if (campo.tipo === 'textarea') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <textarea value={valor} onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''} className="p-3 border border-gray-300 rounded-lg" rows={3} />
      </div>
    );
  }

  if (campo.tipo === 'numero') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <input type="number" inputMode="numeric" value={valor}
          onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''} className="p-3 border border-gray-300 rounded-lg" />
      </div>
    );
  }

  if (campo.tipo === 'fecha') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <input type="date" value={valor} onChange={e => onChange(campo.id, e.target.value)}
          className="p-3 border border-gray-300 rounded-lg" />
      </div>
    );
  }

  if (campo.tipo === 'select') {
    const opciones = Array.isArray(campo.opciones) ? campo.opciones : [];
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <select value={valor} onChange={e => onChange(campo.id, e.target.value)}
          className="p-3 border border-gray-300 rounded-lg bg-white">
          <option value="">Seleccionar...</option>
          {opciones.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
      </div>
    );
  }

  // texto (default)
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
      <input type="text" value={valor} onChange={e => onChange(campo.id, e.target.value)}
        placeholder={campo.placeholder || ''} className="p-3 border border-gray-300 rounded-lg" />
    </div>
  );
}

// ── Subsección colapsable anidada ───────────────────────────────────────────────
function Subseccion({ subseccion, respuestas, onChange }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-3 rounded-lg border border-blue-200 overflow-hidden">
      <div
        onClick={() => setIsOpen(p => !p)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          minHeight: '44px', cursor: 'pointer', padding: '0 14px',
          background: isOpen ? '#eff6ff' : '#dbeafe',
          userSelect: 'none',
          borderLeft: '4px solid #3b82f6',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '13px', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          ↳ {subseccion.titulo}
        </span>
        <span style={{ fontSize: '14px', color: '#3b82f6' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="p-3 bg-blue-50 space-y-3">
          {subseccion.texto_previo && (
            <p className="text-sm text-gray-500 italic">{subseccion.texto_previo}</p>
          )}
          {(subseccion.campos || []).map(campo => (
            <RenderCampo key={campo.id} campo={campo} respuestas={respuestas} onChange={onChange} />
          ))}
          {subseccion.texto_posterior && (
            <p className="text-sm text-gray-500 italic mt-2">{subseccion.texto_posterior}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ────────────────────────────────────────────────────────
export default function SeccionDinamica({ secciones = [], respuestas = {}, onChange }) {
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(secciones.map((s, i) => [s.id, i === 0]))
  );
  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  if (!secciones.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm mb-4">
        Esta tipología no tiene secciones configuradas. Configuralas desde el panel de administración.
      </div>
    );
  }

  return (
    <>
      {secciones.map((seccion, idx) => {
        const isOpen = !!openSections[seccion.id];
        const subsecciones = seccion.subsecciones || [];
        const campos = seccion.campos || [];
        const tieneSubsecciones = subsecciones.length > 0;

        return (
          <div key={seccion.id} className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
            {/* Header sección principal */}
            <div
              onClick={() => toggle(seccion.id)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                minHeight: '56px', cursor: 'pointer', padding: '0 16px',
                background: isOpen ? '#f9fafb' : '#e5e7eb',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, color: '#fff',
                  background: '#6b7280', padding: '2px 7px', borderRadius: '4px',
                }}>
                  {idx + 1}
                </span>
                <span className="font-bold text-base text-gray-800 uppercase">{seccion.titulo}</span>
                {tieneSubsecciones && (
                  <span style={{
                    fontSize: '10px', fontWeight: 600, color: '#1d4ed8',
                    background: '#dbeafe', padding: '1px 6px', borderRadius: '4px',
                  }}>
                    {subsecciones.length} subsección{subsecciones.length !== 1 ? 'es' : ''}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1 }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </div>

            {/* Body */}
            {isOpen && (
              <div className="p-4 bg-gray-50 space-y-3">
                {seccion.texto_previo && (
                  <p className="text-sm text-gray-500 italic">{seccion.texto_previo}</p>
                )}

                {/* Campos directos de la sección padre */}
                {campos.map(campo => (
                  <RenderCampo key={campo.id} campo={campo} respuestas={respuestas} onChange={onChange} />
                ))}

                {/* Subsecciones anidadas */}
                {subsecciones.map(sub => (
                  <Subseccion key={sub.id} subseccion={sub} respuestas={respuestas} onChange={onChange} />
                ))}

                {campos.length === 0 && !tieneSubsecciones && (
                  <p className="text-sm text-gray-400 italic">Esta sección no tiene campos configurados.</p>
                )}

                {seccion.texto_posterior && (
                  <p className="text-sm text-gray-500 italic mt-2">{seccion.texto_posterior}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
