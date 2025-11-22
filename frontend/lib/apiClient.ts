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
    let errorMessage = `Error ${res.status}`;
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          errorMessage = json.message || json.error || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch {
      // If we can't read the response, use default message
    }
    throw new Error(errorMessage);
  }

  // Handle no content responses
  if (res.status === 204 || res.status === 201 && res.headers.get('content-length') === '0') {
    return null;
  }

  // Check content type before parsing
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
    // If it's not JSON, try to read as text or return null
    try {
      const text = await res.text();
      return text || null;
    } catch {
      return null;
    }
  }

  // Read response body once
  let text: string;
  try {
    text = await res.text();
  } catch (error) {
    // If we can't read the body, return null
    return null;
  }

  // Handle empty or whitespace-only responses
  if (!text || text.trim() === '') {
    return null;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(text);
  } catch (error) {
    // If parsing fails, return null for empty strings, otherwise throw
    if (text.trim() === '' || text.trim() === 'null') {
      return null;
    }
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }
}
