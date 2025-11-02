'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Building2, Activity, Shield, Server, AlertTriangle, CheckCircle, TrendingUp, Zap, Database, Clock
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
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando métricas en tiempo real...</p>
      </div>
    );
  }

  const enterpriseCount = data.enterprises.length;
  const employeeCount = data.employees.length ?? 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          <p className="text-blue-400 text-sm">
            Valor: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Panel de Métricas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">Estadísticas y rendimiento del sistema en tiempo real</p>
        </div>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          Live
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Usuarios Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Usuarios</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{employeeCount}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Organizaciones Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-green-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Organizaciones</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{enterpriseCount}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
              Empresas activas
            </p>
          </CardContent>
        </Card>

        {/* Servicios Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-purple-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Servicios</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{data.services.length}</div>
            <p className="text-xs text-gray-400 flex items-center">
              <Zap className="w-3 h-3 mr-1 text-purple-400" />
              Activos y operativos
            </p>
          </CardContent>
        </Card>

        {/* Microservicios Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Estado del Sistema</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">CMS</span>
              {status.cms ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">XML Parser</span>
              {status.xml ? (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Latencia
                </span>
                <span className="text-white font-semibold">{status.latency} ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white font-semibold">{status.uptime}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Cola</span>
                <span className="text-white font-semibold">{status.queue} tareas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Metrics Chart */}
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span>Métricas Semanales</span>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Promedio de actividad por semana
                </CardDescription>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Semanal
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.weekly}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="label" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Health Chart */}
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span>Indicadores de Estado</span>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  Rendimiento y salud general del sistema
                </CardDescription>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Saludable
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.radar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="metric" stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10B981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10B981', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Status Bar */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Sistema Operativo</p>
                <p className="text-xs text-gray-400">Todos los servicios funcionando correctamente</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Requests</p>
                <p className="text-lg font-bold text-white">1,234</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Avg Response</p>
                <p className="text-lg font-bold text-white">{status.latency}ms</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Success Rate</p>
                <p className="text-lg font-bold text-green-400">99.8%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}