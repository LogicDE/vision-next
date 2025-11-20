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
  FileText,
  BarChart3,
  BrainCircuit,
  Thermometer,
  ActivitySquare
} from 'lucide-react';

// Type definitions actualizadas para coincidir con el backend
type StatusType = 'excellent' | 'good' | 'warning' | 'critical';
type BurnoutLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
type TrendType = 'increasing' | 'decreasing' | 'stable';

interface KeyMetric {
  name: string;
  value: string;
  status: StatusType;
  description: string;
}

interface BiometricAnalysis {
  avg_heart_rate: number;
  max_heart_rate: number;
  min_heart_rate: number;
  std_deviation: number;
  stress_peaks: number;
  data_points: number;
  time_range_hours: number;
}

interface Prediction {
  burnout_probability: number;
  risk_level: BurnoutLevel;
  confidence: number;
  last_updated: string;
  contributing_factors?: string[];
}

interface Intervention {
  id: string;
  name: string;
  frequency: string;
  duration: string;
  priority?: string;
  description?: string;
}

interface AlertItem {
  type?: string;
  severity?: string;
  message?: string;
  title?: string;
  recommendations?: string[];
  timestamp?: string;
  requires_action?: boolean;
}

interface BurnoutRiskAnalysis {
  prediction: Prediction;
  biometric_analysis: BiometricAnalysis | null;
  work_metrics: any[];
  alert: AlertItem | null;
  interventions: Intervention[];
  summary: string;
}

interface UserReport {
  userId: string;
  burnoutRisk: BurnoutRiskAnalysis;
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
      setSelectedUserId(user.id.toString());
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
      
      console.log('🔍 Fetching burnout prediction for user ID:', targetUserId);
      
