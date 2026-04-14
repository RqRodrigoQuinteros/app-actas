import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NuevaActa from './components/NuevaActa';
import VerActa from './components/VerActa';
import SupervisorDash from './components/SupervisorDash';
import SupervisorLogin from './components/SupervisorLogin';
import InformeArquitecto from './components/InformeArquitecto';
import InformeArqGeriatricos from './components/InformeArqGeriatricos';

function ProtectedRoute({ children, roles }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/supervisor-login" element={<SupervisorLogin />} />

      <Route path="/" element={
        <ProtectedRoute>
          {usuario?.rol === 'supervisor'
            ? <Navigate to="/supervisor" replace />
            : usuario?.rol === 'arquitecto'
              ? <Navigate to="/informes" replace />
              : <Dashboard />}
        </ProtectedRoute>
      } />

      <Route path="/nueva-acta" element={
        <ProtectedRoute roles={['inspector']}>
          <NuevaActa />
        </ProtectedRoute>
      } />

      <Route path="/acta/:id" element={
        <ProtectedRoute>
          <VerActa />
        </ProtectedRoute>
      } />

      <Route path="/supervisor" element={
        <ProtectedRoute roles={['supervisor']}>
          <SupervisorDash />
        </ProtectedRoute>
      } />

      <Route path="/informes" element={
        <ProtectedRoute roles={['arquitecto']}>
          <InformeArquitecto />
        </ProtectedRoute>
      } />

      <Route path="/informe/geriatricos/nuevo" element={
        <ProtectedRoute roles={['arquitecto']}>
          <InformeArqGeriatricos />
        </ProtectedRoute>
      } />

      <Route path="/informe/geriatricos/:id" element={
        <ProtectedRoute roles={['arquitecto', 'supervisor']}>
          <InformeArqGeriatricos />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
