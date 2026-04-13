import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { informesAPI, pdfAPI } from '../utils/api';

export default function InformeArquitecto() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadInformes(); }, []);

  const loadInformes = async () => {
    try {
      const response = await informesAPI.getAll();
      setInformes(response.data);
    } catch (err) {
      console.error('Error cargando informes:', err);
    } finally {
      setLoading(false);
    }
  };

  const decodeBase64Pdf = (base64) => {
    const cleaned = typeof base64 === 'string' ? base64.replace(/[^A-Za-z0-9+/=]/g, '') : '';
    return Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
  };

  const generarPDF = async (informe) => {
    try {
      const response = await pdfAPI.generarInforme(informe.id);
      if (response.data.pdfBuffer) {
        const blob = decodeBase64Pdf(response.data.pdfBuffer);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `Informe ${informe.establecimiento_nombre || 'SinNombre'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      loadInformes();
    } catch (err) {
      console.error('Error generando PDF:', err);
    }
  };

  const editarInforme = (informe) => {
    // Detectar tipo para saber a qué ruta enviar
    const tipo = informe.tipo || informe.datos_formulario?.tipo || 'otro';
    if (tipo === 'geriatrico') {
      navigate(`/informe/geriatricos/${informe.id}`);
    } else {
      // Para futuros tipos o informes genéricos — acá se puede expandir
      alert('Este tipo de informe aún no tiene editor específico.');
    }
  };

  const tipoLabel = (informe) => {
    const tipo = informe.tipo || informe.datos_formulario?.tipo;
    if (tipo === 'geriatrico') return { label: 'Geriátrico', color: '#7c3aed' };
    return { label: 'General', color: '#1a5fa8' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-800 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Informes de Arquitectura</h1>
            <p className="text-sm text-purple-200">{usuario?.nombre}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-600">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mis Informes</h2>
          {/* Botón para nuevo informe geriátrico */}
          <button
            onClick={() => navigate('/informe/geriatricos/nuevo')}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
          >
            + Nuevo Informe
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : informes.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">No hay informes creados</p>
            <p className="text-sm text-gray-400">Usá el botón "Nuevo Geriátrico" para crear el primero</p>
          </div>
        ) : (
          <div className="space-y-4">
            {informes.map((informe) => {
              const { label, color } = tipoLabel(informe);
              return (
                <div key={informe.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: '11px', fontWeight: 600, color, background: color + '18', padding: '2px 8px', borderRadius: '4px' }}>
                          {label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          informe.estado === 'cerrado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {informe.estado?.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">
                        {informe.establecimiento_nombre || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {[informe.establecimiento_direccion, informe.establecimiento_localidad].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      Expte: {informe.expediente || '-'} | {informe.fecha || '-'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editarInforme(informe)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => generarPDF(informe)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                      >
                        ⬇ PDF
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
