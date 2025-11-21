'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Activity,
  BarChart3,
  RefreshCw,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  Layers,
  UserPlus,
  X,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAPI } from '@/lib/apiClient';

interface GroupManagerEnterprise {
  id: number;
  name: string;
  email?: string;
  telephone?: string;
  active?: boolean;
}

interface GroupManager {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enterprise?: GroupManagerEnterprise;
}

interface GroupMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  manager: GroupManager;
  members?: GroupMember[];
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enterprise?: {
    id: number;
    name: string;
  };
  role?: {
    id: number;
    name: string;
  };
}

interface GroupFormData {
  name: string;
  managerId: number | null;
  enterpriseId: number | null;
  membersToAdd: number[];
}

interface EnterpriseSummary {
  id: number;
  name: string;
  email?: string;
  telephone?: string;
  active?: boolean;
  locations?: { id: number }[];
  employees?: Employee[];
}

export function GroupsManagement() {
  const PAGE_SIZE = 10;
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [enterprises, setEnterprises] = useState<EnterpriseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEnterprise, setExpandedEnterprise] = useState<number | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>('');
  const [enterprisePopoverOpen, setEnterprisePopoverOpen] = useState(false);
  const [managerPopoverOpen, setManagerPopoverOpen] = useState(false);
  const [memberPopoverOpen, setMemberPopoverOpen] = useState(false);
  const [enterpriseSearch, setEnterpriseSearch] = useState('');
  const [managerSearch, setManagerSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    managerId: null,
    enterpriseId: null,
    membersToAdd: [],
  });
  const [memberToRemove, setMemberToRemove] = useState<{ groupId: number; member: GroupMember } | null>(null);
  const [removingMember, setRemovingMember] = useState(false);

  const enterpriseOptions = useMemo(
    () => enterprises.map((enterprise) => ({ id: enterprise.id, name: enterprise.name })),
    [enterprises],
  );

  const filteredEnterpriseOptions = useMemo(() => {
    const term = enterpriseSearch.trim().toLowerCase();
    if (!term) return enterpriseOptions;
    return enterpriseOptions.filter((option) => option.name.toLowerCase().includes(term));
  }, [enterpriseOptions, enterpriseSearch]);

  const selectedEnterpriseId = formData.enterpriseId ?? null;
  const selectedEnterpriseLabel =
    enterpriseOptions.find((option) => option.id === selectedEnterpriseId)?.name ?? 'Seleccionar empresa';

  useEffect(() => {
    if (enterprises.length === 0) return;
    setFormData((prev) => {
      if (prev.enterpriseId) return prev;
      return { ...prev, enterpriseId: enterprises[0].id };
    });
  }, [enterprises]);

  const managersForEnterprise = useMemo(() => {
    if (!formData.enterpriseId) return employees;
    return employees.filter((employee) => employee.enterprise?.id === formData.enterpriseId);
  }, [employees, formData.enterpriseId]);

  const filteredManagers = useMemo(() => {
    const term = managerSearch.trim().toLowerCase();
    if (!term) return managersForEnterprise;
    return managersForEnterprise.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(term) || employee.email.toLowerCase().includes(term);
    });
  }, [managerSearch, managersForEnterprise]);

  const selectedManagerLabel =
    formData.managerId != null
      ? (() => {
          const manager = employees.find((employee) => employee.id === formData.managerId);
          return manager ? `${manager.firstName} ${manager.lastName}` : 'Seleccionar manager';
        })()
      : 'Seleccionar manager';

  useEffect(() => {
    setFormData((prev) => {
      if (!prev.enterpriseId) return prev;
      if (managersForEnterprise.length === 0) {
        return { ...prev, managerId: null };
      }
      if (prev.managerId && managersForEnterprise.some((manager) => manager.id === prev.managerId)) {
        return prev;
      }
      return { ...prev, managerId: managersForEnterprise[0].id };
    });
  }, [managersForEnterprise]);

  const pendingMembers = useMemo(
    () =>
      formData.membersToAdd
        .map((id) => employees.find((employee) => employee.id === id))
        .filter(Boolean) as Employee[],
    [formData.membersToAdd, employees],
  );

  const candidateMembers = useMemo(() => {
    if (!editingGroup) return [];
    const enterpriseId = editingGroup.manager.enterprise?.id ?? null;
    const excludedIds = new Set<number>([
      editingGroup.manager.id,
      ...(editingGroup.members?.map((member) => member.id) ?? []),
      ...formData.membersToAdd,
    ]);
    return employees.filter((employee) => {
      if (enterpriseId && employee.enterprise?.id !== enterpriseId) return false;
      return !excludedIds.has(employee.id);
    });
  }, [editingGroup, employees, formData.membersToAdd]);

  const filteredMemberOptions = useMemo(() => {
    const term = memberSearch.trim().toLowerCase();
    if (!term) return candidateMembers;
    return candidateMembers.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(term) || employee.email.toLowerCase().includes(term);
    });
  }, [candidateMembers, memberSearch]);

  const selectedMemberLabel =
    selectedMemberToAdd && candidateMembers.length
      ? (() => {
          const memberId = Number(selectedMemberToAdd);
          const member = candidateMembers.find((candidate) => candidate.id === memberId);
          return member ? `${member.firstName} ${member.lastName}` : 'Seleccionar miembro';
        })()
      : 'Seleccionar miembro';

  useEffect(() => {
    if (!selectedMemberToAdd) return;
    const memberId = Number(selectedMemberToAdd);
    if (Number.isNaN(memberId)) return;
    if (candidateMembers.some((member) => member.id === memberId)) return;
    setSelectedMemberToAdd('');
  }, [candidateMembers, selectedMemberToAdd]);

  const getGroupMemberCount = useCallback((group: Group) => {
    const membersCount = group.members?.length ?? 0;
    const managerIncluded = group.members?.some((member) => member.id === group.manager.id);
    return membersCount + (managerIncluded ? 0 : 1);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesData, groupsRaw, enterprisesData] = await Promise.all([
        fetchAPI('/employees'),
        fetchAPI('/groups'),
        fetchAPI('/enterprises'),
      ]);
      setEmployees(employeesData);
      setEnterprises(enterprisesData);

      const normalizedGroups: Group[] = Array.isArray(groupsRaw)
        ? groupsRaw.map((group: any) => ({
            ...group,
            members: (group.members || [])
              .map((member: any) => {
                const employee = member?.employee || member;
                if (!employee) return null;
                return {
                  id: employee.id,
                  firstName: employee.firstName,
                  lastName: employee.lastName,
                  email: employee.email,
                };
              })
              .filter(Boolean),
          }))
        : [];
      setGroups(normalizedGroups);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error(error.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDialog = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        managerId: group.manager.id,
        enterpriseId: group.manager.enterprise?.id ?? enterprises[0]?.id ?? null,
        membersToAdd: [],
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        managerId: null,
        enterpriseId: enterprises[0]?.id ?? null,
        membersToAdd: [],
      });
    }
    setSelectedMemberToAdd('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      managerId: null,
      enterpriseId: enterprises[0]?.id ?? null,
      membersToAdd: [],
    });
    setSelectedMemberToAdd('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del grupo es requerido');
      return;
    }

    if (!formData.managerId) {
      toast.error('El manager es requerido');
      return;
    }

    if (!formData.enterpriseId) {
      toast.error('La empresa es requerida');
      return;
    }

    setSubmitting(true);
    try {
      let groupId = editingGroup?.id ?? null;

      if (editingGroup) {
        await fetchAPI(`/groups/${editingGroup.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: formData.name,
            managerId: formData.managerId,
          }),
        });
        toast.success('Grupo actualizado exitosamente');
      } else {
        const createdGroup = await fetchAPI('/groups', {
          method: 'POST',
          body: JSON.stringify({
            name: formData.name,
            managerId: formData.managerId,
          }),
        });
        groupId = createdGroup?.id ?? null;
        toast.success('Grupo creado exitosamente');
      }

      if (groupId && formData.membersToAdd.length > 0) {
        await Promise.all(
          formData.membersToAdd.map((employeeId) =>
            fetchAPI('/group-employees', {
              method: 'POST',
              body: JSON.stringify({ groupId, employeeId }),
            }),
          ),
        );
        toast.success(
          editingGroup ? 'Miembros agregados al grupo' : 'Miembros asignados al nuevo grupo',
        );
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar grupo');
      console.error('Error saving group:', error);
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

  const handleEnterpriseSelect = (enterpriseId: number) => {
    setFormData((prev) => ({
      ...prev,
      enterpriseId,
    }));
    setEnterprisePopoverOpen(false);
    setEnterpriseSearch('');
  };

  const handleManagerSelect = (managerId: number) => {
    setFormData((prev) => ({
      ...prev,
      managerId,
    }));
    setManagerPopoverOpen(false);
    setManagerSearch('');
  };

  const handleMemberSelect = (memberId: number) => {
    setSelectedMemberToAdd(String(memberId));
    setMemberPopoverOpen(false);
  };

  const handleAddMemberCandidate = () => {
    if (!selectedMemberToAdd) {
      toast.error('Selecciona un miembro para agregar');
      return;
    }
    const memberId = Number(selectedMemberToAdd);
    if (Number.isNaN(memberId)) {
      toast.error('Miembro inválido');
      return;
    }
    setFormData((prev) => {
      if (prev.membersToAdd.includes(memberId)) return prev;
      return { ...prev, membersToAdd: [...prev.membersToAdd, memberId] };
    });
    setSelectedMemberToAdd('');
  };

  const handleRemoveMemberCandidate = (memberId: number) => {
    setFormData((prev) => ({
      ...prev,
      membersToAdd: prev.membersToAdd.filter((id) => id !== memberId),
    }));
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) return groups;
    return groups.filter((group) => {
      const managerFullName = `${group.manager.firstName} ${group.manager.lastName}`.toLowerCase();
      const enterpriseName = group.manager.enterprise?.name?.toLowerCase() ?? '';
      return (
        group.name.toLowerCase().includes(normalizedSearch) ||
        managerFullName.includes(normalizedSearch) ||
        group.manager.email.toLowerCase().includes(normalizedSearch) ||
        enterpriseName.includes(normalizedSearch)
      );
    });
  }, [groups, normalizedSearch]);

  const enterpriseMap = useMemo(
    () => new Map(enterprises.map((enterprise) => [enterprise.id, enterprise])),
    [enterprises],
  );

  const hierarchy = useMemo(() => {
    const buckets = new Map<
      number,
      {
        enterprise: EnterpriseSummary;
        groups: Group[];
      }
    >();

    filteredGroups.forEach((group) => {
      const enterpriseId = group.manager?.enterprise?.id ?? -1;
      const existingEnterprise = enterpriseMap.get(enterpriseId);
      const fallbackEnterprise: EnterpriseSummary =
        existingEnterprise || {
          id: enterpriseId,
          name: group.manager?.enterprise?.name ?? 'Sin empresa asignada',
          email: group.manager?.enterprise?.email,
          telephone: group.manager?.enterprise?.telephone,
          active: group.manager?.enterprise?.active ?? true,
          locations: [],
          employees: [],
        };

      if (!buckets.has(enterpriseId)) {
        buckets.set(enterpriseId, { enterprise: fallbackEnterprise, groups: [] });
      }
      buckets.get(enterpriseId)!.groups.push(group);
    });

    return Array.from(buckets.values()).sort((a, b) =>
      a.enterprise.name.localeCompare(b.enterprise.name),
    );
  }, [filteredGroups, enterpriseMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, hierarchy.length]);

  const totalPages = Math.max(1, Math.ceil(Math.max(hierarchy.length, 1) / PAGE_SIZE));
  const pageStart = hierarchy.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = hierarchy.length === 0 ? 0 : Math.min(hierarchy.length, currentPage * PAGE_SIZE);

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

  const totalMembers = useMemo(
    () => groups.reduce((acc, group) => acc + getGroupMemberCount(group), 0),
    [groups, getGroupMemberCount],
  );

  const handleDeleteClick = (group: Group) => {
    setDeletingGroup(group);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;

    setSubmitting(true);
    try {
      await fetchAPI(`/groups/${deletingGroup.id}`, {
        method: 'DELETE',
      });
      toast.success('Grupo eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar grupo');
      console.error('Error deleting group:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (groupId: number, memberId: number) => {
    try {
      await fetchAPI(`/group-employees/${groupId}/${memberId}`, {
        method: 'DELETE',
      });
      toast.success('Miembro eliminado del grupo');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar miembro');
      console.error('Error removing group member:', error);
      throw error;
    }
  };

const requestRemoveMember = (groupId: number, member: GroupMember) => {
  setMemberToRemove({ groupId, member });
};

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setRemovingMember(true);
    try {
      await handleRemoveMember(memberToRemove.groupId, memberToRemove.member.id);
      setMemberToRemove(null);
    } catch {
      /* error already notificado */
    } finally {
      setRemovingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando grupos...</p>
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
              <Users className="w-5 h-5 text-white" />
            </div>
            <span>Gestión de Grupos</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra grupos de trabajo y sus asignaciones
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
              Nuevo Grupo
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Total Groups Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-orange-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Grupos</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{groups.length}</div>
            <p className="text-xs text-gray-400">Grupos activos</p>
          </CardContent>
        </Card>

        {/* Total Members Card */}
        <Card className="relative overflow-hidden border-white/10 bg-slate-800/50 backdrop-blur-sm hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Miembros</CardTitle>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">{totalMembers}</div>
            <p className="text-xs text-gray-400">Miembros en grupos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar grupos por nombre, manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card className="border-white/10 bg-slate-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Grupos Registrados</span>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
              {filteredGroups.length} grupos
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de grupos de trabajo y su información
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedHierarchy.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400">
                  {filteredGroups.length === 0
                    ? 'No hay grupos registrados'
                    : 'No se encontraron grupos que coincidan con la búsqueda'}
                </p>
              </div>
            ) : (
              paginatedHierarchy.map((entry) => {
                const enterprise = entry.enterprise;
                const isExpanded = expandedEnterprise === enterprise.id;
                const groupCount = entry.groups.length;
                const memberTotal = entry.groups.reduce(
                  (sum, group) => sum + getGroupMemberCount(group),
                  0,
                );
                const enterpriseIdLabel = enterprise.id === -1 ? 'N/A' : enterprise.id;

                return (
                  <div
                    key={`${enterprise.id}-${enterprise.name}`}
                    className="bg-slate-900/40 border border-white/10 rounded-lg p-4 space-y-3"
                  >
                    <button
                      className="w-full flex items-center justify-between text-left gap-3"
                      onClick={() => handleToggleEnterprise(enterprise.id)}
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Building2 className="w-4 h-4 text-orange-300" />
                          <span className="font-semibold text-white">{enterprise.name}</span>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            ID: {enterpriseIdLabel}
                          </Badge>
                          <Badge
                            className={`text-xs ${
                              enterprise.active === false
                                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                : 'bg-green-500/20 text-green-300 border-green-500/30'
                            }`}
                          >
                            {enterprise.active === false ? 'Inactiva' : 'Activa'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                          {enterprise.email && (
                            <span className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              {enterprise.email}
                            </span>
                          )}
                          {enterprise.telephone && (
                            <span className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              {enterprise.telephone}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {groupCount} grupo{groupCount === 1 ? '' : 's'}
                          </Badge>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                            {memberTotal} miembro{memberTotal === 1 ? '' : 's'}
                          </Badge>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-300 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-3">
                        {entry.groups.map((group) => {
                          const isGroupExpanded = expandedGroup === group.id;
                          const memberCount = getGroupMemberCount(group);
                          const managerName = `${group.manager.firstName} ${group.manager.lastName}`;
                          const baseMembers = group.members ?? [];
                          const otherMembers = baseMembers.filter((member) => member.id !== group.manager.id);
                          const renderedMembers = [
                            {
                              id: group.manager.id,
                              firstName: group.manager.firstName,
                              lastName: group.manager.lastName,
                              email: group.manager.email,
                              isManager: true,
                            },
                            ...otherMembers.map((member) => ({ ...member, isManager: false })),
                          ];

                          return (
                            <div
                              key={group.id}
                              className="bg-slate-900/40 border border-white/5 rounded-lg p-3 space-y-2"
                            >
                              <div className="flex flex-col gap-2">
                                <button
                                  className="flex items-start justify-between text-left gap-3"
                                  onClick={() => handleToggleGroup(group.id)}
                                >
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Layers className="w-4 h-4 text-amber-300" />
                                      <span className="font-medium text-white">{group.name}</span>
                                      <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                        ID: {group.id}
                                      </Badge>
                                      <Badge
                                        className={`text-xs ${
                                          group.active === false
                                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                            : 'bg-green-500/20 text-green-300 border-green-500/30'
                                        }`}
                                      >
                                        {group.active === false ? 'Inactivo' : 'Activo'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                      <UserCog className="w-4 h-4 text-gray-500" />
                                      {managerName} · {group.manager.email}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                        {memberCount} miembro{memberCount === 1 ? '' : 's'}
                                      </Badge>
                                    </div>
                                  </div>
                                  <ChevronDown
                                    className={`w-4 h-4 text-gray-300 mt-1 transition-transform ${
                                      isGroupExpanded ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenDialog(group)}
                                    className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border border-white/10"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Editar
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteClick(group)}
                                    className="hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-white/10"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Eliminar
                                  </Button>
                                </div>
                              </div>

                              {isGroupExpanded && (
                                <div className="mt-2 space-y-2">
                                  {renderedMembers.map((member) => (
                                    <div
                                      key={`${group.id}-${member.id}-${member.isManager ? 'manager' : 'member'}`}
                                      className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/70 border border-white/10 rounded-lg p-3 gap-2"
                                    >
                                      <div>
                                        <p className="text-white font-medium">
                                          {member.firstName} {member.lastName}
                                        </p>
                                        <p className="text-sm text-gray-400">{member.email}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs border-white/15 text-gray-400">
                                          ID: {member.id}
                                        </Badge>
                                        {member.isManager ? (
                                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                            Manager
                                          </Badge>
                                        ) : (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => requestRemoveMember(group.id, member)}
                                            className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                            aria-label={`Eliminar ${member.firstName} ${member.lastName} del grupo`}
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span>{editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingGroup
                ? 'Actualiza la información del grupo'
                : 'Completa los datos para crear un nuevo grupo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre del Grupo *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Equipo de Desarrollo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Empresa *</Label>
              {editingGroup ? (
                <div className="flex items-center justify-between rounded-md bg-slate-800/50 border border-white/10 px-3 py-2 text-gray-200">
                  <span>{selectedEnterpriseLabel}</span>
                  <Badge className="bg-slate-700/70 text-gray-300 border-white/10">Solo lectura</Badge>
                </div>
              ) : (
                <Popover
                  open={enterprisePopoverOpen}
                  onOpenChange={(open) => {
                    setEnterprisePopoverOpen(open);
                    if (!open) setEnterpriseSearch('');
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={enterpriseOptions.length === 0}
                      className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                    >
                      <span>{enterpriseOptions.length ? selectedEnterpriseLabel : 'Sin empresas disponibles'}</span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
                    <Command>
                      <CommandInput
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
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Manager *</Label>
              <Popover
                open={managerPopoverOpen}
                onOpenChange={(open) => {
                  setManagerPopoverOpen(open);
                  if (!open) setManagerSearch('');
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={filteredManagers.length === 0}
                    className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                  >
                    <span>
                      {filteredManagers.length
                        ? selectedManagerLabel
                        : formData.enterpriseId
                        ? 'Sin empleados disponibles'
                        : 'Selecciona una empresa primero'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar manager..."
                      value={managerSearch}
                      onValueChange={setManagerSearch}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredManagers.map((employee) => (
                          <CommandItem
                            key={employee.id}
                            value={`${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase()}-${employee.email.toLowerCase()}`}
                            onSelect={() => handleManagerSelect(employee.id)}
                          >
                            {employee.firstName} {employee.lastName} · {employee.email}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {editingGroup && (
              <div className="space-y-3 p-4 bg-slate-900/40 rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Agregar miembros</Label>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    {pendingMembers.length} pendiente{pendingMembers.length === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Popover
                    open={memberPopoverOpen}
                    onOpenChange={(open) => {
                      setMemberPopoverOpen(open);
                      if (!open) setMemberSearch('');
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={candidateMembers.length === 0}
                        className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                      >
                        <span>
                          {candidateMembers.length
                            ? selectedMemberLabel
                            : 'Sin empleados disponibles en esta empresa'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar miembro..."
                          value={memberSearch}
                          onValueChange={setMemberSearch}
                          className="text-slate-900 dark:text-white placeholder:text-gray-500"
                        />
                        <CommandList>
                          <CommandEmpty>Sin resultados</CommandEmpty>
                          <CommandGroup>
                            {filteredMemberOptions.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={`${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase()}-${employee.email.toLowerCase()}`}
                                onSelect={() => handleMemberSelect(employee.id)}
                              >
                                {employee.firstName} {employee.lastName} · {employee.email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddMemberCandidate}
                    disabled={candidateMembers.length === 0 || !selectedMemberToAdd}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
                {pendingMembers.length === 0 ? (
                  <p className="text-xs text-gray-400">No hay nuevos miembros seleccionados.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {pendingMembers.map((member) => (
                      <Badge
                        key={member.id}
                        className="flex items-center gap-2 bg-slate-800 border-white/10 text-white"
                      >
                        {member.firstName} {member.lastName}
                        <button
                          type="button"
                          onClick={() => handleRemoveMemberCandidate(member.id)}
                          className="text-gray-300 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Los miembros seleccionados se agregarán al guardar los cambios del grupo.
                </p>
              </div>
            )}
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
                  {editingGroup ? 'Actualizar' : 'Crear Grupo'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
          
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
              ¿Estás seguro de que deseas eliminar el grupo{' '}
              <span className="font-bold text-white">{deletingGroup?.name}</span>?
            </p>

            {deletingGroup && (
              <div className="space-y-3">
                {/* Solo mostramos advertencias si existen los datos */}
                {(deletingGroup.members && deletingGroup.members.length > 0) && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Este grupo tiene {deletingGroup.members.length} miembro(s) asignado(s)
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-300 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Todos los datos asociados al grupo serán eliminados
                  </p>
                </div>
              </div>
            )}
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
                  Eliminar Grupo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <Dialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span>Eliminar miembro</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta acción removerá al miembro del grupo seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-gray-300">
              ¿Deseas eliminar a{' '}
              <span className="font-semibold text-white">
                {memberToRemove?.member.firstName} {memberToRemove?.member.lastName}
              </span>{' '}
              del grupo?
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMemberToRemove(null)}
              disabled={removingMember}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmRemoveMember}
              disabled={removingMember}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
            >
              {removingMember ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}