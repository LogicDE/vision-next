import { component$, Slot, type QwikIntrinsicElements } from '@builder.io/qwik';
import { cn } from '../../lib/utils';

export interface LabelProps extends QwikIntrinsicElements['label'] {}

export const Label = component$<LabelProps>(({ class: className, ...props }) => {
  return (
    <label
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    >
      <Slot />
    </label>
  );
});
