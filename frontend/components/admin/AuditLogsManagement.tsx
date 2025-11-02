'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, RefreshCw, User, FileText, Clock, Search, Filter, Sparkles, Eye, Server } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AuditLog {
  id_event_log: number;
  object_type: string;
  change_set: any;
  ip_actor?: string;
  occurred_at: string;
  actor?: { id: number; first_name: string; last_name: string };
  action?: { action_name: string };
  service?: { service_name: string };
}

export function AuditLogsManagement() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterObjectType, setFilterObjectType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/audit-logs`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const typeMatch = filterObjectType === 'all' || log.object_type === filterObjectType;
    const dateMatch =
      (!startDate || new Date(log.occurred_at) >= new Date(startDate)) &&
      (!endDate || new Date(log.occurred_at) <= new Date(endDate));
    const searchMatch = 
      !searchTerm ||
      log.object_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor && `${log.actor.first_name} ${log.actor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.action_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.service && log.service.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_actor && log.ip_actor.includes(searchTerm));
    
    return typeMatch && dateMatch && searchMatch;
  });

  const totalLogs = logs.length;
  const logsToday = logs.filter(l => new Date(l.occurred_at).toDateString() === new Date().toDateString()).length;
  const uniqueActors = new Set(logs.map(l => l.actor?.id)).size;
  const uniqueTypes = new Set(logs.map(l => l.object_type)).size;

  const getObjectTypeColor = (objectType: string) => {
    const colors: { [key: string]: string } = {
      user: 'from-blue-500 to-cyan-500',
      enterprise: 'from-green-500 to-emerald-500',
      employee: 'from-purple-500 to-pink-500',
      group: 'from-orange-500 to-amber-500',
      default: 'from-gray-500 to-slate-500'
    };
    
    const key = objectType.toLowerCase();
    return colors[key] || colors.default;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando logs de auditoría...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span>Logs de Auditoría</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Registro completo de actividades y cambios en el sistema
          </p>
        </div>
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></div>
          {filteredLogs.length} registros
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Logs Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Logs</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalLogs}</div>
            <p className="text-xs text-gray-400">Registros en el sistema</p>
          </CardContent>
        </Card>

        {/* Today's Logs Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-green-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Logs Hoy</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{logsToday}</div>
            <p className="text-xs text-gray-400">Actividad reciente</p>
          </CardContent>
        </Card>

        {/* Unique Actors Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Actores Únicos</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{uniqueActors}</div>
            <p className="text-xs text-gray-400">Usuarios activos</p>
          </CardContent>
        </Card>

        {/* Object Types Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tipos de Objeto</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Server className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{uniqueTypes}</div>
            <p className="text-xs text-gray-400">Categorías únicas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 space-x-2 w-full">
              {/* Search Input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar en logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>

              {/* Object Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tipo de objeto"
                  value={filterObjectType === 'all' ? '' : filterObjectType}
                  onChange={e => setFilterObjectType(e.target.value || 'all')}
                  className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 w-48"
                />
              </div>
            </div>

            {/* Refresh Button */}
            <Button 
              onClick={fetchLogs}
              className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
            >
              <span className="relative z-10 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refrescar
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Button>
          </div>

          {/* Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filtrar por fecha:</span>
            </div>
            <div className="flex gap-2 items-center">
              <Input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-white"
              />
              <span className="text-gray-400">-</span>
              <Input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="bg-slate-900/50 border-white/10 text-white"
              />
            </div>
            <div className="text-sm text-gray-400 ml-auto">
              Mostrando {filteredLogs.length} de {logs.length} logs
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map(log => (
          <Card 
            key={log.id_event_log} 
            className="border-white/10 bg-slate-900/30 backdrop-blur-sm hover:border-blue-500/30 transition-all group"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`bg-gradient-to-r ${getObjectTypeColor(log.object_type)} text-white border-0`}>
                    {log.object_type}
                  </Badge>
                  {log.action && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                      {log.action.action_name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(log.occurred_at), 'yyyy-MM-dd HH:mm:ss')}</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {log.actor && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300">
                      {log.actor.first_name} {log.actor.last_name}
                    </span>
                  </div>
                )}
                {log.service && (
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-green-400" />
                    <span className="text-gray-300">{log.service.service_name}</span>
                  </div>
                )}
                {log.ip_actor && (
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-gray-300">IP: {log.ip_actor}</span>
                  </div>
                )}
              </div>

              {/* Change Sets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {log.change_set.before && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-400 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span>Antes</span>
                    </h4>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <pre className="text-xs text-red-300 overflow-x-auto">
                        {JSON.stringify(log.change_set.before, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {log.change_set.after && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-400 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Después</span>
                    </h4>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <pre className="text-xs text-green-300 overflow-x-auto">
                        {JSON.stringify(log.change_set.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                {log.change_set.new && (
                  <div className="space-y-2 lg:col-span-2">
                    <h4 className="text-sm font-semibold text-blue-400 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Nuevo</span>
                    </h4>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <pre className="text-xs text-blue-300 overflow-x-auto">
                        {JSON.stringify(log.change_set.new, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {!loading && filteredLogs.length === 0 && (
          <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No hay logs encontrados</h3>
              <p className="text-gray-400 mb-4">
                {logs.length === 0 
                  ? "No hay registros de auditoría en el sistema." 
                  : "No se encontraron logs que coincidan con los filtros aplicados."}
              </p>
              {(searchTerm || filterObjectType !== 'all' || startDate || endDate) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterObjectType('all');
                    setStartDate('');
                    setEndDate('');
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