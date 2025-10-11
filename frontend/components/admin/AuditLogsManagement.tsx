'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(false);
  const [filterObjectType, setFilterObjectType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
    return typeMatch && dateMatch;
  });

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Logs de Auditoría</CardTitle>
            <CardDescription>Visualiza los cambios realizados en el sistema</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            Refrescar
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            placeholder="Filtrar por tipo de objeto"
            value={filterObjectType}
            onChange={e => setFilterObjectType(e.target.value)}
            className="w-48"
          />
          <div className="flex gap-2 items-center">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span>-</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading && <p>Cargando logs...</p>}

      <div className="space-y-4">
        {filteredLogs.map(log => (
          <Card key={log.id_event_log} className="border-none shadow-lg">
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">{log.object_type}</h3>
                <span className="text-sm text-gray-500">{format(new Date(log.occurred_at), 'yyyy-MM-dd HH:mm:ss')}</span>
              </div>
              <p className="text-sm text-gray-600">IP: {log.ip_actor || 'Desconocida'}</p>
              {log.actor && <p className="text-sm text-gray-600">Actor: {log.actor.first_name} {log.actor.last_name}</p>}
              {log.action && <p className="text-sm text-gray-600">Acción: {log.action.action_name}</p>}
              {log.service && <p className="text-sm text-gray-600">Servicio: {log.service.service_name}</p>}

              {/* Mostrar before / after / new */}
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                {log.change_set.before && (
                  <div className="p-2 border rounded bg-red-50">
                    <h4 className="font-medium">Antes</h4>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(log.change_set.before, null, 2)}</pre>
                  </div>
                )}
                {log.change_set.after && (
                  <div className="p-2 border rounded bg-green-50">
                    <h4 className="font-medium">Después</h4>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(log.change_set.after, null, 2)}</pre>
                  </div>
                )}
                {log.change_set.new && (
                  <div className="p-2 border rounded bg-blue-50">
                    <h4 className="font-medium">Nuevo</h4>
                    <pre className="text-xs overflow-x-auto">{JSON.stringify(log.change_set.new, null, 2)}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredLogs.length === 0 && !loading && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay logs</h3>
              <p className="text-gray-600">No se encontraron logs que coincidan con los filtros.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
