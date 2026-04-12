import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI } from '../utils/api';
import { TIPOLOGIAS, SECCIONES_POR_TIPOLOGIA, SECCION_LABELS } from '../utils/constants';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';
import SeccionDinamica from './SeccionDinamica';

// Tipologías que tienen secciones opcionales seleccionables
const TIPOLOGIAS_CON_SELECTOR = ['clinica', 'quirurgicos'];

// Secciones base (siempre presentes) por tipología
const SECCIONES_BASE = {
  clinica: ['conclusion_inspeccion', 'registros', 'datos_generales'],
  quirurgicos: ['conclusion_inspeccion', 'registros', 'datos_generales', 'quirurgicos_inscripcion', 'quirurgicos_direccion_funcionamiento'],
};

// Secciones opcionales con label para el selector
const SECCIONES_OPCIONALES = {
  clinica: [
    { key: 'consultorios_externos', label: 'Consultorios Externos' },
    { key: 'consultorios_salud_mental', label: 'Consultorios Salud Mental' },
    { key: 'la_institucion_posee', label: 'La Institución Posee' },
    { key: 'radiofisica', label: 'Radiofísica' },
    { key: 'sector_internacion', label: 'Sector de Internación' },
    { key: 'enfermeria', label: 'Enfermería' },
    { key: 'area_quirurgica', label: 'Área Quirúrgica' },
    { key: 'obstetricia', label: 'Obstetricia' },
    { key: 'laboratorio', label: 'Laboratorio' },
    { key: 'guardia', label: 'Guardia' },
    { key: 'uco', label: 'UCO — Unidad Coronaria' },
    { key: 'uti', label: 'UTI — Unidad de Terapia Intensiva' },
    { key: 'utin', label: 'UTIN — UTI Neonatal' },
    { key: 'hemodinamia', label: 'Hemodinamia' },
    { key: 'hospital_dia', label: 'Hospital de Día' },
  ],
  quirurgicos: [
    { key: 'consultorios_externos', label: 'Consultorios Externos' },
    { key: 'consultorios_salud_mental', label: 'Consultorios Salud Mental' },
    { key: 'la_institucion_posee', label: 'La Institución Posee' },
    { key: 'sector_internacion', label: 'Sector de Internación' },
    { key: 'enfermeria', label: 'Enfermería' },
    { key: 'quirurgicos_enfermeria', label: 'Enfermería Quirúrgica' },
    { key: 'area_quirurgica', label: 'Área Quirúrgica' },
    { key: 'quirurgicos_area_internacion', label: 'Área Internación Quirúrgica' },
    { key: 'quirurgicos_equipamiento', label: 'Equipamiento' },
    { key: 'quirurgicos_esterilizacion', label: 'Esterilización' },
    { key: 'obstetricia', label: 'Obstetricia' },
    { key: 'laboratorio', label: 'Laboratorio' },
    { key: 'guardia', label: 'Guardia' },
    { key: 'uco', label: 'UCO — Unidad Coronaria' },
    { key: 'uti', label: 'UTI — Unidad de Terapia Intensiva' },
    { key: 'utin', label: 'UTIN — UTI Neonatal' },
    { key: 'hemodinamia', label: 'Hemodinamia' },
    { key: 'hospital_dia', label: 'Hospital de Día' },
  ],
};

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
  const [seccionesSeleccionadas, setSeccionesSeleccionadas] = useState([]);

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
    observaciones: '',
    emplazamiento_valor: 48,
    emplazamiento_tipo: 'HORAS',
    datos_formulario: {},
    fotos_urls: [],
    firma_inspector_base64: '',
    firma_responsable_base64: '',
  });

  const crearActa = async () => {
    try {
      setLoading(true);

      const response = await actasAPI.create({
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
        responsable_nombre: datos.responsable_nombre,
        responsable_dni: datos.responsable_dni,
        responsable_caracter: datos.responsable_caracter,
        observaciones: datos.observaciones,
        emplazamiento_valor: datos.emplazamiento_valor,
        emplazamiento_tipo: datos.emplazamiento_tipo,
        datos_formulario: datos.datos_formulario,
      });

      setActaId(response.data.id);
      return response.data.id;
    } catch (err) {
      console.error('Error creando acta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const guardarFotos = async (urls) => {
    setDatos(prev => ({ ...prev, fotos_urls: urls }));
    if (actaId) {
      await actasAPI.update(actaId, { fotos_urls: urls });
    }
  };

  const handleFirmaInspector = (firma) => {
    setDatos(prev => ({ ...prev, firma_inspector_base64: firma }));
  };

  const handleFirmaResponsable = (firma) => {
    setDatos(prev => ({ ...prev, firma_responsable_base64: firma }));
  };

  const validarActa = () => {
    const errores = [];

    if (!datos.establecimiento_nombre?.trim()) {
      errores.push('Nombre del establecimiento');
    }
    if (!datos.responsable_nombre?.trim()) {
      errores.push('Responsable del establecimiento');
    }
    if (!datos.firma_inspector_base64) {
      errores.push('Firma del inspector');
    }
    if (!datos.firma_responsable_base64) {
      errores.push('Firma del responsable');
    }
    if (!datos.emplazamiento_valor || datos.emplazamiento_valor <= 0) {
      errores.push('Plazo de emplazamiento');
    }
    if (!datos.emplazamiento_tipo) {
      errores.push('Tipo de plazo (días u horas)');
    }

    return errores;
  };

  const generarPDF = async () => {
    const errores = validarActa();
    if (errores.length > 0) {
      setErrorModal(errores);
      return;
    }

    try {
      setLoading(true);
      setErrorModal(null);

      // actaId puede ser null si el acta nunca se guardó como borrador antes de llegar acá.
      // crearActa() actualiza el estado pero React no lo refleja en el mismo ciclo,
      // por eso capturamos el ID del retorno directamente.
      const idParaUsar = actaId || (await crearActa());

      await actasAPI.update(idParaUsar, {
        datos_formulario: datos.datos_formulario,
        observaciones: datos.observaciones,
        emplazamiento_valor: datos.emplazamiento_valor,
        emplazamiento_tipo: datos.emplazamiento_tipo,
        firma_inspector_base64: datos.firma_inspector_base64,
        firma_responsable_base64: datos.firma_responsable_base64,
        fotos_urls: datos.fotos_urls,
      });

      const pdfResponse = datos.tipologia === 'notificacion'
        ? await pdfAPI.generarNotificacion(idParaUsar)
        : await pdfAPI.generarActa(idParaUsar);

      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva pestaña (más confiable en Android que a.click())
      window.open(url, '_blank');
      // No revocar inmediatamente para que el browser pueda usarlo
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);

      navigate(`/acta/${idParaUsar}`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          alert(`Error del servidor: ${json.error || text}`);
        } catch {
          alert(`Error del servidor: ${text}`);
        }
      } else {
        alert(`Error al generar el PDF: ${err.message || ''}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Si la tipología tiene selector de secciones y ya hay seleccionadas, usarlas.
  // Si no hay seleccionadas aún (o no tiene selector), usar las de constants.
  const secciones = (() => {
    if (TIPOLOGIAS_CON_SELECTOR.includes(datos.tipologia) && seccionesSeleccionadas.length > 0) {
      return seccionesSeleccionadas;
    }
    return SECCIONES_POR_TIPOLOGIA[datos.tipologia] || ['conclusion_inspeccion'];
  })();

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
              {errorModal.map((error, index) => (
                <li key={index} className="flex items-center gap-2 text-red-600">
                  <span>•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setErrorModal(null)}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate('/')} className="text-blue-200 hover:text-white mb-2">
            ← Volver
          </button>
          <h1 className="text-xl font-bold">Nueva Acta de Inspección</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="flex justify-between mb-6 overflow-x-auto pb-2">
          {PASOS.filter(p => {
              // Para notificación, ocultar pasos 4 (secciones) y 5 (formulario)
              if (datos.tipologia === 'notificacion' && (p.id === 4 || p.id === 5)) return false;
              return true;
            }).map((p) => (
            <button
              key={p.id}
              onClick={() => p.id <= paso && setPaso(p.id)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex-shrink-0 ${
                p.id === paso
                  ? 'bg-blue-600 text-white'
                  : p.id < paso
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {p.id}. {p.label}
            </button>
          ))}
        </div>

        <div className="card">
          {paso === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Datos del Establecimiento</h2>
              
              <div className="mb-4">
                <label className="label-field">Tipología</label>
                <select
                  value={datos.tipologia}
                  onChange={(e) => setDatos(prev => ({ ...prev, tipologia: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Seleccionar tipología</option>
                  {TIPOLOGIAS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="label-field">Expediente</label>
                <input
                  type="text"
                  value={datos.expediente}
                  onChange={(e) => setDatos(prev => ({ ...prev, expediente: e.target.value }))}
                  className="input-field"
                  placeholder="Ej: 2024-001234"
                />
              </div>


              <div className="mb-4">
                <label className="label-field">Nombre del Establecimiento *</label>
                <input
                  type="text"
                  value={datos.establecimiento_nombre}
                  onChange={(e) => setDatos(prev => ({ ...prev, establecimiento_nombre: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label-field">Dirección</label>
                <input
                  type="text"
                  value={datos.establecimiento_direccion}
                  onChange={(e) => setDatos(prev => ({ ...prev, establecimiento_direccion: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="label-field">Localidad</label>
                <input
                  type="text"
                  value={datos.establecimiento_localidad}
                  onChange={(e) => setDatos(prev => ({ ...prev, establecimiento_localidad: e.target.value }))}
                  className="input-field"
                />
              </div>

              <button
                onClick={() => datos.tipologia && datos.establecimiento_nombre && setPaso(2)}
                disabled={!datos.tipologia || !datos.establecimiento_nombre}
                className="btn-primary disabled:opacity-50"
              >
                Siguiente →
              </button>
            </div>
          )}

          {paso === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Datos del Responsable</h2>
              
              <div className="mb-4">
                <label className="label-field">Nombre y Apellido *</label>
                <input
                  type="text"
                  value={datos.responsable_nombre}
                  onChange={(e) => setDatos(prev => ({ ...prev, responsable_nombre: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="label-field">DNI</label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={datos.responsable_dni}
                  onChange={(e) => setDatos(prev => ({ ...prev, responsable_dni: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="label-field">Carácter</label>
                <input
                  type="text"
                  value={datos.responsable_caracter}
                  onChange={(e) => setDatos(prev => ({ ...prev, responsable_caracter: e.target.value }))}
                  className="input-field"
                  placeholder="Ej: Director Técnico, Propietario, etc."
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setPaso(1)} className="btn-secondary">
                  ← Anterior
                </button>
                <button
                  onClick={() => datos.responsable_nombre && setPaso(3)}
                  disabled={!datos.responsable_nombre}
                  className="btn-primary disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Tipo de Inspección</h2>
              
              <div className="mb-4">
                <label className="label-field">Fecha</label>
                <input
                  type="date"
                  value={datos.fecha}
                  onChange={(e) => setDatos(prev => ({ ...prev, fecha: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="label-field">Hora</label>
                <input
                  type="time"
                  value={datos.hora}
                  onChange={(e) => setDatos(prev => ({ ...prev, hora: e.target.value }))}
                  className="input-field"
                />
              </div>

              <div className="mb-4">
                <label className="label-field">Tipo de Inspección</label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer flex-1 ${datos.presencial ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={datos.presencial}
                      onChange={(e) => setDatos(prev => ({ ...prev, presencial: e.target.checked }))}
                      className="w-6 h-6"
                    />
                    <span>Presencial</span>
                  </label>
                  <label className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer flex-1 ${datos.virtual ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                    <input
                      type="checkbox"
                      checked={datos.virtual}
                      onChange={(e) => setDatos(prev => ({ ...prev, virtual: e.target.checked }))}
                      className="w-6 h-6"
                    />
                    <span>Virtual</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setPaso(2)} className="btn-secondary">
                  ← Anterior
                </button>
                <button onClick={() => {
                  if (datos.tipologia === 'notificacion') {
                    // Notificación: sin secciones, ir a paso 5 para observaciones/emplazamiento
                    setPaso(5);
                  } else if (TIPOLOGIAS_CON_SELECTOR.includes(datos.tipologia)) {
                    if (seccionesSeleccionadas.length === 0) {
                      setSeccionesSeleccionadas(SECCIONES_BASE[datos.tipologia] || []);
                    }
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

          {paso === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-2">Secciones a Inspeccionar</h2>
              <p className="text-gray-500 text-sm mb-4">
                Seleccioná las áreas que vas a inspeccionar en esta visita.
                Las secciones base siempre están incluidas.
              </p>

              {/* Secciones base — siempre presentes */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-700 mb-2">Siempre incluidas:</p>
                <div className="flex flex-wrap gap-2">
                  {(SECCIONES_BASE[datos.tipologia] || []).map(s => (
                    <span key={s} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {SECCION_LABELS[s] || s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Secciones opcionales */}
              <div className="space-y-2">
                {(SECCIONES_OPCIONALES[datos.tipologia] || []).map(({ key, label }) => {
                  const seleccionada = seccionesSeleccionadas.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (seleccionada) {
                          setSeccionesSeleccionadas(prev => prev.filter(s => s !== key));
                        } else {
                          // Insertar en el orden correcto (base primero, luego opcionales en orden)
                          const base = SECCIONES_BASE[datos.tipologia] || [];
                          const opcionales = (SECCIONES_OPCIONALES[datos.tipologia] || []).map(o => o.key);
                          const nuevas = [...base, ...opcionales.filter(k =>
                            k === key || (seccionesSeleccionadas.includes(k) && !base.includes(k))
                          )];
                          setSeccionesSeleccionadas(nuevas);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors text-left ${
                        seleccionada
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="font-medium">{label}</span>
                      <span className={`text-2xl font-bold ${seleccionada ? 'text-green-500' : 'text-gray-300'}`}>
                        {seleccionada ? '✓' : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-6">
                <button onClick={() => setPaso(3)} className="btn-secondary">
                  ← Anterior
                </button>
                <button onClick={() => setPaso(5)} className="btn-primary">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {paso === 5 && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                {datos.tipologia === 'notificacion' ? 'Observaciones y Emplazamiento' : 'Formulario de Inspección'}
              </h2>

              {datos.tipologia !== 'notificacion' && secciones.map((seccion) => (
                <SeccionDinamica
                  key={seccion}
                  tipo={seccion}
                  datos={datos.datos_formulario}
                  onChange={(seccionDatos) => {
                    setDatos(prev => ({
                      ...prev,
                      datos_formulario: { ...prev.datos_formulario, ...seccionDatos }
                    }));
                  }}
                />
              ))}

              <div className="mb-4 mt-6">
                <label className="label-field">Observaciones</label>
                <textarea
                  value={datos.observaciones}
                  onChange={(e) => setDatos(prev => ({ ...prev, observaciones: e.target.value }))}
                  className="input-field h-32"
                  placeholder="Ingrese sus observaciones..."
                />
              </div>

              <div className="mb-4">
                <label className="label-field font-semibold">Plazo de Emplazamiento *</label>
                <div className="flex gap-3 mt-2">
                  <input
                    type="number"
                    value={datos.emplazamiento_valor}
                    onChange={(e) => setDatos(prev => ({ ...prev, emplazamiento_valor: parseInt(e.target.value) || 0 }))}
                    className="input-field w-24"
                    min="1"
                    required
                  />
                  <div className="flex gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => setDatos(prev => ({ ...prev, emplazamiento_tipo: 'HORAS' }))}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                        datos.emplazamiento_tipo === 'HORAS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      HORAS
                    </button>
                    <button
                      type="button"
                      onClick={() => setDatos(prev => ({ ...prev, emplazamiento_tipo: 'DÍAS' }))}
                      className={`flex-1 py-3 px-4 rounded-lg font-semibold text-lg transition-colors ${
                        datos.emplazamiento_tipo === 'DÍAS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      DÍAS
                    </button>
                  </div>
                </div>
                {datos.emplazamiento_valor > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Ejemplo: {datos.emplazamiento_valor} {datos.emplazamiento_tipo}
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => {
                  if (TIPOLOGIAS_CON_SELECTOR.includes(datos.tipologia)) setPaso(4);
                  else setPaso(3);
                }} className="btn-secondary">
                  ← Anterior
                </button>
                <button onClick={() => setPaso(6)} className="btn-primary">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {paso === 6 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Fotos de la Inspección</h2>
              
              <SubidaFotos onFotosChange={guardarFotos} />

              <div className="flex gap-4 mt-6">
                <button onClick={() => setPaso(5)} className="btn-secondary">
                  ← Anterior
                </button>
                <button onClick={() => setPaso(7)} className="btn-primary">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {paso === 7 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Firmas</h2>
              
              <div className="mb-8">
                <FirmaCanvas
                  onFirma={handleFirmaInspector}
                  label="Firma del Inspector *"
                />
                {datos.firma_inspector_base64 && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firmado</span>
                )}
              </div>

              <div className="mb-8">
                <FirmaCanvas
                  onFirma={handleFirmaResponsable}
                  label="Firma del Responsable *"
                />
                {datos.firma_responsable_base64 && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firmado</span>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setPaso(6)} className="btn-secondary">
                  ← Anterior
                </button>
                <button
                  onClick={generarPDF}
                  disabled={loading}
                  className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 px-8 py-4 text-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generando...
                    </span>
                  ) : (
                    'Generar Acta PDF'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}