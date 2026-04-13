import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { informesAPI } from '../utils/api';
import api from '../utils/api';

export default function InformeArquitecto() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfCargando, setPdfCargando] = useState(null); // id del informe cargando

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

  // Detecta el tipo del informe mirando tipo, datos_formulario.tipo, o el nombre del establecimiento
  const detectarTipo = (informe) => {
    return informe.tipo
      || informe.datos_formulario?.tipo
      || informe.datos_formulario?.generales?.tipologia
      || 'geriatrico'; // fallback: si no tiene tipo guardado, asumir geriátrico (los primeros que se crearon)
  };

  const editarInforme = (informe) => {
    const tipo = detectarTipo(informe);
    if (tipo === 'geriatrico') {
      navigate(`/informe/geriatricos/${informe.id}`);
    } else {
      // Expandir acá para otras tipologías
      navigate(`/informe/geriatricos/${informe.id}`);
    }
  };

  const generarPDF = async (informe) => {
    setPdfCargando(informe.id);
    try {
      const tipo = detectarTipo(informe);
      let response;

      if (tipo === 'geriatrico') {
        // Usar el endpoint de geriátricos con los datos del formulario
        const df = informe.datos_formulario?.generales || {};
        const checks = informe.datos_formulario?.checks || {};
        const obsArt = informe.datos_formulario?.observaciones || {};
        const ARTICULOS_NRO = Object.keys(checks).filter(nro => checks[nro]);
        // Necesitamos las descripciones — las reconstruimos desde el informe
        const articulosObservados = ARTICULOS_NRO.map(nro => ({
          nro,
          desc: '', // el template los tiene en el HTML
          obs: obsArt[nro] || '',
        }));
        response = await api.post('/pdf/geriatrico', { ...df, articulosObservados }, { responseType: 'blob' });
      } else {
        response = await api.post(`/pdf/informe/${informe.id}`, {}, { responseType: 'blob' });
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${informe.establecimiento_nombre || informe.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('Error al generar el PDF. Intentá de nuevo.');
    } finally {
      setPdfCargando(null);
    }
  };

  const tipoLabel = (informe) => {
    const tipo = detectarTipo(informe);
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
            <p className="text-sm text-gray-400">Usá el botón "Nuevo Informe" para crear el primero</p>
          </div>
        ) : (
          <div className="space-y-4">
            {informes.map((informe) => {
              const { label, color } = tipoLabel(informe);
              const cargandoEste = pdfCargando === informe.id;
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
                        disabled={cargandoEste}
                        className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${cargandoEste ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                      >
                        {cargandoEste ? 'Generando...' : '⬇ PDF'}
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