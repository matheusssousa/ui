'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils.js';
import type { UIColor, UISize } from './theme.js';

const sizeClasses: Record<UISize, string> = { xs: 'size-3.5 border', sm: 'size-5 border-2', md: 'size-7 border-2', lg: 'size-10 border-[3px]', xl: 'size-14 border-4' };
const colorClasses: Record<UIColor, string> = {
  default: 'border-muted-foreground/25 border-t-foreground', primary: 'border-primary/20 border-t-primary', secondary: 'border-secondary/20 border-t-secondary',
  success: 'border-success/20 border-t-success', warning: 'border-warning/20 border-t-warning', danger: 'border-destructive/20 border-t-destructive',
  info: 'border-info/20 border-t-info', neutral: 'border-neutral/20 border-t-neutral', tertiary: 'border-tertiary/20 border-t-tertiary',
  background: 'border-foreground/20 border-t-foreground',
};

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> { size?: UISize; color?: UIColor; label?: string; }

export function Spinner({ size = 'md', color = 'primary', label = 'Carregando', className, ...props }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn('inline-flex', className)} {...props}>
      <motion.span aria-hidden="true" className={cn('block rounded-full', sizeClasses[size], colorClasses[color])} animate={{ rotate: 360 }} transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingOverlay({ label = 'Carregando...', visible = true, className }: { label?: string; visible?: boolean; className?: string }) {
  if (!visible) return null;
  return <div className={cn('absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-background/75 backdrop-blur-sm', className)}><Spinner size="lg" /><p className="text-xs font-medium text-muted-foreground">{label}</p></div>;
}


