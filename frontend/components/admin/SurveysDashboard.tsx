'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  BarChart3,
  User,
  RefreshCw
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

// Types
interface Survey {
  id: number;
  survey: {
    id: number;
    name: string;
    description?: string;
  };
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  submittedAt: string;
  indivScore: number;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

interface GroupSurvey {
  id: number;
  name: string;
  description?: string;
}

interface SurveyFormData {
  surveyId: number | null;
  employeeId: number | null;
  indivScore: number;
  submittedAt: string;
}

// Loading Component
const LoadingState = memo(() => (
  <div className="flex flex-col justify-center items-center h-64 space-y-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <FileText className="w-6 h-6 text-purple-400 animate-pulse" />
      </div>
    </div>
    <p className="text-gray-400 animate-pulse">Cargando encuestas...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Survey Card Component
const SurveyCard = memo(({ 
  survey, 
  onEdit, 
  onDelete 
}: { 
  survey: Survey; 
  onEdit: (survey: Survey) => void; 
  onDelete: (survey: Survey) => void;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex items-center space-x-4 flex-1">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getScoreColor(survey.indivScore)} flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform`}>
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-white">{survey.survey?.name || 'Encuesta sin nombre'}</h4>
            <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
              ID: {survey.id}
            </Badge>
          </div>
          <p className="text-sm text-gray-400 truncate mb-2">
            {survey.employee?.firstName || 'Nombre'} {survey.employee?.lastName || 'No disponible'}
          </p>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <Badge className={`${getScoreBadge(survey.indivScore)} text-xs`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              Score: {survey.indivScore}
            </Badge>
            <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(survey.submittedAt).toLocaleDateString('es-MX')}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(survey)}
          className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(survey)}
          className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

SurveyCard.displayName = 'SurveyCard';

export function SurveysDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groupSurveys, setGroupSurveys] = useState<GroupSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [deletingSurvey, setDeletingSurvey] = useState<Survey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SurveyFormData>({
    surveyId: null,
    employeeId: null,
    indivScore: 0,
    submittedAt: new Date().toISOString().split('T')[0],
  });

  // Load data
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [surveysData, employeesData, groupSurveysData] = await Promise.all([
        fetchAPI('/indiv-survey-scores'),
        fetchAPI('/employees'),
        fetchAPI('/group-survey-scores'), // Cambié esto de '/group-survey-scores' a '/group-surveys'
      ]);

      // Validar y limpiar datos de encuestas
      const validatedSurveys = surveysData.map((survey: any) => ({
        ...survey,
        survey: survey.survey || { id: 0, name: 'Encuesta sin nombre' },
        employee: survey.employee || { 
          id: 0, 
          firstName: 'Empleado', 
          lastName: 'No disponible', 
          email: 'no-email@example.com' 
        },
        indivScore: survey.indivScore || 0,
        submittedAt: survey.submittedAt || new Date().toISOString(),
      }));

      setSurveys(validatedSurveys);
      setEmployees(employeesData.filter((emp: Employee) => emp.username));
      setGroupSurveys(groupSurveysData);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // Memoized filtered surveys - CORREGIDO con optional chaining
  const filteredSurveys = useMemo(() => 
    surveys.filter((survey) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        survey.survey?.name?.toLowerCase().includes(searchLower) ||
        survey.employee?.firstName?.toLowerCase().includes(searchLower) ||
        survey.employee?.lastName?.toLowerCase().includes(searchLower) ||
        survey.employee?.email?.toLowerCase().includes(searchLower)
      );
    }),
    [surveys, searchTerm]
  );

  // Memoized stats
  const stats = useMemo(() => {
    const avgScore = surveys.length > 0
      ? surveys.reduce((acc, s) => acc + s.indivScore, 0) / surveys.length
      : 0;

    const uniqueEmployees = new Set(surveys.map(s => s.employee?.id).filter(Boolean)).size;

    return {
      total: surveys.length,
      avgScore: avgScore.toFixed(1),
      uniqueEmployees,
    };
  }, [surveys]);

