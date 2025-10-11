import axios from 'axios';

export const API_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
    return 'http://cms-backend:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
})();

export const MICROSERVICES_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return process.env.NEXT_PUBLIC_MICROSERVICES_URL || 'http://localhost:9000';
    }
    return 'http://microservices-backend:9000';
  }
  return process.env.NEXT_PUBLIC_MICROSERVICES_URL || 'http://localhost:9000';
})();

export const WEBSOCKET_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') {
      return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws';
    }
    return 'ws://cms-backend:8000/ws';
  }
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000/ws';
})();

// 🌟 Instancia Axios
const api = axios.create({
  baseURL: API_URL || 'http://localhost:8000',
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
    // ✅ Validate error structure before accessing properties
    if (!error || !error.config) {
      console.warn('Invalid error object in interceptor:', error);
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // 🛑 CRITICAL: Never retry if the failing request IS the refresh itself
    const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh') || 
                              originalRequest.url?.includes('/auth/logout');
    
    if (isRefreshEndpoint) {
      isRefreshing = false; // Reset flag
      processQueue(error, null); // Clear queue
      return Promise.reject(error);
    }

    // ✅ Only attempt refresh for 401 errors with valid response structure
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
        // Don't redirect here - let the component handle it
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
