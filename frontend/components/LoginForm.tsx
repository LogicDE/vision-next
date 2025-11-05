'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Brain, Shield, LogIn, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const { login, user } = useAuth();

  // Marcar componente como montado (cliente)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      router.push(user.role === 'Admin' ? '/admin' : '/user');
    }
  }, [user, router]);

  // Parallax optimizado con throttle
  useEffect(() => {
    if (!isMounted) return;

    let rafId: number;
    let lastTime = 0;
    const throttleMs = 16; // ~60fps

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastTime < throttleMs) return;
      
      lastTime = now;
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMounted]);

  // Calcular offset parallax (memoizado y seguro)
  const parallaxOffset = useMemo(() => {
    if (!isMounted || typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    
    return {
      x: (mousePosition.x - window.innerWidth / 2) / 80,
      y: (mousePosition.y - window.innerHeight / 2) / 80,
    };
  }, [mousePosition, isMounted]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      const currentUser = await login(email, password);
      
      if (!currentUser) {
        throw new Error('Usuario no encontrado');
      }

      toast.success('Inicio de sesión exitoso');
      router.push(currentUser.role === 'Admin' ? '/admin' : '/user');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Error al iniciar sesión';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, login, router]);

  const demoLogin = useCallback((role: 'Admin' | 'User') => {
    const demoEmail = role === 'Admin' 
      ? 'carlos@vitanexo.com' 
      : 'juan.perez@demo.com';
    
    setEmail(demoEmail);
    setPassword('123456');
  }, []);

  // Renderizado SSR-safe con loading state
  if (!isMounted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* Fondo animado */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
        
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
            transition: 'transform 0.3s ease-out',
            willChange: 'transform',
          }}
        />
        
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${-parallaxOffset.x}px, ${-parallaxOffset.y}px)`,
            transition: 'transform 0.3s ease-out',
            willChange: 'transform',
          }}
        />
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Contenedor principal */}
      <div className="w-full max-w-md px-4 py-8 sm:px-0 animate-fadeIn">
        {/* Logo + título */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              <Brain className="h-6 w-6 text-blue-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              VisionNext
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Plataforma avanzada de monitoreo bicognitivo
          </p>
        </div>

        {/* Tarjeta de login */}
        <Card className="relative border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-purple-500/30 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-50 group-hover:opacity-70 transition-all" />
          
          <CardHeader className="relative text-center space-y-2">
            <CardTitle className="text-2xl font-semibold text-white">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-gray-400">
              Accede a tu panel de control inteligente
            </CardDescription>
          </CardHeader>

          <CardContent className="relative space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-300">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="relative w-full h-12 text-white text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? 'Cargando...' : 'Ingresar'}
                  {!loading && <LogIn className="ml-2 w-5 h-5" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Button>
            </form>

            {/* Accesos demo */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-sm text-center text-gray-400 mb-3">
                Accesos de demostración
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => demoLogin('Admin')}
                  disabled={loading}
                  className="border-blue-400/40 text-blue-300 hover:bg-blue-500/20 hover:text-white transition-all"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => demoLogin('User')}
                  disabled={loading}
                  className="border-purple-400/40 text-purple-300 hover:bg-purple-500/20 hover:text-white transition-all"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Usuario
                </Button>
              </div>
            </div>

            {/* Botón volver a inicio */}
            <div className="pt-4 text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/')}
                disabled={loading}
                className="text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-6">
          © 2025 VisionNext — Plataforma Inteligente de Análisis Bicognitivo
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}