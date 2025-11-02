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
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Obtener usuario actual
 const fetchUser = useCallback(async (): Promise<User | null> => {
  try {
    const res = await api.get('/auth/me'); // cookies enviadas automáticamente
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
  } catch (e) {
    console.log('fetchUser failed:', e);
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
    // ✅ No intentar refresh si no hay usuario activo o no está inicializado
    if (!user || !isInitialized) {
      return;
    }
    
    try {
      await api.post('/auth/refresh');
      const currentUser = await fetchUser();
      if (currentUser) setUser(currentUser);
      setSessionExpired(false);
    } catch (error) {
      setUser(null);
      setSessionExpired(true);
      router.push('/login');
    }
  }, [fetchUser, router]); // Removed user and isInitialized from dependencies

  // Auto-refresh cada 4:30 min si el JWT dura 5 min (solo si hay usuario)
  useEffect(() => {
    if (!user || !isInitialized) return; // ✅ Solo refrescar si hay sesión activa y está inicializado
    
    const interval = setInterval(() => {
      refreshToken();
    }, 1000 * 60 * 4.5);
    
    return () => {
      clearInterval(interval);
    };
  }, [user?.id, isInitialized]); // Only depend on user ID, not the whole user object

  // Inicialización (solo una vez)
  useEffect(() => {
    if (isInitialized) return; // Prevenir re-inicialización
    
    const initAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await fetchUser();
        if (currentUser) setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };
    initAuth();
  }, [fetchUser, isInitialized]);

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
