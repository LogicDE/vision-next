'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Building,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Cpu,
  HardDrive,
  ChevronsUpDown,
} from 'lucide-react';
import { fetchAPI } from '@/lib/apiClient';
import { toast } from 'sonner';

interface Device {
  id: number;
  name?: string;
  deviceType?: string;
  status?: string;
}

interface EnterpriseLocation {
  id: number;
  locationName: string;
  idAddress?: number;
  active?: boolean;
  devices?: Device[];
  address?: {
    id: number;
    streetName?: string;
    streetNumber?: string;
    postalCode?: {
      id: number;
      code: string;
      country?: {
        id: number;
        name: string;
      };
    };
    neighborhood?: {
      id: number;
      name: string;
      city?: {
        id: number;
        name: string;
      };
    };
  };
}

interface EnterpriseEmployee {
  id: number;
  firstName?: string;
  lastName?: string;
}

interface Enterprise {
  id: number;
  name: string;
  email?: string;
  telephone?: string;
  active?: boolean;
  locations?: EnterpriseLocation[];
  employees?: EnterpriseEmployee[];
  created_at?: string;
  updated_at?: string;
}

interface EnterpriseFormData {
  name: string;
  email: string;
  telephone: string;
}

interface LocationFormData {
  id: number | null;
  enterpriseId: number | null;
  locationName: string;
  idAddress: number | null;
  active: boolean;
  streetNumber: string;
  streetName: string;
  postalCodeId: number | null;
  neighborhoodId: number | null;
  cityName: string;
  countryName: string;
}

interface DeviceFormData {
  id: number | null;
  locationId: number | null;
  name: string;
  deviceType: string;
}

interface PostalCodeOption {
  id: number;
  code: string;
  country?: {
    id: number;
    name: string;
  };
}

interface NeighborhoodOption {
  id: number;
  name: string;
  city?: {
    id: number;
    name: string;
  };
}

