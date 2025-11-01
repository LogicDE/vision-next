'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, 
  MessageCircle, 
  Send, 
  Lightbulb, 
  Heart, 
  Brain, 
  Target,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

// Datos estáticos
const mockRecommendations = [
  {
    id: '1',
    type: 'health',
    title: 'Optimización Cardiovascular',
    content: 'Basándome en tus datos, te sugiero realizar ejercicio aeróbico moderado durante 20-25 minutos. Tu ritmo cardíaco actual es óptimo para actividad física.',
    confidence: 95,
    timestamp: 'Hace 5 minutos',
    gradient: 'from-red-500 to-pink-500',
    icon: Heart
  },
  {
    id: '2',
    type: 'mental',
    title: 'Gestión del Estrés',
    content: 'He detectado un patrón de estrés elevado entre las 14:00-16:00. Te recomiendo técnicas de respiración consciente o una pausa de 5 minutos cada hora.',
    confidence: 88,
    timestamp: 'Hace 15 minutos',
    gradient: 'from-blue-500 to-cyan-500',
    icon: Brain
  },
  {
    id: '3',
    type: 'sleep',
    title: 'Mejora del Sueño',
    content: 'Tu calidad de sueño ha mejorado un 15% esta semana. Mantén tu rutina actual y considera reducir la exposición a pantallas 1 hora antes de dormir.',
    confidence: 92,
    timestamp: 'Hace 25 minutos',
    gradient: 'from-purple-500 to-violet-500',
    icon: Clock
  }
];

const mockInsights = [
  {
    metric: 'Ritmo Cardíaco',
    insight: 'Estable con tendencia ligeramente descendente',
    improvement: '+3% esta semana',
    icon: Heart,
    gradient: 'from-red-500 to-pink-500'
  },
  {
    metric: 'Estado Mental',
    insight: 'Mejora consistente en concentración',
    improvement: '+8% este mes',
    icon: Brain,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    metric: 'Nivel de Actividad',
    insight: 'Superaste tu meta diaria 5 de 7 días',
    improvement: '+12% vs mes anterior',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500'
  }
];

const quickQuestions = [
  { text: '¿Cómo está mi ritmo cardíaco hoy?', icon: Heart },
  { text: '¿Qué ejercicios me recomiendas?', icon: Target },
  { text: '¿Cómo puedo mejorar mi sueño?', icon: Clock }
];

export function AIAssistant() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'ai',
      content: '¡Hola! Soy tu asistente de IA bicognitiva. Estoy aquí para ayudarte a optimizar tu salud mental y física. ¿En qué puedo asistirte hoy?',
      timestamp: new Date(Date.now() - 300000)
    }
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
  }, []);

  const sendMessage = useCallback(() => {
    if (!message.trim()) return;

    const newMessage = {
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    // Simular respuesta de IA
    const aiResponse = {
      type: 'ai',
      content: 'Basándome en tus datos bicognitivos actuales, puedo ver que tu ritmo cardíaco está en 72 BPM y tu estado mental al 85%. Te sugiero mantener tu nivel de actividad actual y considerar técnicas de relajación si sientes estrés.',
      timestamp: new Date(Date.now() + 1000)
    };

    setChatHistory(prev => [...prev, newMessage, aiResponse]);
    setMessage('');
  }, [message]);

  const handleQuickQuestion = useCallback((text: string) => {
    setMessage(text);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-yellow-400 animate-pulse" />
              <Sparkles className="h-3 w-3 text-purple-400 absolute -top-1 -right-1" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Asistente IA Bicognitivo
            </span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Análisis inteligente y recomendaciones personalizadas en tiempo real
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

      {/* Quick Insights */}
      <div className="grid gap-4">
        {mockInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card 
              key={index}
              className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-white/20 transition-all duration-200"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${insight.gradient} rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-all`}></div>
              <CardContent className="p-4 relative">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${insight.gradient} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{insight.metric}</p>
                    <p className="text-sm text-gray-400 truncate">{insight.insight}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-green-400">{insight.improvement}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Mejorando</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <span>Recomendaciones Inteligentes</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Sugerencias personalizadas basadas en IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {mockRecommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div 
                key={rec.id} 
                className="relative p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${rec.gradient} rounded-full blur-xl opacity-10 group-hover:opacity-20 transition-all`}></div>
                <div className="flex items-start justify-between mb-2 relative">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${rec.gradient} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-semibold text-white">{rec.title}</h4>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    {rec.confidence}% confianza
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-3 relative">{rec.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 relative">
                  <span>{rec.timestamp}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs border-white/10 bg-slate-700/50 hover:bg-slate-600/50 text-white">
                    Aplicar
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}