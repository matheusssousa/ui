'use client';

import * as React from 'react';
import { StarIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

export interface RatingBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Valor controlado da avaliacao. */
  value?: number;
  /** Valor inicial quando o componente nao e controlado. */
  defaultValue?: number;
  /** Quantidade maxima de itens. Padrao: 5. */
  max?: number;
  /** Notifica a selecao de um novo valor. */
  onValueChange?: (value: number) => void;
  /** Texto acessivel do grupo. Padrao: Avaliacao. */
  label?: string;
  /** Formata o nome acessivel de cada opcao. */
  getLabel?: (value: number, max: number) => string;
  /** Permite limpar clicando novamente na opcao selecionada. */
  allowClear?: boolean;
  /** Impede alteracoes sem reduzir o contraste. */
  readOnly?: boolean;
  /** Desabilita todas as opcoes. */
  disabled?: boolean;
  /** Exibe o valor numerico ao lado. */
  showValue?: boolean;
  /** Tamanho dos icones. Padrao: md. */
  size?: 'sm' | 'md' | 'lg';
  /** Cor dos itens selecionados. Padrao: warning. */
  color?: UIColor;
  /** Icone a ser exibido. Padrao: StarIcon. */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

/** Controle de avaliacao por estrelas com suporte a mouse, toque e teclado. */
export const RatingBar = React.forwardRef<HTMLDivElement, RatingBarProps>(function RatingBar({
  value,
  defaultValue = 0,
  max = 5,
  onValueChange,
  label = 'Avaliacao',
  getLabel = (option, total) => `${option} de ${total}`,
  allowClear = false,
  readOnly = false,
  disabled = false,
  showValue = false,
  size = 'md',
  color = 'warning',
  icon: Icon = StarIcon,
  className,
  ...props
}, ref) {
  const count = Number.isFinite(max) ? Math.max(1, Math.min(20, Math.trunc(max))) : 5;
  const normalize = (candidate: number) => Number.isFinite(candidate) ? Math.max(0, Math.min(count, Math.trunc(candidate))) : 0;
  const [localValue, setLocalValue] = React.useState(() => normalize(defaultValue));
  const current = normalize(value ?? localValue);
  const tone = toneClasses[color];
  const iconSizes = { sm: 18, md: 24, lg: 30 };
  const interactive = !readOnly && !disabled;

  const select = (nextValue: number) => {
    if (!interactive) return;
    const next = allowClear && nextValue === current ? 0 : nextValue;
    if (value === undefined) setLocalValue(next);
    onValueChange?.(next);
  };

  const move = (event: React.KeyboardEvent, index: number) => {
    if (!interactive) return;
    const previous = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
    const next = event.key === 'ArrowRight' || event.key === 'ArrowUp';
    if (!previous && !next && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const target = event.key === 'Home' ? 1 : event.key === 'End' ? count : previous ? Math.max(1, index) : Math.min(count, index + 2);
    select(target);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[target - 1]?.focus();
  };

  return (
    <div ref={ref} {...props} className={cn('inline-flex max-w-full items-center gap-2', disabled && 'opacity-50', className)}>
      <div role="radiogroup" aria-label={label} aria-readonly={readOnly || undefined} aria-disabled={disabled || undefined} className="flex items-center">
        {Array.from({ length: count }, (_, index) => {
          const option = index + 1;
          const selected = option === current;
          const filled = option <= current;
          return (
            <button key={option} type="button" role="radio" aria-checked={selected} aria-label={getLabel(option, count)} disabled={disabled}
              tabIndex={interactive ? (selected || (current === 0 && index === 0) ? 0 : -1) : -1}
              onClick={() => select(option)} onKeyDown={event => move(event, index)}
              className={cn('flex size-11 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', interactive && 'cursor-pointer hover:bg-muted', readOnly && 'cursor-default', filled ? tone.text : 'text-muted-foreground/45')}>
              <Icon aria-hidden="true" size={iconSizes[size]} weight={filled ? 'fill' : 'regular'} />
            </button>
          );
        })}
      </div>
      {showValue && <output aria-live="polite" className="text-sm tabular-nums text-muted-foreground">{current}/{count}</output>}
    </div>
  );
});

