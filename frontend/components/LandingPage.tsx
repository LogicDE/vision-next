'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, AlertCircle, Menu, X, ChevronRight, BarChart3, Shield, Zap, CheckCircle, Star, ArrowRight, Sparkles, Globe, Lock, Rocket } from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (path: string) => {
  router.push(path);
};

  const parallaxOffset = {
    x: (mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth : 1920) / 2) / 50,
    y: (mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 1080) / 2) / 50,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950"></div>
        <div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
        <div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ 
            transform: `translate(${-parallaxOffset.x}px, ${-parallaxOffset.y}px)`,
            transition: 'transform 0.3s ease-out',
            animationDelay: '1s'
          }}
        ></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-xl' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNavigation('/')}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                VisionNext
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors relative group">
                Características
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors relative group">
                Beneficios
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <Button 
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all"
                onClick={() => handleNavigation('/login')}
              >
                <span className="relative z-10 flex items-center">
                  Iniciar Sesión
                  <Sparkles className="w-4 h-4 ml-2" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              <a href="#features" className="block text-gray-300 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors">
                Características
              </a>
              <a href="#benefits" className="block text-gray-300 hover:text-white py-3 px-4 rounded-lg hover:bg-white/10 transition-colors">
                Beneficios
              </a>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => handleNavigation('/login')}
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-sm font-medium text-blue-300 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Plataforma de Espacios Saludables e Interactivos con Monitoreo Biocognitivo
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                <span className="block text-white">Potencia el</span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Bienestar
                </span>
                <span className="block text-white">y Productividad</span>
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                Transforma datos en insights accionables. Monitorea el bienestar de tus equipos con 
                <span className="text-blue-400 font-semibold"> IA en tiempo real</span> y toma decisiones 
                estratégicas que impulsan resultados.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl shadow-blue-500/50 hover:shadow-purple-500/50 transition-all transform hover:scale-105 text-lg px-10 py-7"
                  onClick={() => handleNavigation('/login')}
                >
                  <span className="relative z-10 flex items-center">
                    Iniciar Sesión Ahora
                    <Rocket className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-8">
                <div className="flex items-center space-x-2">
                  <div className="text-left">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">500+ empresas</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20"></div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">98%</p>
                  <p className="text-xs text-gray-400">Satisfacción</p>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">2.5x</p>
                  <p className="text-xs text-gray-400">ROI Promedio</p>
                </div>
              </div>
            </div>

            {/* Right Visual - Interactive Dashboard Mockup */}
            <div className="relative lg:scale-110">
              {/* Floating Elements */}
              <div className="absolute -top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-50 blur-xl animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl opacity-50 blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-1 shadow-2xl border border-white/10">
                  <div className="bg-slate-950/50 backdrop-blur-xl rounded-3xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs text-gray-400">Dashboard Overview</div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6 space-y-4">
                      {/* Stat Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: Activity, label: 'Engagement', value: '94%', color: 'from-blue-500 to-cyan-500', active: activeFeature === 0 },
                          { icon: TrendingUp, label: 'Productividad', value: '+28%', color: 'from-purple-500 to-pink-500', active: activeFeature === 1 },
                        ].map((stat, i) => (
                          <div 
                            key={i}
                            className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.active ? 'opacity-100 scale-105' : 'opacity-60 scale-100'} transition-all duration-500`}
                          >
                            <div className="absolute inset-0 bg-slate-950/20 rounded-2xl"></div>
                            <div className="relative">
                              <stat.icon className="w-6 h-6 text-white mb-2" />
                              <div className="text-2xl font-bold text-white">{stat.value}</div>
                              <div className="text-xs text-white/80">{stat.label}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chart Area */}
                      <div className="relative h-32 bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-end justify-between h-full space-x-2">
                          {[40, 65, 45, 80, 60, 90, 75, 85].map((height, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300 hover:from-purple-500 hover:to-pink-500"
                              style={{ 
                                height: `${height}%`,
                                animationDelay: `${i * 0.1}s`,
                                opacity: 0.8 + (i * 0.025)
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>

                      {/* Activity Feed */}
                      <div className="space-y-2">
                        {[
                          { text: 'Grupo Alpha Sprint Completado', time: '2m ago', color: 'bg-green-500' },
                          { text: 'Nuevo insight generado', time: '5m ago', color: 'bg-blue-500' },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center space-x-3 p-3 bg-slate-900/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className={`w-2 h-2 rounded-full ${activity.color} animate-pulse`}></div>
                            <div className="flex-1 text-sm text-gray-300">{activity.text}</div>
                            <div className="text-xs text-gray-500">{activity.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Success Card */}
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-4 border border-green-400/20 animate-bounce hidden lg:block">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">+45% Engagement</div>
                      <div className="text-xs text-white/80">vs. Mes Pasado</div>
                    </div>
                  </div>
                </div>

                {/* Floating Alert Card */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-2xl p-4 border border-blue-400/20 hidden lg:block" style={{ animation: 'bounce 2s infinite', animationDelay: '0.5s' }}>
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-white" />
                    <div className="text-sm font-semibold text-white">Overview Analítica</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="py-12 px-4 border-y border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-400 mb-8">Confiado por equipos líderes en México y Latinoamérica</p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-32 h-12 bg-gradient-to-r from-white/10 to-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm font-medium text-blue-300">
              <Sparkles className="w-4 h-4 mr-2" />
              Características Poderosas
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
              <span className="text-white">Todo lo que necesitas en</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                una sola plataforma
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Herramientas diseñadas específicamente para monitorear y mejorar el potencial de tu equipo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: 'Gestión de Equipos',
                description: 'Organiza equipos y grupos con flujos de datos para monitorear su salud',
                gradient: 'from-purple-500 to-purple-600',
                delay: '0s'
              },
              {
                icon: Activity,
                title: 'Monitoreo en Tiempo Real',
                description: 'Seguimiento continuo de KPIs críticos con alertas inteligentes y dashboards unicos segun el usuario u administrador.',
                gradient: 'from-green-500 to-emerald-600',
                delay: '0.1s'
              },
              {
                icon: TrendingUp,
                title: 'Analytics Avanzado',
                description: 'IA y machine learning para predecir tendencias y optimizar decisiones estratégicas mediante recomendaciones.',
                gradient: 'from-blue-500 to-cyan-600',
                delay: '0.2s'
              },
              {
                icon: AlertCircle,
                title: 'Alertas Inteligentes',
                description: 'Notificaciones contextuales que priorizan lo importante y reducen el ruido.',
                gradient: 'from-red-500 to-pink-600',
                delay: '0.3s'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: feature.delay }}
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="relative h-full bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  
                  {/* Hover Arrow */}
                  <div className="mt-6 flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Explorar</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Bento Grid */}
      <section id="benefits" className="py-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Beneficios que{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                transforman
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Card */}
            <div className="lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <Shield className="w-12 h-12 text-blue-400 mb-6" />
                <h3 className="text-3xl font-bold text-white mb-4">Seguridad Empresarial con Autenticacion Redis</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  Encriptación de extremo a extremo, cumplimiento con la seguridad al Cliente. Tus datos están protegidos con los más altos estándares de la industria.
                </p>
                <div className="space-y-3">
                  {['Encriptación y control de acceso', 'Redis Auth', 'Seguridad Integrada'].map((item, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Small Cards */}
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group">
              <Zap className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Setup en 5 Minutos</h3>
              <p className="text-gray-400">Implementación instantánea sin necesidad de IT</p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group">
              <Globe className="w-10 h-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Integraciones</h3>
              <p className="text-gray-400">Conecta con nuestras herramientas empresariales</p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group">
              <Lock className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Control Total</h3>
              <p className="text-gray-400">Permisos granulares y roles personalizados</p>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all group">
              <BarChart3 className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Monitoreo Comprobado</h3>
              <p className="text-gray-400">40% de incremento en monitoreo y deteccion de salud</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50 animate-pulse"></div>
            <div className="relative bg-slate-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-center space-y-8">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Conoce al equipo || En DESARROLLO{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  hoy mismo
                </span>
              </h3>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Enfocados en el Desarrollo y mejora de VisionNext para integraciones empresariales
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-blue-400 transition-colors">Características</a></li>
                <li><a href="#benefits" className="hover:text-blue-400 transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Casos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Soporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-white text-lg">VisionNext</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2025 VisionNext. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}