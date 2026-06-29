import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function formatFecha(d) {
  if (!d) return '—';
  const date = new Date(d);
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_CONFIG = {
  vencida: { label: 'Vencida', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  proxima: { label: 'Próxima', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  al_dia: { label: 'Al día', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
};

export default function VencimientosDash() {
  const { usuario } = useAuth();
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ status_vencimiento: '', inspector_id: '', fechaDesde: '', fechaHasta: '' });
  const [inspectores, setInspectores] = useState([]);
  const [exportando, setExportando] = useState(false);
  const [reenviando, setReenviando] = useState(null);

  useEffect(() => {
    api.get('/auth/usuarios-login').then(r => setInspectores(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filtros.status_vencimiento) params.status_vencimiento = filtros.status_vencimiento;
    if (filtros.inspector_id) params.inspector_id = filtros.inspector_id;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;

    api.get('/actas/vencimientos', { params })
      .then(r => setActas(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filtros]);

  const handleExport = async () => {
    setExportando(true);
    try {
      const params = {};
      if (filtros.inspector_id) params.inspector_id = filtros.inspector_id;
      if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
      if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
      if (filtros.status_vencimiento) params.status_vencimiento = filtros.status_vencimiento;

      const res = await api.get('/actas/exportar', { params, responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `actas_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error al exportar');
    }
    setExportando(false);
  };

  const handleReenviar = async (id) => {
    setReenviando(id);
    try {
      await api.post(`/actas/reenviar-alerta/${id}`);
      setActas(prev => prev.map(a => a.id === id ? { ...a, alertaEnviada: true } : a));
    } catch (err) {
      alert('Error al reenviar alerta');
    }
    setReenviando(null);
  };

  const stats = {
    vencidas: actas.filter(a => a.status === 'vencida').length,
    proximas: actas.filter(a => a.status === 'proxima').length,
    al_dia: actas.filter(a => a.status === 'al_dia').length,
    alertadas: actas.filter(a => a.alertaEnviada).length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 flex items-center justify-between h-14">
        <div>
          <div className="text-base font-bold text-gray-900">Vencimientos y Alertas</div>
          <div className="text-xs text-gray-500">Control de plazos de emplazamiento</div>
        </div>
        <button onClick={() => window.history.back()}
          className="px-3.5 py-1.5 text-xs rounded-lg border border-gray-200 bg-white cursor-pointer text-gray-700 font-medium">
          ← Volver
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-red-600">{stats.vencidas}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mt-1">Vencidas</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-amber-600">{stats.proximas}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mt-1">Próximas (≤3d)</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-emerald-600">{stats.al_dia}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mt-1">Al día</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{stats.alertadas}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-bold mt-1">Alertas enviadas</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estado vencimiento</label>
              <select value={filtros.status_vencimiento}
                onChange={e => setFiltros(p => ({ ...p, status_vencimiento: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                <option value="">Todos</option>
                <option value="vencida">Vencidas</option>
                <option value="proxima">Próximas</option>
                <option value="al_dia">Al día</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inspector</label>
              <select value={filtros.inspector_id}
                onChange={e => setFiltros(p => ({ ...p, inspector_id: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                <option value="">Todos</option>
                {inspectores.filter(u => u.rol === 'inspector').map(ins => (
                  <option key={ins.dni} value={ins.dni}>{ins.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
              <input type="date" value={filtros.fechaDesde}
                onChange={e => setFiltros(p => ({ ...p, fechaDesde: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
              <input type="date" value={filtros.fechaHasta}
                onChange={e => setFiltros(p => ({ ...p, fechaHasta: e.target.value }))}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleExport} disabled={exportando}
              className="px-4 py-2 text-xs font-bold rounded-lg border-none cursor-pointer bg-green-600 text-white disabled:opacity-50">
              {exportando ? 'Exportando...' : '⬇ Exportar CSV'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Inspector', 'Establecimiento', 'Expediente', 'Fecha Inspección', 'Vencimiento', 'Días', 'Estado', 'Alerta', 'Acciones'].map(h => (
                  <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="p-6 text-center text-gray-400">Cargando...</td></tr>
              ) : actas.length === 0 ? (
                <tr><td colSpan="9" className="p-6 text-center text-gray-400">Sin resultados</td></tr>
              ) : actas.map((acta, i) => {
                const cfg = STATUS_CONFIG[acta.status] || STATUS_CONFIG.al_dia;
                return (
                  <tr key={acta.id} className={`${cfg.bg} ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
                    <td className="p-3 text-sm font-medium">{acta.inspector?.nombre || '—'}</td>
                    <td className="p-3 text-sm">{acta.establecimiento_nombre || '—'}</td>
                    <td className="p-3 text-xs text-gray-500">{acta.expediente || '—'}</td>
                    <td className="p-3 text-sm">{formatFecha(acta.fecha)}</td>
                    <td className="p-3 text-sm">{acta.vencimiento ? formatFecha(acta.vencimiento) : '—'}</td>
                    <td className="p-3 text-sm font-bold">{acta.diasVencido > 0 ? `${acta.diasVencido}d` : '—'}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="p-3">
                      {acta.alertaEnviada ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-green-100 text-green-700">
                          Enviada
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-gray-100 text-gray-500">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => handleReenviar(acta.id)} disabled={reenviando === acta.id}
                          className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 disabled:opacity-50 cursor-pointer border-none">
                          {reenviando === acta.id ? '...' : 'Reenviar alerta'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
