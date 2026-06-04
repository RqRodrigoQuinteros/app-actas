import { useEffect, useRef, useState } from 'react';
import SignaturePad from 'signature_pad';
import { fotosAPI } from '../utils/api';

export default function FirmaCanvas({ onFirma, label, actaId = null, tipo = null }) {
  const [subiendo, setSubiendo] = useState(false);
  const canvasRef = useRef();
  const padRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 200;

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
    });

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = 200 * ratio;
      canvas.getContext('2d').scale(ratio, ratio);
      padRef.current.clear();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const guardar = async (intentos = 3) => {
    if (padRef.current.isEmpty()) {
      alert('Por favor firme antes de confirmar');
      return;
    }

    const canvas = canvasRef.current;

    // Si tenemos actaId y tipo, subimos la firma al backend/storage
    if (actaId && tipo) {
      setSubiendo(true);
      for (let i = 0; i < intentos; i++) {
        try {
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const file = new File([blob], `${tipo}.png`, { type: 'image/png' });
          const resp = await fotosAPI.firmar(file, actaId, tipo);
          const url = resp.data?.url || resp.data?.path;
          if (!url) throw new Error('No se obtuvo URL de la firma');
          onFirma(url);
          setSubiendo(false);
          return;
        } catch (e) {
          console.error(`Error subiendo firma (intento ${i + 1}/${intentos}):`, e);
          if (i < intentos - 1) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }
      // Fallback: devolver base64 al caller (se guardará por actasAPI.firmar)
      console.warn(`Firma no pudo subirse a storage tras ${intentos} intentos, usando fallback base64`);
      onFirma(padRef.current.toDataURL('image/png'));
      setSubiendo(false);
      return;
    }

    // Sin actaId: devolver base64 al caller (se subirá después)
    onFirma(padRef.current.toDataURL('image/png'));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="font-semibold text-lg">{label}</p>
      <div className="border-2 border-gray-400 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '200px', touchAction: 'none' }}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => padRef.current.clear()}
          disabled={subiendo}
          className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg active:bg-gray-300 disabled:opacity-50"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={subiendo}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg active:bg-blue-700 disabled:opacity-50"
        >
          {subiendo ? 'Subiendo firma...' : 'Confirmar Firma'}
        </button>
      </div>
    </div>
  );
}
