'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, AlertTriangle, RefreshCw, LogOut, Loader2 } from 'lucide-react';

export function SessionTimeout() {
  const { refreshToken, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const warningTimer = useRef<NodeJS.Timeout>();
  const logoutTimer = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timeout>();

  // Resetear timers
  const resetTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    // Aviso 1 min antes (en producción: 1000 * 60 * 4)
    warningTimer.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(60);
      startCountdown();
    }, 1000 * 10); // De prueba: 10 segundos

    // Logout a los 5 min (en producción: 1000 * 60 * 5)
    logoutTimer.current = setTimeout(() => {
      setShowModal(false);
      logout();
    }, 1000 * 60 * 5);
  };

  const startCountdown = () => {
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove'];
    const handleActivity = () => {
      if (!showModal) {
        resetTimers();
      }
    };

    events.forEach(e => window.addEventListener(e, handleActivity));

    // Inicializamos timers
    resetTimers();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [showModal]);

  const continueSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshToken(); 
      setShowModal(false);
      setCountdown(60);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      resetTimers();
    } catch {
      logout();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowModal(false);
    logout();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} aria-describedby="session-timeout-desc">
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl font-bold text-center">
            Tu sesión está por expirar
          </DialogTitle>
        </DialogHeader>

        <div id="session-timeout-desc" className="space-y-6 py-4">
          {/* Countdown Circle */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-700"
                />
                {/* Progress Circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - countdown / 60)}`}
                  className={`transition-all duration-1000 ${
                    countdown > 30 
                      ? 'text-blue-500' 
                      : countdown > 10 
                      ? 'text-amber-500' 
                      : 'text-red-500'
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Timer Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-gray-400 mb-1" />
                <span className={`text-3xl font-bold ${
                  countdown > 30 
                    ? 'text-blue-400' 
                    : countdown > 10 
                    ? 'text-amber-400' 
                    : 'text-red-400'
                }`}>
                  {formatTime(countdown)}
                </span>
                <span className="text-xs text-gray-500 mt-1">restantes</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="text-center space-y-2">
              <p className="text-gray-300">
                Por inactividad, tu sesión se cerrará automáticamente en <span className="font-bold text-amber-400">{formatTime(countdown)}</span>
              </p>
              <p className="text-sm text-gray-500">
                ¿Deseas continuar tu sesión?
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-blue-400 mb-1">
                <RefreshCw className="w-4 h-4" />
                <span className="text-xs font-medium">Continuar</span>
              </div>
              <p className="text-xs text-gray-400">Renovar sesión activa</p>
            </div>
            <div className="bg-slate-800/50 border border-white/10 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-400 mb-1">
                <LogOut className="w-4 h-4" />
                <span className="text-xs font-medium">Cerrar</span>
              </div>
              <p className="text-xs text-gray-400">Finalizar sesión</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={isRefreshing}
            className="w-full sm:w-auto border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
          <Button 
            onClick={continueSession}
            disabled={isRefreshing}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-purple-500/50 transition-all relative overflow-hidden group"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                Continuar Sesión
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </Button>
        </DialogFooter>

        {/* Progress Bar at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div 
            className={`h-full transition-all duration-1000 ${
              countdown > 30 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                : countdown > 10 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : 'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${(countdown / 60) * 100}%` }}
          ></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}