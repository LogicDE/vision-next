'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Footprints
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

export function HealthMetrics() {
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

  const getHeartRateStatus = useCallback((bpm: number) => {
    if (bpm < 60) return { 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30', 
      status: 'Bradicardia',
      gradient: 'from-blue-500 to-cyan-500'
    };
    if (bpm > 100) return { 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30', 
      status: 'Taquicardia',
      gradient: 'from-red-500 to-pink-500'
    };
    return { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      status: 'Normal',
      gradient: 'from-green-500 to-emerald-500'
    };
  }, []);

  const getBPStatus = useCallback((sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return { 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30', 
      status: 'Alta' 
    };
    if (sys < 90 || dia < 60) return { 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30', 
      status: 'Baja' 
    };
    return { 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30', 
      status: 'Óptima' 
    };
  }, []);

  const heartRateStatus = getHeartRateStatus(data.heartRate.current);
  const bpStatus = getBPStatus(data.bloodPressure.systolic, data.bloodPressure.diastolic);
  const stepsProgress = (data.steps.current / data.steps.goal) * 100;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{payload[0].payload.time}</p>
          <p className="text-red-400 text-sm">
            <span className="font-bold">{payload[0].value}</span> BPM
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-400 animate-pulse" />
            <span>Métricas de Salud en Tiempo Real</span>
          </h2>
          <p className="text-sm text-gray-400 flex items-center space-x-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>Última actualización: {lastUpdate.toLocaleTimeString()}</span>
            <span className="flex items-center ml-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1.5"></div>
              Live
            </span>
          </p>
        </div>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Main Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Heart Rate */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-red-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${heartRateStatus.gradient} flex items-center justify-center`}>
                  <Heart className="h-5 w-5 text-white animate-pulse" />
                </div>
                <span className="text-white">Ritmo Cardíaco</span>
              </div>
              <Badge className={`${heartRateStatus.bg} ${heartRateStatus.color} ${heartRateStatus.border} border`}>
                {heartRateStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-5xl font-bold ${heartRateStatus.color} mb-2`}>
                {data.heartRate.current}
              </div>
              <p className="text-sm text-gray-400 mb-3">BPM (latidos por minuto)</p>
              <div className="flex items-center justify-center text-sm">
                {data.heartRate.trend === 'up' ? (
                  <div className="flex items-center space-x-1 text-green-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Tendencia al alza</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-blue-400">
                    <TrendingDown className="h-4 w-4" />
                    <span>Tendencia a la baja</span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.heartRate.history}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    fill="url(#heartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="text-white">Presión Arterial</span>
              </div>
              <Badge className={`${bpStatus.bg} ${bpStatus.color} ${bpStatus.border} border`}>
                {bpStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <div className="text-4xl font-bold text-blue-400">
                  {data.bloodPressure.systolic}<span className="text-gray-600">/</span>{data.bloodPressure.diastolic}
                </div>
                <p className="text-sm text-gray-400 mt-2">mmHg (milímetros de mercurio)</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                  <p className="text-xs font-medium text-gray-400 mb-2">SISTÓLICA</p>
                  <p className="text-2xl font-bold text-blue-400">{data.bloodPressure.systolic}</p>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${(data.bloodPressure.systolic / 180) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                  <p className="text-xs font-medium text-gray-400 mb-2">DIASTÓLICA</p>
                  <p className="text-2xl font-bold text-purple-400">{data.bloodPressure.diastolic}</p>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${(data.bloodPressure.diastolic / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Temperature */}
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-orange-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Thermometer className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Temperatura</p>
                  <p className="text-3xl font-bold text-orange-400">{data.temperature.current}°C</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Normal
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-cyan-500/30 transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Saturación O₂</p>
                  <p className="text-3xl font-bold text-cyan-400">{data.oxygenSaturation.current}%</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Excelente
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm hover:border-green-500/30 transition-all">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Footprints className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Pasos Hoy</p>
                    <p className="text-2xl font-bold text-green-400">{data.steps.current.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{stepsProgress.toFixed(0)}% completado</span>
                  <span>Meta: {data.steps.goal.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all flex items-center justify-end pr-1"
                    style={{ width: `${Math.min(stepsProgress, 100)}%` }}
                  >
                    {stepsProgress >= 20 && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status Summary */}
      <Card className="border-white/10 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span>Resumen de Salud</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Estado general basado en tus métricas biocognitivas actuales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Estado Actual</h4>
              <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-300">Todas las métricas dentro del rango normal</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>Recomendación IA</span>
              </h4>
              <p className="text-sm text-gray-300 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                Mantén tu nivel de actividad actual. Considera aumentar la hidratación durante el día.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Heart className="h-4 w-4 mr-2 text-red-400" />
          Registrar Manual
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Activity className="h-4 w-4 mr-2 text-blue-400" />
          Ver Historial
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
          Configurar Alertas
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Target className="h-4 w-4 mr-2 text-green-400" />
          Ajustar Metas
        </Button>
      </div>
    </div>
  );
}