'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Heart, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const kpiData = {
  realTimeMetrics: [
    { time: '00:00', heartRate: 72, mentalState: 85, stress: 25, users: 1200 },
    { time: '04:00', heartRate: 68, mentalState: 88, stress: 22, users: 980 },
    { time: '08:00', heartRate: 75, mentalState: 82, stress: 28, users: 1800 },
    { time: '12:00', heartRate: 78, mentalState: 79, stress: 32, users: 2100 },
    { time: '16:00', heartRate: 74, mentalState: 84, stress: 26, users: 1950 },
    { time: '20:00', heartRate: 71, mentalState: 87, stress: 24, users: 1500 },
  ],
  weeklyTrends: [
    { day: 'Lun', heartRate: 72, mentalState: 85, alerts: 12, satisfaction: 4.2 },
    { day: 'Mar', heartRate: 74, mentalState: 88, alerts: 8, satisfaction: 4.5 },
    { day: 'Mié', heartRate: 71, mentalState: 82, alerts: 15, satisfaction: 4.0 },
    { day: 'Jue', heartRate: 73, mentalState: 90, alerts: 6, satisfaction: 4.7 },
    { day: 'Vie', heartRate: 70, mentalState: 87, alerts: 9, satisfaction: 4.4 },
    { day: 'Sáb', heartRate: 75, mentalState: 85, alerts: 11, satisfaction: 4.3 },
    { day: 'Dom', heartRate: 69, mentalState: 89, alerts: 7, satisfaction: 4.6 },
  ],
  radarData: [
    { metric: 'Salud Cardiovascular', value: 85 },
    { metric: 'Estado Mental', value: 87 },
    { metric: 'Nivel de Estrés', value: 25 },
    { metric: 'Calidad del Sueño', value: 78 },
    { metric: 'Actividad Física', value: 82 },
    { metric: 'Bienestar General', value: 88 },
  ]
};

export function KPIDashboard() {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
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
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Ritmo Cardíaco Promedio</p>
                <p className="text-3xl font-bold text-red-900">73.2</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% vs ayer
                </p>
              </div>
              <Heart className="h-10 w-10 text-red-500 animate-pulse-soft" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Estado Mental Promedio</p>
                <p className="text-3xl font-bold text-blue-900">85.4%</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3.2% vs ayer
                </p>
              </div>
              <Brain className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Usuarios Satisfechos</p>
                <p className="text-3xl font-bold text-green-900">4.5/5</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3 vs mes pasado
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Alertas Activas</p>
                <p className="text-3xl font-bold text-yellow-900">23</p>
                <p className="text-xs text-yellow-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -15% vs ayer
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
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

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Real-time Heart Rate */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Ritmo Cardíaco - Tiempo Real</span>
                </CardTitle>
                <CardDescription>
                  Monitoreo continuo de todos los usuarios conectados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={kpiData.realTimeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#EF4444" 
                      strokeWidth={3}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Real-time Mental State */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <span>Estado Mental - Tiempo Real</span>
                </CardTitle>
                <CardDescription>
                  Análisis bicognitivo procesado por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={kpiData.realTimeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="mentalState" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
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
              <CardDescription>
                Carga del sistema y engagement de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpiData.realTimeMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Weekly Health Trends */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Tendencias Semanales</span>
                </CardTitle>
                <CardDescription>
                  Comparativa de métricas de salud por día
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={kpiData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="heartRate" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Ritmo Cardíaco"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mentalState" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Estado Mental"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Alerts and Satisfaction */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span>Alertas vs Satisfacción</span>
                </CardTitle>
                <CardDescription>
                  Correlación entre alertas y satisfacción del usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={kpiData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="alerts" 
                      stackId="1"
                      stroke="#F59E0B" 
                      fill="#F59E0B"
                      fillOpacity={0.3}
                      name="Alertas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="satisfaction" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Satisfacción"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* AI Radar Analysis */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span>Análisis Bicognitivo IA</span>
                </CardTitle>
                <CardDescription>
                  Evaluación multidimensional del bienestar general
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={kpiData.radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }}
                    />
                    <Radar 
                      name="Puntuación" 
                      dataKey="value" 
                      stroke="#8B5CF6" 
                      fill="#8B5CF6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Predictions */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Predicciones IA</span>
                </CardTitle>
                <CardDescription>
                  Análisis predictivo basado en patrones bicognitivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-green-900">Mejora del Bienestar</p>
                      <p className="text-sm text-green-600">Próximas 48 horas</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">+15%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-yellow-900">Riesgo de Estrés</p>
                      <p className="text-sm text-yellow-600">Usuario ID: 1247</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Medio</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-blue-900">Optimización IA</p>
                      <p className="text-sm text-blue-600">Recomendaciones activas</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">347</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-purple-900">Patrón Detectado</p>
                      <p className="text-sm text-purple-600">Mejora nocturna del sueño</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Nuevo</Badge>
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