import type { QwikIntrinsicElements } from '@builder.io/qwik';

export interface ButtonProps extends QwikIntrinsicElements['button'] {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export interface InputProps extends QwikIntrinsicElements['input'] {}

export interface CardProps extends QwikIntrinsicElements['div'] {}

export interface CardHeaderProps extends QwikIntrinsicElements['div'] {}

export interface CardTitleProps extends QwikIntrinsicElements['h3'] {}

export interface CardDescriptionProps extends QwikIntrinsicElements['p'] {}

export interface CardContentProps extends QwikIntrinsicElements['div'] {}

export interface CardFooterProps extends QwikIntrinsicElements['div'] {}

export interface LabelProps extends QwikIntrinsicElements['label'] {}

export interface BadgeProps extends QwikIntrinsicElements['div'] {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export interface AvatarProps extends QwikIntrinsicElements['span'] {}

export interface AvatarImageProps extends QwikIntrinsicElements['img'] {}

export interface AvatarFallbackProps extends QwikIntrinsicElements['span'] {}

export interface TabsProps extends QwikIntrinsicElements['div'] {
  value?: string;
  onValueChange$?: (value: string) => void;
}

export interface TabsListProps extends QwikIntrinsicElements['div'] {}

export interface TabsTriggerProps extends QwikIntrinsicElements['button'] {
  value: string;
}

export interface TabsContentProps extends QwikIntrinsicElements['div'] {
  value: string;
}
