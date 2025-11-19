'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Target,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle,
  Footprints,
  Zap,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const generateMockData = () => ({
  heartRate: {
    current: Math.floor(Math.random() * 20) + 65,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    history: Array.from({ length: 12 }, (_, i) => ({
      time: `${String(i + 1).padStart(2, '0')}:00`,
      value: Math.floor(Math.random() * 20) + 65
    }))
  },
  bloodPressure: {
    systolic: Math.floor(Math.random() * 30) + 110,
    diastolic: Math.floor(Math.random() * 20) + 70
  },
  temperature: {
    current: (Math.random() * 2 + 36).toFixed(1),
    status: 'normal'
  },
  oxygenSaturation: {
    current: Math.floor(Math.random() * 5) + 95,
    status: 'excellent'
  },
  steps: {
    current: Math.floor(Math.random() * 5000) + 8000,
    goal: 10000
  }
});

// Componente memoizado para el tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl">
      <p className="text-white font-semibold text-xs">{payload[0].payload.time}</p>
      <p className="text-red-400 text-sm font-bold mt-1">
        {payload[0].value} <span className="text-xs text-gray-400">BPM</span>
      </p>
    </div>
  );
};

export function HealthMetrics({ userId }: { userId: number }) {
  const [data, setData] = useState(generateMockData());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setData(generateMockData());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, []);

  // Memoizar cálculos de estado
  const heartRateStatus = useMemo(() => {
    const bpm = data.heartRate.current;
    if (bpm < 60) return { 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30', 
      status: 'Bradicardia',
      gradient: 'from-blue-500 to-cyan-500',
      ring: 'ring-blue-500/20'
    };
    if (bpm > 100) return { 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30', 
      status: 'Taquicardia',
      gradient: 'from-red-500 to-pink-500',
      ring: 'ring-red-500/20'
    };
    return { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      status: 'Normal',
      gradient: 'from-green-500 to-emerald-500',
      ring: 'ring-green-500/20'
    };
  }, [data.heartRate.current]);

  const bpStatus = useMemo(() => {
    const { systolic, diastolic } = data.bloodPressure;
    if (systolic > 140 || diastolic > 90) return { 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30', 
      status: 'Alta',
      icon: AlertCircle
    };
    if (systolic < 90 || diastolic < 60) return { 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30', 
      status: 'Baja',
      icon: TrendingDown
    };
    return { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      status: 'Óptima',
      icon: CheckCircle
    };
  }, [data.bloodPressure.systolic, data.bloodPressure.diastolic]);

  const stepsProgress = useMemo(() => 
    (data.steps.current / data.steps.goal) * 100,
    [data.steps.current, data.steps.goal]
  );

  const formattedTime = useMemo(() => 
    lastUpdate.toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }), 
    [lastUpdate]
  );

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <Heart className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Métricas de Salud</h2>
              <p className="text-sm text-gray-400">Monitoreo en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">Live</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/40"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Metrics Cards - Mejorados */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Heart Rate - Rediseñado */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${heartRateStatus.gradient} flex items-center justify-center shadow-lg ring-4 ${heartRateStatus.ring}`}>
                  <Heart className="h-5 w-5 text-white animate-pulse" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Ritmo Cardíaco</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Frecuencia cardíaca</p>
                </div>
              </div>
              <Badge className={`${heartRateStatus.bg} ${heartRateStatus.color} ${heartRateStatus.border} border px-3 py-1 font-semibold shadow-lg`}>
                {heartRateStatus.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5 relative z-10">
            <div className="text-center space-y-3">
              <div className="relative inline-block">
                <div className={`text-6xl font-black ${heartRateStatus.color} tracking-tight`}>
                  {data.heartRate.current}
                </div>
                <div className="absolute -right-8 top-2 text-sm text-gray-500 font-medium">BPM</div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm">
                {data.heartRate.trend === 'up' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 font-medium">Subiendo</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <TrendingDown className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-400 font-medium">Bajando</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-44 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.heartRate.history}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6B7280" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#6B7280" 
                    fontSize={10}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    fill="url(#heartGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure - Rediseñado */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-white text-base">Presión Arterial</CardTitle>
                  <p className="text-xs text-gray-500 mt-0.5">Sistólica / Diastólica</p>
                </div>
              </div>
              <Badge className={`${bpStatus.bg} ${bpStatus.color} ${bpStatus.border} border px-3 py-1 font-semibold shadow-lg`}>
                {bpStatus.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5">
            <div className="text-center space-y-3">
              <div className="inline-block">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {data.bloodPressure.systolic}
                  <span className="text-gray-600 mx-1">/</span>
                  {data.bloodPressure.diastolic}
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">mmHg</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group/card p-5 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Sistólica</p>
                    <TrendingUp className="h-3 w-3 text-blue-400 opacity-50" />
                  </div>
                  <p className="text-3xl font-black text-blue-400">{data.bloodPressure.systolic}</p>
                  <div className="w-full bg-slate-900/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/50"
                      style={{ width: `${Math.min((data.bloodPressure.systolic / 180) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="relative group/card p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Diastólica</p>
                    <TrendingDown className="h-3 w-3 text-purple-400 opacity-50" />
                  </div>
                  <p className="text-3xl font-black text-purple-400">{data.bloodPressure.diastolic}</p>
                  <div className="w-full bg-slate-900/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-1000 shadow-lg shadow-purple-500/50"
                      style={{ width: `${Math.min((data.bloodPressure.diastolic / 120) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics - Rediseñados */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Temperature */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-orange-500/40 transition-all group hover:shadow-xl hover:shadow-orange-500/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-orange-500/20">
                  <Thermometer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Temperatura</p>
                  <p className="text-3xl font-black text-orange-400 mt-1">{data.temperature.current}°C</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 shadow-lg">
                Normal
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-500/40 transition-all group hover:shadow-xl hover:shadow-cyan-500/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg ring-4 ring-cyan-500/20">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Saturación O₂</p>
                  <p className="text-3xl font-black text-cyan-400 mt-1">{data.oxygenSaturation.current}%</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 shadow-lg">
                Excelente
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-green-500/40 transition-all group hover:shadow-xl hover:shadow-green-500/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
          <CardContent className="p-5 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg ring-4 ring-green-500/20">
                    <Footprints className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pasos Hoy</p>
                    <p className="text-2xl font-black text-green-400 mt-1">{data.steps.current.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-green-400 font-bold">{stepsProgress.toFixed(0)}% completado</span>
                  <span className="text-gray-500">Meta: {data.steps.goal.toLocaleString()}</span>
                </div>
                <div className="relative w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 h-3 rounded-full transition-all duration-1000 flex items-center justify-end pr-1 shadow-lg shadow-green-500/50"
                    style={{ width: `${Math.min(stepsProgress, 100)}%` }}
                  >
                    {stepsProgress >= 15 && (
                      <CheckCircle className="h-2.5 w-2.5 text-white animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status Summary - Rediseñado */}
      <Card className="relative overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/10 via-slate-900/50 to-blue-500/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Resumen de Salud</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Análisis biocognitivo en tiempo real
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 p-4 bg-slate-900/30 rounded-xl border border-white/5">
              <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Estado Actual
              </h4>
              <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-300 font-medium">Óptimo</p>
                  <p className="text-xs text-gray-400 mt-1">Todas las métricas dentro del rango saludable</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 p-4 bg-slate-900/30 rounded-xl border border-white/5">
              <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Recomendación IA
              </h4>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <p className="text-sm text-gray-300 leading-relaxed">
                  Mantén tu nivel de actividad. Considera aumentar hidratación durante el día.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mejoradas */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-red-500/30 transition-all group">
          <Heart className="h-4 w-4 mr-2 text-red-400 group-hover:scale-110 transition-transform" />
          Registrar Manual
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-blue-500/30 transition-all group">
          <Activity className="h-4 w-4 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
          Ver Historial
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-amber-500/30 transition-all group">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform" />
          Configurar Alertas
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-green-500/30 transition-all group">
          <Target className="h-4 w-4 mr-2 text-green-400 group-hover:scale-110 transition-transform" />
          Ajustar Metas
        </Button>
      </div>
    </div>
  );
}