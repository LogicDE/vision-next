'use client';

import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHeartRateStatus = (bpm: number) => {
    if (bpm < 60) return { color: 'blue', status: 'Bradicardia' };
    if (bpm > 100) return { color: 'red', status: 'Taquicardia' };
    return { color: 'green', status: 'Normal' };
  };

  const getBPStatus = (sys: number, dia: number) => {
    if (sys > 140 || dia > 90) return { color: 'red', status: 'Alta' };
    if (sys < 90 || dia < 60) return { color: 'blue', status: 'Baja' };
    return { color: 'green', status: 'Óptima' };
  };

  const heartRateStatus = getHeartRateStatus(data.heartRate.current);
  const bpStatus = getBPStatus(data.bloodPressure.systolic, data.bloodPressure.diastolic);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas de Salud</h2>
          <p className="text-sm text-gray-600">
            Última actualización: {lastUpdate.toLocaleTimeString()}
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

      {/* Main Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Heart Rate */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-red-500 animate-pulse" />
                <span>Ritmo Cardíaco</span>
              </div>
              <Badge className={`bg-${heartRateStatus.color}-100 text-${heartRateStatus.color}-800`}>
                {heartRateStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-1">
                {data.heartRate.current}
              </div>
              <p className="text-sm text-gray-600">BPM</p>
              <div className="flex items-center justify-center mt-2 text-sm">
                {data.heartRate.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-blue-600 mr-1" />
                )}
                <span className={data.heartRate.trend === 'up' ? 'text-green-600' : 'text-blue-600'}>
                  {data.heartRate.trend === 'up' ? 'Aumentando' : 'Disminuyendo'}
                </span>
              </div>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.heartRate.history}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Blood Pressure */}
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-blue-500" />
                <span>Presión Arterial</span>
              </div>
              <Badge className={`bg-${bpStatus.color}-100 text-${bpStatus.color}-800`}>
                {bpStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {data.bloodPressure.systolic}/{data.bloodPressure.diastolic}
                </div>
                <p className="text-sm text-gray-600">mmHg</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-medium text-gray-900">Sistólica</p>
                  <p className="text-blue-600">{data.bloodPressure.systolic}</p>
                </div>
                <div className="text-center">
                  <p className="font-medium text-gray-900">Diastólica</p>
                  <p className="text-purple-600">{data.bloodPressure.diastolic}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {/* Temperature */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Thermometer className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Temperatura</p>
                <p className="text-2xl font-bold text-orange-600">{data.temperature.current}°C</p>
                <p className="text-xs text-green-600">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oxygen Saturation */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Saturación O₂</p>
                <p className="text-2xl font-bold text-blue-600">{data.oxygenSaturation.current}%</p>
                <p className="text-xs text-green-600">Excelente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pasos Hoy</p>
                <p className="text-2xl font-bold text-green-600">{data.steps.current.toLocaleString()}</p>
                <Progress 
                  value={(data.steps.current / data.steps.goal) * 100} 
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Meta: {data.steps.goal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Status Summary */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span>Resumen de Salud</span>
          </CardTitle>
          <CardDescription>
            Estado general basado en tus métricas actuales (API JSON)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Estado Actual</h4>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700">Todas las métricas dentro del rango normal</span>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Recomendación IA</h4>
              <p className="text-sm text-gray-600">
                Mantén tu nivel de actividad actual. Considera aumentar la hidratación.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          <Heart className="h-4 w-4 mr-2" />
          Registrar Manual
        </Button>
        <Button variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Ver Historial
        </Button>
        <Button variant="outline" size="sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          Configurar Alertas
        </Button>
      </div>
    </div>
  );
}