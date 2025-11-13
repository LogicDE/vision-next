'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Activity, Heart, Brain, AlertTriangle, CheckCircle, Download, RefreshCw,
  Sparkles, Zap, BarChart3, Users, Target, BrainCircuit, Shield, Calendar, PieChart,
  ArrowUp, ArrowDown, Minus, Eye, ClipboardList, Building2
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, PieChart as RechartsPieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Interfaces para las nuevas métricas
interface GroupTrendAlert {
  group_id: number;
  group_name: string;
  metric_name: string;
  trend_slope: number;
  direction: 'increasing' | 'decreasing' | 'stable';
}

interface SurveyParticipation {
  group_id: number;
  group_name: string;
  total_surveys: number;
  total_responses: number;
  participation_rate: number;
}

interface EmployeeActivity {
  employee_id: number;
  full_name: string;
  role_name: string;
  total_logs: number;
  last_action: string;
}

interface DailyOverview {
  date_label: string;
  total_snapshots: number;
  total_survey_responses: number;
  avg_wellbeing: number;
  avg_stress: number;
  avg_mental_state: number;
}

interface GroupMetricsSummary {
  group_id: number;
  group_name: string;
  metric_name: string;
  avg_value: number;
  min_value: number;
  max_value: number;
}

interface EnterpriseWellbeing {
  enterprise_id: number;
  enterprise_name: string;
  wellbeing_avg: number;
  stress_avg: number;
  mental_state_avg: number;
}

