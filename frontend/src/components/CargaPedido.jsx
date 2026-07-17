import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pedidosAPI } from '../utils/api';

const ESTADO_LABEL = {
  pendiente: 'Pendiente de asignar',
  asignado: 'Asignado',
  tomado: 'Tomado por el inspector',
  cancelado: 'Cancelado',
};

// Lista fija de auditores para el campo "Pedido por" — no está vinculada a la tabla usuarios.
const AUDITORES = [
  'Agustina Onofri', 'Milagros Sosa', 'Tobias Ben', 'Mauro Figueroa', 'Trinidad Heredia',
  'Mariel Paz', 'Agostina Gudiño', 'Valeria Vanella', 'Moira Maza', 'Valentin Morales',
  'Silvina Blondont', 'Romina Andrada', 'Karen Lacamoira', 'Soledad Oyola', 'Ignacio Ben',
  'Rocio Saleha', 'Gilda Gordillo', 'Florencia Mejías', 'Facundo Brizzi', 'Ariana Saienni',
  'Melisa Bazán', 'Lorenzo Fuchs', 'Hernán Gimenez', 'Facundo Grimaut', 'Fernanda Montañez',
  'Ludmila Peralta', 'Rocio Zamora', 'Camila Puca', 'Sofia Meichtri', 'Paula Caceres',
  'Santiago Llanos', 'Rodrigo Quinteros', 'Luciano Brizuela', 'Belen Brioni', 'Eugenia Hernandez',
  'Noelia Rodriguez', 'Dana Arrigoni', 'Yaco Casiva', 'Tatiana Toselli Mollani',
];

const initialForm = {
  expediente: '',
  establecimiento_nombre: '',
  establecimiento_direccion: '',
  establecimiento_tipologia: '',
  pedido_por: '',
};

