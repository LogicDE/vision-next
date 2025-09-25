import { component$, Slot } from '@builder.io/qwik';
import { cn } from '../../lib/utils';
import type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from '../../types/ui';

export const Avatar = component$<AvatarProps>(({ class: className, ...props }) => {
  return (
    <span
      class={cn(
        'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    >
      <Slot />
    </span>
  );
});

export const AvatarImage = component$<AvatarImageProps>(({ class: className, ...props }) => {
  return (
    <img
      class={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  );
});

export const AvatarFallback = component$<AvatarFallbackProps>(({ class: className, ...props }) => {
  return (
    <span
      class={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <Slot />
    </span>
  );
});
