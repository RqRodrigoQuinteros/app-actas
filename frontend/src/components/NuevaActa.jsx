import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI, templatesAPI } from '../utils/api';
import { calcularTotalesDeCamas, ponerTodoSi } from '../utils/actaHelpers';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';
import SeccionDinamica from './SeccionDinamica';

// ── Helpers ──────────────────────────────────────────────────────────────────

const RESIDENTE_VACIO = () => ({
  nombre: '', dni: '', domicilio: '',
  familiar_nombre: '', familiar_dni: '', familiar_telefono: '', vinculo: '',
});

const TESTIGO_VACIO = () => ({
  nombre: '', dni: '', domicilio: '', testimonio: '',
});

const esGeriatricoNombre = (nombre) =>
  /geriatric/i.test(nombre) || /geriátric/i.test(nombre);

// ── Componente formulario de residentes ──────────────────────────────────────
function FormResidentes({ residentes, onChange }) {
  const agregar = () => onChange([...residentes, RESIDENTE_VACIO()]);
  const eliminar = (i) => onChange(residentes.filter((_, idx) => idx !== i));
  const actualizar = (i, campo, valor) => {
    const copia = residentes.map((r, idx) => idx === i ? { ...r, [campo]: valor } : r);
    onChange(copia);
  };

  return (
    <div>
      {residentes.map((r, i) => (
        <div key={i} style={{
          border: '1px solid #d1d5db', borderRadius: '10px',
          padding: '14px', marginBottom: '12px', background: '#f9fafb',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#374151' }}>
              Residente #{i + 1}
            </span>
            <button type="button" onClick={() => eliminar(i)}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label-field">Nombre y Apellido</label>
              <input className="input-field" value={r.nombre}
                onChange={e => actualizar(i, 'nombre', e.target.value)} />
            </div>
            <div>
              <label className="label-field">DNI</label>
              <input className="input-field" type="number" inputMode="numeric" value={r.dni}
                onChange={e => actualizar(i, 'dni', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Domicilio</label>
              <input className="input-field" value={r.domicilio}
                onChange={e => actualizar(i, 'domicilio', e.target.value)} />
            </div>
            <p style={{ fontWeight: 600, fontSize: '13px', color: '#374151', marginTop: '6px' }}>Familiar Responsable</p>
            <div>
              <label className="label-field">Nombre y Apellido</label>
              <input className="input-field" value={r.familiar_nombre}
                onChange={e => actualizar(i, 'familiar_nombre', e.target.value)} />
            </div>
            <div>
              <label className="label-field">DNI</label>
              <input className="input-field" type="number" inputMode="numeric" value={r.familiar_dni}
                onChange={e => actualizar(i, 'familiar_dni', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Teléfono</label>
              <input className="input-field" type="tel" inputMode="tel" value={r.familiar_telefono}
                onChange={e => actualizar(i, 'familiar_telefono', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Vínculo</label>
              <input className="input-field" value={r.vinculo} placeholder="ej: Hijo/a, Cónyuge..."
                onChange={e => actualizar(i, 'vinculo', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={agregar}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Agregar residente
      </button>
    </div>
  );
}

// ── Componente formulario de testigos ────────────────────────────────────────
function FormTestigos({ testigos, onChange }) {
  const agregar = () => onChange([...testigos, TESTIGO_VACIO()]);
  const eliminar = (i) => onChange(testigos.filter((_, idx) => idx !== i));
  const actualizar = (i, campo, valor) => {
    const copia = testigos.map((t, idx) => idx === i ? { ...t, [campo]: valor } : t);
    onChange(copia);
  };

  return (
    <div>
      {testigos.length === 0 && (
        <p className="text-sm text-gray-500 mb-3">
          Agregá los testigos presentes al momento de la inspección.
        </p>
      )}
      {testigos.map((t, i) => (
        <div key={i} style={{
          border: '1px solid #d1d5db', borderRadius: '10px',
          padding: '14px', marginBottom: '12px', background: '#f9fafb',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: '#374151' }}>
              Testigo #{i + 1}
            </span>
            <button type="button" onClick={() => eliminar(i)}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>
              ×
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label-field">Nombre y Apellido</label>
              <input className="input-field" value={t.nombre}
                onChange={e => actualizar(i, 'nombre', e.target.value)} />
            </div>
            <div>
              <label className="label-field">DNI</label>
              <input className="input-field" type="number" inputMode="numeric" value={t.dni}
                onChange={e => actualizar(i, 'dni', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Domicilio</label>
              <input className="input-field" value={t.domicilio}
                onChange={e => actualizar(i, 'domicilio', e.target.value)} />
            </div>
            <div>
              <label className="label-field">Testimonio</label>
              <textarea className="input-field h-24" value={t.testimonio}
                onChange={e => actualizar(i, 'testimonio', e.target.value)}
                placeholder="Declaración del testigo..." />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={agregar}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Agregar testigo
      </button>
    </div>
  );
}

// ── Renderizador de campo dentro de una instancia repetible ──────────────────
function RenderCampoRepetible({ campo, valor, onChange }) {
  if (campo.tipo === 'si_no') {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
        <span className="text-base">{campo.etiqueta}</span>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => onChange(valor === 'SI' ? '' : 'SI')}
            className={`px-5 py-2 rounded-lg font-semibold text-lg transition-colors ${valor === 'SI' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            SI
          </button>
          <button type="button"
            onClick={() => onChange(valor === 'NO' ? '' : 'NO')}
            className={`px-5 py-2 rounded-lg font-semibold text-lg transition-colors ${valor === 'NO' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
            NO
          </button>
        </div>
      </div>
    );
  }
  if (campo.tipo === 'check') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <input type="checkbox" checked={valor === 'true'}
          onChange={e => onChange(e.target.checked ? 'true' : 'false')}
          className="w-5 h-5 cursor-pointer" />
        <span className="text-base">{campo.etiqueta}</span>
      </div>
    );
  }
  if (campo.tipo === 'textarea') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <textarea className="p-3 border border-gray-300 rounded-lg" rows={3}
          value={valor} onChange={e => onChange(e.target.value)}
          placeholder={campo.placeholder || ''} />
      </div>
    );
  }
  if (campo.tipo === 'numero') {
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <input type="number" inputMode="numeric" className="p-3 border border-gray-300 rounded-lg"
          value={valor} onChange={e => onChange(e.target.value)}
          placeholder={campo.placeholder || ''} />
      </div>
    );
  }
  if (campo.tipo === 'select') {
    const opciones = Array.isArray(campo.opciones) ? campo.opciones : [];
    return (
      <div className="flex flex-col">
        <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
        <select className="p-3 border border-gray-300 rounded-lg bg-white"
          value={valor} onChange={e => onChange(e.target.value)}>
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
      <input type="text" className="p-3 border border-gray-300 rounded-lg"
        value={valor} onChange={e => onChange(e.target.value)}
        placeholder={campo.placeholder || ''} />
    </div>
  );
}

// ── Subsección dentro de una instancia repetible ──────────────────────────────
function SubseccionRepetible({ subseccion, inst, onCampo }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mt-3 rounded-lg border border-blue-200 overflow-hidden">
      <div onClick={() => setIsOpen(p => !p)} style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        minHeight: '40px', cursor: 'pointer', padding: '0 12px',
        background: isOpen ? '#eff6ff' : '#dbeafe',
        userSelect: 'none', borderLeft: '4px solid #3b82f6',
      }}>
        <span style={{ fontWeight: 700, fontSize: '12px', color: '#1d4ed8', textTransform: 'uppercase' }}>
          ↳ {subseccion.titulo}
        </span>
        <span style={{ fontSize: '13px', color: '#3b82f6' }}>{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && (
        <div className="p-3 bg-blue-50 space-y-3">
          {subseccion.texto_previo && (
            <p className="text-xs text-gray-500 italic">{subseccion.texto_previo}</p>
          )}
          {(subseccion.campos || []).map(campo => (
            <RenderCampoRepetible
              key={campo.id}
              campo={campo}
              valor={inst[campo.id] ?? ''}
              onChange={v => onCampo(campo.id, v)}
            />
          ))}
          {subseccion.texto_posterior && (
            <p className="text-xs text-gray-500 italic mt-2">{subseccion.texto_posterior}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sección repetible ─────────────────────────────────────────────────────────
function SeccionRepetible({ seccion, instancias, onInstanciasChange }) {
  const [openIdx, setOpenIdx] = useState([0]);
  const toggleOpen = (i) => setOpenIdx(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  );

  const agregar = () => {
    const nuevas = [...instancias, {}];
    setOpenIdx(prev => [...prev, nuevas.length - 1]);
    onInstanciasChange(nuevas);
  };

  const eliminar = (i) => {
    onInstanciasChange(instancias.filter((_, idx) => idx !== i));
    setOpenIdx(prev => prev.filter(x => x !== i).map(x => x > i ? x - 1 : x));
  };

  const handleCampo = (instIdx, campoId, valor) => {
    const nuevas = instancias.map((inst, i) =>
      i === instIdx ? { ...inst, [campoId]: valor } : inst
    );
    onInstanciasChange(nuevas);
  };

  return (
    <div className="mb-4 rounded-lg border border-blue-200 overflow-hidden">
      {/* Header principal */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        minHeight: '56px', padding: '0 16px',
        background: '#eff6ff', borderBottom: '1px solid #bfdbfe',
      }}>
        <span className="font-bold text-base text-blue-800 uppercase">{seccion.titulo}</span>
        <button type="button" onClick={agregar}
          style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: '6px', padding: '6px 14px', cursor: 'pointer',
            fontWeight: 700, fontSize: '13px',
          }}>
          + Agregar
        </button>
      </div>

      {instancias.length === 0 && (
        <div className="p-4 text-sm text-gray-500 italic bg-gray-50">
          Tocá "+ Agregar" para registrar una instancia de esta sección.
        </div>
      )}

      {instancias.map((inst, i) => {
        const isOpen = openIdx.includes(i);
        return (
          <div key={i} style={{ borderTop: i > 0 ? '1px solid #bfdbfe' : 'none' }}>
            {/* Sub-header de instancia */}
            <div onClick={() => toggleOpen(i)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              minHeight: '48px', cursor: 'pointer', padding: '0 16px',
              background: isOpen ? '#dbeafe' : '#eff6ff', userSelect: 'none',
            }}>
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#1e40af' }}>
                {seccion.titulo} #{i + 1}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button type="button"
                  onClick={e => { e.stopPropagation(); eliminar(i); }}
                  style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>
                  ×
                </button>
                <span style={{ fontSize: '16px', color: '#3b82f6' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {isOpen && (
              <div className="p-4 bg-white space-y-3">
                {/* Campos directos de la sección */}
                {(seccion.campos || []).map(campo => (
                  <RenderCampoRepetible
                    key={campo.id}
                    campo={campo}
                    valor={inst[campo.id] ?? ''}
                    onChange={v => handleCampo(i, campo.id, v)}
                  />
                ))}

                {/* Subsecciones */}
                {(seccion.subsecciones || []).map(sub => (
                  <SubseccionRepetible
                    key={sub.id}
                    subseccion={sub}
                    inst={inst}
                    onCampo={(campoId, v) => handleCampo(i, campoId, v)}
                  />
                ))}

                {/* Observación de la instancia */}
                <div className="flex flex-col">
                  <label className="text-sm text-gray-600 mb-1">Observación</label>
                  <textarea className="p-3 border border-gray-300 rounded-lg" rows={2}
                    value={inst.__obs ?? ''}
                    onChange={e => handleCampo(i, '__obs', e.target.value)}
                    placeholder="Observación para esta instancia..." />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── Componente principal ──────────────────────────────────────────────────────
export default function NuevaActa() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actaId, setActaId] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  // Template dinámico
  const [tipologias, setTipologias] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Secciones opcionales seleccionadas
  const [seccionesActivas, setSeccionesActivas] = useState([]);

  // Respuestas campos normales: { campo_id: valor }
  const [respuestas, setRespuestas] = useState({});

  // Geriátrico — en funcionamiento
  const [enFuncionamiento, setEnFuncionamiento] = useState('');

  // Testigos (geriátrico NO)
  const [testigos, setTestigos] = useState([]);

  // Residentes (geriátrico SI, con checkbox)
  const [hayResidentes, setHayResidentes] = useState(false);
  const [residentes, setResidentes] = useState([]);

  // Secciones repetibles: { [seccion_id]: [instancia1, instancia2, ...] }
  const [seccionesExtra, setSeccionesExtra] = useState({});

  const [datos, setDatos] = useState({
    expediente: '',
    establecimiento_nombre: '',
    establecimiento_direccion: '',
    establecimiento_localidad: '',
    tipologia: '',
    responsable_nombre: '',
    responsable_dni: '',
    responsable_caracter: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    virtual: false,
    presencial: true,
    tipo_inspeccion: 'RUTINA',
    observaciones: '',
    emplazamiento_valor: 48,
    emplazamiento_tipo: 'HORAS',
    fotos_urls: [],
    firma_inspector_base64: '',
    firma_responsable_base64: '',
  });

  const esGeriatrico = esGeriatricoNombre(datos.tipologia);

  // Flujo de pasos según tipología y en_funcionamiento
  // paso 8 = testigos (geriátrico NO)
  const PASOS_NORMAL = [
    { id: 1, label: 'Establecimiento' },
    { id: 2, label: 'Responsable' },
    { id: 3, label: 'Tipo Insp.' },
    { id: 4, label: 'Secciones' },
    { id: 5, label: 'Formulario' },
    { id: 6, label: 'Fotos' },
    { id: 7, label: 'Firmas' },
  ];
  const PASOS_NO_FUNC = [
    { id: 1, label: 'Establecimiento' },
    { id: 2, label: 'Responsable' },
    { id: 3, label: 'Tipo Insp.' },
    { id: 8, label: 'Testigos' },
    { id: 6, label: 'Fotos' },
    { id: 7, label: 'Firmas' },
  ];

  const pasosActuales = (esGeriatrico && enFuncionamiento === 'NO')
    ? PASOS_NO_FUNC
    : PASOS_NORMAL;

  const pasoIdx = pasosActuales.findIndex(p => p.id === paso);
  const irSiguiente = () => {
    const next = pasosActuales[pasoIdx + 1];
    if (next) setPaso(next.id);
  };
  const irAnterior = () => {
    const prev = pasosActuales[pasoIdx - 1];
    if (prev) setPaso(prev.id);
  };

  // Cuando cambia en_funcionamiento y el paso actual no existe en el nuevo flujo, volver a 3
  useEffect(() => {
    const ids = pasosActuales.map(p => p.id);
    if (!ids.includes(paso) && paso > 3) setPaso(3);
  }, [enFuncionamiento]);

  useEffect(() => {
    templatesAPI.getTipologias()
      .then(r => setTipologias(r.data || []))
      .catch(() => setTipologias([]));
  }, []);

  useEffect(() => {
    if (!datos.tipologia) { setTemplate(null); setSeccionesActivas([]); return; }
    setLoadingTemplate(true);
    templatesAPI.getTipologiaPorNombre(datos.tipologia)
      .then(r => {
        setTemplate(r.data);
        setSeccionesActivas((r.data.secciones || []).map(s => s.id));
      })
      .catch(() => { setTemplate(null); setSeccionesActivas([]); })
      .finally(() => setLoadingTemplate(false));
  }, [datos.tipologia]);

  const handleRespuesta = (campoId, valor) => {
    setRespuestas(prev => {
      const next = { ...prev, [campoId]: valor };
      if (!template?.secciones?.length) return next;
      return { ...next, ...calcularTotalesDeCamas(next, template.secciones) };
    });
  };

  useEffect(() => {
    if (!template?.secciones?.length) return;
    setRespuestas(prev => {
      const totales = calcularTotalesDeCamas(prev, template.secciones);
      const hayCambio = Object.keys(totales).some(id => prev[id] !== totales[id]);
      return hayCambio ? { ...prev, ...totales } : prev;
    });
  }, [template]);

  const handleInstancias = (seccionId, nuevas) => {
    setSeccionesExtra(prev => ({ ...prev, [seccionId]: nuevas }));
  };

  // Secciones filtradas por las activas
  const seccionesFiltradas = (template?.secciones || []).filter(s =>
    seccionesActivas.includes(s.id)
  );

  // Separar por tipo
  const seccionesNormales = seccionesFiltradas.filter(s => s.tipo !== 'residentes' && !s.repetible);
  const seccionResidentes = seccionesFiltradas.find(s => s.tipo === 'residentes');
  const seccionesRepetibles = seccionesFiltradas.filter(s => s.repetible);

  // Detectar sección de flota vehicular (sección repetible cuyo título contiene "flota")
  // Sus instancias definen cuántas columnas mostrar en campos tipo tabla_unidades
  const seccionFlota = seccionesRepetibles.find(s =>
    /flota/i.test(s.titulo)
  );
  const flotaInstancias = seccionFlota
    ? (seccionesExtra[seccionFlota.id] || [])
    : [];

  // ── Guardar acta ─────────────────────────────────────────────────────────
  const buildPayload = () => ({
    inspector_id: usuario.id,
    establecimiento_nombre: datos.establecimiento_nombre,
    establecimiento_direccion: datos.establecimiento_direccion,
    establecimiento_localidad: datos.establecimiento_localidad,
    establecimiento_tipologia: datos.tipologia,
    expediente: datos.expediente,
    fecha: datos.fecha,
    hora: datos.hora,
    virtual: datos.virtual,
    presencial: datos.presencial,
    tipo_inspeccion: datos.tipo_inspeccion,
    responsable_nombre: datos.responsable_nombre,
    responsable_dni: datos.responsable_dni,
    responsable_caracter: datos.responsable_caracter,
    observaciones: datos.observaciones,
    emplazamiento_valor: datos.emplazamiento_valor,
    emplazamiento_tipo: datos.emplazamiento_tipo,
    datos_formulario: {
      en_funcionamiento: enFuncionamiento || null,
      residentes: hayResidentes ? residentes : [],
      testigos,
      secciones_extra: seccionesExtra,
    },
  });

  const crearActa = async () => {
    setLoading(true);
    try {
      const response = await actasAPI.create(buildPayload());
      setActaId(response.data.id);
      return response.data.id;
    } finally {
      setLoading(false);
    }
  };

  const guardarBorrador = async () => {
    try {
      const payload = buildPayload();
      if (actaId) {
        await actasAPI.update(actaId, payload);
        return actaId;
      } else {
        const response = await actasAPI.create(payload);
        setActaId(response.data.id);
        return response.data.id;
      }
    } catch (err) {
      console.error('Error guardando borrador:', err);
    }
  };

  const guardarRespuestas = async (idActa) => {
    const listaRespuestas = Object.entries(respuestas)
      .filter(([, v]) => v !== '' && v !== null && v !== undefined)
      .map(([campo_id, valor]) => ({ campo_id: parseInt(campo_id), valor: String(valor) }));
    if (listaRespuestas.length > 0) {
      await templatesAPI.guardarRespuestas(idActa, listaRespuestas);
    }
  };

  const guardarFotos = async (urls) => {
    setDatos(prev => ({ ...prev, fotos_urls: urls }));
    if (actaId) await actasAPI.update(actaId, { fotos_urls: urls });
  };

  const validarActa = () => {
    const errores = [];
    if (!datos.establecimiento_nombre?.trim()) errores.push('Nombre del establecimiento');
    if (!datos.responsable_nombre?.trim()) errores.push('Responsable del establecimiento');
    if (!datos.firma_inspector_base64) errores.push('Firma del inspector');
    if (!datos.firma_responsable_base64) errores.push('Firma del responsable');
    if (!datos.emplazamiento_valor || datos.emplazamiento_valor <= 0) errores.push('Plazo de emplazamiento');
    if (!datos.emplazamiento_tipo) errores.push('Tipo de plazo (días u horas)');
    return errores;
  };

  const generarPDF = async () => {
    const errores = validarActa();
    if (errores.length > 0) { setErrorModal(errores); return; }

    try {
      setLoading(true);
      setErrorModal(null);

      const idParaUsar = actaId || (await crearActa());
      await guardarRespuestas(idParaUsar);

      await actasAPI.update(idParaUsar, {
        ...buildPayload(),
        firma_inspector_base64: datos.firma_inspector_base64,
        firma_responsable_base64: datos.firma_responsable_base64,
        fotos_urls: datos.fotos_urls,
      });

      let blob;
      let pdfFilenameFromServer = null;

      try {
        const responseBase64 = await pdfAPI.generarActaBase64(idParaUsar);
        if (responseBase64.data?.pdfBuffer) {
          pdfFilenameFromServer = responseBase64.data?.filename || null;
          const base64 = responseBase64.data.pdfBuffer;
          let bytes;
          try {
            const binaryString = atob(base64);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          } catch {
            const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
            bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: 'application/pdf' });
        } else {
          throw new Error('No se recibió pdfBuffer');
        }
      } catch {
        const pdfResponse = await pdfAPI.generarActa(idParaUsar);
        blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      }

      const url = window.URL.createObjectURL(blob);
      const safeName = (str) => (str || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 40);
      const pdfFilename = pdfFilenameFromServer || `acta_${safeName(datos.expediente)}_${safeName(datos.establecimiento_nombre)}_${datos.fecha}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFilename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);

      navigate(`/acta/${idParaUsar}`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try { alert(`Error del servidor: ${JSON.parse(text).error || text}`); }
        catch { alert(`Error del servidor: ${text}`); }
      } else {
        alert(`Error al generar el PDF: ${err.response?.data?.error || err.message || ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100">
      {errorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Datos Incompletos</h3>
            </div>
            <p className="text-gray-600 mb-4">Faltan los siguientes datos obligatorios:</p>
            <ul className="space-y-2 mb-6">
              {errorModal.map((e, i) => (
                <li key={i} className="flex items-center gap-2 text-red-600">
                  <span>•</span><span>{e}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setErrorModal(null)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Entendido
            </button>
          </div>
        </div>
      )}

      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="text-blue-200 hover:text-white mb-2">← Volver</button>
          <h1 className="text-xl font-bold">Nueva Acta de Inspección</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        {/* Barra de pasos */}
        <div className="flex justify-between mb-6 overflow-x-auto pb-2">
          {pasosActuales.map((p, idx) => (
            <button key={p.id}
              onClick={() => idx <= pasoIdx && setPaso(p.id)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
                p.id === paso ? 'bg-blue-600 text-white'
                : idx < pasoIdx ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600'
              }`}>
              {idx + 1}. {p.label}
            </button>
          ))}
        </div>

        <div className="card">

          {/* PASO 1 — Establecimiento */}
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Datos del Establecimiento</h2>

              <div className="mb-4">
                <label className="label-field">Tipología</label>
                {tipologias.length === 0 ? (
                  <p className="text-sm text-gray-500 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    No hay tipologías configuradas. Creá una desde el panel de administración en <strong>/admin</strong>.
                  </p>
                ) : (
                  <select
                    value={datos.tipologia}
                    onChange={e => setDatos(prev => ({ ...prev, tipologia: e.target.value }))}
                    className="input-field">
                    <option value="">Seleccionar tipología</option>
                    {tipologias.map(t => (
                      <option key={t.id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>
                )}
                {loadingTemplate && <p className="text-xs text-blue-500 mt-1">Cargando template...</p>}
              </div>

              <div className="mb-4">
                <label className="label-field">Expediente</label>
                <input type="text" value={datos.expediente}
                  onChange={e => setDatos(prev => ({ ...prev, expediente: e.target.value }))}
                  className="input-field" placeholder="0425-xxxxxx/20xx" />
              </div>

              <div className="mb-4">
                <label className="label-field">Nombre del Establecimiento *</label>
                <input type="text" value={datos.establecimiento_nombre}
                  onChange={e => setDatos(prev => ({ ...prev, establecimiento_nombre: e.target.value }))}
                  className="input-field" required />
              </div>

              <div className="mb-4">
                <label className="label-field">Dirección</label>
                <input type="text" value={datos.establecimiento_direccion}
                  onChange={e => setDatos(prev => ({ ...prev, establecimiento_direccion: e.target.value }))}
                  className="input-field" />
              </div>

              <div className="mb-4">
                <label className="label-field">Localidad</label>
                <input type="text" value={datos.establecimiento_localidad}
                  onChange={e => setDatos(prev => ({ ...prev, establecimiento_localidad: e.target.value }))}
                  className="input-field" />
              </div>

              <button
                onClick={async () => {
                  if (datos.tipologia && datos.establecimiento_nombre) {
                    await guardarBorrador();
                    setPaso(2);
                  }
                }}
                disabled={!datos.tipologia || !datos.establecimiento_nombre}
                className="btn-primary disabled:opacity-50">
                Siguiente →
              </button>
            </div>
          )}

          {/* PASO 2 — Responsable */}
          {paso === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Datos del Responsable</h2>

              <div className="mb-4">
                <label className="label-field">Nombre y Apellido *</label>
                <input type="text" value={datos.responsable_nombre}
                  onChange={e => setDatos(prev => ({ ...prev, responsable_nombre: e.target.value }))}
                  className="input-field" required />
              </div>

              <div className="mb-4">
                <label className="label-field">DNI</label>
                <input type="number" inputMode="numeric" value={datos.responsable_dni}
                  onChange={e => setDatos(prev => ({ ...prev, responsable_dni: e.target.value }))}
                  className="input-field" />
              </div>

              <div className="mb-4">
                <label className="label-field">Carácter</label>
                <input type="text" value={datos.responsable_caracter}
                  onChange={e => setDatos(prev => ({ ...prev, responsable_caracter: e.target.value }))}
                  className="input-field" placeholder="Ej: Director Técnico, Propietario..." />
              </div>

              <div className="flex gap-4">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={async () => {
                  if (datos.responsable_nombre) { await guardarBorrador(); irSiguiente(); }
                }} disabled={!datos.responsable_nombre} className="btn-primary disabled:opacity-50">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 — Tipo de inspección */}
          {paso === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Tipo de Inspección</h2>

              <div className="mb-4">
                <label className="label-field">Fecha</label>
                <input type="date" value={datos.fecha}
                  onChange={e => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                  className="input-field" />
              </div>

              <div className="mb-4">
                <label className="label-field">Hora</label>
                <input type="time" value={datos.hora}
                  onChange={e => setDatos(prev => ({ ...prev, hora: e.target.value }))}
                  className="input-field" />
              </div>

              <div className="mb-4">
                <label className="label-field">Modalidad</label>
                <div className="flex gap-4">
                  <button type="button"
                    onClick={() => setDatos(prev => ({ ...prev, presencial: true, virtual: false }))}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${datos.presencial ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    Presencial
                  </button>
                  <button type="button"
                    onClick={() => setDatos(prev => ({ ...prev, presencial: false, virtual: true }))}
                    className={`flex-1 py-4 rounded-lg font-semibold transition-colors ${datos.virtual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    Virtual
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="label-field">Motivo</label>
                <div className="grid grid-cols-3 gap-3">
                  {['HABILITACION', 'RUTINA', 'DENUNCIA'].map(tipo => (
                    <button key={tipo} type="button"
                      onClick={() => setDatos(prev => ({ ...prev, tipo_inspeccion: tipo }))}
                      className={`py-4 rounded-lg font-semibold transition-colors ${datos.tipo_inspeccion === tipo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── En Funcionamiento (solo Geriátrico) ── */}
              {esGeriatrico && (
                <div className="mb-4">
                  <label className="label-field">En Funcionamiento</label>
                  <div className="flex gap-4">
                    <button type="button"
                      onClick={() => setEnFuncionamiento(enFuncionamiento === 'SI' ? '' : 'SI')}
                      className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-colors ${enFuncionamiento === 'SI' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      SI
                    </button>
                    <button type="button"
                      onClick={() => setEnFuncionamiento(enFuncionamiento === 'NO' ? '' : 'NO')}
                      className={`flex-1 py-4 rounded-lg font-semibold text-lg transition-colors ${enFuncionamiento === 'NO' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      NO
                    </button>
                  </div>
                  {enFuncionamiento === 'NO' && (
                    <p className="text-sm text-red-600 mt-2">
                      El establecimiento no está en funcionamiento. Se registrarán testigos en el siguiente paso.
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={() => {
                  if (esGeriatrico && enFuncionamiento === 'NO') {
                    setPaso(8);
                  } else if (template && template.secciones?.length > 0) {
                    setPaso(4);
                  } else {
                    setPaso(5);
                  }
                }} className="btn-primary">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* PASO 4 — Selector de secciones */}
          {paso === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Secciones a Inspeccionar</h2>
              <p className="text-gray-500 text-sm mb-4">
                Seleccioná las áreas que vas a inspeccionar en esta visita.
              </p>

              <div className="space-y-2">
                {(template?.secciones || []).map(sec => {
                  const activa = seccionesActivas.includes(sec.id);
                  return (
                    <button key={sec.id} type="button"
                      onClick={() => {
                        setSeccionesActivas(prev =>
                          activa ? prev.filter(id => id !== sec.id) : [...prev, sec.id]
                        );
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
                        activa
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}>
                      <div>
                        <span className="font-medium">{sec.titulo}</span>
                        {sec.tipo === 'residentes' && (
                          <span style={{ fontSize: '11px', marginLeft: '8px', background: '#ede9fe', color: '#7c3aed', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            Residentes
                          </span>
                        )}
                        {sec.repetible && (
                          <span style={{ fontSize: '11px', marginLeft: '8px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            Repetible
                          </span>
                        )}
                      </div>
                      <span className={`text-2xl font-bold ${activa ? 'text-green-500' : 'text-gray-300'}`}>
                        {activa ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={() => setPaso(5)} className="btn-primary">Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 5 — Formulario */}
          {paso === 5 && (
            <div>
              <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Formulario de Inspección</h2>
            <button
              type="button"
              onClick={() => setRespuestas(prev => {
                const next = ponerTodoSi(prev, seccionesNormales);
                return template?.secciones?.length ? { ...next, ...calcularTotalesDeCamas(next, template.secciones) } : next;
              })}
              className="btn-secondary"
            >
              Todo SI
            </button>
          </div>

              {/* Secciones normales */}
              <SeccionDinamica
                secciones={seccionesNormales}
                respuestas={respuestas}
                onChange={handleRespuesta}
                flotaInstancias={flotaInstancias}
              />

              {/* Secciones repetibles */}
              {seccionesRepetibles.map(sec => (
                <SeccionRepetible
                  key={sec.id}
                  seccion={sec}
                  instancias={seccionesExtra[sec.id] || []}
                  onInstanciasChange={(nuevas) => handleInstancias(sec.id, nuevas)}
                />
              ))}

              {/* Sección residentes (solo si está activa en template) */}
              {seccionResidentes && (
                <div className="mb-4 rounded-lg border border-purple-200 overflow-hidden">
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    minHeight: '56px', padding: '0 16px',
                    background: hayResidentes ? '#f5f3ff' : '#e5e7eb',
                  }}>
                    <span className="font-bold text-base uppercase text-gray-800">
                      {seccionResidentes.titulo}
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={hayResidentes}
                        onChange={e => {
                          setHayResidentes(e.target.checked);
                          if (e.target.checked && residentes.length === 0) {
                            setResidentes([RESIDENTE_VACIO()]);
                          }
                        }}
                        style={{ width: '20px', height: '20px' }}
                      />
                      <span className="text-sm font-semibold text-gray-700">Hay residentes a relevar</span>
                    </label>
                  </div>
                  {hayResidentes && (
                    <div className="p-4 bg-purple-50">
                      <FormResidentes residentes={residentes} onChange={setResidentes} />
                    </div>
                  )}
                </div>
              )}

              {/* Observaciones y emplazamiento */}
              <div className="mb-4 mt-6">
                <label className="label-field">Observaciones</label>
                <textarea value={datos.observaciones}
                  onChange={e => setDatos(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="input-field h-32" placeholder="Ingrese sus observaciones..." />
              </div>

              <div className="mb-4">
                <label className="label-field font-semibold">Plazo de Emplazamiento *</label>
                <div className="flex gap-3 mt-2">
                  <input type="number" value={datos.emplazamiento_valor}
                    onChange={e => setDatos(prev => ({ ...prev, emplazamiento_valor: parseInt(e.target.value) || 0 }))}
                    className="input-field w-24" min="1" required />
                  <div className="flex gap-2 flex-1">
                    {['HORAS', 'DÍAS'].map(tipo => (
                      <button key={tipo} type="button"
                        onClick={() => setDatos(prev => ({ ...prev, emplazamiento_tipo: tipo }))}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                          datos.emplazamiento_tipo === tipo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => {
                  if (template && template.secciones?.length > 0) setPaso(4);
                  else setPaso(3);
                }} className="btn-secondary">← Anterior</button>
                <button onClick={() => setPaso(6)} className="btn-primary">Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 8 — Testigos (geriátrico NO en funcionamiento) */}
          {paso === 8 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Testigos</h2>
              <p className="text-sm text-gray-500 mb-4">
                El establecimiento no está en funcionamiento. Registrá los testigos presentes.
              </p>

              <FormTestigos testigos={testigos} onChange={setTestigos} />

              <div className="mb-4 mt-6">
                <label className="label-field">Observaciones</label>
                <textarea value={datos.observaciones}
                  onChange={e => setDatos(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="input-field h-32" placeholder="Ingrese sus observaciones..." />
              </div>

              <div className="mb-4">
                <label className="label-field font-semibold">Plazo de Emplazamiento *</label>
                <div className="flex gap-3 mt-2">
                  <input type="number" value={datos.emplazamiento_valor}
                    onChange={e => setDatos(prev => ({ ...prev, emplazamiento_valor: parseInt(e.target.value) || 0 }))}
                    className="input-field w-24" min="1" required />
                  <div className="flex gap-2 flex-1">
                    {['HORAS', 'DÍAS'].map(tipo => (
                      <button key={tipo} type="button"
                        onClick={() => setDatos(prev => ({ ...prev, emplazamiento_tipo: tipo }))}
                        className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                          datos.emplazamiento_tipo === tipo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={() => setPaso(6)} className="btn-primary">Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 6 — Fotos */}
          {paso === 6 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Fotos de la Inspección</h2>
              <SubidaFotos onFotosChange={guardarFotos} />
              <div className="flex gap-4 mt-6">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={() => setPaso(7)} className="btn-primary">Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 7 — Firmas */}
          {paso === 7 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Firmas</h2>

              <div className="mb-8">
                <FirmaCanvas onFirma={f => setDatos(prev => ({ ...prev, firma_inspector_base64: f }))}
                  label="Firma del Inspector *" />
                {datos.firma_inspector_base64 && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firmado</span>
                )}
              </div>

              <div className="mb-8">
                <FirmaCanvas onFirma={f => setDatos(prev => ({ ...prev, firma_responsable_base64: f }))}
                  label="Firma del Responsable *" />
                {datos.firma_responsable_base64 && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firmado</span>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={irAnterior} className="btn-secondary">← Anterior</button>
                <button onClick={generarPDF} disabled={loading}
                  className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 px-8 py-4 text-lg">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Generando...
                    </span>
                  ) : 'Generar Acta PDF'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
