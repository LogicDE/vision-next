import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  HeartIcon, 
  BrainIcon, 
  ActivityIcon, 
  SmartphoneIcon, 
  LogOutIcon, 
  SettingsIcon, 
  BellIcon,
  ZapIcon
} from './ui/icons';
import { useAuth } from '../contexts/auth-context';

export const UserDashboard = component$(() => {
  const { user, logout } = useAuth();
  const activeTab = useSignal('health');
  const lastUpdate = useSignal(new Date());

  useTask$(() => {
    const interval = setInterval(() => {
      lastUpdate.value = new Date();
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  });

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile Header */}
      <header class="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div class="flex items-center justify-between p-4">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <HeartIcon class="h-8 w-8 text-red-500 animate-pulse-soft" />
              <BrainIcon class="h-5 w-5 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VisionNext
              </h1>
              <p class="text-xs text-gray-500">Monitoreo Personal</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <Badge variant="outline" class="hidden sm:flex items-center space-x-1 text-xs">
              <SmartphoneIcon class="h-3 w-3" />
              <span>JSON API</span>
            </Badge>
            <Button variant="ghost" size="sm" class="relative p-2">
              <BellIcon class="h-5 w-5" />
              <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            <Avatar class="h-8 w-8">
              <AvatarImage src={user.value?.avatar} />
              <AvatarFallback>{user.value?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div class="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 text-center text-sm">
        <div class="flex items-center justify-center space-x-2">
          <div class="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
          <span>Sistema activo • Última actualización: {lastUpdate.value.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Welcome Section */}
      <div class="p-4 space-y-3">
        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold text-gray-900">¡Hola, {user.value?.name}!</h2>
          <p class="text-gray-600 max-w-md mx-auto">
            Monitorea tu salud bicognitiva en tiempo real con tecnología de IA avanzada
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div class="grid grid-cols-2 gap-4">
          <Card class="glass-card border-none shadow-lg">
            <CardContent class="p-4 text-center">
              <HeartIcon class="h-8 w-8 text-red-500 mx-auto mb-2 animate-pulse" />
              <p class="text-2xl font-bold text-gray-900">72</p>
              <p class="text-sm text-gray-600">BPM</p>
            </CardContent>
          </Card>
          <Card class="glass-card border-none shadow-lg">
            <CardContent class="p-4 text-center">
              <BrainIcon class="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p class="text-2xl font-bold text-gray-900">85%</p>
              <p class="text-sm text-gray-600">Estado Mental</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Navigation */}
      <div class="px-4">
        <Tabs value={activeTab.value} onValueChange$={(value) => activeTab.value = value} class="space-y-4">
          <TabsList class="grid grid-cols-5 w-full h-12 bg-white/80">
            <TabsTrigger value="health" class="flex flex-col items-center p-2">
              <HeartIcon class="h-4 w-4" />
              <span class="text-xs">Salud</span>
            </TabsTrigger>
            <TabsTrigger value="mental" class="flex flex-col items-center p-2">
              <BrainIcon class="h-4 w-4" />
              <span class="text-xs">Mental</span>
            </TabsTrigger>
            <TabsTrigger value="ai" class="flex flex-col items-center p-2">
              <ZapIcon class="h-4 w-4" />
              <span class="text-xs">IA</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" class="flex flex-col items-center p-2">
              <BellIcon class="h-4 w-4" />
              <span class="text-xs">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" class="flex flex-col items-center p-2">
              <SettingsIcon class="h-4 w-4" />
              <span class="text-xs">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Métricas de Salud</h3>
              <p class="text-gray-600">Contenido de métricas de salud...</p>
            </div>
          </TabsContent>

          <TabsContent value="mental" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Estado Mental</h3>
              <p class="text-gray-600">Contenido de estado mental...</p>
            </div>
          </TabsContent>

          <TabsContent value="ai" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Asistente IA</h3>
              <p class="text-gray-600">Contenido del asistente IA...</p>
            </div>
          </TabsContent>

          <TabsContent value="alerts" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Panel de Notificaciones</h3>
              <p class="text-gray-600">Contenido de notificaciones...</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Configuración de Usuario</h3>
              <p class="text-gray-600">Contenido de configuración...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Button */}
      <div class="p-4 pb-8">
        <Button 
          onClick$={logout} 
          variant="outline" 
          class="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOutIcon class="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
});
