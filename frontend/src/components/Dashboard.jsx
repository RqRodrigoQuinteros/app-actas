import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI } from '../utils/api';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActas();
  }, []);

  const loadActas = async () => {
    try {
      const response = await actasAPI.getAll();
      setActas(response.data);
    } catch (err) {
      console.error('Error cargando actas:', err);
    } finally {
      setLoading(false);
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Actas</h2>
          <Link
            to="/nueva-acta"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg active:bg-green-700"
          >
            + Nueva Acta
          </Link>
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
              <Link key={acta.id} to={`/acta/${acta.id}`} className="block">
                <div className="card hover:shadow-lg transition-shadow">
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
