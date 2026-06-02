import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Cliente axios DEDICADO para RodrigoAdmin - SIN interceptores que redirijan
const rodriApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Agregar token a requests DESDE NUESTRA PROPIA CLAVE
rodriApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('rodri_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// NO redirigir automáticamente en 401/403 - manejarlo manualmente
rodriApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const ESTADO_COLORS = {
  borrador: '#d97706',
  firmado: '#2563eb',
  cerrado: '#16a34a',
};

const formatDateDDMMYYYY = (dateValue) => {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const detectarTipoInforme = (informe) => {
  const nombreTipologia = informe.datos_formulario?.tipologia_nombre;
  if (nombreTipologia) {
    return nombreTipologia.toLowerCase().includes('geriátrico') ? 'geriatrico' : nombreTipologia;
  }
  return informe.datos_formulario?.generales?.tipologia
    || informe.datos_formulario?.tipo
    || informe.tipo
    || 'geriatrico';
};

// Usamos CLAVES SEPARADAS para no conflictuar con otras sesiones
const RODRI_TOKEN_KEY = 'rodri_token';
const RODRI_USER_KEY = 'rodri_usuario';

const getStoredRodri = () => {
  try {
    const stored = localStorage.getItem(RODRI_USER_KEY);
    const token = localStorage.getItem(RODRI_TOKEN_KEY);
    if (stored && token) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
};

const setRodriAuth = (token, usuario) => {
  localStorage.setItem(RODRI_TOKEN_KEY, token);
  localStorage.setItem(RODRI_USER_KEY, JSON.stringify(usuario));
};

const clearRodriAuth = () => {
  localStorage.removeItem(RODRI_TOKEN_KEY);
  localStorage.removeItem(RODRI_USER_KEY);
};

// Funciones API dedicadas
const rodriLogin = async (dni, rol, password) => {
  const res = await rodriApi.post('/auth/login', { dni, rol, password });
  return res.data;
};

const rodriGetActas = async () => {
  const res = await rodriApi.get('/actas');
  return res.data;
};

const rodriGetInformes = async () => {
  const res = await rodriApi.get('/informes');
  return res.data;
};

const rodriDeleteActa = async (id) => {
  const res = await rodriApi.delete(`/actas/${id}`);
  return res.data;
};

const rodriDeleteInforme = async (id) => {
  const res = await rodriApi.delete(`/informes/${id}`);
  return res.data;
};

export default function RodrigoAdmin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('actas');

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [usuarioAuth, setUsuarioAuth] = useState(null);

  // Login form state
  const [loginDni, setLoginDni] = useState('00000000');
  const [loginPassword, setLoginPassword] = useState('Admin2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // ── ACTAS ─────────────────────────────────────────────────────────────────
  const [actas, setActas] = useState([]);
  const [actasOriginal, setActasOriginal] = useState([]);
  const [loadingActas, setLoadingActas] = useState(true);
  const [busquedaActas, setBusquedaActas] = useState('');
  const [filtroInspector, setFiltroInspector] = useState('');
  const [filtroEstadoActa, setFiltroEstadoActa] = useState('');

  // ── INFORMES ──────────────────────────────────────────────────────────────
  const [informes, setInformes] = useState([]);
  const [informesOriginal, setInformesOriginal] = useState([]);
  const [loadingInformes, setLoadingInformes] = useState(true);
  const [busquedaInformes, setBusquedaInformes] = useState('');
  const [filtroArquitecto, setFiltroArquitecto] = useState('');
  const [filtroEstadoInforme, setFiltroEstadoInforme] = useState('');

  // ── GLOBAL ─────────────────────────────────────────────────────────────────
  const [eliminando, setEliminando] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // ── UNICOS PARA FILTROS ────────────────────────────────────────────────────
  const inspectoresUnicos = [...new Map(
    actasOriginal.map(a => [a.inspector_id, a.inspector])
  ).values()].filter(Boolean).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  const arquitectosUnicos = [...new Map(
    informesOriginal.map(i => [i.arquitecto_id, i.arquitecto])
  ).values()].filter(Boolean).sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  const loadActas = async () => {
    setLoadingActas(true);
    try {
      const data = await rodriGetActas();
      setActas(data || []);
      setActasOriginal(data || []);
    } catch (err) {
      console.error('Error cargando actas:', err);
      // Si error 401/403, limpiar auth
      if (err.response?.status === 401 || err.response?.status === 403) {
        clearRodriAuth();
        setUsuarioAuth(null);
      }
    } finally {
      setLoadingActas(false);
    }
  };

  const loadInformes = async () => {
    setLoadingInformes(true);
    try {
      const data = await rodriGetInformes();
      setInformes(data || []);
      setInformesOriginal(data || []);
    } catch (err) {
      console.error('Error cargando informes:', err);
    } finally {
      setLoadingInformes(false);
    }
  };

  // ── AUTH CHECK ─────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log('=== RodrigoAdmin MONTADO ===');
    const stored = getStoredRodri();
    console.log('RodrigoAuth stored:', stored);
    
    if (stored && (stored.rol === 'admin' || stored.rol === 'supervisor')) {
      console.log('Auth VALIDO, cargando datos...');
      setUsuarioAuth(stored);
      loadActas();
      loadInformes();
    } else {
      console.log('Auth NO valido o inexistente. Mostrando login.');
      if (stored) {
        clearRodriAuth();
      }
    }
    setAuthChecked(true);
  }, []);

  // ── FILTRADO DINAMICO ──────────────────────────────────────────────────────
  useEffect(() => {
    let resultado = [...actasOriginal];
    if (busquedaActas) {
      const b = busquedaActas.toLowerCase();
      resultado = resultado.filter(a =>
        (a.establecimiento_nombre || '').toLowerCase().includes(b) ||
        (a.expediente || '').toLowerCase().includes(b) ||
        (a.inspector?.nombre || '').toLowerCase().includes(b)
      );
    }
    if (filtroInspector) {
      resultado = resultado.filter(a => a.inspector_id === filtroInspector);
    }
    if (filtroEstadoActa) {
      resultado = resultado.filter(a => a.estado === filtroEstadoActa);
    }
    setActas(resultado);
  }, [busquedaActas, filtroInspector, filtroEstadoActa, actasOriginal]);

  useEffect(() => {
    let resultado = [...informesOriginal];
    if (busquedaInformes) {
      const b = busquedaInformes.toLowerCase();
      resultado = resultado.filter(i =>
        (i.establecimiento_nombre || '').toLowerCase().includes(b) ||
        (i.expediente || '').toLowerCase().includes(b) ||
        (i.arquitecto?.nombre || '').toLowerCase().includes(b)
      );
    }
    if (filtroArquitecto) {
      resultado = resultado.filter(i => i.arquitecto_id === filtroArquitecto);
    }
    if (filtroEstadoInforme) {
      resultado = resultado.filter(i => i.estado === filtroEstadoInforme);
    }
     setInformes(resultado);
   }, [busquedaInformes, filtroArquitecto, filtroEstadoInforme, informesOriginal]);

   // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    console.log('[RodrigoAdmin] Login attempt:', { dni: loginDni });

    try {
      let data;
      try {
        data = await rodriLogin(loginDni, 'admin', loginPassword);
      } catch (errAdmin) {
        try {
          data = await rodriLogin(loginDni, 'supervisor', loginPassword);
        } catch {
          throw errAdmin;
        }
      }

      console.log('[RodrigoAdmin] Login OK:', data.usuario);

      const { token, usuario } = data;
      setRodriAuth(token, usuario);
      setUsuarioAuth(usuario);

      loadActas();
      loadInformes();
    } catch (err) {
      console.error('[RodrigoAdmin] Login error:', err);
      const msgBackend = err.response?.data?.error;
      const msgNetwork = err.message || err.toString();
      setLoginError(msgBackend || `Error: ${msgNetwork}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearRodriAuth();
    setUsuarioAuth(null);
    setLoginError('');
  };

  // ── ELIMINAR ───────────────────────────────────────────────────────────────
  const handleConfirmarEliminar = async () => {
    if (!confirmDelete) return;
    const { tipo, id } = confirmDelete;

    setEliminando(id);
    try {
      if (tipo === 'acta') {
        await rodriDeleteActa(id);
        await loadActas();
      } else {
        await rodriDeleteInforme(id);
        await loadInformes();
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar. Intentá de nuevo.');
    } finally {
      setEliminando(null);
      setConfirmDelete(null);
    }
  };

  const mostrarConfirmacion = (tipo, id, nombre) => {
    setConfirmDelete({ tipo, id, nombre });
  };

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <p className="text-xl text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuarioAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '64px', height: '64px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              marginBottom: '16px',
              fontSize: '32px'
            }}>
              🔧
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">RodrigoAdmin</h1>
            <p className="text-slate-400">Panel de Super Administración</p>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-center mb-6">Iniciar Sesión</h2>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="label-field">DNI</label>
                <input
                  type="text"
                  value={loginDni}
                  onChange={(e) => setLoginDni(e.target.value)}
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input-field"
                  placeholder="Ingrese su contraseña"
                  required
                />
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="btn-primary disabled:opacity-50 w-full"
              >
                {loginLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-xs text-slate-500">Credenciales por defecto:</p>
              <p className="text-xs font-mono text-slate-600 mt-1">DNI: 00000000 | Pass: Admin2026</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── MODAL CONFIRMACION ELIMINAR ────────────────────────────────────── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setConfirmDelete(null)}>
          <div style={{
            background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '100%',
            padding: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#1f2937' }}>
              Confirmar eliminación
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: 1.5 }}>
              Vas a eliminar permanentemente:<br />
              <strong style={{ color: '#dc2626' }}>{confirmDelete.nombre || '(sin nombre)'}</strong>
            </p>
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '20px' }}>
              Esta acción NO se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={!!eliminando}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  background: '#f3f4f6', color: '#4b5563'
                }}>
                Cancelar
              </button>
              <button
                onClick={handleConfirmarEliminar}
                disabled={!!eliminando}
                style={{
                  padding: '10px 20px', fontSize: '14px', fontWeight: 600,
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  background: '#dc2626', color: '#fff'
                }}>
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: '#fff', padding: '20px 16px', borderBottom: '3px solid #6366f1'
      }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '2px' }}>
              Panel de Administración
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>RodrigoAdmin</h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
              {usuarioAuth?.nombre} • {usuarioAuth?.rol}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/admin/templates')}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', color: '#e2e8f0'
              }}>
              📋 Templates
            </button>
            <button
              onClick={() => navigate('/supervisor')}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)', color: '#e2e8f0'
              }}>
              👁 Supervisor
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 14px', fontSize: '12px', fontWeight: 600,
                borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: '#dc2626', color: '#fff'
              }}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">

        {/* ── TABS ───────────────────────────────────────────────────────────── */}
        <div style={{
          display: 'inline-flex', gap: '4px', background: '#e5e7eb',
          borderRadius: '12px', padding: '4px', marginBottom: '20px'
        }}>
          <button
            onClick={() => { setTab('actas'); }}
            style={{
              padding: '10px 22px', fontSize: '14px', fontWeight: tab === 'actas' ? 700 : 500,
              borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === 'actas' ? '#fff' : 'transparent',
              color: tab === 'actas' ? '#1f2937' : '#6b7280',
              boxShadow: tab === 'actas' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}>
            📋 Actas de Inspección {!loadingActas && `(${actas.length})`}
          </button>
          <button
            onClick={() => { setTab('informes'); }}
            style={{
              padding: '10px 22px', fontSize: '14px', fontWeight: tab === 'informes' ? 700 : 500,
              borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: tab === 'informes' ? '#fff' : 'transparent',
              color: tab === 'informes' ? '#1f2937' : '#6b7280',
              boxShadow: tab === 'informes' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}>
            🏗 Informes de Arquitectura {!loadingInformes && `(${informes.length})`}
          </button>
        </div>

        {/* ── TAB ACTAS ──────────────────────────────────────────────────────── */}
        {tab === 'actas' && (
          <>
            {/* Filtros */}
            <div className="card mb-5" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '12px' }}>
                Filtros - Actas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Buscar
                  </label>
                  <input
                    type="text" placeholder="Nombre, expediente, inspector..."
                    value={busquedaActas}
                    onChange={e => setBusquedaActas(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Inspector
                  </label>
                  <select
                    value={filtroInspector}
                    onChange={e => setFiltroInspector(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}>
                    <option value="">Todos</option>
                    {inspectoresUnicos.map(ins => (
                      <option key={ins.id} value={ins.id}>{ins.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Estado
                  </label>
                  <select
                    value={filtroEstadoActa}
                    onChange={e => setFiltroEstadoActa(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}>
                    <option value="">Todos</option>
                    <option value="borrador">Borrador</option>
                    <option value="firmado">Firmado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => { setBusquedaActas(''); setFiltroInspector(''); setFiltroEstadoActa(''); }}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: '13px', fontWeight: 600,
                      borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer',
                      background: '#f9fafb', color: '#6b7280'
                    }}>
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Cards Actas */}
            {loadingActas ? (
              <div className="text-center py-20 text-gray-400 text-lg">Cargando actas...</div>
            ) : actas.length === 0 ? (
              <div className="text-center py-16 text-gray-400" style={{ fontSize: '14px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📭</div>
                No hay actas con los filtros seleccionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {actas.map(acta => (
                  <div
                    key={acta.id}
                    className="card"
                    style={{
                      background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb',
                      padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      transition: 'box-shadow 0.15s, transform 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header: fecha + estado */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{
                        fontSize: '11px', fontWeight: 700, color: '#6366f1',
                        background: '#eef2ff', padding: '4px 10px', borderRadius: '6px'
                      }}>
                        {formatDateDDMMYYYY(acta.created_at || acta.fecha)}
                      </div>
                      <span style={{
                        display: 'inline-block', fontSize: '10px', fontWeight: 800,
                        padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
                        background: (ESTADO_COLORS[acta.estado] || '#6b7280') + '18',
                        color: ESTADO_COLORS[acta.estado] || '#6b7280'
                      }}>
                        {acta.estado || 'N/E'}
                      </span>
                    </div>

                    {/* Nombre establecimiento */}
                    <div style={{
                      fontSize: '15px', fontWeight: 800, color: '#111827',
                      marginBottom: '4px', lineHeight: 1.3
                    }}>
                      {acta.establecimiento_nombre || 'Sin nombre'}
                    </div>

                    {/* Expediente */}
                    {acta.expediente && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                        Expt: <strong>{acta.expediente}</strong>
                      </div>
                    )}

                    {/* Inspector */}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                      👤 {acta.inspector?.nombre || acta.inspector?.username || 'Sin inspector'}
                    </div>

                    {/* Tipología */}
                    {acta.establecimiento_tipologia && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
                          background: '#dbeafe', color: '#1d4ed8'
                        }}>
                          {acta.establecimiento_tipologia}
                        </span>
                      </div>
                    )}

                    {/* CIDI */}
                    {acta.subido_cidi && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                          background: '#d1fae5', color: '#059669'
                        }}>
                          ✓ Subido a CIDI
                        </span>
                      </div>
                    )}

                    {/* Línea separadora */}
                    <div style={{ height: '1px', background: '#f3f4f6', margin: '8px 0' }} />

                    {/* Botones */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/acta/${acta.id}`)}
                        style={{
                          flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: 600,
                          borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: '#f3f4f6', color: '#374151', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        👁 Ver
                      </button>
                      <button
                        onClick={() => mostrarConfirmacion('acta', acta.id, acta.establecimiento_nombre || 'Acta sin nombre')}
                        style={{
                          flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: 600,
                          borderRadius: '8px', border: 'none', cursor: 'pointer',
                          background: '#fef2f2', color: '#dc2626', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── TAB INFORMES ────────────────────────────────────────────────────── */}
        {tab === 'informes' && (
          <>
            {/* Filtros */}
            <div className="card mb-5" style={{ padding: '16px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <h2 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: '12px' }}>
                Filtros - Informes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Buscar
                  </label>
                  <input
                    type="text" placeholder="Nombre, expediente, arquitecto..."
                    value={busquedaInformes}
                    onChange={e => setBusquedaInformes(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Arquitecto
                  </label>
                  <select
                    value={filtroArquitecto}
                    onChange={e => setFiltroArquitecto(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}>
                    <option value="">Todos</option>
                    {arquitectosUnicos.map(arq => (
                      <option key={arq.id} value={arq.id}>{arq.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6b7280', marginBottom: '4px' }}>
                    Estado
                  </label>
                  <select
                    value={filtroEstadoInforme}
                    onChange={e => setFiltroEstadoInforme(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                    style={{ fontSize: '14px' }}>
                    <option value="">Todos</option>
                    <option value="borrador">Borrador</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button
                    onClick={() => { setBusquedaInformes(''); setFiltroArquitecto(''); setFiltroEstadoInforme(''); }}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: '13px', fontWeight: 600,
                      borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer',
                      background: '#f9fafb', color: '#6b7280'
                    }}>
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Cards Informes */}
            {loadingInformes ? (
              <div className="text-center py-20 text-gray-400 text-lg">Cargando informes...</div>
            ) : informes.length === 0 ? (
              <div className="text-center py-16 text-gray-400" style={{ fontSize: '14px' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📭</div>
                No hay informes con los filtros seleccionados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {informes.map(inf => {
                  const tipo = detectarTipoInforme(inf);
                  const esGeri = String(tipo).toLowerCase().includes('geriatr') || tipo === 'geriatrico';
                  const displayTipo = inf.datos_formulario?.tipologia_nombre || tipo;

                  return (
                    <div
                      key={inf.id}
                      className="card"
                      style={{
                        background: '#fff', borderRadius: '14px',
                        borderLeft: `4px solid ${esGeri ? '#7c3aed' : '#1a5fa8'}`,
                        padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                        transition: 'box-shadow 0.15s, transform 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Header: fecha + estado */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{
                          fontSize: '11px', fontWeight: 700, color: '#374151',
                          background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px'
                        }}>
                          {formatDateDDMMYYYY(inf.fecha || inf.created_at)}
                        </div>
                        <span style={{
                          display: 'inline-block', fontSize: '10px', fontWeight: 800,
                          padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
                          background: (ESTADO_COLORS[inf.estado] || '#6b7280') + '18',
                          color: ESTADO_COLORS[inf.estado] || '#6b7280'
                        }}>
                          {inf.estado || 'N/E'}
                        </span>
                      </div>

                      {/* Nombre establecimiento */}
                      <div style={{
                        fontSize: '15px', fontWeight: 800, color: '#111827',
                        marginBottom: '4px', lineHeight: 1.3
                      }}>
                        {inf.establecimiento_nombre || 'Sin nombre'}
                      </div>

                      {/* Expediente */}
                      {inf.expediente && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                          Expt: <strong>{inf.expediente}</strong>
                        </div>
                      )}

                      {/* Arquitecto */}
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                        👤 {inf.arquitecto?.nombre || 'Sin arquitecto'}
                      </div>

                      {/* Tipología */}
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
                          background: esGeri ? '#faf5ff' : '#eff6ff',
                          color: esGeri ? '#7c3aed' : '#1a5fa8'
                        }}>
                          🏗 {displayTipo}
                        </span>
                      </div>

                      {/* CIDI */}
                      {inf.subido_cidi && (
                        <div style={{ marginBottom: '10px' }}>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                            background: '#d1fae5', color: '#059669'
                          }}>
                            ✓ Subido a CIDI
                          </span>
                        </div>
                      )}

                      {/* Línea separadora */}
                      <div style={{ height: '1px', background: '#f3f4f6', margin: '8px 0' }} />

                      {/* Botones */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/informe/${inf.id}`)}
                          style={{
                            flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: 600,
                            borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: '#f3f4f6', color: '#374151', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#e5e7eb'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f3f4f6'}
                        >
                          👁 Ver
                        </button>
                        <button
                          onClick={() => mostrarConfirmacion('informe', inf.id, inf.establecimiento_nombre || 'Informe sin nombre')}
                          style={{
                            flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: 600,
                            borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: '#fef2f2', color: '#dc2626', transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
