import axios from 'axios';

const getApiUrl = () => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (hostname === 'cms-backend') return 'http://cms-backend:8000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://cms-backend:8000';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // importantísimo para enviar cookies JWT
});

// Interceptor de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si expiró el access token → intentamos refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh'); // backend renueva el access token en cookie
        return api(originalRequest); // reintentar la petición original
      } catch (refreshError) {
        // Si falla el refresh → logout forzado
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
