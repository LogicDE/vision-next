'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Brain, 
  Activity, 
  Smartphone, 
  LogOut, 
  Settings, 
  Bell,
  MessageCircle,
  TrendingUp,
  Shield,
  Zap,
  User,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HealthMetrics } from '@/components/user/HealthMetrics';
import { MentalStateMonitor } from '@/components/user/MentalStateMonitor';
import { AIAssistant } from '@/components/user/AIAssistant';
import { UserSettings } from '@/components/user/UserSettings';
import { NotificationsPanel } from '@/components/user/NotificationsPanel';
import { SessionTimeout } from '@/components/SessionTimeoutModal';


export function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('health');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Mobile Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 animate-pulse-soft" />
              <Brain className="h-5 w-5 text-blue-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                VisionNext
              </h1>
              <p className="text-xs text-gray-500">Monitoreo Personal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden sm:flex items-center space-x-1 text-xs">
              <Smartphone className="h-3 w-3" />
              <span>JSON API</span>
            </Badge>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-2 text-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse"></div>
          <span>Sistema activo • Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="p-4 space-y-3">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">¡Hola, {user?.name}!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Monitorea tu salud bicognitiva en tiempo real con tecnología de IA avanzada
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2 animate-pulse" />
              <p className="text-2xl font-bold text-gray-900">72</p>
              <p className="text-sm text-gray-600">BPM</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-none shadow-lg">
            <CardContent className="p-4 text-center">
              <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-gray-600">Estado Mental</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full h-12 bg-white/80">
            <TabsTrigger value="health" className="flex flex-col items-center p-2">
              <Heart className="h-4 w-4" />
              <span className="text-xs">Salud</span>
            </TabsTrigger>
            <TabsTrigger value="mental" className="flex flex-col items-center p-2">
              <Brain className="h-4 w-4" />
              <span className="text-xs">Mental</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex flex-col items-center p-2">
              <Zap className="h-4 w-4" />
              <span className="text-xs">IA</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex flex-col items-center p-2">
              <Bell className="h-4 w-4" />
              <span className="text-xs">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center p-2">
              <Settings className="h-4 w-4" />
              <span className="text-xs">Config</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <HealthMetrics />
          </TabsContent>

          <TabsContent value="mental" className="space-y-4">
            <MentalStateMonitor />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <AIAssistant />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <NotificationsPanel />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <UserSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Button */}
      <div className="p-4 pb-8">
        <Button 
          onClick={logout} 
          variant="outline" 
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
      <SessionTimeout />
    </div>
  );
}