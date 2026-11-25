import type { CSSProperties } from 'react';

export const uiSizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const uiColors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral', 'tertiary', 'background', 'foreground'] as const;
export const uiRadii = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;
export const uiSurfaceVariants = ['default', 'filled', 'outline', 'soft', 'minimal', 'elevated', 'glass', 'glow'] as const;

export type UISize = (typeof uiSizes)[number];
export type UIColor = (typeof uiColors)[number];
export type UIRadius = (typeof uiRadii)[number];
export type UISurfaceVariant = (typeof uiSurfaceVariants)[number];

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
  foreground: {
    solid: 'bg-foreground text-background',
    fill: 'bg-foreground', onSolid: 'text-background', hoverSoft: 'hover:bg-muted/70', hoverOutline: 'hover:border-border',
    soft: 'bg-muted text-foreground',
    outline: 'border-border text-foreground',
    text: 'text-foreground',
  },
};

/** Efeitos de superfície coloridos reutilizáveis por componentes de contêiner. */
export const surfaceToneClasses: Record<UIColor, { glass: string; glow: string }> = {
  default: {
    glass: 'border-border/60 bg-card/75 text-card-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--foreground)]',
  },
  primary: {
    glass: 'border-primary/25 bg-primary/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--primary)]',
  },
  secondary: {
    glass: 'border-secondary/25 bg-secondary/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--secondary)]',
  },
  tertiary: {
    glass: 'border-tertiary/25 bg-tertiary/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--tertiary)]',
  },
  success: {
    glass: 'border-success/25 bg-success/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--success)]',
  },
  warning: {
    glass: 'border-warning/25 bg-warning/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--warning)]',
  },
  danger: {
    glass: 'border-destructive/25 bg-destructive/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--destructive)]',
  },
  info: {
    glass: 'border-info/25 bg-info/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--info)]',
  },
  neutral: {
    glass: 'border-neutral/25 bg-neutral/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--neutral)]',
  },
  background: {
    glass: 'border-border/60 bg-background/75 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--background)]',
  },
  foreground: {
    glass: 'border-foreground/25 bg-foreground/5 text-foreground shadow-lg backdrop-blur-xl',
    glow: 'ui-surface-glow text-foreground [--surface-glow-color:var(--foreground)]',
  },
};
const toneTokens: Record<UIColor, readonly [string, string, string]> = {
  default: ['foreground', 'background', 'foreground'],
  primary: ['primary', 'primary-foreground', 'primary-text'],
  secondary: ['secondary', 'secondary-foreground', 'secondary-text'],
  tertiary: ['tertiary', 'tertiary-foreground', 'tertiary-text'],
  success: ['success', 'success-foreground', 'success'],
  warning: ['warning', 'warning-foreground', 'warning'],
  danger: ['destructive', 'destructive-foreground', 'destructive'],
  info: ['info', 'info-foreground', 'info'],
  neutral: ['neutral', 'neutral-foreground', 'neutral'],
  background: ['background', 'foreground', 'foreground'],
  foreground: ['foreground', 'background', 'foreground'],
};

/** Aplica um tone aos componentes legados que usam utilitários `primary` em elementos internos. */
export function toneScopeStyle(color: UIColor, style?: CSSProperties): CSSProperties {
  if (color === 'primary') return style ?? {};
  const [base, foreground, text] = toneTokens[color];
  return {
    '--primary': `var(--${base})`,
    '--primary-foreground': `var(--${foreground})`,
    '--primary-text': `var(--${text})`,
    ...style,
  } as CSSProperties;
}
