'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  Sparkles
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

export function MentalStateMonitor() {
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setData(generateMockData());
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getMoodIcon = (mood: string) => {
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
  };

  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case 'excelente': return 'from-green-500 to-emerald-500';
      case 'bueno': return 'from-blue-500 to-cyan-500';
      case 'regular': return 'from-yellow-500 to-amber-500';
      default: return 'from-red-500 to-pink-500';
    }
  };

  const getStatusLevel = (value: number) => {
    if (value >= 80) return { 
      level: 'Excelente', 
      color: 'text-green-400', 
      bg: 'bg-green-500/20', 
      border: 'border-green-500/30',
      gradient: 'from-green-500 to-emerald-500'
    };
    if (value >= 60) return { 
      level: 'Bueno', 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/20', 
      border: 'border-blue-500/30',
      gradient: 'from-blue-500 to-cyan-500'
    };
    if (value >= 40) return { 
      level: 'Regular', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/30',
      gradient: 'from-yellow-500 to-amber-500'
    };
    return { 
      level: 'Bajo', 
      color: 'text-red-400', 
      bg: 'bg-red-500/20', 
      border: 'border-red-500/30',
      gradient: 'from-red-500 to-pink-500'
    };
  };

  const moodGradient = getMoodGradient(data.mentalState.mood);
  const overallStatus = getStatusLevel(data.mentalState.overall);
  const energyStatus = getStatusLevel(data.mentalState.energy);
  const focusStatus = getStatusLevel(data.mentalState.focus);
  const stressStatus = getStatusLevel(data.mentalState.stress);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{payload[0].payload.day}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-bold">{entry.value}%</span> {entry.name}
            </p>
          ))}
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
            <Brain className="h-6 w-6 text-purple-400 animate-pulse" />
            <span>Monitor de Estado Mental</span>
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

      {/* Main Mental State Card */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-white">Estado Mental General</span>
            </div>
            <Badge className={`${overallStatus.bg} ${overallStatus.color} ${overallStatus.border} border`}>
              {overallStatus.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-5xl font-bold ${overallStatus.color} mb-2`}>
              {data.mentalState.overall}%
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${moodGradient} flex items-center justify-center`}>
                {getMoodIcon(data.mentalState.mood)}
              </div>
              <span className={`text-lg font-medium ${overallStatus.color} capitalize`}>
                {data.mentalState.mood}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all bg-gradient-to-r ${overallStatus.gradient}`}
                style={{ width: `${data.mentalState.overall}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Energy & Focus */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-yellow-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-white">Energía y Concentración</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Nivel de Energía</span>
                <span className={`text-lg font-bold ${energyStatus.color}`}>{data.mentalState.energy}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all bg-gradient-to-r ${energyStatus.gradient}`}
                  style={{ width: `${data.mentalState.energy}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Concentración</span>
                <span className={`text-lg font-bold ${focusStatus.color}`}>{data.mentalState.focus}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all bg-gradient-to-r ${focusStatus.gradient}`}
                  style={{ width: `${data.mentalState.focus}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Nivel de Estrés</span>
                <span className={`text-lg font-bold ${stressStatus.color}`}>{data.mentalState.stress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all bg-gradient-to-r from-red-500 to-pink-500"
                  style={{ width: `${data.mentalState.stress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Moon className="h-5 w-5 text-white" />
              </div>
              <span className="text-white">Calidad del Sueño</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-indigo-400">{data.sleepQuality.hours}h</p>
                <p className="text-sm text-gray-400">Horas dormidas</p>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <p className="text-2xl font-bold text-purple-400">{data.sleepQuality.quality}%</p>
                <p className="text-sm text-gray-400">Calidad</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Sueño Profundo</span>
                <span className="text-lg font-bold text-indigo-400">{data.sleepQuality.deepSleep}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${data.sleepQuality.deepSleep}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Metrics Chart */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span>Métricas Cognitivas</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Análisis detallado de capacidades cognitivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.cognitiveMetrics}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
                        <div className="bg-slate-800/95 backdrop-blur-sm border border-white/10 rounded-lg p-3 shadow-xl">
                          <p className="text-white font-semibold">{payload[0].name}</p>
                          <p className="text-blue-400 text-sm">
                            <span className="font-bold">{payload[0].value}%</span>
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
                <div key={metric.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-white">{metric.name}</span>
                  </div>
                  <Badge className="bg-slate-700/50 text-white border-white/10">
                    {metric.value}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-green-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span>Tendencia Semanal</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Evolución de tu estado mental durante la semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.weeklyTrend}>
              <defs>
                <linearGradient id="mentalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                fill="url(#mentalGradient)"
                name="Estado Mental"
              />
              <Area 
                type="monotone" 
                dataKey="stress" 
                stroke="#EF4444" 
                strokeWidth={2}
                fill="url(#stressGradient)"
                name="Estrés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border-yellow-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span>Recomendaciones IA</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sugerencias personalizadas para mejorar tu bienestar mental
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 hover:border-yellow-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Exposición Solar</p>
                <p className="text-sm text-gray-300">15 minutos de luz natural pueden mejorar tu estado de ánimo en un 12%</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Ejercicio Mental</p>
                <p className="text-sm text-gray-300">Prueba ejercicios de mindfulness durante 10 minutos para reducir el estrés</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Activity className="h-4 w-4 mr-2 text-blue-400" />
          Ejercicios Mentales
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Moon className="h-4 w-4 mr-2 text-indigo-400" />
          Meditación
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
          Configurar Recordatorios
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Target className="h-4 w-4 mr-2 text-green-400" />
          Establecer Metas
        </Button>
      </div>
    </div>
  );
}