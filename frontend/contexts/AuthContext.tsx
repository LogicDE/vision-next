'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User',
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

  // === Fetch del usuario actual ===
  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await api.get('/auth/me');
      const data = res.data;
      if (!data || !data.id) return null;

      return {
        id: String(data.id),
        name: data.nombre,
        email: data.email,
        role: data.rol as UserRole,
        avatar: '/api/placeholder/40/40',
        organization: data.organizacion || 'Vision Next',
      };
    } catch {
      return null;
    }
  }, []);

  // === Login ===
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await api.post('/auth/login', { email, password });
      const currentUser = await fetchUser();
      if (!currentUser) throw new Error('Error obteniendo usuario');
      setUser(currentUser);
      setSessionExpired(false);
      toast.success('Inicio de sesión exitoso');
      return currentUser;
    } catch (err) {
      toast.error('Credenciales inválidas');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // === Logout ===
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignora error */
    } finally {
      setUser(null);
      setSessionExpired(true);
      router.push('/login');
    }
  }, [router]);

  // === Refresh Token ===
  const refreshToken = useCallback(async () => {
    try {
      await api.post('/auth/refresh');
      const refreshedUser = await fetchUser();
      if (refreshedUser) {
        setUser(refreshedUser);
        setSessionExpired(false);
      }
    } catch {
      logout();
    }
  }, [fetchUser, logout]);

  // === Inicialización ===
  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await fetchUser();
        if (currentUser) setUser(currentUser);
      } catch {
        /* ignora */
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchUser]);

  // === Auto refresh cada 4.5 min ===
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => refreshToken(), 1000 * 60 * 4.5);
    return () => clearInterval(interval);
  }, [user, refreshToken]);

  return (
    <AuthContext.Provider value={{ user, loading, sessionExpired, login, logout, refreshToken, setSessionExpired }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
