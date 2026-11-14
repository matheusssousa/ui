'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { toneScopeStyle, type UIColor } from './theme.js';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'color' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  color?: UIColor;
  variant?: 'default' | 'split';
  /** Quantidade de marcas decorativas; limitada a 101. */
  ticks?: number;
  startLabel?: React.ReactNode;
  endLabel?: React.ReactNode;
  showValue?: boolean;
  formatValue?: (value: number, percentage: number) => string;
  inputClassName?: string;
}

/** Entrada range nativa, com teclado, toque e composição para divisão de valores. */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(function Slider({
  value, defaultValue, min = 0, max = 100, step = 1, onValueChange, onChange,
  label, description, color = 'primary', variant = 'default', ticks = 0,
  startLabel, endLabel, showValue = true, formatValue, className, inputClassName,
  id, disabled, style, ...props
}, ref) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const lower = Number.isFinite(min) ? min : 0;
  const upper = Number.isFinite(max) && max > lower ? max : lower + 100;
  const increment = Number.isFinite(step) && step > 0 ? step : 1;
  const normalize = (candidate: number) => {
    const finite = Number.isFinite(candidate) ? candidate : lower;
    const steps = Math.max(0, Math.min(Math.floor((upper - lower) / increment + 1e-10), Math.round((finite - lower) / increment)));
    return Number((lower + steps * increment).toPrecision(12));
  };
  const [local, setLocal] = React.useState(defaultValue ?? lower);
  const current = normalize(value ?? local);
  const percentage = (current - lower) / (upper - lower) * 100;
  const count = Number.isFinite(ticks) ? Math.max(0, Math.min(101, Math.floor(ticks))) : 0;
  const formatted = formatValue ? formatValue(current, percentage) : variant === 'split' ? `${Math.round(percentage)}% | ${Math.round(100 - percentage)}%` : String(current);
  return <div className={cn('ui-slider w-full min-w-0', className)} data-disabled={disabled || undefined} data-variant={variant} style={toneScopeStyle(color, style)}>
    {label && <label htmlFor={inputId} className="mb-2 block text-sm font-medium">{label}</label>}
    {(startLabel || endLabel) && <div className="mb-1 flex justify-between gap-4 text-sm"><div className="min-w-0 break-words">{startLabel}</div><div className="min-w-0 break-words text-right">{endLabel}</div></div>}
    <div className="ui-slider-control">
      <div className="ui-slider-track" aria-hidden="true"><span style={{ transform: `scaleX(${percentage / 100})` }} /></div>
      {count > 1 && <div className="ui-slider-ticks" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index} />)}</div>}
      <input {...props} ref={ref} id={inputId} type="range" min={lower} max={upper} step={increment} value={current} disabled={disabled}
        aria-valuetext={props['aria-valuetext'] ?? formatted}
        aria-describedby={[props['aria-describedby'], description ? `${inputId}-description` : undefined].filter(Boolean).join(' ') || undefined}
        className={cn('ui-slider-input', inputClassName)} onChange={event => {
          const next = normalize(event.currentTarget.valueAsNumber);
          if (value === undefined) setLocal(next);
          onValueChange?.(next);
          onChange?.(event);
        }} />
    </div>
    {showValue && <div className="flex justify-center"><output htmlFor={inputId} className="ui-slider-value">{formatted}</output></div>}
    {description && <p id={`${inputId}-description`} className="mt-2 text-xs text-muted-foreground">{description}</p>}
  </div>;
});
