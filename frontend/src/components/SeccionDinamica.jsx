// SeccionDinamica — renderiza campos dinámicos desde la BD
// Recibe: secciones[] con campos[] adentro, respuestas {campo_id: valor}, onChange(campo_id, valor)

import { useState } from 'react';

export default function SeccionDinamica({ secciones = [], respuestas = {}, onChange }) {
  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(secciones.map((s, i) => [s.id, i === 0]))
  );
  const toggle = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const renderCampo = (campo) => {
    const valor = respuestas[campo.id] ?? '';

    if (campo.tipo === 'si_no') {
      const esSi  = valor === 'SI';
      const esNo  = valor === 'NO';
      return (
        <div key={campo.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="text-base">{campo.etiqueta}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onChange(campo.id, esSi ? '' : 'SI')}
              className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                esSi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >SI</button>
            <button
              type="button"
              onClick={() => onChange(campo.id, esNo ? '' : 'NO')}
              className={`px-6 py-2 rounded-lg font-semibold text-lg transition-colors ${
                esNo ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >NO</button>
          </div>
        </div>
      );
    }

    if (campo.tipo === 'check') {
      return (
        <div key={campo.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <input
            type="checkbox"
            checked={valor === 'true'}
            onChange={e => onChange(campo.id, e.target.checked ? 'true' : 'false')}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-base">{campo.etiqueta}</span>
        </div>
      );
    }

    if (campo.tipo === 'textarea') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <textarea
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder || ''}
            className="p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
        </div>
      );
    }

    if (campo.tipo === 'numero') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <input
            type="number"
            inputMode="numeric"
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder || ''}
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>
      );
    }

    if (campo.tipo === 'fecha') {
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <input
            type="date"
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
        </div>
      );
    }

    if (campo.tipo === 'select') {
      const opciones = Array.isArray(campo.opciones) ? campo.opciones : [];
      return (
        <div key={campo.id} className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
          <select
            value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            className="p-3 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Seleccionar...</option>
            {opciones.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
      );
    }

    // texto (default)
    return (
      <div key={campo.id} className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <input
          type="text"
          value={valor}
          onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''}
          className="p-3 border border-gray-300 rounded-lg"
        />
      </div>
    );
  };

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
        return (
          <div key={seccion.id} className="mb-4 rounded-lg border border-gray-200 overflow-hidden">
            {/* Header colapsable */}
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
              </div>
              <span style={{ fontSize: '18px', color: '#6b7280', lineHeight: 1 }}>
                {isOpen ? '▲' : '▼'}
              </span>
            </div>

            {/* Body condicional */}
            {isOpen && (
              <div className="p-4 bg-gray-50 space-y-3">
                {seccion.texto_previo && (
                  <p className="text-sm text-gray-500 italic">{seccion.texto_previo}</p>
                )}
                {(seccion.campos || []).map(campo => renderCampo(campo))}
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