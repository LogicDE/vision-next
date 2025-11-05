'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, RefreshCw, User, FileText, Clock, Search, Filter, Eye, Server } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AuditLog {
  id_event_log: number;
  object_type: string;
  change_set: any;
  ip_actor?: string;
  occurred_at?: string;
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

  // Función segura para formatear fechas
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'Fecha no válida' : format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  // Filtrado de logs
  const filteredLogs = logs.filter(log => {
    const typeMatch = filterObjectType === 'all' || log.object_type === filterObjectType;
    const dateMatch =
      (!startDate || new Date(log.occurred_at || '').getTime() >= new Date(startDate).getTime()) &&
      (!endDate || new Date(log.occurred_at || '').getTime() <= new Date(endDate).getTime());
    const searchMatch = !searchTerm || (
      log.object_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.actor && `${log.actor.first_name} ${log.actor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.action_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.service && log.service.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip_actor && log.ip_actor.includes(searchTerm))
    );
    return typeMatch && dateMatch && searchMatch;
  });

  const totalLogs = logs.length;
  const logsToday = logs.filter(l => l.occurred_at && new Date(l.occurred_at).toDateString() === new Date().toDateString()).length;
  const uniqueActors = new Set(logs.map(l => l.actor?.id)).size;
  const uniqueTypes = new Set(logs.map(l => l.object_type)).size;

  const getObjectTypeColor = (objectType?: string) => {
    const colors: { [key: string]: string } = {
      user: 'from-blue-500 to-cyan-500',
      enterprise: 'from-green-500 to-emerald-500',
      employee: 'from-purple-500 to-pink-500',
      group: 'from-orange-500 to-amber-500',
      default: 'from-gray-500 to-slate-500'
    };
    if (!objectType) return colors.default;
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
      {/* Header */}
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

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map(log => (
          <Card key={log.id_event_log} className="border-white/10 bg-slate-900/30 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Badge className={`bg-gradient-to-r ${getObjectTypeColor(log.object_type)} text-white border-0`}>
                    {log.object_type || 'Desconocido'}
                  </Badge>
                  {log.action && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
                      {log.action.action_name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(log.occurred_at)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                {log.actor && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-purple-400" />
                    <span className="text-gray-300">{log.actor.first_name} {log.actor.last_name}</span>
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
