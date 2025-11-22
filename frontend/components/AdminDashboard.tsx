'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  Loader2,
  User,
  Sparkles,
  Search,
  Settings,
  Brain,
  X,
  Menu
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
import { DailyEmployeeMetrics } from '@/components/admin/DailyEmployeeMetrics';
import { DailyGroupMetrics } from '@/components/admin/DailyGroupMetrics';
import { EventsDashboard } from '@/components/admin/EventsDashboard';
import { RolesManagement } from '@/components/admin/RolesManagement';
import HealthReport from '@/components/admin/HealthReport';
import { SurveyVersionsManagement } from '@/components/admin/SurveyVersionsManagement';
import { QuestionsManagement } from '@/components/admin/QuestionsManagement';

// Tabs configuration - Organized by category
const TABS_CONFIG = [
  {
    category: 'Principal',
    tabs: [
      { value: 'overview', label: 'Dashboard', icon: TrendingUp, component: AdminStats, color: 'blue' },
      { value: 'kpis', label: 'KPIs', icon: BarChart3, component: KPIDashboard, color: 'indigo' },
      { value: 'report', label: 'Reporte', icon: Brain, component: HealthReport, color: 'purple' },
    ]
  },
  {
    category: 'Gestión',
    tabs: [
      { value: 'users', label: 'Usuarios', icon: Users, component: UsersManagement, color: 'pink' },
      { value: 'roles', label: 'Roles', icon: Shield, component: RolesManagement, color: 'cyan' },
      { value: 'enterprises', label: 'Empresas', icon: Building2, component: EnterprisesManagement, color: 'green' },
      { value: 'groups', label: 'Grupos', icon: Activity, component: GroupsManagement, color: 'orange' },
      { value: 'events', label: 'Eventos', icon: BarChart3, component: EventsDashboard, color: 'yellow' },
      { value: 'surveys', label: 'Encuestas', icon: FileText, component: SurveysDashboard, color: 'fuchsia' },
      { value: 'interventions', label: 'Intervenciones', icon: Bell, component: InterventionsManagement, color: 'teal' },
    ]
  },
  {
    category: 'Evaluación del bienestar',
    tabs: [
      { value: 'survey-versions', label: 'Ver. Encuestas', icon: FileText, component: SurveyVersionsManagement, color: 'fuchsia' },
      { value: 'questions', label: 'Preguntas', icon: FileText, component: QuestionsManagement, color: 'cyan' },
    ]
  },
  {
    category: 'Métricas',
    tabs: [
      { value: 'daily-emp', label: 'M. Empleados', icon: User, component: DailyEmployeeMetrics, color: 'blue' },
      { value: 'daily-group', label: 'M. Grupos', icon: Users, component: DailyGroupMetrics, color: 'rose' },
    ]
  },
  {
    category: 'Sistema',
    tabs: [
      { value: 'alerts', label: 'Alertas', icon: AlertCircle, component: AlertsManagement, color: 'red' },
      { value: 'auditlogs', label: 'Logs', icon: FileText, component: AuditLogsManagement, color: 'slate' },
    ]
  }
];

// Flatten tabs for easy access
const ALL_TABS = TABS_CONFIG.flatMap(cat => cat.tabs);

// Color mappings
const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  fuchsia: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  teal: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  lime: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  slate: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

// Memoized Header Component
const DashboardHeader = memo(({ 
  user, 
  loading, 
  isLoggingOut, 
  notificationCount, 
  onLogout, 
  getUserInitials 
}: any) => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-2xl">
    <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-[1920px] mx-auto">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            VisionNext
          </h1>
          <p className="text-[9px] text-gray-500 font-medium tracking-wider uppercase">Admin Portal</p>
        </div>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Buscar usuarios, empresas..."
            className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:bg-slate-900/70 transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 lg:space-x-3">
        {/* Secured Badge */}
        <Badge className="hidden lg:flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
          <Shield className="h-3 w-3" />
          <span className="text-xs font-medium">Secured</span>
        </Badge>
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative hover:bg-white/10 text-gray-300 hover:text-white h-9 w-9 p-0 transition-colors"
          aria-label="Notificaciones"
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
          className="hidden md:flex hover:bg-white/10 text-gray-300 hover:text-white h-9 w-9 p-0 transition-colors"
          aria-label="Configuración"
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
              <Avatar className="h-9 w-9 ring-2 ring-blue-500/30 hover:ring-blue-500/50 transition-all">
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
          onClick={onLogout}
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
));

DashboardHeader.displayName = 'DashboardHeader';

export function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const notificationCount = 3;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  const getUserInitials = useCallback(() => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  }, [user?.name]);

  const activeTabData = useMemo(() => 
    ALL_TABS.find(tab => tab.value === activeTab), 
    [activeTab]
  );

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return TABS_CONFIG;
    
    const query = searchQuery.toLowerCase();
    return TABS_CONFIG.map(category => ({
      ...category,
      tabs: category.tabs.filter(tab => 
        tab.label.toLowerCase().includes(query)
      )
    })).filter(category => category.tabs.length > 0);
  }, [searchQuery]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    setSidebarOpen(false);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SessionTimeout />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Header */}
      <DashboardHeader
        user={user}
        loading={loading}
        isLoggingOut={isLoggingOut}
        notificationCount={notificationCount}
        onLogout={handleLogout}
        getUserInitials={getUserInitials}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-40
          w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
        `}>
          <div className="p-4 space-y-6">
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X className="h-4 w-4 mr-2" />
              Cerrar menú
            </Button>

            {/* Search in Sidebar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar sección..."
                className="w-full h-9 pl-10 pr-4 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Navigation Categories */}
            {filteredTabs.map((category, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  {category.category}
                </h3>
                {category.tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => handleTabChange(tab.value)}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                        transition-all group relative
                        ${isActive 
                          ? `${COLOR_MAP[tab.color]} font-medium shadow-lg` 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {isActive && (
                        <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                      )}
                      <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                      <span className="text-sm truncate">{tab.label}</span>
                      {isActive && (
                        <Sparkles className="h-3 w-3 ml-auto animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden border-white/10 bg-slate-900/50 hover:bg-slate-800/50"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <div>
                  <div className="flex items-center space-x-3">
                    {activeTabData && <activeTabData.icon className="h-7 w-7 text-blue-400" />}
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                      {activeTabData?.label || 'Dashboard'}
                    </h2>
                  </div>
                  {user && (
                    <p className="text-sm text-gray-400 mt-1">
                      Bienvenido, <span className="font-semibold text-blue-400">{user.name}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* User Info Badge - Mobile */}
              {user && (
                <Badge className="md:hidden text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {user.role}
                </Badge>
              )}
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in-50 duration-300">
              <Card className="bg-slate-900/50 backdrop-blur-sm border-white/10 shadow-2xl">
                <CardContent className="p-6">
                  {activeTabData && <activeTabData.component />}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
        <div className="px-4 lg:px-6 py-4 max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
            <p>© 2025 VisionNext. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs border-white/10 text-gray-400">v2.1.0</Badge>
              <span className="text-xs hidden sm:inline">Sistema de Analytics Empresarial</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}