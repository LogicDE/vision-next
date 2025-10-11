import axios from 'axios';

export const API_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_API_URL;
    return 'http://cms-backend:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL;
})();

export const MICROSERVICES_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_MICROSERVICES_URL;
    return 'http://microservices-backend:9000';
  }
  return process.env.NEXT_PUBLIC_MICROSERVICES_URL;
})();

export const WEBSOCKET_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    return 'ws://cms-backend:8000/ws';
  }
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
})();

// 🌟 Instancia Axios
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🔁 Interceptor para refresh token con cola
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh'); // backend renueva access token
        isRefreshing = false;
        processQueue(null); // resolvemos todas las promesas pendientes
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null); // rechazamos todas las promesas
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