  const handleOpenDialog = useCallback((survey?: Survey) => {
    if (survey) {
      setEditingSurvey(survey);
      setFormData({
        surveyId: survey.survey?.id || null,
        employeeId: survey.employee?.id || null,
        indivScore: survey.indivScore,
        submittedAt: new Date(survey.submittedAt).toISOString().split('T')[0],
      });
    } else {
      setEditingSurvey(null);
      setFormData({
        surveyId: null,
        employeeId: null,
        indivScore: 0,
        submittedAt: new Date().toISOString().split('T')[0],
      });
    }
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSurvey(null);
    setFormData({
      surveyId: null,
      employeeId: null,
      indivScore: 0,
      submittedAt: new Date().toISOString().split('T')[0],
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.surveyId || !formData.employeeId) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    if (formData.indivScore < 0 || formData.indivScore > 100) {
      toast.error('El score debe estar entre 0 y 100');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        surveyId: formData.surveyId,
        employeeId: formData.employeeId,
        indivScore: formData.indivScore,
        submittedAt: new Date(formData.submittedAt).toISOString(),
      };

      if (editingSurvey) {
        await fetchAPI(`/indiv-survey-scores/${editingSurvey.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Encuesta actualizada exitosamente');
      } else {
        await fetchAPI('/indiv-survey-scores', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Encuesta creada exitosamente');
      }
      handleCloseDialog();
      loadData(true);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar encuesta');
      console.error('Error saving survey:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData, editingSurvey, handleCloseDialog, loadData]);

  const handleDeleteClick = useCallback((survey: Survey) => {
    setDeletingSurvey(survey);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingSurvey) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/indiv-survey-scores/${deletingSurvey.id}`, {
        method: 'DELETE',
      });
      toast.success('Encuesta eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingSurvey(null);
      loadData(true);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar encuesta');
      console.error('Error deleting survey:', error);
    } finally {
      setSubmitting(false);
    }
  }, [deletingSurvey, loadData]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Gestión de Encuestas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra encuestas individuales y sus resultados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Encuesta
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Encuestas</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Score Promedio</p>
                <p className="text-3xl font-bold text-white">{stats.avgScore}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Empleados Encuestados</p>
                <p className="text-3xl font-bold text-white">{stats.uniqueEmployees}</p>
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
              placeholder="Buscar por encuesta, empleado o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Surveys List */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Encuestas Registradas</span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              {filteredSurveys.length} encuestas
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de encuestas individuales y sus resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSurveys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <FileText className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">
                  {searchTerm ? 'No se encontraron encuestas' : 'No hay encuestas registradas'}
                </p>
              </div>
            ) : (
              filteredSurveys.map((survey) => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onEdit={handleOpenDialog}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span>{editingSurvey ? 'Editar Encuesta' : 'Nueva Encuesta'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingSurvey
                ? 'Actualiza la información de la encuesta'
                : 'Completa los datos para registrar una nueva encuesta'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="surveyId" className="text-gray-300">
                Encuesta Grupal *
              </Label>
              <Select
                value={formData.surveyId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, surveyId: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar encuesta" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {groupSurveys.map((survey) => (
                    <SelectItem key={survey.id} value={survey.id.toString()}>
                      {survey.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-gray-300">
                Empleado *
              </Label>
              <Select
                value={formData.employeeId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, employeeId: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 max-h-60">
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.firstName} {emp.lastName} - {emp.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="indivScore" className="text-gray-300">
                Puntuación Individual (0-100) *
              </Label>
              <Input
                id="indivScore"
                type="number"
                min="0"
                max="100"
                placeholder="Ej: 85"
                value={formData.indivScore}
                onChange={(e) => setFormData({ ...formData, indivScore: parseFloat(e.target.value) || 0 })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submittedAt" className="text-gray-300">
                Fecha de Envío *
              </Label>
              <Input
                id="submittedAt"
                type="date"
                value={formData.submittedAt}
                onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white focus:border-purple-500/50"
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
                  {editingSurvey ? 'Actualizar' : 'Crear Encuesta'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
          
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
              ¿Estás seguro de que deseas eliminar la encuesta de{' '}
              <span className="font-bold text-white">
                {deletingSurvey?.employee?.firstName || 'Empleado'} {deletingSurvey?.employee?.lastName || 'No disponible'}
              </span>
              {' '}en{' '}
              <span className="font-bold text-white">{deletingSurvey?.survey?.name || 'Encuesta sin nombre'}</span>?
            </p>
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
                  Eliminar Encuesta
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}