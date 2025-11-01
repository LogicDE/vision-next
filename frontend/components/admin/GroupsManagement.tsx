'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  UserCog,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  BrainCircuit,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: number;
  name: string;
  manager: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  members?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  // Removemos las relaciones problemáticas temporalmente
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: {
    id: number;
    name: string;
  };
}

interface GroupFormData {
  name: string;
  managerId: number | null;
}

export function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    managerId: null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch helper function mejorada
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = 'Error en la solicitud';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar empleados primero
      const employeesData = await fetchAPI('/employees');
      setEmployees(employeesData);

      // Intentar cargar grupos con manejo de error específico
      try {
        const groupsData = await fetchAPI('/groups');
        setGroups(groupsData);
      } catch (groupsError: any) {
        console.warn('Error loading groups, using empty array:', groupsError);
        setGroups([]);
        toast.error('No se pudieron cargar los grupos. Mostrando lista vacía.');
      }

    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        managerId: group.manager.id,
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        managerId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      managerId: null,
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del grupo es requerido');
      return;
    }

    if (!formData.managerId) {
      toast.error('El manager es requerido');
      return;
    }

    setSubmitting(true);
    try {
      if (editingGroup) {
        await fetchAPI(`/groups/${editingGroup.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            managerId: formData.managerId,
          }),
        });
        toast.success('Grupo actualizado exitosamente');
      } else {
        await fetchAPI('/groups', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            managerId: formData.managerId,
          }),
        });
        toast.success('Grupo creado exitosamente');
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar grupo');
      console.error('Error saving group:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (group: Group) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/groups/${deletingGroup.id}`, {
        method: 'DELETE',
      });
      toast.success('Grupo eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar grupo');
      console.error('Error deleting group:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando grupos...</p>
      </div>
    );
  }

  const totalMembers = groups.reduce((acc, group) => acc + (group.members?.length || 0), 0);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Grupos</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra grupos de trabajo y sus asignaciones
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="relative overflow-hidden group bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-500/50 hover:shadow-xl hover:shadow-amber-500/50 transition-all"
          >
            <span className="relative z-10 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Grupo
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Total Groups Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-orange-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Grupos</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{groups.length}</div>
            <p className="text-xs text-gray-400">Grupos activos</p>
          </CardContent>
        </Card>

        {/* Total Members Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Miembros</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalMembers}</div>
            <p className="text-xs text-gray-400">Miembros en grupos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar grupos por nombre, manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Grupos Registrados</span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {filteredGroups.length} grupos
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de grupos de trabajo y su información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">
                  {groups.length === 0 ? 'No hay grupos registrados' : 'No se encontraron grupos que coincidan con la búsqueda'}
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-800/50 rounded-xl border border-white/10 hover:border-white/20 transition-all space-y-4 md:space-y-0"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-white text-lg">{group.name}</h4>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          ID: {group.id}
                        </Badge>
                      </div>
                      
                      {/* Manager Info */}
                      <div className="flex items-center space-x-3 mb-3 p-3 bg-slate-900/50 rounded-lg border border-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-white">
                            {getInitials(group.manager.firstName, group.manager.lastName)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {group.manager.firstName} {group.manager.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{group.manager.email}</p>
                        </div>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs ml-auto">
                          <UserCog className="w-3 h-3 mr-1" />
                          Manager
                        </Badge>
                      </div>

                      {/* Group Metrics */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <UserCog className="w-3 h-3 mr-1" />
                          {group.members?.length || 0} miembros
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          <Activity className="w-3 h-3 mr-1" />
                          Grupo Activo
                        </Badge>
                        {group.created_at && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Creado: {new Date(group.created_at).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(group)}
                      className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(group)}
                      className="hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-white/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingGroup
                ? 'Actualiza la información del grupo'
                : 'Completa los datos para crear un nuevo grupo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre del Grupo *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Equipo de Desarrollo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager" className="text-gray-300">
                Manager *
              </Label>
              <Select
                value={formData.managerId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, managerId: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar manager" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id.toString()} className="hover:bg-white/10">
                      {employee.firstName} {employee.lastName} - {employee.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
              className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="relative overflow-hidden group bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingGroup ? 'Actualizar' : 'Crear Grupo'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span>Confirmar Eliminación</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta acción no se puede deshacer
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-gray-300">
              ¿Estás seguro de que deseas eliminar el grupo{' '}
              <span className="font-bold text-white">{deletingGroup?.name}</span>?
            </p>

            {deletingGroup && (
              <div className="space-y-3">
                {/* Solo mostramos advertencias si existen los datos */}
                {(deletingGroup.members && deletingGroup.members.length > 0) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Este grupo tiene {deletingGroup.members.length} miembro(s) asignado(s)
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Todos los datos asociados al grupo serán eliminados
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
              className="border-white/10 bg-slate-800 hover:bg-slate-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Grupo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}