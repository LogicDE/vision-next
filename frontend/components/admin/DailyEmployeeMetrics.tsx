'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Users, Plus, Edit, Trash2, Search, Loader2, CheckCircle, AlertCircle, Activity, BarChart3, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface DailyEmployeeMetric {
  employeeId: number;
  snapshotId: number;
  metricName: string;
  aggType: string;
  value: number;
  employee?: { id: number; firstName: string; lastName: string; email: string; };
  snapshot?: { id: number; date: string; };
}

interface DailyEmployeeMetricFormData {
  employeeId: number | null;
  snapshotId: number | null;
  metricName: string;
  aggType: string;
  value: number | '';
}

export function DailyEmployeeMetrics() {
  const [metrics, setMetrics] = useState<DailyEmployeeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<DailyEmployeeMetric | null>(null);
  const [deletingMetric, setDeletingMetric] = useState<DailyEmployeeMetric | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<DailyEmployeeMetricFormData>({
    employeeId: null,
    snapshotId: null,
    metricName: '',
    aggType: '',
    value: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Fetch helper
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Error ${res.status}`);
      }
      return res.json();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Load metrics
  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/daily-employee-metrics');
      setMetrics(data);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar métricas');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadMetrics(); }, []);

  const handleOpenDialog = (metric?: DailyEmployeeMetric) => {
    if (metric) {
      setEditingMetric(metric);
      setFormData({
        employeeId: metric.employeeId,
        snapshotId: metric.snapshotId,
        metricName: metric.metricName,
        aggType: metric.aggType,
        value: metric.value,
      });
    } else {
      setEditingMetric(null);
      setFormData({ employeeId: null, snapshotId: null, metricName: '', aggType: '', value: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMetric(null);
    setFormData({ employeeId: null, snapshotId: null, metricName: '', aggType: '', value: '' });
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.snapshotId || !formData.metricName || !formData.aggType) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      if (editingMetric) {
        await fetchAPI(
          `/daily-employee-metrics/${editingMetric.employeeId}/${editingMetric.snapshotId}/${editingMetric.metricName}/${editingMetric.aggType}`,
          { method: 'PUT', body: JSON.stringify({ ...formData, value: Number(formData.value) }) }
        );
        toast.success('Métrica actualizada');
      } else {
        await fetchAPI('/daily-employee-metrics', { method: 'POST', body: JSON.stringify({ ...formData, value: Number(formData.value) }) });
        toast.success('Métrica creada');
      }
      handleCloseDialog();
      loadMetrics();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deletingMetric) return;
    setSubmitting(true);
    try {
      await fetchAPI(
        `/daily-employee-metrics/${deletingMetric.employeeId}/${deletingMetric.snapshotId}/${deletingMetric.metricName}/${deletingMetric.aggType}`,
        { method: 'DELETE' }
      );
      toast.success('Métrica eliminada');
      setDeletingMetric(null);
      loadMetrics();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar');
    } finally { setSubmitting(false); }
  };

  const filteredMetrics = metrics.filter(m =>
    m.employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.metricName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.aggType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-64 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      <p className="text-gray-400">Cargando métricas...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Métricas Diarias</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra métricas de empleados por snapshot
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={loadMetrics} className="bg-slate-800 hover:bg-slate-700 text-white">
            <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
          </Button>
          <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Nueva Métrica
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por empleado, métrica o tipo de agregación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics List */}
      <div className="space-y-4">
        {filteredMetrics.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No se encontraron métricas</p>
        ) : (
          filteredMetrics.map(metric => (
            <Card key={`${metric.employeeId}-${metric.snapshotId}-${metric.metricName}-${metric.aggType}`} className="bg-slate-800/50 border-white/10 flex justify-between items-center p-4">
              <div>
                <p className="text-white font-semibold">{metric.employee?.firstName} {metric.employee?.lastName} ({metric.employee?.email})</p>
                <p className="text-gray-400 text-sm">{metric.metricName} [{metric.aggType}] = {metric.value}</p>
                {metric.snapshot && <Badge className="mt-1 bg-blue-500/20 text-blue-300 border-blue-500/30">{new Date(metric.snapshot.date).toLocaleDateString()}</Badge>}
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" onClick={() => handleOpenDialog(metric)}><Edit className="w-4 h-4 text-blue-400" /></Button>
                <Button variant="ghost" onClick={() => setDeletingMetric(metric)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingMetric ? 'Editar Métrica' : 'Nueva Métrica'}</DialogTitle>
            <DialogDescription>Completa los datos del empleado y la métrica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee ID *</Label>
              <Input type="number" value={formData.employeeId || ''} onChange={e => setFormData({ ...formData, employeeId: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Snapshot ID *</Label>
              <Input type="number" value={formData.snapshotId || ''} onChange={e => setFormData({ ...formData, snapshotId: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Métrica *</Label>
              <Input value={formData.metricName} onChange={e => setFormData({ ...formData, metricName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Agregación *</Label>
              <Input value={formData.aggType} onChange={e => setFormData({ ...formData, aggType: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Valor *</Label>
              <Input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit}>{submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4 mr-2" />} {editingMetric ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletingMetric} onOpenChange={() => setDeletingMetric(null)}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
          </DialogHeader>
          <p className="py-4 text-gray-300">¿Deseas eliminar la métrica de {deletingMetric?.employee?.firstName} {deletingMetric?.employee?.lastName}?</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDeletingMetric(null)}>Cancelar</Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">{submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4 mr-2" />} Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
