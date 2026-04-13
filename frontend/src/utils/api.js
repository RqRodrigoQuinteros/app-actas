import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Solo redirigir si NO estamos en una página de login
      const path = window.location.pathname;
      const esLoginPage = path === '/login' || path === '/supervisor-login';
      if (!esLoginPage) {
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
  getInspectores: () => api.get('/auth/inspectores'),
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
};

export const informesAPI = {
  getAll: () => api.get('/informes'),
  getById: (id) => api.get(`/informes/${id}`),
  create: (data) => api.post('/informes', data),
  update: (id, data) => api.put(`/informes/${id}`, data),
};

export default api;
