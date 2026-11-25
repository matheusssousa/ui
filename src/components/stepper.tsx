'use client';

import * as React from 'react';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

/** Conteúdo e disponibilidade de uma etapa. */
export interface StepperStep {
  /** Identificador estável; por padrão usa a posição. */
  id?: string;
  /** Nome da etapa. */
  title: React.ReactNode;
  /** Explicação opcional abaixo do título. */
  description?: React.ReactNode;
  /** Ícone que substitui o número da etapa. */
  icon?: React.ReactNode;
  /** Impede a navegação para esta etapa. */
  disabled?: boolean;
}

/** Indicador controlado de progresso; não valida nem submete formulários. */
export interface StepperProps extends Omit<React.HTMLAttributes<HTMLOListElement>, 'onChange'> {
  /** Etapas na ordem de execução. */
  steps: StepperStep[];
  /** Índice iniciado em zero; steps.length indica todas concluídas. Padrão: 0. */
  currentStep?: number;
  /** Habilita botões de navegação e recebe o índice solicitado. */
  onStepChange?: (index: number) => void;
  /** Direção da lista. Padrão: horizontal. */
  orientation?: 'horizontal' | 'vertical';
  /** Posição do texto em relação ao indicador. Padrão: right. */
  textPosition?: 'right' | 'bottom';
  /** Tamanho dos indicadores. Padrão: md. */
  size?: 'sm' | 'md' | 'lg';
  /** Aparência do indicador ativo. Padrão: default. */
  variant?: 'default' | 'outlined' | 'soft';
  /** Cor das etapas ativas e concluídas. Padrão: primary. */
  color?: UIColor;
  /** Impede toda navegação. */
  disabled?: boolean;
}

/** Apresenta etapas concluídas, atual e futuras, com navegação opcional por botões. */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper({
  steps,
  currentStep = 0,
  onStepChange,
  orientation = 'horizontal',
  textPosition = 'right',
  size = 'md',
  variant = 'default',
  color = 'primary',
  disabled = false,
  className,
  ...props
}, ref) {
  const active = Number.isFinite(currentStep) ? Math.max(0, Math.min(Math.trunc(currentStep), steps.length)) : 0;
  const tone = toneClasses[color];
  const sizes = { sm: 'size-7 text-xs', md: 'size-9 text-sm', lg: 'size-11 text-base' };

  return (
    <ol ref={ref} aria-label="Etapas" {...props} className={cn('flex gap-4', orientation === 'vertical' ? 'flex-col' : 'flex-row overflow-x-auto', className)}>
      {steps.map((step, index) => {
        const complete = index < active;
        const current = index === active;
        const content = <div className={cn('flex min-w-0 items-center gap-3', textPosition === 'bottom' && 'flex-col')}>
          <span aria-hidden="true" className={cn('flex shrink-0 items-center justify-center rounded-full border font-semibold', sizes[size],
            complete ? tone.solid : current ? variant === 'outlined' ? tone.outline : variant === 'soft' ? tone.soft : tone.solid : 'border-border bg-muted text-muted-foreground')}>
            {complete ? <CheckIcon size={18} /> : step.icon ?? index + 1}
          </span>
          <span className={cn('flex min-w-0 flex-col', textPosition === 'bottom' && 'items-center')}>
            <span className="block text-sm font-medium">{step.title}</span>
            {step.description && <span className="block text-xs text-muted-foreground">{step.description}</span>}
            <span className="sr-only">{complete ? 'Concluída' : current ? 'Atual' : 'Pendente'}</span>
          </span>
        </div>;

        return <li key={step.id ?? index} aria-current={current ? 'step' : undefined} className={cn('flex min-w-0 items-center gap-4', orientation === 'horizontal' && 'flex-1')}>
          {onStepChange ? <button type="button" disabled={disabled || step.disabled} onClick={() => onStepChange(index)}
            className="flex items-center gap-3 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">{content}</button>
            : <div className="flex items-center gap-3 p-1">{content}</div>}
          {orientation === 'horizontal' && index < steps.length - 1 && <span aria-hidden="true" className={cn('h-px min-w-4 flex-1', complete ? tone.fill : 'bg-border')} />}
        </li>;
      })}
    </ol>
  );
});
