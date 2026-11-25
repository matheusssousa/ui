'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

export interface TimelineItem {
  /** Identificador estavel do evento. */
  id?: string;
  /** Titulo principal do evento. */
  title: React.ReactNode;
  /** Detalhes exibidos abaixo do titulo. */
  description?: React.ReactNode;
  /** Data ou contexto temporal do evento. */
  date?: React.ReactNode;
  /** Icone exibido dentro do marcador. */
  icon?: React.ReactNode;
  /** Cor individual do marcador. */
  color?: UIColor;
  /** Estado visual do evento. */
  status?: 'completed' | 'current' | 'pending';
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  /** Eventos em ordem cronologica. */
  items: TimelineItem[];
  /** Direcao da linha do tempo. Padrao: vertical. */
  orientation?: 'vertical' | 'horizontal';
  /** Aparencia dos marcadores. Padrao: solid. */
  variant?: 'solid' | 'outlined' | 'soft';
  /** Tamanho dos marcadores. Padrao: md. */
  size?: 'sm' | 'md' | 'lg';
  /** Cor padrao dos eventos. */
  color?: UIColor;
}

/** Exibe eventos cronologicos; para etapas navegaveis de um fluxo, use Stepper. */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline({
  items, orientation = 'vertical', variant = 'solid', size = 'md', color = 'primary', className, ...props
}, ref) {
  const markerSizes = { sm: 'size-6', md: 'size-8', lg: 'size-10' };

  return <ol ref={ref} aria-label={props['aria-label'] ?? 'Linha do tempo'} {...props} data-orientation={orientation}
    className={cn('ui-timeline', orientation === 'horizontal' ? 'flex overflow-x-auto pb-2' : 'flex flex-col', className)}>
    {items.map((item, index) => {
      const tone = toneClasses[item.color ?? color];
      const status = item.status ?? 'completed';
      const inactive = status === 'pending';
      const markerTone = inactive ? 'border-border bg-muted text-muted-foreground'
        : variant === 'outlined' ? tone.outline : variant === 'soft' ? cn('border-transparent', tone.soft) : cn('border-transparent', tone.solid);
      const connectorTone = inactive ? 'bg-border' : tone.fill;
      const content = <div className={cn('min-w-0', orientation === 'horizontal' && 'pt-3')}>
        {item.date && <div className="mb-1 text-xs font-medium text-muted-foreground">{item.date}</div>}
        <div className="text-sm font-semibold text-foreground">{item.title}</div>
        {item.description && <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>}
      </div>;

      return <li key={item.id ?? index} aria-current={status === 'current' ? 'step' : undefined} data-status={status}
        className={cn('relative min-w-0', orientation === 'horizontal' ? 'flex min-w-48 flex-1 flex-col' : 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0')}>
        <div className={cn('relative flex', orientation === 'horizontal' ? 'items-center' : 'flex-col items-center')}>
          <span aria-hidden="true" className={cn('relative z-10 flex shrink-0 items-center justify-center rounded-full border text-xs font-semibold', markerSizes[size], markerTone)}>
            {item.icon ?? <span className="size-1.5 rounded-full bg-current" />}
          </span>
          {index < items.length - 1 && <span aria-hidden="true" className={cn(connectorTone, orientation === 'horizontal' ? 'h-0.5 min-w-8 flex-1' : 'absolute bottom-[-2rem] top-0 w-0.5')} />}
        </div>
        {content}
      </li>;
    })}
  </ol>;
});

