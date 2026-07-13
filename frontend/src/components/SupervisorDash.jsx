import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, informesAPI, vencimientosAPI } from '../utils/api';
import api from '../utils/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#64748b'];

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

const esGeriatrico = (tipo) => {
  return String(tipo).toLowerCase().includes('geriatr') || tipo === 'geriatrico';
};

const FERIADOS_2026 = [
  '2026-01-01', '2026-02-24', '2026-02-25', '2026-03-24',
  '2026-04-02', '2026-05-01', '2026-05-25', '2026-06-20',
  '2026-07-09', '2026-08-17', '2026-10-12', '2026-12-08', '2026-12-25',
];

const formatDateISO = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatDateDDMMYYYY = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const isHoliday = (date) => FERIADOS_2026.includes(formatDateISO(date));

const addBusinessDays = (startDate, days) => {
  const current = new Date(startDate);
  let added = 0;
  while (added < Number(days)) {
    current.setDate(current.getDate() + 1);
    const day = current.getDay();
    const iso = formatDateISO(current);
    if (day === 0 || day === 6 || isHoliday(iso)) continue;
    added += 1;
  }
  return current;
};

const calculateDueDate = (createdAt, emplazamientoTipo, emplazamientoValor) => {
  if (!createdAt || !emplazamientoTipo || emplazamientoValor == null) return null;
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return null;
  const tipo = String(emplazamientoTipo).trim().toUpperCase();
  const valor = Number(emplazamientoValor);
  if (tipo === 'HORAS') return new Date(start.getTime() + valor * 60 * 60 * 1000);
  if (tipo === 'DÍAS' || tipo === 'DIAS') return addBusinessDays(start, valor);
  return null;
};

