import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, pdfAPI } from '../utils/api';
import { SECCION_LABELS, SECCIONES_POR_TIPOLOGIA } from '../utils/constants';
import { CAMPOS_POR_SECCION } from './SeccionDinamica';

export default function VerActa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [acta, setActa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [actualizandoCidi, setActualizandoCidi] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  useEffect(() => {
    loadActa();
  }, [id]);

  const loadActa = async () => {
    try {
      const response = await actasAPI.getById(id);
      setActa(response.data);
      console.log('Acta cargada:', response.data);
      console.log('Firmas:', {
        firma_inspector: response.data.firma_inspector_base64?.substring(0, 50),
        firma_responsable: response.data.firma_responsable_base64?.substring(0, 50)
      });
      console.log('Fotos:', response.data.fotos_urls);
    } catch (err) {
      console.error('Error cargando acta:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarPDF = async () => {
    try {
      setGenerandoPDF(true);
      setPdfBase64(null);
      setPdfBlobUrl(null);
      
      const esNotificacion = acta.establecimiento_tipologia === 'notificacion';
      console.log('[VerActa] Generando PDF, tipologia:', acta.establecimiento_tipologia);
      
      // Intentar método base64 primero (más confiable en Android)
      try {
        console.log('[VerActa] Intentando método base64...');
        const response = await pdfAPI.generarActaBase64(id);
        if (response.data?.pdfBuffer) {
          console.log('[VerActa] Base64 recibido, decodificando...');
          const base64 = response.data.pdfBuffer;
          
          // Método más robusto usando Uint8Array desde un ArrayBuffer
          let bytes;
          try {
            // Método 1: atob estándar
            const binaryString = atob(base64);
            bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
          } catch (atobErr) {
            // Método 2: si falla atob, usar Blob + ArrayBuffer (más兼容)
            console.log('[VerActa] atob falló, usando método alternativo');
            const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
            bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
          }
          
          const blob = new Blob([bytes], { type: 'application/pdf' });
          if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
          const url = window.URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          setPdfBase64(base64);
          console.log('[VerActa] PDF creado exitosamente');
          window.open(url, '_blank');
          loadActa();
          setGenerandoPDF(false);
          return;
        }
      } catch (base64Err) {
        console.warn('[VerActa] Método base64 falló, tentando blob:', base64Err.message);
      }

      // Fallback al método blob original
      console.log('[VerActa] Usando método blob como fallback...');
      const response = esNotificacion
        ? await pdfAPI.generarNotificacion(id)
        : await pdfAPI.generarActa(id);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
      const url = window.URL.createObjectURL(blob);
      setPdfBlobUrl(url);

      window.open(url, '_blank');
      loadActa();
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
      setGenerandoPDF(false);
    }
  };

  const toggleCidi = async () => {
    try {
      setActualizandoCidi(true);
      await actasAPI.toggleCidi(id);
      loadActa();
    } catch (err) {
      console.error('Error actualizando CIDI:', err);
      alert('Error al actualizar estado CIDI');
    } finally {
      setActualizandoCidi(false);
    }
  };

  const getValorClass = (valor) => {
    return valor ? 'text-black' : 'text-red-600 font-bold';
  };

  const getValorTexto = (valor) => {
    return valor ? 'SI' : 'NO';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  if (!acta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl mb-4">Acta no encontrada</p>
        <Link to="/" className="text-blue-600 hover:underline">Volver al inicio</Link>
      </div>
    );
  }

  const secciones = SECCIONES_POR_TIPOLOGIA[acta.establecimiento_tipologia] || ['conclusion'];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-blue-200 hover:text-white">
            ← Volver
          </button>
          <h1 className="text-xl font-bold">Ver Acta</h1>
          <div />
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <div className="card mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold">{acta.establecimiento_nombre || acta.establecimiento?.nombre}</h2>
              <p className="text-gray-600">
                {acta.establecimiento_direccion || acta.establecimiento?.direccion}, {acta.establecimiento_localidad || acta.establecimiento?.localidad}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              acta.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
              acta.estado === 'firmado' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {acta.estado.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Expediente:</span>
              <span className="ml-2 font-semibold">{acta.expediente || '-'}</span>
            </div>
            <div>
              <span className="text-gray-500">Fecha:</span>
              <span className="ml-2 font-semibold">{acta.fecha}</span>
            </div>
            <div>
              <span className="text-gray-500">Hora:</span>
              <span className="ml-2 font-semibold">{acta.hora}</span>
            </div>
            <div>
              <span className="text-gray-500">Tipo:</span>
              <span className="ml-2 font-semibold">
                {acta.virtual && 'Virtual'}{acta.virtual && acta.presencial && ' / '}{acta.presencial && 'Presencial'}
              </span>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="font-bold text-lg mb-3">Responsable</h3>
          <p><strong>Nombre:</strong> {acta.responsable_nombre}</p>
          <p><strong>DNI:</strong> {acta.responsable_dni}</p>
          <p><strong>Carácter:</strong> {acta.responsable_caracter}</p>
        </div>

        {secciones.map((seccion) => {
          const campos = CAMPOS_POR_SECCION[seccion] || [];
          const camposConValor = campos.filter(campo => {
            const valor = acta.datos_formulario?.[campo.key];
            return valor !== undefined && valor !== null && valor !== '';
          });
          if (camposConValor.length === 0) return null;
          return (
            <div key={seccion} className="card mb-4">
              <h3 className="font-bold text-lg mb-3 uppercase bg-gray-100 p-2 -mx-4 -mt-4 rounded-t-lg">
                {SECCION_LABELS[seccion] || seccion}
              </h3>
              <div className="space-y-2">
                {camposConValor.map((campo) => {
                  const valor = acta.datos_formulario[campo.key];
                  return (
                    <div key={campo.key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{campo.label}</span>
                      {typeof valor === 'boolean' ? (
                        <span className={getValorClass(valor)}>{getValorTexto(valor)}</span>
                      ) : (
                        <span className="font-medium text-sm">{valor}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {acta.observaciones && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-2">Observaciones</h3>
            <p className="whitespace-pre-wrap">{acta.observaciones}</p>
          </div>
        )}

        <div className="card mb-4">
          <p className="uppercase font-semibold">
            SE EMPLAZA POR EL TÉRMINO DE <strong>{acta.emplazamiento_dias} {acta.emplazamiento_dias > 1 ? 'DÍAS' : 'DÍA'}</strong>
          </p>
        </div>

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

        {acta.fotos_urls && acta.fotos_urls.length > 0 && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-3">Fotos ({acta.fotos_urls.length})</h3>
            <div className="grid grid-cols-2 gap-2">
              {acta.fotos_urls.map((url, index) => (
                <img key={index} src={url} alt={`Foto ${index + 1}`} className="w-full h-32 object-cover rounded" />
              ))}
            </div>
          </div>
        )}

        {acta.pdf_url && (
          <div className="card mb-4">
            <h3 className="font-bold text-lg mb-2">PDF Generado</h3>
            <a href={acta.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              Ver PDF en Google Drive →
            </a>
          </div>
        )}

        <div className="card mb-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Estado CIDI</h3>
              <p className="text-sm text-gray-600">
                Marcar cuando el acta haya sido cargada en el sistema CIDI
              </p>
            </div>
            <button
              onClick={toggleCidi}
              disabled={actualizandoCidi}
              className={`px-6 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2 ${
                acta.subido_cidi
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              } disabled:opacity-50`}
            >
              {actualizandoCidi ? (
                <span>Actualizando...</span>
              ) : acta.subido_cidi ? (
                <>
                  <span className="text-xl">✓</span>
                  <span>CARGADO EN CIDI</span>
                </>
              ) : (
                <>
                  <span className="text-xl">○</span>
                  <span>MARCAR CARGADO</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={generarPDF}
            disabled={generandoPDF}
            className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {generandoPDF ? 'Generando PDF...' : 'Generar/Actualizar PDF'}
          </button>
          {pdfBlobUrl && (
            <a
              href={pdfBlobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Ver PDF en nueva pestaña →
            </a>
          )}
        </div>

        {/* Visor de PDF inline */}
        {pdfBlobUrl && (
          <div className="card mt-4">
            <h3 className="font-bold text-lg mb-3">Vista previa del PDF</h3>
            <iframe
              src={pdfBlobUrl}
              className="w-full h-[600px] border rounded"
              title="Vista previa PDF"
            />
          </div>
        )}
      </main>
    </div>
  );
}
