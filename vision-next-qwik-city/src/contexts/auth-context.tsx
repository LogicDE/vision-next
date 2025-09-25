import { createContextId, useContext, useContextProvider, useSignal, useTask$, $ } from '@builder.io/qwik';
import type { User, UserRole, AuthState } from '../types/auth';

const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:8000';
  if (hostname === 'cms-backend') return 'http://cms-backend:8000';
  return 'http://cms-backend:8000';
};

const API_URL = getApiUrl();

export const AuthContext = createContextId<AuthState>('auth-context');

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const user = useSignal<User | null>(null);
  const loading = useSignal(true);
  const refreshing = useSignal(false);

  const logout = $(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch {}
    user.value = null;
  });

  const fetchUser = $(async (): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
      if (!res.ok) {
        await logout();
        return null;
      }
      const data = await res.json();
      return {
        id: data.id,
        name: data.nombre,
        email: data.email,
        role: data.rol as UserRole,
        organization: 'Hospital Central',
        avatar: '/api/placeholder/40/40',
      };
    } catch {
      await logout();
      return null;
    }
  });

  const refreshToken = $(async (): Promise<boolean> => {
    if (refreshing.value) return false;
    refreshing.value = true;
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      if (!res.ok) {
        await logout();
        return false;
      }

      const newUser = await fetchUser();
      if (newUser) user.value = newUser;
      return !!newUser;
    } catch {
      await logout();
      return false;
    } finally {
      refreshing.value = false;
    }
  });

  const login = $(async (email: string, password: string) => {
    loading.value = true;
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Credenciales inválidas');

      const currentUser = await fetchUser();
      if (!currentUser) throw new Error('Error obteniendo datos del usuario');

      user.value = currentUser;
    } finally {
      loading.value = false;
    }
  });

  // Initialize auth on mount
  useTask$(async () => {
    loading.value = true;
    const currentUser = await fetchUser();
    if (currentUser) user.value = currentUser;
    loading.value = false;

    // Refresh token every 30 seconds
    const interval = setInterval(() => refreshToken(), 30000);
    return () => clearInterval(interval);
  });

  const authState: AuthState = {
    user: user,
    loading: loading,
    login,
    logout,
  };

  useContextProvider(AuthContext, authState);
};
