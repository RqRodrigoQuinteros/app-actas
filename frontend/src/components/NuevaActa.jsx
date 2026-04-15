import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI, templatesAPI } from '../utils/api';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';
import SeccionDinamica from './SeccionDinamica';

const PASOS = [
  { id: 1, label: 'Establecimiento' },
  { id: 2, label: 'Responsable' },
  { id: 3, label: 'Tipo Inspección' },
  { id: 4, label: 'Secciones' },
  { id: 5, label: 'Formulario' },
  { id: 6, label: 'Fotos' },
  { id: 7, label: 'Firmas' },
];

export default function NuevaActa() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actaId, setActaId] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  // Template dinámico
  const [tipologias, setTipologias] = useState([]);
  const [template, setTemplate] = useState(null);   // { secciones: [...] }
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Secciones opcionales seleccionadas (ids de secciones)
  const [seccionesActivas, setSeccionesActivas] = useState([]);

  // Respuestas: { campo_id: valor }
  const [respuestas, setRespuestas] = useState({});

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

  // Cargar tipologías al montar
  useEffect(() => {
    templatesAPI.getTipologias()
      .then(r => setTipologias(r.data || []))
      .catch(() => setTipologias([]));
  }, []);

  // Cargar template al elegir tipología
  useEffect(() => {
    if (!datos.tipologia) {
      setTemplate(null);
      setSeccionesActivas([]);
      return;
    }
    setLoadingTemplate(true);
    templatesAPI.getTipologiaPorNombre(datos.tipologia)
      .then(r => {
        setTemplate(r.data);
        // Por defecto activar todas las secciones
        setSeccionesActivas((r.data.secciones || []).map(s => s.id));
      })
      .catch(() => {
        setTemplate(null);
        setSeccionesActivas([]);
      })
      .finally(() => setLoadingTemplate(false));
  }, [datos.tipologia]);

  const handleRespuesta = (campoId, valor) => {
    setRespuestas(prev => ({ ...prev, [campoId]: valor }));
  };

  // Secciones a mostrar en el formulario (filtradas por las activas)
  const seccionesFiltradas = (template?.secciones || []).filter(s =>
    seccionesActivas.includes(s.id)
  );

  const crearActa = async () => {
    setLoading(true);
    try {
      const payload = {
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
      };
      const response = await actasAPI.create(payload);
      setActaId(response.data.id);
      return response.data.id;
    } catch (err) {
      console.error('Error creando acta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const guardarBorrador = async () => {
    try {
      const payload = {
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
      };
      if (actaId) {
        await actasAPI.update(actaId, payload);
      } else {
        const response = await actasAPI.create(payload);
        setActaId(response.data.id);
        return response.data.id;
      }
      return actaId;
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
    if (actaId) {
      await actasAPI.update(actaId, { fotos_urls: urls });
    }
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

      // Guardar respuestas dinámicas
      await guardarRespuestas(idParaUsar);

      await actasAPI.update(idParaUsar, {
        observaciones: datos.observaciones,
        emplazamiento_valor: datos.emplazamiento_valor,
        emplazamiento_tipo: datos.emplazamiento_tipo,
        tipo_inspeccion: datos.tipo_inspeccion,
        responsable_nombre: datos.responsable_nombre,
        responsable_dni: datos.responsable_dni,
        responsable_caracter: datos.responsable_caracter,
        fecha: datos.fecha,
        hora: datos.hora,
        virtual: datos.virtual,
        presencial: datos.presencial,
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

  // ── Render ─────────────────────────────────────────────────────────────────
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
          {PASOS.map((p) => (
            <button key={p.id}
              onClick={() => p.id <= paso && setPaso(p.id)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
                p.id === paso ? 'bg-blue-600 text-white'
                : p.id < paso ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-600'
              }`}>
              {p.id}. {p.label}
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
                    className="input-field"
                  >
                    <option value="">Seleccionar tipología</option>
                    {tipologias.map(t => (
                      <option key={t.id} value={t.nombre}>{t.nombre}</option>
                    ))}
                  </select>
                )}
                {loadingTemplate && (
                  <p className="text-xs text-blue-500 mt-1">Cargando template...</p>
                )}
                {datos.tipologia && !loadingTemplate && !template && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Esta tipología no tiene template configurado aún. El formulario estará vacío.
                  </p>
                )}
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
                <button onClick={() => setPaso(1)} className="btn-secondary">← Anterior</button>
                <button onClick={async () => {
                  if (datos.responsable_nombre) { await guardarBorrador(); setPaso(3); }
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

              <div className="flex gap-4">
                <button onClick={() => setPaso(2)} className="btn-secondary">← Anterior</button>
                <button onClick={() => {
                  // Si hay template con secciones, mostrar selector; si no, saltar al formulario
                  if (template && template.secciones?.length > 0) {
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
                      <span className="font-medium">{sec.titulo}</span>
                      <span className={`text-2xl font-bold ${activa ? 'text-green-500' : 'text-gray-300'}`}>
                        {activa ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setPaso(3)} className="btn-secondary">← Anterior</button>
                <button onClick={() => setPaso(5)} className="btn-primary">Siguiente →</button>
              </div>
            </div>
          )}

          {/* PASO 5 — Formulario */}
          {paso === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Formulario de Inspección</h2>

              <SeccionDinamica
                secciones={seccionesFiltradas}
                respuestas={respuestas}
                onChange={handleRespuesta}
              />

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

          {/* PASO 6 — Fotos */}
          {paso === 6 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Fotos de la Inspección</h2>
              <SubidaFotos onFotosChange={guardarFotos} />
              <div className="flex gap-4 mt-6">
                <button onClick={() => setPaso(5)} className="btn-secondary">← Anterior</button>
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
                <button onClick={() => setPaso(6)} className="btn-secondary">← Anterior</button>
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