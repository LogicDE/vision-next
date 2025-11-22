'use client';

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Group {
  id: number;
  name: string;
  manager?: GroupManager;
}

interface Event {
  id: number;
  titleMessage: string;
  bodyMessage: string;
  coordinatorName?: string;
  startAt?: string;
  endAt?: string;
  group?: Group;
}

interface EventFormData {
  enterpriseId: number | null;
  groupId: number | null;
  titleMessage: string;
  bodyMessage: string;
  coordinatorName: string;
  startAt: string;
  endAt: string;
}

const PAGE_SIZE = 10;

export function EventsDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<Event | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedEnterprise, setExpandedEnterprise] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [eventPage, setEventPage] = useState<Map<number, number>>(new Map());
  const EVENTS_PER_PAGE = 10;
  const [enterprisePopoverOpen, setEnterprisePopoverOpen] = useState(false);
  const [groupPopoverOpen, setGroupPopoverOpen] = useState(false);
  const [enterpriseSearch, setEnterpriseSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [enterpriseInvalid, setEnterpriseInvalid] = useState(false);
  const [groupInvalid, setGroupInvalid] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const enterpriseInputRef = useRef<HTMLInputElement>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<EventFormData>({
    enterpriseId: null,
    groupId: null,
    titleMessage: '',
    bodyMessage: '',
    coordinatorName: '',
    startAt: '',
    endAt: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const UNASSIGNED_ENTERPRISE_ID = -1;

  const enterpriseNameMap = useMemo(
    () => new Map(enterprises.map((enterprise) => [enterprise.id, enterprise.name])),
    [enterprises],
  );

  const groupMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups],
  );

  const getEnterpriseMetaForGroup = (group?: Group) => {
    const enterpriseId = group?.manager?.enterprise?.id ?? UNASSIGNED_ENTERPRISE_ID;
    const enterpriseName =
      enterpriseNameMap.get(enterpriseId) ??
      group?.manager?.enterprise?.name ??
      (enterpriseId === UNASSIGNED_ENTERPRISE_ID ? 'Sin empresa asignada' : 'Empresa sin nombre');

    return { id: enterpriseId, name: enterpriseName };
  };

  const getGroupFromEvent = (event: Event): Group | undefined => {
    if (event.group?.id && groupMap.has(event.group.id)) {
      return groupMap.get(event.group.id);
    }
    return event.group;
  };

  const getEnterpriseMetaForEvent = (event: Event) => getEnterpriseMetaForGroup(getGroupFromEvent(event));

  const formatDateTime = (value?: string) =>
    value
      ? new Date(value).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
      : 'Sin definir';

  const toInputDateTimeValue = (value?: string) => {
    if (!value) return '';
    const d = new Date(value);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

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
  }, [enterprises, groups]);

  const getGroupsForEnterprise = (enterpriseId: number | null) =>
    groups.filter((group) => getEnterpriseMetaForGroup(group).id === (enterpriseId ?? UNASSIGNED_ENTERPRISE_ID));

  const getFirstGroupIdForEnterprise = (enterpriseId: number | null) => {
    const availableGroups = getGroupsForEnterprise(enterpriseId);
    return availableGroups.length ? availableGroups[0].id : null;
  };

  const groupMatchesSearch = (group: Group) => {
    if (!normalizedSearch) return true;
    const meta = getEnterpriseMetaForGroup(group);
    return (
      group.name.toLowerCase().includes(normalizedSearch) ||
      meta.name.toLowerCase().includes(normalizedSearch)
    );
  };

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
      const [enterprisesData, groupsData, eventsData] = await Promise.all([
        fetchAPI('/enterprises'),
        fetchAPI('/groups'),
        fetchAPI('/events'),
      ]);
      setEnterprises(enterprisesData);
      setGroups(groupsData);
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
    const fallbackEnterpriseId = enterpriseOptions[0]?.id ?? null;
    if (event) {
      const enterpriseMeta = getEnterpriseMetaForEvent(event);
      const enterpriseId = enterpriseMeta.id ?? fallbackEnterpriseId;
      setEditingEvent(event);
      setFormData({
        enterpriseId,
        groupId: event.group?.id ?? getFirstGroupIdForEnterprise(enterpriseId),
        titleMessage: event.titleMessage,
        bodyMessage: event.bodyMessage || '',
        coordinatorName: event.coordinatorName || '',
        startAt: toInputDateTimeValue(event.startAt),
        endAt: toInputDateTimeValue(event.endAt),
      });
    } else {
      setEditingEvent(null);
      const enterpriseId = fallbackEnterpriseId;
      setFormData({
        enterpriseId,
        groupId: getFirstGroupIdForEnterprise(enterpriseId),
        titleMessage: '',
        bodyMessage: '',
        coordinatorName: '',
        startAt: '',
        endAt: '',
      });
    }
    setEnterpriseInvalid(false);
    setGroupInvalid(false);
    setEnterpriseSearch('');
    setGroupSearch('');
    setEnterprisePopoverOpen(false);
    setGroupPopoverOpen(false);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    const enterpriseId = enterpriseOptions[0]?.id ?? null;
    setFormData({
      enterpriseId,
      groupId: getFirstGroupIdForEnterprise(enterpriseId),
      titleMessage: '',
      bodyMessage: '',
      coordinatorName: '',
      startAt: '',
      endAt: '',
    });
    setEnterpriseInvalid(false);
    setGroupInvalid(false);
    setEnterpriseSearch('');
    setGroupSearch('');
    setEnterprisePopoverOpen(false);
    setGroupPopoverOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.titleMessage.trim() || !formData.enterpriseId || !formData.groupId) {
      toast.error('Título, empresa y grupo son requeridos');
      return;
    }

    const toIsoString = (value?: string) => {
      if (!value) return undefined;
      const date = new Date(value);
      return date.toISOString();
    };

    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      const { enterpriseId, ...rest } = formData;
      const payload = {
        ...rest,
        startAt: toIsoString(rest.startAt),
        endAt: toIsoString(rest.endAt),
      };

      if (editingEvent) {
        await fetchAPI(`/events/${editingEvent.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Evento actualizado exitosamente');
      } else {
        await fetchAPI('/events', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Evento creado exitosamente');
      }
      handleCloseDialog();
      await loadData();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
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
    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      await fetchAPI(`/events/${deletingEvent.id}`, { method: 'DELETE' });
      toast.success('Evento eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingEvent(null);
      await loadData();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar evento');
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleGroupSelect = (id: number) => {
    setFormData((prev) => ({ ...prev, groupId: id }));
    setGroupPopoverOpen(false);
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

  const handleGroupInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (filteredGroupOptions.length === 0) {
        setGroupInvalid(true);
      } else {
        handleGroupSelect(filteredGroupOptions[0].id);
      }
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredEvents = events.filter((event) => {
    if (!normalizedSearch) return true;
    const enterpriseMeta = getEnterpriseMetaForEvent(event);
    const groupName = getGroupFromEvent(event)?.name;
    return [
      event.titleMessage,
      event.bodyMessage,
      event.coordinatorName,
      groupName,
      enterpriseMeta.name,
    ].some((field) => field?.toLowerCase().includes(normalizedSearch));
  });

  const hierarchy = useMemo(() => {
    const enterpriseBuckets = new Map<
      number,
      {
        enterprise: { id: number; name: string };
        groups: Map<number, { group: Group; events: Event[] }>;
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

    const ensureGroup = (bucket: { groups: Map<number, { group: Group; events: Event[] }> }, group: Group) => {
      if (!bucket.groups.has(group.id)) {
        bucket.groups.set(group.id, { group, events: [] });
      }
      return bucket.groups.get(group.id)!;
    };

    groups.forEach((group) => {
      if (!groupMatchesSearch(group)) return;
      const meta = getEnterpriseMetaForGroup(group);
      const bucket = ensureEnterprise(meta.id, meta.name);
      ensureGroup(bucket, group);
    });

    filteredEvents.forEach((event) => {
      const groupData = getGroupFromEvent(event);
      if (!groupData) return;
      const meta = getEnterpriseMetaForGroup(groupData);
      const bucket = ensureEnterprise(meta.id, meta.name);
      const node = ensureGroup(bucket, groupData);
      node.events.push(event);
    });

    return Array.from(enterpriseBuckets.values())
      .map((bucket) => ({
        enterprise: bucket.enterprise,
        groups: Array.from(bucket.groups.values()).map((groupNode) => ({
          group: groupNode.group,
          events: groupNode.events,
        })),
      }))
      .filter((entry) => entry.groups.length > 0)
      .sort((a, b) => a.enterprise.name.localeCompare(b.enterprise.name));
  }, [filteredEvents, groups]);

  useEffect(() => {
    const totalPagesForData = Math.max(1, Math.ceil(Math.max(hierarchy.length, 1) / PAGE_SIZE));
    setCurrentPage((prev) => Math.min(prev, totalPagesForData));
  }, [hierarchy.length]);

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

  const paginatedHierarchy = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return hierarchy.slice(start, start + PAGE_SIZE);
  }, [hierarchy, currentPage]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterpriseOptions, groups]);

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
              placeholder="Buscar por título, coordinador, grupo o empresa..."
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
              {hierarchy.length} empresas
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Explora empresas, grupos y sus eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hierarchy.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-center max-w-md">
                {events.length === 0
                  ? 'No hay eventos registrados todavía. Crea el primero para comenzar a organizarlos por empresa y grupo.'
                  : 'No se encontraron resultados que coincidan con la búsqueda aplicada.'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedHierarchy.map(({ enterprise, groups }) => {
                  const isEnterpriseExpanded = expandedEnterprise === enterprise.id;
                  const enterpriseEventCount = groups.reduce((acc, g) => acc + g.events.length, 0);

                  return (
                    <div
                      key={enterprise.id}
                      className="rounded-xl border border-white/10 bg-slate-800/40 shadow-lg shadow-black/20"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleEnterprise(enterprise.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{enterprise.name}</p>
                            <p className="text-xs text-gray-400">
                              ID: {enterprise.id === UNASSIGNED_ENTERPRISE_ID ? 'N/A' : enterprise.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-xs">
                            {groups.length} grupos
                          </Badge>
                          <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 text-xs">
                            {enterpriseEventCount} eventos
                          </Badge>
                          <span
                            className={`p-1 rounded-full border border-white/10 text-white transition-transform ${
                              isEnterpriseExpanded ? 'rotate-90' : ''
                            }`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </button>

                      {isEnterpriseExpanded && (
                        <div className="px-6 pb-6 space-y-3">
                          {groups.map(({ group, events }) => {
                            const isGroupExpanded = expandedGroup === group.id;
                            return (
                              <div
                                key={group.id}
                                className="ml-4 border border-white/5 rounded-lg bg-slate-900/40 overflow-hidden"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleToggleGroup(group.id)}
                                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center">
                                      <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-white">{group.name}</p>
                                      <p className="text-xs text-gray-400">ID: {group.id}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-xs">
                                      {events.length} eventos
                                    </Badge>
                                    {events.length === 0 && (
                                      <Badge variant="outline" className="text-xs border-white/10 text-gray-300">
                                        Sin eventos
                                      </Badge>
                                    )}
                                    <span
                                      className={`p-1 rounded-full border border-white/10 text-white transition-transform ${
                                        isGroupExpanded ? 'rotate-180' : ''
                                      }`}
                                    >
                                      {isGroupExpanded ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </span>
                                  </div>
                                </button>

                                {isGroupExpanded && (
                                  <div className="px-4 pb-4 space-y-3">
                                    {events.length === 0 ? (
                                      <div className="text-sm text-gray-400">
                                        Este grupo aún no tiene eventos registrados.
                                      </div>
                                    ) : (() => {
                                      const currentEventPage = eventPage.get(group.id) || 1;
                                      const eventStart = (currentEventPage - 1) * EVENTS_PER_PAGE;
                                      const eventEnd = eventStart + EVENTS_PER_PAGE;
                                      const paginatedEvents = events.slice(eventStart, eventEnd);
                                      const totalEventPages = Math.ceil(events.length / EVENTS_PER_PAGE);
                                      
                                      return (
                                        <>
                                          {paginatedEvents.map((event) => (
                                            <div
                                              key={event.id}
                                              className="border border-white/5 rounded-lg p-4 bg-slate-950/60 flex flex-col md:flex-row md:items-center gap-4"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h4 className="font-semibold text-white text-lg truncate">
                                                    {event.titleMessage}
                                                  </h4>
                                                  <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                                    ID: {event.id}
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-gray-300 line-clamp-2">
                                                  {event.bodyMessage}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-xs">
                                                    Coordinador: {event.coordinatorName || 'Sin definir'}
                                                  </Badge>
                                                  <Badge className="bg-teal-500/20 text-teal-200 border-teal-500/30 text-xs">
                                                    Inicio: {formatDateTime(event.startAt)}
                                                  </Badge>
                                                  <Badge className="bg-teal-500/20 text-teal-200 border-teal-500/30 text-xs">
                                                    Fin: {formatDateTime(event.endAt)}
                                                  </Badge>
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-2 md:self-start">
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
                                          ))}
                                          {events.length > EVENTS_PER_PAGE && (
                                            <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                              <p className="text-xs text-gray-400">
                                                Mostrando {eventStart + 1}-{Math.min(eventEnd, events.length)} de {events.length} eventos
                                              </p>
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => setEventPage(prev => {
                                                    const newMap = new Map(prev);
                                                    newMap.set(group.id, Math.max(1, currentEventPage - 1));
                                                    return newMap;
                                                  })}
                                                  disabled={currentEventPage === 1}
                                                  className="border-white/10 bg-slate-800 text-white hover:bg-slate-700 text-xs h-7"
                                                >
                                                  <ChevronLeft className="w-3 h-3" />
                                                </Button>
                                                <span className="text-xs text-gray-300">
                                                  {currentEventPage} / {totalEventPages}
                                                </span>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => setEventPage(prev => {
                                                    const newMap = new Map(prev);
                                                    newMap.set(group.id, Math.min(totalEventPages, currentEventPage + 1));
                                                    return newMap;
                                                  })}
                                                  disabled={currentEventPage === totalEventPages}
                                                  className="border-white/10 bg-slate-800 text-white hover:bg-slate-700 text-xs h-7"
                                                >
                                                  <ChevronRight className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
            </>
          )}
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
              <Label htmlFor="enterprise" className="text-gray-300">Empresa *</Label>
              <Popover open={enterprisePopoverOpen} onOpenChange={setEnterprisePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={enterprisePopoverOpen}
                    disabled={enterpriseOptions.length === 0}
                    className={`w-full justify-between bg-slate-800/50 text-white ${
                      enterpriseInvalid ? 'border-red-500/60' : 'border-white/10'
                    }`}
                    onKeyDown={handleEnterpriseTriggerKeyDown}
                  >
                    <span className="truncate">
                      {enterpriseOptions.length ? selectedEnterpriseLabel : 'No hay empresas disponibles'}
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
              {enterpriseInvalid && (
                <p className="text-xs text-red-400">Opción inválida. Selecciona una empresa existente.</p>
              )}
              {enterpriseOptions.length === 0 && (
                <p className="text-xs text-red-400">No hay empresas disponibles.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group" className="text-gray-300">Grupo *</Label>
              <Popover open={groupPopoverOpen} onOpenChange={setGroupPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={groupPopoverOpen}
                    disabled={availableGroups.length === 0}
                    className={`w-full justify-between bg-slate-800/50 text-white ${
                      groupInvalid ? 'border-red-500/60' : 'border-white/10'
                    }`}
                    onKeyDown={handleGroupTriggerKeyDown}
                  >
                    <span className="truncate">{selectedGroupLabel}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-slate-900 text-white border border-white/10" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar grupo..."
                      value={groupSearch}
                      onValueChange={(value) => setGroupSearch(value)}
                      onKeyDown={handleGroupInputKeyDown}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                        ref={groupInputRef}
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredGroupOptions.map((group) => (
                          <CommandItem
                            key={group.id}
                            value={`${group.name.toLowerCase()}-${group.id}`}
                            onSelect={() => handleGroupSelect(group.id)}
                          >
                            {group.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {groupInvalid && (
                <p className="text-xs text-red-400">Opción inválida. Selecciona un grupo existente.</p>
              )}
              {availableGroups.length === 0 && (
                <p className="text-xs text-red-400">No hay grupos disponibles para la empresa seleccionada.</p>
              )}
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
