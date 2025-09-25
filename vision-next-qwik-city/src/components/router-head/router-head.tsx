import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export const RouterHead = component$(() => {
  return (
    <>
      <title>VisionNext Monitor - Sistema de Monitoreo Bicognitivo</title>
      <meta name="description" content="Sistema avanzado de monitoreo de datos bicognitivos con IA integrada" />
      <meta name="keywords" content="salud, monitoreo, bicognitivo, IA, bienestar" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </>
  );
});

export const head: DocumentHead = {
  title: 'VisionNext Monitor - Sistema de Monitoreo Bicognitivo',
  meta: [
    {
      name: 'description',
      content: 'Sistema avanzado de monitoreo de datos bicognitivos con IA integrada',
    },
    {
      name: 'keywords',
      content: 'salud, monitoreo, bicognitivo, IA, bienestar',
    },
  ],
};
