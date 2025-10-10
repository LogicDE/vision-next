'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Activity, Heart, Brain, AlertTriangle, CheckCircle, Download, RefreshCw 
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RealtimeMetric {
  kpi_hour: string;
  heartrate: number;
  mentalstate: number;
  stress: number;
  users: number;
}

interface WeeklyMetric {
  day: string;
  heartrate: number;
  mentalstate: number;
  alerts: number;
  satisfaction: number;
}

interface RadarMetric {
  metric_name: string;
  metric_value: number;
}

export function KPIDashboard() {
  const [realtime, setRealtime] = useState<RealtimeMetric[]>([]);
  const [weekly, setWeekly] = useState<WeeklyMetric[]>([]);
  const [radar, setRadar] = useState<RadarMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTime = new Date().toLocaleTimeString();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const [realtimeRes, weeklyRes, radarRes] = await Promise.all([
          fetch(`${API_URL}/metrics/realtime`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/weekly`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/radar`, { credentials: 'include' }).then(res => res.json())
        ]);

        // Normalizamos datos
        setRealtime(Array.isArray(realtimeRes) ? realtimeRes.map(r => ({
          kpi_hour: r.kpi_hour,
          heartrate: r.heartrate ?? 0,
          mentalstate: r.mentalstate ?? 0,
          stress: r.stress ?? 0,
          users: Number(r.users ?? 0)
        })) : []);

        setWeekly(Array.isArray(weeklyRes) ? weeklyRes.map(w => ({
          day: w.day,
          heartrate: w.heartrate ?? 0,
          mentalstate: w.mentalstate ?? 0,
          alerts: Number(w.alerts ?? 0),
          satisfaction: Number(w.satisfaction ?? 0)
        })) : []);

        setRadar(Array.isArray(radarRes) ? radarRes.map(r => ({
          metric_name: r.metric ?? r.metric_name,
          metric_value: Number(r.value ?? r.metric_value ?? 0)
        })) : []);

      } catch (err) {
        console.error('Error fetching metrics', err);
        setRealtime([]);
        setWeekly([]);
        setRadar([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) return <div>Cargando KPIs...</div>;

  const avg = (arr?: number[]) => (arr && arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '-');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <span>Dashboard de KPIs Bicognitivos</span>
            </CardTitle>
            <CardDescription>
              Métricas en tiempo real y análisis predictivo con IA (Actualizado: {currentTime})
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Ritmo Cardíaco Promedio</p>
              <p className="text-3xl font-bold text-red-900">{realtime.length ? avg(realtime.map(r => r.heartrate)) : '-'}</p>
            </div>
            <Heart className="h-10 w-10 text-red-500 animate-pulse-soft" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Estado Mental Promedio</p>
              <p className="text-3xl font-bold text-blue-900">{realtime.length ? avg(realtime.map(r => r.mentalstate)) : '-'}%</p>
            </div>
            <Brain className="h-10 w-10 text-blue-500" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Usuarios Satisfechos</p>
              <p className="text-3xl font-bold text-green-900">{weekly.length ? avg(weekly.map(w => w.satisfaction)) : '-'} /5</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Alertas Activas</p>
              <p className="text-3xl font-bold text-yellow-900">{weekly.length ? weekly.reduce((a, b) => a + (b.alerts || 0), 0) : '-'}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/80">
          <TabsTrigger value="realtime">Tiempo Real</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="analysis">Análisis IA</TabsTrigger>
        </TabsList>

        {/* Tiempo Real */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Heart Rate */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Ritmo Cardíaco - Tiempo Real</span>
                </CardTitle>
                <CardDescription>Monitoreo continuo de todos los usuarios conectados</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kpi_hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartrate" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mental State */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>Estado Mental - Tiempo Real</span>
                </CardTitle>
                <CardDescription>Análisis bicognitivo procesado por IA</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realtime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="kpi_hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="mentalstate" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Users */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Usuarios Activos por Hora</span>
              </CardTitle>
              <CardDescription>Carga del sistema y engagement de usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={realtime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kpi_hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Weekly Health Trends */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Tendencias Semanales</span>
                </CardTitle>
                <CardDescription>Comparativa de métricas de salud por día</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartrate" stroke="#EF4444" strokeWidth={2} name="Ritmo Cardíaco" />
                    <Line type="monotone" dataKey="mentalstate" stroke="#3B82F6" strokeWidth={2} name="Estado Mental" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts vs Satisfaction */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span>Alertas vs Satisfacción</span>
                </CardTitle>
                <CardDescription>Correlación entre alertas y satisfacción del usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="alerts" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Alertas" />
                    <Line type="monotone" dataKey="satisfaction" stroke="#10B981" strokeWidth={3} name="Satisfacción" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análisis IA */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Radar */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Análisis Bicognitivo IA</span>
                </CardTitle>
                <CardDescription>Evaluación multidimensional del bienestar general</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric_name" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Puntuación" dataKey="metric_value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} strokeWidth={2} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