export function KPIDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Estados para todas las métricas
  const [trendAlerts, setTrendAlerts] = useState<GroupTrendAlert[]>([]);
  const [surveyParticipation, setSurveyParticipation] = useState<SurveyParticipation[]>([]);
  const [employeeActivity, setEmployeeActivity] = useState<EmployeeActivity[]>([]);
  const [dailyOverview, setDailyOverview] = useState<DailyOverview[]>([]);
  const [groupMetrics, setGroupMetrics] = useState<GroupMetricsSummary[]>([]);
  const [enterpriseWellbeing, setEnterpriseWellbeing] = useState<EnterpriseWellbeing[]>([]);

  useEffect(() => {
    async function fetchAdminMetrics() {
      try {
        setLoading(true);
        const [
          trendsRes, 
          surveyRes, 
          activityRes, 
          overviewRes, 
          groupRes, 
          enterpriseRes
        ] = await Promise.all([
          fetch(`${API_URL}/metrics/admin/trends`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/admin/survey-participation`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/admin/employee-activity?days=7`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/admin/overview`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/admin/group-summary?days=7`, { credentials: 'include' }).then(res => res.json()),
          fetch(`${API_URL}/metrics/admin/enterprise-summary`, { credentials: 'include' }).then(res => res.json())
        ]);

        setTrendAlerts(Array.isArray(trendsRes) ? trendsRes : []);
        setSurveyParticipation(Array.isArray(surveyRes) ? surveyRes : []);
        setEmployeeActivity(Array.isArray(activityRes) ? activityRes : []);
        setDailyOverview(Array.isArray(overviewRes) ? overviewRes : []);
        setGroupMetrics(Array.isArray(groupRes) ? groupRes : []);
        setEnterpriseWellbeing(Array.isArray(enterpriseRes) ? enterpriseRes : []);

      } catch (err) {
        console.error('Error fetching admin metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminMetrics();
  }, []);

  // Función para obtener el ícono de dirección de tendencia
  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <ArrowUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Función para obtener el color de dirección
  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing': return 'text-red-400';
      case 'decreasing': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Preparar datos para gráficas
  const groupPerformanceData = groupMetrics.reduce((acc: any[], metric) => {
    let group = acc.find(g => g.group_name === metric.group_name);
    if (!group) {
      group = { group_name: metric.group_name };
      acc.push(group);
    }
    group[metric.metric_name] = metric.avg_value;
    return acc;
  }, []);

  const surveyData = surveyParticipation.map(survey => ({
    name: survey.group_name,
    participation: survey.participation_rate,
    responses: survey.total_responses,
    surveys: survey.total_surveys
  }));

  const activityData = employeeActivity
    .slice(0, 10)
    .map(emp => ({
      name: emp.full_name,
      activity: emp.total_logs,
      role: emp.role_name
    }));

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando panel administrativo...</p>
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
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span>Panel Administrativo</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Gestión completa de métricas empresariales y bienestar organizacional
          </p>
        </div>
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-2"></div>
          Admin
        </Badge>
      </div>

      {/* Controls */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-300">Dashboard Administrativo Completo</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => window.location.reload()}
                className="relative overflow-hidden group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-indigo-500/50 transition-all"
              >
                <span className="relative z-10 flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 backdrop-blur-sm border border-white/10 p-1 rounded-xl">
          <TabsTrigger 
            value="overview" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500"
          >
            <Eye className="h-4 w-4" />
            <span>Resumen</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Tendencias</span>
          </TabsTrigger>
          <TabsTrigger 
            value="surveys" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500"
          >
            <ClipboardList className="h-4 w-4" />
            <span>Encuestas</span>
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500"
          >
            <Activity className="h-4 w-4" />
            <span>Actividad</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Groups */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Grupos Activos</CardTitle>
                <Users className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {new Set(groupMetrics.map(g => g.group_name)).size}
                </div>
                <p className="text-xs text-gray-400">Monitoreando actualmente</p>
              </CardContent>
            </Card>

            {/* Average Participation */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Participación Promedio</CardTitle>
                <PieChart className="h-5 w-5 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {surveyParticipation.length ? 
                    Math.round(surveyParticipation.reduce((a, b) => a + b.participation_rate, 0) / surveyParticipation.length) 
                    : 0}%
                </div>
                <p className="text-xs text-gray-400">En encuestas</p>
              </CardContent>
            </Card>

            {/* Active Employees */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Empleados Activos</CardTitle>
                <Activity className="h-5 w-5 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {employeeActivity.length}
                </div>
                <p className="text-xs text-gray-400">Últimos 7 días</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Overview Chart */}
          <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Calendar className="h-5 w-5 text-blue-400" />
                <span>Resumen Diario del Sistema</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Métricas clave de los últimos 14 días
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyOverview}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date_label" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="avg_wellbeing" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    name="Bienestar Promedio"
                    dot={{ fill: '#10B981', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_mental_state" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    name="Estado Mental"
                    dot={{ fill: '#3B82F6', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avg_stress" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    name="Estrés Promedio"
                    dot={{ fill: '#EF4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Enterprise Wellbeing */}
          <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Building2 className="h-5 w-5 text-purple-400" />
                <span>Bienestar por Empresa</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comparativa de métricas de bienestar organizacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enterpriseWellbeing}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="enterprise_name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wellbeing_avg" fill="#10B981" name="Bienestar General" />
                  <Bar dataKey="mental_state_avg" fill="#3B82F6" name="Estado Mental" />
                  <Bar dataKey="stress_avg" fill="#EF4444" name="Estrés" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trend Alerts Table */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <span>Alertas de Tendencia</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Cambios significativos en métricas por grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendAlerts.slice(0, 8).map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                      <div className="flex items-center space-x-3">
                        {getTrendIcon(alert.direction)}
                        <div>
                          <p className="text-sm font-medium text-white">{alert.group_name}</p>
                          <p className="text-xs text-gray-400 capitalize">{alert.metric_name.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${getTrendColor(alert.direction)}`}>
                        {alert.trend_slope.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Group Performance Radar */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Target className="h-5 w-5 text-red-400" />
                  <span>Rendimiento por Grupo</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Comparativa de métricas clave entre grupos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={groupPerformanceData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis 
                      dataKey="group_name" 
                      tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar 
                      name="Ritmo Cardíaco" 
                      dataKey="heart_rate" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.3} 
                    />
                    <Radar 
                      name="Estado Mental" 
                      dataKey="mental_state" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Participation Rate */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <PieChart className="h-5 w-5 text-green-400" />
                  <span>Tasa de Participación</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Porcentaje de participación por grupo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surveyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="participation" 
                      fill="url(#participationGradient)" 
                      radius={[4, 4, 0, 0]}
                      name="Tasa de Participación %"
                    />
                    <defs>
                      <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Survey Responses */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <ClipboardList className="h-5 w-5 text-blue-400" />
                  <span>Respuestas por Grupo</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Total de encuestas vs respuestas recibidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={surveyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="surveys" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                      name="Encuestas Enviadas"
                    />
                    <Bar 
                      dataKey="responses" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      name="Respuestas Recibidas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid gap-6">
            {/* Employee Activity Chart */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Activity className="h-5 w-5 text-orange-400" />
                  <span>Actividad de Empleados</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Top 10 empleados más activos (logs del sistema)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={activityData} 
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="activity" 
                      fill="url(#activityGradient)" 
                      radius={[0, 4, 4, 0]}
                    >
                      {activityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.role === 'Manager' ? '#8B5CF6' : '#3B82F6'} 
                        />
                      ))}
                    </Bar>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Activity Table */}
            <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Actividad Reciente</CardTitle>
                <CardDescription className="text-gray-400">
                  Detalle de actividad por empleado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeeActivity.slice(0, 5).map((employee, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{employee.full_name}</p>
                          <p className="text-xs text-gray-400">{employee.role_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">{employee.total_logs} acciones</p>
                        <p className="text-xs text-gray-400">
                          {new Date(employee.last_action).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}