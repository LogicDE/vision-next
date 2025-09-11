'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  User,
  Activity,
  Eye
} from 'lucide-react';

const mockUsers = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana.garcia@hospital.com',
    role: 'user',
    organization: 'Hospital Central',
    status: 'active',
    lastActive: '2024-01-15 10:30',
    heartRate: 72,
    mentalState: 85,
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '2',
    name: 'Dr. Carlos López',
    email: 'carlos.lopez@clinica.com',
    role: 'admin',
    organization: 'Clínica Norte',
    status: 'active',
    lastActive: '2024-01-15 09:15',
    heartRate: 68,
    mentalState: 90,
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '3',
    name: 'María Rodríguez',
    email: 'maria.rodriguez@centro.com',
    role: 'user',
    organization: 'Centro Médico Sur',
    status: 'inactive',
    lastActive: '2024-01-14 16:20',
    heartRate: 75,
    mentalState: 78,
    avatar: '/api/placeholder/40/40'
  },
  {
    id: '4',
    name: 'Enf. Luis Martín',
    email: 'luis.martin@laboratorio.com',
    role: 'user',
    organization: 'Laboratorio Este',
    status: 'active',
    lastActive: '2024-01-15 11:45',
    heartRate: 70,
    mentalState: 82,
    avatar: '/api/placeholder/40/40'
  },
];

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>Admin</span>
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center space-x-1">
        <User className="h-3 w-3" />
        <span>Usuario</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Gestión de Usuarios</span>
          </CardTitle>
          <CardDescription>
            Administra usuarios del sistema y sus datos bicognitivos (conexión XML)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filtro</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSelectedRole('all')}>
                Todos los roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedRole('admin')}>
                Solo administradores
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedRole('user')}>
                Solo usuarios
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar Usuario
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border-none shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Datos Bicognitivos</TableHead>
                <TableHead>Última Actividad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.organization}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-red-600">
                        <Activity className="h-3 w-3" />
                        <span>{user.heartRate} BPM</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Activity className="h-3 w-3" />
                        <span>{user.mentalState}%</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastActive}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>Ver detalles</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center space-x-2 text-red-600">
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
              <p className="text-sm text-muted-foreground">Usuarios Filtrados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Usuarios Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'admin').length}
              </div>
              <p className="text-sm text-muted-foreground">Administradores</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(filteredUsers.reduce((acc, u) => acc + u.heartRate, 0) / filteredUsers.length)}
              </div>
              <p className="text-sm text-muted-foreground">BPM Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}