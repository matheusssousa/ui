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

export const toneClasses: Record<UIColor, { solid: string; fill: string; onSolid: string; soft: string; outline: string; text: string; hoverSoft: string; hoverOutline: string }> = {
  default: {
    solid: 'bg-foreground text-background',
    fill: 'bg-foreground', onSolid: 'text-background', hoverSoft: 'hover:bg-muted/70', hoverOutline: 'hover:border-border',
    soft: 'bg-muted text-foreground',
    outline: 'border-border text-foreground',
    text: 'text-foreground',
  },
  primary: {
    solid: 'bg-primary text-primary-foreground',
    fill: 'bg-primary', onSolid: 'text-primary-foreground', hoverSoft: 'hover:bg-primary/15', hoverOutline: 'hover:border-primary/35',
    soft: 'bg-primary/10 text-primary-text',
    outline: 'border-primary/35 text-primary-text',
    text: 'text-primary-text',
  },
  secondary: {
    solid: 'bg-secondary text-secondary-foreground',
    fill: 'bg-secondary', onSolid: 'text-secondary-foreground', hoverSoft: 'hover:bg-secondary/15', hoverOutline: 'hover:border-secondary/35',
    soft: 'bg-secondary/10 text-secondary-text',
    outline: 'border-secondary/40 text-secondary-text',
    text: 'text-secondary-text',
  },
  tertiary: {
    solid: 'bg-tertiary text-tertiary-foreground',
    fill: 'bg-tertiary', onSolid: 'text-tertiary-foreground', hoverSoft: 'hover:bg-tertiary/15', hoverOutline: 'hover:border-tertiary/35',
    soft: 'bg-tertiary/10 text-tertiary-text',
    outline: 'border-tertiary/35 text-tertiary-text',
    text: 'text-tertiary-text',
  },
  success: {
    solid: 'bg-success text-success-foreground',
    fill: 'bg-success', onSolid: 'text-success-foreground', hoverSoft: 'hover:bg-success/15', hoverOutline: 'hover:border-success/35',
    soft: 'bg-success/10 text-success',
    outline: 'border-success/35 text-success',
    text: 'text-success',
  },
  warning: {
    solid: 'bg-warning text-warning-foreground',
    fill: 'bg-warning', onSolid: 'text-warning-foreground', hoverSoft: 'hover:bg-warning/15', hoverOutline: 'hover:border-warning/35',
    soft: 'bg-warning/10 text-warning',
    outline: 'border-warning/35 text-warning',
    text: 'text-warning',
  },
  danger: {
    solid: 'bg-destructive text-destructive-foreground',
    fill: 'bg-destructive', onSolid: 'text-destructive-foreground', hoverSoft: 'hover:bg-destructive/15', hoverOutline: 'hover:border-destructive/35',
    soft: 'bg-destructive/10 text-destructive',
    outline: 'border-destructive/35 text-destructive',
    text: 'text-destructive',
  },
  info: {
    solid: 'bg-info text-info-foreground',
    fill: 'bg-info', onSolid: 'text-info-foreground', hoverSoft: 'hover:bg-info/15', hoverOutline: 'hover:border-info/35',
    soft: 'bg-info/10 text-info',
    outline: 'border-info/35 text-info',
    text: 'text-info',
  },
  neutral: {
    solid: 'bg-neutral text-neutral-foreground',
    fill: 'bg-neutral', onSolid: 'text-neutral-foreground', hoverSoft: 'hover:bg-neutral/15', hoverOutline: 'hover:border-neutral/35',
    soft: 'bg-neutral/10 text-neutral',
    outline: 'border-neutral/30 text-neutral',
    text: 'text-neutral',
  },
  background: {
    solid: 'bg-background text-foreground',
    fill: 'bg-background', onSolid: 'text-foreground', hoverSoft: 'hover:bg-muted/70', hoverOutline: 'hover:border-border',
    soft: 'bg-muted text-foreground',
    outline: 'border-border text-foreground',
    text: 'text-foreground',
  },
};
