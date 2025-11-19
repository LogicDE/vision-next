'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Zap, 
  Moon, 
  Sun, 
  Smile, 
  Meh, 
  Frown,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Clock,
  Activity,
  Target,
  AlertCircle,
  Download,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const generateMockData = () => ({
  mentalState: {
    overall: Math.floor(Math.random() * 30) + 70,
    mood: ['excelente', 'bueno', 'regular', 'bajo'][Math.floor(Math.random() * 4)],
    energy: Math.floor(Math.random() * 40) + 60,
    focus: Math.floor(Math.random() * 35) + 65,
    stress: Math.floor(Math.random() * 40) + 20,
  },
  sleepQuality: {
    hours: (Math.random() * 3 + 6).toFixed(1),
    quality: Math.floor(Math.random() * 30) + 70,
    deepSleep: Math.floor(Math.random() * 30) + 20,
  },
  cognitiveMetrics: [
    { name: 'Atención', value: Math.floor(Math.random() * 30) + 70 },
    { name: 'Memoria', value: Math.floor(Math.random() * 25) + 75 },
    { name: 'Procesamiento', value: Math.floor(Math.random() * 35) + 65 },
    { name: 'Creatividad', value: Math.floor(Math.random() * 40) + 60 },
  ],
  weeklyTrend: Array.from({ length: 7 }, (_, i) => ({
    day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
    value: Math.floor(Math.random() * 25) + 70,
    stress: Math.floor(Math.random() * 30) + 20,
  }))
});

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

// Tooltip memoizado
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl">
      <p className="text-white font-semibold text-xs mb-1">{payload[0].payload.day}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          <span className="font-bold">{entry.value}%</span> <span className="text-gray-400 text-xs">{entry.name}</span>
        </p>
      ))}
    </div>
  );
};

