'use client';

import { KeyboardEvent, useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  ChevronLeft,
  ChevronRight,
  Building2,
  Layers,
  ChevronDown,
  ChevronsUpDown,
  Edit,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

// Types
interface Enterprise {
  id: number;
  name: string;
}

interface GroupManagerEnterprise {
  id: number;
  name: string;
}

interface GroupManager {
  id: number;
  firstName: string;
  lastName: string;
  enterprise?: GroupManagerEnterprise;
}

interface GroupOption {
  id: number;
  name: string;
  manager?: GroupManager;
}

interface GroupSurvey {
  id: number;
  name: string;
  startAt?: string;
  endAt?: string;
  groupScore?: number;
  group?: GroupOption;
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
  enterpriseId: number | null;
  groupId: number | null;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  groupScore: number | '';
  questionIds: number[];
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

export function SurveysDashboard() {
  const PAGE_SIZE = 10;
  const [surveys, setSurveys] = useState<GroupSurvey[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSurvey, setDeletingSurvey] = useState<GroupSurvey | null>(null);
  const [editingSurvey, setEditingSurvey] = useState<GroupSurvey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEnterprise, setExpandedEnterprise] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [enterprisePopoverOpen, setEnterprisePopoverOpen] = useState(false);
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);
  const [enterpriseSearch, setEnterpriseSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [enterpriseInvalid, setEnterpriseInvalid] = useState(false);
  const [groupInvalid, setGroupInvalid] = useState(false);
  const enterpriseInputRef = useRef<HTMLInputElement>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<SurveyFormData>({
    enterpriseId: null,
    groupId: null,
    questionIds: [],
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endDate: new Date().toISOString().split('T')[0],
    endTime: '18:00',
    groupScore: '',
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

  const enterpriseNameMap = useMemo(
    () => new Map(enterprises.map((enterprise) => [enterprise.id, enterprise.name])),
    [enterprises]
  );

  const groupMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups]
  );

  const getEnterpriseMetaForGroup = useCallback(
    (group?: GroupOption) => {
      const enterpriseId = group?.manager?.enterprise?.id ?? UNASSIGNED_ENTERPRISE_ID;
      const enterpriseName =
        enterpriseNameMap.get(enterpriseId) ??
        group?.manager?.enterprise?.name ??
        (enterpriseId === UNASSIGNED_ENTERPRISE_ID ? 'Sin empresa asignada' : 'Empresa sin nombre');
      return { id: enterpriseId, name: enterpriseName };
    },
    [enterpriseNameMap]
  );

  const getGroupFromSurvey = useCallback(
    (survey: GroupSurvey) => {
      if (survey.group?.id && groupMap.has(survey.group.id)) {
        return groupMap.get(survey.group.id);
      }
      return survey.group;
    },
    [groupMap]
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const groupMatchesSearch = useCallback(
    (group: GroupOption) => {
      if (!normalizedSearch) return true;
      const meta = getEnterpriseMetaForGroup(group);
      return (
        group.name.toLowerCase().includes(normalizedSearch) ||
        meta.name.toLowerCase().includes(normalizedSearch)
      );
    },
    [normalizedSearch, getEnterpriseMetaForGroup]
  );

  const filteredSurveys = useMemo(() => {
    if (!normalizedSearch) return surveys;
    return surveys.filter((survey) => {
      const group = getGroupFromSurvey(survey);
      const enterpriseMeta = getEnterpriseMetaForGroup(group);
      return (
        survey.name.toLowerCase().includes(normalizedSearch) ||
        group?.name?.toLowerCase().includes(normalizedSearch) ||
        enterpriseMeta.name.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [surveys, normalizedSearch, getEnterpriseMetaForGroup, getGroupFromSurvey]);

  const enterpriseOptions = useMemo(() => {
    const optionMap = new Map<number, string>();
    enterprises.forEach((enterprise) => optionMap.set(enterprise.id, enterprise.name));
    groups.forEach((group) => {
      const meta = getEnterpriseMetaForGroup(group);
      if (!optionMap.has(meta.id)) {
        optionMap.set(meta.id, meta.name);
      }
    });
    return Array.from(optionMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [enterprises, groups, getEnterpriseMetaForGroup]);

  const getGroupsForEnterprise = useCallback(
    (enterpriseId: number | null) =>
      groups.filter((group) => getEnterpriseMetaForGroup(group).id === (enterpriseId ?? UNASSIGNED_ENTERPRISE_ID)),
    [groups, getEnterpriseMetaForGroup]
  );

  const getFirstGroupIdForEnterprise = useCallback(
    (enterpriseId: number | null) => {
      const available = getGroupsForEnterprise(enterpriseId);
      return available.length ? available[0].id : null;
    },
    [getGroupsForEnterprise]
  );

  const hierarchy = useMemo(() => {
    const enterpriseBuckets = new Map<
      number,
      {
        enterprise: { id: number; name: string };
        groups: Map<number, { group: GroupOption; surveys: GroupSurvey[] }>;
      }
    >();

    const ensureEnterprise = (id: number, name: string) => {
      if (!enterpriseBuckets.has(id)) {
        enterpriseBuckets.set(id, {
          enterprise: { id, name },
          groups: new Map(),
        });
      }
      return enterpriseBuckets.get(id)!;
    };

    const ensureGroup = (
      bucket: { groups: Map<number, { group: GroupOption; surveys: GroupSurvey[] }> },
      group: GroupOption,
    ) => {
      if (!bucket.groups.has(group.id)) {
        bucket.groups.set(group.id, { group, surveys: [] });
      }
      return bucket.groups.get(group.id)!;
    };

    groups.forEach((group) => {
      if (!groupMatchesSearch(group)) return;
      const meta = getEnterpriseMetaForGroup(group);
      const bucket = ensureEnterprise(meta.id, meta.name);
      ensureGroup(bucket, group);
    });

    filteredSurveys.forEach((survey) => {
      const groupData = getGroupFromSurvey(survey);
      if (!groupData) return;
      const meta = getEnterpriseMetaForGroup(groupData);
      const bucket = ensureEnterprise(meta.id, meta.name);
      const node = ensureGroup(bucket, groupData);
      node.surveys.push(survey);
    });

    return Array.from(enterpriseBuckets.values())
      .map((bucket) => ({
        enterprise: bucket.enterprise,
        groups: Array.from(bucket.groups.values()),
      }))
      .filter((entry) => entry.groups.length > 0)
      .sort((a, b) => a.enterprise.name.localeCompare(b.enterprise.name));
  }, [filteredSurveys, groups, groupMatchesSearch, getEnterpriseMetaForGroup, getGroupFromSurvey]);

  const UNASSIGNED_ENTERPRISE_ID = -1;

  // Load data
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [surveysData, groupsData, enterprisesData, questionsData, questionsI18nData] = await Promise.all([
        fetchAPI('/group-survey-scores'),
        fetchAPI('/groups'),
        fetchAPI('/enterprises'),
        fetchAPI('/questions'),
        fetchAPI('/question-i18n'),
      ]);

      const normalizedSurveys: GroupSurvey[] = surveysData.map((survey: any) => ({
        id: survey.id,
        name: survey.name || `Encuesta ${survey.id}`,
        startAt: survey.startAt || survey.start_at || null,
        endAt: survey.endAt || survey.end_at || null,
        groupScore: survey.groupScore ?? survey.group_score ?? null,
        group: survey.group,
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

      setSurveys(normalizedSurveys);
      setGroups(groupsData);
      setEnterprises(enterprisesData);
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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedHierarchy = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return hierarchy.slice(start, start + PAGE_SIZE);
  }, [hierarchy, currentPage]);

  useEffect(() => {
    const totalPagesForData = Math.max(1, Math.ceil(Math.max(hierarchy.length, 1) / PAGE_SIZE));
    setCurrentPage((prev) => Math.min(prev, totalPagesForData));
  }, [hierarchy.length]);

  useEffect(() => {
    if (expandedEnterprise === null) return;
    const visibleIds = new Set(paginatedHierarchy.map((entry) => entry.enterprise.id));
    if (!visibleIds.has(expandedEnterprise)) {
      setExpandedEnterprise(null);
      setExpandedGroup(null);
    }
  }, [paginatedHierarchy, expandedEnterprise]);

  const totalPages = Math.max(1, Math.ceil(Math.max(hierarchy.length, 1) / PAGE_SIZE));
  const pageStart = hierarchy.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = hierarchy.length === 0 ? 0 : Math.min(hierarchy.length, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const avgScore =
      surveys.length > 0
        ? surveys.reduce((acc, s) => acc + (s.groupScore ?? 0), 0) / surveys.length
        : 0;
    const coveredGroups = new Set(surveys.map((s) => s.group?.id).filter(Boolean)).size;
    return {
      total: surveys.length,
      avgScore: avgScore.toFixed(1),
      coveredGroups,
    };
  }, [surveys]);

  const selectedEnterpriseId = formData.enterpriseId ?? enterpriseOptions[0]?.id ?? null;
  const availableGroups = getGroupsForEnterprise(selectedEnterpriseId);
  const selectedEnterpriseLabel =
    enterpriseOptions.find((option) => option.id === selectedEnterpriseId)?.name ??
    (selectedEnterpriseId === UNASSIGNED_ENTERPRISE_ID
      ? 'Sin empresa asignada'
      : 'Seleccionar empresa');
  const selectedGroupLabel =
    availableGroups.find((group) => group.id === formData.groupId)?.name ??
    (availableGroups.length ? 'Seleccionar grupo' : 'Sin grupos disponibles');

  const filteredEnterpriseOptions = useMemo(() => {
    const term = enterpriseSearch.trim().toLowerCase();
    if (!term) return enterpriseOptions;
    return enterpriseOptions.filter((option) => option.name.toLowerCase().includes(term));
  }, [enterpriseOptions, enterpriseSearch]);

  const filteredGroupOptions = useMemo(() => {
    const term = groupSearch.trim().toLowerCase();
    if (!term) return availableGroups;
    return availableGroups.filter((group) => group.name.toLowerCase().includes(term));
  }, [availableGroups, groupSearch]);

  const canCreateSurvey = enterpriseOptions.length > 0 && availableGroups.length > 0;

  useEffect(() => {
    if (!enterprisePopoverOpen) {
      setEnterpriseSearch('');
      setEnterpriseInvalid(false);
      return;
    }
    if (enterpriseSearch.trim() === '') {
      setEnterpriseInvalid(false);
    } else {
      setEnterpriseInvalid(filteredEnterpriseOptions.length === 0);
    }
    requestAnimationFrame(() => enterpriseInputRef.current?.focus());
  }, [enterprisePopoverOpen, enterpriseSearch, filteredEnterpriseOptions.length]);

  useEffect(() => {
    if (!groupPopoverOpen) {
      setGroupSearch('');
      setGroupInvalid(false);
      return;
    }
    if (groupSearch.trim() === '') {
      setGroupInvalid(false);
    } else {
      setGroupInvalid(filteredGroupOptions.length === 0);
    }
    requestAnimationFrame(() => groupInputRef.current?.focus());
  }, [groupPopoverOpen, groupSearch, filteredGroupOptions.length]);

  useEffect(() => {
    setGroupSearch('');
    setGroupInvalid(false);
  }, [selectedEnterpriseId]);

  useEffect(() => {
    setFormData((prev) => {
      let nextEnterpriseId: number | null = prev.enterpriseId ?? enterpriseOptions[0]?.id ?? null;
      if (enterpriseOptions.length === 0) {
        nextEnterpriseId = null;
      }
      const currentGroupList = getGroupsForEnterprise(nextEnterpriseId);
      const hasGroup = prev.groupId != null && currentGroupList.some((group) => group.id === prev.groupId);
      if (nextEnterpriseId === prev.enterpriseId && hasGroup) {
        return prev;
      }
      return {
        ...prev,
        enterpriseId: nextEnterpriseId,
        groupId: hasGroup ? prev.groupId : getFirstGroupIdForEnterprise(nextEnterpriseId),
      };
    });
  }, [enterpriseOptions, getFirstGroupIdForEnterprise, getGroupsForEnterprise]);

  const formatDateTime = (value?: string) =>
    value ? new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Sin definir';

  const handleToggleEnterprise = (enterpriseId: number) => {
    setExpandedEnterprise((prev) => (prev === enterpriseId ? null : enterpriseId));
    setExpandedGroup(null);
  };

  const handleToggleGroup = (groupId: number) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  };

  const handleEnterpriseSelect = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      enterpriseId: id,
      groupId: getFirstGroupIdForEnterprise(id),
    }));
    setEnterprisePopoverOpen(false);
    setEnterpriseSearch('');
    setEnterpriseInvalid(false);
    setGroupSearch('');
    setGroupInvalid(false);
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

  const handleGroupTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (groupPopoverOpen) return;
    if (event.key === 'Enter' || event.key === ' ') {
      setGroupPopoverOpen(true);
      event.preventDefault();
      return;
    }
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      setGroupPopoverOpen(true);
      setGroupSearch(event.key);
      setGroupInvalid(false);
      event.preventDefault();
    }
  };

  const resetForm = useCallback(() => {
    const enterpriseId = enterpriseOptions[0]?.id ?? null;
    setFormData({
      enterpriseId,
      groupId: getFirstGroupIdForEnterprise(enterpriseId),
      questionIds: [],
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endDate: new Date().toISOString().split('T')[0],
      endTime: '18:00',
      groupScore: '',
    });
    setIsQuestionPickerOpen(false);
    setQuestionSearch('');
    setEnterpriseInvalid(false);
    setGroupInvalid(false);
    setEnterpriseSearch('');
    setGroupSearch('');
  }, [enterpriseOptions, getFirstGroupIdForEnterprise]);

  const handleOpenDialog = useCallback(
    (survey?: GroupSurvey) => {
      if (survey) {
        const group = getGroupFromSurvey(survey);
        const enterpriseMeta = getEnterpriseMetaForGroup(group);
        const startDateTime = survey.startAt ? new Date(survey.startAt) : new Date();
        const endDateTime = survey.endAt ? new Date(survey.endAt) : new Date();
        setEditingSurvey(survey);
        setFormData({
          enterpriseId: enterpriseMeta.id,
          groupId: group?.id ?? null,
          questionIds: [],
          name: survey.name,
          startDate: startDateTime.toISOString().split('T')[0],
          startTime: startDateTime.toISOString().slice(11, 16),
          endDate: endDateTime.toISOString().split('T')[0],
          endTime: endDateTime.toISOString().slice(11, 16),
          groupScore: survey.groupScore ?? '',
        });
      } else {
        setEditingSurvey(null);
        resetForm();
      }
      setIsDialogOpen(true);
      setIsQuestionPickerOpen(false);
      setQuestionSearch('');
    },
    [getEnterpriseMetaForGroup, getGroupFromSurvey, resetForm]
  );

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingSurvey(null);
    resetForm();
  }, [resetForm]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      toast.error('Ingresa un nombre para la encuesta');
      return;
    }

    if (!formData.enterpriseId || !formData.groupId) {
      toast.error('Empresa y grupo son requeridos');
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
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        groupScore: formData.groupScore === '' ? undefined : Number(formData.groupScore),
      };

      if (editingSurvey) {
        await fetchAPI(`/group-survey-scores/${editingSurvey.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Encuesta actualizada exitosamente');
      } else {
        await fetchAPI('/group-survey-scores', {
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
  }, [
    editingSurvey,
    formData.enterpriseId,
    formData.groupId,
    formData.groupScore,
    formData.name,
    formData.startDate,
    formData.startTime,
    formData.endDate,
    formData.endTime,
    handleCloseDialog,
    loadData,
  ]);

  const handleDeleteClick = useCallback((survey: GroupSurvey) => {
    setDeletingSurvey(survey);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingSurvey) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/group-survey-scores/${deletingSurvey.id}`, {
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
          disabled={!canCreateSurvey}
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
                <p className="text-sm text-gray-400">Grupos Cubiertos</p>
                <p className="text-3xl font-bold text-white">{stats.coveredGroups}</p>
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
              placeholder="Buscar por encuesta, grupo o empresa..."
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
          {paginatedHierarchy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <FileText className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">
                  {searchTerm ? 'No se encontraron encuestas' : 'No hay encuestas registradas'}
                </p>
              </div>
            ) : (
              paginatedHierarchy.map((entry) => {
              const groupCount = entry.groups.length;
              const surveyCount = entry.groups.reduce((sum, groupNode) => sum + groupNode.surveys.length, 0);
              return (
                <div key={entry.enterprise.id} className="bg-slate-900/40 border border-white/10 rounded-lg p-4 space-y-3">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => handleToggleEnterprise(entry.enterprise.id)}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-purple-300" />
                        <span className="font-semibold text-white">{entry.enterprise.name}</span>
                        <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                          ID: {entry.enterprise.id}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {groupCount} grupo{groupCount === 1 ? '' : 's'}
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                          {surveyCount} encuesta{surveyCount === 1 ? '' : 's'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <span>Ver grupos</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedEnterprise === entry.enterprise.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expandedEnterprise === entry.enterprise.id && (
                    <div className="mt-4 space-y-3">
                      {entry.groups.map((groupNode) => {
                        const surveyTotal = groupNode.surveys.length;
                        return (
                          <div
                            key={groupNode.group.id}
                            className="bg-slate-900/40 border border-white/5 rounded-lg p-3 space-y-3"
                          >
                            <button
                              className="w-full flex items-center justify-between text-left"
                              onClick={() => handleToggleGroup(groupNode.group.id)}
                            >
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Layers className="w-4 h-4 text-amber-300" />
                                  <span className="font-medium text-white">{groupNode.group.name}</span>
                                  <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                    ID: {groupNode.group.id}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">
                                  {groupNode.surveys.length} encuesta{groupNode.surveys.length === 1 ? '' : 's'}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
                                    {surveyTotal} encuesta{surveyTotal === 1 ? '' : 's'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <span>Ver encuestas</span>
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    expandedGroup === groupNode.group.id ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>
                            </button>

                            {expandedGroup === groupNode.group.id && (
                              <div className="mt-3 space-y-2">
                                {groupNode.surveys.length === 0 ? (
                                  <p className="text-sm text-gray-400 pl-2">Sin encuestas registradas</p>
                                ) : (
                                  groupNode.surveys.map((survey) => (
                                    <div
                                      key={survey.id}
                                      className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-900/60 border border-white/10 rounded-lg space-y-3 md:space-y-0"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                          <h4 className="font-semibold text-white">{survey.name}</h4>
                                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                            ID: {survey.id}
                                          </Badge>
                                        </div>
                                        <div className="grid gap-2 text-sm text-gray-300 md:grid-cols-3">
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>Inicio: {formatDateTime(survey.startAt)}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <span>Fin: {formatDateTime(survey.endAt)}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <TrendingUp className="w-4 h-4 text-gray-400" />
                                            <span>Score grupo: {survey.groupScore ?? 'N/D'}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 md:ml-4">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleOpenDialog(survey)}
                                          className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteClick(survey)}
                                          className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-6">
              <p className="text-sm text-gray-400">
                Mostrando{' '}
                {hierarchy.length === 0 ? (
                  '0'
                ) : (
                  <>
                    {pageStart}-{pageEnd}
                  </>
                )}{' '}
                de {hierarchy.length} empresas
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
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open: boolean) => {
          if (open) {
            setIsDialogOpen(true);
          } else {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span>{editingSurvey ? 'Editar Encuesta' : 'Nueva Encuesta'}</span>
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
              <Label className="text-gray-300">Empresa *</Label>
              <Popover open={enterprisePopoverOpen} onOpenChange={setEnterprisePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onKeyDown={handleEnterpriseTriggerKeyDown}
                    className={`w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70 ${
                      enterpriseInvalid ? 'border-red-500/60' : ''
                    }`}
                  >
                    <span>{selectedEnterpriseLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] bg-slate-900 border-white/10 text-white" align="start">
                  <Command>
                    <CommandInput
                      ref={enterpriseInputRef}
                      placeholder="Buscar empresa..."
                      value={enterpriseSearch}
                      onValueChange={setEnterpriseSearch}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredEnterpriseOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={`${option.name.toLowerCase()}-${option.id}`}
                            onSelect={() => handleEnterpriseSelect(option.id)}
                          >
                            {option.name}
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
              <Label className="text-gray-300">Grupo *</Label>
              <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onKeyDown={handleGroupTriggerKeyDown}
                    disabled={availableGroups.length === 0}
                    className={`w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70 ${
                      groupInvalid ? 'border-red-500/60' : ''
                    }`}
                  >
                    <span>{selectedGroupLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] bg-slate-900 border-white/10 text-white" align="start">
                  <Command>
                    <CommandInput
                      ref={groupInputRef}
                      placeholder="Buscar grupo..."
                      value={groupSearch}
                      onValueChange={setGroupSearch}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredGroupOptions.map((group) => (
                          <CommandItem
                            key={group.id}
                            value={`${group.name.toLowerCase()}-${group.id}`}
                            onSelect={() => {
                              const groupId = group.id;
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
                              setGroupPopoverOpen(false);
                              setGroupSearch('');
                              setGroupInvalid(false);
                            }}
                          >
                            {group.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {groupInvalid && <p className="text-xs text-red-400">Selecciona un grupo válido</p>}
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
              ¿Estás seguro de que deseas eliminar la encuesta{' '}
              <span className="font-bold text-white">{deletingSurvey?.name || 'Encuesta sin nombre'}</span>?
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