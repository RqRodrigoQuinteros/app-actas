import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI, templatesAPI } from '../utils/api';

export default function VerActa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [acta, setActa] = useState(null);
  const [respuestas, setRespuestas] = useState([]); // [{ valor, campo: { etiqueta, tipo, token } }]
  const [loading, setLoading] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [actualizandoCidi, setActualizandoCidi] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

  useEffect(() => { loadActa(); }, [id]);

  const loadActa = async () => {
    try {
      const [actaRes, respuestasRes] = await Promise.all([
        actasAPI.getById(id),
        templatesAPI.getRespuestas(id).catch(() => ({ data: [] })),
      ]);
      setActa(actaRes.data);
      setRespuestas(respuestasRes.data || []);
    } catch (err) {
      console.error('Error cargando acta:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = async () => {
    try {
      setGenerandoPDF(true);
      setPdfBlobUrl(null);

      try {
        const response = await pdfAPI.generarActaBase64(id);
        if (response.data?.pdfBuffer) {
          const base64 = response.data.pdfBuffer;
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          window.open(url, '_blank');
          loadActa();
          return;
        }
      } catch {
        const response = await pdfAPI.generarActa(id);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        window.open(url, '_blank');
        loadActa();
      }
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert(`Error al generar el PDF: ${err.response?.data?.error || err.message || ''}`);
    } finally {
      setGenerandoPDF(false);
    }
  };

  const toggleCidi = async () => {
    try {
      setActualizandoCidi(true);
      await actasAPI.toggleCidi(id);
      loadActa();
    } catch (err) {
      alert('Error al actualizar estado CIDI');
    } finally {
      setActualizandoCidi(false);
    }
  };

  // Agrupar respuestas por sección
  const respuestasPorSeccion = () => {
    const mapa = {};
    for (const r of respuestas) {
      if (!r.campo) continue;
      const seccionTitulo = r.campo?.seccion?.titulo || 'General';
      if (!mapa[seccionTitulo]) mapa[seccionTitulo] = [];
      mapa[seccionTitulo].push(r);
    }
    return mapa;
  };

  const renderValor = (r) => {
    if (r.campo.tipo === 'si_no') {
      return (
        <span className={r.valor === 'SI' ? 'text-black font-semibold' : 'text-red-600 font-bold'}>
          {r.valor || '-'}
        </span>
      );
    }
    if (r.campo.tipo === 'check') {
      return <span>{r.valor === 'true' ? '✓' : '✗'}</span>;
    }
    return <span className="font-medium text-sm">{r.valor || '-'}</span>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl">Cargando...</p></div>;
  }

  if (!acta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Acta no encontrada</p>
        <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const seccionesAgrupadas = respuestasPorSeccion();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-blue-200 hover:text-white">← Volver</button>
          <h1 className="text-xl font-bold">Ver Acta</h1>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">

        {/* Datos del establecimiento */}
        <div className="card mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{acta.establecimiento_nombre}</h2>
              <p className="text-gray-600">{acta.establecimiento_direccion}, {acta.establecimiento_localidad}</p>
              <p className="text-sm text-gray-500 mt-1">{acta.establecimiento_tipologia}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              acta.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
              acta.estado === 'firmado' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {acta.estado?.toUpperCase()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Expediente:</span> <span className="font-semibold">{acta.expediente || '-'}</span></div>
            <div><span className="text-gray-500">Fecha:</span> <span className="font-semibold">{acta.fecha}</span></div>
            <div><span className="text-gray-500">Hora:</span> <span className="font-semibold">{acta.hora}</span></div>
            <div><span className="text-gray-500">Modalidad:</span> <span className="font-semibold">
              {acta.virtual && 'Virtual'}{acta.virtual && acta.presencial && ' / '}{acta.presencial && 'Presencial'}
            </span></div>
            <div><span className="text-gray-500">Tipo:</span> <span className="font-semibold">{acta.tipo_inspeccion}</span></div>
            {acta.datos_formulario?.en_funcionamiento && (
              <div className="col-span-2">
                <span className="text-gray-500">En Funcionamiento:</span>{' '}
                <span className={`font-bold ${acta.datos_formulario.en_funcionamiento === 'SI' ? 'text-green-600' : 'text-red-600'}`}>
                  {acta.datos_formulario.en_funcionamiento}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Responsable */}
        <div className="card mb-4">
          <h3 className="font-bold text-lg mb-3">Responsable</h3>
          <p><strong>Nombre:</strong> {acta.responsable_nombre}</p>
          <p><strong>DNI:</strong> {acta.responsable_dni}</p>
          <p><strong>Carácter:</strong> {acta.responsable_caracter}</p>
        </div>

        {/* Respuestas dinámicas agrupadas por sección */}
        {Object.keys(seccionesAgrupadas).length > 0 ? (
          Object.entries(seccionesAgrupadas).map(([titulo, items]) => (
            <div key={titulo} className="card mb-4">
              <h3 className="font-bold text-lg mb-3 uppercase bg-gray-100 p-2 -mx-4 -mt-4 rounded-t-lg">
                {titulo}
              </h3>
              <div className="space-y-2">
                {items.map(r => (
                  <div key={r.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{r.campo.etiqueta}</span>
                    {renderValor(r)}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          respuestas.length === 0 && (
            <div className="card mb-4 text-gray-500 text-sm">
              Sin respuestas registradas para esta acta.
            </div>
          )
        )}

        {/* Testigos (geriátrico no en funcionamiento) */}
        {(acta.datos_formulario?.testigos || []).length > 0 && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-3 uppercase bg-red-50 p-2 -mx-4 -mt-4 rounded-t-lg text-red-800">
              Testigos
            </h3>
            {acta.datos_formulario.testigos.map((t, i) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold text-sm mb-1">Testigo #{i + 1}</p>
                {t.nombre && <p className="text-sm"><strong>Nombre:</strong> {t.nombre}</p>}
                {t.dni && <p className="text-sm"><strong>DNI:</strong> {t.dni}</p>}
                {t.domicilio && <p className="text-sm"><strong>Domicilio:</strong> {t.domicilio}</p>}
                {t.testimonio && <p className="text-sm mt-1 italic text-gray-600">"{t.testimonio}"</p>}
              </div>
            ))}
          </div>
        )}

        {/* Residentes */}
        {(acta.datos_formulario?.residentes || []).length > 0 && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-3 uppercase bg-purple-50 p-2 -mx-4 -mt-4 rounded-t-lg text-purple-800">
              Residentes
            </h3>
            {acta.datos_formulario.residentes.map((r, i) => (
              <div key={i} className="mb-3 p-3 bg-gray-50 rounded-lg border">
                <p className="font-semibold text-sm mb-1">Residente #{i + 1}</p>
                {r.nombre && <p className="text-sm"><strong>Nombre:</strong> {r.nombre}</p>}
                {r.dni && <p className="text-sm"><strong>DNI:</strong> {r.dni}</p>}
                {r.domicilio && <p className="text-sm"><strong>Domicilio:</strong> {r.domicilio}</p>}
                {(r.familiar_nombre || r.familiar_dni || r.familiar_telefono) && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Familiar Responsable</p>
                    {r.familiar_nombre && <p className="text-sm"><strong>Nombre:</strong> {r.familiar_nombre}</p>}
                    {r.familiar_dni && <p className="text-sm"><strong>DNI:</strong> {r.familiar_dni}</p>}
                    {r.familiar_telefono && <p className="text-sm"><strong>Tel:</strong> {r.familiar_telefono}</p>}
                    {r.vinculo && <p className="text-sm"><strong>Vínculo:</strong> {r.vinculo}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Observaciones */}
        {acta.observaciones && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-2">Observaciones</h3>
            <p className="whitespace-pre-wrap">{acta.observaciones}</p>
          </div>
        )}

        {/* Emplazamiento */}
        <div className="card mb-4">
          <p className="uppercase font-semibold">
            SE EMPLAZA POR EL TÉRMINO DE <strong>{acta.emplazamiento_valor} {acta.emplazamiento_tipo}</strong>
          </p>
        </div>

        {/* Firmas */}
        {(acta.firma_inspector_base64 || acta.firma_responsable_base64) && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-4">Firmas</h3>
            <div className="flex justify-between">
              <div className="text-center w-1/2">
                {acta.firma_inspector_base64 && (
                  <img src={acta.firma_inspector_base64} alt="Firma Inspector" className="max-h-20 mx-auto" />
                )}
                <p className="font-semibold mt-2">{acta.inspector?.nombre}</p>
                <p className="text-sm text-gray-600">Inspector</p>
              </div>
              <div className="text-center w-1/2">
                {acta.firma_responsable_base64 && (
                  <img src={acta.firma_responsable_base64} alt="Firma Responsable" className="max-h-20 mx-auto" />
                )}
                <p className="font-semibold mt-2">{acta.responsable_nombre}</p>
                <p className="text-sm text-gray-600">Responsable</p>
              </div>
            </div>
          </div>
        )}

        {/* Fotos */}
        {acta.fotos_urls?.length > 0 && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-3">Fotos ({acta.fotos_urls.length})</h3>
            <div className="grid grid-cols-2 gap-2">
              {acta.fotos_urls.map((url, i) => (
                <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-full h-32 object-cover rounded" />
              ))}
            </div>
          </div>
        )}

        {/* CIDI */}
        <div className="card mb-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Estado CIDI</h3>
              <p className="text-sm text-gray-600">Marcar cuando el acta haya sido cargada en CIDI</p>
            </div>
            <button onClick={toggleCidi} disabled={actualizandoCidi}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 ${
                acta.subido_cidi ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              } disabled:opacity-50`}>
              {actualizandoCidi ? 'Actualizando...' : acta.subido_cidi ? '✓ CARGADO EN CIDI' : '○ MARCAR CARGADO'}
            </button>
          </div>
        </div>

        {/* Acciones PDF */}
        <div className="flex flex-col gap-3">
          {/* Botón Editar — solo para el inspector dueño del acta, si no está cerrada */}
          {acta.estado !== 'cerrado' && (usuario?.rol === 'inspector' || usuario?.rol === 'supervisor') && (
            <button
              onClick={() => navigate(`/acta/${id}/editar`)}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-lg transition-colors"
            >
              ✏️ Editar acta
            </button>
          )}

          <button onClick={generarPDF} disabled={generandoPDF}
            className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50">
            {generandoPDF ? 'Generando PDF...' : 'Generar/Actualizar PDF'}
          </button>
          {pdfBlobUrl && (
            <a href={pdfBlobUrl} target="_blank" rel="noopener noreferrer"
              className="block text-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Ver PDF en nueva pestaña →
            </a>
          )}
        </div>

        {pdfBlobUrl && (
          <div className="card mt-4">
            <h3 className="font-bold text-lg mb-3">Vista previa del PDF</h3>
            <iframe src={pdfBlobUrl} className="w-full h-[600px] border rounded" title="Vista previa PDF" />
          </div>
        )}

      </main>
    </div>
  );
}
