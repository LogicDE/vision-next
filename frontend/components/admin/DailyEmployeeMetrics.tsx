'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Plus, Edit, Trash2, Search, Loader2, CheckCircle, Activity, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Snapshot {
  id: number;
  date: string;
}

interface DailyEmployeeMetric {
  id: number;
  employeeId: number;
  snapshotId: number;
  metricName: string;
  aggType: string;
  value: number;
  employee?: Employee;
  snapshot?: Snapshot;
}

interface DailyEmployeeMetricFormData {
  employeeId: number | null;
  snapshotId: number | null;
  metricName: string;
  aggType: string;
  value: number | '';
}

// Configuración centralizada
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include' as RequestCredentials,
} as const;

const DEBOUNCE_DELAY = 300;
const METRIC_NAME_MAX_LENGTH = 100;
const AGG_TYPE_MAX_LENGTH = 50;

// Hook personalizado para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
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

  // Usar refs para evitar recreación de AbortControllers
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Aplicar debounce al término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, DEBOUNCE_DELAY);

  // Sanitización de inputs
  const sanitizeString = useCallback((str: string, maxLength: number): string => {
    return str.trim().slice(0, maxLength).replace(/[<>]/g, '');
  }, []);

  // Fetch helper con mejor manejo de errores y seguridad
  const fetchAPI = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      // Validar y sanitizar endpoint
      const sanitizedEndpoint = endpoint.replace(/[<>]/g, '');
      
      const res = await fetch(`${API_CONFIG.baseURL}${sanitizedEndpoint}`, {
        credentials: API_CONFIG.credentials,
        headers: { ...API_CONFIG.headers, ...options.headers },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errData.message || `Error HTTP ${res.status}`);
      }

      return res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Solicitud cancelada o expirada');
      }
      console.error('API Error:', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // Cargar métricas con manejo de errores mejorado
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/daily-employee-metrics');
      
      // Validar estructura de datos
      if (!Array.isArray(data)) {
        throw new Error('Formato de respuesta inválido');
      }
      
      setMetrics(data);
    } catch (err: any) {
      if (err.message !== 'Solicitud cancelada o expirada') {
        toast.error(err.message || 'Error al cargar métricas');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  useEffect(() => {
    loadMetrics();
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadMetrics]);

  // Búsqueda optimizada con índice de búsqueda
  const filteredMetrics = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return metrics;

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return metrics.filter(metric => {
      const employeeName = `${metric.employee?.firstName || ''} ${metric.employee?.lastName || ''}`.toLowerCase();
      const metricInfo = `${metric.metricName} ${metric.aggType}`.toLowerCase();
      
      return employeeName.includes(searchLower) || metricInfo.includes(searchLower);
    });
  }, [metrics, debouncedSearchTerm]);

  // Manejo del diálogo
  const handleOpenDialog = useCallback((metric?: DailyEmployeeMetric) => {
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
      setFormData({ 
        employeeId: null, 
        snapshotId: null, 
        metricName: '', 
        aggType: '', 
        value: '' 
      });
    }
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingMetric(null);
    setFormData({ 
      employeeId: null, 
      snapshotId: null, 
      metricName: '', 
      aggType: '', 
      value: '' 
    });
  }, []);

  // Validación exhaustiva del formulario
  const validateForm = useCallback((data: DailyEmployeeMetricFormData): boolean => {
    if (!data.employeeId || data.employeeId <= 0) {
      toast.error('ID de empleado inválido');
      return false;
    }

    if (!data.snapshotId || data.snapshotId <= 0) {
      toast.error('ID de snapshot inválido');
      return false;
    }

    if (!data.metricName.trim()) {
      toast.error('El nombre de la métrica es requerido');
      return false;
    }

    if (data.metricName.length > METRIC_NAME_MAX_LENGTH) {
      toast.error(`El nombre de la métrica no puede exceder ${METRIC_NAME_MAX_LENGTH} caracteres`);
      return false;
    }

    if (!data.aggType.trim()) {
      toast.error('El tipo de agregación es requerido');
      return false;
    }

    if (data.aggType.length > AGG_TYPE_MAX_LENGTH) {
      toast.error(`El tipo de agregación no puede exceder ${AGG_TYPE_MAX_LENGTH} caracteres`);
      return false;
    }

    if (data.value === '' || isNaN(Number(data.value)) || Number(data.value) < 0) {
      toast.error('El valor debe ser un número válido no negativo');
      return false;
    }

    return true;
  }, []);

  // Envío del formulario con sanitización
  const handleSubmit = useCallback(async () => {
    if (!validateForm(formData)) return;

    setSubmitting(true);
    try {
      const payload = { 
        employeeId: formData.employeeId!,
        snapshotId: formData.snapshotId!,
        metricName: sanitizeString(formData.metricName, METRIC_NAME_MAX_LENGTH),
        aggType: sanitizeString(formData.aggType, AGG_TYPE_MAX_LENGTH),
        value: Number(formData.value),
      };

      if (editingMetric) {
        const encodedMetricName = encodeURIComponent(editingMetric.metricName);
        const encodedAggType = encodeURIComponent(editingMetric.aggType);
        
        await fetchAPI(
          `/daily-employee-metrics/${editingMetric.employeeId}/${editingMetric.snapshotId}/${encodedMetricName}/${encodedAggType}`,
          { 
            method: 'PUT', 
            body: JSON.stringify(payload) 
          }
        );
        toast.success('Métrica actualizada correctamente');
      } else {
        await fetchAPI('/daily-employee-metrics', { 
          method: 'POST', 
          body: JSON.stringify(payload) 
        });
        toast.success('Métrica creada correctamente');
      }
      
      handleCloseDialog();
      await loadMetrics();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la métrica');
    } finally { 
      setSubmitting(false); 
    }
  }, [formData, editingMetric, fetchAPI, handleCloseDialog, loadMetrics, validateForm, sanitizeString]);

  // Eliminación con mejor seguridad
  const handleDelete = useCallback(async () => {
    if (!deletingMetric) return;

    setSubmitting(true);
    try {
      const encodedMetricName = encodeURIComponent(deletingMetric.metricName);
      const encodedAggType = encodeURIComponent(deletingMetric.aggType);
      
      await fetchAPI(
        `/daily-employee-metrics/${deletingMetric.employeeId}/${deletingMetric.snapshotId}/${encodedMetricName}/${encodedAggType}`,
        { method: 'DELETE' }
      );
      toast.success('Métrica eliminada correctamente');
      setDeletingMetric(null);
      await loadMetrics();
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la métrica');
    } finally { 
      setSubmitting(false); 
    }
  }, [deletingMetric, fetchAPI, loadMetrics]);

  // Componente de carga
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
        <p className="text-gray-400">Cargando métricas...</p>
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
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Métricas Diarias</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra métricas de empleados por snapshot
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={loadMetrics} 
            className="bg-slate-800 hover:bg-slate-700 text-white"
            disabled={loading}
            aria-label="Actualizar métricas"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
            Actualizar
          </Button>
          <Button 
            onClick={() => handleOpenDialog()} 
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
            aria-label="Crear nueva métrica"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            Nueva Métrica
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por empleado, métrica o tipo de agregación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white"
              maxLength={100}
              aria-label="Buscar métricas"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics List */}
      <div className="space-y-4">
        {filteredMetrics.length === 0 ? (
          <p className="text-gray-400 text-center py-12">
            {debouncedSearchTerm ? 'No se encontraron métricas que coincidan con la búsqueda' : 'No hay métricas disponibles'}
          </p>
        ) : (
          filteredMetrics.map(metric => (
            <MetricCard 
              key={`${metric.employeeId}-${metric.snapshotId}-${metric.metricName}-${metric.aggType}`}
              metric={metric}
              onEdit={handleOpenDialog}
              onDelete={setDeletingMetric}
            />
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <MetricFormDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        editingMetric={editingMetric}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={handleCloseDialog}
        submitting={submitting}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        deletingMetric={deletingMetric}
        setDeletingMetric={setDeletingMetric}
        onSubmit={handleDelete}
        submitting={submitting}
      />
    </div>
  );
}

// Componente para tarjeta de métrica (memoizado para evitar re-renders innecesarios)
interface MetricCardProps {
  metric: DailyEmployeeMetric;
  onEdit: (metric: DailyEmployeeMetric) => void;
  onDelete: (metric: DailyEmployeeMetric) => void;
}

const MetricCard = ({ metric, onEdit, onDelete }: MetricCardProps) => {
  const formattedDate = useMemo(() => 
    metric.snapshot ? new Date(metric.snapshot.date).toLocaleDateString() : 'N/A',
    [metric.snapshot]
  );

  return (
    <Card className="bg-slate-800/50 border-white/10 flex justify-between items-center p-4 hover:bg-slate-800/70 transition-colors">
      <div className="flex-1">
        <p className="text-white font-semibold">
          {metric.employee?.firstName || 'N/A'} {metric.employee?.lastName || ''} 
          {metric.employee?.email && ` (${metric.employee.email})`}
        </p>
        <p className="text-gray-400 text-sm">
          {metric.metricName} [{metric.aggType}] = {metric.value.toFixed(2)}
        </p>
        <Badge className="mt-1 bg-blue-500/20 text-blue-300 border-blue-500/30">
          {formattedDate}
        </Badge>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          onClick={() => onEdit(metric)}
          aria-label="Editar métrica"
        >
          <Edit className="w-4 h-4 text-blue-400" />
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => onDelete(metric)}
          aria-label="Eliminar métrica"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </Button>
      </div>
    </Card>
  );
};

// Componente para el diálogo del formulario
interface MetricFormDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingMetric: DailyEmployeeMetric | null;
  formData: DailyEmployeeMetricFormData;
  setFormData: (data: DailyEmployeeMetricFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}

const MetricFormDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  editingMetric,
  formData,
  setFormData,
  onSubmit,
  onClose,
  submitting
}: MetricFormDialogProps) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      e.preventDefault();
      onSubmit();
    }
  }, [onSubmit, submitting]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{editingMetric ? 'Editar Métrica' : 'Nueva Métrica'}</DialogTitle>
          <DialogDescription>Completa los datos del empleado y la métrica</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID *</Label>
            <Input 
              id="employeeId"
              type="number" 
              min="1"
              value={formData.employeeId || ''} 
              onChange={e => setFormData({ ...formData, employeeId: e.target.value ? Number(e.target.value) : null })}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="snapshotId">Snapshot ID *</Label>
            <Input 
              id="snapshotId"
              type="number" 
              min="1"
              value={formData.snapshotId || ''} 
              onChange={e => setFormData({ ...formData, snapshotId: e.target.value ? Number(e.target.value) : null })}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metricName">Métrica *</Label>
            <Input 
              id="metricName"
              value={formData.metricName} 
              onChange={e => setFormData({ ...formData, metricName: e.target.value })}
              maxLength={METRIC_NAME_MAX_LENGTH}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aggType">Agregación *</Label>
            <Input 
              id="aggType"
              value={formData.aggType} 
              onChange={e => setFormData({ ...formData, aggType: e.target.value })}
              maxLength={AGG_TYPE_MAX_LENGTH}
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valor *</Label>
            <Input 
              id="value"
              type="number" 
              step="0.01"
              min="0"
              value={formData.value} 
              onChange={e => setFormData({ ...formData, value: e.target.value ? Number(e.target.value) : '' })}
              disabled={submitting}
              required
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {editingMetric ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Componente para confirmación de eliminación
interface DeleteConfirmationDialogProps {
  deletingMetric: DailyEmployeeMetric | null;
  setDeletingMetric: (metric: DailyEmployeeMetric | null) => void;
  onSubmit: () => void;
  submitting: boolean;
}

const DeleteConfirmationDialog = ({
  deletingMetric,
  setDeletingMetric,
  onSubmit,
  submitting
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog open={!!deletingMetric} onOpenChange={() => !submitting && setDeletingMetric(null)}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
        </DialogHeader>
        <p className="py-4 text-gray-300">
          ¿Estás seguro de que deseas eliminar la métrica de{' '}
          <strong>{deletingMetric?.employee?.firstName || 'N/A'} {deletingMetric?.employee?.lastName || ''}</strong>?
        </p>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setDeletingMetric(null)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};