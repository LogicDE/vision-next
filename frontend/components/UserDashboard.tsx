'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Brain, Activity, Smartphone, LogOut, Settings, Bell, Zap, User, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { HealthMetrics } from '@/components/user/HealthMetrics';
import { MentalStateMonitor } from '@/components/user/MentalStateMonitor';
import { AIAssistant } from '@/components/user/AIAssistant';
import { UserSettings } from '@/components/user/UserSettings';
import { NotificationsPanel } from '@/components/user/NotificationsPanel';
import { SessionTimeout } from '@/components/SessionTimeoutModal';
import { UserHealthReport }  from '@/components/user/UserHealthReport';

const TABS = [
  { value: 'health', label: 'Salud', icon: Heart, component: HealthMetrics, color: 'from-red-500 to-pink-500' },
  { value: 'mental', label: 'Mental', icon: Brain, component: MentalStateMonitor, color: 'from-blue-500 to-indigo-500' },
  { value: 'ai', label: 'IA', icon: Zap, component: AIAssistant, color: 'from-purple-500 to-fuchsia-500' },
  { value: 'alerts', label: 'Alertas', icon: Bell, component: NotificationsPanel, color: 'from-yellow-500 to-orange-500' },
  { value: 'settings', label: 'Config', icon: Settings, component: UserSettings, color: 'from-gray-500 to-slate-500' },
  { value: 'report', label: 'Reporte', icon: Brain, component: UserHealthReport, color: 'from-indigo-500 to-purple-500' },
];

export function UserDashboard() {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('health');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const activeTabData = TABS.find(tab => tab.value === activeTab);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : user.name[0].toUpperCase();
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try { await logout(); } 
    finally { setIsLoggingOut(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <SessionTimeout />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-lg">
        <div className="flex h-16 items-center px-4 lg:px-6 max-w-[1920px] mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                VisionNext
              </h1>
              <p className="text-[9px] text-gray-500 font-medium tracking-wider">USER PORTAL</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="ml-auto flex items-center space-x-2 lg:space-x-3">
            <Button variant="ghost" size="sm" className="relative hover:bg-white/10 text-gray-300 hover:text-white h-9 w-9 p-0">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold animate-pulse">3</span>
            </Button>

            <div className="hidden md:flex items-center space-x-3 pl-3 ml-3 border-l border-white/10">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              ) : (
                <>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <Avatar className="h-9 w-9 ring-2 ring-blue-500/30">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </>
              )}
            </div>

            {/* Mobile Avatar */}
            <div className="md:hidden">
              <Avatar className="h-8 w-8 ring-2 ring-blue-500/30">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              disabled={isLoggingOut || loading}
              className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all disabled:opacity-50 h-9"
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 space-y-6 max-w-[1920px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-white">Panel Personal</h2>
          <span className="text-sm text-gray-400">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <div className="hidden sm:block overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <div className="relative">
              <TabsList className="inline-flex w-auto bg-slate-900/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/10">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger key={tab.value} value={tab.value} className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}>
                      {isActive && <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg opacity-20`}></div>}
                      <Icon className={`h-4 w-4 relative z-10 ${isActive ? 'text-white' : ''}`} />
                      <span className="text-sm font-medium relative z-10">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 p-2 space-y-1 animate-in slide-in-from-top duration-200">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;
                return (
                  <button key={tab.value} onClick={() => { setActiveTab(tab.value); setMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400'}`}>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : ''}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab Content */}
          {TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="animate-in fade-in-50 duration-300">
              <div className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-xl">
                <tab.component />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
