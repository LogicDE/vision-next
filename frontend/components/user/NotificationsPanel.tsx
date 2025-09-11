'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  VolumeX
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const mockNotifications = [
  {
    id: '1',
    type: 'alert',
    title: 'Ritmo Cardíaco Elevado',
    message: 'Tu ritmo cardíaco ha estado por encima de 95 BPM durante los últimos 10 minutos.',
    timestamp: '2024-01-15 11:30',
    icon: Heart,
    color: 'red',
    priority: 'high',
    read: false
  },
  {
    id: '2',
    type: 'recommendation',
    title: 'Momento Ideal para Ejercicio',
    message: 'Basándome en tus métricas, este es un buen momento para actividad física moderada.',
    timestamp: '2024-01-15 10:15',
    icon: Zap,
    color: 'blue',
    priority: 'medium',
    read: false
  },
  {
    id: '3',
    type: 'insight',
    title: 'Mejora en Estado Mental',
    message: 'Tu estado mental ha mejorado un 12% esta semana. ¡Excelente progreso!',
    timestamp: '2024-01-15 09:00',
    icon: Brain,
    color: 'green',
    priority: 'low',
    read: true
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Recordatorio de Sueño',
    message: 'Es hora de prepararte para dormir para mantener tu rutina saludable.',
    timestamp: '2024-01-14 22:00',
    icon: Moon,
    color: 'purple',
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
    timestamp: '2024-01-15 11:45',
    active: true
  },
  {
    id: '2',
    type: 'warning',
    title: 'Patrón de Sueño Irregular',
    description: 'Se ha detectado un patrón de sueño irregular en los últimos 3 días.',
    timestamp: '2024-01-15 08:30',
    active: true
  },
  {
    id: '3',
    type: 'resolved',
    title: 'Hidratación Normalizada',
    description: 'Tus niveles de hidratación han vuelto al rango óptimo.',
    timestamp: '2024-01-15 07:15',
    active: false
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

  const getNotificationIcon = (notification: any) => {
    const Icon = notification.icon;
    return <Icon className={`h-5 w-5 text-${notification.color}-600`} />;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Media</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Baja</Badge>;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Check className="h-5 w-5 text-green-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const activeAlertsCount = activeAlerts.filter(a => a.active).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="relative">
            <Bell className="h-8 w-8 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Notificaciones</h2>
        </div>
        <p className="text-sm text-gray-600">
          Alertas, consejos y actualizaciones de tu sistema bicognitivo
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">{activeAlertsCount}</div>
            <p className="text-sm text-red-600">Alertas Activas</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{unreadCount}</div>
            <p className="text-sm text-blue-600">No Leídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Notifications */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full bg-white/80">
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`border-none shadow-lg hover:shadow-xl transition-all duration-200 ${!notification.read ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(notification.priority)}
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-2 ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
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
                            className="h-7 px-3 text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marcar leída
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="h-7 px-3 text-xs">
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
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
                <p className="text-gray-600">
                  Cuando tengas nuevas notificaciones aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {activeAlerts.filter(alert => alert.active).map((alert) => (
            <Card key={alert.id} className="border-none shadow-lg border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertTypeIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                      <Badge 
                        className={`${
                          alert.type === 'critical' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {alert.type === 'critical' ? 'Crítico' : 'Advertencia'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{alert.timestamp}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-3 text-xs">
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
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 text-center">
                <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Todo bajo control</h3>
                <p className="text-gray-600">
                  No hay alertas activas. Tu salud bicognitiva está en óptimas condiciones.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <span>Configuración de Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Personaliza cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {notificationSettings.soundEnabled ? (
                      <Volume2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium">Sonido</p>
                      <p className="text-sm text-gray-600">Reproducir sonido para notificaciones</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.soundEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, soundEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Vibración</p>
                      <p className="text-sm text-gray-600">Vibrar dispositivo para alertas</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.vibrationEnabled}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, vibrationEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Alertas Críticas</p>
                      <p className="text-sm text-gray-600">Notificar problemas de salud urgentes</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.criticalAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, criticalAlerts: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Recomendaciones IA</p>
                      <p className="text-sm text-gray-600">Consejos personalizados diarios</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notificationSettings.recommendations}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, recommendations: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-2 pt-4">
        <Button variant="outline" size="sm">
          <Check className="h-4 w-4 mr-2" />
          Marcar Todas como Leídas
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurar Alertas
        </Button>
      </div>
    </div>
  );
}