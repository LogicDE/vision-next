'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Check, 
  X,
  Clock,
  Zap,
  Moon,
  Activity,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  Target,
  AlertCircle
} from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'alert',
    title: 'Ritmo Cardíaco Elevado',
    message: 'Tu ritmo cardíaco ha estado por encima de 95 BPM durante los últimos 10 minutos.',
    timestamp: 'Hace 5 minutos',
    icon: Heart,
    color: 'red',
    gradient: 'from-red-500 to-pink-500',
    priority: 'high',
    read: false
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Momento Ideal para Ejercicio',
    message: 'Basándome en tus métricas, este es un buen momento para actividad física moderada.',
    timestamp: 'Hace 25 minutos',
    icon: Zap,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    priority: 'medium',
    read: false
  },
  {
    id: '3',
    type: 'insight',
    title: 'Mejora en Estado Mental',
    message: 'Tu estado mental ha mejorado un 12% esta semana. ¡Excelente progreso!',
    timestamp: 'Hace 2 horas',
    icon: Brain,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    priority: 'low',
    read: true
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Recordatorio de Sueño',
    message: 'Es hora de prepararte para dormir para mantener tu rutina saludable.',
    timestamp: 'Ayer 22:00',
    icon: Moon,
    color: 'purple',
    gradient: 'from-purple-500 to-violet-500',
    priority: 'medium',
    read: true
  }
];

const mockAlerts = [
  {
    id: '1',
    type: 'critical',
    title: 'Nivel de Estrés Crítico',
    description: 'Tu nivel de estrés ha alcanzado el 85%. Se recomienda tomar un descanso.',
    timestamp: 'Hace 15 minutos',
    active: true,
    color: 'red',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Patrón de Sueño Irregular',
    description: 'Se ha detectado un patrón de sueño irregular en los últimos 3 días.',
    timestamp: 'Hace 3 horas',
    active: true,
    color: 'yellow',
    gradient: 'from-yellow-500 to-amber-500'
  },
  {
    id: '3',
    type: 'resolved',
    title: 'Hidratación Normalizada',
    description: 'Tus niveles de hidratación han vuelto al rango óptimo.',
    timestamp: 'Hace 5 horas',
    active: false,
    color: 'green',
    gradient: 'from-green-500 to-emerald-500'
  }
];

export function NotificationsPanel() {
  const [notificationSettings, setNotificationSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    criticalAlerts: true,
    recommendations: true,
    insights: true,
    reminders: false
  });

  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeAlerts, setActiveAlerts] = useState(mockAlerts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const dismissAlert = (id: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, active: false } : alert
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate new data
    setIsRefreshing(false);
  };

  const getNotificationIcon = (notification: any) => {
    const Icon = notification.icon;
    return (
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${notification.gradient} flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Media</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Baja</Badge>;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <Check className="h-5 w-5 text-white" />
          </div>
        );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeAlertsCount = activeAlerts.filter(a => a.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Bell className="h-6 w-6 text-blue-400 animate-pulse" />
            <span>Panel de Notificaciones</span>
          </h2>
          <p className="text-sm text-gray-400 flex items-center space-x-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>Alertas y recomendaciones en tiempo real</span>
            <span className="flex items-center ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5"></div>
              Live
            </span>
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-red-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-red-400">{activeAlertsCount}</div>
            <p className="text-sm text-gray-400 mt-1">Alertas Activas</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardContent className="p-6 text-center">
            <Bell className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-400">{unreadCount}</div>
            <p className="text-sm text-gray-400 mt-1">No Leídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Notifications */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full bg-slate-800/50 backdrop-blur-sm border border-white/10">
          <TabsTrigger value="notifications" className="flex items-center space-x-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600">
            <Bell className="h-4 w-4" />
            <span>Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2 text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group transition-all hover:border-${notification.color}-500/30 ${
                !notification.read ? 'ring-2 ring-blue-500/20' : ''
              }`}
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${notification.color}-500/10 rounded-full blur-2xl group-hover:bg-${notification.color}-500/20 transition-all`}></div>
              <CardContent className="p-4 relative">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-semibold ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(notification.priority)}
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-300' : 'text-gray-400'}`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{notification.timestamp}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-3 text-xs border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar leída
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-xs border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {notifications.length === 0 && (
            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No hay notificaciones</h3>
                <p className="text-gray-400">
                  Cuando tengas nuevas notificaciones aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {activeAlerts.filter(alert => alert.active).map((alert) => (
            <Card 
              key={alert.id} 
              className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group border-l-4 border-l-red-500 hover:border-red-500/30 transition-all"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <CardContent className="p-4 relative">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getAlertTypeIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{alert.title}</h4>
                      <Badge 
                        className={`${
                          alert.type === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 
                          'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        }`}
                      >
                        {alert.type === 'critical' ? 'Crítico' : 'Advertencia'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-3">{alert.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{alert.timestamp}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeAlerts.filter(alert => alert.active).length === 0 && (
            <Card className="border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border-green-500/20">
              <CardContent className="p-8 text-center">
                <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Todo bajo control</h3>
                <p className="text-gray-300">
                  No hay alertas activas. Tu salud bicognitiva está en óptimas condiciones.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <span>Configuración de Notificaciones</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Personaliza cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center space-x-3">
                    {notificationSettings.soundEnabled ? (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Volume2 className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">Sonido</p>
                      <p className="text-sm text-gray-400">Reproducir sonido para notificaciones</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                    className="data-[state=checked]:bg-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Vibración</p>
                      <p className="text-sm text-gray-400">Vibrar dispositivo para alertas</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, vibrationEnabled: checked }))
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-red-500/30 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Alertas Críticas</p>
                      <p className="text-sm text-gray-400">Notificar problemas de salud urgentes</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.criticalAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                    }
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-yellow-500/30 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Recomendaciones IA</p>
                      <p className="text-sm text-gray-400">Consejos personalizados diarios</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.recommendations}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, recommendations: checked }))
                    }
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white"
          onClick={markAllAsRead}
        >
          <Check className="h-4 w-4 mr-2 text-green-400" />
          Marcar Todas como Leídas
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Settings className="h-4 w-4 mr-2 text-blue-400" />
          Configurar Alertas
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
          Historial de Alertas
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Target className="h-4 w-4 mr-2 text-purple-400" />
          Preferencias
        </Button>
      </div>
    </div>
  );
}