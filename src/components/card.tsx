'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils.js';
import { fluidTransition, motionPresets, type MotionPreset } from './motion.js';
import { radiusClasses, surfaceToneClasses, toneClasses, type UIColor, type UIRadius, type UISurfaceVariant } from './theme.js';
import { Skeleton } from './skeleton.js';
import { formatCurrency } from '../functions/formatCurrency.js';
import { getGradientStyle, type UIGradientValue } from './gradient.js';

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
        filled: '',
        outline: 'bg-transparent shadow-none',
        soft: 'border-transparent shadow-none',
        minimal: 'border-transparent bg-transparent shadow-none',
        elevated: 'border-border/60 shadow-lg shadow-black/5 dark:shadow-black/20',
        glass: '',
        glow: '',
      },
      size: {
        none: 'p-0',
        xs: 'gap-2 p-3',
        sm: 'gap-3 p-4',
        md: 'gap-4 p-6',
        lg: 'gap-5 p-8',
        xl: 'gap-6 p-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
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
  /** Preset de `gradient.ts`, aplicado conforme a variante visual. */
  gradient?: UIGradientValue;
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
  /** Mídia lateral ou superior; reutiliza o Card para metas e destaques. */
  media?: React.ReactNode;
  mediaPosition?: 'top' | 'start' | 'responsive';
  eyebrow?: React.ReactNode;
  slotClassNames?: Partial<Record<'media' | 'content' | 'header' | 'title' | 'description' | 'footer' | 'metricValue', string>>;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    className,
    variant,
    size,
    color,
    gradient,
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
    media,
    mediaPosition = 'responsive',
    eyebrow,
    slotClassNames,
    style,
    ...props
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const preset = motionPreset ?? (animationEntrance || animationOut ? 'fade-up' : 'none');
  const variants = preset === 'none' ? undefined : motionPresets[preset];
  const resolvedVariant: UISurfaceVariant = variant ?? 'default';
  const resolvedColor: UIColor = color && color in toneClasses ? color : 'default';
  const tone = toneClasses[resolvedColor];
  const surfaceTone = surfaceToneClasses[resolvedColor];
  const colorClasses = cn(
    resolvedVariant === 'filled' && tone.solid,
    resolvedVariant === 'outline' && cn(tone.outline, 'bg-transparent'),
    resolvedVariant === 'soft' && tone.soft,
    resolvedVariant === 'minimal' && tone.text,
    resolvedVariant === 'glass' && surfaceTone.glass,
    resolvedVariant === 'glow' && surfaceTone.glow,
    resolvedVariant === 'default' && color && color !== 'default' && cn(tone.soft, tone.outline),
    resolvedVariant === 'elevated' && color && color !== 'default' && tone.outline,
  );
  const baseGradientStyle = gradient ? getGradientStyle(gradient) : undefined;
  const gradientStyle = !gradient
    ? style
    : resolvedVariant === 'outline'
      ? {
          borderColor: 'transparent',
          backgroundImage: `linear-gradient(var(--card), var(--card)), ${baseGradientStyle?.backgroundImage}`,
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
          ...style,
        }
      : resolvedVariant === 'minimal'
        ? style
        : {
            ...getGradientStyle(gradient, resolvedVariant === 'filled' ? 'vibrant' : 'subtle'),
            ...style,
          };

  return (
    <motion.div
      ref={ref}
      initial={variants && !reducedMotion ? 'hidden' : false}
      animate={variants ? 'visible' : undefined}
      exit={variants ? 'exit' : undefined}
      variants={variants}
      transition={reducedMotion ? { duration: 0 } : { ...fluidTransition, delay: animationDelay }}
      whileHover={interactive && !reducedMotion ? { y: -3 } : undefined}
      whileTap={interactive && !reducedMotion ? { scale: 0.995 } : undefined}
      aria-busy={loading || undefined}
      className={cn(cardVariants({ variant: resolvedVariant, size }), colorClasses, gradient && resolvedVariant === 'filled' && 'text-white', interactive && 'cursor-pointer hover:border-primary/30 hover:shadow-md', radiusClasses[radius], loading && 'pointer-events-none overflow-hidden', className)}
      style={gradientStyle}
      {...props}
    >
      {loading && !metric && <span className="absolute inset-0 z-10 animate-pulse bg-muted/65 backdrop-blur-[1px]" aria-hidden="true" />}
      <div className={cn('ui-card-body', media && 'ui-card-with-media')} data-media-position={mediaPosition}>
      {media && <div className={cn('ui-card-media', slotClassNames?.media)}>{media}</div>}
      <div className={cn('flex min-w-0 flex-1 flex-col gap-3', slotClassNames?.content)}>
      {!metric && (title || description || icon || action || eyebrow) && (
        <div className={cn('flex flex-wrap items-center justify-between gap-3', slotClassNames?.header)}>
          <div className="flex min-w-0 items-center gap-2">
            {icon && <span className={cn('flex-shrink-0 p-2 rounded-md', toneClasses[color && color !== 'default' ? color : 'primary'].soft)}>{icon}</span>}
            <div className="min-w-0 ">
              {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary-text">{eyebrow}</div>}
              {title && <h3 className={cn('font-semibold text-current [overflow-wrap:anywhere]', slotClassNames?.title)}>{title}</h3>}
              {description && <p className={cn('text-sm text-current opacity-75', slotClassNames?.description)}>{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {metric ? <div className="flex min-h-24 flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 truncate text-xs font-medium text-current">{metric.label}</span>
          {metric.icon && <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', toneClasses[metric.tone ?? 'primary'].soft)}>{metric.icon}</span>}
        </div>
        {loading ? <div className="space-y-2"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-3 w-1/2" /></div> :
          <div className="min-w-0">
            <div className={cn('break-words text-2xl font-semibold tabular-nums', toneClasses[metric.tone ?? 'primary'].text, slotClassNames?.metricValue)}>{typeof metric.value === 'number' && metric.format === 'currency' ? formatCurrency(metric.value) : typeof metric.value === 'number' && metric.format === 'number' ? metric.value.toLocaleString('pt-BR') : metric.value}</div>
            {metric.description && <p className="mt-0.5 truncate text-xs text-current opacity-75">{metric.description}</p>}
            {metric.change !== undefined && <p className={cn('text-xs font-medium', metric.change >= 0 ? 'text-success' : 'text-destructive')}>{metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% <span className="text-muted-foreground">vs anterior</span></p>}
          </div>}
      </div> : children}
      {footer && <div className={cn('mt-auto border-t border-border/70 pt-4', slotClassNames?.footer)}>{footer}</div>}
      </div></div>
    </motion.div>
  );
});

Card.displayName = 'Card';

export { Card, cardVariants };


