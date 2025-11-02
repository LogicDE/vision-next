'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { fetchAPI } from '@/lib/apiClient';
import { 
  Heart, 
  Brain, 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Target,
  Zap,
  Calendar,
  Loader2,
  RefreshCw,
  User,
  Search,
  Shield,
  FileText
} from 'lucide-react';

// Type definitions
type StatusType = 'excellent' | 'good' | 'warning' | 'critical';
type BurnoutLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
type TrendType = 'increasing' | 'decreasing' | 'stable';

interface KeyMetric {
  name: string;
  value: string;
  status: StatusType;
  description: string;
}

interface CategoryScore {
  score: number;
  status: StatusType;
  description: string;
}

interface Trends {
  burnout_risk: TrendType;
  stress_levels: TrendType;
  sleep_quality: TrendType;
  workload: TrendType;
  note?: string;
}

interface Dashboard {
  overview: {
    burnout_level: BurnoutLevel;
    burnout_probability: number;
    health_status: string;
    risk_category: string;
  };
  key_metrics?: KeyMetric[];
  category_scores?: Record<string, CategoryScore>;
  trends?: Trends;
  recommendations?: string[];
}

interface Prediction {
  burnout_probability: number;
  burnout_prediction: number;
  burnout_level: BurnoutLevel;
  risk_category: string;
}

interface ActionStep {
  id: string;
  category: string;
  priority: string;
  timeframe: string;
  title: string;
  description: string;
  action_steps: string[];
  expected_benefit: string;
  duration: string;
}

interface ActionPlan {
  phase_1_immediate?: { interventions: ActionStep[] };
  phase_2_short_term?: { interventions: ActionStep[] };
  phase_3_medium_term?: { interventions: ActionStep[] };
  phase_4_long_term?: { interventions: ActionStep[] };
}

interface FollowUpRecommendations {
  frequency: string;
  duration: string;
  metrics_to_monitor: string[];
  reassessment_triggers: string[];
}

interface Interventions {
  user_id: number;
  generated_at: string;
  severity: string;
  total_interventions: number;
  action_plan?: ActionPlan;
  follow_up_recommendations?: FollowUpRecommendations;
}

interface AlertItem {
  message?: string;
  description?: string;
  severity?: string;
  type?: string;
}

interface UserReport {
  reportDate: string;
  userId: string;
  metrics: any[];
  prediction: Prediction;
  alerts: AlertItem[];
  dashboard: Dashboard;
  interventions: Interventions;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  status: string;
  role?: { id: number; name: string };
}