      // ✅ CORREGIDO: Usar el endpoint correcto
      const response = await fetch(`http://localhost:8000/metrics/predict/${targetUserId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/xml',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 403) {
          throw new Error('No tienes permiso para acceder a este recurso.');
        }
        if (response.status === 404) {
          throw new Error('No se encontraron datos de predicción para este usuario.');
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Burnout prediction data received:', data);
      
      // ✅ CORREGIDO: Ajustar estructura de datos
      setReport(data);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error fetching burnout prediction:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      console.log('🚀 Initializing prediction fetch for user:', selectedUserId);
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
      low: 'text-green-400 bg-green-500/10 border-green-500/30',
      medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      high: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      critical: 'text-red-400 bg-red-500/10 border-red-500/30',
      unknown: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    };
    return colors[level] || colors.unknown;
  };

  const getRiskCategory = (level: BurnoutLevel): string => {
    const categories: Record<BurnoutLevel, string> = {
      low: 'Riesgo Bajo',
      medium: 'Riesgo Moderado',
      high: 'Riesgo Alto',
      critical: 'Riesgo Crítico',
      unknown: 'Estado Desconocido',
    };
    return categories[level] || categories.unknown;
  };

  const getRiskDescription = (level: BurnoutLevel): string => {
    const descriptions: Record<BurnoutLevel, string> = {
      low: 'Estado saludable. Continúa con tus buenos hábitos.',
      medium: 'Monitoreo recomendado. Considera implementar prácticas de bienestar.',
      high: 'Atención requerida. Se recomienda intervención profesional.',
      critical: 'Acción inmediata necesaria. Contacta a salud ocupacional.',
      unknown: 'No hay datos suficientes para evaluación.',
    };
    return descriptions[level] || descriptions.unknown;
  };

  // ✅ NUEVO: Generar métricas clave desde el análisis biométrico
  const generateKeyMetrics = (biometricAnalysis: BiometricAnalysis | null) => {
    if (!biometricAnalysis) return [];

    return [
      {
        name: 'Frecuencia Cardíaca Promedio',
        value: `${biometricAnalysis.avg_heart_rate} bpm`,
        status: biometricAnalysis.avg_heart_rate > 85 ? 'warning' : 
               biometricAnalysis.avg_heart_rate > 90 ? 'critical' : 'excellent',
        description: 'Frecuencia cardíaca en reposo promedio',
      },
      {
        name: 'Picos de Estrés',
        value: `${biometricAnalysis.stress_peaks}`,
        status: biometricAnalysis.stress_peaks > 10 ? 'critical' : 
               biometricAnalysis.stress_peaks > 5 ? 'warning' : 'good',
        description: 'Eventos con FC > 100 bpm en período monitoreado',
      },
      {
        name: 'Variabilidad Cardíaca',
        value: `${biometricAnalysis.std_deviation.toFixed(1)}`,
        status: biometricAnalysis.std_deviation < 10 ? 'warning' : 'good',
        description: 'Desviación estándar de la FC (mayor = mejor)',
      },
      {
        name: 'Puntos de Datos',
        value: `${biometricAnalysis.data_points}`,
        status: biometricAnalysis.data_points > 100 ? 'excellent' : 
               biometricAnalysis.data_points > 50 ? 'good' : 'warning',
        description: 'Muestras biométricas recolectadas',
      },
    ];
  };

  // ✅ NUEVO: Generar scores por categoría
  const generateCategoryScores = (prediction: Prediction, biometricAnalysis: BiometricAnalysis | null) => {
    const scores: Record<string, { score: number; status: StatusType; description: string }> = {};

    // Score de riesgo de burnout
    scores['Riesgo Burnout'] = {
      score: (1 - prediction.burnout_probability) * 100,
      status: prediction.risk_level === 'high' ? 'critical' : 
             prediction.risk_level === 'medium' ? 'warning' : 'excellent',
      description: 'Probabilidad inversa de burnout',
    };

    if (biometricAnalysis) {
      // Score de salud cardiovascular
      const cardioScore = Math.max(0, 100 - (biometricAnalysis.avg_heart_rate - 60));
      scores['Salud Cardiovascular'] = {
        score: Math.min(100, cardioScore),
        status: biometricAnalysis.avg_heart_rate > 85 ? 'warning' : 'excellent',
        description: 'Basado en frecuencia cardíaca en reposo',
      };

      // Score de manejo de estrés
      const stressScore = Math.max(0, 100 - (biometricAnalysis.stress_peaks * 5));
      scores['Manejo de Estrés'] = {
        score: Math.min(100, stressScore),
        status: biometricAnalysis.stress_peaks > 5 ? 'warning' : 'excellent',
        description: 'Basado en picos de frecuencia cardíaca',
      };
    }

    return scores;
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
          <p className="text-gray-400">Analizando datos biométricos...</p>
          <p className="text-sm text-gray-500">Calculando riesgo de burnout</p>
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
            <p className="font-semibold">Error en el análisis de salud:</p>
            <p className="mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchReport()}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors text-sm flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
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
          No se encontró información de análisis. Intenta actualizar la página.
        </AlertDescription>
      </Alert>
    );
  }

  const { burnoutRisk } = report;
  const { prediction, biometric_analysis, alert, interventions } = burnoutRisk;

  // ✅ GENERAR DATOS PARA EL FRONTEND
  const keyMetrics = generateKeyMetrics(biometric_analysis);
  const categoryScores = generateCategoryScores(prediction, biometric_analysis);
  const alerts = alert ? [alert] : [];

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
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
                />
              </div>
              
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-blue-400" />
            Análisis de Bienestar y Burnout
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
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-semibold text-gray-300">Estado de Burnout</h3>
              <div className="flex items-center gap-3">
                <Badge className={`${getRiskColor(prediction.risk_level)} text-lg px-4 py-1 border`}>
                  {getRiskCategory(prediction.risk_level)}
                </Badge>
                {prediction.risk_level === 'low' && <CheckCircle2 className="h-6 w-6 text-green-400" />}
                {prediction.risk_level === 'medium' && <AlertTriangle className="h-6 w-6 text-yellow-400" />}
                {prediction.risk_level === 'high' && <AlertTriangle className="h-6 w-6 text-red-400" />}
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.round(prediction.burnout_probability * 100)}%
              </p>
              <p className="text-sm text-gray-400">{getRiskDescription(prediction.risk_level)}</p>
              {prediction.confidence > 0 && (
                <p className="text-xs text-gray-500">
                  Confianza del análisis: {Math.round(prediction.confidence * 100)}%
                </p>
              )}
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
                    prediction.risk_level === 'high' ? 'text-red-500' :
                    prediction.risk_level === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  } transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Biométricas Clave */}
      {biometric_analysis && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ActivitySquare className="h-5 w-5 text-blue-400" />
              Métricas Biométricas en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyMetrics.map((metric, index) => (
                <Card key={index} className="bg-slate-800/50 border-white/10">
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
            
            {/* Información adicional del análisis */}
            {biometric_analysis && (
              <div className="mt-6 p-4 bg-slate-800/30 rounded-lg border border-white/5">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                  Resumen del Período Analizado
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Duración</p>
                    <p className="text-white font-medium">{biometric_analysis.time_range_hours.toFixed(1)} horas</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Muestras</p>
                    <p className="text-white font-medium">{biometric_analysis.data_points} puntos</p>
                  </div>
                  <div>
                    <p className="text-gray-400">FC Mínima</p>
                    <p className="text-white font-medium">{biometric_analysis.min_heart_rate} bpm</p>
                  </div>
                  <div>
                    <p className="text-gray-400">FC Máxima</p>
                    <p className="text-white font-medium">{biometric_analysis.max_heart_rate} bpm</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Scores por Categoría */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-blue-400" />
            Puntuaciones de Bienestar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(categoryScores).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">
                    {category}
                  </span>
                  <span className="text-lg font-bold text-white">{data.score.toFixed(0)}</span>
                </div>
                <Progress 
                  value={data.score} 
                  className={`h-2 bg-slate-800 ${
                    data.status === 'excellent' ? '[&>div]:bg-green-500' :
                    data.status === 'good' ? '[&>div]:bg-blue-500' :
                    data.status === 'warning' ? '[&>div]:bg-yellow-500' :
                    '[&>div]:bg-red-500'
                  }`}
                />
                <p className="text-xs text-gray-500">{data.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Factores Contribuyentes */}
      {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Factores Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prediction.contributing_factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    factor.includes('elevada') || factor.includes('excesivas') || factor.includes('alta') 
                      ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <p className="text-sm text-gray-300 flex-1">{factor}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <Card className="bg-slate-900/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas Activas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <Alert key={index} className="border-yellow-500/30 bg-yellow-500/10">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200 space-y-2">
                  <div>
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1">{alert.message}</p>
                  </div>
                  {alert.recommendations && alert.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-semibold">Recomendaciones:</p>
                      <ul className="mt-1 space-y-1 text-sm">
                        {alert.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Intervenciones Recomendadas */}
      {interventions.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Plan de Intervenciones ({interventions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interventions.map((intervention, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-white/5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">{intervention.name}</h4>
                    <p className="text-sm text-gray-400 mt-1">{intervention.description}</p>
                  </div>
                  {intervention.priority && (
                    <Badge className={
                      intervention.priority === 'URGENT' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      intervention.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                      'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }>
                      {intervention.priority}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{intervention.frequency}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{intervention.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resumen Ejecutivo */}
      {burnoutRisk.summary && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-blue-400" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                {burnoutRisk.summary}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Confianza */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Análisis generado con datos biométricos en tiempo real
            </p>
            <p className="text-xs text-gray-500">
              Sistema de monitoreo continuo • Alertas automáticas • Intervenciones personalizadas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}