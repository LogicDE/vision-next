import { component$, Slot } from '@builder.io/qwik';
import { cn } from '../../lib/utils';
import type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from '../../types/ui';

export const Card = component$<CardProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      <Slot />
    </div>
  );
});

export const CardHeader = component$<CardHeaderProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export const CardTitle = component$<CardTitleProps>(({ class: className, ...props }) => {
  return (
    <h3
      class={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      <Slot />
    </h3>
  );
});

export const CardDescription = component$<CardDescriptionProps>(({ class: className, ...props }) => {
  return (
    <p
      class={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      <Slot />
    </p>
  );
});

export const CardContent = component$<CardContentProps>(({ class: className, ...props }) => {
  return (
    <div class={cn('p-6 pt-0', className)} {...props}>
      <Slot />
    </div>
  );
});

export const CardFooter = component$<CardFooterProps>(({ class: className, ...props }) => {
  return (
    <div
      class={cn('flex items-center p-6 pt-0', className)}
      {...props}
    >
      <Slot />
    </div>
  );
});
