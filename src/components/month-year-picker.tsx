'use client';

import * as React from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';

const months = Array.from({ length: 12 }, (_, index) => {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2020, index, 1));
  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1);
});

function monthDate(year: number, month: number): Date {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, 1);
  return date;
}

function monthStart(date: Date): Date {
  return monthDate(date.getFullYear(), date.getMonth());
}

function clampYear(year: number, minYear?: number, maxYear?: number): number {
  return Math.min(maxYear ?? 9999, Math.max(minYear ?? 1, year));
}

export interface MonthYearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: Date;
  defaultValue?: Date;
  onValueChange?: (month: Date) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

const MonthYearPicker = React.forwardRef<HTMLDivElement, MonthYearPickerProps>(function MonthYearPicker(
  { value, defaultValue, onValueChange, minYear, maxYear, disabled = false, className, ...props },
  ref,
) {
  if ([minYear, maxYear].some(year => year !== undefined && (!Number.isInteger(year) || year < 1 || year > 9999))
    || (minYear !== undefined && maxYear !== undefined && minYear > maxYear)) {
    throw new RangeError('minYear e maxYear devem ser anos inteiros entre 1 e 9999, com minYear menor ou igual a maxYear');
  }

  const [internalValue, setInternalValue] = React.useState(() => monthStart(defaultValue ?? new Date()));
  const rawValue = value ?? internalValue;
  const selected = monthDate(clampYear(rawValue.getFullYear(), minYear, maxYear), rawValue.getMonth());
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const selectedIndex = selectedYear * 12 + selectedMonth;
  const [open, setOpen] = React.useState(false);
  const [yearDraft, setYearDraft] = React.useState(String(selectedYear));
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverId = React.useId();

  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  React.useEffect(() => setYearDraft(String(selectedYear)), [selectedYear, open]);
  React.useEffect(() => { if (disabled) setOpen(false); }, [disabled]);

  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectMonth = (year: number, month: number) => {
    const next = monthDate(year, month);
    if (next.getFullYear() < (minYear ?? 1) || next.getFullYear() > (maxYear ?? 9999)) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  const commitYear = () => {
    const parsed = Number(yearDraft);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9999) {
      setYearDraft(String(selectedYear));
      return;
    }
    const nextYear = clampYear(parsed, minYear, maxYear);
    setYearDraft(String(nextYear));
    if (nextYear !== selectedYear) selectMonth(nextYear, selectedMonth);
  };

  const canGoPrevious = selectedIndex > (minYear ?? 1) * 12;
  const canGoNext = selectedIndex < (maxYear ?? 9999) * 12 + 11;
  const label = `${months[selectedMonth]} de ${selectedYear}`;

  return (
    <div ref={rootRef} className={cn('relative inline-flex min-w-64 flex-col text-foreground', className)} {...props}>
      <div className="flex items-center justify-between gap-1 rounded-lg border border-border bg-background p-1 shadow-sm">
        <button type="button" aria-label="Mês anterior" disabled={disabled || !canGoPrevious}
          onClick={() => selectMonth(selectedYear, selectedMonth - 1)}
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40">
          <CaretLeftIcon size={18} aria-hidden="true" />
        </button>
        <button ref={triggerRef} type="button" disabled={disabled} aria-expanded={open && !disabled} aria-controls={popoverId}
          aria-haspopup="dialog" onClick={() => setOpen(current => !current)}
          className="min-w-0 flex-1 rounded-md px-2 py-1.5 text-center text-sm font-semibold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40">
          {label}
        </button>
        <button type="button" aria-label="Próximo mês" disabled={disabled || !canGoNext}
          onClick={() => selectMonth(selectedYear, selectedMonth + 1)}
          className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40">
          <CaretRightIcon size={18} aria-hidden="true" />
        </button>
      </div>
      {open && !disabled && (
        <div id={popoverId} role="dialog" aria-label="Selecionar mês e ano"
          className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-border bg-card p-3 text-card-foreground shadow-lg">
          <label className="mb-3 flex items-center justify-between gap-3 text-sm font-medium">
            Ano
            <input type="number" inputMode="numeric" min={minYear ?? 1} max={maxYear ?? 9999}
              value={yearDraft} onChange={event => setYearDraft(event.target.value)}
              onBlur={event => { if (!(event.relatedTarget as HTMLElement | null)?.hasAttribute('data-month-year-option')) commitYear(); }}
              onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }}
              className="w-24 rounded-md border border-border bg-background px-2 py-1.5 text-right text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </label>
          <div className="grid grid-cols-3 gap-1" role="group" aria-label="Meses">
            {months.map((month, index) => (
              <button key={month} type="button" data-month-year-option aria-pressed={index === selectedMonth} onClick={() => {
                const parsed = Number(yearDraft);
                const year = Number.isInteger(parsed) && parsed >= 1 && parsed <= 9999
                  ? clampYear(parsed, minYear, maxYear) : selectedYear;
                selectMonth(year, index);
                setOpen(false);
                triggerRef.current?.focus();
              }} className={cn(
                'rounded-md px-2 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                index === selectedMonth ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}>
                {month}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MonthYearPicker.displayName = 'MonthYearPicker';

export { MonthYearPicker };
