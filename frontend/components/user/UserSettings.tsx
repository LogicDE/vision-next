'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Heart, 
  Brain,
  Settings,
  Save,
  Camera,
  Moon,
  Sun,
  Globe,
  RefreshCw,
  Activity,
  Target,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Mock user data - en una app real esto vendría del contexto de autenticación
const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: '',
  role: 'Usuario Premium'
};

export function UserSettings() {
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
    setIsSaving(true);
    // Simular guardado asíncrono
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configuración guardada correctamente');
    setIsSaving(false);
  }, []);

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
                <AvatarImage src={mockUser.avatar} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {mockUser.name.charAt(0)}
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
                  value={mockUser.name} 
                  className="border-white/10 bg-slate-800/50 text-white placeholder-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={mockUser.email}
                  className="border-white/10 bg-slate-800/50 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-green-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <span>Notificaciones</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configura cuándo recibir alertas y notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Alertas de Ritmo Cardíaco</p>
                  <p className="text-sm text-gray-400">Notificar cambios críticos</p>
                </div>
              </div>
              <Switch 
                checked={notifications.heartRate}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, heartRate: checked }))
                }
                className="data-[state=checked]:bg-red-500"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Estado Mental</p>
                  <p className="text-sm text-gray-400">Cambios significativos en bienestar</p>
                </div>
              </div>
              <Switch 
                checked={notifications.mentalState}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, mentalState: checked }))
                }
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Moon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Calidad del Sueño</p>
                  <p className="text-sm text-gray-400">Recordatorios y análisis nocturno</p>
                </div>
              </div>
              <Switch 
                checked={notifications.sleep}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sleep: checked }))
                }
                className="data-[state=checked]:bg-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Recomendaciones IA</p>
                  <p className="text-sm text-gray-400">Sugerencias personalizadas diarias</p>
                </div>
              </div>
              <Switch 
                checked={notifications.aiRecommendations}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, aiRecommendations: checked }))
                }
                className="data-[state=checked]:bg-yellow-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Thresholds */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-red-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span>Umbrales de Salud</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Define los rangos normales para tus métricas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heartRateMin" className="text-white">Ritmo Cardíaco Mínimo (BPM)</Label>
              <Input
                id="heartRateMin"
                type="number"
                value={thresholds.heartRateMin}
                onChange={(e) => setThresholds(prev => ({ ...prev, heartRateMin: e.target.value }))}
                className="border-white/10 bg-slate-800/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heartRateMax" className="text-white">Ritmo Cardíaco Máximo (BPM)</Label>
              <Input
                id="heartRateMax"
                type="number"
                value={thresholds.heartRateMax}
                onChange={(e) => setThresholds(prev => ({ ...prev, heartRateMax: e.target.value }))}
                className="border-white/10 bg-slate-800/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mentalStateMin" className="text-white">Estado Mental Mínimo (%)</Label>
              <Input
                id="mentalStateMin"
                type="number"
                value={thresholds.mentalStateMin}
                onChange={(e) => setThresholds(prev => ({ ...prev, mentalStateMin: e.target.value }))}
                className="border-white/10 bg-slate-800/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stressMax" className="text-white">Estrés Máximo (%)</Label>
              <Input
                id="stressMax"
                type="number"
                value={thresholds.stressMax}
                onChange={(e) => setThresholds(prev => ({ ...prev, stressMax: e.target.value }))}
                className="border-white/10 bg-slate-800/50 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="relative overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm group hover:border-purple-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <span>Preferencias de la App</span>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Personaliza tu experiencia de usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Tema de la aplicación</Label>
              <Select value={preferences.theme} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, theme: value }))
              }>
                <SelectTrigger className="border-white/10 bg-slate-800/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="light" className="focus:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark" className="focus:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Oscuro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Idioma</Label>
              <Select value={preferences.language} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger className="border-white/10 bg-slate-800/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="es" className="focus:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Español</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en" className="focus:bg-slate-700">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>English</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Frecuencia de Sincronización</Label>
              <Select value={preferences.syncFrequency} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, syncFrequency: value }))
              }>
                <SelectTrigger className="border-white/10 bg-slate-800/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="1" className="focus:bg-slate-700">1 minuto</SelectItem>
                  <SelectItem value="5" className="focus:bg-slate-700">5 minutos</SelectItem>
                  <SelectItem value="10" className="focus:bg-slate-700">10 minutos</SelectItem>
                  <SelectItem value="30" className="focus:bg-slate-700">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Retención de Datos</Label>
              <Select value={preferences.dataRetention} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, dataRetention: value }))
              }>
                <SelectTrigger className="border-white/10 bg-slate-800/50 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10 text-white">
                  <SelectItem value="7" className="focus:bg-slate-700">7 días</SelectItem>
                  <SelectItem value="30" className="focus:bg-slate-700">30 días</SelectItem>
                  <SelectItem value="90" className="focus:bg-slate-700">90 días</SelectItem>
                  <SelectItem value="365" className="focus:bg-slate-700">1 año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border-blue-500/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span>Privacidad y Seguridad</span>
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configuración de datos y privacidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:border-blue-500/30 transition-all">
              <div>
                <p className="font-medium text-white">Encriptación de Datos</p>
                <p className="text-sm text-gray-300">Los datos se cifran automáticamente</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-all">
              <div>
                <p className="font-medium text-white">Conexión JSON API</p>
                <p className="text-sm text-gray-300">Comunicación segura con microservicios</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-white/10 hover:border-white/20 transition-all">
              <div>
                <p className="font-medium text-white">Compartir Datos Anónimos</p>
                <p className="text-sm text-gray-300">Para mejorar algoritmos de IA</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

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