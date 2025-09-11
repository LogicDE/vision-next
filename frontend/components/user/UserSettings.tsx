'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
  Edit,
  Camera,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
    theme: 'light',
    language: 'es',
    syncFrequency: '5',
    dataRetention: '30'
  });

  const saveSettings = () => {
    toast.success('Configuración guardada correctamente');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-sm text-gray-600">
          Personaliza tu experiencia y configuración de monitoreo
        </p>
      </div>

      {/* Profile Section */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Perfil de Usuario</span>
          </CardTitle>
          <CardDescription>
            Información personal y configuración de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={user?.name || ''} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email || ''} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-green-600" />
            <span>Notificaciones</span>
          </CardTitle>
          <CardDescription>
            Configura cuándo recibir alertas y notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Alertas de Ritmo Cardíaco</p>
                  <p className="text-sm text-gray-600">Notificar cambios críticos</p>
                </div>
              </div>
              <Switch 
                checked={notifications.heartRate}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, heartRate: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Estado Mental</p>
                  <p className="text-sm text-gray-600">Cambios significativos en bienestar</p>
                </div>
              </div>
              <Switch 
                checked={notifications.mentalState}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, mentalState: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Calidad del Sueño</p>
                  <p className="text-sm text-gray-600">Recordatorios y análisis nocturno</p>
                </div>
              </div>
              <Switch 
                checked={notifications.sleep}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sleep: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Recomendaciones IA</p>
                  <p className="text-sm text-gray-600">Sugerencias personalizadas diarias</p>
                </div>
              </div>
              <Switch 
                checked={notifications.aiRecommendations}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, aiRecommendations: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Thresholds */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-600" />
            <span>Umbrales de Salud</span>
          </CardTitle>
          <CardDescription>
            Define los rangos normales para tus métricas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="heartRateMin">Ritmo Cardíaco Mínimo (BPM)</Label>
              <Input
                id="heartRateMin"
                type="number"
                value={thresholds.heartRateMin}
                onChange={(e) => setThresholds(prev => ({ ...prev, heartRateMin: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="heartRateMax">Ritmo Cardíaco Máximo (BPM)</Label>
              <Input
                id="heartRateMax"
                type="number"
                value={thresholds.heartRateMax}
                onChange={(e) => setThresholds(prev => ({ ...prev, heartRateMax: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="mentalStateMin">Estado Mental Mínimo (%)</Label>
              <Input
                id="mentalStateMin"
                type="number"
                value={thresholds.mentalStateMin}
                onChange={(e) => setThresholds(prev => ({ ...prev, mentalStateMin: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="stressMax">Estrés Máximo (%)</Label>
              <Input
                id="stressMax"
                type="number"
                value={thresholds.stressMax}
                onChange={(e) => setThresholds(prev => ({ ...prev, stressMax: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Preferences */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-purple-600" />
            <span>Preferencias de la App</span>
          </CardTitle>
          <CardDescription>
            Personaliza tu experiencia de usuario (JSON API)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Tema de la aplicación</Label>
              <Select value={preferences.theme} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, theme: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Claro</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Oscuro</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Idioma</Label>
              <Select value={preferences.language} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, language: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>Español</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span>English</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Frecuencia de Sincronización (minutos)</Label>
              <Select value={preferences.syncFrequency} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, syncFrequency: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minuto</SelectItem>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Retención de Datos (días)</Label>
              <Select value={preferences.dataRetention} onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, dataRetention: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="90">90 días</SelectItem>
                  <SelectItem value="365">1 año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Privacidad y Seguridad</span>
          </CardTitle>
          <CardDescription>
            Configuración de datos y privacidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium">Encriptación de Datos</p>
                <p className="text-sm text-gray-600">Los datos se cifran automáticamente</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium">Conexión JSON API</p>
                <p className="text-sm text-gray-600">Comunicación segura con microservicios</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium">Compartir Datos Anónimos</p>
                <p className="text-sm text-gray-600">Para mejorar algoritmos de IA</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={saveSettings}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full max-w-sm"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración
        </Button>
      </div>
    </div>
  );
}