import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { informesAPI, pdfAPI } from '../utils/api';

export default function InformeArquitecto() {
  const { usuario, logout } = useAuth();
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoInforme, setNuevoInforme] = useState({
    establecimiento_nombre: '',
    establecimiento_direccion: '',
    establecimiento_localidad: '',
    expediente: '',
    fecha: new Date().toISOString().split('T')[0],
    contenido: '',
    observaciones: '',
  });

  useEffect(() => {
    loadInformes();
  }, []);

  const loadInformes = async () => {
    try {
      const response = await informesAPI.getAll();
      setInformes(response.data);
    } catch (err) {
      console.error('Error cargando informes:', err);
    } finally {
      setLoading(false);
    }
  };

  const crearInforme = async () => {
    try {
      await informesAPI.create(nuevoInforme);
      setMostrarFormulario(false);
      setNuevoInforme({
        establecimiento_nombre: '',
        establecimiento_direccion: '',
        establecimiento_localidad: '',
        expediente: '',
        fecha: new Date().toISOString().split('T')[0],
        contenido: '',
        observaciones: '',
      });
      loadInformes();
    } catch (err) {
      console.error('Error creando informe:', err);
    }
  };

  const decodeBase64Pdf = (base64) => {
    const cleaned = typeof base64 === 'string'
      ? base64.replace(/[^A-Za-z0-9+/=]/g, '')
      : '';
    return Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
  };

  const generarPDF = async (id, nombre) => {
    try {
      const response = await pdfAPI.generarInforme(id);
      if (response.data.pdfBuffer) {
        const blob = decodeBase64Pdf(response.data.pdfBuffer);
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        const nombreArchivo = `Informe ${nombre || 'SinNombre'}.pdf`;
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      loadInformes();
    } catch (err) {
      console.error('Error generando PDF:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-800 text-white p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Informes de Arquitectura</h1>
            <p className="text-sm text-purple-200">{usuario?.nombre}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-600"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mis Informes</h2>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg"
          >
            {mostrarFormulario ? 'Cancelar' : '+ Nuevo Informe'}
          </button>
        </div>

        {mostrarFormulario && (
          <div className="card mb-6">
            <h3 className="font-bold text-lg mb-4">Nuevo Informe</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Nombre del Establecimiento</label>
                <input
                  type="text"
                  value={nuevoInforme.establecimiento_nombre}
                  onChange={(e) => setNuevoInforme(prev => ({ ...prev, establecimiento_nombre: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Expediente</label>
                <input
                  type="text"
                  value={nuevoInforme.expediente}
                  onChange={(e) => setNuevoInforme(prev => ({ ...prev, expediente: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Dirección</label>
                <input
                  type="text"
                  value={nuevoInforme.establecimiento_direccion}
                  onChange={(e) => setNuevoInforme(prev => ({ ...prev, establecimiento_direccion: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Localidad</label>
                <input
                  type="text"
                  value={nuevoInforme.establecimiento_localidad}
                  onChange={(e) => setNuevoInforme(prev => ({ ...prev, establecimiento_localidad: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">Fecha</label>
                <input
                  type="date"
                  value={nuevoInforme.fecha}
                  onChange={(e) => setNuevoInforme(prev => ({ ...prev, fecha: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="label-field">Contenido del Informe</label>
              <textarea
                value={nuevoInforme.contenido}
                onChange={(e) => setNuevoInforme(prev => ({ ...prev, contenido: e.target.value }))}
                className="input-field h-32"
                placeholder="Describa las condiciones de infraestructura observadas..."
              />
            </div>

            <div className="mt-4">
              <label className="label-field">Observaciones</label>
              <textarea
                value={nuevoInforme.observaciones}
                onChange={(e) => setNuevoInforme(prev => ({ ...prev, observaciones: e.target.value }))}
                className="input-field h-24"
                placeholder="Observaciones adicionales..."
              />
            </div>

            <button
              onClick={crearInforme}
              className="btn-primary mt-4 bg-purple-600"
            >
              Crear Informe
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando...</p>
          </div>
        ) : informes.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No hay informes creados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {informes.map((informe) => (
              <div key={informe.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {informe.establecimiento_nombre || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {informe.establecimiento_direccion}, {informe.establecimiento_localidad}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    informe.estado === 'cerrado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {informe.estado.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">
                    Expte: {informe.expediente || '-'} | {informe.fecha}
                  </span>
                  <button
                    onClick={() => generarPDF(informe.id, informe.establecimiento_nombre)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
                  >
                    Generar PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
