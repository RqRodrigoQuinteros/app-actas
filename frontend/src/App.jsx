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
import AdminTemplates from './components/AdminTemplates';
import AdminLogin from './components/AdminLogin';
import EditarActa from './components/EditarActa';
import VencimientosDash from './components/VencimientosDash';
import CargaPedido from './components/CargaPedido';

function ProtectedRoute({ children, roles, loginPath }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    const redirectTo = loginPath || (roles?.includes('admin') ? '/admin' : '/login');
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  const { usuario, loading } = useAuth();

  return (
    <Routes>
       <Route path="/login" element={<Login />} />
       <Route path="/supervisor-login" element={<SupervisorLogin />} />

       <Route path="/admin" element={
        usuario?.rol === 'admin'
          ? <Navigate to="/admin/templates" replace />
          : <AdminLogin />
      } />

      <Route path="/" element={
        <ProtectedRoute>
          {usuario?.rol === 'supervisor'
            ? <Navigate to="/supervisor" replace />
            : usuario?.rol === 'arquitecto'
              ? <Navigate to="/informes" replace />
              : usuario?.rol === 'admin'
                ? <Navigate to="/admin/templates" replace />
                : usuario?.rol === 'carga_inspeccion'
                  ? <Navigate to="/carga-pedido" replace />
                  : <Dashboard />}
        </ProtectedRoute>
      } />

      <Route path="/nueva-acta" element={
        <ProtectedRoute roles={['inspector']}>
          <NuevaActa />
        </ProtectedRoute>
      } />

      <Route path="/carga-pedido" element={
        <ProtectedRoute roles={['carga_inspeccion']}>
          <CargaPedido />
        </ProtectedRoute>
      } />

      <Route path="/acta/:id/editar" element={
        <ProtectedRoute roles={['inspector']}>
          <EditarActa />
        </ProtectedRoute>
      } />

      <Route path="/acta/:id" element={
        <ProtectedRoute>
          <VerActa />
        </ProtectedRoute>
      } />

       <Route path="/supervisor" element={
        <ProtectedRoute roles={['supervisor', 'admin']}>
          <SupervisorDash />
        </ProtectedRoute>
      } />

      <Route path="/supervisor/vencimientos" element={
        <ProtectedRoute roles={['supervisor', 'admin']}>
          <VencimientosDash />
        </ProtectedRoute>
      } />

      <Route path="/informes" element={
        <ProtectedRoute roles={['arquitecto']}>
          <InformeArquitecto />
        </ProtectedRoute>
      } />

      <Route path="/informe/nuevo" element={
        <ProtectedRoute roles={['arquitecto']}>
          <InformeArqGeriatricos />
        </ProtectedRoute>
      } />

       <Route path="/informe/:id" element={
         <ProtectedRoute roles={['arquitecto', 'supervisor', 'admin']}>
           <InformeArqGeriatricos />
         </ProtectedRoute>
       } />

      <Route path="/informe/geriatricos/nuevo" element={
        <ProtectedRoute roles={['arquitecto']}>
          <InformeArqGeriatricos />
        </ProtectedRoute>
      } />

       <Route path="/informe/geriatricos/:id" element={
         <ProtectedRoute roles={['arquitecto', 'supervisor', 'admin']}>
           <InformeArqGeriatricos />
         </ProtectedRoute>
       } />

       <Route path="/admin/templates" element={
         <ProtectedRoute roles={['admin']}>
           <AdminTemplates />
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
