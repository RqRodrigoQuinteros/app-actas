import { useState, useRef } from 'react';
import { fotosAPI } from '../utils/api';

/**
 * Comprime una imagen usando Canvas antes de subirla.
 * maxWidth/maxHeight: resolución máxima (1920px por defecto)
 * quality: calidad JPEG (0.82 = buen balance tamaño/calidad)
 */
function comprimirImagen(file, { maxWidth = 1920, maxHeight = 1920, quality = 0.82 } = {}) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Escalar si supera el máximo
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); }; // fallback: original
    img.src = url;
  });
}

/**
 * SubidaFotos
 * Props:
 *  - onFotosChange(urls: string[])
 *  - initialUrls?: string[]  (para modo edición)
 */
export default function SubidaFotos({ onFotosChange, initialUrls = [] }) {
  const [previews, setPreviews] = useState(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [comprimiendo, setComprimiendo] = useState(false);

  const inputGaleriaRef = useRef();
  const inputCamaraRef = useRef();

  const subirArchivos = async (files) => {
    if (!files || files.length === 0) return;

    // 1. Comprimir
    setComprimiendo(true);
    let archivosComprimidos;
    try {
      archivosComprimidos = await Promise.all(
        Array.from(files).map(f => comprimirImagen(f))
      );
    } catch {
      archivosComprimidos = Array.from(files); // fallback sin compresión
    } finally {
      setComprimiendo(false);
    }

    // 2. Subir
    setUploading(true);
    try {
      const response = await fotosAPI.subir(archivosComprimidos);
      const newUrls = response.data.urls;
      const allUrls = [...previews, ...newUrls];
      setPreviews(allUrls);
      onFotosChange(allUrls);
    } catch (err) {
      console.error('Error subiendo fotos:', err);
      const msg = err.response?.data?.error || 'Error al subir las fotos. Intentá de nuevo.';
      alert(msg);
    } finally {
      setUploading(false);
      if (inputGaleriaRef.current) inputGaleriaRef.current.value = '';
      if (inputCamaraRef.current) inputCamaraRef.current.value = '';
    }
  };

  const eliminarFoto = (index) => {
    if (uploading || comprimiendo) return;
    const newUrls = previews.filter((_, i) => i !== index);
    setPreviews(newUrls);
    onFotosChange(newUrls);
  };

  const ocupado = uploading || comprimiendo;

  return (
    <div className="flex flex-col gap-4">

      {/* Botones */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={ocupado}
          onClick={() => inputGaleriaRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-colors ${
            ocupado
              ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
              : 'border-gray-400 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 cursor-pointer'
          }`}
        >
          <span className="text-3xl mb-1">🖼️</span>
          <span className="text-sm font-semibold text-gray-700">Galería</span>
          <span className="text-xs text-gray-400">Elegir de fotos</span>
        </button>

        <button
          type="button"
          disabled={ocupado}
          onClick={() => inputCamaraRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl transition-colors ${
            ocupado
              ? 'border-blue-200 bg-blue-50 opacity-60 cursor-not-allowed'
              : 'border-blue-400 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 cursor-pointer'
          }`}
        >
          <span className="text-3xl mb-1">📷</span>
          <span className="text-sm font-semibold text-blue-700">Cámara</span>
          <span className="text-xs text-blue-400">Sacar foto ahora</span>
        </button>
      </div>

      {/* Inputs ocultos */}
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

      {/* Indicador de estado */}
      {comprimiendo && (
        <div className="flex items-center justify-center gap-3 py-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600" />
          <span className="text-yellow-700 font-medium text-sm">Optimizando imágenes...</span>
        </div>
      )}
      {uploading && !comprimiendo && (
        <div className="flex items-center justify-center gap-3 py-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span className="text-blue-700 font-medium text-sm">Subiendo fotos...</span>
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
                disabled={ocupado}
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
