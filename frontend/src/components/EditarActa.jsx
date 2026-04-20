import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI, templatesAPI } from '../utils/api';
import FirmaCanvas from './FirmaCanvas';
import SubidaFotos from './SubidaFotos';

/**
 * EditarActa — permite modificar un acta en estado "borrador" o "firmado".
 * Cubre los casos de uso:
 *   1. Corregir datos básicos (establecimiento, responsable, fechas)
 *   2. Agregar / cambiar fotos
 *   3. Agregar / cambiar firmas
 *   4. Regenerar el PDF
 *
 * Las respuestas dinámicas del formulario NO se editan aquí (la lógica
 * de SeccionDinamica requeriría cargar el template completo; si en el futuro
 * se necesita, se puede extender este componente).
 */
export default function EditarActa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [acta, setActa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [guardadoOk, setGuardadoOk] = useState(false);

  // Campos editables
  const [datos, setDatos] = useState(null);
  const [firmaInspector, setFirmaInspector] = useState('');
  const [firmaResponsable, setFirmaResponsable] = useState('');
  const [fotosUrls, setFotosUrls] = useState([]);

  // Tab activo: 'datos' | 'fotos' | 'firmas'
  const [tab, setTab] = useState('datos');

  useEffect(() => {
    cargarActa();
  }, [id]);

  const cargarActa = async () => {
    try {
      setLoading(true);
      const res = await actasAPI.getById(id);
      const a = res.data;

      // Inspectores solo pueden editar sus propias actas
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
    } catch (err) {
      console.error('Error cargando acta:', err);
      alert('No se pudo cargar el acta.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const guardar = async () => {
    setGuardando(true);
    setGuardadoOk(false);
    try {
      await actasAPI.update(id, {
        ...datos,
        fotos_urls: fotosUrls,
        firma_inspector_base64: firmaInspector,
        firma_responsable_base64: firmaResponsable,
      });
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
      // Refrescar acta local
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
    // Primero guardar los cambios actuales
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
      a.href = url;
      a.download = `acta_${id}.pdf`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
    { id: 'datos', label: '📋 Datos', icon: '📋' },
    { id: 'fotos', label: '📷 Fotos', icon: '📷' },
    { id: 'firmas', label: '✍️ Firmas', icon: '✍️' },
  ];

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
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4">

        {/* Estado del acta */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            acta.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
            acta.estado === 'firmado' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {acta.estado?.toUpperCase()}
          </span>
          <span className="text-gray-500 text-sm">Podés modificar los datos y regenerar el PDF.</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors ${
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

          {/* ── TAB DATOS ─────────────────────────────────────────── */}
          {tab === 'datos' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Datos del Acta</h2>

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Establecimiento
                </legend>

                <div>
                  <label className="label-field">Nombre del Establecimiento *</label>
                  <input
                    className="input-field"
                    value={datos.establecimiento_nombre}
                    onChange={e => setDatos(p => ({ ...p, establecimiento_nombre: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-field">Dirección</label>
                  <input
                    className="input-field"
                    value={datos.establecimiento_direccion}
                    onChange={e => setDatos(p => ({ ...p, establecimiento_direccion: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-field">Localidad</label>
                  <input
                    className="input-field"
                    value={datos.establecimiento_localidad}
                    onChange={e => setDatos(p => ({ ...p, establecimiento_localidad: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-field">Expediente</label>
                  <input
                    className="input-field"
                    value={datos.expediente}
                    onChange={e => setDatos(p => ({ ...p, expediente: e.target.value }))}
                    placeholder="0425-xxxxxx/20xx"
                  />
                </div>
              </fieldset>

              <hr className="border-gray-200" />

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Responsable
                </legend>
                <div>
                  <label className="label-field">Nombre y Apellido *</label>
                  <input
                    className="input-field"
                    value={datos.responsable_nombre}
                    onChange={e => setDatos(p => ({ ...p, responsable_nombre: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-field">DNI</label>
                  <input
                    className="input-field"
                    type="number"
                    inputMode="numeric"
                    value={datos.responsable_dni}
                    onChange={e => setDatos(p => ({ ...p, responsable_dni: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-field">Carácter</label>
                  <input
                    className="input-field"
                    value={datos.responsable_caracter}
                    onChange={e => setDatos(p => ({ ...p, responsable_caracter: e.target.value }))}
                    placeholder="Ej: Director Técnico, Propietario..."
                  />
                </div>
              </fieldset>

              <hr className="border-gray-200" />

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Fecha y Tipo
                </legend>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="label-field">Fecha</label>
                    <input
                      className="input-field"
                      type="date"
                      value={datos.fecha}
                      onChange={e => setDatos(p => ({ ...p, fecha: e.target.value }))}
                    />
                  </div>
                  <div className="w-32">
                    <label className="label-field">Hora</label>
                    <input
                      className="input-field"
                      type="time"
                      value={datos.hora}
                      onChange={e => setDatos(p => ({ ...p, hora: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-field">Modalidad</label>
                  <div className="flex gap-3">
                    {[['presencial', 'Presencial'], ['virtual', 'Virtual']].map(([k, label]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setDatos(p => ({
                          ...p,
                          presencial: k === 'presencial',
                          virtual: k === 'virtual',
                        }))}
                        className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                          (k === 'presencial' ? datos.presencial : datos.virtual)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field">Motivo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['HABILITACION', 'RUTINA', 'DENUNCIA'].map(tipo => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setDatos(p => ({ ...p, tipo_inspeccion: tipo }))}
                        className={`py-3 rounded-lg font-semibold text-sm transition-colors ${
                          datos.tipo_inspeccion === tipo
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>
                </div>
              </fieldset>

              <hr className="border-gray-200" />

              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Observaciones y Emplazamiento
                </legend>
                <div>
                  <label className="label-field">Observaciones</label>
                  <textarea
                    className="input-field h-28"
                    value={datos.observaciones}
                    onChange={e => setDatos(p => ({ ...p, observaciones: e.target.value }))}
                    placeholder="Observaciones..."
                  />
                </div>
                <div>
                  <label className="label-field font-semibold">Plazo de Emplazamiento *</label>
                  <div className="flex gap-3 mt-1">
                    <input
                      type="number"
                      className="input-field w-24"
                      min="1"
                      value={datos.emplazamiento_valor}
                      onChange={e => setDatos(p => ({ ...p, emplazamiento_valor: parseInt(e.target.value) || 0 }))}
                    />
                    <div className="flex gap-2 flex-1">
                      {['HORAS', 'DÍAS'].map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setDatos(p => ({ ...p, emplazamiento_tipo: tipo }))}
                          className={`flex-1 py-3 rounded-lg font-semibold text-lg transition-colors ${
                            datos.emplazamiento_tipo === tipo
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>
            </div>
          )}

          {/* ── TAB FOTOS ─────────────────────────────────────────── */}
          {tab === 'fotos' && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">Fotos de la Inspección</h2>
              <SubidaFotos
                initialUrls={fotosUrls}
                onFotosChange={(urls) => setFotosUrls(urls)}
              />
              <p className="text-xs text-gray-400 mt-3 text-center">
                Los cambios se guardan al tocar "Guardar cambios" o "Generar PDF".
              </p>
            </div>
          )}

          {/* ── TAB FIRMAS ────────────────────────────────────────── */}
          {tab === 'firmas' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800">Firmas</h2>

              <div>
                <p className="label-field mb-2">Firma del Inspector *</p>
                {firmaInspector && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-1">Firma actual:</p>
                    <img
                      src={firmaInspector}
                      alt="Firma inspector actual"
                      className="max-h-16 mx-auto"
                    />
                  </div>
                )}
                <FirmaCanvas
                  onFirma={(f) => setFirmaInspector(f)}
                  label={firmaInspector ? 'Reemplazar firma del Inspector' : 'Firma del Inspector *'}
                />
                {firmaInspector && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firma guardada</span>
                )}
              </div>

              <hr className="border-gray-200" />

              <div>
                <p className="label-field mb-2">Firma del Responsable *</p>
                {firmaResponsable && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <p className="text-xs text-gray-500 mb-1">Firma actual:</p>
                    <img
                      src={firmaResponsable}
                      alt="Firma responsable actual"
                      className="max-h-16 mx-auto"
                    />
                  </div>
                )}
                <FirmaCanvas
                  onFirma={(f) => setFirmaResponsable(f)}
                  label={firmaResponsable ? 'Reemplazar firma del Responsable' : 'Firma del Responsable *'}
                />
                {firmaResponsable && (
                  <span className="text-green-600 text-sm mt-1 inline-block">✓ Firma guardada</span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ── Barra de acciones ─────────────────────────────────── */}
        <div className="mt-4 space-y-3">

          {/* Feedback de guardado */}
          {guardadoOk && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 font-semibold text-sm">
              <span>✓</span> Cambios guardados correctamente
            </div>
          )}

          <button
            onClick={guardar}
            disabled={guardando || generandoPDF}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition-colors"
          >
            {guardando ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Guardando...
              </span>
            ) : '💾 Guardar cambios'}
          </button>

          <button
            onClick={generarPDF}
            disabled={guardando || generandoPDF}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-lg transition-colors"
          >
            {generandoPDF ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span> Generando PDF...
              </span>
            ) : '📄 Guardar y regenerar PDF'}
          </button>

          <button
            onClick={() => navigate(`/acta/${id}`)}
            className="w-full py-3 border border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
}
