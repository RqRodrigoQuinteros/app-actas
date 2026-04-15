import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { templatesAPI } from '../utils/api';

// ─── Estilos ────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh', background: '#f3f4f6', fontFamily: 'inherit',
  },
  header: {
    background: '#fff', borderBottom: '1.5px solid #e5e7eb',
    padding: '0 24px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: '56px',
  },
  headerTitle: { fontSize: '16px', fontWeight: 700, color: '#111827' },
  headerSub: { fontSize: '12px', color: '#6b7280', marginTop: '1px' },
  backBtn: {
    padding: '6px 14px', fontSize: '13px', borderRadius: '7px',
    border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer',
    color: '#374151', fontWeight: 500,
  },
  body: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  tabs: {
    display: 'flex', gap: '4px', background: '#e5e7eb',
    borderRadius: '10px', padding: '4px', marginBottom: '24px',
    width: 'fit-content',
  },
  tab: (active) => ({
    padding: '7px 18px', fontSize: '13px', fontWeight: active ? 700 : 500,
    borderRadius: '7px', border: 'none', cursor: 'pointer',
    background: active ? '#fff' : 'transparent',
    color: active ? '#1f2937' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
    transition: 'all 0.15s',
  }),
  card: {
    background: '#fff', borderRadius: '12px',
    border: '1.5px solid #e5e7eb', overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { fontSize: '14px', fontWeight: 700, color: '#111827' },
  cardBody: { padding: '20px' },
  btn: (color = 'blue') => ({
    padding: '7px 14px', fontSize: '12px', fontWeight: 600,
    borderRadius: '7px', border: 'none', cursor: 'pointer',
    background: color === 'blue' ? '#2563eb' : color === 'red' ? '#dc2626' : color === 'green' ? '#16a34a' : '#6b7280',
    color: '#fff', transition: 'opacity 0.15s',
  }),
  btnOutline: {
    padding: '6px 12px', fontSize: '12px', fontWeight: 600,
    borderRadius: '7px', border: '1.5px solid #e5e7eb',
    background: '#fff', cursor: 'pointer', color: '#374151',
  },
  input: {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
    fontSize: '13px', border: '1.5px solid #e5e7eb', borderRadius: '7px',
    background: '#f9fafb', color: '#111827', fontFamily: 'inherit',
    outline: 'none',
  },
  textarea: {
    width: '100%', boxSizing: 'border-box', padding: '8px 10px',
    fontSize: '13px', border: '1.5px solid #e5e7eb', borderRadius: '7px',
    background: '#f9fafb', color: '#111827', fontFamily: 'inherit',
    resize: 'vertical', minHeight: '80px', outline: 'none',
  },
  label: {
    display: 'block', fontSize: '11px', fontWeight: 700,
    color: '#6b7280', marginBottom: '4px',
    textTransform: 'uppercase', letterSpacing: '0.06em',
  },
  select: {
    padding: '8px 10px', fontSize: '13px', borderRadius: '7px',
    border: '1.5px solid #e5e7eb', background: '#f9fafb',
    color: '#111827', fontFamily: 'inherit', cursor: 'pointer',
  },
  tipologiaItem: (selected) => ({
    padding: '12px 16px', cursor: 'pointer', fontSize: '13px',
    borderBottom: '1px solid #f3f4f6', fontWeight: selected ? 700 : 400,
    background: selected ? '#eff6ff' : '#fff',
    color: selected ? '#2563eb' : '#374151',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'background 0.1s',
  }),
  seccionBox: {
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    marginBottom: '12px', overflow: 'hidden',
  },
  seccionHeader: {
    padding: '10px 14px', background: '#f9fafb',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderBottom: '1px solid #e5e7eb',
  },
  campoRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 14px', borderBottom: '1px solid #f9fafb',
    fontSize: '13px', color: '#374151',
  },
  tipoBadge: (tipo) => {
    const colors = {
      si_no: ['#dcfce7', '#16a34a'], texto: ['#dbeafe', '#2563eb'],
      textarea: ['#e0e7ff', '#4f46e5'], numero: ['#fef3c7', '#d97706'],
      fecha: ['#fce7f3', '#be185d'], select: ['#f3e8ff', '#7c3aed'],
      check: ['#ecfdf5', '#059669'],
    };
    const [bg, color] = colors[tipo] || ['#f3f4f6', '#6b7280'];
    return {
      display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 700, background: bg, color,
    };
  },
  alert: (type) => ({
    padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
    marginBottom: '16px',
    background: type === 'error' ? '#fef2f2' : '#f0fdf4',
    color: type === 'error' ? '#dc2626' : '#16a34a',
    border: `1px solid ${type === 'error' ? '#fecaca' : '#bbf7d0'}`,
  }),
};

