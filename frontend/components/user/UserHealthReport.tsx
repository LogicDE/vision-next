'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
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
  Moon,
  Users,
  Calendar,
  Loader2,
  RefreshCw,
  BrainCircuit,
  ActivitySquare,
  BarChart3,
  FileText
} from 'lucide-react';

// Type definitions actualizadas para coincidir con el backend
type StatusType = 'excellent' | 'good' | 'warning' | 'critical';
type BurnoutLevel = 'low' | 'medium' | 'high' | 'critical' | 'unknown';
type TrendType = 'increasing' | 'decreasing' | 'stable';

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

export function UserHealthReport() {
  const { user } = useAuth();
  const [report, setReport] = useState<UserReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchReport = async () => {
    if (!user?.id) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching burnout prediction for user:', user.id);
      
      // ✅ ENDPOINT CORREGIDO
      const response = await fetch(`http://localhost:8000/metrics/predict/${user.id}`, {
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
          throw new Error('No tienes permiso para acceder a este recurso.');
        }
        if (response.status === 404) {
          throw new Error('No se encontraron datos de predicción. Es posible que aún no existan datos biométricos.');
        }
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Burnout prediction data received:', data);
      
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
    if (user?.id) {
      console.log('🚀 Initializing prediction fetch for user:', user.id);
      fetchReport();
      // Auto-refresh cada 5 minutos
      const interval = setInterval(fetchReport, 300000);
      return () => clearInterval(interval);
    } else {
      console.log('⚠️ No user ID available');
      setLoading(false);
    }
  }, [user?.id]);

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

  // ✅ GENERAR MÉTRICAS CLAVE DESDE EL ANÁLISIS BIOMÉTRICO
  const generateKeyMetrics = (biometricAnalysis: BiometricAnalysis | null) => {
    if (!biometricAnalysis) return [];

    return [
      {
        name: 'Frecuencia Cardíaca',
        value: `${biometricAnalysis.avg_heart_rate} bpm`,
        status: biometricAnalysis.avg_heart_rate > 85 ? 'warning' : 
               biometricAnalysis.avg_heart_rate > 90 ? 'critical' : 'excellent',
        description: 'Promedio en reposo',
      },
      {
        name: 'Picos de Estrés',
        value: `${biometricAnalysis.stress_peaks}`,
        status: biometricAnalysis.stress_peaks > 10 ? 'critical' : 
               biometricAnalysis.stress_peaks > 5 ? 'warning' : 'good',
        description: 'Eventos con FC > 100 bpm',
      },
      {
        name: 'Variabilidad Cardíaca',
        value: `${biometricAnalysis.std_deviation.toFixed(1)}`,
        status: biometricAnalysis.std_deviation < 10 ? 'warning' : 'good',
        description: 'Indicador de recuperación',
      },
      {
        name: 'Tiempo Monitoreado',
        value: `${biometricAnalysis.time_range_hours.toFixed(1)}h`,
        status: biometricAnalysis.time_range_hours > 2 ? 'excellent' : 'good',
        description: 'Período de análisis',
      },
    ];
  };

  // ✅ GENERAR SCORES POR CATEGORÍA
  const generateCategoryScores = (prediction: Prediction, biometricAnalysis: BiometricAnalysis | null) => {
    const scores: Record<string, { score: number; status: StatusType; description: string }> = {};

    // Score de riesgo de burnout
    scores['Salud Mental'] = {
      score: (1 - prediction.burnout_probability) * 100,
      status: prediction.risk_level === 'high' ? 'critical' : 
             prediction.risk_level === 'medium' ? 'warning' : 'excellent',
      description: 'Basado en riesgo de burnout',
    };

    if (biometricAnalysis) {
      // Score de salud cardiovascular
      const cardioScore = Math.max(0, 100 - (biometricAnalysis.avg_heart_rate - 60));
      scores['Salud Física'] = {
        score: Math.min(100, cardioScore),
        status: biometricAnalysis.avg_heart_rate > 85 ? 'warning' : 'excellent',
        description: 'Basado en frecuencia cardíaca',
      };

      // Score de manejo de estrés
      const stressScore = Math.max(0, 100 - (biometricAnalysis.stress_peaks * 5));
      scores['Manejo de Estrés'] = {
        score: Math.min(100, stressScore),
        status: biometricAnalysis.stress_peaks > 5 ? 'warning' : 'excellent',
        description: 'Basado en picos de estrés',
      };
    }

    return scores;
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto" />
          <p className="text-gray-400">Analizando tus datos biométricos...</p>
          <p className="text-sm text-gray-500">Calculando tu riesgo de burnout</p>
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
              onClick={fetchReport}
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
      {/* Header personalizado para usuario */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-blue-400" />
            Mi Análisis de Bienestar
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Última actualización: {lastUpdate.toLocaleString('es-MX', { 
              dateStyle: 'medium', 
              timeStyle: 'short' 
            })}
          </p>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Nivel de Burnout - Hero Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-blue-900/20 border-white/10">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-semibold text-gray-300">Mi Estado de Burnout</h3>
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

      {/* Mis Métricas Biométricas */}
      {biometric_analysis && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ActivitySquare className="h-5 w-5 text-blue-400" />
              Mis Métricas en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyMetrics.map((metric, index) => (
                <Card key={index} className="bg-slate-800/50 border-white/10 hover:border-blue-500/30 transition-colors">
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
                  Resumen de Mi Actividad
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Duración analizada</p>
                    <p className="text-white font-medium">{biometric_analysis.time_range_hours.toFixed(1)} horas</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Muestras recogidas</p>
                    <p className="text-white font-medium">{biometric_analysis.data_points} puntos</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mi FC mínima</p>
                    <p className="text-white font-medium">{biometric_analysis.min_heart_rate} bpm</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Mi FC máxima</p>
                    <p className="text-white font-medium">{biometric_analysis.max_heart_rate} bpm</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mis Puntuaciones de Bienestar */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-blue-400" />
            Mis Puntuaciones de Bienestar
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
                  <span className="text-lg font-bold text-white">{data.score.toFixed(0)}/100</span>
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

      {/* Factores que Influyen en Mi Salud */}
      {prediction.contributing_factors && prediction.contributing_factors.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Factores que Influyen en Mi Salud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {prediction.contributing_factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors">
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

      {/* Mis Alertas de Salud */}
      {alerts.length > 0 && (
        <Card className="bg-slate-900/50 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Mis Alertas de Salud ({alerts.length})
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
                      <p className="text-sm font-semibold">Recomendaciones para ti:</p>
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

      {/* Mi Plan de Acción Personalizado */}
      {interventions.length > 0 && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-yellow-400" />
              Mi Plan de Acción Personalizado ({interventions.length} recomendaciones)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {interventions.map((intervention, index) => (
              <div key={index} className="p-4 bg-slate-800/50 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
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
            
            {/* Consejo adicional */}
            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-300">Consejo de Bienestar</p>
                  <p className="text-sm text-blue-200 mt-1">
                    Pequeños cambios consistentes tienen gran impacto. Elige 1-2 recomendaciones para empezar y construye desde ahí.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mi Resumen de Salud */}
      {burnoutRisk.summary && (
        <Card className="bg-slate-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-blue-400" />
              Mi Resumen de Salud
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                {burnoutRisk.summary}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del Sistema */}
      <Card className="bg-slate-900/50 border-white/10">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              💡 Tu análisis se genera automáticamente con datos biométricos en tiempo real
            </p>
            <p className="text-xs text-gray-500">
              Monitoreo continuo • Alertas automáticas • Recomendaciones personalizadas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}