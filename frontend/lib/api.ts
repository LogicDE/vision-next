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
    return 'http://biometric-microservice:9000';
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

const ACCESS_TOKEN_KEY = 'vn_access_token';
const REFRESH_TOKEN_KEY = 'vn_refresh_token';

let accessToken: string | null = null;
let refreshTokenValue: string | null = null;

const loadStoredTokens = () => {
  if (typeof window === 'undefined') return;
  accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  refreshTokenValue = window.localStorage.getItem(REFRESH_TOKEN_KEY);
};

loadStoredTokens();

// 🌟 Instancia Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  withCredentials: true,
});

if (accessToken) {
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export const setAuthTokens = ({
  accessToken: newAccessToken,
  refreshToken: newRefreshToken,
}: {
  accessToken?: string | null;
  refreshToken?: string | null;
} = {}) => {
  if (typeof newAccessToken !== 'undefined') {
    accessToken = newAccessToken;
    if (typeof window !== 'undefined') {
      if (newAccessToken) window.localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    if (newAccessToken) {
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }

  if (typeof newRefreshToken !== 'undefined') {
    refreshTokenValue = newRefreshToken;
    if (typeof window !== 'undefined') {
      if (newRefreshToken) window.localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
};

export const clearAuthTokens = () => {
  setAuthTokens({ accessToken: null, refreshToken: null });
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshTokenValue;

api.interceptors.request.use((config) => {
  const isRefreshCall = config.url?.includes('/auth/refresh');
  const tokenToUse = isRefreshCall ? refreshTokenValue : accessToken;
  if (tokenToUse) {
    config.headers = config.headers ?? {};
    if (!config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${tokenToUse}`;
    }
  }
  return config;
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
  (response) => {
    const url = response.config?.url ?? '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
      const data = response.data;
      if (data?.accessToken || data?.refreshToken) {
        setAuthTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      }
    }
    return response;
  },
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
        const refreshResponse = await api.post('/auth/refresh'); // backend renueva access token
        if (refreshResponse.data?.accessToken || refreshResponse.data?.refreshToken) {
          setAuthTokens({
            accessToken: refreshResponse.data.accessToken,
            refreshToken: refreshResponse.data.refreshToken ?? refreshTokenValue,
          });
        }
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
