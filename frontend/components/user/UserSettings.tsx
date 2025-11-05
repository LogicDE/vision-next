'use client';

import { useState, useCallback } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, Bell, Heart, Brain, Smartphone, Settings, Save, Camera, Moon, Sun, Globe, Activity, Target, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function UserSettings() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    heartRate: true,
    mentalState: true,
    sleep: false,
    activity: true,
    aiRecommendations: true
  });

  const [thresholds, setThresholds] = useState({
    heartRateMin: '60',
    heartRateMax: '100',
    mentalStateMin: '70',
    stressMax: '80'
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'es',
    syncFrequency: '5',
    dataRetention: '30'
  });

  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = useCallback(async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications, thresholds, preferences })
      });
      toast.success('Configuración guardada correctamente');
    } catch (err) {
      toast.error('Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  }, [notifications, thresholds, preferences, user]);

  if (!user) return <p className="text-white">Cargando usuario...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Settings className="h-6 w-6 text-blue-400" />
            <span>Configuración de Usuario</span>
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Personaliza tu experiencia y configuración de monitoreo
          </p>
        </div>
        <Button 
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

      {/* Profile Section */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <span>Perfil de Usuario</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Información personal y configuración de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-white/20">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-slate-900"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Nombre</Label>
                <Input 
                  id="name" 
                  value={user.name} 
                  className="border-white/10 bg-slate-800/50 text-white placeholder-gray-400"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={user.email}
                  className="border-white/10 bg-slate-800/50 text-white placeholder-gray-400"
                  readOnly
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aquí irían las secciones de Notificaciones, Umbrales, Preferencias y Seguridad,
          usando los mismos states y funciones que en tu versión original, ya integradas
          con el `user` del contexto. Todas las acciones siguen siendo locales al usuario */}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Activity className="h-4 w-4 mr-2 text-blue-400" />
          Exportar Datos
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <Target className="h-4 w-4 mr-2 text-green-400" />
          Restablecer Configuración
        </Button>
        <Button variant="outline" className="border-white/10 bg-slate-800/50 hover:bg-slate-700 text-white">
          <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
          Eliminar Cuenta
        </Button>
      </div>
    </div>
  );
}
