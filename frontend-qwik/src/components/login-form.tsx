import { component$, useSignal, $ } from '@builder.io/qwik';
import { useAuth } from '../contexts/auth-context';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { HeartIcon, BrainIcon, ShieldIcon } from './ui/icons';

export const LoginForm = component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const loading = useSignal(false);
  const { login } = useAuth();

  const handleSubmit = $(async (e: Event) => {
    e.preventDefault();
    loading.value = true;

    try {
      await login(email.value, password.value);
      // toast.success('Inicio de sesión exitoso');
    } catch (error) {
      // toast.error('Error en el inicio de sesión');
      console.error('Login error:', error);
    } finally {
      loading.value = false;
    }
  });

  const demoLogin = $((role: 'admin' | 'user') => {
    const demoEmail = role === 'admin' ? 'admin@biocognitive.com' : 'usuario@biocognitive.com';
    email.value = demoEmail;
    password.value = 'demo123';
  });

  return (
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md space-y-8">
        {/* Logo y Header */}
        <div class="text-center space-y-4">
          <div class="flex justify-center items-center space-x-2">
            <div class="relative">
              <HeartIcon class="h-8 w-8 text-red-500 animate-pulse" />
              <BrainIcon class="h-6 w-6 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionNext
            </h1>
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Sistema de Monitoreo
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Plataforma avanzada de datos bicognitivos con IA
            </p>
          </div>
        </div>

        {/* Formulario de Login */}
        <Card class="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader class="space-y-1">
            <CardTitle class="text-2xl text-center">Iniciar Sesión</CardTitle>
            <CardDescription class="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <form preventdefault:submit onSubmit$={handleSubmit} class="space-y-4">
              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email.value}
                  onInput$={(e) => email.value = (e.target as HTMLInputElement).value}
                  required
                  class="h-12"
                />
              </div>
              <div class="space-y-2">
                <Label for="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password.value}
                  onInput$={(e) => password.value = (e.target as HTMLInputElement).value}
                  required
                  class="h-12"
                />
              </div>
              <Button 
                type="submit" 
                class="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                disabled={loading.value}
              >
                {loading.value ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Botones Demo */}
            <div class="space-y-3 pt-4 border-t">
              <p class="text-sm text-gray-600 text-center">Cuentas de demostración:</p>
              <div class="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick$={() => demoLogin('admin')}
                  class="flex items-center space-x-1"
                >
                  <ShieldIcon class="h-4 w-4" />
                  <span>Admin</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick$={() => demoLogin('user')}
                  class="flex items-center space-x-1"
                >
                  <HeartIcon class="h-4 w-4" />
                  <span>Usuario</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div class="text-center text-sm text-gray-500">
          <p>© 2025 VisionNext Monitor. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
});
