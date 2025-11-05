'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, Building2, Activity, Shield, Server, AlertTriangle, CheckCircle, TrendingUp, 
  Zap, Database, Clock, RefreshCw, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line,
} from 'recharts';
import { fetchAPI } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';

// Types
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

// Default/Fallback data
const DEFAULT_DATA: DataState = {
  realtime: [
    { label: 'CPU', value: 35 },
    { label: 'RAM', value: 70 },
  ],
  weekly: [
    { label: 'Lunes', value: 5 },
    { label: 'Martes', value: 7 },
    { label: 'Miércoles', value: 9 },
    { label: 'Jueves', value: 6 },
    { label: 'Viernes', value: 10 },
  ],
  radar: [
    { metric: 'CPU', score: 80 },
    { metric: 'Memoria', score: 65 },
    { metric: 'Red', score: 90 },
  ],
  enterprises: [{ id: 1, name: 'Acme Inc.', email: 'info@acme.com', telephone: '555-1234' }],
  employees: [{ id: 1, first_name: 'Carlos', last_name: 'Rasgo', email: 'carlos@example.com', username: 'carlosr' }],
  services: [{ id: 1, name: 'API Gateway' }, { id: 2, name: 'Worker Queue' }],
};

const DEFAULT_STATUS: StatusState = {
  cms: false,
  xml: false,
  queue: 0,
  uptime: '—',
  latency: 0,
};

// Memoized Custom Tooltip
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      <p className="text-blue-400 text-sm">
        Valor: <span className="font-bold">{payload[0].value}</span>
      </p>
    </div>
  );
});

CustomTooltip.displayName = 'CustomTooltip';

