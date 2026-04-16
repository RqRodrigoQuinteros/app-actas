import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI } from '../utils/api';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [actas, setActas] = useState([]);
  const [actasOriginal, setActasOriginal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCidi, setFiltroCidi] = useState('');
  const [filtroTipologia, setFiltroTipologia] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(null);

  useEffect(() => {
    loadActas();
  }, []);

  const loadActas = async () => {
    try {
      const response = await actasAPI.getAll();
      setActasOriginal(response.data);
      setActas(response.data);
    } catch (err) {
      console.error('Error cargando actas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let resultado = [...actasOriginal];
    
    // Filtro por CIDI
    if (filtroCidi !== '') {
      resultado = resultado.filter(a => String(a.subido_cidi) === filtroCidi);
    }
    
    // Filtro por tipología
    if (filtroTipologia) {
      resultado = resultado.filter(a => 
        (a.establecimiento_tipologia || a.establecimiento?.tipologia || '') === filtroTipologia
      );
    }
    
    // Filtro por búsqueda
    if (busqueda) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(a => 
        (a.establecimiento_nombre || a.establecimiento?.nombre || '').toLowerCase().includes(b) ||
        (a.expediente || '').toLowerCase().includes(b)
      );
    }
    
    setActas(resultado);
  }, [filtroCidi, filtroTipologia, busqueda, actasOriginal]);

  const eliminarActa = async (id) => {
    try {
      await actasAPI.delete(id);
      loadActas();
      setMostrarModal(null);
    } catch (err) {
      console.error('Error eliminando acta:', err);
      alert('Error al eliminar el acta');
    }
  };

  const toggleCidi = async (actaId, actual) => {
    try {
      await actasAPI.toggleCidi(actaId);
      setActas(prev => prev.map(a => 
        a.id === actaId ? { ...a, subido_cidi: !actual } : a
      ));
    } catch {
      alert('Error al actualizar CIDI');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'borrador': return 'bg-yellow-100 text-yellow-800';
      case 'firmado': return 'bg-blue-100 text-blue-800';
      case 'cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">App Inspecciones</h1>
            <p className="text-sm text-blue-200">{usuario?.nombre}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Mis Actas</h2>
          <Link
            to="/nueva-acta"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg active:bg-green-700"
          >
            + Nueva Acta
          </Link>
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o expediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg flex-1 min-w-[200px]"
          />
          <select
            value={filtroCidi}
            onChange={(e) => setFiltroCidi(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="">CIDI: Todas</option>
            <option value="true">Subidas a CIDI</option>
            <option value="false">No subidas a CIDI</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando actas...</p>
          </div>
        ) : actas.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 mb-4">No hay actas creadas</p>
            <Link to="/nueva-acta" className="text-blue-600 hover:underline">
              Crear primera acta
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {actas.map((acta) => (
              <div key={acta.id} className="card hover:shadow-lg transition-shadow">
                <Link to={`/acta/${acta.id}`} className="block">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {acta.establecimiento_nombre || acta.establecimiento?.nombre || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {acta.establecimiento_direccion || acta.establecimiento?.direccion}, {acta.establecimiento_localidad || acta.establecimiento?.localidad}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(acta.estado)}`}>
                        {acta.estado.toUpperCase()}
                      </span>
                      {acta.subido_cidi && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1" title="Cargado en CIDI">
                          ✓ CIDI
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Expte: {acta.expediente || 'Sin expediente'}</span>
                    <span>{acta.fecha}</span>
                    {acta.updated_at && (
                      <span style={{ color: '#9ca3af' }}>
                        Editado: {new Date(acta.updated_at).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-end gap-2">
                  <button
                    onClick={() => toggleCidi(acta.id, !!acta.subido_cidi)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: acta.subido_cidi ? '2px solid #059669' : '1.5px solid #d1d5db',
                      background: acta.subido_cidi ? '#d1fae5' : '#f9fafb',
                      color: acta.subido_cidi ? '#059669' : '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    {acta.subido_cidi ? '✓ CIDI' : 'CIDI'}
                  </button>
                  <button
                    onClick={() => setMostrarModal(acta.id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">¿Está seguro de eliminar esta acta? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMostrarModal(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarActa(mostrarModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
