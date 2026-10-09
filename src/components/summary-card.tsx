'use client';

import * as React from 'react';
import { Card, type CardProps } from './card.js';
import { Skeleton } from './skeleton.js';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

export interface SummaryCardProps extends Omit<CardProps, 'title' | 'description' | 'icon' | 'loading' | 'children'> {
  label: React.ReactNode;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  tone?: UIColor;
  loading?: boolean;
}

export function SummaryCard({
  label,
  value,
  description,
  icon,
  tone = 'primary',
  loading = false,
  className,
  ...props
}: SummaryCardProps) {
  return (
    <Card
      variant="outlined"
      size="md"
      animationEntrance
      className={cn('min-h-36 justify-between overflow-hidden', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`text-xs font-medium text-foreground`}>{label}</span>
        {icon && (
          <span className={cn('grid size-9 shrink-0 place-items-center rounded-xl', toneClasses[tone].soft)}>
            {icon}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <div className="min-w-0">
          <div className={`truncate text-lg font-semibold text-foreground ${toneClasses[tone].text}`}>{value}</div>
          {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
    </Card>
  );
}



