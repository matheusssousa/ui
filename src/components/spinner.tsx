'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils.js';
import type { UIColor, UISize } from './theme.js';

const sizeClasses: Record<UISize, string> = { xs: 'size-3.5 border', sm: 'size-5 border-2', md: 'size-7 border-2', lg: 'size-10 border-[3px]', xl: 'size-14 border-4' };
const colorClasses: Record<UIColor, string> = {
  default: 'border-muted-foreground/25 border-t-foreground', primary: 'border-primary/20 border-t-primary-text', secondary: 'border-secondary/20 border-t-secondary-text',
  success: 'border-success/20 border-t-success', warning: 'border-warning/20 border-t-warning', danger: 'border-destructive/20 border-t-destructive',
  info: 'border-info/20 border-t-info', neutral: 'border-neutral/20 border-t-neutral', tertiary: 'border-tertiary/20 border-t-tertiary-text',
  background: 'border-foreground/20 border-t-foreground',
};

/** Indicador de carregamento com nome acessível. */
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Tamanho do círculo; padrão depende de `mode`. */
  size?: UISize;
  /** Tone da borda animada; padrão `primary`. */
  color?: UIColor;
  /** Texto acessível e legenda nos modos block/overlay. */
  label?: string;
  /** Apresentação em linha, bloco ou sobreposição. */
  mode?: 'inline' | 'block' | 'overlay';
  /** Se falso, não renderiza o indicador. */
  visible?: boolean;
  /** Reduz o espaçamento do modo block. */
  compact?: boolean;
}

export function Spinner({ size, color = 'primary', label = 'Carregando', mode = 'inline', visible = true, compact = false, className, ...props }: SpinnerProps) {
  if (!visible) return null;
  return <span role="status" aria-label={label} className={cn(
    mode === 'inline' ? 'inline-flex' : 'flex flex-col items-center justify-center gap-3',
    mode === 'block' && (compact ? 'w-full py-4' : 'w-full py-12'),
    mode === 'overlay' && 'absolute inset-0 z-40 bg-background/75 backdrop-blur-sm', className,
  )} {...props}>
    <motion.span aria-hidden="true" className={cn('block rounded-full', sizeClasses[size ?? (mode === 'inline' ? 'md' : mode === 'block' ? 'xl' : 'lg')], colorClasses[color])} animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }} />
    {mode === 'inline' ? <span className="sr-only">{label}</span> : <span aria-hidden="true" className="text-xs font-medium text-muted-foreground">{label}</span>}
  </span>;
}


