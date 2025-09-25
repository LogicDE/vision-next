import { component$, useStyles$ } from '@builder.io/qwik';
import globalStyles from './global.css?inline';
import { App } from './app';

export const Root = component$(() => {
  useStyles$(globalStyles);

  return (
    <html lang="es" class="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VisionNext Monitor - Sistema de Monitoreo Bicognitivo</title>
        <meta name="description" content="Sistema avanzado de monitoreo de datos bicognitivos con IA integrada" />
        <meta name="keywords" content="salud, monitoreo, bicognitivo, IA, bienestar" />
      </head>
      <body class="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <App />
      </body>
    </html>
  );
});
