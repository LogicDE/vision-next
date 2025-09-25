import { component$ } from '@builder.io/qwik';

export const LoadingSpinner = component$(() => {
  return (
    <div class="flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
});
