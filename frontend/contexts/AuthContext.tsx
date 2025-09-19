'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const getApiUrl = () => {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  if (hostname === 'cms-backend') return 'http://cms-backend:8000';
  return process.env.NEXT_PUBLIC_API_URL || 'http://cms-backend:8000';
};

const API_URL = getApiUrl();
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

const fetchUser = useCallback(async (): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
    if (!res.ok) {
      // Si no hay JWT o está expirado → cerrar sesión
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
}, []);


const refreshToken = useCallback(async (): Promise<boolean> => {
  if (refreshing) return false;
  setRefreshing(true);
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      // Refresh token inválido → cerrar sesión
      await logout();
      return false;
    }

    const newUser = await fetchUser();
    if (newUser) setUser(newUser);
    return !!newUser;
  } catch {
    await logout();
    return false;
  } finally {
    setRefreshing(false);
  }
}, [fetchUser, refreshing]);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const currentUser = await fetchUser();
      if (currentUser) setUser(currentUser);
      setLoading(false);
    };
    initAuth();

    // Refrescar token cada 30s (no leer JWT httpOnly)
    const interval = setInterval(refreshToken, 30000);
    return () => clearInterval(interval);
  }, [fetchUser, refreshToken]);

  const login = async (email: string, password: string) => {
    setLoading(true);
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

      setUser(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {}
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must ser usado dentro de AuthProvider');
  return context;
}
