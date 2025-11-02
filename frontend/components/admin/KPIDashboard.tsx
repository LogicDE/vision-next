'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Activity, Heart, Brain, AlertTriangle, CheckCircle, Download, RefreshCw,
  Sparkles, Zap, BarChart3, Users, Target, BrainCircuit
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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

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

  const avg = (arr?: number[]) => (arr && arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '-');

  // Función para exportar CSV
  const exportToCSV = (filename: string, data: any[]) => {
    if (!data.length) return alert("No hay datos para exportar.");
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","), 
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? "")).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  // Función para exportar Excel (XLSX simple con CSV MIME)
  const exportToExcel = (filename: string, data: any[]) => {
    if (!data.length) return alert("No hay datos para exportar.");
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join("\t"), 
      ...data.map(row => headers.map(h => row[h]).join("\t"))
    ].join("\n");

    const blob = new Blob([csv], { type: "application/vnd.ms-excel" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportMenuOpen(false);
  };

  // Función para exportar PDF (simple, usando impresión del navegador)
  const exportToPDF = () => {
    window.print();
    setExportMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando métricas en tiempo real...</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span>Dashboard de KPIs Biocognitivos</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Métricas en tiempo real y análisis predictivo con IA • Actualizado: {currentTime}
          </p>
        </div>
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
          Live
        </Badge>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Heart Rate Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-red-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ritmo Cardíaco</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {realtime.length ? avg(realtime.map(r => r.heartrate)) : '-'} BPM
            </div>
            <p className="text-xs text-gray-400">Promedio en tiempo real</p>
          </CardContent>
        </Card>

        {/* Mental State Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Estado Mental</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {realtime.length ? avg(realtime.map(r => r.mentalstate)) : '-'}%
            </div>
            <p className="text-xs text-gray-400">Análisis bicognitivo</p>
          </CardContent>
        </Card>

        {/* Satisfaction Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-green-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Satisfacción</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {weekly.length ? avg(weekly.map(w => w.satisfaction)) : '-'}/5
            </div>
            <p className="text-xs text-gray-400">Usuarios satisfechos</p>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-yellow-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Alertas Activas</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {weekly.length ? weekly.reduce((a, b) => a + (b.alerts || 0), 0) : '-'}
            </div>
            <p className="text-xs text-gray-400">Total semanal</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-300">Dashboard de Métricas Biocognitivas</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => window.location.reload()}
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
              >
                <span className="relative z-10 flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setExportMenuOpen(!exportMenuOpen)}
                  className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>

                {exportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl z-10 backdrop-blur-sm">
                    <button
                      onClick={() => exportToCSV("kpis_realtime", realtime)}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/10"
                    >
                      📊 Exportar CSV
                    </button>
                    <button
                      onClick={() => exportToExcel("kpis_weekly", weekly)}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors border-b border-white/10"
                    >
                      📈 Exportar Excel
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      📄 Exportar PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Tabs */}
      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
          <TabsTrigger 
            value="realtime" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white"
          >
            <Zap className="h-4 w-4" />
            <span>Tiempo Real</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Tendencias</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analysis" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white"
          >
            <BrainCircuit className="h-4 w-4" />
            <span>Análisis IA</span>
          </TabsTrigger>
        </TabsList>

        {/* Tiempo Real */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Heart Rate */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <span>Ritmo Cardíaco - Tiempo Real</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Monitoreo continuo de todos los usuarios conectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="kpi_hour" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="heartrate" 
                      stroke="#EF4444" 
                      strokeWidth={3} 
                      dot={{ fill: '#EF4444', r: 4 }} 
                      activeDot={{ r: 6, fill: '#DC2626' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Mental State */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span>Estado Mental - Tiempo Real</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Análisis bicognitivo procesado por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realtime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="kpi_hour" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="mentalstate" 
                      stroke="#3B82F6" 
                      fill="url(#mentalGradient)" 
                      strokeWidth={2} 
                    />
                    <defs>
                      <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Active Users */}
          <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span>Usuarios Activos por Hora</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Carga del sistema y engagement de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={realtime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="kpi_hour" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="users" 
                    fill="url(#userGradient)" 
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tendencias */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Weekly Health Trends */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span>Tendencias Semanales</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Comparativa de métricas de salud por día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="heartrate" 
                      stroke="#EF4444" 
                      strokeWidth={2} 
                      name="Ritmo Cardíaco" 
                      dot={{ fill: '#EF4444', r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mentalstate" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      name="Estado Mental" 
                      dot={{ fill: '#3B82F6', r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts vs Satisfaction */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <span>Alertas vs Satisfacción</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Correlación entre alertas y satisfacción del usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={weekly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="alerts" 
                      stackId="1" 
                      stroke="#F59E0B" 
                      fill="url(#alertGradient)" 
                      name="Alertas" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      name="Satisfacción" 
                      dot={{ fill: '#10B981', r: 4 }}
                    />
                    <defs>
                      <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <BrainCircuit className="h-4 w-4 text-white" />
                  </div>
                  <span>Análisis Bicognitivo IA</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Evaluación multidimensional del bienestar general
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="metric_name" 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    />
                    <Radar 
                      name="Puntuación" 
                      dataKey="metric_value" 
                      stroke="#8B5CF6" 
                      fill="url(#radarGradient)" 
                      strokeWidth={2} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <defs>
                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Additional Analysis Card */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span>Insights de IA</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Recomendaciones basadas en análisis predictivo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Optimización Detectada</p>
                      <p className="text-xs text-gray-400">Ritmo cardíaco estable en 85% de usuarios</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Tendencia Positiva</p>
                      <p className="text-xs text-gray-400">Satisfacción aumentó 12% esta semana</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Atención Requerida</p>
                      <p className="text-xs text-gray-400">Monitorizar estrés en horas pico</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}