import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Consultas() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [filtros, setFiltros] = useState({ expediente: '', establecimiento: '', inspector: '', arquitecto: '' });
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [descargandoId, setDescargandoId] = useState(null);

  const handleChange = (campo) => (e) => {
    setFiltros(prev => ({ ...prev, [campo]: e.target.value }));
  };

  const tieneFiltros = Object.values(filtros).some(v => v.trim().length >= 2);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!tieneFiltros) return;

    setCargando(true);
    setError('');
    setResultados(null);

    try {
      const params = {};
      Object.entries(filtros).forEach(([k, v]) => {
        if (v.trim().length >= 2) params[k] = v.trim();
      });
      const res = await api.get('/consultas', { params });
      setResultados(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al buscar');
    } finally {
      setCargando(false);
    }
  };

  const handleDescargarPDF = async (item) => {
    setDescargandoId(item.id);
    setError('');
    try {
      let response;
      if (item._tipo === 'acta') {
        response = await api.post(`/pdf/generar/${item.id}`, {}, { responseType: 'blob' });
      } else {
        response = await api.post(`/pdf/informe/${item.id}`, {}, { responseType: 'blob' });
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const nombre = `${item._tipo}_${item._titulo || 'documento'}_${item.expediente || 'sin_exp'}.pdf`
        .replace(/[^a-zA-Z0-9_.\-\s]/g, '_');
      link.setAttribute('download', nombre);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar el PDF');
    } finally {
      setDescargandoId(null);
    }
  };

  const formatFecha = (f) => {
    if (!f) return '-';
    const d = new Date(f.split('T')[0] + 'T12:00:00');
    if (isNaN(d.getTime())) return f;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const S = {
    container: { fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: '960px', margin: '0 auto', padding: '1.5rem 1rem 4rem', color: '#111827' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    headerTitle: { fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 },
    userBadge: { fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '4px 12px', borderRadius: '20px' },
    searchCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
    label: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' },
    input: { width: '100%', padding: '8px 12px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' },
    fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' },
    btnRow: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
    btn: { padding: '9px 24px', fontSize: '13px', fontWeight: 700, border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', background: '#2563eb' },
    btnOutline: { padding: '9px 24px', fontSize: '13px', fontWeight: 600, border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', background: '#fff', color: '#6b7280' },
    btnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    resultCard: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 18px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
    badge: (tipo) => ({
      fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '20px', letterSpacing: '0.03em',
      background: tipo === 'acta' ? '#dbeafe' : '#f3e8ff',
      color: tipo === 'acta' ? '#1d4ed8' : '#7c3aed',
    }),
    estadoBadge: (estado) => ({
      fontSize: '11px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px',
      background: estado === 'borrador' ? '#fef3c7' : estado === 'cerrado' || estado === 'firmado' ? '#d1fae5' : '#f3f4f6',
      color: estado === 'borrador' ? '#92400e' : estado === 'cerrado' || estado === 'firmado' ? '#065f46' : '#6b7280',
    }),
    downloadBtn: { padding: '7px 16px', fontSize: '12px', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', background: '#059669', whiteSpace: 'nowrap' },
    empty: { textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af', fontSize: '14px' },
    errorBox: { marginBottom: '1rem', padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626' },
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div>
          <h1 style={S.headerTitle}>Consultas</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
            {usuario?.nombre} <span style={S.userBadge}>AUDITOR</span>
          </p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', background: '#fff', color: '#6b7280' }}>
          Cerrar sesión
        </button>
      </div>

      <div style={S.searchCard}>
        <form onSubmit={handleSearch}>
          <div style={S.fieldGrid}>
            <div>
              <label style={S.label}>N° Expediente</label>
              <input type="text" value={filtros.expediente} onChange={handleChange('expediente')} placeholder="Ej: 1234/2026" style={S.input} autoFocus />
            </div>
            <div>
              <label style={S.label}>Nombre Establecimiento</label>
              <input type="text" value={filtros.establecimiento} onChange={handleChange('establecimiento')} placeholder="Ej: Hogar San José" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Inspector</label>
              <input type="text" value={filtros.inspector} onChange={handleChange('inspector')} placeholder="Nombre del inspector" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Arquitecto</label>
              <input type="text" value={filtros.arquitecto} onChange={handleChange('arquitecto')} placeholder="Nombre del arquitecto" style={S.input} />
            </div>
          </div>
          <div style={S.btnRow}>
            <button type="button" onClick={() => { setFiltros({ expediente: '', establecimiento: '', inspector: '', arquitecto: '' }); setResultados(null); setError(''); }} style={S.btnOutline}>
              Limpiar
            </button>
            <button type="submit" disabled={cargando || !tieneFiltros} style={{ ...S.btn, ...(cargando || !tieneFiltros ? S.btnDisabled : {}) }}>
              {cargando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>
      </div>

      {error && <div style={S.errorBox}>{error}</div>}

      {resultados !== null && resultados.length === 0 && (
        <div style={S.empty}>
          <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Sin resultados</p>
          <p>No se encontraron actas ni informes con esos filtros.</p>
        </div>
      )}

      {resultados !== null && resultados.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
            {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
          </p>
          {resultados.map((item) => (
            <div key={`${item._tipo}-${item.id}`} style={S.resultCard}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={S.badge(item._tipo)}>{item._tipo === 'acta' ? 'ACTA' : 'INFORME'}</span>
                  {item.estado && <span style={S.estadoBadge(item.estado)}>{item.estado}</span>}
                </div>
                <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 600, color: '#111827' }}>{item._titulo}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {item._responsable}
                  {item.expediente ? ` · Exp: ${item.expediente}` : ''}
                  {item.fecha ? ` · ${formatFecha(item.fecha)}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleDescargarPDF(item)}
                disabled={descargandoId === item.id}
                style={{ ...S.downloadBtn, ...(descargandoId === item.id ? { opacity: 0.6, cursor: 'not-allowed' } : {}) }}
              >
                {descargandoId === item.id ? 'Descargando...' : '⬇ PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
