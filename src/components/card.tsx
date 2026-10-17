'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils.js';
import { fluidTransition, motionPresets, type MotionPreset } from './motion.js';
import { radiusClasses, type UIColor, type UIRadius } from './theme.js';
import { toneClasses } from './theme.js';
import { Skeleton } from './skeleton.js';
import { formatCurrency } from '../functions/formatCurrency.js';

/** Dados apresentados quando `Card` recebe a prop `metric`. */
export interface CardMetric {
  /** Nome da métrica. */
  label: React.ReactNode;
  /** Valor principal. */
  value: React.ReactNode;
  /** Texto auxiliar da métrica. */
  description?: React.ReactNode;
  /** Ícone ao lado do valor. */
  icon?: React.ReactNode;
  /** Tone do destaque da métrica. */
  tone?: UIColor;
  /** Formatação numérica aplicada ao valor. */
  format?: 'currency' | 'number';
  /** Variação percentual em relação ao período anterior. */
  change?: number;
}

const cardVariants = cva(
  'relative flex flex-col border border-border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        outlined: 'border-input shadow-none',
        filled: 'border-transparent bg-muted text-foreground',
        minimal: 'border-transparent bg-transparent shadow-none',
        elevated: 'border-border/60 shadow-lg shadow-black/5 dark:shadow-black/20',
        glass: 'border-white/15 bg-card/75 shadow-lg backdrop-blur-xl',
        gradient: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card',
        interactive: 'cursor-pointer shadow-sm hover:border-primary/30 hover:shadow-md',
      },
      size: {
        none: 'p-0',
        xs: 'gap-2 p-3',
        sm: 'gap-3 p-4',
        md: 'gap-4 p-6',
        lg: 'gap-5 p-8',
        xl: 'gap-6 p-10',
      },
      color: {
        default: '',
        primary: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card',
        secondary: 'border-secondary/20 bg-gradient-to-br from-secondary/12 via-card to-card',
        success: 'border-success/20 bg-gradient-to-br from-success/12 via-card to-card',
        warning: 'border-warning/20 bg-gradient-to-br from-warning/12 via-card to-card',
        danger: 'border-destructive/20 bg-gradient-to-br from-destructive/12 via-card to-card',
        info: 'border-info/20 bg-gradient-to-br from-info/12 via-card to-card',
        neutral: 'border-neutral/20 bg-gradient-to-br from-neutral/12 via-card to-card',
        tertiary: 'border-tertiary/20 bg-gradient-to-br from-tertiary/12 via-card to-card',
        background: 'border-transparent bg-background text-foreground',
      },
    },
    defaultVariants: { variant: 'default', size: 'md', color: 'default' },
    compoundVariants: [
      { variant: 'gradient', color: 'default', className: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card' },
      { variant: 'gradient', color: 'primary', className: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card' },
      { variant: 'gradient', color: 'secondary', className: 'border-secondary/20 bg-gradient-to-br from-secondary/12 via-card to-card' },
      { variant: 'gradient', color: 'success', className: 'border-success/20 bg-gradient-to-br from-success/12 via-card to-card' },
      { variant: 'gradient', color: 'warning', className: 'border-warning/20 bg-gradient-to-br from-warning/12 via-card to-card' },
      { variant: 'gradient', color: 'danger', className: 'border-destructive/20 bg-gradient-to-br from-destructive/12 via-card to-card' },
      { variant: 'gradient', color: 'info', className: 'border-info/20 bg-gradient-to-br from-info/12 via-card to-card' },
      { variant: 'gradient', color: 'neutral', className: 'border-neutral/20 bg-gradient-to-br from-neutral/12 via-card to-card' },
      { variant: 'gradient', color: 'tertiary', className: 'border-tertiary/20 bg-gradient-to-br from-tertiary/12 via-card to-card' },
      { variant: 'gradient', color: 'background', className: 'border-transparent bg-background text-foreground' },
      { variant: 'interactive', color: 'default', className: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card' },
      { variant: 'interactive', color: 'primary', className: 'border-primary/20 bg-gradient-to-br from-primary/12 via-card to-card' },
      { variant: 'interactive', color: 'secondary', className: 'border-secondary/20 bg-gradient-to-br from-secondary/12 via-card to-card' },
      { variant: 'interactive', color: 'success', className: 'border-success/20 bg-gradient-to-br from-success/12 via-card to-card' },
      { variant: 'interactive', color: 'warning', className: 'border-warning/20 bg-gradient-to-br from-warning/12 via-card to-card' },
      { variant: 'interactive', color: 'danger', className: 'border-destructive/20 bg-gradient-to-br from-destructive/12 via-card to-card' },
      { variant: 'interactive', color: 'info', className: 'border-info/20 bg-gradient-to-br from-info/12 via-card to-card' },
      { variant: 'interactive', color: 'neutral', className: 'border-neutral/20 bg-gradient-to-br from-neutral/12 via-card to-card' },
      { variant: 'interactive', color: 'tertiary', className: 'border-tertiary/20 bg-gradient-to-br from-tertiary/12 via-card to-card' },
      { variant: 'interactive', color: 'background', className: 'border-transparent bg-background text-foreground' },
      { variant: 'glass', color: 'default', className: 'border-white/15 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'primary', className: 'border-primary/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'secondary', className: 'border-secondary/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'success', className: 'border-success/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'warning', className: 'border-warning/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'danger', className: 'border-destructive/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'info', className: 'border-info/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'neutral', className: 'border-neutral/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'glass', color: 'tertiary', className: 'border-tertiary/20 bg-card/75 shadow-lg backdrop-blur-xl' },
      { variant: 'filled', color: 'default', className: 'border-transparent bg-muted text-foreground' },
      { variant: 'filled', color: 'primary', className: 'border-transparent bg-primary/10 text-primary-text' },
      { variant: 'filled', color: 'secondary', className: 'border-transparent bg-secondary/15 text-secondary-text' },
      { variant: 'filled', color: 'success', className: 'border-transparent bg-success/10 text-success' },
      { variant: 'filled', color: 'warning', className: 'border-transparent bg-warning/10 text-warning' },
      { variant: 'filled', color: 'danger', className: 'border-transparent bg-destructive/10 text-destructive' },
      { variant: 'filled', color: 'info', className: 'border-transparent bg-info/10 text-info' },
      { variant: 'filled', color: 'neutral', className: 'border-transparent bg-neutral/10 text-neutral' },
      { variant: 'filled', color: 'tertiary', className: 'border-transparent bg-tertiary/10 text-tertiary-text' },
      { variant: 'filled', color: 'background', className: 'border-transparent bg-background text-foreground' },
      { variant: 'outlined', color: 'background', className: 'border-border text-foreground' },
    ],
  },
);

/** Superfície com cabeçalho, conteúdo e métrica opcionais. */
export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'title' | 'children'>,
    VariantProps<typeof cardVariants> {
  /** Título no cabeçalho. */
  title?: React.ReactNode;
  /** Descrição no cabeçalho. */
  description?: React.ReactNode;
  /** Ícone do cabeçalho. */
  icon?: React.ReactNode;
  /** Ação no cabeçalho. */
  action?: React.ReactNode;
  /** Conteúdo do rodapé. */
  footer?: React.ReactNode;
  /** Raio dos cantos. */
  radius?: UIRadius;
  /** Tone das superfícies coloridas e da métrica. */
  color?: UIColor;
  /** Habilita aparência interativa. */
  interactive?: boolean;
  /** Mostra estrutura provisória de carregamento. */
  loading?: boolean;
  /** Anima a entrada. */
  animationEntrance?: boolean;
  /** Anima a saída. */
  animationOut?: boolean;
  /** Preset de animação. */
  motionPreset?: MotionPreset;
  /** Atraso da animação em segundos. */
  animationDelay?: number;
  /** Conteúdo principal. */
  children?: React.ReactNode;
  /** Dados para apresentar um cartão de métrica. */
  metric?: CardMetric;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    variant,
    size,
    color,
    title,
    description,
    icon,
    action,
    footer,
    radius = 'md',
    interactive = false,
    loading = false,
    animationEntrance = false,
    animationOut = false,
    motionPreset,
    animationDelay = 0,
    children,
    metric,
    ...props
  },
  ref,
) {
  const preset = motionPreset ?? (animationEntrance || animationOut ? 'fade-up' : 'none');
  const variants = preset === 'none' ? undefined : motionPresets[preset];

  return (
    <motion.div
      ref={ref}
      initial={variants ? 'hidden' : undefined}
      animate={variants ? 'visible' : undefined}
      exit={variants ? 'exit' : undefined}
      variants={variants}
      transition={{ ...fluidTransition, delay: animationDelay }}
      whileHover={interactive ? { y: -3 } : undefined}
      whileTap={interactive ? { scale: 0.995 } : undefined}
      aria-busy={loading || undefined}
      className={cn(cardVariants({ variant: interactive ? 'interactive' : variant, size, color }), radiusClasses[radius], loading && 'pointer-events-none overflow-hidden', className)}
      {...props}
    >
      {loading && !metric && <span className="absolute inset-0 z-10 animate-pulse bg-muted/65 backdrop-blur-[1px]" aria-hidden="true" />}
      {!metric && (title || description || icon || action) && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            {icon && <span className={cn('flex-shrink-0 p-2 rounded-md', toneClasses[color && color !== 'default' ? color : 'primary'].soft)}>{icon}</span>}
            <div className="min-w-0 ">
              {title && <h3 className="font-semibold text-foreground">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {metric ? <div className="flex min-h-24 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 truncate text-xs font-medium text-foreground">{metric.label}</span>
          {metric.icon && <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', toneClasses[metric.tone ?? 'primary'].soft)}>{metric.icon}</span>}
        </div>
        {loading ? <div className="space-y-2"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-3 w-1/2" /></div> :
          <div className="min-w-0">
            <div className={cn('truncate text-lg font-semibold', toneClasses[metric.tone ?? 'primary'].text)}>{typeof metric.value === 'number' && metric.format === 'currency' ? formatCurrency(metric.value) : typeof metric.value === 'number' && metric.format === 'number' ? metric.value.toLocaleString('pt-BR') : metric.value}</div>
            {metric.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{metric.description}</p>}
            {metric.change !== undefined && <p className={cn('text-xs font-medium', metric.change >= 0 ? 'text-success' : 'text-destructive')}>{metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% <span className="text-muted-foreground">vs anterior</span></p>}
          </div>}
      </div> : children}
      {footer && <div className="mt-auto border-t border-border/70 pt-4">{footer}</div>}
    </motion.div>
  );
});

Card.displayName = 'Card';

export { Card, cardVariants };


