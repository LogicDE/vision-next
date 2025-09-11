'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Brain,
  Shield,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockData = {
  dailyUsers: [
    { name: 'Lun', users: 1200, sessions: 3400 },
    { name: 'Mar', users: 1400, sessions: 3800 },
    { name: 'Mié', users: 1600, sessions: 4200 },
    { name: 'Jue', users: 1800, sessions: 4800 },
    { name: 'Vie', users: 2000, sessions: 5200 },
    { name: 'Sáb', users: 1500, sessions: 3900 },
    { name: 'Dom', users: 1300, sessions: 3500 },
  ],
  healthMetrics: [
    { name: 'Ene', heartRate: 72, mentalState: 85, stress: 25 },
    { name: 'Feb', heartRate: 74, mentalState: 88, stress: 22 },
    { name: 'Mar', heartRate: 71, mentalState: 82, stress: 28 },
    { name: 'Abr', heartRate: 73, mentalState: 90, stress: 20 },
    { name: 'May', heartRate: 70, mentalState: 87, stress: 23 },
    { name: 'Jun', heartRate: 75, mentalState: 85, stress: 26 },
  ],
  organizationData: [
    { name: 'Hospital Central', value: 35, color: '#3B82F6' },
    { name: 'Clínica Norte', value: 25, color: '#10B981' },
    { name: 'Centro Médico Sur', value: 20, color: '#F59E0B' },
    { name: 'Laboratorio Este', value: 20, color: '#EF4444' },
  ]
};

export function AdminStats() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">2,847</div>
            <p className="text-xs text-blue-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizaciones</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">47</div>
            <p className="text-xs text-green-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3 nuevas este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">1,234</div>
            <p className="text-xs text-purple-600">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              Sistema estable
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">23</div>
            <p className="text-xs text-red-600">
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              Requieren atención
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Users Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Usuarios por Día</span>
            </CardTitle>
            <CardDescription>
              Actividad de usuarios y sesiones durante la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockData.dailyUsers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  name="Usuarios"
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name="Sesiones"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Metrics Chart */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Métricas de Salud</span>
            </CardTitle>
            <CardDescription>
              Promedios mensuales de datos bicognitivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.healthMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  name="Ritmo Cardíaco"
                />
                <Line 
                  type="monotone" 
                  dataKey="mentalState" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Estado Mental"
                />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Nivel de Estrés"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Organizations Distribution */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-green-600" />
            <span>Distribución por Organizaciones</span>
          </CardTitle>
          <CardDescription>
            Porcentaje de usuarios por organización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockData.organizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockData.organizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {mockData.organizationData.map((org, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: org.color }}
                    />
                    <span className="text-sm font-medium">{org.name}</span>
                  </div>
                  <Badge variant="secondary">{org.value}%</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XML Processing Status */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <span>Estado del Procesamiento XML</span>
          </CardTitle>
          <CardDescription>
            Conexión con microservicios backend (XML/XMLS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold">CMS Backend</p>
                <p className="text-sm text-gray-600">Conectado</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold">Procesamiento XML</p>
                <p className="text-sm text-gray-600">Activo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
              <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold">Cola de Mensajes</p>
                <p className="text-sm text-gray-600">247 pendientes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}