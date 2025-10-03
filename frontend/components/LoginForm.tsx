'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Brain, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = await login(email, password); // <-- obtenemos usuario actualizado
      if (!currentUser) throw new Error('Usuario no encontrado');

      toast.success('Inicio de sesión exitoso');

      if (currentUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    } catch (error) {
      toast.error('Error en el inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role: 'admin' | 'user') => {
    const demoEmail = role === 'admin' ? 'admin@biocognitive.com' : 'usuario@biocognitive.com';
    setEmail(demoEmail);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              <Brain className="h-6 w-6 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionNext
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Sistema de Monitoreo
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Plataforma avanzada de datos bicognitivos con IA
            </p>
          </div>
        </div>

        {/* Formulario de Login */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Botones Demo */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-600 text-center">Cuentas de demostración:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('admin')}
                  className="flex items-center space-x-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => demoLogin('user')}
                  className="flex items-center space-x-1"
                >
                  <Heart className="h-4 w-4" />
                  <span>Usuario</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 VisionNext Monitor. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