export default function HealthReport() {
  const { user } = useAuth();
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Admin features
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  // Load employees list for admin
  useEffect(() => {
    if (isAdmin) {
      loadEmployees();
    }
  }, [isAdmin]);

  // Set initial selected user
  useEffect(() => {
    if (user?.id && !selectedUserId) {
      setSelectedUserId(user.id);
    }
  }, [user?.id, selectedUserId]);

  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const data = await fetchAPI('/employees');
      setEmployees(data.filter((emp: Employee) => emp.status === 'active'));
    } catch (error: any) {
      console.error('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchReport = async (userId?: string) => {
    const targetUserId = userId || selectedUserId || user?.id;
    
    if (!targetUserId) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching report for user ID:', targetUserId);
      console.log('👤 Current user:', user);
      console.log('🔑 Is Admin:', isAdmin);
      
      const response = await fetch(`http://localhost:8000/reports/${targetUserId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 403) {
          const errorText = await response.text();
          console.error('❌ 403 Error details:', errorText);
          throw new Error('No tienes permiso para acceder a este recurso. Verifica que el usuario tenga permisos correctos.');
        }
        if (response.status === 404) {
          throw new Error('No se encontró el reporte para este usuario. Puede que aún no existan datos.');
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Report data received:', data);
      setReport(data);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      console.log('🚀 Initializing report fetch for user:', selectedUserId);
      fetchReport(selectedUserId);
    } else {
      console.log('⚠️ No user ID selected');
      setLoading(false);
    }
  }, [selectedUserId]);

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const getStatusColor = (status: StatusType): string => {
    const colors: Record<StatusType, string> = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      warning: 'bg-yellow-500',
      critical: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getRiskColor = (level: BurnoutLevel): string => {
    const colors: Record<BurnoutLevel, string> = {
      none: 'text-green-400 bg-green-500/10 border-green-500/30',
      low: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      critical: 'text-red-400 bg-red-500/10 border-red-500/30',
    };
    return colors[level] || colors.none;
  };

  const getTrendIcon = (trend: TrendType) => {
    if (trend === 'increasing') return <TrendingUp className="h-4 w-4 text-red-400" />;
    if (trend === 'decreasing') return <TrendingDown className="h-4 w-4 text-green-400" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const filteredEmployees = employees.filter((emp) =>
    `${emp.firstName} ${emp.lastName} ${emp.email} ${emp.username}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find(emp => emp.id.toString() === selectedUserId);

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-gray-400">Cargando reporte de salud...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-500/30 bg-red-500/10">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300 space-y-3">
          <div>
            <p className="font-semibold">Error al cargar el reporte:</p>
            <p className="mt-1">{error}</p>
          </div>
          {error.includes('permiso') && (
            <div className="text-sm text-gray-400 space-y-1">
              <p>Posibles causas:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Tu sesión ha expirado</li>
                <li>El usuario no tiene permisos suficientes</li>
                <li>El ID del usuario no coincide con el reporte solicitado</li>
              </ul>
            </div>
          )}
          {error.includes('encontró') && (
            <div className="text-sm text-gray-400">
              <p>Es posible que aún no existan datos de salud para este usuario.</p>
              <p className="mt-1">Los reportes se generan cuando hay métricas disponibles.</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => fetchReport()}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors text-sm flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-300 transition-colors text-sm"
            >
              Volver al login
            </button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert className="border-yellow-500/30 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-yellow-300">
          No se encontró información del reporte. Intenta actualizar la página.
        </AlertDescription>
      </Alert>
    );
  }

  const { dashboard, prediction, interventions, alerts } = report;

  return (
    <div className="space-y-6">
      {/* Admin User Selector */}
      {isAdmin && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-purple-400" />
              Seleccionar Usuario (Vista de Administrador)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>
              
              {/* User Select */}
              <Select value={selectedUserId} onValueChange={handleUserSelect}>
                <SelectTrigger className="w-full sm:w-80 bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar usuario">
                    {selectedEmployee && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{selectedEmployee.firstName} {selectedEmployee.lastName}</span>
                        <Badge variant="outline" className="text-xs">
                          @{selectedEmployee.username}
                        </Badge>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 max-h-80">
                  {loadingEmployees ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      No se encontraron usuarios
                    </div>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{emp.firstName} {emp.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">@{emp.username}</span>
                            {emp.role && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                {emp.role.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">
                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                      </h4>
                      <p className="text-sm text-gray-400">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedEmployee.role && (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {selectedEmployee.role.name}
                      </Badge>
                    )}
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      {selectedEmployee.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Header con refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Reporte de Bienestar
            {isAdmin && selectedEmployee && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Viendo: {selectedEmployee.firstName} {selectedEmployee.lastName}
              </Badge>
            )}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Última actualización: {lastUpdate.toLocaleString('es-MX', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
        <button
          onClick={() => fetchReport()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Nivel de Burnout - Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-gray-300">Estado General</h3>
              <div className="flex items-center gap-3">
                <Badge className={`${getRiskColor(prediction.burnout_level)} text-lg px-4 py-1 border`}>
                  {prediction.risk_category}
                </Badge>
                {prediction.burnout_level === 'none' && (
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                )}
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(prediction.burnout_probability * 100)}%
              </p>
              <p className="text-sm text-gray-400">Probabilidad de burnout</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - prediction.burnout_probability)}`}
                  className={`${
                    prediction.burnout_probability > 0.7 ? 'text-red-500' :
                    prediction.burnout_probability > 0.4 ? 'text-yellow-500' :
                    'text-green-500'
                  } transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Clave */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboard?.key_metrics?.map((metric: KeyMetric, index: number) => (
          <Card key={index} className="bg-slate-900/50 border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">{metric.name}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(metric.status)} animate-pulse`}></div>
              </div>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scores por Categoría */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-blue-400" />
            Puntuaciones por Categoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboard?.category_scores && Object.entries(dashboard.category_scores).map(([key, data]) => {
              const categoryData = data as CategoryScore;
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {categoryData.description}
                    </span>
                    <span className="text-lg font-bold text-white">{categoryData.score.toFixed(1)}</span>
                  </div>
                  <Progress 
                    value={categoryData.score} 
                    className="h-2 bg-slate-800"
                  />
                  <p className="text-xs text-gray-500">{key}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tendencias */}
      {dashboard?.trends && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5 text-purple-400" />
              Tendencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboard.trends)
                .filter(([key]) => key !== 'note')
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                    {getTrendIcon(value as TrendType)}
                    <div>
                      <p className="text-xs text-gray-400 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm font-medium text-white capitalize">{String(value)}</p>
                    </div>
                  </div>
                ))}
            </div>
            {dashboard.trends.note && (
              <p className="text-xs text-gray-500 mt-4 italic">{dashboard.trends.note}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {alerts && alerts.length > 0 && (
        <Card className="bg-slate-900/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas Activas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert: AlertItem, index: number) => (
              <Alert key={index} className="border-yellow-500/30 bg-yellow-500/10">
                <AlertDescription className="text-yellow-200">
                  {alert.message || alert.description}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Intervenciones Recomendadas */}
      {interventions?.action_plan && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Plan de Acción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fase Corto Plazo */}
            {interventions.action_plan.phase_2_short_term?.interventions && 
             interventions.action_plan.phase_2_short_term.interventions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <h4 className="font-semibold text-white">Acciones a Corto Plazo (1-2 semanas)</h4>
                </div>
                {interventions.action_plan.phase_2_short_term.interventions.map((intervention: ActionStep, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-white">{intervention.title}</h5>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {intervention.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{intervention.description}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-300">Pasos a seguir:</p>
                      <ul className="space-y-1 text-xs text-gray-400">
                        {intervention.action_steps.map((step: string, stepIdx: number) => (
                          <li key={stepIdx} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-xs text-green-400">
                        <strong>Beneficio esperado:</strong> {intervention.expected_benefit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recomendaciones Generales */}
            {dashboard?.recommendations && dashboard.recommendations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Recomendaciones Generales
                </h4>
                <ul className="space-y-2">
                  {dashboard.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-green-400 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seguimiento */}
      {interventions?.follow_up_recommendations && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5 text-purple-400" />
              Plan de Seguimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-gray-400">Frecuencia</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {interventions.follow_up_recommendations.frequency}
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-gray-400">Duración</p>
                <p className="text-lg font-semibold text-white capitalize">
                  {interventions.follow_up_recommendations.duration}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-300 mb-2">Métricas a monitorear:</p>
              <div className="flex flex-wrap gap-2">
                {interventions.follow_up_recommendations.metrics_to_monitor.map((metric: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-slate-800 text-gray-300 border-white/10">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}