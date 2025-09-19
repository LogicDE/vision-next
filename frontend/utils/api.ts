export const API_URL = (() => {
  if (typeof window !== 'undefined') {
    // Si estamos en el navegador, revisar si estamos en Docker
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_API_URL;
    return 'http://cms-backend:8000'; // hostname del contenedor Docker
  }
  // Server-side fallback (SSG / SSR)
  return process.env.NEXT_PUBLIC_API_URL;
})();

export const MICROSERVICES_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_MICROSERVICES_URL;
    return 'http://microservices-backend:9000';
  }
  return process.env.NEXT_PUBLIC_MICROSERVICES_URL;
})();

export const WEBSOCKET_URL = (() => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost') return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    return 'ws://cms-backend:8000/ws';
  }
  return process.env.NEXT_PUBLIC_WEBSOCKET_URL;
})();
