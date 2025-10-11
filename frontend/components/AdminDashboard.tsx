'use client';

import { useState, useEffect } from 'react';
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
  FileText,
  ChevronDown,
  Loader2,
  User
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { AdminStats } from '@/components/admin/AdminStats';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { EnterprisesManagement } from '@/components/admin/EnterprisesManagement';
import { KPIDashboard } from '@/components/admin/KPIDashboard';
import { AlertsManagement } from '@/components/admin/AlertsManagement';
import { GroupsManagement } from '@/components/admin/GroupsManagement';
import { AuditLogsManagement } from '@/components/admin/AuditLogsManagement'; 
import { SessionTimeout } from '@/components/SessionTimeoutModal';

const TABS = [
  { value: 'overview', label: 'Overview', icon: TrendingUp, component: AdminStats, color: 'text-blue-600' },
  { value: 'users', label: 'Usuarios', icon: Users, component: UsersManagement, color: 'text-purple-600' },
  { value: 'enterprises', label: 'Empresas', icon: Building2, component: EnterprisesManagement, color: 'text-green-600' },
  { value: 'groups', label: 'Grupos', icon: Activity, component: GroupsManagement, color: 'text-orange-600' },
  { value: 'kpis', label: 'KPIs', icon: TrendingUp, component: KPIDashboard, color: 'text-indigo-600' },
  { value: 'alerts', label: 'Alertas', icon: AlertCircle, component: AlertsManagement, color: 'text-red-600' },
  { value: 'auditlogs', label: 'Audit Logs', icon: FileText, component: AuditLogsManagement, color: 'text-gray-600' },
];

export function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeTabData = TABS.find(tab => tab.value === activeTab);

  // Función de logout mejorada con feedback visual
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Obtener iniciales del usuario
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  // Badge de rol con color dinámico
  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'user':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:to-slate-800">
      <SessionTimeout />

      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="flex h-16 items-center px-4 lg:px-6 max-w-[1920px] mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-red-500 animate-pulse" />
              <Brain className="h-4 w-4 text-blue-500 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                VisionNext
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">ADMIN PORTAL</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center space-x-3">
            {/* Secured Badge */}
            <Badge variant="secondary" className="hidden lg:flex items-center space-x-1 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Shield className="h-3 w-3" />
              <span className="text-xs font-medium">Secured</span>
            </Badge>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hover:bg-blue-50">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            </Button>
            
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-3 pl-3 border-l">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : user ? (
                <>
                  <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${getRoleBadgeColor()}`}>
                        {user.role.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">• {user.organization}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No autenticado</span>
                </div>
              )}
            </div>

            {/* Mobile User Avatar */}
            <div className="md:hidden">
              <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {loading ? '...' : getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut || loading}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Panel de Control
              </h2>
              {user && (
                <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                  ID: {user.id}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user ? (
                <>
                  Bienvenido, <span className="font-semibold text-gray-900">{user.name}</span> 
                  {' '}- Gestiona empresas, usuarios, grupos y monitorea datos bicognitivos
                </>
              ) : (
                'Gestiona empresas, usuarios, grupos y monitorea datos bicognitivos'
              )}
            </p>
          </div>
          
          {/* Mobile Tab Selector */}
          <div className="sm:hidden">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="flex items-center space-x-2">
                {activeTabData && <activeTabData.icon className="h-4 w-4" />}
                <span>{activeTabData?.label}</span>
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs - Scrollable */}
          <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="relative">
              <TabsList className="inline-flex w-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm border">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className="flex items-center space-x-2 px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all whitespace-nowrap"
                    >
                      <Icon className={`h-4 w-4 ${activeTab === tab.value ? tab.color : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-white rounded-lg shadow-lg border p-2 space-y-1 animate-in slide-in-from-top duration-200">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.value 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${activeTab === tab.value ? tab.color : 'text-gray-400'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Content with Animation */}
          {TABS.map(tab => (
            <TabsContent 
              key={tab.value} 
              value={tab.value}
              className="animate-in fade-in-50 duration-300"
            >
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-12">
        <div className="px-4 lg:px-6 py-4 max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <p>© 2025 VisionNext. Todos los derechos reservados.</p>
              {user && (
                <span className="hidden lg:inline text-xs text-gray-400">
                  • Sesión activa: {user.email}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">v2.1.0</Badge>
              <span className="text-xs">Sistema de Salud Bicognitiva</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}