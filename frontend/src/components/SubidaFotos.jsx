import { useState, useRef } from 'react';
import { fotosAPI } from '../utils/api';

/**
 * SubidaFotos
 * Props:
 *  - onFotosChange(urls: string[])  – callback cuando cambia la lista de URLs
 *  - initialUrls?: string[]         – URLs ya guardadas (para modo edición)
 */
export default function SubidaFotos({ onFotosChange, initialUrls = [] }) {
  const [previews, setPreviews] = useState(initialUrls);
  const [uploading, setUploading] = useState(false);

  // Dos refs: uno abre galería, el otro abre cámara directamente
  const inputGaleriaRef = useRef();
  const inputCamaraRef = useRef();

  const subirArchivos = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const response = await fotosAPI.subir(Array.from(files));
      const newUrls = response.data.urls;
      const allUrls = [...previews, ...newUrls];
      setPreviews(allUrls);
      onFotosChange(allUrls);
    } catch (err) {
      console.error('Error subiendo fotos:', err);
      alert('Error al subir las fotos. Intentá de nuevo.');
    } finally {
      setUploading(false);
      // Limpiar el input para que el mismo archivo pueda re-seleccionarse si fuera necesario
      if (inputGaleriaRef.current) inputGaleriaRef.current.value = '';
      if (inputCamaraRef.current) inputCamaraRef.current.value = '';
    }
  };

  const eliminarFoto = (index) => {
    if (uploading) return;
    const newUrls = previews.filter((_, i) => i !== index);
    setPreviews(newUrls);
    onFotosChange(newUrls);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Botones de acción */}
      <div className="grid grid-cols-2 gap-3">

        {/* Abrir galería / explorador de archivos */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputGaleriaRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-colors ${
            uploading
              ? 'border-blue-300 bg-blue-50 opacity-60 cursor-not-allowed'
              : 'border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
          }`}
        >
          <span className="text-3xl mb-1">🖼️</span>
          <span className="text-sm font-semibold text-gray-700">Galería</span>
          <span className="text-xs text-gray-400">Elegir de fotos</span>
        </button>

        {/* Abrir cámara directamente (capture=environment = cámara trasera) */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputCamaraRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-colors ${
            uploading
              ? 'border-blue-300 bg-blue-50 opacity-60 cursor-not-allowed'
              : 'border-blue-400 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 cursor-pointer'
          }`}
        >
          <span className="text-3xl mb-1">📷</span>
          <span className="text-sm font-semibold text-blue-700">Cámara</span>
          <span className="text-xs text-blue-400">Sacar foto ahora</span>
        </button>
      </div>

      {/* Inputs ocultos — separados para evitar el bug de iOS con label+hidden */}
      <input
        ref={inputGaleriaRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => subirArchivos(e.target.files)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <input
        ref={inputCamaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => subirArchivos(e.target.files)}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Indicador de carga */}
      {uploading && (
        <div className="flex items-center justify-center gap-3 py-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <span className="text-blue-700 font-medium">Subiendo fotos...</span>
        </div>
      )}

      {/* Grilla de previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => eliminarFoto(index)}
                disabled={uploading}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md hover:bg-red-600 disabled:opacity-50"
              >
                ×
              </button>
              <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        {previews.length === 0
          ? 'Sin fotos agregadas'
          : `${previews.length} foto${previews.length !== 1 ? 's' : ''} agregada${previews.length !== 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