const TIPOS_CAMPO = [
  { value: 'si_no', label: 'SI / NO' },
  { value: 'texto', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'numero', label: 'Número' },
  { value: 'fecha', label: 'Fecha' },
  { value: 'select', label: 'Desplegable' },
  { value: 'check', label: 'Checkbox' },
];

// ─── Subcomponente: Modal genérico ───────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '14px', width: '100%',
        maxWidth: '480px', maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, fontSize: '15px' }}>{title}</span>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '20px',
            cursor: 'pointer', color: '#6b7280', lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Tab: Encabezado ─────────────────────────────────────────────────────────
function TabEncabezado() {
  const [encabezado, setEncabezado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({ texto_html: '', texto_emplazamiento: '' });

  useEffect(() => {
    templatesAPI.getEncabezado()
      .then(r => {
        setEncabezado(r.data);
        setForm({ texto_html: r.data.texto_html, texto_emplazamiento: r.data.texto_emplazamiento });
      })
      .catch(() => setMsg({ type: 'error', text: 'Error al cargar encabezado' }))
      .finally(() => setLoading(false));
  }, []);

  const guardar = async () => {
    setGuardando(true);
    setMsg(null);
    try {
      await templatesAPI.updateEncabezado(form);
      setMsg({ type: 'ok', text: 'Encabezado guardado correctamente' });
    } catch {
      setMsg({ type: 'error', text: 'Error al guardar' });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p style={{ color: '#6b7280', fontSize: '13px' }}>Cargando...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Texto del encabezado</span>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            Tokens: {'{{fecha}}'} {'{{hora}}'} {'{{inspector_nombre}}'} {'{{inspector_dni}}'} {'{{establecimiento_nombre}}'} {'{{establecimiento_localidad}}'} {'{{responsable_nombre}}'} {'{{responsable_dni}}'} {'{{responsable_cargo}}'}
          </span>
        </div>
        <div style={S.cardBody}>
          <label style={S.label}>HTML del encabezado (con tokens)</label>
          <textarea
            style={{ ...S.textarea, minHeight: '180px', fontFamily: 'monospace', fontSize: '12px' }}
            value={form.texto_html}
            onChange={e => setForm(f => ({ ...f, texto_html: e.target.value }))}
          />
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardTitle}>Texto del emplazamiento</span>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>
            Tokens: {'{{emplazamiento_valor}}'} {'{{emplazamiento_tipo}}'}
          </span>
        </div>
        <div style={S.cardBody}>
          <textarea
            style={{ ...S.textarea, fontFamily: 'monospace', fontSize: '12px' }}
            value={form.texto_emplazamiento}
            onChange={e => setForm(f => ({ ...f, texto_emplazamiento: e.target.value }))}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={S.btn('green')} onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}

// ─── Tab: Tipologías ─────────────────────────────────────────────────────────
function TabTipologias() {
  const [tipologias, setTipologias] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Modales
  const [modalTipologia, setModalTipologia] = useState(false);
  const [modalSeccion, setModalSeccion] = useState(false);
  const [modalCampo, setModalCampo] = useState(null); // { seccionId }
  const [editandoSeccion, setEditandoSeccion] = useState(null);
  const [editandoCampo, setEditandoCampo] = useState(null);

  const cargarTipologias = async () => {
    try {
      const r = await templatesAPI.getTipologias(true);
      setTipologias(r.data);
    } catch {
      setMsg({ type: 'error', text: 'Error al cargar tipologías' });
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalle = async (id) => {
    try {
      const r = await templatesAPI.getTipologia(id);
      setSeleccionada(r.data);
    } catch {
      setMsg({ type: 'error', text: 'Error al cargar tipología' });
    }
  };

  useEffect(() => { cargarTipologias(); }, []);

  const seleccionar = (tip) => cargarDetalle(tip.id);

  // ── Nueva tipología ──────────────────────────────────────────────────────
  function FormNuevaTipologia({ onClose }) {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
      if (!nombre.trim()) return setError('El nombre es requerido');
      setGuardando(true);
      try {
        await templatesAPI.crearTipologia({ nombre: nombre.trim(), descripcion });
        await cargarTipologias();
        onClose();
      } catch (e) {
        setError(e.response?.data?.error || 'Error al crear');
      } finally {
        setGuardando(false);
      }
    };

    return (
      <>
        {error && <div style={S.alert('error')}>{error}</div>}
        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>Nombre *</label>
          <input style={S.input} value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="ej: Farmacia, Clínica, UTI" autoFocus />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={S.label}>Descripción (opcional)</label>
          <input style={S.input} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={S.btnOutline} onClick={onClose}>Cancelar</button>
          <button style={S.btn('blue')} onClick={guardar} disabled={guardando}>
            {guardando ? 'Creando...' : 'Crear tipología'}
          </button>
        </div>
      </>
    );
  }

  // ── Nueva / editar sección ───────────────────────────────────────────────
  function FormSeccion({ seccion, tipologiaId, onClose }) {
    const [titulo, setTitulo] = useState(seccion?.titulo || '');
    const [textoPrevio, setTextoPrevio] = useState(seccion?.texto_previo || '');
    const [textoPosterior, setTextoPosterior] = useState(seccion?.texto_posterior || '');
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
      if (!titulo.trim()) return setError('El título es requerido');
      setGuardando(true);
      try {
        if (seccion) {
          await templatesAPI.actualizarSeccion(seccion.id, {
            titulo, texto_previo: textoPrevio || null, texto_posterior: textoPosterior || null,
          });
        } else {
          await templatesAPI.crearSeccion(tipologiaId, {
            titulo, texto_previo: textoPrevio || null, texto_posterior: textoPosterior || null,
          });
        }
        await cargarDetalle(tipologiaId || seleccionada.id);
        onClose();
      } catch (e) {
        setError(e.response?.data?.error || 'Error al guardar');
      } finally {
        setGuardando(false);
      }
    };

    return (
      <>
        {error && <div style={S.alert('error')}>{error}</div>}
        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>Título de la sección *</label>
          <input style={S.input} value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="ej: REGISTROS, DATOS GENERALES" autoFocus />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={S.label}>Texto previo (opcional)</label>
          <textarea style={S.textarea} value={textoPrevio}
            onChange={e => setTextoPrevio(e.target.value)}
            placeholder="Texto que aparece antes de los campos en el PDF" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={S.label}>Texto posterior (opcional)</label>
          <textarea style={S.textarea} value={textoPosterior}
            onChange={e => setTextoPosterior(e.target.value)}
            placeholder="Texto que aparece después de los campos en el PDF" />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={S.btnOutline} onClick={onClose}>Cancelar</button>
          <button style={S.btn('blue')} onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : seccion ? 'Guardar cambios' : 'Agregar sección'}
          </button>
        </div>
      </>
    );
  }

  // ── Nuevo / editar campo ─────────────────────────────────────────────────
  function FormCampo({ campo, seccionId, onClose }) {
    const [form, setForm] = useState({
      etiqueta: campo?.etiqueta || '',
      tipo: campo?.tipo || 'si_no',
      opciones: campo?.opciones ? campo.opciones.join('\n') : '',
      requerido: campo?.requerido || false,
      placeholder: campo?.placeholder || '',
      token: campo?.token || '',
    });
    const [error, setError] = useState('');
    const [guardando, setGuardando] = useState(false);

    // Auto-generar token desde etiqueta
    const generarToken = (etiqueta) => etiqueta
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const handleEtiqueta = (v) => {
      setForm(f => ({
        ...f,
        etiqueta: v,
        token: campo ? f.token : generarToken(v),
      }));
    };

    const guardar = async () => {
      if (!form.etiqueta.trim()) return setError('La etiqueta es requerida');
      if (!form.token.trim()) return setError('El token es requerido');
      if (form.tipo === 'select' && !form.opciones.trim()) {
        return setError('Para tipo Desplegable, ingresá las opciones (una por línea)');
      }
      setGuardando(true);
      try {
        const payload = {
          etiqueta: form.etiqueta.trim(),
          tipo: form.tipo,
          requerido: form.requerido,
          placeholder: form.placeholder || null,
          token: form.token.trim(),
          opciones: form.tipo === 'select'
            ? form.opciones.split('\n').map(o => o.trim()).filter(Boolean)
            : null,
        };
        if (campo) {
          await templatesAPI.actualizarCampo(campo.id, payload);
        } else {
          await templatesAPI.crearCampo(seccionId, payload);
        }
        await cargarDetalle(seleccionada.id);
        onClose();
      } catch (e) {
        setError(e.response?.data?.error || 'Error al guardar');
      } finally {
        setGuardando(false);
      }
    };

    return (
      <>
        {error && <div style={S.alert('error')}>{error}</div>}
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={S.label}>Etiqueta (texto que ve el inspector) *</label>
            <input style={S.input} value={form.etiqueta}
              onChange={e => handleEtiqueta(e.target.value)}
              placeholder="ej: Registro de Historias Clínicas" autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={S.label}>Tipo de campo *</label>
              <select style={{ ...S.select, width: '100%' }}
                value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {TIPOS_CAMPO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={S.label}>Token (para PDF)</label>
              <input style={{ ...S.input, fontFamily: 'monospace', fontSize: '12px' }}
                value={form.token}
                onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
                placeholder="auto-generado" />
            </div>
          </div>

          {form.tipo === 'select' && (
            <div>
              <label style={S.label}>Opciones (una por línea) *</label>
              <textarea style={{ ...S.textarea, minHeight: '80px' }}
                value={form.opciones}
                onChange={e => setForm(f => ({ ...f, opciones: e.target.value }))}
                placeholder={'Bueno\nRegular\nMalo'} />
            </div>
          )}

          <div>
            <label style={S.label}>Placeholder (hint para el inspector)</label>
            <input style={S.input} value={form.placeholder}
              onChange={e => setForm(f => ({ ...f, placeholder: e.target.value }))} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="checkbox" checked={form.requerido}
              onChange={e => setForm(f => ({ ...f, requerido: e.target.checked }))} />
            Campo requerido
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button style={S.btnOutline} onClick={onClose}>Cancelar</button>
          <button style={S.btn('blue')} onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : campo ? 'Guardar cambios' : 'Agregar campo'}
          </button>
        </div>
      </>
    );
  }

  // ── Eliminar sección ─────────────────────────────────────────────────────
  const eliminarSeccion = async (seccionId) => {
    if (!confirm('¿Eliminar esta sección y todos sus campos?')) return;
    try {
      await templatesAPI.eliminarSeccion(seccionId);
      await cargarDetalle(seleccionada.id);
    } catch {
      setMsg({ type: 'error', text: 'Error al eliminar sección' });
    }
  };

  // ── Eliminar campo ───────────────────────────────────────────────────────
  const eliminarCampo = async (campoId) => {
    if (!confirm('¿Eliminar este campo?')) return;
    try {
      await templatesAPI.eliminarCampo(campoId);
      await cargarDetalle(seleccionada.id);
    } catch {
      setMsg({ type: 'error', text: 'Error al eliminar campo' });
    }
  };

  if (loading) return <p style={{ color: '#6b7280', fontSize: '13px' }}>Cargando...</p>;

  return (
    <>
      {msg && <div style={S.alert(msg.type)}>{msg.text}</div>}

      {/* Modales */}
      {modalTipologia && (
        <Modal title="Nueva tipología" onClose={() => setModalTipologia(false)}>
          <FormNuevaTipologia onClose={() => setModalTipologia(false)} />
        </Modal>
      )}
      {modalSeccion && seleccionada && (
        <Modal title="Nueva sección" onClose={() => setModalSeccion(false)}>
          <FormSeccion tipologiaId={seleccionada.id} onClose={() => setModalSeccion(false)} />
        </Modal>
      )}
      {editandoSeccion && (
        <Modal title="Editar sección" onClose={() => setEditandoSeccion(null)}>
          <FormSeccion seccion={editandoSeccion} tipologiaId={seleccionada?.id} onClose={() => setEditandoSeccion(null)} />
        </Modal>
      )}
      {modalCampo && (
        <Modal title="Nuevo campo" onClose={() => setModalCampo(null)}>
          <FormCampo seccionId={modalCampo.seccionId} onClose={() => setModalCampo(null)} />
        </Modal>
      )}
      {editandoCampo && (
        <Modal title="Editar campo" onClose={() => setEditandoCampo(null)}>
          <FormCampo campo={editandoCampo} onClose={() => setEditandoCampo(null)} />
        </Modal>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>

        {/* Lista de tipologías */}
        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>Tipologías</span>
            <button style={S.btn('blue')} onClick={() => setModalTipologia(true)}>+ Nueva</button>
          </div>
          <div>
            {tipologias.length === 0 && (
              <p style={{ padding: '16px', fontSize: '13px', color: '#6b7280' }}>
                No hay tipologías. Creá una para empezar.
              </p>
            )}
            {tipologias.map(tip => (
              <div key={tip.id} style={S.tipologiaItem(seleccionada?.id === tip.id)}
                onClick={() => seleccionar(tip)}>
                <span>{tip.nombre}</span>
                <span style={{ fontSize: '11px', color: tip.activo ? '#16a34a' : '#dc2626' }}>
                  {tip.activo ? 'activa' : 'inactiva'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle de tipología */}
        <div>
          {!seleccionada ? (
            <div style={{
              ...S.card, padding: '40px', textAlign: 'center',
              color: '#6b7280', fontSize: '14px',
            }}>
              Seleccioná una tipología para ver y editar sus secciones y campos
            </div>
          ) : (
            <>
              <div style={{ ...S.cardHeader, ...S.card, marginBottom: '16px' }}>
                <div>
                  <div style={S.cardTitle}>{seleccionada.nombre}</div>
                  {seleccionada.descripcion && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {seleccionada.descripcion}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={S.btn('blue')} onClick={() => setModalSeccion(true)}>
                    + Agregar sección
                  </button>
                  <button style={S.btnOutline} onClick={() => {
                    if (!confirm(`¿${seleccionada.activo ? 'Desactivar' : 'Activar'} esta tipología?`)) return;
                    templatesAPI.actualizarTipologia(seleccionada.id, { activo: !seleccionada.activo })
                      .then(() => { cargarTipologias(); cargarDetalle(seleccionada.id); });
                  }}>
                    {seleccionada.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>

              {/* Secciones */}
              {(seleccionada.secciones || []).length === 0 && (
                <div style={{
                  ...S.card, padding: '32px', textAlign: 'center',
                  color: '#6b7280', fontSize: '13px',
                }}>
                  Esta tipología no tiene secciones. Agregá una con el botón de arriba.
                </div>
              )}

              {(seleccionada.secciones || []).map((sec, idx) => (
                <div key={sec.id} style={S.seccionBox}>
                  <div style={S.seccionHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: '#6b7280', minWidth: '20px',
                      }}>{idx + 1}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                        {sec.titulo}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button style={S.btnOutline} onClick={() => setModalCampo({ seccionId: sec.id })}>
                        + Campo
                      </button>
                      <button style={S.btnOutline} onClick={() => setEditandoSeccion(sec)}>
                        Editar
                      </button>
                      <button style={{ ...S.btnOutline, color: '#dc2626', borderColor: '#fecaca' }}
                        onClick={() => eliminarSeccion(sec.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Texto previo */}
                  {sec.texto_previo && (
                    <div style={{
                      padding: '8px 14px', fontSize: '12px', color: '#6b7280',
                      background: '#fffbeb', borderBottom: '1px solid #fef3c7',
                      fontStyle: 'italic',
                    }}>
                      ↑ {sec.texto_previo}
                    </div>
                  )}

                  {/* Campos */}
                  {(sec.campos || []).length === 0 && (
                    <div style={{ padding: '12px 14px', fontSize: '12px', color: '#9ca3af' }}>
                      Sin campos. Agregá uno con "+ Campo".
                    </div>
                  )}
                  {(sec.campos || []).map((campo, cidx) => (
                    <div key={campo.id} style={S.campoRow}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', minWidth: '18px' }}>
                        {cidx + 1}
                      </span>
                      <span style={{ flex: 1 }}>{campo.etiqueta}</span>
                      <span style={S.tipoBadge(campo.tipo)}>
                        {TIPOS_CAMPO.find(t => t.value === campo.tipo)?.label || campo.tipo}
                      </span>
                      {campo.requerido && (
                        <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700 }}>
                          REQ
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                        {campo.token}
                      </span>
                      <button style={{ ...S.btnOutline, padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => setEditandoCampo(campo)}>
                        Editar
                      </button>
                      <button style={{
                        ...S.btnOutline, padding: '3px 8px', fontSize: '11px',
                        color: '#dc2626', borderColor: '#fecaca',
                      }} onClick={() => eliminarCampo(campo.id)}>
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Texto posterior */}
                  {sec.texto_posterior && (
                    <div style={{
                      padding: '8px 14px', fontSize: '12px', color: '#6b7280',
                      background: '#fffbeb', borderTop: '1px solid #fef3c7',
                      fontStyle: 'italic',
                    }}>
                      ↓ {sec.texto_posterior}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function AdminTemplates() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('tipologias');

  if (usuario?.rol !== 'supervisor') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
        Acceso denegado
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>Editor de Templates</div>
          <div style={S.headerSub}>Gestión de secciones y campos por tipología</div>
        </div>
        <button style={S.backBtn} onClick={() => navigate('/supervisor')}>
          ← Volver
        </button>
      </div>

      <div style={S.body}>
        <div style={S.tabs}>
          <button style={S.tab(tab === 'tipologias')} onClick={() => setTab('tipologias')}>
            Tipologías y campos
          </button>
          <button style={S.tab(tab === 'encabezado')} onClick={() => setTab('encabezado')}>
            Encabezado y emplazamiento
          </button>
        </div>

        {tab === 'tipologias' && <TabTipologias />}
        {tab === 'encabezado' && <TabEncabezado />}
      </div>
    </div>
  );
}
