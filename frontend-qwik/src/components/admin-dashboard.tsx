import { component$, useSignal } from '@builder.io/qwik';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  UsersIcon, 
  Building2Icon, 
  ActivityIcon, 
  TrendingUpIcon, 
  AlertCircleIcon, 
  LogOutIcon,
  SettingsIcon,
  BarChart3Icon,
  HeartIcon,
  BrainIcon,
  ShieldIcon,
  BellIcon,
  UserPlusIcon
} from './ui/icons';
import { useAuth } from '../contexts/auth-context';

export const AdminDashboard = component$(() => {
  const { user, logout } = useAuth();
  const activeTab = useSignal('overview');

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header class="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div class="flex h-16 items-center px-4 lg:px-6">
          <div class="flex items-center space-x-2">
            <HeartIcon class="h-8 w-8 text-red-500" />
            <BrainIcon class="h-6 w-6 text-blue-500" />
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionNext Admin
            </h1>
          </div>
          
          <div class="ml-auto flex items-center space-x-4">
            <Badge variant="secondary" class="hidden md:flex items-center space-x-1">
              <ShieldIcon class="h-3 w-3" />
              <span>XML Backend</span>
            </Badge>
            <Button variant="ghost" size="sm" class="relative">
              <BellIcon class="h-4 w-4" />
              <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div class="flex items-center space-x-2">
              <Avatar class="h-8 w-8">
                <AvatarImage src={user.value?.avatar} />
                <AvatarFallback>{user.value?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div class="hidden md:block text-sm">
                <p class="font-medium">{user.value?.name}</p>
                <p class="text-gray-500">{user.value?.organization}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick$={logout}>
              <LogOutIcon class="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main class="p-4 lg:p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold tracking-tight">Panel de Control</h2>
            <p class="text-muted-foreground">
              Gestiona organizaciones, usuarios y monitorea datos bicognitivos
            </p>
          </div>
          <Button class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <UserPlusIcon class="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        <Tabs value={activeTab.value} onValueChange$={(value) => activeTab.value = value} class="space-y-6">
          <TabsList class="grid w-full grid-cols-2 lg:grid-cols-5 h-12">
            <TabsTrigger value="overview" class="flex items-center space-x-2">
              <BarChart3Icon class="h-4 w-4" />
              <span class="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" class="flex items-center space-x-2">
              <UsersIcon class="h-4 w-4" />
              <span class="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="organizations" class="flex items-center space-x-2">
              <Building2Icon class="h-4 w-4" />
              <span class="hidden sm:inline">Organizaciones</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" class="flex items-center space-x-2">
              <TrendingUpIcon class="h-4 w-4" />
              <span class="hidden sm:inline">KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" class="flex items-center space-x-2">
              <AlertCircleIcon class="h-4 w-4" />
              <span class="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">Total Usuarios</CardTitle>
                  <UsersIcon class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">1,234</div>
                  <p class="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">Organizaciones</CardTitle>
                  <Building2Icon class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">45</div>
                  <p class="text-xs text-muted-foreground">+2 nuevas esta semana</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">Alertas Activas</CardTitle>
                  <AlertCircleIcon class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">12</div>
                  <p class="text-xs text-muted-foreground">-3 desde ayer</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle class="text-sm font-medium">Sistema Salud</CardTitle>
                  <ActivityIcon class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div class="text-2xl font-bold">99.9%</div>
                  <p class="text-xs text-muted-foreground">Uptime este mes</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Gestión de Usuarios</h3>
              <p class="text-gray-600">Contenido de gestión de usuarios...</p>
            </div>
          </TabsContent>

          <TabsContent value="organizations" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Gestión de Organizaciones</h3>
              <p class="text-gray-600">Contenido de gestión de organizaciones...</p>
            </div>
          </TabsContent>

          <TabsContent value="kpis" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Dashboard de KPIs</h3>
              <p class="text-gray-600">Contenido de KPIs...</p>
            </div>
          </TabsContent>

          <TabsContent value="alerts" class="space-y-4">
            <div class="p-4">
              <h3 class="text-lg font-semibold mb-4">Gestión de Alertas</h3>
              <p class="text-gray-600">Contenido de gestión de alertas...</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
});
