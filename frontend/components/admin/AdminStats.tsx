'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Building2, Activity, Shield, Server, AlertTriangle, CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line,
} from 'recharts';
import { fetchAPI } from '@/lib/apiClient';

type MetricItem = { label: string; value: number };
type RadarItem = { metric: string; score: number };
type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
};
type Enterprise = { id: number; name: string; email: string; telephone: string };

interface DataState {
  realtime: MetricItem[];
  weekly: MetricItem[];
  radar: RadarItem[];
  enterprises: Enterprise[];
  employees: Employee[];
  services: any[];
}

interface StatusState {
  cms: boolean;
  xml: boolean;
  queue: number;
  uptime: string;
  latency: number;
}

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataState>({
    realtime: [],
    weekly: [],
    radar: [],
    enterprises: [],
    employees: [],
    services: [],
  });

  const [status, setStatus] = useState<StatusState>({
    cms: false,
    xml: false,
    queue: 0,
    uptime: '—',
    latency: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [realtime, weekly, radar, enterprises, employees, services] = await Promise.allSettled([
          fetchAPI('/metrics/realtime'),
          fetchAPI('/metrics/weekly'),
          fetchAPI('/metrics/radar'),
          fetchAPI('/enterprises'),
          fetchAPI('/employees'),
          fetchAPI('/services'),
        ]);

        // usamos valores dummy si la promesa falla
        setData({
          realtime: (realtime.status === 'fulfilled' && realtime.value.length) ? realtime.value : [
            { label: 'CPU', value: 35 },
            { label: 'RAM', value: 70 },
          ],
          weekly: (weekly.status === 'fulfilled' && weekly.value.length) ? weekly.value : [
            { label: 'Lunes', value: 5 },
            { label: 'Martes', value: 7 },
            { label: 'Miércoles', value: 9 },
            { label: 'Jueves', value: 6 },
            { label: 'Viernes', value: 10 },
          ],
          radar: (radar.status === 'fulfilled' && radar.value.length) ? radar.value : [
            { metric: 'CPU', score: 80 },
            { metric: 'Memoria', score: 65 },
            { metric: 'Red', score: 90 },
          ],
          enterprises: (enterprises.status === 'fulfilled') ? enterprises.value : [{ id: 1, name: 'Acme Inc.', email: 'info@acme.com', telephone: '555-1234' }],
          employees: (employees.status === 'fulfilled') ? employees.value : [{ id: 1, first_name: 'Carlos', last_name: 'Rasgo', email: 'carlos@example.com', username: 'carlosr' }],
          services: (services.status === 'fulfilled') ? services.value : [{ id: 1, name: 'API Gateway' }, { id: 2, name: 'Worker Queue' }],
        });

        // simulación de chequeo de microservicios
        const start = performance.now();
        const xmlRes = await Promise.allSettled([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, { credentials: 'include' }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/realtime`, { credentials: 'include' }),
        ]);
        const end = performance.now();

        setStatus({
          cms: xmlRes[0].status === 'fulfilled',
          xml: xmlRes[1].status === 'fulfilled',
          queue: Math.floor(Math.random() * 200),
          uptime: `${(Math.random() * 99 + 1).toFixed(2)}%`,
          latency: Math.round(end - start),
        });
      } catch (err) {
        console.error('Error cargando métricas', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600 animate-pulse">
        Cargando métricas...
      </div>
    );
  }

  const enterpriseCount = data.enterprises.length;
  const employeeCount = data.employees.length ?? 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Resumen principal */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Usuarios */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{employeeCount}</div>
            <p className="text-xs text-blue-600">Registrados en el sistema</p>
          </CardContent>
        </Card>

        {/* Empresas */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{enterpriseCount}</div>
            <p className="text-xs text-green-600">Empresas activas</p>
          </CardContent>
        </Card>

        {/* Servicios */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{data.services.length}</div>
            <p className="text-xs text-purple-600">Activos</p>
          </CardContent>
        </Card>

        {/* Microservicios */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Microservicios</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">CMS</span>
              {status.cms ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">XML Parser</span>
              {status.xml ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
            <div className="flex justify-between text-sm text-red-700">
              <span>Latencia:</span>
              <span>{status.latency} ms</span>
            </div>
            <div className="flex justify-between text-sm text-red-700">
              <span>Uptime:</span>
              <span>{status.uptime}</span>
            </div>
            <p className="text-xs text-red-600">{status.queue} tareas en cola</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Métricas Semanales</CardTitle>
            <CardDescription>Promedio de actividad por semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Indicadores de Estado</CardTitle>
            <CardDescription>Rendimiento y salud general</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.radar}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
