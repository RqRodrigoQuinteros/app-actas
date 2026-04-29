import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI, templatesAPI } from '../utils/api';
import { calcularTotalesDeCamas, ponerTodoSi } from '../utils/actaHelpers';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';
import SeccionDinamica from './SeccionDinamica';

// ── Helpers copiados de NuevaActa ────────────────────────────────────────────

const RESIDENTE_VACIO = () => ({
  nombre: '', dni: '', domicilio: '',
  familiar_nombre: '', familiar_dni: '', familiar_telefono: '', vinculo: '',
});

const TESTIGO_VACIO = () => ({
  nombre: '', dni: '', domicilio: '', testimonio: '',
});

const esGeriatricoNombre = (nombre) =>
  /geriatric/i.test(nombre) || /geriátric/i.test(nombre);

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
        <div key={i} style={{ border:'1px solid #d1d5db', borderRadius:'10px', padding:'14px', marginBottom:'12px', background:'#f9fafb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <span style={{ fontWeight:700, fontSize:'13px', color:'#374151' }}>Residente #{i + 1}</span>
            <button type="button" onClick={() => eliminar(i)} style={{ background:'none', border:'none', color:'#dc2626', fontSize:'18px', cursor:'pointer' }}>×</button>
          </div>
          <div className="space-y-3">
            {[['nombre','Nombre y Apellido'],['dni','DNI'],['domicilio','Domicilio']].map(([k,l]) => (
              <div key={k}>
                <label className="label-field">{l}</label>
                <input className="input-field" value={r[k]} onChange={e => actualizar(i, k, e.target.value)} type={k==='dni'?'number':'text'} inputMode={k==='dni'?'numeric':undefined} />
              </div>
            ))}
            <p style={{ fontWeight:600, fontSize:'13px', color:'#374151', marginTop:'6px' }}>Familiar Responsable</p>
            {[['familiar_nombre','Nombre y Apellido'],['familiar_dni','DNI'],['familiar_telefono','Teléfono'],['vinculo','Vínculo']].map(([k,l]) => (
              <div key={k}>
                <label className="label-field">{l}</label>
                <input className="input-field" value={r[k]} onChange={e => actualizar(i, k, e.target.value)}
                  type={k==='familiar_dni'?'number':k==='familiar_telefono'?'tel':'text'}
                  inputMode={k==='familiar_dni'?'numeric':k==='familiar_telefono'?'tel':undefined}
                  placeholder={k==='vinculo'?'ej: Hijo/a, Cónyuge...':undefined} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button type="button" onClick={agregar} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
        + Agregar residente
      </button>
    </div>
  );
}

function FormTestigos({ testigos, onChange }) {
  const agregar = () => onChange([...testigos, TESTIGO_VACIO()]);
  const eliminar = (i) => onChange(testigos.filter((_, idx) => idx !== i));
  const actualizar = (i, campo, valor) => {
    const copia = testigos.map((t, idx) => idx === i ? { ...t, [campo]: valor } : t);
    onChange(copia);
  };
  return (
    <div>
      {testigos.map((t, i) => (
        <div key={i} style={{ border:'1px solid #d1d5db', borderRadius:'10px', padding:'14px', marginBottom:'12px', background:'#f9fafb' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
            <span style={{ fontWeight:700, fontSize:'13px', color:'#374151' }}>Testigo #{i + 1}</span>
            <button type="button" onClick={() => eliminar(i)} style={{ background:'none', border:'none', color:'#dc2626', fontSize:'18px', cursor:'pointer' }}>×</button>
          </div>
          <div className="space-y-3">
            {[['nombre','Nombre y Apellido'],['dni','DNI'],['domicilio','Domicilio']].map(([k,l]) => (
              <div key={k}>
                <label className="label-field">{l}</label>
                <input className="input-field" value={t[k]} onChange={e => actualizar(i, k, e.target.value)} type={k==='dni'?'number':'text'} inputMode={k==='dni'?'numeric':undefined} />
              </div>
            ))}
            <div>
              <label className="label-field">Testimonio</label>
              <textarea className="input-field h-24" value={t.testimonio} onChange={e => actualizar(i, 'testimonio', e.target.value)} placeholder="Declaración del testigo..." />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={agregar} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-blue-400 hover:text-blue-600 transition-colors">
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
  return (
    <div className="flex flex-col">
      <label className="text-sm text-gray-600 mb-1">{campo.etiqueta}</label>
      <input type="text" className="p-3 border border-gray-300 rounded-lg"
        value={valor} onChange={e => onChange(e.target.value)}
        placeholder={campo.placeholder || ''} />
    </div>
  );
}

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
                {(seccion.campos || []).map(campo => (
                  <RenderCampoRepetible
                    key={campo.id}
                    campo={campo}
                    valor={inst[campo.id] ?? ''}
                    onChange={v => handleCampo(i, campo.id, v)}
                  />
                ))}
                {(seccion.subsecciones || []).map(sub => (
                  <SubseccionRepetible
                    key={sub.id}
                    subseccion={sub}
                    inst={inst}
                    onCampo={(campoId, v) => handleCampo(i, campoId, v)}
                  />
                ))}
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

export default function EditarActa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [acta, setActa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  // Template dinámico
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Respuestas dinámicas
  const [respuestas, setRespuestas] = useState({});       // { campo_id: valor }
  const [seccionesExtra, setSeccionesExtra] = useState({}); // secciones repetibles
  const [seccionesActivas, setSeccionesActivas] = useState([]);

  // Datos formulario estructurado
  const [enFuncionamiento, setEnFuncionamiento] = useState('');
  const [testigos, setTestigos] = useState([]);
  const [hayResidentes, setHayResidentes] = useState(false);
  const [residentes, setResidentes] = useState([]);

  // Campos básicos
  const [datos, setDatos] = useState(null);
  const [firmaInspector, setFirmaInspector] = useState('');
  const [firmaResponsable, setFirmaResponsable] = useState('');
  const [fotosUrls, setFotosUrls] = useState([]);

  // Tab activo
  const [tab, setTab] = useState('datos');

  useEffect(() => { cargarActa(); }, [id]);

  const cargarActa = async () => {
    try {
      setLoading(true);
      const [actaRes, respuestasRes] = await Promise.all([
        actasAPI.getById(id),
        templatesAPI.getRespuestas(id).catch(() => ({ data: [] })),
      ]);
      const a = actaRes.data;

      if (usuario.rol === 'inspector' && a.inspector_id !== usuario.id) {
        alert('No tenés acceso a editar esta acta.');
        navigate(-1);
        return;
      }
      if (a.estado === 'cerrado') {
        alert('Esta acta está cerrada y no se puede editar.');
        navigate(`/acta/${id}`);
        return;
      }

      setActa(a);
      setDatos({
        expediente: a.expediente || '',
        establecimiento_nombre: a.establecimiento_nombre || '',
        establecimiento_direccion: a.establecimiento_direccion || '',
        establecimiento_localidad: a.establecimiento_localidad || '',
        responsable_nombre: a.responsable_nombre || '',
        responsable_dni: a.responsable_dni || '',
        responsable_caracter: a.responsable_caracter || '',
        fecha: a.fecha || '',
        hora: a.hora || '',
        tipo_inspeccion: a.tipo_inspeccion || 'RUTINA',
        virtual: a.virtual || false,
        presencial: a.presencial !== false,
        observaciones: a.observaciones || '',
        emplazamiento_valor: a.emplazamiento_valor ?? 48,
        emplazamiento_tipo: a.emplazamiento_tipo || 'HORAS',
      });
      setFotosUrls(a.fotos_urls || []);
      setFirmaInspector(a.firma_inspector_base64 || '');
      setFirmaResponsable(a.firma_responsable_base64 || '');

      // Datos formulario estructurado
      const df = a.datos_formulario || {};
      setEnFuncionamiento(df.en_funcionamiento || '');
      setTestigos(df.testigos || []);
      const res = df.residentes || [];
      setResidentes(res);
      setHayResidentes(res.length > 0);
      setSeccionesExtra(df.secciones_extra || {});

      // Respuestas dinámicas: convertir array [{campo_id, valor}] a mapa
      const mapRespuestas = {};
      for (const r of (respuestasRes.data || [])) {
        if (r.campo_id) mapRespuestas[r.campo_id] = r.valor;
      }
      setRespuestas(mapRespuestas);

      // Cargar template de la tipología
      if (a.establecimiento_tipologia) {
        setLoadingTemplate(true);
        try {
          const tRes = await templatesAPI.getTipologiaPorNombre(a.establecimiento_tipologia);
          setTemplate(tRes.data);
          // Activar todas las secciones por defecto
          setSeccionesActivas((tRes.data.secciones || []).map(s => s.id));
        } catch {
          setTemplate(null);
        } finally {
          setLoadingTemplate(false);
        }
      }
    } catch (err) {
      console.error('Error cargando acta:', err);
      alert('No se pudo cargar el acta.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleRespuesta = (campoId, valor) => {
    setRespuestas(prev => {
      const next = { ...prev, [campoId]: valor };
      if (!template?.secciones?.length) return next;
      return { ...next, ...calcularTotalesDeCamas(next, template.secciones) };
    });
  };
  const handleInstancias = (seccionId, nuevas) => setSeccionesExtra(prev => ({ ...prev, [seccionId]: nuevas }));

  const seccionesFiltradas = (template?.secciones || []).filter(s => seccionesActivas.includes(s.id));
  const seccionesNormales = seccionesFiltradas.filter(s => s.tipo !== 'residentes' && !s.repetible);
  const seccionResidentes = seccionesFiltradas.find(s => s.tipo === 'residentes');
  const seccionesRepetibles = seccionesFiltradas.filter(s => s.repetible);

  useEffect(() => {
    if (!template?.secciones?.length) return;
    setRespuestas(prev => {
      const totales = calcularTotalesDeCamas(prev, template.secciones);
      const hayCambio = Object.keys(totales).some(id => prev[id] !== totales[id]);
      return hayCambio ? { ...prev, ...totales } : prev;
    });
  }, [template]);

  // Flota vehicular: sección repetible cuyo título contiene "flota"
  const seccionFlota = seccionesRepetibles.find(s => /flota/i.test(s.titulo));
  const flotaInstancias = seccionFlota ? (seccionesExtra[seccionFlota.id] || []) : [];

  const esGeriatrico = esGeriatricoNombre(acta?.establecimiento_tipologia || '');

  const guardar = async () => {
    setGuardando(true);
    setGuardadoOk(false);
    try {
      // 1. Guardar acta base
      await actasAPI.update(id, {
        ...datos,
        fotos_urls: fotosUrls,
        firma_inspector_base64: firmaInspector,
        firma_responsable_base64: firmaResponsable,
        datos_formulario: {
          en_funcionamiento: enFuncionamiento || null,
          residentes: hayResidentes ? residentes : [],
          testigos,
          secciones_extra: seccionesExtra,
        },
      });

      // 2. Guardar respuestas dinámicas
      const listaRespuestas = Object.entries(respuestas)
        .filter(([, v]) => v !== '' && v !== null && v !== undefined)
        .map(([campo_id, valor]) => ({ campo_id: parseInt(campo_id), valor: String(valor) }));
      if (listaRespuestas.length > 0) {
        await templatesAPI.guardarRespuestas(id, listaRespuestas);
      }

      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
      const res = await actasAPI.getById(id);
      setActa(res.data);
    } catch (err) {
      console.error('Error guardando:', err);
      alert(`Error al guardar: ${err.response?.data?.error || err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const generarPDF = async () => {
    await guardar();
    setGenerandoPDF(true);
    try {
      let blob;
      try {
        const res = await pdfAPI.generarActaBase64(id);
        if (res.data?.pdfBuffer) {
          const binary = atob(res.data.pdfBuffer);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes], { type: 'application/pdf' });
        } else throw new Error('Sin pdfBuffer');
      } catch {
        const res = await pdfAPI.generarActa(id);
        blob = new Blob([res.data], { type: 'application/pdf' });
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `acta_${id}.pdf`; a.target = '_blank';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      navigate(`/acta/${id}`);
    } catch (err) {
      alert(`Error al generar PDF: ${err.response?.data?.error || err.message}`);
    } finally {
      setGenerandoPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-500">Cargando acta...</p>
      </div>
    );
  }
  if (!acta || !datos) return null;

  const TABS = [
    { id: 'datos',      label: '📋 Datos'     },
    { id: 'formulario', label: '📝 Formulario' },
    { id: 'fotos',      label: '📷 Fotos'      },
    { id: 'firmas',     label: '✍️ Firmas'     },
  ];

  const ocupado = guardando || generandoPDF;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-orange-700 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(`/acta/${id}`)} className="text-orange-200 hover:text-white mb-2 text-sm">
            ← Volver al acta
          </button>
          <h1 className="text-xl font-bold">Editar Acta</h1>
          <p className="text-orange-200 text-sm mt-0.5">
            {acta.establecimiento_nombre} — {acta.fecha}
            {acta.establecimiento_tipologia && (
              <span className="ml-2 text-xs bg-orange-800 px-2 py-0.5 rounded">
                {acta.establecimiento_tipologia}
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">

        {/* Estado */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            acta.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
            acta.estado === 'firmado'  ? 'bg-blue-100 text-blue-800'   :
            'bg-green-100 text-green-800'
          }`}>
            {acta.estado?.toUpperCase()}
          </span>
          <span className="text-gray-500 text-sm">Modificá los datos y regenerá el PDF.</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold text-sm transition-colors ${
                tab === t.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card">

          {/* ── TAB DATOS ──────────────────────────────────────── */}
          {tab === 'datos' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800">Datos del Acta</h2>

              <div>
                <label className="label-field">Nombre del Establecimiento *</label>
                <input className="input-field" value={datos.establecimiento_nombre} onChange={e => setDatos(p => ({ ...p, establecimiento_nombre: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">Dirección</label>
                <input className="input-field" value={datos.establecimiento_direccion} onChange={e => setDatos(p => ({ ...p, establecimiento_direccion: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">Localidad</label>
                <input className="input-field" value={datos.establecimiento_localidad} onChange={e => setDatos(p => ({ ...p, establecimiento_localidad: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">Expediente</label>
                <input className="input-field" value={datos.expediente} onChange={e => setDatos(p => ({ ...p, expediente: e.target.value }))} placeholder="0425-xxxxxx/20xx" />
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="label-field">Responsable *</label>
                <input className="input-field" value={datos.responsable_nombre} onChange={e => setDatos(p => ({ ...p, responsable_nombre: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">DNI</label>
                <input className="input-field" type="number" inputMode="numeric" value={datos.responsable_dni} onChange={e => setDatos(p => ({ ...p, responsable_dni: e.target.value }))} />
              </div>
              <div>
                <label className="label-field">Carácter</label>
                <input className="input-field" value={datos.responsable_caracter} onChange={e => setDatos(p => ({ ...p, responsable_caracter: e.target.value }))} placeholder="Ej: Director Técnico..." />
              </div>

              <hr className="border-gray-200" />

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="label-field">Fecha</label>
                  <input className="input-field" type="date" value={datos.fecha} onChange={e => setDatos(p => ({ ...p, fecha: e.target.value }))} />
                </div>
                <div className="w-32">
                  <label className="label-field">Hora</label>
                  <input className="input-field" type="time" value={datos.hora} onChange={e => setDatos(p => ({ ...p, hora: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="label-field">Modalidad</label>
                <div className="flex gap-3">
                  {[['presencial','Presencial'],['virtual','Virtual']].map(([k,l]) => (
                    <button key={k} type="button"
                      onClick={() => setDatos(p => ({ ...p, presencial: k==='presencial', virtual: k==='virtual' }))}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${(k==='presencial'?datos.presencial:datos.virtual)?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">Motivo</label>
                <div className="grid grid-cols-3 gap-2">
                  {['HABILITACION','RUTINA','DENUNCIA'].map(tipo => (
                    <button key={tipo} type="button"
                      onClick={() => setDatos(p => ({ ...p, tipo_inspeccion: tipo }))}
                      className={`py-3 rounded-lg font-semibold text-sm transition-colors ${datos.tipo_inspeccion===tipo?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="label-field">Observaciones</label>
                <textarea className="input-field h-28" value={datos.observaciones} onChange={e => setDatos(p => ({ ...p, observaciones: e.target.value }))} placeholder="Observaciones..." />
              </div>

              <div>
                <label className="label-field font-semibold">Plazo de Emplazamiento *</label>
                <div className="flex gap-3 mt-1">
                  <input type="number" className="input-field w-24" min="1" value={datos.emplazamiento_valor}
                    onChange={e => setDatos(p => ({ ...p, emplazamiento_valor: parseInt(e.target.value) || 0 }))} />
                  <div className="flex gap-2 flex-1">
                    {['HORAS','DÍAS'].map(tipo => (
                      <button key={tipo} type="button"
                        onClick={() => setDatos(p => ({ ...p, emplazamiento_tipo: tipo }))}
                        className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-colors ${datos.emplazamiento_tipo===tipo?'bg-blue-600 text-white':'bg-gray-200 text-gray-700'}`}>
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB FORMULARIO ─────────────────────────────────── */}
          {tab === 'formulario' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Formulario de Inspección</h2>

              {loadingTemplate && (
                <p className="text-sm text-blue-500 mb-4">Cargando template...</p>
              )}

              {/* En funcionamiento (geriátrico) */}
              {esGeriatrico && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <label className="label-field mb-2">En Funcionamiento</label>
                  <div className="flex gap-3">
                    <button type="button"
                      onClick={() => setEnFuncionamiento(enFuncionamiento === 'SI' ? '' : 'SI')}
                      className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-colors ${enFuncionamiento==='SI'?'bg-green-500 text-white':'bg-gray-200 text-gray-700'}`}>SI</button>
                    <button type="button"
                      onClick={() => setEnFuncionamiento(enFuncionamiento === 'NO' ? '' : 'NO')}
                      className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-colors ${enFuncionamiento==='NO'?'bg-red-500 text-white':'bg-gray-200 text-gray-700'}`}>NO</button>
                  </div>
                </div>
              )}

              {/* Testigos (geriátrico NO en funcionamiento) */}
              {esGeriatrico && enFuncionamiento === 'NO' && (
                <div className="mb-6">
                  <h3 className="font-bold text-base text-gray-700 mb-3 uppercase">Testigos</h3>
                  <FormTestigos testigos={testigos} onChange={setTestigos} />
                </div>
              )}

              {/* Secciones normales del template */}
              {(!esGeriatrico || enFuncionamiento !== 'NO') && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Formulario de Inspección</h2>
                  </div>
                  <SeccionDinamica
                    secciones={seccionesNormales}
                    respuestas={respuestas}
                    onChange={handleRespuesta}
                    flotaInstancias={flotaInstancias}
                  />

                  {seccionesRepetibles.map(sec => (
                    <SeccionRepetible
                      key={sec.id}
                      seccion={sec}
                      instancias={seccionesExtra[sec.id] || []}
                      onInstanciasChange={(nuevas) => handleInstancias(sec.id, nuevas)}
                    />
                  ))}

                  {seccionResidentes && (
                    <div className="mb-4 rounded-lg border border-purple-200 overflow-hidden">
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', minHeight:'56px', padding:'0 16px', background: hayResidentes ? '#f5f3ff' : '#e5e7eb' }}>
                        <span className="font-bold text-base uppercase text-gray-800">{seccionResidentes.titulo}</span>
                        <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                          <input type="checkbox" checked={hayResidentes}
                            onChange={e => { setHayResidentes(e.target.checked); if (e.target.checked && residentes.length === 0) setResidentes([RESIDENTE_VACIO()]); }}
                            style={{ width:'20px', height:'20px' }} />
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
                </>
              )}

              {!loadingTemplate && !template && (
                <p className="text-sm text-gray-400 italic">No hay template configurado para esta tipología.</p>
              )}
            </div>
          )}

          {/* ── TAB FOTOS ──────────────────────────────────────── */}
          {tab === 'fotos' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Fotos de la Inspección</h2>
              <SubidaFotos initialUrls={fotosUrls} onFotosChange={setFotosUrls} />
            </div>
          )}

          {/* ── TAB FIRMAS ─────────────────────────────────────── */}
          {tab === 'firmas' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Firmas</h2>
              <div>
                <p className="label-field mb-2">Firma del Inspector *</p>
                {firmaInspector && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border text-center">
                    <p className="text-xs text-gray-500 mb-1">Firma actual:</p>
                    <img src={firmaInspector} alt="Firma inspector" className="max-h-16 mx-auto" />
                  </div>
                )}
                <FirmaCanvas onFirma={setFirmaInspector} label={firmaInspector ? 'Reemplazar firma del Inspector' : 'Firma del Inspector *'} />
                {firmaInspector && <span className="text-green-600 text-sm mt-1 inline-block">✓ Firma guardada</span>}
              </div>
              <hr className="border-gray-200" />
              <div>
                <p className="label-field mb-2">Firma del Responsable *</p>
                {firmaResponsable && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border text-center">
                    <p className="text-xs text-gray-500 mb-1">Firma actual:</p>
                    <img src={firmaResponsable} alt="Firma responsable" className="max-h-16 mx-auto" />
                  </div>
                )}
                <FirmaCanvas onFirma={setFirmaResponsable} label={firmaResponsable ? 'Reemplazar firma del Responsable' : 'Firma del Responsable *'} />
                {firmaResponsable && <span className="text-green-600 text-sm mt-1 inline-block">✓ Firma guardada</span>}
              </div>
            </div>
          )}

        </div>

        {/* ── Barra de acciones ──────────────────────────────── */}
        <div className="mt-4 space-y-3">
          {guardadoOk && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 font-semibold text-sm">
              <span>✓</span> Cambios guardados correctamente
            </div>
          )}
          <button onClick={guardar} disabled={ocupado}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition-colors">
            {guardando ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Guardando...</span> : '💾 Guardar cambios'}
          </button>
          <button onClick={generarPDF} disabled={ocupado}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition-colors">
            {generandoPDF ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> Generando PDF...</span> : '📄 Guardar y regenerar PDF'}
          </button>
          <button onClick={() => navigate(`/acta/${id}`)}
            className="w-full py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