export function EnterprisesManagement() {
  const PAGE_SIZE = 10;
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [deletingEnterprise, setDeletingEnterprise] = useState<Enterprise | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEnterprise, setExpandedEnterprise] = useState<number | null>(null);
  const [expandedLocation, setExpandedLocation] = useState<number | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [locationSubmitting, setLocationSubmitting] = useState(false);
  const [deviceSubmitting, setDeviceSubmitting] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deletingLocation, setDeletingLocation] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<{ id: number; name?: string } | null>(null);
  const [deletingDevice, setDeletingDevice] = useState(false);
  const [postalCodes, setPostalCodes] = useState<PostalCodeOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);
  const [postalCodePopoverOpen, setPostalCodePopoverOpen] = useState(false);
  const [neighborhoodPopoverOpen, setNeighborhoodPopoverOpen] = useState(false);
  const [postalCodeSearch, setPostalCodeSearch] = useState('');
  const [neighborhoodSearch, setNeighborhoodSearch] = useState('');
  const [formData, setFormData] = useState<EnterpriseFormData>({
    name: '',
    email: '',
    telephone: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [locationFormData, setLocationFormData] = useState<LocationFormData>({
    id: null,
    enterpriseId: null,
    locationName: '',
    idAddress: null,
    active: true,
    streetNumber: '',
    streetName: '',
    postalCodeId: null,
    neighborhoodId: null,
    cityName: '',
    countryName: '',
  });
  const [deviceFormData, setDeviceFormData] = useState<DeviceFormData>({
    id: null,
    locationId: null,
    name: '',
    deviceType: '',
  });

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/enterprises');
      setEnterprises(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar empresas');
      console.error('Error loading enterprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferenceData = async () => {
    try {
      const [postalCodesData, neighborhoodsData] = await Promise.all([
        fetchAPI('/postal-codes'),
        fetchAPI('/neighborhoods'),
      ]);
      setPostalCodes(postalCodesData);
      setNeighborhoods(neighborhoodsData);
    } catch (error: any) {
      console.error('Error loading address catalogs:', error);
      toast.error(error.message || 'Error al cargar catálogos de direcciones');
    }
  };

  const fetchAddressDetails = async (addressId: number) => {
    try {
      return await fetchAPI(`/addresses/${addressId}`);
    } catch (error: any) {
      console.error('Error fetching address details:', error);
      toast.error(error.message || 'Error al cargar los detalles de la dirección');
      return null;
    }
  };

  useEffect(() => {
    loadEnterprises();
    loadReferenceData();
  }, []);

  const handleOpenDialog = (enterprise?: Enterprise) => {
    if (enterprise) {
      setEditingEnterprise(enterprise);
      setFormData({
        name: enterprise.name,
        email: enterprise.email || '',
        telephone: enterprise.telephone || '',
      });
    } else {
      setEditingEnterprise(null);
      setFormData({
        name: '',
        email: '',
        telephone: '',
      });
    }
    setEmailError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEnterprise(null);
    setFormData({
      name: '',
      email: '',
      telephone: '',
    });
    setEmailError(null);
  };

  const TELEPHONE_REGEX = /^\d{9,15}$/;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la empresa es requerido');
      return;
    }

    if (!formData.telephone.trim()) {
      toast.error('El teléfono de la empresa es requerido');
      return;
    }

    if (!TELEPHONE_REGEX.test(formData.telephone.trim())) {
      toast.error('El teléfono debe tener entre 9 y 15 dígitos (solo números)');
      return;
    }

    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        telephone: formData.telephone.trim(),
      };

      if (editingEnterprise) {
        await fetchAPI(`/enterprises/${editingEnterprise.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast.success('Empresa actualizada exitosamente');
      } else {
        await fetchAPI('/enterprises', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Empresa creada exitosamente');
      }
      handleCloseDialog();
      await loadEnterprises();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
    } catch (error: any) {
      const message = error?.message || '';
      // Manejo específico para conflicto de email (409)
      if (message.startsWith('Error 409:')) {
        try {
          const jsonPart = message.slice('Error 409:'.length).trim();
          const parsed = JSON.parse(jsonPart);
          setEmailError(parsed?.message || 'El correo electrónico ya está registrado en otra empresa');
        } catch {
          setEmailError('El correo electrónico ya está registrado en otra empresa');
        }
      } else {
        toast.error(message || 'Error al guardar empresa');
        console.error('Error saving enterprise:', error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (enterprise: Enterprise) => {
    setDeletingEnterprise(enterprise);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEnterprise) return;

    const scrollY = window.scrollY;
    setSubmitting(true);
    try {
      await fetchAPI(`/enterprises/${deletingEnterprise.id}`, {
        method: 'DELETE',
      });
      toast.success('Empresa eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setDeletingEnterprise(null);
      await loadEnterprises();
      requestAnimationFrame(() => window.scrollTo({ top: scrollY, left: 0 }));
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar empresa');
      console.error('Error deleting enterprise:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resolveLocationAddressId = (location: EnterpriseLocation): number | null => {
    return (
      location.address?.id ??
      (location as any).idAddress ??
      (location as any).id_address ??
      null
    );
  };

  const postalCodeOptionsMemo = useMemo(
    () =>
      postalCodes.map((pc) => ({
        id: pc.id,
        label: `${pc.code} · ${pc.country?.name ?? 'Sin país'}`,
        countryName: pc.country?.name ?? '',
      })),
    [postalCodes],
  );

  const neighborhoodOptionsMemo = useMemo(
    () =>
      neighborhoods.map((n) => ({
        id: n.id,
        label: `${n.name} · ${n.city?.name ?? 'Sin ciudad'}`,
        cityName: n.city?.name ?? '',
      })),
    [neighborhoods],
  );

  const filteredPostalCodeOptions = useMemo(() => {
    const term = postalCodeSearch.trim().toLowerCase();
    if (!term) return postalCodeOptionsMemo;
    return postalCodeOptionsMemo.filter((option) => option.label.toLowerCase().includes(term));
  }, [postalCodeOptionsMemo, postalCodeSearch]);

  const filteredNeighborhoodOptions = useMemo(() => {
    const term = neighborhoodSearch.trim().toLowerCase();
    if (!term) return neighborhoodOptionsMemo;
    return neighborhoodOptionsMemo.filter((option) => option.label.toLowerCase().includes(term));
  }, [neighborhoodOptionsMemo, neighborhoodSearch]);

  const selectedPostalCodeLabel =
    locationFormData.postalCodeId != null
      ? postalCodeOptionsMemo.find((option) => option.id === locationFormData.postalCodeId)?.label ??
        'Seleccionar código postal'
      : 'Seleccionar código postal';

  const selectedNeighborhoodLabel =
    locationFormData.neighborhoodId != null
      ? neighborhoodOptionsMemo.find((option) => option.id === locationFormData.neighborhoodId)?.label ??
        'Seleccionar vecindario'
      : 'Seleccionar vecindario';

  const handleToggleEnterprise = (enterpriseId: number) => {
    setExpandedEnterprise((prev) => (prev === enterpriseId ? null : enterpriseId));
    setExpandedLocation(null);
  };

  const handleToggleLocation = (locationId: number) => {
    setExpandedLocation((prev) => (prev === locationId ? null : locationId));
  };

  const handlePostalCodeSelect = (postalCodeId: number) => {
    const option = postalCodeOptionsMemo.find((pc) => pc.id === postalCodeId);
    setLocationFormData((prev) => ({
      ...prev,
      postalCodeId,
      countryName: option?.countryName ?? '',
    }));
    setPostalCodePopoverOpen(false);
    setPostalCodeSearch('');
  };

  const handleNeighborhoodSelect = (neighborhoodId: number) => {
    const option = neighborhoodOptionsMemo.find((n) => n.id === neighborhoodId);
    setLocationFormData((prev) => ({
      ...prev,
      neighborhoodId,
      cityName: option?.cityName ?? '',
    }));
    setNeighborhoodPopoverOpen(false);
    setNeighborhoodSearch('');
  };

  const handleOpenLocationDialog = async (enterprise: Enterprise, location: EnterpriseLocation) => {
    const addressId = resolveLocationAddressId(location);
    setPostalCodeSearch('');
    setNeighborhoodSearch('');
    setPostalCodePopoverOpen(false);
    setNeighborhoodPopoverOpen(false);

    setLocationFormData({
      id: location.id,
      enterpriseId: enterprise.id,
      locationName: location.locationName,
      idAddress: addressId,
      active: location.active ?? true,
      streetNumber: location.address?.streetNumber ?? '',
      streetName: location.address?.streetName ?? '',
      postalCodeId: location.address?.postalCode?.id ?? null,
      neighborhoodId: location.address?.neighborhood?.id ?? null,
      cityName: location.address?.neighborhood?.city?.name ?? '',
      countryName: location.address?.postalCode?.country?.name ?? '',
    });
    setIsLocationDialogOpen(true);

    if (addressId) {
      const addressDetails = await fetchAddressDetails(addressId);
      if (addressDetails) {
        setLocationFormData((prev) => ({
          ...prev,
          streetNumber: addressDetails.streetNumber ?? '',
          streetName: addressDetails.streetName ?? '',
          postalCodeId: addressDetails.postalCode?.id ?? null,
          neighborhoodId: addressDetails.neighborhood?.id ?? null,
          cityName: addressDetails.neighborhood?.city?.name ?? '',
          countryName: addressDetails.postalCode?.country?.name ?? '',
        }));
      }
    }
  };

  const handleCloseLocationDialog = () => {
    setIsLocationDialogOpen(false);
    setLocationFormData({
      id: null,
      enterpriseId: null,
      locationName: '',
      idAddress: null,
      active: true,
      streetNumber: '',
      streetName: '',
      postalCodeId: null,
      neighborhoodId: null,
      cityName: '',
      countryName: '',
    });
  };

  const handleSubmitLocation = async () => {
    if (
      !locationFormData.id ||
      !locationFormData.enterpriseId ||
      !locationFormData.idAddress ||
      !locationFormData.streetNumber.trim() ||
      !locationFormData.streetName.trim()
    ) {
      toast.error('Completa la información de la dirección');
      return;
    }

    if (!locationFormData.postalCodeId || !locationFormData.neighborhoodId) {
      toast.error('Selecciona el código postal y el vecindario');
      return;
    }
    setLocationSubmitting(true);
    try {
      await fetchAPI(`/addresses/${locationFormData.idAddress}`, {
        method: 'PUT',
        body: JSON.stringify({
          streetNumber: locationFormData.streetNumber.trim(),
          streetName: locationFormData.streetName.trim(),
          idPostalCode: locationFormData.postalCodeId,
          idNeighborhood: locationFormData.neighborhoodId,
        }),
      });

      await fetchAPI(`/enterprise-locations/${locationFormData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          idEnterprise: locationFormData.enterpriseId,
          idAddress: locationFormData.idAddress,
          locationName: locationFormData.locationName,
          active: locationFormData.active,
        }),
      });
      toast.success('Ubicación actualizada');
      handleCloseLocationDialog();
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar ubicación');
    } finally {
      setLocationSubmitting(false);
    }
  };

  const requestDeleteLocation = (location: EnterpriseLocation) => {
    setLocationToDelete({ id: location.id, name: location.locationName });
  };

  const confirmDeleteLocation = async () => {
    if (!locationToDelete) return;
    setDeletingLocation(true);
    try {
      await fetchAPI(`/enterprise-locations/${locationToDelete.id}`, { method: 'DELETE' });
      toast.success('Ubicación eliminada');
      setLocationToDelete(null);
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar ubicación');
    } finally {
      setDeletingLocation(false);
    }
  };

  const handleOpenDeviceDialog = (locationId: number, device: Device) => {
    setDeviceFormData({
      id: device.id,
      locationId,
      name: device.name || '',
      deviceType: device.deviceType || (device as any).device_type || '',
    });
    setIsDeviceDialogOpen(true);
  };

  const handleCloseDeviceDialog = () => {
    setIsDeviceDialogOpen(false);
    setDeviceFormData({
      id: null,
      locationId: null,
      name: '',
      deviceType: '',
    });
  };

  const handleSubmitDevice = async () => {
    if (!deviceFormData.id || !deviceFormData.locationId || !deviceFormData.deviceType.trim()) {
      toast.error('Completa la información del dispositivo');
      return;
    }
    setDeviceSubmitting(true);
    try {
      await fetchAPI(`/devices/${deviceFormData.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          idLocation: deviceFormData.locationId,
          name: deviceFormData.name || undefined,
          deviceType: deviceFormData.deviceType,
        }),
      });
      toast.success('Dispositivo actualizado');
      handleCloseDeviceDialog();
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar dispositivo');
    } finally {
      setDeviceSubmitting(false);
    }
  };

  const requestDeleteDevice = (device: Device) => {
    setDeviceToDelete({ id: device.id, name: device.name });
  };

  const confirmDeleteDevice = async () => {
    if (!deviceToDelete) return;
    setDeletingDevice(true);
    try {
      await fetchAPI(`/devices/${deviceToDelete.id}`, { method: 'DELETE' });
      toast.success('Dispositivo eliminado');
      setDeviceToDelete(null);
      loadEnterprises();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar dispositivo');
    } finally {
      setDeletingDevice(false);
    }
  };

  const getDeviceStatusLabel = (status?: string) => {
    if (!status) return 'Activo';
    return status === 'inactive' ? 'Inactivo' : status.charAt(0).toUpperCase() + status.slice(1);
  };

  const locationDeviceCount = (location?: EnterpriseLocation) =>
    location?.devices?.length ?? 0;

  const enterpriseDeviceCount = (enterprise: Enterprise) =>
    enterprise.locations?.reduce((sum, loc) => sum + (loc.devices?.length ?? 0), 0) ?? 0;

  const filteredEnterprises = enterprises.filter((enterprise) =>
    enterprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enterprise.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filteredEnterprises.length]);

  const totalPages = Math.max(1, Math.ceil(filteredEnterprises.length / PAGE_SIZE));
  const pageStart = filteredEnterprises.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = filteredEnterprises.length === 0 ? 0 : Math.min(filteredEnterprises.length, currentPage * PAGE_SIZE);
  const paginatedEnterprises = filteredEnterprises.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (expandedEnterprise === null) return;
    const visibleIds = new Set(paginatedEnterprises.map((enterprise) => enterprise.id));
    if (!visibleIds.has(expandedEnterprise)) {
      setExpandedEnterprise(null);
      setExpandedLocation(null);
    }
  }, [paginatedEnterprises, expandedEnterprise]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-400 animate-pulse">Cargando empresas...</p>
      </div>
    );
  }

  const totalEmployees = enterprises.reduce((acc, ent) => acc + (ent.employees?.length || 0), 0);
  const totalLocations = enterprises.reduce((acc, ent) => acc + (ent.locations?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Building2 className="w-6 h-6 text-green-400" />
            <span>Gestión de Empresas</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Administra organizaciones y sus ubicaciones
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Empresas</p>
                <p className="text-3xl font-bold text-white">{enterprises.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Empleados Total</p>
                <p className="text-3xl font-bold text-white">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Ubicaciones</p>
                <p className="text-3xl font-bold text-white">{totalLocations}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Promedio Empleados</p>
                <p className="text-3xl font-bold text-white">
                  {enterprises.length > 0 ? Math.round(totalEmployees / enterprises.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
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
              placeholder="Buscar empresas por nombre, email o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enterprises List */}
      <Card className="border-white/10 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Empresas Registradas</span>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {filteredEnterprises.length} empresas
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de organizaciones y sus datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEnterprises.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Building2 className="w-12 h-12 text-gray-600" />
                <p className="text-gray-400">No se encontraron empresas</p>
              </div>
            ) : (
              paginatedEnterprises.map((enterprise) => {
                const employeeCount = enterprise.employees?.length ?? 0;
                const locationCount = enterprise.locations?.length ?? 0;
                const deviceCount = enterpriseDeviceCount(enterprise);
                const isExpanded = expandedEnterprise === enterprise.id;
                return (
                  <div
                    key={enterprise.id}
                    className="bg-slate-900/50 rounded-lg border border-white/10 hover:border-white/20 transition-all p-4 space-y-4"
                  >
                    <div className="flex flex-col gap-3">
                      <button
                        className="w-full flex flex-col gap-3 text-left"
                        onClick={() => handleToggleEnterprise(enterprise.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold text-white text-lg">{enterprise.name}</h4>
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                ID: {enterprise.id}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {enterprise.email && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-300 truncate">{enterprise.email}</span>
                                </div>
                              )}
                              {enterprise.telephone && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-gray-300">{enterprise.telephone}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                <Users className="w-3 h-3 mr-1" />
                                {employeeCount} empleado{employeeCount === 1 ? '' : 's'}
                              </Badge>
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                <Layers className="w-3 h-3 mr-1" />
                                {locationCount} ubicación{locationCount === 1 ? '' : 'es'}
                              </Badge>
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                                <HardDrive className="w-3 h-3 mr-1" />
                                {deviceCount} dispositivo{deviceCount === 1 ? '' : 's'}
                              </Badge>
                            </div>
                          </div>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-300 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                        <p className="text-sm text-gray-400">
                          {isExpanded ? 'Ocultar ubicaciones y dispositivos' : 'Ver ubicaciones asociadas'}
                        </p>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(enterprise)}
                        className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(enterprise)}
                        className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-white/5 space-y-3">
                        {locationCount === 0 ? (
                          <p className="text-sm text-gray-400">Sin ubicaciones registradas</p>
                        ) : (
                          enterprise.locations?.map((location) => {
                            const isLocationExpanded = expandedLocation === location.id;
                            const devices = location.devices ?? [];
                            const addressId = resolveLocationAddressId(location);
                            return (
                              <div
                                key={location.id}
                                className="bg-slate-950/50 border border-white/5 rounded-lg p-3 space-y-3"
                              >
                                <div className="flex flex-col gap-2">
                                  <button
                                    className="flex w-full items-start justify-between text-left gap-3"
                                    onClick={() => handleToggleLocation(location.id)}
                                  >
                                    <div className="space-y-1 flex-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-300" />
                                        <span className="font-medium text-white">{location.locationName}</span>
                                        <Badge variant="outline" className="text-xs border-white/15 text-gray-400">
                                          ID: {location.id}
                                        </Badge>
                                        {typeof addressId === 'number' && (
                                          <Badge variant="outline" className="text-xs border-white/15 text-gray-400">
                                            Dirección: {addressId}
                                          </Badge>
                                        )}
                                        <Badge
                                          className={`text-xs ${
                                            location.active === false
                                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                              : 'bg-green-500/20 text-green-300 border-green-500/30'
                                          }`}
                                        >
                                          {location.active === false ? 'Inactiva' : 'Activa'}
                                        </Badge>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                        <Badge className="bg-amber-500/15 text-amber-200 border-amber-500/30">
                                          {locationDeviceCount(location)} dispositivo
                                          {locationDeviceCount(location) === 1 ? '' : 's'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <ChevronDown
                                      className={`w-4 h-4 text-gray-300 mt-1 transition-transform ${
                                        isLocationExpanded ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </button>

                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenLocationDialog(enterprise, location)}
                                      className="border-white/10 bg-slate-900/50 text-gray-200 hover:bg-slate-800"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Editar ubicación
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => requestDeleteLocation(location)}
                                      className="border-white/10 bg-slate-900/50 text-gray-200 hover:bg-slate-800"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </div>

                                {isLocationExpanded && (
                                  <div className="mt-2 space-y-2">
                                    {devices.length === 0 ? (
                                      <p className="text-sm text-gray-400">Sin dispositivos asociados</p>
                                    ) : (
                                      devices.map((device) => {
                                        const deviceType =
                                          device.deviceType || (device as any).device_type || 'Sin tipo';
                                        const deviceStatus =
                                          device.status || (device as any).status || 'active';
                                        return (
                                          <div
                                            key={device.id}
                                            className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-900/80 border border-white/10 rounded-lg"
                                          >
                                            <div className="flex-1 space-y-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <Cpu className="w-4 h-4 text-cyan-300" />
                                                <span className="font-semibold text-white">
                                                  {device.name || 'Dispositivo sin nombre'}
                                                </span>
                                                <Badge variant="outline" className="text-xs border-white/15 text-gray-400">
                                                  ID: {device.id}
                                                </Badge>
                                              </div>
                                              <div className="text-sm text-gray-300">
                                                Tipo: <span className="text-white">{deviceType}</span>
                                              </div>
                                              <div className="text-xs text-gray-400">
                                                Estado: {getDeviceStatusLabel(deviceStatus)}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleOpenDeviceDialog(location.id, device)}
                                                className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                                              >
                                                <Edit className="w-4 h-4" />
                                              </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => requestDeleteDevice(device)}
                                                      className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                                    >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
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
                {filteredEnterprises.length === 0 ? (
                  '0'
                ) : (
                  <>
                    {pageStart}-{pageEnd}
                  </>
                )}{' '}
                de {filteredEnterprises.length} empresas
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
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
          
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span>{editingEnterprise ? 'Editar Empresa' : 'Nueva Empresa'}</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEnterprise
                ? 'Actualiza la información de la empresa'
                : 'Completa los datos para registrar una nueva empresa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">
                Nombre de la Empresa *
              </Label>
              <Input
                id="name"
                placeholder="Ej: Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Corporativo
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@empresa.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailError(null);
                }}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
              />
              {emailError && (
                <p className="text-sm text-red-400 mt-1">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone" className="text-gray-300">
                Teléfono
              </Label>
              <Input
                id="telephone"
                inputMode="numeric"
                maxLength={15}
                placeholder="5521234567"
                value={formData.telephone}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, telephone: digitsOnly });
                }}
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingEnterprise ? 'Actualizar' : 'Crear Empresa'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog
        open={isLocationDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsLocationDialogOpen(true);
          } else {
            handleCloseLocationDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span>Editar Ubicación</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Actualiza los datos principales de la ubicación seleccionada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nombre *</Label>
              <Input
                value={locationFormData.locationName}
                onChange={(e) =>
                  setLocationFormData((prev) => ({ ...prev, locationName: e.target.value }))
                }
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
                placeholder="Ej: Sede Reforma"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Número *</Label>
                <Input
                  value={locationFormData.streetNumber}
                  onChange={(e) =>
                    setLocationFormData((prev) => ({ ...prev, streetNumber: e.target.value }))
                  }
                  placeholder="Ej: 120"
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Calle *</Label>
                <Input
                  value={locationFormData.streetName}
                  onChange={(e) => setLocationFormData((prev) => ({ ...prev, streetName: e.target.value }))}
                  placeholder="Ej: Avenida Reforma"
                  className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Código Postal *</Label>
              <Popover
                open={postalCodePopoverOpen}
                onOpenChange={(open) => {
                  setPostalCodePopoverOpen(open);
                  if (!open) setPostalCodeSearch('');
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={postalCodeOptionsMemo.length === 0}
                    className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                  >
                    <span>
                      {postalCodeOptionsMemo.length ? selectedPostalCodeLabel : 'Sin códigos postales disponibles'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar código postal..."
                      value={postalCodeSearch}
                      onValueChange={setPostalCodeSearch}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredPostalCodeOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={`${option.label.toLowerCase()}-${option.id}`}
                            onSelect={() => handlePostalCodeSelect(option.id)}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Colonia / Barrio *</Label>
              <Popover
                open={neighborhoodPopoverOpen}
                onOpenChange={(open) => {
                  setNeighborhoodPopoverOpen(open);
                  if (!open) setNeighborhoodSearch('');
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={neighborhoodOptionsMemo.length === 0}
                    className="w-full justify-between bg-slate-800/50 border-white/10 text-gray-200 hover:bg-slate-800/70"
                  >
                    <span>
                      {neighborhoodOptionsMemo.length
                        ? selectedNeighborhoodLabel
                        : 'Sin vecindarios disponibles'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] bg-slate-900 border-white/10 text-white" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar vecindario..."
                      value={neighborhoodSearch}
                      onValueChange={setNeighborhoodSearch}
                      className="text-slate-900 dark:text-white placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty>Sin resultados</CommandEmpty>
                      <CommandGroup>
                        {filteredNeighborhoodOptions.map((option) => (
                          <CommandItem
                            key={option.id}
                            value={`${option.label.toLowerCase()}-${option.id}`}
                            onSelect={() => handleNeighborhoodSelect(option.id)}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300">Ciudad</Label>
                <Input
                  value={locationFormData.cityName || 'Sin ciudad'}
                  readOnly
                  className="bg-slate-800/50 border-white/10 text-gray-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">País</Label>
                <Input
                  value={locationFormData.countryName || 'Sin país'}
                  readOnly
                  className="bg-slate-800/50 border-white/10 text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">ID de dirección</Label>
              <Input
                value={locationFormData.idAddress ?? ''}
                readOnly
                className="bg-slate-800/50 border-white/10 text-gray-400"
              />
              <p className="text-xs text-gray-500">
                Este valor es de solo lectura y se actualiza automáticamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Estado</Label>
              <select
                value={locationFormData.active ? 'true' : 'false'}
                onChange={(e) =>
                  setLocationFormData((prev) => ({ ...prev, active: e.target.value === 'true' }))
                }
                className="w-full rounded-md bg-slate-800/50 border border-white/10 text-white px-3 py-2 text-sm focus:border-green-500/50 focus:outline-none"
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseLocationDialog}
              disabled={locationSubmitting}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitLocation}
              disabled={locationSubmitting}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              {locationSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Location Confirmation */}
      <Dialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-500" />
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span>Eliminar ubicación</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta acción eliminará la ubicación y sus dispositivos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-gray-300">
              ¿Deseas eliminar la ubicación{' '}
              <span className="font-semibold text-white">{locationToDelete?.name}</span>?
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocationToDelete(null)}
              disabled={deletingLocation}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeleteLocation}
              disabled={deletingLocation}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
            >
              {deletingLocation ? (
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

      {/* Device Dialog */}
      <Dialog
        open={isDeviceDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsDeviceDialogOpen(true);
          } else {
            handleCloseDeviceDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span>Editar Dispositivo</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifica el nombre y tipo del dispositivo asociado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nombre (opcional)</Label>
              <Input
                value={deviceFormData.name}
                onChange={(e) =>
                  setDeviceFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej: Sensor Biométrico A1"
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tipo *</Label>
              <Input
                value={deviceFormData.deviceType}
                onChange={(e) =>
                  setDeviceFormData((prev) => ({ ...prev, deviceType: e.target.value }))
                }
                placeholder="wearable, medical_device..."
                className="bg-slate-800/50 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCloseDeviceDialog}
              disabled={deviceSubmitting}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitDevice}
              disabled={deviceSubmitting}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
            >
              {deviceSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Device Confirmation */}
      <Dialog open={!!deviceToDelete} onOpenChange={(open) => !open && setDeviceToDelete(null)}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-amber-500" />
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-xl">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <span>Eliminar dispositivo</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <p className="text-gray-300">
              ¿Deseas eliminar el dispositivo{' '}
              <span className="font-semibold text-white">
                {deviceToDelete?.name || `ID ${deviceToDelete?.id ?? ''}`}
              </span>
              ?
            </p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeviceToDelete(null)}
              disabled={deletingDevice}
              className="border-white/10 hover:bg-white/10 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDeleteDevice}
              disabled={deletingDevice}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-lg"
            >
              {deletingDevice ? (
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
              ¿Estás seguro de que deseas eliminar la empresa{' '}
              <span className="font-bold text-white">{deletingEnterprise?.name}</span>?
            </p>

            {deletingEnterprise && ((deletingEnterprise.employees?.length || 0) > 0 || (deletingEnterprise.locations?.length || 0) > 0) && (
              <div className="space-y-2">
                {deletingEnterprise.employees && deletingEnterprise.employees.length > 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-sm text-amber-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Esta empresa tiene {deletingEnterprise.employees.length} empleado(s) asignado(s)
                    </p>
                  </div>
                )}
                {deletingEnterprise.locations && deletingEnterprise.locations.length > 0 && (
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-300 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Esta empresa tiene {deletingEnterprise.locations.length} ubicación(es) registrada(s)
                    </p>
                  </div>
                )}
              </div>
            )}
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
                  Eliminar Empresa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}