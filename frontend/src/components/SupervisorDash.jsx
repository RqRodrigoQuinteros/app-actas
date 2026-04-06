import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI } from '../utils/api';

export default function SupervisorDash() {
  const { usuario, logout } = useAuth();
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    inspector_id: '',
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
  });
  const [inspectores, setInspectores] = useState([]);

  useEffect(() => {
    loadActas();
  }, [filtros]);

  const loadActas = async () => {
    try {
      const response = await actasAPI.getAll(filtros);
      setActas(response.data);
      
      const uniqueInspectores = [...new Map(response.data.map(a => [a.inspector_id, a.inspector])).values()];
      setInspectores(uniqueInspectores);
    } catch (err) {
      console.error('Error cargando actas:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCidi = async (id) => {
    try {
      await actasAPI.toggleCidi(id);
      loadActas();
    } catch (err) {
      console.error('Error toggling CIDI:', err);
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
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Panel del Supervisor</h1>
            <p className="text-sm text-gray-300">{usuario?.nombre}</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              Login Inspector
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="card mb-6">
          <h2 className="font-bold text-lg mb-4">Filtros</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-field text-sm">Inspector</label>
              <select
                value={filtros.inspector_id}
                onChange={(e) => setFiltros(prev => ({ ...prev, inspector_id: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">Todos</option>
                {inspectores.map((ins) => (
                  <option key={ins?.id} value={ins?.id}>{ins?.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field text-sm">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">Todos</option>
                <option value="borrador">Borrador</option>
                <option value="firmado">Firmado</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="label-field text-sm">Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="label-field text-sm">Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                className="input-field text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Todas las Actas ({actas.length})</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Inspector</th>
                  <th className="p-3 text-left">Establecimiento</th>
                  <th className="p-3 text-left">Estado</th>
                  <th className="p-3 text-left">CIDI</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actas.map((acta) => (
                  <tr key={acta.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{acta.fecha}</td>
                    <td className="p-3">{acta.inspector?.nombre || '-'}</td>
                    <td className="p-3">
                      <div>{acta.establecimiento_nombre || acta.establecimiento?.nombre || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-500">{acta.expediente}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(acta.estado)}`}>
                        {acta.estado.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleCidi(acta.id)}
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          acta.subido_cidi
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {acta.subido_cidi ? 'Subido' : 'Pendiente'}
                      </button>
                    </td>
                    <td className="p-3">
                      <Link
                        to={`/acta/${acta.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
