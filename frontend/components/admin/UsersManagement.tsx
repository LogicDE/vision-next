'use client';

import { useEffect, useState, useMemo, useRef, KeyboardEvent } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  Building2,
  UserCog,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  telephone?: string;
  status: string;
  enterprise?: { id: number; name: string };
  role?: { id: number; name: string };
  manager?: { id: number; firstName: string; lastName: string };
  created_at?: string;
  updated_at?: string;
}

interface Role {
  id: number;
  name: string;
}

interface Enterprise {
  id: number;
  name: string;
}

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  passwordHash: string;
  telephone: string;
  idEnterprise: number | null;
  idRole: number | null;
  idManager: number | null;
  status: string;
}

export function UsersManagement() {
  const PAGE_SIZE = 10;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [enterprisePopoverOpen, setEnterprisePopoverOpen] = useState(false);
  const [enterpriseSearch, setEnterpriseSearch] = useState('');
  const [enterpriseInvalid, setEnterpriseInvalid] = useState(false);
  const enterpriseInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    passwordHash: '',
    telephone: '',
    idEnterprise: null,
    idRole: null,
    idManager: null,
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, rolesData, enterprisesData] = await Promise.all([
        fetchAPI('/employees'),
        fetchAPI('/roles'),
        fetchAPI('/enterprises'),
      ]);
      setEmployees(employeesData);
      setRoles(rolesData);
      setEnterprises(enterprisesData);
      // Managers will be filtered based on selected enterprise
      setManagers(employeesData.filter((emp: Employee) => emp.role?.name === 'Manager' || emp.role?.name === 'Admin'));
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        username: employee.username,
        passwordHash: '',
        telephone: employee.telephone || '',
        idEnterprise: employee.enterprise?.id || null,
        idRole: employee.role?.id || null,
        idManager: employee.manager?.id || null,
        status: employee.status,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        passwordHash: '',
        telephone: '',
        idEnterprise: null,
        idRole: null,
        idManager: null,
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setShowPassword(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      passwordHash: '',
      telephone: '',
      idEnterprise: null,
      idRole: null,
      idManager: null,
      status: 'active',
    });
    setEnterprisePopoverOpen(false);
    setEnterpriseSearch('');
    setEnterpriseInvalid(false);
  };

  // Filter managers by selected enterprise
  const filteredManagers = useMemo(() => {
    if (!formData.idEnterprise) {
      return [];
    }
    return managers.filter((manager) => manager.enterprise?.id === formData.idEnterprise);
  }, [managers, formData.idEnterprise]);

  // Filter enterprises for combobox
  const filteredEnterpriseOptions = useMemo(() => {
    const term = enterpriseSearch.trim().toLowerCase();
    if (!term) return enterprises;
    return enterprises.filter((enterprise) => enterprise.name.toLowerCase().includes(term));
  }, [enterprises, enterpriseSearch]);

  const selectedEnterpriseLabel = formData.idEnterprise
    ? enterprises.find((e) => e.id === formData.idEnterprise)?.name || 'Seleccionar empresa'
    : 'Seleccionar empresa';

  const handleEnterpriseSelect = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      idEnterprise: id,
      idManager: null, // Reset manager when enterprise changes
    }));
    setEnterprisePopoverOpen(false);
    setEnterpriseSearch('');
    setEnterpriseInvalid(false);
  };

  const handleEnterpriseTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (enterprisePopoverOpen) return;
    if (event.key === 'Enter' || event.key === ' ') {
      setEnterprisePopoverOpen(true);
      event.preventDefault();
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      setEnterprisePopoverOpen(true);
      setEnterpriseSearch(event.key);
      setEnterpriseInvalid(false);
      event.preventDefault();
    }
  };

  const handleEnterpriseInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredEnterpriseOptions.length === 0) {
        setEnterpriseInvalid(true);
      } else {
        handleEnterpriseSelect(filteredEnterpriseOptions[0].id);
      }
    }
  };

  useEffect(() => {
    if (enterprisePopoverOpen && enterpriseInputRef.current) {
      requestAnimationFrame(() => {
        enterpriseInputRef.current?.focus();
      });
    }
  }, [enterprisePopoverOpen]);

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.username.trim()) {
      toast.error('Nombre, apellido, email y usuario son requeridos');
      return;
    }

    if (!editingEmployee && !formData.passwordHash.trim()) {
      toast.error('La contraseña es requerida para nuevos usuarios');
      return;
    }

    if (!formData.idEnterprise || !formData.idRole) {
      toast.error('Empresa y rol son requeridos');
      return;
    }

    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        telephone: formData.telephone || undefined,
        idEnterprise: formData.idEnterprise,
        idRole: formData.idRole,
        idManager: formData.idManager || undefined,
        status: formData.status,
        ...(formData.passwordHash && { passwordHash: formData.passwordHash }),
      };

      if (editingEmployee) {
        await fetchAPI(`/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Usuario actualizado exitosamente');
      } else {
        await fetchAPI('/employees', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Usuario creado exitosamente');
      }
      handleCloseDialog();
      await loadData();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
      console.error('Error saving employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;

    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      await fetchAPI(`/employees/${deletingEmployee.id}`, {
        method: 'DELETE',
      });
      toast.success('Usuario eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(null);
      await loadData();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
      console.error('Error deleting employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, filteredEmployees.length]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const pageStart = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = filteredEmployees.length === 0 ? 0 : Math.min(filteredEmployees.length, currentPage * PAGE_SIZE);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando usuarios...</p>
      </div>
    );
  }

  const activeUsers = employees.filter(emp => emp.status === 'active').length;
  const inactiveUsers = employees.filter(emp => emp.status === 'inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span>Gestión de Usuarios</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra empleados y sus permisos
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Usuarios</p>
                <p className="text-3xl font-bold text-white">{employees.length}</p>
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
                <p className="text-sm text-gray-400">Activos</p>
                <p className="text-3xl font-bold text-white">{activeUsers}</p>
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
                <p className="text-sm text-gray-400">Inactivos</p>
                <p className="text-3xl font-bold text-white">{inactiveUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Roles Asignados</p>
                <p className="text-3xl font-bold text-white">{roles.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, email o username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-slate-900/50 border-white/10 text-white">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Usuarios Registrados</span>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {filteredEmployees.length} usuarios
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de empleados y su información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEmployees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Users className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">No se encontraron usuarios</p>
              </div>
            ) : (
              paginatedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all space-y-3 md:space-y-0"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-white text-lg">
                          {employee.firstName} {employee.lastName}
                        </h4>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          @{employee.username}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-300 truncate">{employee.email}</span>
                        </div>
                        {employee.telephone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300">{employee.telephone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {employee.role && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            {employee.role.name}
                          </Badge>
                        )}
                        {employee.enterprise && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            <Building2 className="w-3 h-3 mr-1" />
                            {employee.enterprise.name}
                          </Badge>
                        )}
                        {employee.manager && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            <UserCog className="w-3 h-3 mr-1" />
                            Manager: {employee.manager.firstName}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${
                          employee.status === 'active' 
                            ? 'bg-green-500/20 text-green-300 border-green-500/30'
                            : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                          {employee.status === 'active' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Activo</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 mr-1" /> Inactivo</>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 md:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(employee)}
                      className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(employee)}
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
                {filteredEmployees.length === 0 ? (
                  '0'
                ) : (
                  <>
                    {pageStart}-{pageEnd}
                  </>
                )}{' '}
                de {filteredEmployees.length} usuarios
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
        <DialogContent className="sm:max-w-2xl bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span>{editingEmployee ? 'Editar Usuario' : 'Nuevo Usuario'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEmployee
                ? 'Actualiza la información del usuario'
                : 'Completa los datos para crear un nuevo usuario'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">
                Nombre *
              </Label>
              <Input
                id="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">
                Apellido *
              </Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Username *
              </Label>
              <Input
                id="username"
                placeholder="juanperez"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Contraseña {!editingEmployee && '*'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={editingEmployee ? 'Dejar vacío para no cambiar' : '••••••••'}
                  value={formData.passwordHash}
                  onChange={(e) => setFormData({ ...formData, passwordHash: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enterprise" className="text-gray-300">
                Empresa *
              </Label>
              <Popover open={enterprisePopoverOpen} onOpenChange={setEnterprisePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={enterprisePopoverOpen}
                    disabled={enterprises.length === 0}
                    className={`w-full justify-between bg-slate-800/50 text-white ${
                      enterpriseInvalid ? 'border-red-500/60' : 'border-white/10'
                    }`}
                    onKeyDown={handleEnterpriseTriggerKeyDown}
                  >
                    <span className="truncate">
                      {enterprises.length ? selectedEnterpriseLabel : 'No hay empresas disponibles'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-slate-900 text-white border border-white/10" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar empresa..."
                      value={enterpriseSearch}
                      onValueChange={(value) => setEnterpriseSearch(value)}
                      onKeyDown={handleEnterpriseInputKeyDown}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                      ref={enterpriseInputRef}
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredEnterpriseOptions.map((enterprise) => (
                          <CommandItem
                            key={enterprise.id}
                            value={enterprise.name}
                            onSelect={() => handleEnterpriseSelect(enterprise.id)}
                          >
                            {enterprise.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {enterpriseInvalid && <p className="text-xs text-red-400">Selecciona una empresa válida</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">
                Rol *
              </Label>
              <Select
                value={formData.idRole?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, idRole: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager" className="text-gray-300">
                Manager (Opcional)
              </Label>
              <Select
                value={formData.idManager?.toString() || 'none'}
                onValueChange={(value) => setFormData({ ...formData, idManager: value === 'none' ? null : parseInt(value) })}
                disabled={!formData.idEnterprise}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder={formData.idEnterprise ? "Sin manager" : "Selecciona una empresa primero"} />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="none">Sin manager</SelectItem>
                  {filteredManagers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id.toString()}>
                      {manager.firstName} {manager.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.idEnterprise && (
                <p className="text-xs text-amber-400">Selecciona una empresa primero para elegir un manager</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">
                Estado
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
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
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingEmployee ? 'Actualizar' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl text-red-500">
              <Trash2 className="w-6 h-6" />
              <span>Eliminar Usuario</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              ¿Estás seguro que deseas eliminar al usuario <strong>{deletingEmployee?.firstName} {deletingEmployee?.lastName}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 mt-4">
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
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
