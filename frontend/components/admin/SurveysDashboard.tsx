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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileText,
  Plus,
  Trash2,
  Search,
  Loader2,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  RefreshCw,
  ListChecks,
  X,
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

interface GroupOption {
  id: number;
  name: string;
  description?: string;
}

interface QuestionI18n {
  locale: string;
  text: string;
}

interface QuestionOption {
  id: number;
  group?: {
    id: number;
    name: string;
  };
  groupId?: number | null;
  i18nTexts?: QuestionI18n[];
}

interface SurveyFormData {
  groupId: number | null;
  questionIds: number[];
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

const getQuestionGroupId = (question?: QuestionOption) => {
  if (!question) return null;
  return question.group?.id ?? question.groupId ?? null;
};

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
  onDelete 
}: { 
  survey: Survey; 
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
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSurvey, setDeletingSurvey] = useState<Survey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SurveyFormData>({
    groupId: null,
    questionIds: [],
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '18:00',
  });
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);

  const questionLookup = useMemo(() => {
    const map = new Map<number, QuestionOption>();
    questions.forEach((question) => {
      map.set(question.id, question);
    });
    return map;
  }, [questions]);

  const defaultQuestions = useMemo(
    () => questions.filter((question) => getQuestionGroupId(question) == null),
    [questions]
  );

  const groupSpecificQuestions = useMemo(() => {
    if (!formData.groupId) return [];
    return questions.filter((question) => getQuestionGroupId(question) === formData.groupId);
  }, [questions, formData.groupId]);

  const visibleQuestions = useMemo(() => {
    const map = new Map<number, QuestionOption>();
    defaultQuestions.forEach((question) => map.set(question.id, question));
    groupSpecificQuestions.forEach((question) => map.set(question.id, question));
    return Array.from(map.values());
  }, [defaultQuestions, groupSpecificQuestions]);

  const getQuestionLabel = useCallback((question?: QuestionOption) => {
    if (!question) return '';
    return (
      question.i18nTexts?.find((txt) => ['es-MX', 'es'].includes(txt.locale))?.text ||
      question.i18nTexts?.[0]?.text ||
      `Pregunta ${question.id}`
    );
  }, []);

  const filteredQuestions = useMemo(() => {
    const search = questionSearch.trim().toLowerCase();
    if (!search) {
      return visibleQuestions;
    }

    return visibleQuestions.filter((question) => {
      const label = getQuestionLabel(question).toLowerCase();
      return (
        label.includes(search) ||
        question.id.toString().includes(search)
      );
    });
  }, [questionSearch, visibleQuestions, getQuestionLabel]);

  const questionSummary = useMemo(() => {
    if (formData.questionIds.length === 0) return 'Seleccionar preguntas';
    return `${formData.questionIds.length} pregunta${formData.questionIds.length === 1 ? '' : 's'} seleccionadas`;
  }, [formData.questionIds]);

  const toggleQuestion = useCallback((questionId: number) => {
    setFormData((prev) => {
      const exists = prev.questionIds.includes(questionId);
      return {
        ...prev,
        questionIds: exists
          ? prev.questionIds.filter((id) => id !== questionId)
          : [...prev.questionIds, questionId],
      };
    });
  }, []);

  // Load data
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [surveysData, groupsData, questionsData, questionsI18nData] = await Promise.all([
        fetchAPI('/indiv-survey-scores'),
        fetchAPI('/groups'),
        fetchAPI('/questions'),
        fetchAPI('/question-i18n'),
      ]);

      // Validar y limpiar datos de encuestas
      const validatedSurveys = surveysData.map((survey: any) => ({
        ...survey,
        survey: survey.survey || { id: 0, name: survey.name || 'Encuesta sin nombre' },
        employee: survey.employee || { 
          id: 0, 
          firstName: 'Empleado', 
          lastName: 'No disponible', 
          email: 'no-email@example.com' 
        },
        indivScore: survey.indivScore || 0,
        submittedAt: survey.submittedAt || new Date().toISOString(),
      }));

      const questionMap = new Map<number, QuestionOption>();

      questionsData.forEach((question: QuestionOption) => {
        questionMap.set(question.id, {
          ...question,
          group: question.group
            ? { id: question.group.id, name: question.group.name }
            : question.groupId
            ? { id: question.groupId, name: `Grupo ${question.groupId}` }
            : undefined,
          groupId: getQuestionGroupId(question),
          i18nTexts: question.i18nTexts || [],
        });
      });

      questionsI18nData.forEach((entry: any) => {
        const targetLocale = entry.locale || entry.language || 'es';
        const questionId = entry.questionId ?? entry.id_question ?? entry.question?.id;
        if (!questionId) {
          return;
        }

        const existing = questionMap.get(questionId);
        const textEntry = { locale: targetLocale, text: entry.text };

        if (existing) {
          const existingLocales = new Set(existing.i18nTexts?.map((txt) => txt.locale));
          if (!existingLocales.has(targetLocale)) {
            existing.i18nTexts = [...(existing.i18nTexts || []), textEntry];
          }
        } else {
          questionMap.set(questionId, {
            id: questionId,
            group: entry.question?.group
              ? { id: entry.question.group.id, name: entry.question.group.name }
              : undefined,
            groupId: entry.question?.group?.id ?? null,
            i18nTexts: [textEntry],
          });
        }
      });

      const mergedQuestions = Array.from(questionMap.values()).sort((a, b) => a.id - b.id);

      setSurveys(validatedSurveys);
      setGroups(groupsData);
      setQuestions(mergedQuestions);
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

  const resetForm = useCallback(() => {
    setFormData({
      groupId: null,
      questionIds: [],
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '18:00',
    });
    setIsQuestionPickerOpen(false);
    setQuestionSearch('');
  }, []);

  const handleOpenDialog = useCallback(() => {
    resetForm();
    setIsDialogOpen(true);
  }, [resetForm]);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Ingresa un nombre para la encuesta');
      return;
    }

    if (!formData.groupId) {
      toast.error('Selecciona un grupo');
      return;
    }

    if (formData.questionIds.length === 0) {
      toast.error('Selecciona al menos una pregunta');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Selecciona fechas de inicio y fin');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Selecciona horarios de inicio y fin');
      return;
    }

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      toast.error('Fechas u horas inválidas');
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error('La fecha/hora de fin debe ser posterior a la de inicio');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        groupId: formData.groupId,
        questionIds: formData.questionIds,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
      };

      await fetchAPI('/group-survey-scores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast.success('Encuesta creada exitosamente');
      handleCloseDialog();
      loadData(true);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar encuesta');
      console.error('Error saving survey:', error);
    } finally {
      setSubmitting(false);
    }
  }, [formData.groupId, formData.questionIds, formData.startDate, handleCloseDialog, loadData]);

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
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsDialogOpen(true);
          } else {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span>Nueva Encuesta</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Completa los datos para registrar una nueva encuesta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="surveyName" className="text-gray-300">
                Nombre *
              </Label>
              <Input
                id="surveyName"
                placeholder="Ej: Evaluación semanal de bienestar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupId" className="text-gray-300">
                ID de Grupo *
              </Label>
              <Select
                value={formData.groupId?.toString() || ''}
                onValueChange={(value) => {
                  const groupId = parseInt(value, 10);
                  const groupQuestionsForValue = questions.filter(
                    (question) => getQuestionGroupId(question) === groupId
                  );
                  const allowedIds = new Set(
                    [...defaultQuestions, ...groupQuestionsForValue].map((question) => question.id)
                  );
                  setFormData((prev) => ({
                    ...prev,
                    groupId,
                    questionIds: prev.questionIds.filter((id) => allowedIds.has(id)),
                  }));
                }}
              >
                <SelectTrigger id="groupId" className="bg-slate-800/50 border-white/10 text-white">
                  <SelectValue placeholder="Seleccionar grupo" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      {group.name} (ID: {group.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">
                Preguntas Disponibles *
              </Label>
              <Popover open={isQuestionPickerOpen} onOpenChange={setIsQuestionPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                  >
                    <span>{questionSummary}</span>
                    <ListChecks className="w-4 h-4 text-purple-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] bg-slate-900 border-white/10 text-white" align="start">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        autoFocus
                        placeholder="Buscar pregunta..."
                        value={questionSearch}
                        onChange={(e) => setQuestionSearch(e.target.value)}
                        className="pl-10 bg-slate-800/70 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                      {filteredQuestions.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">
                          No se encontraron preguntas
                        </p>
                      ) : (
                        filteredQuestions.map((question) => {
                          const label = getQuestionLabel(question);
                          const selected = formData.questionIds.includes(question.id);
                          return (
                            <button
                              key={question.id}
                              type="button"
                              onClick={() => toggleQuestion(question.id)}
                              className="w-full text-left flex items-start gap-3 rounded-lg px-3 py-2 bg-slate-800/40 border border-white/5 hover:border-purple-500/40 transition-colors"
                            >
                              <Checkbox
                                checked={selected}
                                onCheckedChange={() => toggleQuestion(question.id)}
                                className="mt-1 border-white/30 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm text-white">{label}</span>
                                <span className="text-xs text-gray-400">
                                  ID: {question.id}
                                  {question.group?.name ? ` • Grupo: ${question.group.name}` : ''}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {formData.questionIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.questionIds.map((questionId) => {
                    const question = questionLookup.get(questionId);
                    const label = getQuestionLabel(question) || `Pregunta ${questionId}`;
                    return (
                      <Badge
                        key={questionId}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-200 border-purple-500/40 flex items-center gap-1"
                      >
                        {label}
                        <button
                          type="button"
                          onClick={() => toggleQuestion(questionId)}
                          className="hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-gray-300">
                  Fecha de Inicio *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-gray-300">
                  Hora de Inicio *
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-purple-500/50"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-gray-300">
                  Fecha de Fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">
                  Hora de Fin *
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="bg-slate-800/50 border-white/10 text-white focus:border-purple-500/50"
                />
              </div>
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
                  Crear Encuesta
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