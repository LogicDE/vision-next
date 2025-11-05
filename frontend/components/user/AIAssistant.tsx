'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Heart, Brain, Clock, Target, RefreshCw } from 'lucide-react';

// Tipos de datos
interface Recommendation {
  id: string;
  type: 'health' | 'mental' | 'sleep' | 'other';
  title: string;
  content: string;
  confidence: number;
  timestamp: string;
  gradient: string;
  icon: typeof Heart;
}

interface Metric {
  insight: string;
  improvement: string;
}

interface Insight {
  metric: string;
  insight: string;
  improvement: string;
  icon: typeof Heart | typeof Brain | typeof Clock | typeof Target;
  gradient: string;
}

interface BurnoutAnalysis {
  interventions?: any; // Puede ser array, objeto o null
  summary?: {
    metrics?: Record<string, Metric>;
  };
}

export function AIAssistant({ userId }: { userId: number }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8001/api/burnout/analyze/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const data: BurnoutAnalysis = await res.json();

      console.log('🔥 Datos recibidos del backend:', data);

      // Asegurar que interventions sea un array
      let interventionsArray: any[] = [];
      if (Array.isArray(data.interventions)) {
        interventionsArray = data.interventions;
      } else if (data.interventions && typeof data.interventions === 'object') {
        interventionsArray = [data.interventions];
      }

      const recs: Recommendation[] = interventionsArray.map((item, index) => ({
        id: index.toString(),
        type: item.type,
        title: item.title,
        content: item.description,
        confidence: item.confidence ?? 90,
        timestamp: item.timestamp ?? 'Reciente',
        gradient: item.gradient ?? 'from-blue-500 to-cyan-500',
        icon:
          item.type === 'health'
            ? Heart
            : item.type === 'mental'
            ? Brain
            : item.type === 'sleep'
            ? Clock
            : Target,
      }));
      setRecommendations(recs);

      const metrics = data.summary?.metrics || {};
      const ins: Insight[] = Object.entries(metrics).map(([metric, value]) => ({
        metric,
        insight: value.insight,
        improvement: value.improvement,
        icon:
          metric.toLowerCase().includes('cardiaco')
            ? Heart
            : metric.toLowerCase().includes('mental')
            ? Brain
            : metric.toLowerCase().includes('actividad')
            ? Target
            : Clock,
        gradient: 'from-purple-500 to-pink-500',
      }));
      setInsights(ins);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          <span>Recomendaciones IA</span>
        </h2>
        <Button onClick={fetchRecommendations} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4">
        {insights.length === 0 && <p className="text-gray-400">No hay insights disponibles.</p>}
        {insights.map((ins, idx) => {
          const Icon = ins.icon;
          return (
            <Card key={idx} className="bg-slate-900/50 border-white/10">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ins.gradient} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{ins.metric}</p>
                    <p className="text-sm text-gray-400">{ins.insight}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-400">{ins.improvement}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="grid gap-4">
        {recommendations.length === 0 && <p className="text-gray-400">No hay recomendaciones disponibles.</p>}
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <Card key={rec.id} className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rec.gradient} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span>{rec.title}</span>
                </CardTitle>
                <CardDescription className="text-gray-400">{rec.content}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                  {rec.confidence}% confianza
                </Badge>
                <span className="text-xs text-gray-400">{rec.timestamp}</span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
