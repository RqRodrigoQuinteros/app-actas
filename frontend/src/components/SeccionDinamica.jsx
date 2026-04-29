// SeccionDinamica — renderiza campos dinámicos desde la BD
// Recibe: secciones[] con campos[] y subsecciones[] adentro, respuestas {campo_id: valor}, onChange(campo_id, valor)

import { useState } from 'react';
import { esCampoTotalCamas } from '../utils/actaHelpers';

// ── Renderizador de un campo individual ────────────────────────────────────────
function RenderCampo({ campo, respuestas, onChange, flotaInstancias = [] }) {
  const valor = respuestas[campo.id] ?? '';

  if (campo.tipo === 'tabla_unidades') {
    const nUnidades = flotaInstancias.length;

    if (nUnidades === 0) {
      return (
        <div style={{ padding: '10px', background: '#fefce8', border: '1px solid #fde68a',
          borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
          ⚠️ <strong>{campo.etiqueta}</strong> — Completá primero la Flota Vehicular.
        </div>
      );
    }

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
    const esTotal = esCampoTotalCamas(campo);
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">
          {campo.etiqueta}
          {esTotal && (
            <span className="ml-2 text-xs text-gray-500">(calculado automáticamente)</span>
          )}
        </label>
        <input type="number" inputMode="numeric" value={valor}
          onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''}
          readOnly={esTotal}
          className={`p-3 border rounded-lg ${esTotal ? 'border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed' : 'border-gray-300 bg-white'}`} />
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
function Subseccion({ subseccion, respuestas, onChange, flotaInstancias = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const campos = subseccion.campos || [];
  const tieneTablasUnidades = campos.some(c => c.tipo === 'tabla_unidades');
  const tieneSiNo = campos.some(c => c.tipo === 'si_no');

  const todoSiSubseccion = (e) => {
    e.stopPropagation();
    campos.forEach(c => { if (c.tipo === 'si_no') onChange(c.id, 'SI'); });
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tieneSiNo && (
            <button type="button" onClick={todoSiSubseccion}
              style={{
                fontSize: '11px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '5px', border: '1.5px solid #16a34a',
                background: '#f0fdf4', color: '#16a34a', cursor: 'pointer',
              }}>
              Todo SI
            </button>
          )}
          <span style={{ fontSize: '14px', color: '#3b82f6' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="p-3 bg-blue-50 space-y-3">
          {subseccion.texto_previo && (
            <p className="text-sm text-gray-500 italic">{subseccion.texto_previo}</p>
          )}
          {tieneTablasUnidades && flotaInstancias.length > 0 && (
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
          {campos.map(campo => (
            <RenderCampo key={campo.id} campo={campo} respuestas={respuestas} onChange={onChange} flotaInstancias={flotaInstancias} />
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
export default function SeccionDinamica({ secciones = [], respuestas = {}, onChange, flotaInstancias = [] }) {
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

        const tieneTablasUnidades = campos.some(c => c.tipo === 'tabla_unidades');

        // Todos los campos si_no de la sección (directos + subsecciones)
        const todosCamposSiNo = [
          ...campos.filter(c => c.tipo === 'si_no'),
          ...subsecciones.flatMap(sub => (sub.campos || []).filter(c => c.tipo === 'si_no')),
        ];
        const todoSiSeccion = (e) => {
          e.stopPropagation();
          todosCamposSiNo.forEach(c => onChange(c.id, 'SI'));
        };

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {todosCamposSiNo.length > 0 && (
                  <button type="button" onClick={todoSiSeccion}
                    style={{
                      fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                      borderRadius: '6px', border: '1.5px solid #16a34a',
                      background: '#f0fdf4', color: '#16a34a', cursor: 'pointer',
                      minHeight: '32px',
                    }}>
                    Todo SI
                  </button>
                )}
                <span style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Body */}
            {isOpen && (
              <div className="p-4 bg-gray-50 space-y-3">
                {seccion.texto_previo && (
                  <p className="text-sm text-gray-500 italic">{seccion.texto_previo}</p>
                )}

                {/* Header de columnas para tabla_unidades */}
                {tieneTablasUnidades && flotaInstancias.length > 0 && (
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

                {/* Campos directos de la sección padre */}
                {campos.map(campo => (
                  <RenderCampo key={campo.id} campo={campo} respuestas={respuestas} onChange={onChange} flotaInstancias={flotaInstancias} />
                ))}

                {/* Subsecciones anidadas */}
                {subsecciones.map(sub => (
                  <Subseccion key={sub.id} subseccion={sub} respuestas={respuestas} onChange={onChange} flotaInstancias={flotaInstancias} />
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