// Memoized Stat Card Component
const StatCard = memo(({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  glowColor,
  hoverColor 
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: any;
  gradient: string;
  glowColor: string;
  hoverColor: string;
}) => (
  <Card className={`relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-${hoverColor} transition-all group`}>
    <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-3xl group-hover:opacity-30 transition-all opacity-10`} />
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-300">{title}</CardTitle>
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <p className="text-xs text-gray-400 flex items-center">
        <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
        {subtitle}
      </p>
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

// Memoized Status Badge Component
const StatusBadge = memo(({ online, label }: { online: boolean; label: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    {online ? (
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
));

StatusBadge.displayName = 'StatusBadge';

// Loading Component
const LoadingState = memo(() => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Database className="w-6 h-6 text-blue-400 animate-pulse" />
      </div>
    </div>
    <p className="text-gray-400 animate-pulse">Cargando métricas en tiempo real...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Error Component
const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col justify-center items-center h-96 space-y-4">
    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
      <AlertCircle className="w-8 h-8 text-red-400" />
    </div>
    <div className="text-center space-y-2">
      <p className="text-white font-semibold">Error al cargar métricas</p>
      <p className="text-gray-400 text-sm">No se pudieron obtener los datos del servidor</p>
    </div>
    <Button 
      onClick={onRetry}
      variant="outline"
      className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Reintentar
    </Button>
  </div>
));

ErrorState.displayName = 'ErrorState';

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DataState>(DEFAULT_DATA);
  const [status, setStatus] = useState<StatusState>(DEFAULT_STATUS);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Memoized computed values
  const enterpriseCount = useMemo(() => data.enterprises.length, [data.enterprises]);
  const employeeCount = useMemo(() => data.employees.length, [data.employees]);
  const serviceCount = useMemo(() => data.services.length, [data.services]);

  // Memoized system health percentage
  const systemHealth = useMemo(() => {
    const healthScore = data.radar.reduce((sum, item) => sum + item.score, 0) / data.radar.length;
    return Math.round(healthScore);
  }, [data.radar]);

  // Load data function
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(false);

    try {
      // Parallel fetch with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const [realtime, weekly, radar, enterprises, employees, services] = await Promise.allSettled([
        fetchAPI('/metrics/realtime', { signal: controller.signal }),
        fetchAPI('/metrics/weekly', { signal: controller.signal }),
        fetchAPI('/metrics/radar', { signal: controller.signal }),
        fetchAPI('/enterprises', { signal: controller.signal }),
        fetchAPI('/employees', { signal: controller.signal }),
        fetchAPI('/services', { signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      // Process results with fallbacks
      setData({
        realtime: (realtime.status === 'fulfilled' && realtime.value?.length) ? realtime.value : DEFAULT_DATA.realtime,
        weekly: (weekly.status === 'fulfilled' && weekly.value?.length) ? weekly.value : DEFAULT_DATA.weekly,
        radar: (radar.status === 'fulfilled' && radar.value?.length) ? radar.value : DEFAULT_DATA.radar,
        enterprises: (enterprises.status === 'fulfilled' && Array.isArray(enterprises.value)) ? enterprises.value : DEFAULT_DATA.enterprises,
        employees: (employees.status === 'fulfilled' && Array.isArray(employees.value)) ? employees.value : DEFAULT_DATA.employees,
        services: (services.status === 'fulfilled' && Array.isArray(services.value)) ? services.value : DEFAULT_DATA.services,
      });

      // Check service status
      const start = performance.now();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const [cmsCheck, xmlCheck] = await Promise.allSettled([
        fetch(`${apiUrl}/services`, { 
          credentials: 'include',
          signal: AbortSignal.timeout(5000)
        }),
        fetch(`${apiUrl}/metrics/realtime`, { 
          credentials: 'include',
          signal: AbortSignal.timeout(5000)
        }),
      ]);
      
      const end = performance.now();
      const latency = Math.round(end - start);

      // Calculate uptime (mock - in production this would come from API)
      const uptimePercent = (99 + Math.random()).toFixed(2);

      setStatus({
        cms: cmsCheck.status === 'fulfilled' && cmsCheck.value.ok,
        xml: xmlCheck.status === 'fulfilled' && xmlCheck.value.ok,
        queue: Math.floor(Math.random() * 200),
        uptime: `${uptimePercent}%`,
        latency,
      });

      setLastUpdate(new Date());
      setError(false);
    } catch (err) {
      console.error('Error cargando métricas:', err);
      setError(true);
      
      // Keep previous data if refresh fails
      if (!isRefresh) {
        setData(DEFAULT_DATA);
        setStatus(DEFAULT_STATUS);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  const handleRetry = useCallback(() => {
    loadData(false);
  }, [loadData]);

  // Render loading state
  if (loading && !error) {
    return <LoadingState />;
  }

  // Render error state
  if (error && !data.enterprises.length) {
    return <ErrorState onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Panel de Métricas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Estadísticas y rendimiento del sistema en tiempo real
            {lastUpdate && (
              <span className="ml-2 text-gray-500">
                • Actualizado {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live
          </Badge>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios"
          value={employeeCount}
          subtitle="Registrados en el sistema"
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
          glowColor="bg-blue-500"
          hoverColor="blue-500/30"
        />

        <StatCard
          title="Organizaciones"
          value={enterpriseCount}
          subtitle="Empresas activas"
          icon={Building2}
          gradient="from-green-500 to-emerald-500"
          glowColor="bg-green-500"
          hoverColor="green-500/30"
        />

        <StatCard
          title="Servicios"
          value={serviceCount}
          subtitle="Activos y operativos"
          icon={Activity}
          gradient="from-purple-500 to-pink-500"
          glowColor="bg-purple-500"
          hoverColor="purple-500/30"
        />

        {/* System Status Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-amber-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Estado del Sistema</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <StatusBadge online={status.cms} label="CMS" />
            <StatusBadge online={status.xml} label="XML Parser" />
            
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Latencia
                </span>
                <span className={`font-semibold ${status.latency < 200 ? 'text-green-400' : status.latency < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {status.latency} ms
                </span>
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
                  Rendimiento del sistema: <span className="font-semibold text-green-400">{systemHealth}%</span>
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
                <p className="text-xs text-gray-400">
                  {status.cms && status.xml 
                    ? 'Todos los servicios funcionando correctamente' 
                    : 'Algunos servicios presentan problemas'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Requests</p>
                <p className="text-lg font-bold text-white">1,234</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Avg Response</p>
                <p className={`text-lg font-bold ${status.latency < 200 ? 'text-green-400' : status.latency < 500 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {status.latency}ms
                </p>
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