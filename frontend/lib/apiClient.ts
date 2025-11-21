import api, { API_URL, getAccessToken, setAuthTokens, clearAuthTokens } from '@/lib/api';

let refreshPromise: Promise<void> | null = null;

async function refreshAuthTokens() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await api.post('/auth/refresh');
        const data = response.data;
        if (data?.accessToken || data?.refreshToken) {
          setAuthTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
          return;
        }
        throw new Error('No se pudo refrescar la sesión');
      } catch (error) {
        clearAuthTokens();
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}, retry = true) {
  const isAuthEndpoint = endpoint.startsWith('/auth/');

  const performRequest = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const token = getAccessToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });
  };

  let res = await performRequest();

  if (res.status === 401 && retry && !isAuthEndpoint) {
    try {
      await refreshAuthTokens();
      res = await performRequest();
    } catch (error: any) {
      throw new Error(error?.message || 'Sesión expirada. Por favor vuelve a iniciar sesión.');
    }
  }

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}
