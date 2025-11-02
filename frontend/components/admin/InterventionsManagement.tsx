'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, RefreshCw, CheckCircle, Loader2, AlertCircle, Users } from 'lucide-react';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Intervention {
  id: number;
  titleMessage: string;
  bodyMessage: string;
  type: string;
  description: string;
  manager?: Employee | null;
}

interface InterventionFormData {
  titleMessage: string;
  bodyMessage: string;
  type: string;
  description: string;
  managerId: number | null;
}

export function InterventionsManagement() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<InterventionFormData>({
    titleMessage: '',
    bodyMessage: '',
    type: '',
    description: '',
    managerId: null,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, interventionsData] = await Promise.all([
        fetchAPI('/employees'),
        fetchAPI('/interventions'),
      ]);
      setEmployees(employeesData);
      setInterventions(interventionsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error cargando intervenciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (intervention?: Intervention) => {
    if (intervention) {
      setEditingIntervention(intervention);
      setFormData({
        titleMessage: intervention.titleMessage,
        bodyMessage: intervention.bodyMessage,
        type: intervention.type,
        description: intervention.description,
        managerId: intervention.manager?.id || null,
      });
    } else {
      setEditingIntervention(null);
      setFormData({
        titleMessage: '',
        bodyMessage: '',
        type: '',
        description: '',
        managerId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIntervention(null);
    setFormData({       
      titleMessage: '',
      bodyMessage: '',
      type: '',
      description: '',
      managerId: null,
    });
  };

  const handleSubmit = async () => {
    if (!formData.titleMessage || !formData.type) {
      toast.error('El título y tipo son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      if (editingIntervention) {
        await fetchAPI(`/interventions/${editingIntervention.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        toast.success('Intervención actualizada');
      } else {
        await fetchAPI('/interventions', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        toast.success('Intervención creada');
      }
      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error guardando intervención');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSubmitting(true);
    try {
      await fetchAPI(`/interventions/${id}`, { method: 'DELETE' });
      toast.success('Intervención eliminada');
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error eliminando intervención');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInterventions = interventions.filter(
    (i) =>
      i.titleMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.manager?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.manager?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-400" />
          Intervenciones
        </h2>
        <Button onClick={() => handleOpenDialog()} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Intervención
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar por título, tipo o manager"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-slate-900/50 border-white/10 text-white"
      />

      {/* List */}
      <div className="space-y-4">
        {filteredInterventions.length === 0 ? (
          <p className="text-gray-400">No se encontraron intervenciones</p>
        ) : (
          filteredInterventions.map((i) => (
            <Card key={i.id} className="bg-slate-800/50 border-white/10">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{i.titleMessage}</CardTitle>
                  <CardDescription className="text-gray-300">
                    Tipo: {i.type} | Manager: {i.manager?.firstName} {i.manager?.lastName || 'N/A'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(i)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{i.description}</p>
                <p className="text-gray-400 mt-1">{i.bodyMessage}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingIntervention ? 'Editar Intervención' : 'Nueva Intervención'}</DialogTitle>
            <DialogDescription>
              {editingIntervention ? 'Actualiza los datos de la intervención' : 'Completa los datos para crear una intervención'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="titleMessage">Título *</Label>
              <Input
                id="titleMessage"
                value={formData.titleMessage}
                onChange={(e) => setFormData({ ...formData, titleMessage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bodyMessage">Cuerpo</Label>
              <Input
                id="bodyMessage"
                value={formData.bodyMessage}
                onChange={(e) => setFormData({ ...formData, bodyMessage: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select
                value={formData.managerId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, managerId: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} - {emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700 text-white">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2 inline" /> : <CheckCircle className="w-4 h-4 mr-2 inline" />}
              {editingIntervention ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
