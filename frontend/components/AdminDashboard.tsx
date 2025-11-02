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
  BarChart3,
  Shield,
  Bell,
  FileText,
  ChevronDown,
  Loader2,
  User,
  Sparkles,
  Search,
  Settings,
  Brain
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
import { SurveysDashboard } from '@/components/admin/SurveysDashboard';
import { InterventionsManagement } from '@/components/admin/InterventionsManagement';
import { ReportsDashboard } from '@/components/admin/ReportsDashboard';
import { PredictionDashboard } from '@/components/admin/PredictionDashboard';
import { DailyEmployeeMetrics } from '@/components/admin/DailyEmployeeMetrics';
import { DailyGroupMetrics } from '@/components/admin/DailyGroupMetrics';
import { EventsDashboard } from '@/components/admin/EventsDashboard';
import { RolesManagement } from '@/components/admin/RolesManagement';
import HealthReport from '@/components/admin/HealthReport';


const TABS = [
  { value: 'overview', label: 'Overview', icon: TrendingUp, component: AdminStats, color: 'from-blue-500 to-cyan-500' },
  { value: 'users', label: 'Usuarios', icon: Users, component: UsersManagement, color: 'from-purple-500 to-pink-500' },
  { value: 'roles', label: 'Roles', icon: Shield, component: RolesManagement, color: 'from-cyan-500 to-teal-500' },
  { value: 'enterprises', label: 'Empresas', icon: Building2, component: EnterprisesManagement, color: 'from-green-500 to-emerald-500' },
  { value: 'groups', label: 'Grupos', icon: Activity, component: GroupsManagement, color: 'from-orange-500 to-amber-500' },
  
  { value: 'events', label: 'Eventos', icon: BarChart3, component: EventsDashboard, color: 'from-yellow-500 to-orange-500' },

  { value: 'kpis', label: 'KPIs', icon: TrendingUp, component: KPIDashboard, color: 'from-indigo-500 to-purple-500' },
  { value: 'report', label: 'Reporte', icon: Brain, component: HealthReport, color: 'from-indigo-500 to-purple-500' },
  { value: 'daily-emp-metrics', label: 'Daily M Empleados', icon: User, component: DailyEmployeeMetrics, color: 'from-blue-400 to-indigo-500' },
  { value: 'daily-group-metrics', label: 'Daily M Grupos', icon: Users, component: DailyGroupMetrics, color: 'from-pink-500 to-rose-500' },

  { value: 'alerts', label: 'Alertas', icon: AlertCircle, component: AlertsManagement, color: 'from-red-500 to-pink-500' },
  { value: 'auditlogs', label: 'Audit Logs', icon: FileText, component: AuditLogsManagement, color: 'from-gray-500 to-slate-500' },

  { value: 'surveys', label: 'Encuestas', icon: FileText, component: SurveysDashboard, color: 'from-purple-400 to-fuchsia-500' },
  { value: 'interventions', label: 'Intervenciones', icon: Bell, component: InterventionsManagement, color: 'from-emerald-500 to-teal-500' },

  { value: 'reports', label: 'Reportes', icon: FileText, component: ReportsDashboard, color: 'from-yellow-400 to-green-400' },
  { value: 'prediction', label: 'Predicción IA', icon: Sparkles, component: PredictionDashboard, color: 'from-fuchsia-500 to-purple-600' },
];


export function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount] = useState(3);

  const activeTabData = TABS.find(tab => tab.value === activeTab);

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

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <SessionTimeout />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-lg">
        <div className="flex h-16 items-center px-4 lg:px-6 max-w-[1920px] mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-75"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                VisionNext
              </h1>
              <p className="text-[9px] text-gray-500 font-medium tracking-wider">ADMIN PORTAL</p>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios, empresas..."
                className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center space-x-2 lg:space-x-3">
            {/* Secured Badge */}
            <Badge className="hidden lg:flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              <Shield className="h-3 w-3" />
              <span className="text-xs font-medium">Secured</span>
            </Badge>
            
            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative hover:bg-white/10 text-gray-300 hover:text-white h-9 w-9 p-0"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">
                  {notificationCount}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:flex hover:bg-white/10 text-gray-300 hover:text-white h-9 w-9 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* User Info - Desktop */}
            <div className="hidden md:flex items-center space-x-3 pl-3 ml-3 border-l border-white/10">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-sm text-gray-400">Cargando...</span>
                </div>
              ) : user ? (
                <>
                  <div className="text-sm text-right">
                    <p className="font-semibold text-white">{user.name}</p>
                    <div className="flex items-center justify-end space-x-1.5">
                      <Badge className="text-[10px] px-1.5 py-0 h-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {user.role.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">• {user.organization}</span>
                    </div>
                  </div>
                  <Avatar className="h-9 w-9 ring-2 ring-blue-500/30">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">No autenticado</span>
                </div>
              )}
            </div>

            {/* Mobile User Avatar */}
            <div className="md:hidden">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
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
              className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 h-9"
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
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Panel de Control
              </h2>
              {user && (
                <Badge className="hidden sm:inline-flex text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                  ID: {user.id}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400 mt-1.5">
              {user ? (
                <>
                  Bienvenido, <span className="font-semibold text-blue-400">{user.name}</span> 
                  {' '}- Gestiona empresas, usuarios, grupos y monitorea datos en tiempo real
                </>
              ) : (
                'Gestiona empresas, usuarios, grupos y monitorea datos en tiempo real'
              )}
            </p>
          </div>
          
          {/* Mobile Tab Selector */}
          <Button 
            variant="outline" 
            className="sm:hidden w-full justify-between border-white/10 bg-slate-900/50 hover:bg-slate-800/50 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="flex items-center space-x-2">
              {activeTabData && <activeTabData.icon className="h-4 w-4" />}
              <span>{activeTabData?.label}</span>
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="relative">
              <TabsList className="inline-flex w-auto bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/10">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger 
                      key={tab.value} 
                      value={tab.value}
                      className={`
                        relative flex items-center space-x-2 px-4 py-2.5 rounded-lg
                        transition-all whitespace-nowrap
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-400 hover:text-gray-300'
                        }
                        data-[state=active]:shadow-lg
                      `}
                    >
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg opacity-20`}></div>
                      )}
                      <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-white' : ''}`} />
                      <span className="text-sm font-medium relative z-10">{tab.label}</span>
                      {isActive && (
                        <Sparkles className="h-3 w-3 text-white/60 relative z-10 animate-pulse" />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 p-2 space-y-1 animate-in slide-in-from-top duration-200">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setActiveTab(tab.value);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-white/10 text-white' 
                        : 'hover:bg-white/5 text-gray-400'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''}`} />
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
              <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="px-4 lg:px-6 py-4 max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <p>© 2025 VisionNext. Todos los derechos reservados.</p>
              {user && (
                <span className="hidden lg:inline text-xs text-gray-500">
                  • Sesión activa: {user.email}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs border-white/10 text-gray-400">v2.1.0</Badge>
              <span className="text-xs">Sistema de Analytics Empresarial</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}