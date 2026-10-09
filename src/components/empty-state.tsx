'use client';

import * as React from 'react';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';
import { MotionBox, type MotionBoxProps, type MotionPreset } from './motion.js';

export interface EmptyStateProps extends Omit<MotionBoxProps, 'title' | 'children' | 'preset'> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
  motionPreset?: MotionPreset;
}

export function EmptyState({ icon, title, description, action, compact = false, motionPreset = 'fade-up', className, ...props }: EmptyStateProps) {
  return (
    <MotionBox preset={motionPreset} className={cn('flex flex-col items-center justify-center text-center', compact ? 'px-4 py-7' : 'px-6 py-12', className)} {...props}>
      <div className={cn('grid place-items-center rounded-2xl bg-muted text-muted-foreground', compact ? 'mb-3 size-11' : 'mb-4 size-16')}>
        {icon ?? <PackageIcon size={compact ? 23 : 32} weight="duotone" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </MotionBox>
  );
}


