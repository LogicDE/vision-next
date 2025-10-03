// C:\Users\themo\vision-next\frontend\lib\api.ts
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

// 🚀 instancia axios lista
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 🔁 interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
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
