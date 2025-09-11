'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  organization?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener datos del usuario usando cookie HttpOnly
  const fetchUser = async (): Promise<User | null> => {
    try {
      const res = await fetch('http://localhost:8000/auth/me', {
        credentials: 'include', // ✅ enviar cookies
      });

      if (!res.ok) return null;

      const data = await res.json();
      return {
        id: data.id,
        name: data.nombre,
        email: data.email,
        role: data.rol as 'admin' | 'user',
        organization: 'Hospital Central',
        avatar: '/api/placeholder/40/40',
      };
    } catch {
      return null;
    }
  };

  // Cargar usuario al inicio
  useEffect(() => {
    (async () => {
      const savedUser = localStorage.getItem('biocognitive_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        const userData = await fetchUser();
        if (userData) {
          setUser(userData);
          localStorage.setItem('biocognitive_user', JSON.stringify(userData));
        }
      }
      setLoading(false);
    })();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // enviar cookies
      });

      if (!res.ok) throw new Error('Credenciales inválidas');

      // Traer datos del usuario usando la cookie
      const userData = await fetchUser();
      if (!userData) throw new Error('Error obteniendo datos del usuario');

      setUser(userData);
      localStorage.setItem('biocognitive_user', JSON.stringify(userData));
    } catch (error) {
      setUser(null);
      localStorage.removeItem('biocognitive_user');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignorar errores de logout
    }
    setUser(null);
    localStorage.removeItem('biocognitive_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
