'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setSessionExpired: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  // Obtener usuario actual
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/me');
      const data = res.data;
      return {
        id: data.id,
        name: data.nombre,
        email: data.email,
        role: data.rol as UserRole,
        avatar: '/api/placeholder/40/40',
        organization: data.organizacion || 'Vision Next',
      };
    } catch (e) {
      setSessionExpired(true);
      return null;
    }
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      const currentUser = await fetchUser();
      if (!currentUser) throw new Error('Error obteniendo datos del usuario');
      setUser(currentUser);
      setSessionExpired(false);
      return currentUser;
    } catch (err) {
      toast.error('Error en inicio de sesión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Error en logout', err);
    } finally {
      setUser(null);
      setSessionExpired(true);
      router.push('/login');
    }
  }, [router]);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      await api.post('/auth/refresh');
      const currentUser = await fetchUser();
      if (currentUser) setUser(currentUser);
      setSessionExpired(false);
    } catch {
      setUser(null);
      setSessionExpired(true);
      router.push('/login');
    }
  }, [fetchUser, router]);

  // Auto-refresh cada 4:30 min si el JWT dura 5 min
  useEffect(() => {
    const interval = setInterval(refreshToken, 1000 * 60 * 4.5);
    return () => clearInterval(interval);
  }, [refreshToken]);

  // Inicialización
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const currentUser = await fetchUser();
      if (currentUser) setUser(currentUser);
      setLoading(false);
    };
    initAuth();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionExpired, login, logout, refreshToken, setSessionExpired }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
