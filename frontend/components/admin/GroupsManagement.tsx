'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Plus, Trash2, Edit, Save } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Group {
  id_group: number;
  name: string;
  manager?: { id: number; first_name: string; last_name: string };
  members?: any[];
  dailyMetrics?: any[];
  surveys?: any[];
}

export function GroupsManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState('');

  // 🔹 Obtener grupos
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener grupos');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear o actualizar grupo
  const saveGroup = async () => {
    try {
      const method = selectedGroup ? 'PUT' : 'POST';
      const url = selectedGroup
        ? `${API_URL}/groups/${selectedGroup.id_group}`
        : `${API_URL}/groups`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName }),
      });

      if (!res.ok) throw new Error('Error al guardar el grupo');
      await fetchGroups();
      setOpenModal(false);
      setGroupName('');
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error al guardar grupo:', error);
    }
  };

  // 🔹 Eliminar grupo
  const deleteGroup = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este grupo?')) return;
    try {
      const res = await fetch(`${API_URL}/groups/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar grupo');
      setGroups(groups.filter((g) => g.id_group !== id));
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  if (loading) return <div>Cargando grupos...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-green-600" />
              Gestión de Grupos
            </CardTitle>
            <CardDescription>Administra los grupos y sus métricas</CardDescription>
          </div>
          <Button
            onClick={() => {
              setSelectedGroup(null);
              setGroupName('');
              setOpenModal(true);
            }}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo Grupo
          </Button>
        </CardHeader>
      </Card>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center p-8 text-gray-500">No hay grupos disponibles.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group) => {
            const avgWellbeing =
              group.dailyMetrics && group.dailyMetrics.length > 0
                ? Math.round(
                    group.dailyMetrics.reduce((acc, m) => acc + m.value, 0) /
                      group.dailyMetrics.length
                  )
                : 0;

            return (
              <Card key={group.id_group} className="border-none shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="pb-3 flex justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <Building2 className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-500">
                        Manager: {group.manager?.first_name ?? '—'} {group.manager?.last_name ?? ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(group); setGroupName(group.name); setOpenModal(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteGroup(group.id_group)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm">
                    <span>Miembros: <strong>{group.members?.length ?? 0}</strong></span>
                    <span>Bienestar Promedio: <strong>{avgWellbeing}</strong></span>
                  </div>
                  <Badge variant="outline" className="mt-3">
                    {group.surveys?.length ?? 0} encuestas
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGroup ? 'Editar Grupo' : 'Nuevo Grupo'}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <DialogFooter>
            <Button onClick={() => setOpenModal(false)} variant="secondary">Cancelar</Button>
            <Button onClick={saveGroup}>
              <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
