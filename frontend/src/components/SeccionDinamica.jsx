// SeccionDinamica — renderiza campos dinámicos desde la BD
// Recibe: secciones[] con campos[] y subsecciones[] adentro, respuestas {campo_id: valor}, onChange(campo_id, valor)

import { useState } from 'react';
import { esCampoTotalCamas } from '../utils/actaHelpers';
import { evaluarFormula } from '../utils/evaluarFormula';

const renderCampoSubtitulo = (campo) => campo.subtitulo ? (
  <div className="text-xs text-gray-500 mt-1" style={{ lineHeight: 1.4 }}>
    {campo.subtitulo}
  </div>
) : null;

// ── Renderizador de un campo individual ────────────────────────────────────────
function RenderCampo({ campo, respuestas, onChange, flotaInstancias = [], campos = [], index = 0, totalesManuales = new Set(), onManualTotal = () => {} }) {
  const valor = respuestas[campo.id] ?? '';

  const getCantidadDeclaradaAnterior = () => {
    for (let i = index - 1; i >= 0; i -= 1) {
      const anterior = campos[i];
      if (anterior && anterior.tipo === 'numero') {
        const valorAnterior = respuestas[anterior.id];
        if (valorAnterior !== undefined && valorAnterior !== null && String(valorAnterior).trim() !== '') {
          return String(valorAnterior).trim();
        }
      }
    }
    return null;
  };

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
    while (checks.length < nUnidades) checks.push(null);
    checks = checks.slice(0, nUnidades);

    const clickSI = (idx) => {
      const nueva = [...checks];
      nueva[idx] = nueva[idx] === true ? null : true;
      onChange(campo.id, JSON.stringify(nueva));
    };
    const clickNO = (idx) => {
      const nueva = [...checks];
      nueva[idx] = nueva[idx] === false ? null : false;
      onChange(campo.id, JSON.stringify(nueva));
    };

    return (
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
        <span style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px' }}>
          {campo.etiqueta}
        </span>
        {renderCampoSubtitulo(campo)}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {checks.map((val, idx) => {
            const flota = flotaInstancias[idx] || {};
            const subtitulo = [flota.marca, flota.modelo, flota.dominio].filter(Boolean).join(' – ') || `Unidad ${idx + 1}`;
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '80px' }}>{subtitulo}</span>
                <button type="button" onClick={() => clickSI(idx)}
                  style={{
                    padding: '4px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px',
                    border: val === true ? '2px solid #16a34a' : '2px solid #d1d5db',
                    background: val === true ? '#16a34a' : '#f9fafb',
                    color: val === true ? '#fff' : '#9ca3af', cursor: 'pointer',
                  }}>SI</button>
                <button type="button" onClick={() => clickNO(idx)}
                  style={{
                    padding: '4px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '13px',
                    border: val === false ? '2px solid #dc2626' : '2px solid #d1d5db',
                    background: val === false ? '#dc2626' : '#f9fafb',
                    color: val === false ? '#fff' : '#9ca3af', cursor: 'pointer',
                  }}>NO</button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (campo.tipo === 'tabla_equipamiento') {
    let datos = { declarada: '', requerida: '', observaciones: '' };
    if (typeof valor === 'string' && valor.trim()) {
      try {
        const parsed = JSON.parse(valor);
        if (parsed && typeof parsed === 'object') {
          datos = { ...datos, ...parsed };
        }
      } catch {}
    } else if (typeof valor === 'object' && valor !== null) {
      datos = { ...datos, ...valor };
    }

    const actualizar = (campoNombre, nuevoValor) => {
      onChange(campo.id, JSON.stringify({ ...datos, [campoNombre]: nuevoValor }));
    };

    // Calcular cantidad requerida: fórmula > campo numero anterior > manual
    let valorRequerida = datos.requerida ?? '';
    let requeridaAutoLabel = null;

    if (campo.formula) {
      const vars = {};
      for (const c of campos) {
        if (c.token && respuestas[c.id] !== undefined) {
          vars[c.token] = respuestas[c.id];
        }
      }
      const resultado = evaluarFormula(campo.formula, vars);
      if (resultado !== null) {
        valorRequerida = String(resultado);
        requeridaAutoLabel = `Calculado con fórmula: ${campo.formula} = ${resultado}`;
      }
    } else {
      const cantidadDeclaradaAnterior = getCantidadDeclaradaAnterior();
      if (cantidadDeclaradaAnterior !== null) {
        valorRequerida = cantidadDeclaradaAnterior;
        requeridaAutoLabel = `Calculado automáticamente desde el número anterior: ${cantidadDeclaradaAnterior}`;
      }
    }

    const requeridaEsAuto = requeridaAutoLabel !== null;

    return (
      <div className="p-3 border rounded-lg bg-white">
        <div className="font-medium text-sm text-gray-700 mb-2">{campo.etiqueta}</div>
        {renderCampoSubtitulo(campo)}
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label className="flex flex-col text-sm text-gray-600">
              Cant. declarada
              <input
                type="number"
                inputMode="numeric"
                value={datos.declarada ?? ''}
                onChange={e => actualizar('declarada', e.target.value)}
                placeholder="0"
                className="p-3 border border-gray-300 rounded-lg"
              />
            </label>
            <label className="flex flex-col text-sm text-gray-600">
              Cant. requerida
              <input
                type="number"
                inputMode="numeric"
                value={valorRequerida}
                onChange={requeridaEsAuto ? undefined : e => actualizar('requerida', e.target.value)}
                placeholder="0"
                readOnly={requeridaEsAuto}
                className="p-3 border border-gray-300 rounded-lg bg-white"
              />
            </label>
          </div>
          {requeridaAutoLabel && (
            <div style={{ fontSize: '12px', color: '#4b5563' }}>
              {requeridaAutoLabel}
            </div>
          )}
          <label className="flex flex-col text-sm text-gray-600">
            Observaciones
            <input
              type="text"
              value={datos.observaciones ?? ''}
              onChange={e => actualizar('observaciones', e.target.value)}
              placeholder="Observaciones..."
              className="p-3 border border-gray-300 rounded-lg"
            />
          </label>
        </div>
      </div>
    );
  }

  if (campo.tipo === 'si_no') {
    const esSi = valor === 'SI';
    const esNo = valor === 'NO';
    const esNa = valor === 'N/A';
    return (
      <div className="p-3 bg-white rounded-lg border">
        <div className="mb-3">
          <div className="text-base font-medium">{campo.etiqueta}</div>
          {renderCampoSubtitulo(campo)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button"
            onClick={() => onChange(campo.id, esSi ? '' : 'SI')}
            className={`flex-1 min-w-[80px] px-5 py-3 rounded-lg font-semibold text-lg transition-colors ${esSi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            SI
          </button>
          <button type="button"
            onClick={() => onChange(campo.id, esNo ? '' : 'NO')}
            className={`flex-1 min-w-[80px] px-5 py-3 rounded-lg font-semibold text-lg transition-colors ${esNo ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            NO
          </button>
          <button type="button"
            onClick={() => onChange(campo.id, esNa ? '' : 'N/A')}
            className={`flex-1 min-w-[80px] px-5 py-3 rounded-lg font-semibold text-lg transition-colors ${esNa ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            N/A
          </button>
        </div>
      </div>
    );
  }

  if (campo.tipo === 'check') {
    const esSi = valor === 'true';
    const esNo = valor === 'false';
    return (
      <div className="p-3 bg-white rounded-lg border">
        <div className="mb-3">
          <div className="text-base font-medium">{campo.etiqueta}</div>
          {renderCampoSubtitulo(campo)}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button"
            onClick={() => onChange(campo.id, esSi ? '' : 'true')}
            className={`flex-1 min-w-[80px] px-5 py-3 rounded-lg font-semibold text-lg transition-colors ${esSi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            SI
          </button>
          <button type="button"
            onClick={() => onChange(campo.id, esNo ? '' : 'false')}
            className={`flex-1 min-w-[80px] px-5 py-3 rounded-lg font-semibold text-lg transition-colors ${esNo ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            NO
          </button>
        </div>
      </div>
    );
  }

  if (campo.tipo === 'textarea') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        {renderCampoSubtitulo(campo)}
        <textarea value={valor} onChange={e => onChange(campo.id, e.target.value)}
          placeholder={campo.placeholder || ''} className="p-3 border border-gray-300 rounded-lg" rows={3} />
      </div>
    );
  }

  if (campo.tipo === 'numero') {
    const esTotal = esCampoTotalCamas(campo);
    const estaManual = esTotal && totalesManuales.has(campo.id);
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">
          {campo.etiqueta}
          {esTotal && !estaManual && (
            <span className="ml-2 text-xs text-gray-500">(calculado automáticamente)</span>
          )}
          {estaManual && (
            <span className="ml-2 text-xs text-orange-500">(edición manual)</span>
          )}
        </label>
        {renderCampoSubtitulo(campo)}
        <div className={esTotal ? 'flex gap-2' : ''}>
          <input type="number" inputMode="numeric" value={valor}
            onChange={e => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder || ''}
            readOnly={esTotal && !estaManual}
            className={`p-3 border rounded-lg ${esTotal ? 'flex-1' : 'w-full'} ${
              esTotal && !estaManual
                ? 'border-gray-300 bg-gray-100 text-gray-700 cursor-not-allowed'
                : estaManual
                ? 'border-orange-300 bg-white'
                : 'border-gray-300 bg-white'
            }`} />
          {esTotal && (
            <button type="button"
              onClick={() => onManualTotal(campo.id, !estaManual)}
              title={estaManual ? 'Volver a cálculo automático' : 'Editar manualmente'}
              style={{
                padding: '0 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '18px',
                background: estaManual ? '#fed7aa' : '#e5e7eb',
                border: estaManual ? '1px solid #f97316' : '1px solid #d1d5db',
              }}>
              {estaManual ? '🔒' : '✏️'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (campo.tipo === 'fecha') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        {renderCampoSubtitulo(campo)}
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
        {renderCampoSubtitulo(campo)}
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
      {renderCampoSubtitulo(campo)}
      <input type="text" value={valor} onChange={e => onChange(campo.id, e.target.value)}
        placeholder={campo.placeholder || ''} className="p-3 border border-gray-300 rounded-lg" />
    </div>
  );
}

// ── Subsección colapsable anidada ───────────────────────────────────────────────
function Subseccion({ subseccion, respuestas, onChange, flotaInstancias = [], totalesManuales = new Set(), onManualTotal = () => {} }) {
  const [isOpen, setIsOpen] = useState(true);
  const campos = subseccion.campos || [];
  const tieneTablasUnidades = campos.some(c => c.tipo === 'tabla_unidades');

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
          {campos.map((campo, idx) => (
            <RenderCampo
              key={campo.id}
              campo={campo}
              respuestas={respuestas}
              onChange={onChange}
              flotaInstancias={flotaInstancias}
              campos={campos}
              index={idx}
              totalesManuales={totalesManuales}
              onManualTotal={onManualTotal}
            />
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
export default function SeccionDinamica({ secciones = [], respuestas = {}, onChange, flotaInstancias = [], totalesManuales = new Set(), onManualTotal = () => {} }) {
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
                {campos.map((campo, campoIdx) => (
                  <RenderCampo
                    key={campo.id}
                    campo={campo}
                    respuestas={respuestas}
                    onChange={onChange}
                    flotaInstancias={flotaInstancias}
                    campos={campos}
                    index={campoIdx}
                    totalesManuales={totalesManuales}
                    onManualTotal={onManualTotal}
                  />
                ))}

                {/* Subsecciones anidadas */}
                {subsecciones.map(sub => (
                  <Subseccion
                    key={sub.id}
                    subseccion={sub}
                    respuestas={respuestas}
                    onChange={onChange}
                    flotaInstancias={flotaInstancias}
                    totalesManuales={totalesManuales}
                    onManualTotal={onManualTotal}
                  />
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
