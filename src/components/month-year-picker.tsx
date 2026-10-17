'use client';

import * as React from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { cn } from '../utils.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs.js';
import { toneClasses, type UIColor } from './theme.js';

const months = Array.from({ length: 12 }, (_, index) => {
  const name = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(2020, index, 1));
  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1);
});
const yearsPerPage = 12;

function monthDate(year: number, month: number): Date {
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month, 1);
  return date;
}

function yearPageFor(year: number): number {
  return Math.floor((year - 1) / yearsPerPage) * yearsPerPage + 1;
}

export type MonthYearPickerVariant = 'outlined' | 'soft' | 'filled';
export type MonthYearPickerSize = 'sm' | 'md' | 'lg';
/** Dados de uma opção do painel de meses. */
export interface MonthYearPickerMonthOption { month: number; label: string; selected: boolean }
/** Dados de uma opção do painel de anos. */
export interface MonthYearPickerYearOption { year: number; selected: boolean }

/** Seletor de mês e ano com limites e renderização personalizável das opções. */
export interface MonthYearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Data selecionada em modo controlado; o dia é tratado como primeiro do mês. */
  value?: Date;
  /** Data inicial em modo não controlado. */
  defaultValue?: Date;
  /** Recebe o primeiro dia do mês selecionado. */
  onValueChange?: (month: Date) => void;
  /** Menor ano selecionável, entre 1 e 9999. */
  minYear?: number;
  /** Maior ano selecionável, entre 1 e 9999. */
  maxYear?: number;
  /** Desativa a seleção e as setas de navegação. */
  disabled?: boolean;
  /** Aparência do gatilho. */
  variant?: MonthYearPickerVariant;
  /** Dimensões do gatilho, painel e opções. */
  size?: MonthYearPickerSize;
  /** Tone do gatilho, abas e opções selecionadas; padrão `primary`. */
  color?: UIColor;
  /** Classe, ou função de classe, aplicada a cada mês. */
  monthOptionClassName?: string | ((option: MonthYearPickerMonthOption) => string);
  /** Classe, ou função de classe, aplicada a cada ano. */
  yearOptionClassName?: string | ((option: MonthYearPickerYearOption) => string);
  /** Classe adicional do campo de ano quando não há limites. */
  yearInputClassName?: string;
  /** Renderiza o conteúdo de cada opção de mês. */
  renderMonth?: (option: MonthYearPickerMonthOption) => React.ReactNode;
  /** Renderiza o conteúdo de cada opção de ano. */
  renderYear?: (option: MonthYearPickerYearOption) => React.ReactNode;
}

const sizes: Record<MonthYearPickerSize, { width: string; arrow: string; text: string; panel: string; gap: string; option: string; icon: number }> = {
  sm: { width: 'w-72', arrow: 'size-8', text: 'text-sm', panel: 'p-3', gap: 'gap-2', option: 'min-h-10 px-2 py-2 text-xs', icon: 16 },
  md: { width: 'w-80', arrow: 'size-10', text: 'text-sm', panel: 'p-4', gap: 'gap-3', option: 'min-h-12 px-2 py-2 text-sm', icon: 18 },
  lg: { width: 'w-96', arrow: 'size-12', text: 'text-base', panel: 'p-5', gap: 'gap-4', option: 'min-h-14 px-3 py-3 text-base', icon: 21 },
};

