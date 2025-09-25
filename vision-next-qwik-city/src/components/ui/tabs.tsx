import { component$, Slot, useSignal } from '@builder.io/qwik';
import { cn } from '../../lib/utils';
import type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from '../../types/ui';

export const Tabs = component$<TabsProps>(({ class: className, value, onValueChange$, ...props }) => {
  return (
    <div class={cn('w-full', className)} {...props}>
      <Slot />
    </div>
  );
});

export const TabsList = component$<TabsListProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export const TabsTrigger = component$<TabsTriggerProps>(({ class: className, value, ...props }) => {
  return (
    <button
      class={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    >
      <Slot />
    </button>
  );
});

export const TabsContent = component$<TabsContentProps>(({ class: className, value, ...props }) => {
  return (
    <div
      class={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});
