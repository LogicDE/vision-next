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
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Building,
  TrendingUp
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Enterprise {
  id: number;
  name: string;
  email?: string;
  telephone?: string;
  address?: string;
  locations?: any[];
  employees?: any[];
  created_at?: string;
  updated_at?: string;
}

interface EnterpriseFormData {
  name: string;
  email: string;
  telephone: string;
  address: string;
}

export function EnterprisesManagement() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [deletingEnterprise, setDeletingEnterprise] = useState<Enterprise | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EnterpriseFormData>({
    name: '',
    email: '',
    telephone: '',
    address: '',
  });

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/enterprises');
      setEnterprises(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar empresas');
      console.error('Error loading enterprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (enterprise?: Enterprise) => {
    if (enterprise) {
      setEditingEnterprise(enterprise);
      setFormData({
        name: enterprise.name,
        email: enterprise.email || '',
        telephone: enterprise.telephone || '',
        address: enterprise.address || '',
      });
    } else {
      setEditingEnterprise(null);
      setFormData({
        name: '',
        email: '',
        telephone: '',
        address: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEnterprise(null);
    setFormData({
      name: '',
      email: '',
      telephone: '',
      address: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEnterprise) {
        await fetchAPI(`/enterprises/${editingEnterprise.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Empresa actualizada exitosamente');
      } else {
        await fetchAPI('/enterprises', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Empresa creada exitosamente');
      }
      handleCloseDialog();
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar empresa');
      console.error('Error saving enterprise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (enterprise: Enterprise) => {
    setDeletingEnterprise(enterprise);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnterprise) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/enterprises/${deletingEnterprise.id}`, {
        method: 'DELETE',
      });
      toast.success('Empresa eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingEnterprise(null);
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar empresa');
      console.error('Error deleting enterprise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEnterprises = enterprises.filter((enterprise) =>
    enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando empresas...</p>
      </div>
    );
  }

  const totalEmployees = enterprises.reduce((acc, ent) => acc + (ent.employees?.length || 0), 0);
  const totalLocations = enterprises.reduce((acc, ent) => acc + (ent.locations?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-green-400" />
            <span>Gestión de Empresas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra organizaciones y sus ubicaciones
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Empresas</p>
                <p className="text-3xl font-bold text-white">{enterprises.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Empleados Total</p>
                <p className="text-3xl font-bold text-white">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ubicaciones</p>
                <p className="text-3xl font-bold text-white">{totalLocations}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Promedio Empleados</p>
                <p className="text-3xl font-bold text-white">
                  {enterprises.length > 0 ? Math.round(totalEmployees / enterprises.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
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
              placeholder="Buscar empresas por nombre, email o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enterprises List */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Empresas Registradas</span>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {filteredEnterprises.length} empresas
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de organizaciones y sus datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEnterprises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Building2 className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">No se encontraron empresas</p>
              </div>
            ) : (
              filteredEnterprises.map((enterprise) => (
                <div
                  key={enterprise.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all space-y-3 md:space-y-0"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white text-lg">{enterprise.name}</h4>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          ID: {enterprise.id}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {enterprise.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{enterprise.email}</span>
                          </div>
                        )}
                        {enterprise.telephone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300">{enterprise.telephone}</span>
                          </div>
                        )}
                        {enterprise.address && (
                          <div className="flex items-center space-x-2 text-sm sm:col-span-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate">{enterprise.address}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {enterprise.employees?.length || 0} empleados
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {enterprise.locations?.length || 0} ubicaciones
                        </Badge>
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Activa
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(enterprise)}
                      className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(enterprise)}
                      className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span>{editingEnterprise ? 'Editar Empresa' : 'Nueva Empresa'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEnterprise
                ? 'Actualiza la información de la empresa'
                : 'Completa los datos para registrar una nueva empresa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre de la Empresa *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Corporativo
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-gray-300">
                Teléfono
              </Label>
              <Input
                id="telephone"
                placeholder="+52 123 456 7890"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">
                Dirección
              </Label>
              <Input
                id="address"
                placeholder="Calle Principal #123, Ciudad"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingEnterprise ? 'Actualizar' : 'Crear Empresa'}
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
              ¿Estás seguro de que deseas eliminar la empresa{' '}
              <span className="font-bold text-white">{deletingEnterprise?.name}</span>?
            </p>

            {deletingEnterprise && ((deletingEnterprise.employees?.length || 0) > 0 || (deletingEnterprise.locations?.length || 0) > 0) && (
              <div className="space-y-2">
                {deletingEnterprise.employees && deletingEnterprise.employees.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Esta empresa tiene {deletingEnterprise.employees.length} empleado(s) asignado(s)
                    </p>
                  </div>
                )}
                {deletingEnterprise.locations && deletingEnterprise.locations.length > 0 && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Esta empresa tiene {deletingEnterprise.locations.length} ubicación(es) registrada(s)
                    </p>
                  </div>
                )}
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
                  Eliminar Empresa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}