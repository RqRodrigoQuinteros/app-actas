import { useEffect, useRef } from 'react';
import SignaturePad from 'signature_pad';

export default function FirmaCanvas({ onFirma, label }) {
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

  const guardar = () => {
    if (padRef.current.isEmpty()) {
      alert('Por favor firme antes de confirmar');
      return;
    }
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
          className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg active:bg-gray-300"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={guardar}
          className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg active:bg-blue-700"
        >
          Confirmar Firma
        </button>
      </div>
    </div>
  );
}
