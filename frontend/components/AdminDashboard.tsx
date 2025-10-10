'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Building2, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  LogOut,
  Heart,
  Brain,
  Shield,
  Bell,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminStats } from '@/components/admin/AdminStats';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { EnterprisesManagement } from '@/components/admin/EnterprisesManagement'; // ✅ Reemplazado
import { KPIDashboard } from '@/components/admin/KPIDashboard';
import { AlertsManagement } from '@/components/admin/AlertsManagement';
import { GroupsManagement } from '@/components/admin/GroupsManagement';
import { SessionTimeout } from '@/components/SessionTimeoutModal';

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <SessionTimeout />
      
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-4 lg:px-6">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500" />
            <Brain className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VisionNext Admin
            </h1>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <Badge variant="secondary" className="hidden md:flex items-center space-x-1">
              <Shield className="h-3 w-3" />
              <span>XML Backend</span>
            </Badge>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-500">{user?.organization}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Panel de Control</h2>
            <p className="text-muted-foreground">
              Gestiona empresas, usuarios, grupos y monitorea datos bicognitivos
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs List */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-12">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="enterprises" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">KPIs</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tabs Content */}
          <TabsContent value="overview">
            <AdminStats />
          </TabsContent>

          <TabsContent value="users">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="enterprises">
            <EnterprisesManagement />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsManagement />
          </TabsContent>

          <TabsContent value="kpis">
            <KPIDashboard />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
