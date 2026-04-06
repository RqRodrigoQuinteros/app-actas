import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const [inspectores, setInspectores] = useState([]);
  const [selectedInspector, setSelectedInspector] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authAPI.getInspectores()
      .then(res => setInspectores(res.data))
      .catch(err => console.error('Error cargando inspectores:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const inspector = inspectores.find(i => i.nombre === selectedInspector);
      if (!inspector) {
        setError('Seleccione un inspector');
        setLoading(false);
        return;
      }

      await login(inspector.dni, 'inspector');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏥</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            App de Inspecciones Sanitarias
          </h1>
          <p className="text-blue-200">
            Dirección General de Regulación Sanitaria
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-center mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="label-field">Seleccionar Inspector</label>
              <select
                value={selectedInspector}
                onChange={(e) => setSelectedInspector(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Seleccione --</option>
                {inspectores.map((inspector) => (
                  <option key={inspector.dni} value={inspector.nombre}>
                    {inspector.nombre}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Iniciando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/supervisor-login"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Acceso Supervisor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
