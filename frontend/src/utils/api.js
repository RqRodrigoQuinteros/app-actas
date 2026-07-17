import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

 api.interceptors.response.use(
   (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
 );

export const authAPI = {
  login: (dni, rol, password) => api.post('/auth/login', { dni, rol, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getUsuariosLogin: () => api.get('/auth/usuarios-login'),
};

export const actasAPI = {
  getAll: (params) => api.get('/actas', { params }),
  getById: (id) => api.get(`/actas/${id}`),
  create: (data) => api.post('/actas', data),
  update: (id, data) => api.put(`/actas/${id}`, data),
  firmar: (id, data) => api.post(`/actas/${id}/firmar`, data),
  toggleCidi: (id) => api.patch(`/actas/${id}/cidi`),
  delete: (id) => api.delete(`/actas/${id}`),
};

export const pedidosAPI = {
  getAll: () => api.get('/pedidos'),
  buscarCoincidencias: (expediente, direccion) => api.get('/pedidos/buscar-coincidencias', { params: { expediente, direccion } }),
  create: (data) => api.post('/pedidos', data),
  asignar: (id, inspectorId) => api.patch(`/pedidos/${id}/asignar`, { inspector_id: inspectorId }),
  tomar: (id) => api.patch(`/pedidos/${id}/tomar`),
  completar: (id) => api.patch(`/pedidos/${id}/completar`),
  getTipologias: (todas = false) => api.get('/pedidos/tipologias', { params: todas ? { todas: true } : {} }),
  crearTipologia: (data) => api.post('/pedidos/tipologias', data),
  actualizarTipologia: (id, data) => api.put(`/pedidos/tipologias/${id}`, data),
  eliminarTipologia: (id) => api.delete(`/pedidos/tipologias/${id}`),
};

export const pdfAPI = {
  generarActa: (id) => api.post(`/pdf/generar/${id}`, {}, { responseType: 'blob' }),
  generarInforme: (id) => api.post(`/pdf/informe/${id}`, {}, { responseType: 'blob' }),
  generarNotificacion: (id) => api.post(`/pdf/generar-notificacion/${id}`, {}, { responseType: 'blob' }),
  generarActaBase64: (id) => api.post(`/pdf/generar-base64/${id}`),
};

export const fotosAPI = {
  subir: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('fotos', file));
    return api.post('/fotos/subir', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  firmar: (file, actaId, tipo) => {
    const formData = new FormData();
    formData.append('firma', file);
    if (actaId) formData.append('acta_id', actaId);
    if (tipo) formData.append('tipo', tipo);
    return api.post('/fotos/firmar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const informesAPI = {
  getAll: () => api.get('/informes'),
  getById: (id) => api.get(`/informes/${id}`),
  create: (data) => api.post('/informes', data),
  update: (id, data) => api.put(`/informes/${id}`, data),
  toggleCidi: (id) => api.patch(`/informes/${id}/cidi`),
  remove: (id) => api.delete(`/informes/${id}`),
  transferir: (id, data) => api.post(`/informes/${id}/transferir`, data),
  getTransferencias: (params) => api.get('/informes/transferencias', { params }),
  exportar: (params, format = 'csv') => api.get('/informes/exportar', { params: { ...params, format }, responseType: 'blob' }),
};

export const vencimientosAPI = {
  getVencimientos: (params) => api.get('/actas/vencimientos', { params }),
  exportar: (params, format = 'csv') => api.get('/actas/exportar', { params: { ...params, format }, responseType: 'blob' }),
  reenviarAlerta: (id) => api.post(`/actas/reenviar-alerta/${id}`),
};

export default api;

export const informesTemplatesAPI = {
  // Tipologías
  getTipologias: (todas = false) => api.get('/informes-templates/tipologias', { params: todas ? { todas: true } : {} }),
  getTipologiaPorNombre: (nombre) => api.get(`/informes-templates/tipologias/por-nombre/${encodeURIComponent(nombre)}`),
  getItems: (tipologiaId) => api.get(`/informes-templates/tipologias/${tipologiaId}/items`),
  crearTipologia: (data) => api.post('/informes-templates/tipologias', data),
  actualizarTipologia: (id, data) => api.put('/informes-templates/tipologias/' + id, data),
  eliminarTipologia: (id) => api.delete('/informes-templates/tipologias/' + id),

  // Items
  crearItem: (tipologiaId, data) => api.post(`/informes-templates/tipologias/${tipologiaId}/items`, data),
  actualizarItem: (id, data) => api.put(`/informes-templates/items/${id}`, data),
  eliminarItem: (id) => api.delete(`/informes-templates/items/${id}`),
  moverItemArriba: (id) => api.put(`/informes-templates/items/${id}/mover-arriba`),
  moverItemAbajo: (id) => api.put(`/informes-templates/items/${id}/mover-abajo`),
};

export const templatesAPI = {
  // Encabezado
  getEncabezado: () => api.get('/templates/encabezado'),
  updateEncabezado: (data) => api.put('/templates/encabezado', data),

  // Tipologías
  getTipologias: (todas = false) => api.get('/templates/tipologias', { params: todas ? { todas: true } : {} }),
  getTipologia: (id) => api.get(`/templates/tipologias/${id}`),
  getTipologiaPorNombre: (nombre) => api.get(`/templates/tipologias/por-nombre/${encodeURIComponent(nombre)}`),
  crearTipologia: (data) => api.post('/templates/tipologias', data),
  actualizarTipologia: (id, data) => api.put(`/templates/tipologias/${id}`, data),
  desactivarTipologia: (id) => api.delete(`/templates/tipologias/${id}`),

  // Secciones
  crearSeccion: (tipologiaId, data) => api.post(`/templates/tipologias/${tipologiaId}/secciones`, data),
  actualizarSeccion: (id, data) => api.put(`/templates/secciones/${id}`, data),
  eliminarSeccion: (id) => api.delete(`/templates/secciones/${id}`),
  moverSeccionArriba: (id) => api.put(`/templates/secciones/${id}/mover-arriba`),
  moverSeccionAbajo: (id) => api.put(`/templates/secciones/${id}/mover-abajo`),

  // Campos
  crearCampo: (seccionId, data) => api.post(`/templates/secciones/${seccionId}/campos`, data),
  actualizarCampo: (id, data) => api.put(`/templates/campos/${id}`, data),
  eliminarCampo: (id) => api.delete(`/templates/campos/${id}`),
  moverCampoArriba: (id) => api.put(`/templates/campos/${id}/mover-arriba`),
  moverCampoAbajo: (id) => api.put(`/templates/campos/${id}/mover-abajo`),

  // Respuestas
  getRespuestas: (actaId) => api.get(`/templates/actas/${actaId}/respuestas`),
  guardarRespuestas: (actaId, respuestas) => api.post(`/templates/actas/${actaId}/respuestas`, { respuestas }),
};