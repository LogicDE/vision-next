import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VisionNext Monitor - Sistema de Monitoreo Bicognitivo',
  description: 'Sistema avanzado de monitoreo bicognitivo con IA integrada',
  keywords: ['salud', 'monitoreo', 'bicognitivo', 'IA', 'bienestar'],
};

export function generateViewport() {
  return { width: 'device-width', initialScale: 1 };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <head>
        {/* Forzamos favicon explícitamente */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${inter.className} h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800`}
      >
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
