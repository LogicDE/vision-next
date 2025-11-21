import { API_URL, getAccessToken } from '@/lib/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    credentials: 'include', // importante para cookies/token
    headers,
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Error ${res.status}: ${msg}`);
  }

  return res.json();
}
