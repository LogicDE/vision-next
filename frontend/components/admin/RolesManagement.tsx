'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  Lock,
  CheckCircle,
  AlertCircle,
  UserCog,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Role {
  id: number;
  name: string;
  description?: string;
  rolePermissions?: any[];
  employees?: any[];
  created_at?: string;
  updated_at?: string;
}

interface RoleFormData {
  name: string;
  description: string;
}

export function RolesManagement() {
  const PAGE_SIZE = 10;
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/roles');
      setRoles(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar roles');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRole) {
        await fetchAPI(`/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Rol actualizado exitosamente');
      } else {
        await fetchAPI('/roles', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Rol creado exitosamente');
      }
      handleCloseDialog();
      loadRoles();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar rol');
      console.error('Error saving role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRole) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/roles/${deletingRole.id}`, {
        method: 'DELETE',
      });
      toast.success('Rol eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
      loadRoles();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar rol');
      console.error('Error deleting role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredRoles.length]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / PAGE_SIZE));
  const pageStart = filteredRoles.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = filteredRoles.length === 0 ? 0 : Math.min(filteredRoles.length, currentPage * PAGE_SIZE);
  const paginatedRoles = filteredRoles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando roles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Shield className="w-6 h-6 text-purple-400" />
            <span>Gestión de Roles</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra roles y permisos del sistema
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Roles</p>
                <p className="text-3xl font-bold text-white">{roles.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Roles Activos</p>
                <p className="text-3xl font-bold text-white">{roles.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Usuarios Asignados</p>
                <p className="text-3xl font-bold text-white">
                  {roles.reduce((acc, role) => acc + (role.employees?.length || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Roles del Sistema</span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {filteredRoles.length} roles
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de roles y sus configuraciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Shield className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">No se encontraron roles</p>
              </div>
            ) : (
              paginatedRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{role.name}</h4>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          ID: {role.id}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {role.description || 'Sin descripción'}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {role.employees?.length || 0} usuarios
                        </Badge>
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {role.rolePermissions?.length || 0} permisos
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(role)}
                      className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(role)}
                      className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
              <p className="text-sm text-gray-400">
                Mostrando{' '}
                {filteredRoles.length === 0 ? (
                  '0'
                ) : (
                  <>
                    {pageStart}-{pageEnd}
                  </>
                )}{' '}
                de {filteredRoles.length} roles
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-300">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/10 bg-slate-800 text-white hover:bg-slate-700"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>{editingRole ? 'Editar Rol' : 'Nuevo Rol'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingRole
                ? 'Actualiza la información del rol'
                : 'Completa los datos para crear un nuevo rol'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre del Rol *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Administrador, Editor, Viewer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                Descripción
              </Label>
              <Input
                id="description"
                placeholder="Describe las responsabilidades del rol"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={submitting}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingRole ? 'Actualizar' : 'Crear Rol'}
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

          <div className="py-4">
            <p className="text-gray-300">
              ¿Estás seguro de que deseas eliminar el rol{' '}
              <span className="font-bold text-white">{deletingRole?.name}</span>?
            </p>
            {deletingRole?.employees && deletingRole.employees.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-300 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Este rol tiene {deletingRole.employees.length} usuario(s) asignado(s)
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={submitting}
              className="border-white/10 hover:bg-white/10 text-gray-300"
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
                  Eliminar Rol
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}