'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function SessionTimeout() {
  const { refreshToken, logout } = useAuth();
  const [showModal, setShowModal] = useState(false);

  let warningTimer: NodeJS.Timeout;
  let logoutTimer: NodeJS.Timeout;

  const resetTimers = () => {
    clearTimeout(warningTimer);
    clearTimeout(logoutTimer);

    warningTimer = setTimeout(() => setShowModal(true), 1000 * 60 * 4); // Aviso 1 min antes
    logoutTimer = setTimeout(() => {
      setShowModal(false);
      logout();
    }, 1000 * 60 * 5); // Logout a los 5 min
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimers));

    resetTimers();

    return () => events.forEach(e => window.removeEventListener(e, resetTimers));
  }, []);

  const continueSession = async () => {
    try {
      await refreshToken(); // Backend genera nuevo JWT y refresca cookie
      setShowModal(false);
      resetTimers(); // 🔹 Reiniciamos timers
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