const MonthYearPicker = React.forwardRef<HTMLDivElement, MonthYearPickerProps>(function MonthYearPicker(
  {
    value, defaultValue, onValueChange, minYear, maxYear, disabled = false,
    variant = 'outlined', size = 'md', color = 'primary',
    monthOptionClassName, yearOptionClassName, yearInputClassName, renderMonth, renderYear,
    className, ...props
  },
  ref,
) {
  if ([minYear, maxYear].some(year => year !== undefined && (!Number.isInteger(year) || year < 1 || year > 9999))
    || (minYear !== undefined && maxYear !== undefined && minYear > maxYear)) {
    throw new RangeError('minYear e maxYear devem ser anos inteiros entre 1 e 9999, com minYear menor ou igual a maxYear');
  }

  const lowerYear = minYear ?? 1;
  const upperYear = maxYear ?? 9999;
  const hasYearBounds = minYear !== undefined || maxYear !== undefined;
  const [internalValue, setInternalValue] = React.useState(() => {
    const date = defaultValue ?? new Date();
    return monthDate(date.getFullYear(), date.getMonth());
  });
  const rawValue = value ?? internalValue;
  const selectedYear = Math.min(upperYear, Math.max(lowerYear, rawValue.getFullYear()));
  const selectedMonth = rawValue.getMonth();
  const selectedIndex = selectedYear * 12 + selectedMonth;
  const [open, setOpen] = React.useState(false);
  const [activePanel, setActivePanel] = React.useState<'months' | 'years'>('months');
  const [draftYear, setDraftYear] = React.useState(selectedYear);
  const [yearInput, setYearInput] = React.useState(String(selectedYear));
  const [yearPageStart, setYearPageStart] = React.useState(() => yearPageFor(selectedYear));
  const rootRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const popoverId = React.useId();
  const tone = toneClasses[color];
  const metrics = sizes[size];
  const inputYear = Number(yearInput);
  const inputYearIsValid = yearInput.trim() !== '' && Number.isInteger(inputYear) && inputYear >= 1 && inputYear <= 9999;

  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  React.useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  React.useEffect(() => {
    if (!open) {
      setDraftYear(selectedYear);
      setYearInput(String(selectedYear));
      setYearPageStart(yearPageFor(selectedYear));
    }
  }, [open, selectedYear]);
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
    if (next.getFullYear() < lowerYear || next.getFullYear() > upperYear) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const openPicker = () => {
    if (open) { setOpen(false); return; }
    setDraftYear(selectedYear);
    setYearInput(String(selectedYear));
    setYearPageStart(yearPageFor(selectedYear));
    setActivePanel('months');
    setOpen(true);
  };
  const chooseYear = (year: number) => {
    const bounded = Math.min(upperYear, Math.max(lowerYear, year));
    setDraftYear(bounded);
    setYearInput(String(bounded));
    setActivePanel('months');
  };
  const chooseMonth = (month: number) => {
    selectMonth(draftYear, month);
    setOpen(false);
    triggerRef.current?.focus();
  };
  const canGoPrevious = selectedIndex > lowerYear * 12;
  const canGoNext = selectedIndex < upperYear * 12 + 11;
  const headerStyle = variant === 'filled' ? tone.solid
    : variant === 'soft' ? tone.soft : 'border border-border bg-background text-foreground';
  const headerHover = variant === 'filled' ? 'hover:opacity-80' : tone.hoverSoft;
  const optionBase = cn(
    'rounded-lg border border-transparent text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    metrics.option,
  );
  const label = `${months[selectedMonth]} de ${selectedYear}`;

  return (
    <div ref={rootRef} className={cn('relative inline-flex max-w-[calc(100vw-2rem)] flex-col text-foreground', metrics.width, className)} {...props}>
      <div className={cn('flex items-center justify-between gap-2 rounded-xl p-1.5 shadow-sm', headerStyle)}>
        <button type="button" aria-label="Mês anterior" disabled={disabled || !canGoPrevious}
          onClick={() => selectMonth(selectedYear, selectedMonth - 1)}
          className={cn('inline-flex shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40', metrics.arrow, headerHover)}>
          <CaretLeftIcon size={metrics.icon} aria-hidden="true" />
        </button>
        <button ref={triggerRef} type="button" disabled={disabled} aria-expanded={open && !disabled} aria-controls={popoverId}
          aria-haspopup="dialog" onClick={openPicker}
          className={cn('min-w-0 flex-1 rounded-lg px-2 py-2 text-center font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40', metrics.text, headerHover)}>
          {label}
        </button>
        <button type="button" aria-label="Próximo mês" disabled={disabled || !canGoNext}
          onClick={() => selectMonth(selectedYear, selectedMonth + 1)}
          className={cn('inline-flex shrink-0 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40', metrics.arrow, headerHover)}>
          <CaretRightIcon size={metrics.icon} aria-hidden="true" />
        </button>
      </div>
      {open && !disabled && (
        <div id={popoverId} role="dialog" aria-label="Selecionar mês e ano"
          className={cn('absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-border bg-card text-card-foreground shadow-xl', metrics.panel)}>
          <Tabs defaultValue="months" value={activePanel} onValueChange={next => setActivePanel(next as 'months' | 'years')}
            variant="pills" color={color} size="sm" fullWidth mobileBehavior="wrap" contentAnimation="none">
            <TabsList aria-label="Escolha mês ou ano" className="mb-4 w-full">
              <TabsTrigger value="months" className="flex-1">Meses</TabsTrigger>
              <TabsTrigger value="years" className="flex-1">Anos</TabsTrigger>
            </TabsList>
            <TabsContent value="months">
              <p className="mb-3 text-center text-sm font-medium text-muted-foreground">{draftYear}</p>
              <div className={cn('grid grid-cols-3', metrics.gap)} role="group" aria-label="Meses">
                {months.map((month, index) => {
                  const option = { month: index, label: month, selected: index === selectedMonth && draftYear === selectedYear };
                  const customClass = typeof monthOptionClassName === 'function' ? monthOptionClassName(option) : monthOptionClassName;
                  return <button key={month} type="button" aria-pressed={option.selected} aria-label={`${month} de ${draftYear}`}
                    onClick={() => chooseMonth(index)} className={cn(optionBase, option.selected ? tone.solid : cn('bg-background text-foreground', tone.hoverSoft), customClass)}>
                    {renderMonth ? renderMonth(option) : month}
                  </button>;
                })}
              </div>
            </TabsContent>
            <TabsContent value="years">
              {hasYearBounds ? <>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <button type="button" aria-label="Anos anteriores" disabled={yearPageStart <= lowerYear}
                    onClick={() => setYearPageStart(current => Math.max(1, current - yearsPerPage))}
                    className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40">
                    <CaretLeftIcon size={18} aria-hidden="true" />
                  </button>
                  <span className="text-sm font-semibold">{yearPageStart}–{Math.min(9999, yearPageStart + yearsPerPage - 1)}</span>
                  <button type="button" aria-label="Próximos anos" disabled={yearPageStart + yearsPerPage - 1 >= upperYear}
                    onClick={() => setYearPageStart(current => Math.min(yearPageFor(9999), current + yearsPerPage))}
                    className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40">
                    <CaretRightIcon size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className={cn('grid grid-cols-3', metrics.gap)} role="group" aria-label="Anos">
                  {Array.from({ length: yearsPerPage }, (_, index) => yearPageStart + index).map(year => {
                    const option = { year, selected: year === draftYear };
                    const customClass = typeof yearOptionClassName === 'function' ? yearOptionClassName(option) : yearOptionClassName;
                    return <button key={year} type="button" aria-pressed={option.selected} disabled={year < lowerYear || year > upperYear}
                      onClick={() => chooseYear(year)} className={cn(optionBase, option.selected ? tone.solid : cn('bg-background text-foreground', tone.hoverSoft), 'disabled:cursor-not-allowed disabled:opacity-35', customClass)}>
                      {renderYear ? renderYear(option) : year}
                    </button>;
                  })}
                </div>
              </> : <div className="space-y-4">
                <label htmlFor={`${popoverId}-year`} className="block text-sm font-medium">Ano</label>
                <input id={`${popoverId}-year`} type="number" inputMode="numeric" min={1} max={9999}
                  value={yearInput} onChange={event => setYearInput(event.target.value)}
                  onKeyDown={event => { if (event.key === 'Enter' && inputYearIsValid) { event.preventDefault(); chooseYear(inputYear); } }}
                  aria-invalid={!inputYearIsValid}
                  className={cn('w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', metrics.text, yearInputClassName)} />
                <button type="button" disabled={!inputYearIsValid} onClick={() => chooseYear(inputYear)}
                  className={cn('w-full rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40', tone.solid)}>
                  Escolher ano
                </button>
              </div>}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
});

MonthYearPicker.displayName = 'MonthYearPicker';

export { MonthYearPicker };
