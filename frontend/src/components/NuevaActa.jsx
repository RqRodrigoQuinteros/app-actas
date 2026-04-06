import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI } from '../utils/api';
import { TIPOLOGIAS, SECCIONES_POR_TIPOLOGIA, SECCION_LABELS } from '../utils/constants';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';
import SeccionDinamica from './SeccionDinamica';

const PASOS = [
  { id: 1, label: 'Establecimiento' },
  { id: 2, label: 'Responsable' },
  { id: 3, label: 'Tipo Inspección' },
  { id: 4, label: 'Formulario' },
  { id: 5, label: 'Fotos' },
  { id: 6, label: 'Firmas' },
];

export default function NuevaActa() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actaId, setActaId] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

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

  const decodeBase64Pdf = (base64) => {
    const cleaned = typeof base64 === 'string'
      ? base64.replace(/[^A-Za-z0-9+/=]/g, '')
      : '';
    return Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
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

      if (!actaId) {
        await crearActa();
      }

      await actasAPI.update(actaId, {
        datos_formulario: datos.datos_formulario,
        observaciones: datos.observaciones,
        emplazamiento_valor: datos.emplazamiento_valor,
        emplazamiento_tipo: datos.emplazamiento_tipo,
        firma_inspector_base64: datos.firma_inspector_base64,
        firma_responsable_base64: datos.firma_responsable_base64,
        fotos_urls: datos.fotos_urls,
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/pdf/generar/${actaId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (data.pdfBuffer) {
        const blob = decodeBase64Pdf(data.pdfBuffer);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const nombreArchivo = `Acta ${datos.establecimiento_nombre || 'SinNombre'}${datos.expediente ? ' - ' + datos.expediente : ''}.pdf`;
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      navigate(`/acta/${actaId}`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF');
    } finally {
      setLoading(false);
    }
  };

  const secciones = SECCIONES_POR_TIPOLOGIA[datos.tipologia] || ['conclusion'];

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
          {PASOS.map((p) => (
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
                  type="text"
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
                <button onClick={() => setPaso(4)} className="btn-primary">
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {paso === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Formulario de Inspección</h2>
              
              {secciones.map((seccion) => (
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
              <h2 className="text-xl font-bold mb-4">Fotos de la Inspección</h2>
              
              <SubidaFotos onFotosChange={guardarFotos} />

              <div className="flex gap-4 mt-6">
                <button onClick={() => setPaso(4)} className="btn-secondary">
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
                <button onClick={() => setPaso(5)} className="btn-secondary">
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
