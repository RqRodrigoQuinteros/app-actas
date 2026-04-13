import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { actasAPI, informesAPI } from '../utils/api';
import api from '../utils/api';

const S = {
  pill: (active) => ({
    padding: '8px 20px', fontSize: '13px', fontWeight: active ? 700 : 500,
    borderRadius: '8px', border: 'none', cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    color: active ? '#1f2937' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.15s',
  }),
  badge: (color) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
    background: color + '20', color,
  }),
  filterLabel: {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#6b7280', marginBottom: '4px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  filterInput: {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', fontSize: '13px',
    border: '1.5px solid #e5e7eb', borderRadius: '7px',
    background: '#f9fafb', color: '#111827', fontFamily: 'inherit',
  },
};

const ESTADO_COLORS = {
  borrador: '#d97706', firmado: '#2563eb', cerrado: '#16a34a',
};
const TIPOLOGIA_COLORS = {
  geriatrico: '#7c3aed', otro: '#6b7280',
};

export default function SupervisorDash() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('actas'); // 'actas' | 'informes'

  // ── ACTAS ─────────────────────────────────────────────────────────────────
  const [actas, setActas] = useState([]);
  const [loadingActas, setLoadingActas] = useState(true);
  const [inspectores, setInspectores] = useState([]);
  const [filtrosActas, setFiltrosActas] = useState({
    inspector_id: '', estado: '', fechaDesde: '', fechaHasta: '',
  });

  // ── INFORMES ──────────────────────────────────────────────────────────────
  const [informes, setInformes] = useState([]);
  const [loadingInformes, setLoadingInformes] = useState(true);
  const [arquitectos, setArquitectos] = useState([]);
  const [filtrosInformes, setFiltrosInformes] = useState({
    arquitecto_id: '', tipo: '', estado: '',
  });
  const [pdfCargando, setPdfCargando] = useState(null);

  useEffect(() => { loadActas(); }, [filtrosActas]);
  useEffect(() => { loadInformes(); }, []);

  const loadActas = async () => {
    setLoadingActas(true);
    try {
      const response = await actasAPI.getAll(filtrosActas);
      setActas(response.data);
      const uniq = [...new Map(response.data.map(a => [a.inspector_id, a.inspector])).values()]
        .filter(Boolean);
      setInspectores(uniq);
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
      const uniq = [...new Map(
        response.data.map(i => [i.arquitecto_id, i.arquitecto])
      ).values()].filter(Boolean);
      setArquitectos(uniq);
    } catch (err) {
      console.error('Error cargando informes:', err);
    } finally {
      setLoadingInformes(false);
    }
  };

  const toggleCidi = async (id) => {
    try { await actasAPI.toggleCidi(id); loadActas(); }
    catch (err) { console.error('Error toggling CIDI:', err); }
  };

  const generarPDFInforme = async (informe) => {
    setPdfCargando(informe.id);
    try {
      const tipo = informe.tipo || informe.datos_formulario?.tipo || 'geriatrico';
      let response;
      if (tipo === 'geriatrico') {
        const df = informe.datos_formulario?.generales || {};
        const checks = informe.datos_formulario?.checks || {};
        const obsArt = informe.datos_formulario?.observaciones || {};
        const articulosObservados = Object.keys(checks)
          .filter(nro => checks[nro])
          .map(nro => ({ nro, desc: '', obs: obsArt[nro] || '' }));
        response = await api.post('/pdf/geriatrico', { ...df, articulosObservados }, { responseType: 'blob' });
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

  // Filtros aplicados en frontend para informes (ya los trae todos)
  const informesFiltrados = informes.filter(inf => {
    if (filtrosInformes.arquitecto_id && inf.arquitecto_id !== filtrosInformes.arquitecto_id) return false;
    if (filtrosInformes.tipo && (inf.tipo || 'geriatrico') !== filtrosInformes.tipo) return false;
    if (filtrosInformes.estado && inf.estado !== filtrosInformes.estado) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-gray-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Panel del Supervisor</h1>
            <p className="text-sm text-gray-300">{usuario?.nombre}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm">
              Login Inspector
            </Link>
            <button onClick={logout} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 text-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">

        {/* TABS */}
        <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '20px', width: 'fit-content' }}>
          <button style={S.pill(tab === 'actas')} onClick={() => setTab('actas')}>
            Actas de Inspección {!loadingActas && `(${actas.length})`}
          </button>
          <button style={S.pill(tab === 'informes')} onClick={() => setTab('informes')}>
            Informes de Arquitectura {!loadingInformes && `(${informesFiltrados.length})`}
          </button>
        </div>

        {/* ── TAB ACTAS ── */}
        {tab === 'actas' && (
          <>
            {/* Filtros actas */}
            <div className="card mb-5">
              <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Filtros</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label style={S.filterLabel}>Inspector</label>
                  <select value={filtrosActas.inspector_id}
                    onChange={e => setFiltrosActas(p => ({ ...p, inspector_id: e.target.value }))}
                    style={S.filterInput}>
                    <option value="">Todos</option>
                    {inspectores.map(ins => (
                      <option key={ins?.id} value={ins?.id}>{ins?.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.filterLabel}>Estado</label>
                  <select value={filtrosActas.estado}
                    onChange={e => setFiltrosActas(p => ({ ...p, estado: e.target.value }))}
                    style={S.filterInput}>
                    <option value="">Todos</option>
                    <option value="borrador">Borrador</option>
                    <option value="firmado">Firmado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>
                <div>
                  <label style={S.filterLabel}>Desde</label>
                  <input type="date" value={filtrosActas.fechaDesde}
                    onChange={e => setFiltrosActas(p => ({ ...p, fechaDesde: e.target.value }))}
                    style={S.filterInput} />
                </div>
                <div>
                  <label style={S.filterLabel}>Hasta</label>
                  <input type="date" value={filtrosActas.fechaHasta}
                    onChange={e => setFiltrosActas(p => ({ ...p, fechaHasta: e.target.value }))}
                    style={S.filterInput} />
                </div>
              </div>
            </div>

            {loadingActas ? (
              <div className="text-center py-10 text-gray-400">Cargando actas...</div>
            ) : actas.length === 0 ? (
              <div className="card text-center py-8 text-gray-400">No hay actas con los filtros seleccionados.</div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Fecha', 'Inspector', 'Establecimiento', 'Tipología', 'Estado', 'CIDI', 'Acciones'].map(h => (
                        <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {actas.map((acta, i) => (
                      <tr key={acta.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                        className="hover:bg-gray-50">
                        <td className="p-3 text-sm">{acta.fecha || '-'}</td>
                        <td className="p-3 text-sm font-medium">{acta.inspector?.nombre || '-'}</td>
                        <td className="p-3">
                          <div className="text-sm font-medium">{acta.establecimiento_nombre || 'Sin nombre'}</div>
                          <div className="text-xs text-gray-400">{acta.expediente}</div>
                        </td>
                        <td className="p-3 text-xs text-gray-500">{acta.establecimiento_tipologia || '-'}</td>
                        <td className="p-3">
                          <span style={S.badge(ESTADO_COLORS[acta.estado] || '#6b7280')}>
                            {acta.estado?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => toggleCidi(acta.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold ${acta.subido_cidi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {acta.subido_cidi ? 'Subido' : 'Pendiente'}
                          </button>
                        </td>
                        <td className="p-3">
                          <Link to={`/acta/${acta.id}`} className="text-blue-600 hover:underline text-sm">Ver</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── TAB INFORMES ── */}
        {tab === 'informes' && (
          <>
            {/* Filtros informes */}
            <div className="card mb-5">
              <h2 className="font-bold text-sm text-gray-500 uppercase tracking-wide mb-3">Filtros</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label style={S.filterLabel}>Arquitecto</label>
                  <select value={filtrosInformes.arquitecto_id}
                    onChange={e => setFiltrosInformes(p => ({ ...p, arquitecto_id: e.target.value }))}
                    style={S.filterInput}>
                    <option value="">Todos</option>
                    {arquitectos.map(arq => (
                      <option key={arq?.id} value={arq?.id}>{arq?.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={S.filterLabel}>Tipología</label>
                  <select value={filtrosInformes.tipo}
                    onChange={e => setFiltrosInformes(p => ({ ...p, tipo: e.target.value }))}
                    style={S.filterInput}>
                    <option value="">Todas</option>
                    <option value="geriatrico">Geriátrico</option>
                  </select>
                </div>
                <div>
                  <label style={S.filterLabel}>Estado</label>
                  <select value={filtrosInformes.estado}
                    onChange={e => setFiltrosInformes(p => ({ ...p, estado: e.target.value }))}
                    style={S.filterInput}>
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
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Fecha', 'Arquitecto', 'Establecimiento', 'Tipología', 'Estado', 'Acciones'].map(h => (
                        <th key={h} className="p-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {informesFiltrados.map((inf, i) => {
                      const tipo = inf.tipo || inf.datos_formulario?.tipo || 'geriatrico';
                      const cargandoEste = pdfCargando === inf.id;
                      return (
                        <tr key={inf.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                          className="hover:bg-gray-50">
                          <td className="p-3 text-sm">{inf.fecha || '-'}</td>
                          <td className="p-3 text-sm font-medium">{inf.arquitecto?.nombre || '-'}</td>
                          <td className="p-3">
                            <div className="text-sm font-medium">{inf.establecimiento_nombre || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-400">{inf.expediente}</div>
                          </td>
                          <td className="p-3">
                            <span style={S.badge(TIPOLOGIA_COLORS[tipo] || '#6b7280')}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span style={S.badge(ESTADO_COLORS[inf.estado] || '#6b7280')}>
                              {inf.estado?.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3">
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                onClick={() => navigate(`/informe/geriatricos/${inf.id}`)}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200">
                                Ver
                              </button>
                              <button
                                onClick={() => generarPDFInforme(inf)}
                                disabled={cargandoEste}
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
      </main>
    </div>
  );
}