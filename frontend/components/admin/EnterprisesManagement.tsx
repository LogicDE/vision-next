'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Plus, Trash2, Edit, Save, Users, Settings, TrendingUp } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Enterprise {
  id: number;
  name: string;
  email: string;
  telephone: string;
  state: { id: number; name: string; country: { id: number; name: string } };
}

export function EnterprisesManagement() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', telephone: '', id_state: '' });

  // 🔹 Obtener empresas
  const fetchEnterprises = async () => {
    try {
      const res = await fetch(`${API_URL}/enterprises`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener empresas');
      const data = await res.json();
      setEnterprises(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear o actualizar empresa
  const saveEnterprise = async () => {
    try {
      const method = selectedEnterprise ? 'PUT' : 'POST';
      const url = selectedEnterprise
        ? `${API_URL}/enterprises/${selectedEnterprise.id}`
        : `${API_URL}/enterprises`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar la empresa');
      await fetchEnterprises();
      setOpenModal(false);
      setFormData({ name: '', email: '', telephone: '', id_state: '' });
      setSelectedEnterprise(null);
    } catch (error) {
      console.error('Error al guardar empresa:', error);
    }
  };

  // 🔹 Eliminar empresa
  const deleteEnterprise = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar esta empresa?')) return;
    try {
      const res = await fetch(`${API_URL}/enterprises/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar empresa');
      setEnterprises(enterprises.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error al eliminar empresa:', error);
    }
  };

  useEffect(() => {
    fetchEnterprises();
  }, []);

  if (loading) return <div>Cargando empresas...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-green-600" />
              Gestión de Empresas
            </CardTitle>
            <CardDescription>Administra empresas y sus estados</CardDescription>
          </div>
          <Button
            onClick={() => {
              setSelectedEnterprise(null);
              setFormData({ name: '', email: '', telephone: '', id_state: '' });
              setOpenModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Nueva Empresa
          </Button>
        </CardHeader>
      </Card>

      {/* Enterprises Grid */}
      {enterprises.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No hay empresas disponibles.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enterprises.map((enterprise) => (
            <Card key={enterprise.id} className="border-none shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-3 flex justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{enterprise.name}</h3>
                    <p className="text-sm text-gray-500">
                      {enterprise.state.name}, {enterprise.state.country.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEnterprise(enterprise);
                      setFormData({
                        name: enterprise.name,
                        email: enterprise.email,
                        telephone: enterprise.telephone,
                        id_state: enterprise.state.id.toString(),
                      });
                      setOpenModal(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteEnterprise(enterprise.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Email: <strong>{enterprise.email}</strong></div>
                <div>Teléfono: <strong>{enterprise.telephone}</strong></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEnterprise ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Nombre"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="Teléfono"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            className="mb-2"
          />
          <Input
            placeholder="ID Estado"
            value={formData.id_state}
            onChange={(e) => setFormData({ ...formData, id_state: e.target.value })}
          />

          <DialogFooter className="mt-2">
            <Button onClick={() => setOpenModal(false)} variant="secondary">Cancelar</Button>
            <Button onClick={saveEnterprise}>
              <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
