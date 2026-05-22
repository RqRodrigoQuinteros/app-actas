import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RodrigoAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(dni, 'admin', password);
      navigate('/rodrigoAdmin');
    } catch (err) {
      const msgBackend = err.response?.data?.error;
      const msgNetwork = err.message || err.toString();
      setError(msgBackend || `Error: ${msgNetwork}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: '16px',
            fontSize: '24px'
          }}>
            🔧
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">RodrigoAdmin</h1>
          <p className="text-slate-400 text-sm">Panel de Super Administración</p>
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
                autoFocus
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
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
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

          <div className="mt-6 text-center space-y-2">
            <a href="/login" className="text-sm text-slate-500 hover:text-slate-700 block">
              ← Volver al login de inspector
            </a>
            <a href="/admin" className="text-sm text-slate-500 hover:text-slate-700 block">
              → Ir a Admin Templates
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
