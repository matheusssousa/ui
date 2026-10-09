'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils.js';
import { getStatusMeta } from '../functions/getStatusBadge.js';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string | null | undefined;
  label?: string;
  showLabel?: boolean;
  pulse?: boolean;
}

const dotColors: Record<string, string> = { success: 'bg-success', destructive: 'bg-destructive', warning: 'bg-warning', scheduled: 'bg-info', info: 'bg-info', default: 'bg-muted-foreground' };

export function StatusIndicator({ status, label, showLabel = true, pulse = false, className, ...props }: StatusIndicatorProps) {
  const meta = getStatusMeta(status);
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs text-muted-foreground', className)} {...props}>
      <span className="relative flex size-2.5">
        {pulse && <motion.span className={cn('absolute inline-flex size-full rounded-full opacity-60', dotColors[meta.variant])} animate={{ scale: [1, 1.8], opacity: [0.55, 0] }} transition={{ duration: 1.4, repeat: Infinity }} />}
        <span className={cn('relative inline-flex size-2.5 rounded-full', dotColors[meta.variant])} />
      </span>
      {showLabel && <span>{label ?? meta.label}</span>}
    </span>
  );
}



