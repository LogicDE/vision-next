'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || sessionExpired) {
        router.push('/login'); // redirigir si no hay sesión
      }
    }
  }, [user, loading, sessionExpired, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return <>{children}</>;
}
