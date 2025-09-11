'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Users, Activity, TrendingUp, Plus, Settings } from 'lucide-react';

const mockOrganizations = [
  {
    id: '1',
    name: 'Hospital Central',
    type: 'Hospital',
    users: 1247,
    activeUsers: 892,
    avgHeartRate: 72,
    avgMentalState: 85,
    status: 'active',
    lastSync: '2024-01-15 10:30',
    logo: '/api/placeholder/60/60'
  },
  {
    id: '2',
    name: 'Clínica Norte',
    type: 'Clínica',
    users: 634,
    activeUsers: 445,
    avgHeartRate: 68,
    avgMentalState: 88,
    status: 'active',
    lastSync: '2024-01-15 09:15',
    logo: '/api/placeholder/60/60'
  },
  {
    id: '3',
    name: 'Centro Médico Sur',
    type: 'Centro Médico',
    users: 412,
    activeUsers: 298,
    avgHeartRate: 75,
    avgMentalState: 82,
    status: 'active',
    lastSync: '2024-01-15 08:45',
    logo: '/api/placeholder/60/60'
  },
  {
    id: '4',
    name: 'Laboratorio Este',
    type: 'Laboratorio',
    users: 189,
    activeUsers: 156,
    avgHeartRate: 70,
    avgMentalState: 79,
    status: 'maintenance',
    lastSync: '2024-01-14 18:20',
    logo: '/api/placeholder/60/60'
  },
];

export function OrganizationsManagement() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Mantenimiento</Badge>;
      default:
        return <Badge variant="secondary">Inactivo</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-green-600" />
                <span>Gestión de Organizaciones</span>
              </CardTitle>
              <CardDescription>
                Administra organizaciones y supervisa sus métricas de salud (conexión XML CMS)
              </CardDescription>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Organización
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Organizations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {mockOrganizations.map((org) => (
          <Card key={org.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={org.logo} />
                    <AvatarFallback>
                      <Building2 className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{org.name}</h3>
                    <p className="text-sm text-muted-foreground">{org.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(org.status)}
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{org.users}</div>
                  <p className="text-sm text-blue-600">Usuarios Totales</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{org.activeUsers}</div>
                  <p className="text-sm text-green-600">Usuarios Activos</p>
                </div>
              </div>

              {/* Health Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Ritmo Cardíaco Promedio</span>
                  </div>
                  <div className="text-lg font-bold text-red-600">{org.avgHeartRate} BPM</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Estado Mental Promedio</span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">{org.avgMentalState}%</div>
                </div>
              </div>

              {/* Last Sync */}
              <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                <span>Última sincronización XML:</span>
                <span className="font-medium">{org.lastSync}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Ver Usuarios
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Métricas
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{mockOrganizations.length}</div>
            <p className="text-sm text-blue-600">Organizaciones Totales</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              {mockOrganizations.reduce((acc, org) => acc + org.users, 0)}
            </div>
            <p className="text-sm text-green-600">Usuarios Totales</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">
              {Math.round(mockOrganizations.reduce((acc, org) => acc + org.avgHeartRate, 0) / mockOrganizations.length)}
            </div>
            <p className="text-sm text-red-600">BPM Global Promedio</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {Math.round(mockOrganizations.reduce((acc, org) => acc + org.avgMentalState, 0) / mockOrganizations.length)}%
            </div>
            <p className="text-sm text-purple-600">Estado Mental Global</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}