export default function CargaPedido() {
  const { usuario, logout } = useAuth();
  const [tipologias, setTipologias] = useState([]);
  const [datos, setDatos] = useState(initialForm);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [filtroAuditor, setFiltroAuditor] = useState('');

  const [coincidencias, setCoincidencias] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    pedidosAPI.getTipologias().then(r => setTipologias(r.data || [])).catch(() => setTipologias([]));
    cargarPedidos();
  }, []);

  const cargarPedidos = () => {
    setLoadingPedidos(true);
    pedidosAPI.getAll()
      .then(r => setPedidos(r.data || []))
      .catch(() => setPedidos([]))
      .finally(() => setLoadingPedidos(false));
  };

  const resetForm = () => {
    setDatos(initialForm);
    setCoincidencias([]);
    setMostrarModal(false);
    setMotivo('');
  };

  const guardarPedido = async (payloadExtra = {}) => {
    setGuardando(true);
    setError('');
    try {
      await pedidosAPI.create({ ...datos, ...payloadExtra });
      resetForm();
      cargarPedidos();
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Ya existe un acta previa para este expediente o domicilio. Confirmá el motivo para guardar igual.');
        setMostrarModal(true);
      } else {
        setError(err.response?.data?.error || 'Error al guardar el pedido');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!datos.expediente || !datos.establecimiento_nombre || !datos.establecimiento_direccion || !datos.establecimiento_tipologia || !datos.pedido_por) {
      setError('Completá todos los campos');
      return;
    }

    setGuardando(true);
    try {
      const res = await pedidosAPI.buscarCoincidencias(datos.expediente, datos.establecimiento_direccion);
      const encontradas = res.data || [];
      if (encontradas.length > 0) {
        setCoincidencias(encontradas);
        setMostrarModal(true);
        setGuardando(false);
        return;
      }
      await guardarPedido();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al verificar coincidencias');
      setGuardando(false);
    }
  };

  const confirmarConMotivo = async () => {
    if (!motivo.trim()) {
      setError('El motivo es obligatorio para guardar un pedido sobre un expediente/domicilio con actas previas');
      return;
    }
    await guardarPedido({
      confirmar_duplicado: true,
      motivo_duplicado: motivo,
      acta_relacionada_id: coincidencias[0]?.id || null,
    });
  };

  const pedidosFiltrados = filtroAuditor ? pedidos.filter(p => p.pedido_por === filtroAuditor) : pedidos;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Carga de Pedidos de Inspección</h1>
            <p className="text-sm text-blue-200">{usuario?.nombre}</p>
          </div>
          <button onClick={logout} className="px-4 py-2 bg-blue-700 rounded-lg hover:bg-blue-600">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Nuevo Pedido</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">N° de Expediente</label>
                <input
                  type="text"
                  className="input-field"
                  value={datos.expediente}
                  onChange={e => setDatos(prev => ({ ...prev, expediente: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label-field">Tipología</label>
                <select
                  className="input-field"
                  value={datos.establecimiento_tipologia}
                  onChange={e => setDatos(prev => ({ ...prev, establecimiento_tipologia: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar tipología</option>
                  {tipologias.map(t => (
                    <option key={t.id} value={t.nombre}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label-field">Nombre del Establecimiento</label>
              <input
                type="text"
                className="input-field"
                value={datos.establecimiento_nombre}
                onChange={e => setDatos(prev => ({ ...prev, establecimiento_nombre: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-field">Domicilio</label>
                <input
                  type="text"
                  className="input-field"
                  value={datos.establecimiento_direccion}
                  onChange={e => setDatos(prev => ({ ...prev, establecimiento_direccion: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="label-field">Pedido por</label>
                <select
                  className="input-field"
                  value={datos.pedido_por}
                  onChange={e => setDatos(prev => ({ ...prev, pedido_por: e.target.value }))}
                  required
                >
                  <option value="">Seleccionar auditor</option>
                  {AUDITORES.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-50">
              {guardando ? 'Guardando...' : 'Guardar Pedido'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-bold">Mis Pedidos Cargados</h2>
            <select
              value={filtroAuditor}
              onChange={e => setFiltroAuditor(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos los auditores</option>
              {AUDITORES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          {loadingPedidos ? (
            <p className="text-gray-500">Cargando...</p>
          ) : pedidosFiltrados.length === 0 ? (
            <p className="text-gray-500">No hay pedidos cargados para este filtro</p>
          ) : (
            <div className="space-y-3">
              {pedidosFiltrados.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{p.establecimiento_nombre}</p>
                      <p className="text-sm text-gray-600">{p.establecimiento_direccion} — {p.establecimiento_tipologia}</p>
                      <p className="text-xs text-gray-400">Expte: {p.expediente} · Pedido por: {p.pedido_por}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        {ESTADO_LABEL[p.estado] || p.estado}
                      </span>
                      {p.inspector_asignado?.nombre && (
                        <p className="text-xs text-gray-500 mt-1">Asignado a {p.inspector_asignado.nombre}</p>
                      )}
                    </div>
                  </div>
                  {p.motivo_duplicado && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-2">
                      ⚠ Reinspección — motivo: {p.motivo_duplicado}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-2">Ya existen actas para este expediente o domicilio</h3>
            <p className="text-sm text-gray-600 mb-4">
              Encontramos {coincidencias.length} acta(s) previa(s). Si igual querés cargar este pedido, indicá el motivo.
            </p>

            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {coincidencias.map(a => (
                <div key={a.id} className="text-sm bg-gray-50 rounded p-2">
                  <p className="font-medium">{a.establecimiento_nombre} — Expte: {a.expediente || 'sin expediente'}</p>
                  <p className="text-gray-500">{a.establecimiento_direccion} · {a.fecha} · {a.estado}</p>
                </div>
              ))}
            </div>

            <label className="label-field">Motivo de la reinspección</label>
            <textarea
              className="input-field"
              rows={3}
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              placeholder="Ej: seguimiento de acta anterior, denuncia nueva, etc."
            />

            {error && (
              <div className="p-2 mt-2 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => { setMostrarModal(false); setError(''); }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarConMotivo}
                disabled={guardando}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar y guardar igual'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
