'use client';

import { cn } from '../utils.js';
import { Spinner } from './spinner.js';
import type { UIColor, UISize } from './theme.js';

export interface LoadingProps { label?: string; size?: UISize; color?: UIColor; compact?: boolean; className?: string; }

export default function Loading({ label, size = 'xl', color = 'primary', compact = false, className }: LoadingProps) {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3', compact ? 'py-4' : 'py-12', className)}>
      <Spinner size={size} color={color} label={label ?? 'Carregando'} />
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
    </div>
  );
}


