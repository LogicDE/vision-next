'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function SessionTimeout() {
  const { refreshToken, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const warningTimer = useRef<NodeJS.Timeout>();
  const logoutTimer = useRef<NodeJS.Timeout>();

  // Resetear timers
  const resetTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);

    // Aviso 1 min antes
    warningTimer.current = setTimeout(() => setShowModal(true), 1000 * 60 * 4);

    //De prueba
    warningTimer.current = setTimeout(() => setShowModal(true), 1000 * 10);


    // Logout a los 5 min
    logoutTimer.current = setTimeout(() => {
      setShowModal(false);
      logout();
    }, 1000 * 60 * 5);
  };

  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'touchmove'];
    const handleActivity = () => resetTimers();

    events.forEach(e => window.addEventListener(e, handleActivity));

    // Inicializamos timers
    resetTimers();

    return () => events.forEach(e => window.removeEventListener(e, handleActivity));
  }, []);

  const continueSession = async () => {
    try {
      await refreshToken(); 
      setShowModal(false);
      resetTimers(); // Reiniciar timers
    } catch {
      logout();
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} aria-describedby="session-timeout-desc">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tu sesión está por expirar</DialogTitle>
        </DialogHeader>
        <div id="session-timeout-desc" className="py-4">
          ¿Deseas continuar tu sesión o cerrar sesión?
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={logout}>Salir</Button>
          <Button onClick={continueSession}>Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
