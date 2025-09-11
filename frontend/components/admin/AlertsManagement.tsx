'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Heart, 
  Brain,
  Bell,
  Settings,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockAlerts = [
  {
    id: '1',
    type: 'critical',
    title: 'Ritmo Cardíaco Anormal',
    description: 'Usuario presenta taquicardia sostenida (>100 BPM)',
    user: 'Ana García',
    userId: 'USR-001',
    heartRate: 110,
    timestamp: '2024-01-15 10:30:15',
    status: 'active',
    priority: 'high',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '2',
    type: 'warning',
    title: 'Estado Mental Bajo',
    description: 'Disminución significativa en métricas de bienestar mental',
    user: 'Carlos López',
    userId: 'USR-002',
    mentalState: 45,
    timestamp: '2024-01-15 09:45:22',
    status: 'acknowledged',
    priority: 'medium',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '3',
    type: 'info',
    title: 'Patrón de Sueño Irregular',
    description: 'Detectado patrón de sueño inconsistente durante 3 días',
    user: 'María Rodríguez',
    userId: 'USR-003',
    timestamp: '2024-01-15 08:20:10',
    status: 'resolved',
    priority: 'low',
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '4',
    type: 'critical',
    title: 'Nivel de Estrés Crítico',
    description: 'Marcadores de estrés en zona roja durante >2 horas',
    user: 'Luis Martín',
    userId: 'USR-004',
    stressLevel: 95,
    timestamp: '2024-01-15 11:15:33',
    status: 'active',
    priority: 'high',
    avatar: '/api/placeholder/40/40'
  },
];

export function AlertsManagement() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800">Activa</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800">Reconocida</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resuelta</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || alert.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-red-50 to-yellow-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <span>Gestión de Alertas Bicognitivas</span>
              </CardTitle>
              <CardDescription>
                Monitoreo de alertas críticas y notificaciones del sistema (XML/JSON)
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">
              {mockAlerts.filter(a => a.status === 'active').length}
            </div>
            <p className="text-sm text-red-600">Alertas Activas</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-900">
              {mockAlerts.filter(a => a.status === 'acknowledged').length}
            </div>
            <p className="text-sm text-yellow-600">En Proceso</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {mockAlerts.filter(a => a.status === 'resolved').length}
            </div>
            <p className="text-sm text-green-600">Resueltas Hoy</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {new Set(mockAlerts.map(a => a.userId)).size}
            </div>
            <p className="text-sm text-purple-600">Usuarios Afectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <div className="flex space-x-2 flex-1">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="acknowledged">Reconocidas</SelectItem>
                  <SelectItem value="resolved">Resueltas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-600">
              Mostrando {filteredAlerts.length} de {mockAlerts.length} alertas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(alert.priority)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={alert.avatar} />
                          <AvatarFallback>{alert.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{alert.user}</span>
                        <Badge variant="outline" className="text-xs">{alert.userId}</Badge>
                      </div>
                      
                      {alert.heartRate && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm font-medium">{alert.heartRate} BPM</span>
                        </div>
                      )}
                      
                      {alert.mentalState && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Brain className="h-4 w-4" />
                          <span className="text-sm font-medium">{alert.mentalState}%</span>
                        </div>
                      )}
                      
                      {alert.stressLevel && (
                        <div className="flex items-center space-x-1 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">{alert.stressLevel}%</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0 flex flex-col space-y-2">
                  {alert.status === 'active' && (
                    <Button size="sm" variant="outline">
                      Reconocer
                    </Button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Resolver
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card className="border-none shadow-lg">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay alertas</h3>
            <p className="text-gray-600">
              No se encontraron alertas que coincidan con los filtros seleccionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}