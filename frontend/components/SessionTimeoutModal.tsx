'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, AlertTriangle, RefreshCw, LogOut, Loader2 } from 'lucide-react';

//No modificar por ahora

// 🕒 Configuración realista:
const WARNING_TIME = 1000 * 60 * 3; // aviso tras 3 minutos de inactividad
const LOGOUT_TIME = 1000 * 60 * 4; // cierre tras 4 minutos sin interacción
const COUNTDOWN_DURATION = 60; // segundos visibles

export function SessionTimeout() {
  const { refreshToken, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const warningTimer = useRef<NodeJS.Timeout>();
  const logoutTimer = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timeout>();

  const clearAllTimers = useCallback(() => {
    clearTimeout(warningTimer.current);
    clearTimeout(logoutTimer.current);
    clearInterval(countdownInterval.current);
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(COUNTDOWN_DURATION);
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  }, []);

  const resetTimers = useCallback(() => {
    clearAllTimers();
    warningTimer.current = setTimeout(() => {
      setShowModal(true);
      startCountdown();
    }, WARNING_TIME);
    logoutTimer.current = setTimeout(() => {
      setShowModal(false);
      logout();
    }, LOGOUT_TIME);
  }, [clearAllTimers, startCountdown, logout]);

  const handleUserActivity = useCallback(() => {
    setShowModal(false);
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove'];
    events.forEach((e) => window.addEventListener(e, handleUserActivity, { passive: true }));
    resetTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleUserActivity));
      clearAllTimers();
    };
  }, [handleUserActivity, resetTimers, clearAllTimers]);

  const continueSession = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshToken();
      setShowModal(false);
      resetTimers();
    } catch {
      logout();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshToken, logout, resetTimers]);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    setShowModal(false);
    logout();
  }, [logout, clearAllTimers]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const colors =
    countdown > 30
      ? { text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' }
      : countdown > 10
      ? { text: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' }
      : { text: 'text-red-400', gradient: 'from-red-500 to-pink-500' };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <AlertTriangle className="text-amber-400" /> Tu sesión está por expirar
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-6 space-y-6">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" className="text-slate-700" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={(2 * Math.PI * 56) * (1 - countdown / COUNTDOWN_DURATION)}
                className={colors.text}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock className="w-6 h-6 text-gray-400 mb-1" />
              <span className={`text-3xl font-bold ${colors.text}`}>{formatTime(countdown)}</span>
              <span className="text-xs text-gray-500 mt-1">restantes</span>
            </div>
          </div>

          <div className="text-center text-gray-300">
            <p>Por inactividad, tu sesión se cerrará en <span className="font-bold text-amber-400">{formatTime(countdown)}</span></p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto text-red-400 border-red-400/50 hover:bg-red-500/20">
            <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
          </Button>
          <Button onClick={continueSession} disabled={isRefreshing} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            {isRefreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {isRefreshing ? 'Renovando...' : 'Continuar Sesión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
