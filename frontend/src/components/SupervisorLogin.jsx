import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

export default function SupervisorLogin() {
  const { login } = useAuth();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(dni, 'supervisor');
      window.location.href = '/supervisor';
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Panel del Supervisor
          </h1>
          <p className="text-gray-300">Acceso restringido</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-center mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label-field">DNI</label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="input-field"
                placeholder="Ingrese su DNI"
                required
              />
            </div>

            <div className="mb-6">
              <label className="label-field">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Ingrese su contraseña"
                required
              />
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
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Volver al login de inspector
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
