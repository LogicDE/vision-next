'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, AlertCircle, CheckCircle, Clock, Heart, Brain, Bell, User, RefreshCw, Settings, Sparkles, TrendingUp, Activity } from 'lucide-react';

type AlertType = {
  id: string;
  type: string;
  title: string;
  description: string;
  user: string;
  userId: string;
  heartRate?: number;
  mentalState?: number;
  stressLevel?: number;
  timestamp: string;
  status: string;
  priority: string;
  avatar: string;
};

const mockAlerts: AlertType[] = [
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
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        setAlerts(data.length ? data : mockAlerts);
      } catch (err) {
        console.error('Error cargando alertas', err);
        setAlerts(mockAlerts);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Activa</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">Reconocida</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">Resuelta</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 text-xs">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0 text-xs">Media</Badge>;
      case 'low':
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs">Baja</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Normal</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filterStatus === 'all' || alert.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || alert.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const totalActive = alerts.filter(a => a.status === 'active').length;
  const totalAcknowledged = alerts.filter(a => a.status === 'acknowledged').length;
  const totalResolved = alerts.filter(a => a.status === 'resolved').length;
  const totalUsers = new Set(alerts.map(a => a.userId)).size;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando alertas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Alertas Biocognitivas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Monitoreo de alertas críticas y notificaciones del sistema
          </p>
        </div>
        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></div>
          {totalActive} activas
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Alerts Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Alertas Activas</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalActive}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <Activity className="w-3 h-3 mr-1 text-red-400" />
              Requieren atención
            </p>
          </CardContent>
        </Card>

        {/* Acknowledged Alerts Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-yellow-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">En Proceso</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalAcknowledged}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-yellow-400" />
              En revisión
            </p>
          </CardContent>
        </Card>

        {/* Resolved Alerts Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-green-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Resueltas Hoy</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalResolved}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
              Completadas
            </p>
          </CardContent>
        </Card>

        {/* Affected Users Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Usuarios Afectados</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalUsers}</div>
            <p className="text-xs text-gray-400">Monitoreo activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-300">Filtros:</span>
            </div>
            
            <div className="flex flex-1 space-x-2 max-w-md">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10">Todos los estados</SelectItem>
                  <SelectItem value="active" className="hover:bg-white/10">Activas</SelectItem>
                  <SelectItem value="acknowledged" className="hover:bg-white/10">Reconocidas</SelectItem>
                  <SelectItem value="resolved" className="hover:bg-white/10">Resueltas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="bg-slate-900/50 border-white/10 text-white">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="all" className="hover:bg-white/10">Todas las prioridades</SelectItem>
                  <SelectItem value="high" className="hover:bg-white/10">Alta</SelectItem>
                  <SelectItem value="medium" className="hover:bg-white/10">Media</SelectItem>
                  <SelectItem value="low" className="hover:bg-white/10">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-400">
                Mostrando {filteredAlerts.length} de {alerts.length} alertas
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <Settings className="h-4 w-4 mr-2" /> Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <Card 
            key={alert.id} 
            className="border-white/10 bg-slate-900/30 backdrop-blur-sm hover:border-blue-500/30 transition-all group"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Alert Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {alert.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(alert.priority)}
                      {getStatusBadge(alert.status)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed">{alert.description}</p>

                  {/* User and Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {/* User Info */}
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                          <AvatarImage src={alert.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                            {alert.user.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-sm font-medium text-white block">{alert.user}</span>
                          <Badge variant="outline" className="text-xs bg-slate-800 text-gray-300 border-white/10">
                            {alert.userId}
                          </Badge>
                        </div>
                      </div>

                      {/* Health Metrics */}
                      <div className="flex items-center space-x-3">
                        {alert.heartRate && (
                          <div className="flex items-center space-x-1 text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
                            <Heart className="h-3 w-3" />
                            <span className="text-xs font-bold">{alert.heartRate} BPM</span>
                          </div>
                        )}

                        {alert.mentalState && (
                          <div className="flex items-center space-x-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg">
                            <Brain className="h-3 w-3" />
                            <span className="text-xs font-bold">{alert.mentalState}%</span>
                          </div>
                        )}

                        {alert.stressLevel && (
                          <div className="flex items-center space-x-1 text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-lg">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs font-bold">{alert.stressLevel}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp and Actions */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{alert.timestamp}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {alert.status === 'active' && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                          >
                            Reconocer
                          </Button>
                        )}
                        {alert.status === 'acknowledged' && (
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                          >
                            Resolver
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
                        >
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredAlerts.length === 0 && (
          <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No hay alertas</h3>
              <p className="text-gray-400 mb-4">
                {alerts.length === 0 
                  ? "No hay alertas activas en el sistema." 
                  : "No se encontraron alertas que coincidan con los filtros seleccionados."}
              </p>
              {(filterStatus !== 'all' || filterPriority !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterPriority('all');
                  }}
                  className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}