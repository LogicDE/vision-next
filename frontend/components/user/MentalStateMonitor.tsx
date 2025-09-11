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
  RefreshCw
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

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excelente':
        return <Smile className="h-8 w-8 text-green-500" />;
      case 'bueno':
        return <Smile className="h-8 w-8 text-blue-500" />;
      case 'regular':
        return <Meh className="h-8 w-8 text-yellow-500" />;
      default:
        return <Frown className="h-8 w-8 text-red-500" />;
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excelente': return 'green';
      case 'bueno': return 'blue';
      case 'regular': return 'yellow';
      default: return 'red';
    }
  };

  const getStatusLevel = (value: number) => {
    if (value >= 80) return { level: 'Excelente', color: 'green' };
    if (value >= 60) return { level: 'Bueno', color: 'blue' };
    if (value >= 40) return { level: 'Regular', color: 'yellow' };
    return { level: 'Bajo', color: 'red' };
  };

  const moodColor = getMoodColor(data.mentalState.mood);
  const overallStatus = getStatusLevel(data.mentalState.overall);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitor Mental</h2>
          <p className="text-sm text-gray-600">
            Análisis bicognitivo • Última actualización: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          setData(generateMockData());
          setLastUpdate(new Date());
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Main Mental State Card */}
      <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Estado Mental General</span>
            </div>
            <Badge className={`bg-${overallStatus.color}-100 text-${overallStatus.color}-800`}>
              {overallStatus.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {data.mentalState.overall}%
            </div>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {getMoodIcon(data.mentalState.mood)}
              <span className={`text-lg font-medium text-${moodColor}-600 capitalize`}>
                {data.mentalState.mood}
              </span>
            </div>
            <Progress value={data.mentalState.overall} className="w-full h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Energy & Focus */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Energía y Concentración</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Nivel de Energía</span>
                <span className="text-lg font-bold text-yellow-600">{data.mentalState.energy}%</span>
              </div>
              <Progress value={data.mentalState.energy} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Concentración</span>
                <span className="text-lg font-bold text-blue-600">{data.mentalState.focus}%</span>
              </div>
              <Progress value={data.mentalState.focus} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Nivel de Estrés</span>
                <span className="text-lg font-bold text-red-600">{data.mentalState.stress}%</span>
              </div>
              <Progress value={data.mentalState.stress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Sleep Quality */}
        <Card className="border-none shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Moon className="h-5 w-5 text-indigo-600" />
              <span>Calidad del Sueño</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{data.sleepQuality.hours}h</p>
                <p className="text-sm text-gray-600">Horas dormidas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{data.sleepQuality.quality}%</p>
                <p className="text-sm text-gray-600">Calidad</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Sueño Profundo</span>
                <span className="text-lg font-bold text-indigo-600">{data.sleepQuality.deepSleep}%</span>
              </div>
              <Progress value={data.sleepQuality.deepSleep} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Metrics Chart */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Métricas Cognitivas</span>
          </CardTitle>
          <CardDescription>
            Análisis detallado de capacidades cognitivas (JSON API)
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {data.cognitiveMetrics.map((metric, index) => (
                <div key={metric.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <Badge variant="secondary">{metric.value}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Tendencia Semanal</span>
          </CardTitle>
          <CardDescription>
            Evolución de tu estado mental durante la semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.3}
                name="Estado Mental"
              />
              <Area 
                type="monotone" 
                dataKey="stress" 
                stroke="#EF4444" 
                fill="#EF4444" 
                fillOpacity={0.2}
                name="Estrés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <span>Recomendaciones IA</span>
          </CardTitle>
          <CardDescription>
            Sugerencias personalizadas para mejorar tu bienestar mental
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <Sun className="h-5 w-5 text-yellow-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Exposición Solar</p>
                <p className="text-sm text-gray-600">15 minutos de luz natural pueden mejorar tu estado de ánimo en un 12%</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
              <Brain className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <p className="font-medium text-gray-900">Ejercicio Mental</p>
                <p className="text-sm text-gray-600">Prueba ejercicios de mindfulness durante 10 minutos para reducir el estrés</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}