export function MentalStateMonitor({ userId }: { userId: number }) {
  const [data, setData] = useState(generateMockData());
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setData(generateMockData());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  }, []);

  // Memoizar funciones de estilo
  const getMoodIcon = useCallback((mood: string) => {
    switch (mood) {
      case 'excelente':
        return <Smile className="h-8 w-8 text-green-400" />;
      case 'bueno':
        return <Smile className="h-8 w-8 text-blue-400" />;
      case 'regular':
        return <Meh className="h-8 w-8 text-yellow-400" />;
      default:
        return <Frown className="h-8 w-8 text-red-400" />;
    }
  }, []);

  const getMoodGradient = useCallback((mood: string) => {
    switch (mood) {
      case 'excelente': return 'from-green-500 to-emerald-500';
      case 'bueno': return 'from-blue-500 to-cyan-500';
      case 'regular': return 'from-yellow-500 to-amber-500';
      default: return 'from-red-500 to-pink-500';
    }
  }, []);

  const getStatusLevel = useCallback((value: number) => {
    if (value >= 80) return { 
      level: 'Excelente', 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30',
      gradient: 'from-green-500 to-emerald-500',
      ring: 'ring-green-500/20'
    };
    if (value >= 60) return { 
      level: 'Bueno', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30',
      gradient: 'from-blue-500 to-cyan-500',
      ring: 'ring-blue-500/20'
    };
    if (value >= 40) return { 
      level: 'Regular', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/30',
      gradient: 'from-yellow-500 to-amber-500',
      ring: 'ring-yellow-500/20'
    };
    return { 
      level: 'Bajo', 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30',
      gradient: 'from-red-500 to-pink-500',
      ring: 'ring-red-500/20'
    };
  }, []);

  // Calcular estados memoizados
  const moodGradient = useMemo(() => getMoodGradient(data.mentalState.mood), [data.mentalState.mood, getMoodGradient]);
  const overallStatus = useMemo(() => getStatusLevel(data.mentalState.overall), [data.mentalState.overall, getStatusLevel]);
  const energyStatus = useMemo(() => getStatusLevel(data.mentalState.energy), [data.mentalState.energy, getStatusLevel]);
  const focusStatus = useMemo(() => getStatusLevel(data.mentalState.focus), [data.mentalState.focus, getStatusLevel]);
  const stressStatus = useMemo(() => getStatusLevel(data.mentalState.stress), [data.mentalState.stress, getStatusLevel]);

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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Brain className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Monitor de Estado Mental</h2>
              <p className="text-sm text-gray-400">Análisis biocognitivo en tiempo real</p>
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

      {/* Main Mental State Card - Rediseñado */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg ring-4 ${overallStatus.ring}`}>
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Estado Mental General</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Análisis integral</p>
              </div>
            </div>
            <Badge className={`${overallStatus.bg} ${overallStatus.color} ${overallStatus.border} border px-3 py-1 font-semibold shadow-lg`}>
              {overallStatus.level}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-5 relative z-10">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className={`text-6xl font-black ${overallStatus.color} tracking-tight`}>
                {data.mentalState.overall}%
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${moodGradient} flex items-center justify-center shadow-lg ring-4 ${overallStatus.ring}`}>
                {getMoodIcon(data.mentalState.mood)}
              </div>
              <span className={`text-lg font-bold ${overallStatus.color} capitalize`}>
                {data.mentalState.mood}
              </span>
            </div>
            
            <div className="relative w-full bg-slate-800/50 rounded-full h-4 overflow-hidden border border-white/5">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 bg-gradient-to-r ${overallStatus.gradient} shadow-lg relative overflow-hidden`}
                style={{ width: `${data.mentalState.overall}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics - Rediseñados */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Energy & Focus */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all duration-500"></div>
          
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-yellow-500/20">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Energía y Concentración</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Niveles de rendimiento</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5">
            {/* Energía */}
            <div className="relative p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all group/card">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Nivel de Energía</span>
                  <span className={`text-2xl font-black ${energyStatus.color}`}>{data.mentalState.energy}%</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r ${energyStatus.gradient} shadow-lg shadow-yellow-500/30`}
                    style={{ width: `${data.mentalState.energy}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Concentración */}
            <div className="relative p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group/card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Concentración</span>
                  <span className={`text-2xl font-black ${focusStatus.color}`}>{data.mentalState.focus}%</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r ${focusStatus.gradient} shadow-lg shadow-blue-500/30`}
                    style={{ width: `${data.mentalState.focus}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Estrés */}
            <div className="relative p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all group/card">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 to-red-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Nivel de Estrés</span>
                  <span className={`text-2xl font-black ${stressStatus.color}`}>{data.mentalState.stress}%</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/30"
                    style={{ width: `${data.mentalState.stress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality - Rediseñado */}
        <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
          
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-4 ring-indigo-500/20">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Calidad del Sueño</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Análisis de descanso</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group/card p-5 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <div className="relative space-y-2">
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Horas</p>
                  <p className="text-3xl font-black text-indigo-400">{data.sleepQuality.hours}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Horas dormidas</p>
                </div>
              </div>
              
              <div className="relative group/card p-5 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                <div className="relative space-y-2">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Calidad</p>
                  <p className="text-3xl font-black text-purple-400">{data.sleepQuality.quality}%</p>
                  <p className="text-[10px] text-gray-500 font-medium">Eficiencia</p>
                </div>
              </div>
            </div>

            <div className="relative p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-300">Sueño Profundo</span>
                  <span className="text-2xl font-black text-indigo-400">{data.sleepQuality.deepSleep}%</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden border border-white/5">
                  <div 
                    className="h-2.5 rounded-full transition-all duration-1000 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30"
                    style={{ width: `${data.sleepQuality.deepSleep}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Metrics Chart - Rediseñado */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
        
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Métricas Cognitivas</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Análisis detallado de capacidades cognitivas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.cognitiveMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.cognitiveMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl p-3 shadow-2xl">
                          <p className="text-white font-semibold text-sm">{payload[0].name}</p>
                          <p className="text-blue-400 text-lg font-bold mt-1">
                            {payload[0].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-3">
              {data.cognitiveMetrics.map((metric, index) => (
                <div key={metric.name} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/10 hover:border-white/20 hover:bg-slate-800/70 transition-all group/item">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg ring-2 ring-slate-900" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-semibold text-white">{metric.name}</span>
                  </div>
                  <Badge className="bg-slate-700/50 text-white border-white/10 font-bold px-3">
                    {metric.value}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend - Rediseñado */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl group hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-500"></div>
        
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Tendencia Semanal</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Evolución de tu estado mental durante la semana
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={data.weeklyTrend}>
              <defs>
                <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} />
              <YAxis stroke="#6B7280" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={3}
                fill="url(#mentalGradient)"
                name="Estado Mental"
              />
              <Area 
                type="monotone" 
                dataKey="stress" 
                stroke="#EF4444" 
                strokeWidth={3}
                fill="url(#stressGradient)"
                name="Estrés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations - Rediseñado */}
      <Card className="relative overflow-hidden border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-slate-900/50 to-orange-500/10 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">Recomendaciones IA</CardTitle>
              <CardDescription className="text-gray-400 text-sm">
                Sugerencias personalizadas para mejorar tu bienestar mental
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative">
          <div className="space-y-3">
            <div className="relative group/rec flex items-start gap-3 p-5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 to-yellow-500/10 rounded-xl opacity-0 group-hover/rec:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-yellow-500/20 relative z-10">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 relative z-10">
                <p className="font-bold text-white mb-1">Exposición Solar</p>
                <p className="text-sm text-gray-300 leading-relaxed">15 minutos de luz natural pueden mejorar tu estado de ánimo en un 12%</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 group-hover/rec:text-yellow-400 transition-colors flex-shrink-0 relative z-10" />
            </div>
            
            <div className="relative group/rec flex items-start gap-3 p-5 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/10 rounded-xl opacity-0 group-hover/rec:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-purple-500/20 relative z-10">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 relative z-10">
                <p className="font-bold text-white mb-1">Ejercicio Mental</p>
                <p className="text-sm text-gray-300 leading-relaxed">Prueba ejercicios de mindfulness durante 10 minutos para reducir el estrés</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 group-hover/rec:text-purple-400 transition-colors flex-shrink-0 relative z-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Mejoradas */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-blue-500/30 transition-all group">
          <Activity className="h-4 w-4 mr-2 text-blue-400 group-hover:scale-110 transition-transform" />
          Ejercicios Mentales
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-indigo-500/30 transition-all group">
          <Moon className="h-4 w-4 mr-2 text-indigo-400 group-hover:scale-110 transition-transform" />
          Meditación
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-amber-500/30 transition-all group">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400 group-hover:scale-110 transition-transform" />
          Configurar Recordatorios
        </Button>
        <Button variant="outline" size="sm" className="border-white/10 bg-slate-800/50 hover:bg-slate-700/50 text-white hover:border-green-500/30 transition-all group">
          <Target className="h-4 w-4 mr-2 text-green-400 group-hover:scale-110 transition-transform" />
          Establecer Metas
        </Button>
      </div>
    </div>
  );
}