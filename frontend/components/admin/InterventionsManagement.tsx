'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, CheckCircle2, Users, Filter } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
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

  const fetchAPI = useCallback(async (endpoint: string, options?: RequestInit) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  }, [API_URL]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [employeesData, interventionsData] = await Promise.all([
        fetchAPI('/employees'),
        fetchAPI('/interventions'),
      ]);
      setEmployees(employeesData);
      setInterventions(interventionsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  useEffect(() => { loadData(); }, [loadData]);

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const filteredInterventions = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return interventions.filter((i) =>
      i.titleMessage.toLowerCase().includes(term) ||
      i.type.toLowerCase().includes(term) ||
      i.manager?.firstName.toLowerCase().includes(term) ||
      i.manager?.lastName.toLowerCase().includes(term)
    );
  }, [interventions, debouncedSearch]);

  const handleOpenDialog = (intervention?: Intervention) => {
    setEditingIntervention(intervention || null);
    setFormData(
      intervention
        ? {
            titleMessage: intervention.titleMessage,
            bodyMessage: intervention.bodyMessage,
            type: intervention.type,
            description: intervention.description,
            managerId: intervention.manager?.id || null,
          }
        : { titleMessage: '', bodyMessage: '', type: '', description: '', managerId: null }
    );
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.titleMessage.trim() || !formData.type.trim()) {
      toast.error('El título y tipo son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      const method = editingIntervention ? 'PUT' : 'POST';
      const endpoint = editingIntervention
        ? `/interventions/${editingIntervention.id}`
        : '/interventions';
      await fetchAPI(endpoint, { method, body: JSON.stringify(formData) });
      toast.success(editingIntervention ? 'Intervención actualizada' : 'Intervención creada');
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error guardando intervención');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta intervención?')) return;
    try {
      await fetchAPI(`/interventions/${id}`, { method: 'DELETE' });
      toast.success('Intervención eliminada');
      loadData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error eliminando intervención');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-orange-400" />
          Gestión de Intervenciones
        </h2>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Buscar por título, tipo o manager..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900/50 border-white/10 text-white pl-10"
        />
        <Filter className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        ) : filteredInterventions.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No se encontraron intervenciones</p>
        ) : (
          filteredInterventions.map((i) => (
            <Card key={i.id} className="bg-slate-800/50 border-white/10 hover:bg-slate-800/70 transition-all">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white font-medium">{i.titleMessage}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    <span className="font-medium text-amber-400">{i.type}</span> — Manager:{' '}
                    {i.manager?.firstName} {i.manager?.lastName || ''}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(i)}>
                    <Edit className="w-4 h-4 text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm leading-relaxed">{i.description}</p>
                {i.bodyMessage && (
                  <p className="text-gray-500 text-xs mt-2 italic">{i.bodyMessage}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIntervention ? 'Editar Intervención' : 'Nueva Intervención'}</DialogTitle>
            <DialogDescription>
              {editingIntervention
                ? 'Actualiza los datos de la intervención'
                : 'Completa los campos para crear una nueva intervención'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {[
              { id: 'titleMessage', label: 'Título *', value: formData.titleMessage },
              { id: 'bodyMessage', label: 'Cuerpo', value: formData.bodyMessage },
              { id: 'type', label: 'Tipo *', value: formData.type },
              { id: 'description', label: 'Descripción', value: formData.description },
            ].map(({ id, label, value }) => (
              <div className="space-y-2" key={id}>
                <Label htmlFor={id}>{label}</Label>
                <Input
                  id={id}
                  value={value}
                  onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                  className="bg-slate-800/50 border-white/10"
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select
                value={formData.managerId?.toString() || ''}
                onValueChange={(val) => setFormData({ ...formData, managerId: parseInt(val) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10">
                  <SelectValue placeholder="Seleccionar manager" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} — {emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all text-white"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2 inline" />
              )}
              {editingIntervention ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
