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
  Calendar,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: number;
  titleMessage: string;
  bodyMessage?: string;
  coordinatorName?: string;
  startAt?: string;
  endAt?: string;
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface EventFormData {
  titleMessage: string;
  bodyMessage: string;
  coordinatorName: string;
  managerId: number | null;
  startAt: string;
  endAt: string;
}

export function EventsDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    titleMessage: '',
    bodyMessage: '',
    coordinatorName: '',
    managerId: null,
    startAt: '',
    endAt: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch helper
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error);
      throw error;
    }
  };

  // Load events and employees
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeesData = await fetchAPI('/employees');
      setEmployees(employeesData);

      const eventsData = await fetchAPI('/events');
      setEvents(eventsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  // Open Dialog
  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        titleMessage: event.titleMessage,
        bodyMessage: event.bodyMessage || '',
        coordinatorName: event.coordinatorName || '',
        managerId: event.manager?.id || null,
        startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0,16) : '',
        endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0,16) : '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        titleMessage: '',
        bodyMessage: '',
        coordinatorName: '',
        managerId: null,
        startAt: '',
        endAt: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      titleMessage: '',
      bodyMessage: '',
      coordinatorName: '',
      managerId: null,
      startAt: '',
      endAt: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.titleMessage.trim() || !formData.managerId) {
      toast.error('Título y manager son requeridos');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEvent) {
        await fetchAPI(`/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Evento actualizado exitosamente');
      } else {
        await fetchAPI('/events', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Evento creado exitosamente');
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar evento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (event: Event) => {
    setDeletingEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEvent) return;
    setSubmitting(true);
    try {
      await fetchAPI(`/events/${deletingEvent.id}`, { method: 'DELETE' });
      toast.success('Evento eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar evento');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((event) =>
    event.titleMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.coordinatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.manager?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.manager?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.manager?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando eventos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Eventos</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra eventos y asignaciones de tu equipo
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
              Nuevo Evento
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar eventos por título, coordinador o manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Eventos Registrados</span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {filteredEvents.length} eventos
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de eventos y su información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">
                  {events.length === 0 ? 'No hay eventos registrados' : 'No se encontraron eventos que coincidan con la búsqueda'}
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-800/50 rounded-xl border border-white/10 hover:border-white/20 transition-all space-y-4 md:space-y-0"
                >
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-white text-lg">{event.titleMessage}</h4>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          ID: {event.id}
                        </Badge>
                      </div>

                      {/* Manager Info */}
                      {event.manager && (
                        <div className="flex items-center space-x-3 mb-3 p-3 bg-slate-900/50 rounded-lg border border-white/5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {getInitials(event.manager.firstName, event.manager.lastName)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {event.manager.firstName} {event.manager.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{event.manager.email}</p>
                          </div>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs ml-auto">
                            <UserCog className="w-3 h-3 mr-1" />
                            Manager
                          </Badge>
                        </div>
                      )}

                      {/* Event Dates */}
                      <div className="flex flex-wrap items-center gap-2">
                        {event.startAt && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Inicio: {new Date(event.startAt).toLocaleString()}
                          </Badge>
                        )}
                        {event.endAt && (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Fin: {new Date(event.endAt).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(event)}
                      className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(event)}
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
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEvent
                ? 'Actualiza la información del evento'
                : 'Completa los datos para crear un nuevo evento'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titleMessage" className="text-gray-300">Título *</Label>
              <Input
                id="titleMessage"
                placeholder="Ej: Reunión Semanal"
                value={formData.titleMessage}
                onChange={(e) => setFormData({ ...formData, titleMessage: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyMessage" className="text-gray-300">Descripción</Label>
              <Input
                id="bodyMessage"
                placeholder="Descripción del evento"
                value={formData.bodyMessage}
                onChange={(e) => setFormData({ ...formData, bodyMessage: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coordinatorName" className="text-gray-300">Coordinador</Label>
              <Input
                id="coordinatorName"
                placeholder="Nombre del coordinador"
                value={formData.coordinatorName}
                onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager" className="text-gray-300">Manager *</Label>
              <Select
                value={formData.managerId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, managerId: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar manager" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()} className="hover:bg-white/10">
                      {emp.firstName} {emp.lastName} - {emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="startAt" className="text-gray-300">Fecha Inicio</Label>
                <Input
                  type="datetime-local"
                  id="startAt"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt" className="text-gray-300">Fecha Fin *</Label>
                <Input
                  type="datetime-local"
                  id="endAt"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                />
              </div>
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
                  {editingEvent ? 'Actualizar' : 'Crear Evento'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
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
              ¿Estás seguro de que deseas eliminar el evento{' '}
              <span className="font-bold text-white">{deletingEvent?.titleMessage}</span>?
            </p>
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
                  Eliminar Evento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
