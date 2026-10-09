export const uiSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const uiColors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'tertiary', 'background'] as const;
export const uiRadii = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;

export type UISize = (typeof uiSizes)[number];
export type UIColor = (typeof uiColors)[number];
export type UIRadius = (typeof uiRadii)[number];

export const radiusClasses: Record<UIRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

export const toneClasses: Record<UIColor, { solid: string; soft: string; outline: string; text: string }> = {
  default: {
    solid: 'bg-foreground text-background',
    soft: 'bg-muted text-foreground',
    outline: 'border-border text-foreground',
    text: 'text-foreground',
  },
  primary: {
    solid: 'bg-primary text-primary-foreground',
    soft: 'bg-primary/10 text-primary',
    outline: 'border-primary/35 text-primary',
    text: 'text-primary',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-foreground',
    soft: 'bg-secondary/15 text-secondary-foreground',
    outline: 'border-secondary/40 text-secondary-foreground',
    text: 'text-secondary-foreground',
  },
  tertiary: {
    solid: 'bg-tertiary text-tertiary-foreground',
    soft: 'bg-tertiary/10 text-tertiary',
    outline: 'border-tertiary/35 text-tertiary',
    text: 'text-tertiary',
  },
  success: {
    solid: 'bg-success text-success-foreground',
    soft: 'bg-success/10 text-success',
    outline: 'border-success/35 text-success',
    text: 'text-success',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground',
    soft: 'bg-warning/10 text-warning',
    outline: 'border-warning/35 text-warning',
    text: 'text-warning',
  },
  danger: {
    solid: 'bg-destructive text-destructive-foreground',
    soft: 'bg-destructive/10 text-destructive',
    outline: 'border-destructive/35 text-destructive',
    text: 'text-destructive',
  },
  info: {
    solid: 'bg-info text-info-foreground',
    soft: 'bg-info/10 text-info',
    outline: 'border-info/35 text-info',
    text: 'text-info',
  },
  neutral: {
    solid: 'bg-neutral text-neutral-foreground',
    soft: 'bg-neutral/10 text-neutral',
    outline: 'border-neutral/30 text-neutral',
    text: 'text-muted-foreground',
  },
  background: {
    solid: 'bg-background text-foreground',
    soft: 'bg-muted text-foreground',
    outline: 'border-border text-foreground',
    text: 'text-foreground',
  },
};
