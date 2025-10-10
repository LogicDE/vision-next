  'use client';

  import { useState, useEffect } from 'react';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Badge } from '@/components/ui/badge';
  import { Avatar, AvatarFallback } from '@/components/ui/avatar';
  import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
  import { Label } from '@/components/ui/label';
  import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    UserPlus, 
    Edit, 
    Trash2, 
    Shield, 
    User,
    Eye,
    Loader2,
    AlertCircle
  } from 'lucide-react';
  import { Alert, AlertDescription } from '@/components/ui/alert';

  interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    telephone?: string;
    rol: {
      id: number;
      name: string;
    };
    empresa: {
      id: number;
      name: string;
    };
    manager?: {
      id: number;
      first_name: string;
      last_name: string;
    };
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
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password?: string;
    telephone?: string;
    id_role: number | '';
    id_enterprise: number | '';
    manager_id?: number | null;
  }

  export function UsersManagement() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<EmployeeFormData>({
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      password: '',
      telephone: '',
      id_role: '',
      id_enterprise: '',
      manager_id: null,
    });
    const [formLoading, setFormLoading] = useState(false);

    // Fetch data on mount
    useEffect(() => {
      fetchEmployees();
      fetchRoles();
      fetchEnterprises();
    }, []);

    // URL base del backend
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/employees`, {
        method: 'GET',
        credentials: 'include', // usa cookies HttpOnly
      });
      const data = await response.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      setError('Error al cargar empleados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_URL}/roles`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setRoles(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error al cargar roles:', err);
    }
  };

  const fetchEnterprises = async () => {
    try {
      const response = await fetch(`${API_URL}/enterprises`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setEnterprises(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      setFormLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        fetchEmployees();
        resetForm();
      } else {
        setError(data.message || 'Error al crear empleado');
      }
    } catch (err) {
      setError('Error al crear empleado');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setFormLoading(true);
      setError(null);
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;

      const response = await fetch(`${API_URL}/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });
      const data = await response.json();

      if (data.success) {
        setIsEditModalOpen(false);
        fetchEmployees();
        resetForm();
      } else {
        setError(data.message || 'Error al actualizar empleado');
      }
    } catch (err) {
      setError('Error al actualizar empleado');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      setFormLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/employees/${selectedEmployee.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        setIsDeleteModalOpen(false);
        fetchEmployees();
        setSelectedEmployee(null);
      } else {
        setError(data.message || 'Error al eliminar empleado');
      }
    } catch (err) {
      setError('Error al eliminar empleado');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };


    const openCreateModal = () => {
      resetForm();
      setIsCreateModalOpen(true);
    };

    const openEditModal = (employee: Employee) => {
      setSelectedEmployee(employee);
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        username: employee.username,
        telephone: employee.telephone || '',
        id_role: employee.rol.id,
        id_enterprise: employee.empresa.id,
        manager_id: employee.manager?.id || null,
      });
      setIsEditModalOpen(true);
    };

    const openDeleteModal = (employee: Employee) => {
      setSelectedEmployee(employee);
      setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        telephone: '',
        id_role: '',
        id_enterprise: '',
        manager_id: null,
      });
      setSelectedEmployee(null);
    };

    const filteredEmployees = employees.filter(emp => {
      const matchesSearch = 
        emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empresa.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || emp.rol.name === selectedRole;
      return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
      return role === 'admin' ? (
        <Badge className="bg-purple-100 text-purple-800 flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>{role}</span>
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center space-x-1">
          <User className="h-3 w-3" />
          <span>{role}</span>
        </Badge>
      );
    };

    const getInitials = (firstName: string, lastName: string) => {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Gestión de Empleados</span>
            </CardTitle>
            <CardDescription>
              Administra los empleados del sistema y sus roles
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
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
                {roles.map(role => (
                  <DropdownMenuItem key={role.id} onClick={() => setSelectedRole(role.name)}>
                    {role.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button 
            onClick={openCreateModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Agregar Empleado
          </Button>
        </div>

        {/* Employees Table */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(employee.first_name, employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {employee.first_name} {employee.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.empresa.name}</TableCell>
                    <TableCell>{getRoleBadge(employee.rol.name)}</TableCell>
                    <TableCell>
                      {employee.manager ? (
                        <span className="text-sm">
                          {employee.manager.first_name} {employee.manager.last_name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sin manager</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.telephone || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="flex items-center space-x-2"
                            onClick={() => openEditModal(employee)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center space-x-2 text-red-600"
                            onClick={() => openDeleteModal(employee)}
                          >
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
                <div className="text-2xl font-bold text-blue-600">
                  {filteredEmployees.length}
                </div>
                <p className="text-sm text-muted-foreground">Empleados Totales</p>
              </div>
            </CardContent>
          </Card>
          {roles.slice(0, 3).map(role => (
            <Card key={role.id} className="border-none shadow-lg">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredEmployees.filter(e => e.rol.name === role.name).length}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{role.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreateModalOpen ? 'Crear Nuevo Empleado' : 'Editar Empleado'}
              </DialogTitle>
              <DialogDescription>
                {isCreateModalOpen 
                  ? 'Completa los datos del nuevo empleado' 
                  : 'Modifica los datos del empleado'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="juan@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="jperez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña {isEditModalOpen && '(dejar vacío para no cambiar)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="********"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Teléfono</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                    placeholder="+52 123 456 7890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_role">Rol *</Label>
                  <Select
                    value={formData.id_role.toString()}
                    onValueChange={(value) => setFormData({...formData, id_role: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_enterprise">Empresa *</Label>
                  <Select
                    value={formData.id_enterprise.toString()}
                    onValueChange={(value) => setFormData({...formData, id_enterprise: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {enterprises.map(enterprise => (
                        <SelectItem key={enterprise.id} value={enterprise.id.toString()}>
                          {enterprise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_id">Manager (Opcional)</Label>
                <Select
                  value={formData.manager_id?.toString() || 'none'}
                  onValueChange={(value) => setFormData({
                    ...formData, 
                    manager_id: value === 'none' ? null : parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin manager" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin manager</SelectItem>
                    {employees
                      .filter(e => e.id !== selectedEmployee?.id)
                      .map(emp => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} - {emp.rol.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={isCreateModalOpen ? handleCreateEmployee : handleUpdateEmployee}
                disabled={formLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCreateModalOpen ? 'Crear Empleado' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas eliminar a{' '}
                <span className="font-semibold">
                  {selectedEmployee?.first_name} {selectedEmployee?.last_name}
                </span>
                ? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedEmployee(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteEmployee}
                disabled={formLoading}
              >
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }