'use client';

import { KeyboardEvent, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  Layers,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { getAccessToken } from '@/lib/api';

interface Enterprise {
  id: number;
  name: string;
}

interface GroupManager {
  id: number;
  firstName: string;
  lastName: string;
  enterprise?: Enterprise;
}

interface Group {
  id: number;
  name: string;
  manager?: GroupManager;
}

interface Intervention {
  id: number;
  titleMessage: string;
  bodyMessage: string;
  description: string;
  group?: Group | null;
}

interface InterventionFormData {
  enterpriseId: number | null;
  groupId: number | null;
  titleMessage: string;
  bodyMessage: string;
  description: string;
}

export function InterventionsManagement() {
  const PAGE_SIZE = 10;
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<InterventionFormData>({
    enterpriseId: null,
    groupId: null,
    titleMessage: '',
    bodyMessage: '',
    description: '',
  });
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
  const [currentPage, setCurrentPage] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchAPI = useCallback(async (endpoint: string, options?: RequestInit) => {
    const token = getAccessToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    return res.json();
  }, [API_URL]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsData, enterprisesData, interventionsData] = await Promise.all([
        fetchAPI('/groups'),
        fetchAPI('/enterprises'),
        fetchAPI('/interventions'),
      ]);
      setGroups(groupsData);
      setEnterprises(enterprisesData);
      setInterventions(interventionsData);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  useEffect(() => { loadData(); }, [loadData]);

  const UNASSIGNED_ENTERPRISE_ID = -1;

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const enterpriseNameMap = useMemo(
    () => new Map(enterprises.map((enterprise) => [enterprise.id, enterprise.name])),
    [enterprises]
  );

  const groupMap = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups]
  );

  const getEnterpriseMetaForGroup = useCallback(
    (group?: Group) => {
      const enterpriseId = group?.manager?.enterprise?.id ?? UNASSIGNED_ENTERPRISE_ID;
      const enterpriseName =
        enterpriseNameMap.get(enterpriseId) ??
        group?.manager?.enterprise?.name ??
        (enterpriseId === UNASSIGNED_ENTERPRISE_ID ? 'Sin empresa asignada' : 'Empresa sin nombre');
      return { id: enterpriseId, name: enterpriseName };
    },
    [enterpriseNameMap]
  );

  const getGroupFromIntervention = useCallback(
    (intervention: Intervention) => {
      if (intervention.group?.id && groupMap.has(intervention.group.id)) {
        return groupMap.get(intervention.group.id);
      }
      return intervention.group ?? undefined;
    },
    [groupMap]
  );

  const normalizedSearch = debouncedSearch.trim().toLowerCase();

  const groupMatchesSearch = useCallback(
    (group: Group) => {
      if (!normalizedSearch) return true;
      const meta = getEnterpriseMetaForGroup(group);
      return (
        group.name.toLowerCase().includes(normalizedSearch) ||
        meta.name.toLowerCase().includes(normalizedSearch)
      );
    },
    [normalizedSearch, getEnterpriseMetaForGroup]
  );

  const filteredInterventions = useMemo(() => {
    if (!normalizedSearch) return interventions;
    return interventions.filter((intervention) => {
      const group = getGroupFromIntervention(intervention);
      const enterpriseMeta = getEnterpriseMetaForGroup(group);
      return (
        intervention.titleMessage.toLowerCase().includes(normalizedSearch) ||
        intervention.bodyMessage.toLowerCase().includes(normalizedSearch) ||
        intervention.description.toLowerCase().includes(normalizedSearch) ||
        group?.name?.toLowerCase().includes(normalizedSearch) ||
        enterpriseMeta.name.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [interventions, normalizedSearch, getEnterpriseMetaForGroup, getGroupFromIntervention]);

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
        groups: Map<number, { group: Group; interventions: Intervention[] }>;
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
      bucket: { groups: Map<number, { group: Group; interventions: Intervention[] }> },
      group: Group,
    ) => {
      if (!bucket.groups.has(group.id)) {
        bucket.groups.set(group.id, { group, interventions: [] });
      }
      return bucket.groups.get(group.id)!;
    };

    groups.forEach((group) => {
      if (!groupMatchesSearch(group)) return;
      const meta = getEnterpriseMetaForGroup(group);
      const bucket = ensureEnterprise(meta.id, meta.name);
      ensureGroup(bucket, group);
    });

    filteredInterventions.forEach((intervention) => {
      const groupData = getGroupFromIntervention(intervention);
      if (!groupData) return;
      const meta = getEnterpriseMetaForGroup(groupData);
      const bucket = ensureEnterprise(meta.id, meta.name);
      const node = ensureGroup(bucket, groupData);
      node.interventions.push(intervention);
    });

    return Array.from(enterpriseBuckets.values())
      .map((bucket) => ({
        enterprise: bucket.enterprise,
        groups: Array.from(bucket.groups.values()),
      }))
      .filter((entry) => entry.groups.length > 0)
      .sort((a, b) => a.enterprise.name.localeCompare(b.enterprise.name));
  }, [filteredInterventions, groups, groupMatchesSearch, getEnterpriseMetaForGroup, getGroupFromIntervention]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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

  const canCreateIntervention = enterpriseOptions.length > 0 && availableGroups.length > 0;

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

  const handleOpenDialog = (intervention?: Intervention) => {
    if (intervention) {
      const group = getGroupFromIntervention(intervention);
      const enterpriseMeta = getEnterpriseMetaForGroup(group);
      setEditingIntervention(intervention);
      setFormData({
        enterpriseId: enterpriseMeta.id,
        groupId: group?.id ?? null,
        titleMessage: intervention.titleMessage,
        bodyMessage: intervention.bodyMessage,
        description: intervention.description,
      });
    } else {
      const enterpriseId = enterpriseOptions[0]?.id ?? null;
      setEditingIntervention(null);
      setFormData({
        enterpriseId,
        groupId: getFirstGroupIdForEnterprise(enterpriseId),
        titleMessage: '',
        bodyMessage: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.titleMessage.trim() || !formData.groupId || !formData.enterpriseId) {
      toast.error('El título, la empresa y el grupo son requeridos');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        titleMessage: formData.titleMessage.trim(),
        bodyMessage: formData.bodyMessage,
        description: formData.description,
        groupId: formData.groupId,
      };
      const method = editingIntervention ? 'PUT' : 'POST';
      const endpoint = editingIntervention
        ? `/interventions/${editingIntervention.id}`
        : '/interventions';
      await fetchAPI(endpoint, { method, body: JSON.stringify(payload) });
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
        <Button
          onClick={() => handleOpenDialog()}
          disabled={!canCreateIntervention}
          className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Intervención
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Buscar por título, descripción, grupo o empresa..."
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
        ) : paginatedHierarchy.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No se encontraron intervenciones</p>
        ) : (
          paginatedHierarchy.map((entry) => (
            <div key={entry.enterprise.id} className="bg-slate-900/40 border border-white/10 rounded-lg p-4 space-y-3">
              <button
                className="w-full flex items-center justify-between text-left"
                onClick={() => handleToggleEnterprise(entry.enterprise.id)}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-orange-300" />
                    <span className="font-semibold text-white">{entry.enterprise.name}</span>
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                      ID: {entry.enterprise.id}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {entry.groups.length} grupo{entry.groups.length === 1 ? '' : 's'} registrados
                  </p>
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
                  {entry.groups.map((groupNode) => (
                    <div key={groupNode.group.id} className="bg-slate-900/40 border border-white/5 rounded-lg p-3 space-y-3">
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
                            {groupNode.interventions.length} intervención{groupNode.interventions.length === 1 ? '' : 'es'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <span>Ver intervenciones</span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedGroup === groupNode.group.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {expandedGroup === groupNode.group.id && (
                        <div className="mt-3 space-y-2">
                          {groupNode.interventions.length === 0 ? (
                            <p className="text-sm text-gray-400 pl-2">Sin intervenciones registradas</p>
                          ) : (
                            groupNode.interventions.map((intervention) => (
                              <div
                                key={intervention.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-slate-900/60 border border-white/10 rounded-lg space-y-3 md:space-y-0"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-white">{intervention.titleMessage}</h4>
                                    <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                      ID: {intervention.id}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-300">{intervention.description}</p>
                                  {intervention.bodyMessage && (
                                    <p className="text-xs text-gray-500 italic mt-2">{intervention.bodyMessage}</p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 md:ml-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(intervention)}
                                    className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(intervention.id)}
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
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
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
                <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
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
              {groupInvalid && <p className="text-xs text-red-400">Selecciona un grupo válido</p>}
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
