'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/components/LandingPage';
import { AdminDashboard } from '@/components/AdminDashboard';
import { UserDashboard } from '@/components/UserDashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(true);

  // Opcional: mostrar landing por 2-3 segundos antes de redirigir
  useEffect(() => {
    if (!loading && user) {
      // Espera unos segundos para mostrar el landing
      const timer = setTimeout(() => {
        setShowLanding(false);
        if (user.role === 'Admin') router.push('/admin');
        else router.push('/user');
      }, 2000); // 2 segundos
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Si hay usuario logueado y el tiempo del landing pasó, se redirige
  if (user && !showLanding) {
    return null; // ya redirigió, no necesitamos renderizar nada
  }

  // Mostrar landing si no hay usuario o todavía está el delay
  return <LandingPage />;
}