const getVencimientoStatus = (acta) => {
  const dueDate = calculateDueDate(acta.created_at || acta.fecha, acta.emplazamiento_tipo, acta.emplazamiento_valor);
  if (!dueDate) return 'alDia';
  const now = new Date();
  if (dueDate < now) return 'vencida';
  const next72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  return dueDate <= next72h ? 'proxima' : 'alDia';
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const MES_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function SupervisorDash() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');

  const [actas, setActas] = useState([]);
  const [loadingActas, setLoadingActas] = useState(true);
  const [inspectores, setInspectores] = useState([]);
  const [filtrosActas, setFiltrosActas] = useState({ inspector_id: '', tipologia: '', fechaDesde: '', fechaHasta: '' });
  const [vencimientoFilter, setVencimientoFilter] = useState('all');
  const [tipologiasActas, setTipologiasActas] = useState([]);

  const [informes, setInformes] = useState([]);
  const [loadingInformes, setLoadingInformes] = useState(true);
  const [arquitectos, setArquitectos] = useState([]);
  const [filtrosInformes, setFiltrosInformes] = useState({ arquitecto_id: '', tipo: '', estado: '' });
  const [pdfCargando, setPdfCargando] = useState(null);

  const [transferencias, setTransferencias] = useState([]);
  const [loadingTransferencias, setLoadingTransferencias] = useState(true);
  const [filtrosTransferencias, setFiltrosTransferencias] = useState({ arquitecto_origen_id: '', arquitecto_destino_id: '', fechaDesde: '', fechaHasta: '' });

  useEffect(() => { loadActas(); }, [filtrosActas.fechaDesde, filtrosActas.fechaHasta, filtrosActas.inspector_id]);
  useEffect(() => { loadInformes(); }, []);
  useEffect(() => { if (tab === 'transferencias') loadTransferencias(); }, [tab]);

  const loadActas = async () => {
    setLoadingActas(true);
    try {
      const paramsApi = { inspector_id: filtrosActas.inspector_id, fechaDesde: filtrosActas.fechaDesde, fechaHasta: filtrosActas.fechaHasta };
      const params = Object.fromEntries(Object.entries(paramsApi).filter(([, v]) => v !== '' && v !== null && v !== undefined));
      const response = await actasAPI.getAll(params);
      const dataActas = response.data || [];
      setActas(dataActas);
      const mapInspectores = new Map();
      dataActas.forEach(a => {
        const idIns = a.inspector_id || a.inspector?.id;
        const objIns = a.inspector;
        if (idIns && objIns && !mapInspectores.has(idIns)) {
          mapInspectores.set(idIns, { id: idIns, nombre: objIns.nombre || objIns.username || 'Inspector' });
        }
      });
      setInspectores(Array.from(mapInspectores.values()));
      const uniqTipologias = [...new Set(dataActas.map(a => a.establecimiento_tipologia).filter(Boolean))];
      setTipologiasActas(uniqTipologias);
    } catch (err) {
      console.error('Error cargando actas:', err);
    } finally {
      setLoadingActas(false);
    }
  };

  const loadInformes = async () => {
    setLoadingInformes(true);
    try {
      const response = await informesAPI.getAll();
      setInformes(response.data);
      const uniq = [...new Map(response.data.map(i => [i.arquitecto_id, i.arquitecto])).values()].filter(Boolean);
      setArquitectos(uniq);
    } catch (err) {
      console.error('Error cargando informes:', err);
    } finally {
      setLoadingInformes(false);
    }
  };

  const loadTransferencias = async () => {
    setLoadingTransferencias(true);
    try {
      const response = await informesAPI.getTransferencias();
      setTransferencias(response.data || []);
    } catch (err) {
      console.error('Error cargando transferencias:', err);
    } finally {
      setLoadingTransferencias(false);
    }
  };

  const toggleCidi = async (id) => {
    try { await actasAPI.toggleCidi(id); loadActas(); } catch (err) { console.error('Error toggling CIDI:', err); }
  };

  const generarPDFInforme = async (informe) => {
    setPdfCargando(informe.id);
    try {
      const tipo = detectarTipoInforme(informe);
      let response;
      if (esGeriatrico(tipo)) {
        const df = { ...(informe.datos_formulario?.generales || {}) };
        if (!df.nombreEst) df.nombreEst = informe.establecimiento_nombre || '';
        const checks = informe.datos_formulario?.checks || {};
        const obsArt = informe.datos_formulario?.observaciones || {};
        const articulosObservados = Object.keys(checks)
          .filter(nro => checks[nro])
          .map(nro => ({ nro, desc: '', obs: obsArt[nro] || '' }));
        response = await api.post('/pdf/geriatrico', {
          ...df,
          articulosObservados,
          tipologia_nombre: informe.datos_formulario?.tipologia_nombre || 'Geriátricos',
        }, { responseType: 'blob' });
      } else {
        response = await api.post(`/pdf/informe/${informe.id}`, {}, { responseType: 'blob' });
      }
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `informe_${informe.establecimiento_nombre || informe.id}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch { alert('Error al generar el PDF.'); }
    finally { setPdfCargando(null); }
  };

  // ── EXPORT FUNCTIONS ──────────────────────────────────────────────────────
  const exportarActas = async (format) => {
    try {
      const params = {};
      if (filtrosActas.inspector_id) params.inspector_id = filtrosActas.inspector_id;
      if (filtrosActas.tipologia) params.tipologia = filtrosActas.tipologia;
      if (filtrosActas.fechaDesde) params.fechaDesde = filtrosActas.fechaDesde;
      if (filtrosActas.fechaHasta) params.fechaHasta = filtrosActas.fechaHasta;
      const response = await vencimientosAPI.exportar(params, format);
      downloadBlob(response.data, `actas_export.${format}`);
    } catch (err) { console.error('Error exportando actas:', err); alert('Error al exportar'); }
  };

  const exportarInformes = async (format) => {
    try {
      const params = {};
      if (filtrosInformes.arquitecto_id) params.arquitecto_id = filtrosInformes.arquitecto_id;
      if (filtrosInformes.tipo) params.tipologia = filtrosInformes.tipo === 'geriatrico' ? 'Geriátricos' : filtrosInformes.tipo;
      if (filtrosInformes.estado) params.estado = filtrosInformes.estado;
      const response = await informesAPI.exportar(params, format);
      downloadBlob(response.data, `informes_export.${format}`);
    } catch (err) { console.error('Error exportando informes:', err); alert('Error al exportar'); }
  };

  // ── COMPUTED STATS ───────────────────────────────────────────────────────
  const actasConVencimiento = actas.map(acta => {
    const dueDate = calculateDueDate(acta.created_at || acta.fecha, acta.emplazamiento_tipo, acta.emplazamiento_valor);
    return { ...acta, dueDate, vencimientoStatus: getVencimientoStatus({ ...acta, emplazamiento_valor: acta.emplazamiento_valor, emplazamiento_tipo: acta.emplazamiento_tipo }) };
  });

  const actasFiltradas = actasConVencimiento.filter(acta => {
    if (vencimientoFilter !== 'all' && acta.vencimientoStatus !== vencimientoFilter) return false;
    if (filtrosActas.inspector_id) {
      const idDelActa = String(acta.inspector_id || acta.inspector?.id || '');
      if (idDelActa !== String(filtrosActas.inspector_id)) return false;
    }
    if (filtrosActas.tipologia && acta.establecimiento_tipologia !== filtrosActas.tipologia) return false;
    if (filtrosActas.fechaDesde) {
      const fechaActa = new Date(acta.created_at || acta.fecha);
      const fDesde = new Date(filtrosActas.fechaDesde + 'T00:00:00');
      if (fechaActa < fDesde) return false;
    }
    if (filtrosActas.fechaHasta) {
      const fechaActa = new Date(acta.created_at || acta.fecha);
      const fHasta = new Date(filtrosActas.fechaHasta + 'T23:59:59');
      if (fechaActa > fHasta) return false;
    }
    return true;
  });

  const informesFiltrados = informes.filter(inf => {
    if (filtrosInformes.arquitecto_id && inf.arquitecto_id !== filtrosInformes.arquitecto_id) return false;
    if (filtrosInformes.tipo) {
      const tipoDetectado = detectarTipoInforme(inf);
      if (filtrosInformes.tipo === 'geriatrico') { if (!esGeriatrico(tipoDetectado)) return false; }
      else { if (esGeriatrico(tipoDetectado)) return false; }
    }
    if (filtrosInformes.estado && inf.estado !== filtrosInformes.estado) return false;
    return true;
  });

  const vencidasCount = actasConVencimiento.filter(a => a.vencimientoStatus === 'vencida').length;
  const proximasCount = actasConVencimiento.filter(a => a.vencimientoStatus === 'proxima').length;
  const alDiaCount = actasConVencimiento.filter(a => a.vencimientoStatus === 'alDia').length;

  // Dashboard stats
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const actasEsteMes = actas.filter(a => (a.fecha || '').startsWith(thisMonth)).length;
  const informesEsteMes = informes.filter(i => (i.fecha || '').startsWith(thisMonth)).length;

  const actasPorMes = useMemo(() => {
    const counts = {};
    actas.forEach(a => {
      const month = (a.fecha || '').slice(0, 7);
      if (month) counts[month] = (counts[month] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    return {
      labels: sorted.map(([m]) => { const [y, mo] = m.split('-'); return `${MES_NAMES[parseInt(mo) - 1]} ${y.slice(2)}`; }),
      datasets: [{ label: 'Actas', data: sorted.map(([, c]) => c), backgroundColor: '#6366f1', borderRadius: 6 }],
    };
  }, [actas]);

  const actasPorTipologia = useMemo(() => {
    const counts = {};
    actas.forEach(a => { const t = a.establecimiento_tipologia || 'Sin tipología'; counts[t] = (counts[t] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ data: entries.map(([, v]) => v), backgroundColor: COLORS.slice(0, entries.length) }],
    };
  }, [actas]);

  const informesPorTipologia = useMemo(() => {
    const counts = {};
    informes.forEach(i => {
      const t = i.datos_formulario?.tipologia_nombre || i.tipo || 'Sin tipología';
      counts[t] = (counts[t] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map(([k]) => k),
      datasets: [{ data: entries.map(([, v]) => v), backgroundColor: COLORS.slice(0, entries.length) }],
    };
  }, [informes]);

  const actasPorInspector = useMemo(() => {
    const counts = {};
    actas.forEach(a => { const name = a.inspector?.nombre || 'Sin inspector'; counts[name] = (counts[name] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: entries.map(([k]) => k.split(' ').slice(0, 2).join(' ')),
      datasets: [{ label: 'Actas', data: entries.map(([, v]) => v), backgroundColor: '#10b981', borderRadius: 6 }],
    };
  }, [actas]);

  const recentActas = actas.slice(0, 10);
  const recentInformes = informes.slice(0, 10);
  const recentCombined = useMemo(() => {
    const items = [
      ...recentActas.map(a => ({ tipo: 'Acta', fecha: a.created_at || a.fecha, nombre: a.establecimiento_nombre, profesional: a.inspector?.nombre || '-', estado: a.estado, id: a.id, link: `/acta/${a.id}` })),
      ...recentInformes.map(i => ({ tipo: 'Informe', fecha: i.created_at || i.fecha, nombre: i.establecimiento_nombre, profesional: i.arquitecto?.nombre || '-', estado: i.estado, id: i.id, link: `/informe/${i.id}` })),
    ];
    return items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 15);
  }, [recentActas, recentInformes]);

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const doughnutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } } };

  const renderActaRow = (acta, i) => {
    const emplazamientoValor = acta.emplazamiento_valor;
    const emplazamientoTipo = acta.emplazamiento_tipo || '';
    const dueText = emplazamientoValor != null ? `${emplazamientoValor} ${emplazamientoTipo}`.trim() : '-';
    let rowBgClass = '';
    let statusIndicator = null;
    if (acta.vencimientoStatus === 'vencida') {
      rowBgClass = 'bg-red-50';
      statusIndicator = <span className="ml-2 text-red-600 font-bold text-xs" title="Plazo Vencido">⚠️ VENCIDA</span>;
    } else if (acta.vencimientoStatus === 'proxima') {
      rowBgClass = 'bg-amber-50';
      statusIndicator = <span className="ml-2 text-amber-600 font-bold text-xs" title="Próxima a vencer">⏳ CRÍTICA</span>;
    }
    return (
      <tr key={acta.id} className={`${rowBgClass} ${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-100 transition-colors duration-150`}>
        <td className="p-3 text-base">{formatDateDDMMYYYY(acta.created_at || acta.fecha)}</td>
        <td className="p-3 text-sm font-medium">{acta.inspector?.nombre || acta.inspector?.username || '-'}</td>
        <td className="p-3">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900">{acta.establecimiento_nombre || 'Sin nombre'}</div>
            {statusIndicator}
          </div>
          <div className="text-xs text-gray-400">{acta.expediente}</div>
        </td>
        <td className="p-3 text-xs text-gray-500">
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider bg-blue-100 text-blue-600">
            {acta.establecimiento_tipologia || 'General'}
          </span>
        </td>
        <td className="p-3 text-sm font-medium">
          <div>{dueText}</div>
          {acta.dueDate && <div className="text-xs text-gray-400 font-normal">Vence: {formatDateDDMMYYYY(acta.dueDate)}</div>}
        </td>
        <td className="p-3">
          <button onClick={() => navigate(`/acta/${acta.id}`)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">Ver</button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Panel del Supervisor</h1>
            <p className="text-sm text-gray-300">{usuario?.nombre}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/supervisor/vencimientos" className="px-4 py-2 bg-emerald-700 rounded-lg hover:bg-emerald-600 text-sm">⏰ Vencimientos</Link>
            <Link to="/login" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm">Login Inspector</Link>
            <button onClick={logout} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 text-sm">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {/* TABS */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-5 w-fit flex-wrap">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'actas', label: `Actas ${!loadingActas ? `(${actasFiltradas.length})` : ''}` },
            { key: 'informes', label: `Informes ${!loadingInformes ? `(${informesFiltrados.length})` : ''}` },
            { key: 'transferencias', label: `Transferencias ${!loadingTransferencias ? `(${transferencias.length})` : ''}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 text-sm rounded-lg border-none cursor-pointer transition-all duration-150 ${tab === t.key ? 'bg-white text-gray-800 font-bold shadow-sm' : 'bg-transparent text-gray-500 font-medium'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════ TAB DASHBOARD ═══════════════════════ */}
        {tab === 'dashboard' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs uppercase tracking-widest font-semibold text-indigo-600">Total Actas</div>
                <div className="mt-2 text-3xl font-bold text-gray-800">{actas.length}</div>
                <div className="mt-1 text-xs text-gray-400">{actasEsteMes} este mes</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs uppercase tracking-widest font-semibold text-purple-600">Total Informes</div>
                <div className="mt-2 text-3xl font-bold text-gray-800">{informes.length}</div>
                <div className="mt-1 text-xs text-gray-400">{informesEsteMes} este mes</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs uppercase tracking-widest font-semibold text-red-600">Vencidas</div>
                <div className="mt-2 text-3xl font-bold text-red-600">{vencidasCount}</div>
                <div className="mt-1 text-xs text-gray-400">Plazo expirado</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs uppercase tracking-widest font-semibold text-amber-600">Próximas a Vencer</div>
                <div className="mt-2 text-3xl font-bold text-amber-600">{proximasCount}</div>
                <div className="mt-1 text-xs text-gray-400">Dentro de 72hs</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs uppercase tracking-widest font-semibold text-emerald-600">Transferencias</div>
                <div className="mt-2 text-3xl font-bold text-emerald-600">{transferencias.length}</div>
                <div className="mt-1 text-xs text-gray-400">Total realizadas</div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Actas por Mes</h3>
                <div style={{ height: 260 }}>
                  {actasPorMes.labels.length > 0 ? <Bar data={actasPorMes} options={chartOpts} /> : <div className="text-gray-400 text-center pt-10">Sin datos</div>}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Actas por Inspector</h3>
                <div style={{ height: 260 }}>
                  {actasPorInspector.labels.length > 0 ? <Bar data={actasPorInspector} options={chartOpts} /> : <div className="text-gray-400 text-center pt-10">Sin datos</div>}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Actas por Tipología</h3>
                <div style={{ height: 280 }} className="flex justify-center">
                  {actasPorTipologia.labels.length > 0 ? <Doughnut data={actasPorTipologia} options={doughnutOpts} /> : <div className="text-gray-400 text-center pt-10">Sin datos</div>}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Informes por Tipología</h3>
                <div style={{ height: 280 }} className="flex justify-center">
                  {informesPorTipologia.labels.length > 0 ? <Doughnut data={informesPorTipologia} options={doughnutOpts} /> : <div className="text-gray-400 text-center pt-10">Sin datos</div>}
                </div>
              </div>
            </div>

            {/* Recent activity table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">Actividad Reciente</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Tipo', 'Fecha', 'Establecimiento', 'Profesional', 'Estado'].map(h => (
                        <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentCombined.map((item, i) => (
                      <tr key={`${item.tipo}-${item.id}`} className={`${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50 cursor-pointer`} onClick={() => navigate(item.link)}>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${item.tipo === 'Acta' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {item.tipo}
                          </span>
                        </td>
                        <td className="p-3 text-sm">{formatDateDDMMYYYY(item.fecha)}</td>
                        <td className="p-3 text-sm font-medium">{item.nombre || '-'}</td>
                        <td className="p-3 text-sm">{item.profesional}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${item.estado === 'cerrado' ? 'bg-green-100 text-green-700' : item.estado === 'firmado' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.estado?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {recentCombined.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-gray-400">Sin actividad reciente</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════════ TAB ACTAS ═══════════════════════ */}
        {tab === 'actas' && (
          <>
            <div className="card mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Filtros Actas</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportarActas('csv')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">📥 CSV</button>
                  <button onClick={() => exportarActas('xlsx')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">📥 Excel</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inspector</label>
                  <select value={filtrosActas.inspector_id} onChange={e => setFiltrosActas(p => ({ ...p, inspector_id: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todos</option>
                    {inspectores.map(ins => <option key={ins.id} value={ins.id}>{ins.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipología</label>
                  <select value={filtrosActas.tipologia} onChange={e => setFiltrosActas(p => ({ ...p, tipologia: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todas</option>
                    {tipologiasActas.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
                  <input type="date" value={filtrosActas.fechaDesde} onChange={e => setFiltrosActas(p => ({ ...p, fechaDesde: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
                  <input type="date" value={filtrosActas.fechaHasta} onChange={e => setFiltrosActas(p => ({ ...p, fechaHasta: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 mb-5 sm:grid-cols-3">
              <button type="button" onClick={() => setVencimientoFilter('vencida')}
                className={`rounded-3xl p-5 text-left shadow-sm transition duration-150 ${vencimientoFilter === 'vencida' ? 'ring-2 ring-offset-2 ring-red-500 bg-red-50' : 'bg-white hover:bg-red-50'}`}>
                <div className="text-xs uppercase tracking-widest font-semibold text-red-600">Actas Vencidas</div>
                <div className="mt-3 text-3xl font-bold text-red-700">{vencidasCount}</div>
                <div className="mt-2 text-sm text-red-500">Plazo expirado</div>
              </button>
              <button type="button" onClick={() => setVencimientoFilter('proxima')}
                className={`rounded-3xl p-5 text-left shadow-sm transition duration-150 ${vencimientoFilter === 'proxima' ? 'ring-2 ring-offset-2 ring-amber-500 bg-amber-50' : 'bg-white hover:bg-amber-50'}`}>
                <div className="text-xs uppercase tracking-widest font-semibold text-amber-700">Próximas a Vencer</div>
                <div className="mt-3 text-3xl font-bold text-amber-800">{proximasCount}</div>
                <div className="mt-2 text-sm text-amber-600">Dentro de las próximas 72 horas</div>
              </button>
              <button type="button" onClick={() => setVencimientoFilter('alDia')}
                className={`rounded-3xl p-5 text-left shadow-sm transition duration-150 ${vencimientoFilter === 'alDia' ? 'ring-2 ring-offset-2 ring-emerald-500 bg-emerald-50' : 'bg-white hover:bg-emerald-50'}`}>
                <div className="text-xs uppercase tracking-widest font-semibold text-emerald-700">En Plazo / Al día</div>
                <div className="mt-3 text-3xl font-bold text-emerald-800">{alDiaCount}</div>
                <div className="mt-2 text-sm text-emerald-600">Tiempo suficiente</div>
              </button>
            </div>
            <div className="flex items-center justify-between mb-4 gap-3">
              <div className="text-sm text-gray-500">
                Filtro de plazo activo: <span className="font-semibold">{vencimientoFilter === 'all' ? 'Todos' : vencimientoFilter === 'vencida' ? 'Vencidas' : vencimientoFilter === 'proxima' ? 'Próximas' : 'Al día'}</span>
              </div>
              <button type="button" onClick={() => setVencimientoFilter('all')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Ver todas las alertas</button>
            </div>

            {loadingActas ? (
              <div className="text-center py-10 text-gray-400">Cargando actas...</div>
            ) : actasFiltradas.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">No hay actas con los filtros seleccionados.</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Fecha creada', 'Inspector', 'Establecimiento', 'Tipología', 'Plazo Emplazamiento', 'Acciones'].map(h => (
                        <th key={h} className="p-3 text-left text-sm font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{actasFiltradas.map(renderActaRow)}</tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════ TAB INFORMES ═══════════════════════ */}
        {tab === 'informes' && (
          <>
            <div className="card mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide">Filtros Informes</h2>
                <div className="flex gap-2">
                  <button onClick={() => exportarInformes('csv')} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">📥 CSV</button>
                  <button onClick={() => exportarInformes('xlsx')} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">📥 Excel</button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Arquitecto</label>
                  <select value={filtrosInformes.arquitecto_id} onChange={e => setFiltrosInformes(p => ({ ...p, arquitecto_id: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todos</option>
                    {arquitectos.map(arq => <option key={arq?.id} value={arq?.id}>{arq?.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tipología</label>
                  <select value={filtrosInformes.tipo} onChange={e => setFiltrosInformes(p => ({ ...p, tipo: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todas</option>
                    <option value="geriatrico">Geriátrico</option>
                    <option value="otro">Otras tipologías</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Estado</label>
                  <select value={filtrosInformes.estado} onChange={e => setFiltrosInformes(p => ({ ...p, estado: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todos</option>
                    <option value="borrador">Borrador</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
              </div>
            </div>

            {loadingInformes ? (
              <div className="text-center py-10 text-gray-400">Cargando informes...</div>
            ) : informesFiltrados.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">No hay informes con los filtros seleccionados.</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Fecha', 'Arquitecto', 'Establecimiento', 'Tipología', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {informesFiltrados.map((inf, i) => {
                      const tipo = detectarTipoInforme(inf);
                      const esGer = esGeriatrico(tipo);
                      const displayTipo = inf.datos_formulario?.tipologia_nombre || tipo;
                      const cargandoEste = pdfCargando === inf.id;
                      const badgeTipoClass = esGer ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
                      const badgeEstadoClass = inf.estado === 'borrador' ? 'bg-amber-100 text-amber-700' : inf.estado === 'cerrado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
                      return (
                        <tr key={inf.id} className={`${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                          <td className="p-3 text-sm">{inf.fecha || '-'}</td>
                          <td className="p-3 text-sm font-medium">{inf.arquitecto?.nombre || '-'}</td>
                          <td className="p-3">
                            <div className="text-sm font-medium">{inf.establecimiento_nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-400">{inf.expediente}</div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${badgeTipoClass}`}>
                              {displayTipo.charAt(0).toUpperCase() + displayTipo.slice(1)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider ${badgeEstadoClass}`}>
                              {inf.estado?.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => navigate(`/informe/${inf.id}`)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">Ver</button>
                              <button onClick={() => generarPDFInforme(inf)} disabled={cargandoEste}
                                className={`px-3 py-1 rounded text-xs font-medium text-white ${cargandoEste ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}>
                                {cargandoEste ? '...' : 'PDF'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════ TAB TRANSFERENCIAS ═══════════════════════ */}
        {tab === 'transferencias' && (
          <>
            <div className="card mb-5">
              <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Filtros Transferencias</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Arquitecto Origen</label>
                  <select value={filtrosTransferencias.arquitecto_origen_id} onChange={e => setFiltrosTransferencias(p => ({ ...p, arquitecto_origen_id: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todos</option>
                    {arquitectos.map(arq => <option key={arq?.id} value={arq?.id}>{arq?.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Arquitecto Destino</label>
                  <select value={filtrosTransferencias.arquitecto_destino_id} onChange={e => setFiltrosTransferencias(p => ({ ...p, arquitecto_destino_id: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit">
                    <option value="">Todos</option>
                    {arquitectos.map(arq => <option key={arq?.id} value={arq?.id}>{arq?.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Desde</label>
                  <input type="date" value={filtrosTransferencias.fechaDesde} onChange={e => setFiltrosTransferencias(p => ({ ...p, fechaDesde: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hasta</label>
                  <input type="date" value={filtrosTransferencias.fechaHasta} onChange={e => setFiltrosTransferencias(p => ({ ...p, fechaHasta: e.target.value }))}
                    className="w-full box-border p-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-inherit" />
                </div>
              </div>
            </div>

            {loadingTransferencias ? (
              <div className="text-center py-10 text-gray-400">Cargando transferencias...</div>
            ) : transferencias.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">No hay transferencias registradas.</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Fecha', 'Origen', 'Destino', 'Establecimiento', 'Motivo'].map(h => (
                        <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transferencias
                      .filter(t => {
                        if (filtrosTransferencias.arquitecto_origen_id && t.arquitecto_origen_id !== filtrosTransferencias.arquitecto_origen_id) return false;
                        if (filtrosTransferencias.arquitecto_destino_id && t.arquitecto_destino_id !== filtrosTransferencias.arquitecto_destino_id) return false;
                        if (filtrosTransferencias.fechaDesde) {
                          const fecha = new Date(t.created_at);
                          if (fecha < new Date(filtrosTransferencias.fechaDesde + 'T00:00:00')) return false;
                        }
                        if (filtrosTransferencias.fechaHasta) {
                          const fecha = new Date(t.created_at);
                          if (fecha > new Date(filtrosTransferencias.fechaHasta + 'T23:59:59')) return false;
                        }
                        return true;
                      })
                      .map((t, i) => (
                        <tr key={t.id} className={`${i > 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                          <td className="p-3 text-sm">{formatDateDDMMYYYY(t.created_at)}</td>
                          <td className="p-3 text-sm font-medium">{t.arquitecto_origen?.nombre || '-'}</td>
                          <td className="p-3 text-sm font-medium">{t.arquitecto_destino?.nombre || '-'}</td>
                          <td className="p-3">
                            <div className="text-sm font-medium">{t.informe?.establecimiento_nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-400">{t.informe?.expediente}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600 max-w-[200px] truncate">{t.motivo || '-'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
