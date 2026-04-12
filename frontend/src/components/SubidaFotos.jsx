import { useState, useRef } from 'react';
import { fotosAPI } from '../utils/api';

export default function SubidaFotos({ onFotosChange }) {
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [files, setFiles] = useState([]);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const response = await fotosAPI.subir(selectedFiles);
      const newUrls = response.data.urls;

      const allUrls = [...previews, ...newUrls];
      setPreviews(allUrls);
      setFiles(prev => [...prev, ...selectedFiles]);
      onFotosChange(allUrls);
    } catch (err) {
      console.error('Error subiendo fotos:', err);
      alert('Error al subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  const eliminarFoto = (index) => {
    if (uploading) return; // No permitir eliminar mientras se suben fotos
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
    const newUrls = previews.filter((_, i) => i !== index);
    onFotosChange(newUrls);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
        uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-400 bg-gray-50 hover:bg-gray-100'
      }`}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <p className="text-lg text-blue-600">Subiendo fotos...</p>
            </>
          ) : (
            <>
              <span className="text-4xl text-gray-400 mb-2">📷</span>
              <p className="text-lg text-gray-600">Tocar para agregar fotos</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => eliminarFoto(index)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md"
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
        {previews.length} foto(s) agregada(s)
      </p>
    </div>
  );
}