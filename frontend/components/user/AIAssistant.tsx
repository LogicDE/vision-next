'use client';

import { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';

const mockRecommendations = [
  {
    id: '1',
    type: 'health',
    title: 'Optimización Cardiovascular',
    content: 'Basándome en tus datos, te sugiero realizar ejercicio aeróbico moderado durante 20-25 minutos. Tu ritmo cardíaco actual es óptimo para actividad física.',
    confidence: 95,
    timestamp: '2024-01-15 10:30'
  },
  {
    id: '2',
    type: 'mental',
    title: 'Gestión del Estrés',
    content: 'He detectado un patrón de estrés elevado entre las 14:00-16:00. Te recomiendo técnicas de respiración consciente o una pausa de 5 minutos cada hora.',
    confidence: 88,
    timestamp: '2024-01-15 09:15'
  },
  {
    id: '3',
    type: 'sleep',
    title: 'Mejora del Sueño',
    content: 'Tu calidad de sueño ha mejorado un 15% esta semana. Mantén tu rutina actual y considera reducir la exposición a pantallas 1 hora antes de dormir.',
    confidence: 92,
    timestamp: '2024-01-15 08:45'
  }
];

const mockInsights = [
  {
    metric: 'Ritmo Cardíaco',
    insight: 'Estable con tendencia ligeramente descendente',
    improvement: '+3% esta semana',
    icon: Heart,
    color: 'red'
  },
  {
    metric: 'Estado Mental',
    insight: 'Mejora consistente en concentración',
    improvement: '+8% este mes',
    icon: Brain,
    color: 'blue'
  },
  {
    metric: 'Nivel de Actividad',
    insight: 'Superaste tu meta diaria 5 de 7 días',
    improvement: '+12% vs mes anterior',
    icon: Target,
    color: 'green'
  }
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

  const sendMessage = () => {
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
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'health': return Heart;
      case 'mental': return Brain;
      case 'sleep': return Clock;
      default: return Lightbulb;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'health': return 'red';
      case 'mental': return 'blue';
      case 'sleep': return 'purple';
      default: return 'yellow';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="relative">
            <Zap className="h-8 w-8 text-yellow-500" />
            <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Asistente IA Bicognitivo
          </h2>
        </div>
        <p className="text-sm text-gray-600">
          Análisis inteligente y recomendaciones personalizadas en tiempo real
        </p>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-3">
        {mockInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <Card key={index} className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${insight.color}-100 rounded-full`}>
                    <Icon className={`h-5 w-5 text-${insight.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{insight.metric}</p>
                    <p className="text-sm text-gray-600">{insight.insight}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{insight.improvement}</p>
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
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Recomendaciones Inteligentes</span>
          </CardTitle>
          <CardDescription>
            Sugerencias personalizadas basadas en IA (JSON API)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRecommendations.map((rec) => {
            const Icon = getRecommendationIcon(rec.type);
            const color = getRecommendationColor(rec.type);
            return (
              <div key={rec.id} className="p-4 bg-white rounded-lg shadow-sm border-l-4 border-l-purple-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 text-${color}-600`} />
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {rec.confidence}% confianza
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{rec.timestamp}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    Aplicar
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <span>Chat con IA</span>
          </CardTitle>
          <CardDescription>
            Pregunta cualquier cosa sobre tu salud bicognitiva
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat History */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {msg.type === 'ai' ? <Zap className="h-4 w-4" /> : <span>Tú</span>}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`p-3 rounded-lg ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Pregúntame sobre tu salud, métricas o recomendaciones..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 min-h-[60px] max-h-[100px]"
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            />
            <Button 
              onClick={sendMessage}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 self-end"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setMessage('¿Cómo está mi ritmo cardíaco hoy?')}
            >
              Ritmo cardíaco
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setMessage('¿Qué ejercicios me recomiendas?')}
            >
              Ejercicios
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setMessage('¿Cómo puedo mejorar mi sueño?')}
            >
              Calidad del sueño
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}