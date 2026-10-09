'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic.js';

const CaretLeftIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretLeft));
const CaretRightIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretRight));
const CalendarBlankIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CalendarBlank));

// --- Variantes de Estilo (CVA) ---

const calendarVariants = cva(
    'rounded-lg text-foreground select-none w-full',
    {
        variants: {
            variant: {
                default: '',
            },
            size: {
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

const dayButtonVariants = cva(
    'relative flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer hover:bg-accent',
    {
        variants: {
            size: {
                sm: 'h-8 w-8 text-xs',
                md: 'h-10 w-10 text-sm',
                lg: 'h-12 w-12 text-base',
            },
            state: {
                default: '',
                selected: 'bg-primary text-white hover:bg-primary/90 font-bold',
                today: 'border-2 border-primary text-primary font-semibold',
                disabled: ' text-muted-foreground opacity-40 cursor-not-allowed hover:bg-transparent pointer-events-none',
                outside: 'text-muted-foreground opacity-50',
                range: 'bg-primary/20 text-primary',
                rangeStart: 'bg-primary text-primary-foreground rounded-r-none',
                rangeEnd: 'bg-primary text-primary-foreground rounded-l-none',
            },
        },
        defaultVariants: {
            size: 'md',
            state: 'default',
        },
    }
);

// --- Tipos e Interfaces ---

export interface CalendarEvent {
    id: string | number;
    date: Date;
    title: string;
    color?: string;
    description?: string;
}

export type CalendarMode = 'single' | 'multiple' | 'range';
export type CalendarView = 'days' | 'months' | 'years' | 'week';

export interface CalendarProps extends VariantProps<typeof calendarVariants> {
    mode?: CalendarMode;
    view?: CalendarView;
    selected?: Date | Date[] | { from: Date; to?: Date };
    onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void;
    disabled?: (date: Date) => boolean;
    events?: CalendarEvent[];
    availableDays?: string[]; // Array de datas no formato 'YYYY-MM-DD' com disponibilidade
    showWeekNumbers?: boolean;
    showOutsideDays?: boolean;
    minDate?: Date;
    maxDate?: Date;
    locale?: string;
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    numberOfMonths?: number;
    animateTransitions?: boolean;
    onMonthChange?: (month: Date) => void;
    onViewChange?: (view: CalendarView) => void;
    showEventIndicator?: boolean;
    allowViewChange?: boolean;
}

// --- Funções Auxiliares ---

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

function isDateInRange(date: Date, start: Date, end?: Date): boolean {
    if (!end) return isSameDay(date, start);
    const time = date.getTime();
    return time >= start.getTime() && time <= end.getTime();
}

function isDateDisabled(
    date: Date,
    minDate?: Date,
    maxDate?: Date,
    disabledFn?: (date: Date) => boolean
): boolean {
    if (disabledFn && disabledFn(date)) return true;
    
    // Reset time to 00:00:00 for accurate date comparison
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (minDate) {
        const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        if (compareDate < min) return true;
    }
    
    if (maxDate) {
        const max = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
        if (compareDate > max) return true;
    }
    
    return false;
}

function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// --- Componente Principal ---

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    ({
        mode = 'single',
        view: initialView = 'days',
        selected,
        onSelect,
        disabled,
        events = [],
        availableDays = [],
        showWeekNumbers = false,
        showOutsideDays = true,
        minDate,
        maxDate,
        firstDayOfWeek = 0,
        className,
        variant,
        size,
        numberOfMonths = 1,
        animateTransitions = true,
        onMonthChange,
        onViewChange,
        showEventIndicator = true,
        allowViewChange = true,
    }, ref) => {
        const [currentMonth, setCurrentMonth] = React.useState(new Date());
        const [view, setView] = React.useState<CalendarView>(initialView);
        const [hoverDate, setHoverDate] = React.useState<Date | null>(null);

        const today = new Date();

        // Handle view change
        const handleViewChange = (newView: CalendarView) => {
            setView(newView);
            onViewChange?.(newView);
        };

        // Navigation handlers
        const goToPreviousMonth = () => {
            const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
        };

        const goToNextMonth = () => {
            const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
        };

        const goToPreviousYear = () => {
            const newMonth = new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth());
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
        };

        const goToNextYear = () => {
            const newMonth = new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth());
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
        };

        // Date selection handler
        const handleDateSelect = (date: Date) => {
            if (isDateDisabled(date, minDate, maxDate, disabled)) return;

            if (mode === 'single') {
                onSelect?.(date);
            } else if (mode === 'multiple') {
                const selectedDates = (selected as Date[]) || [];
                const isSelected = selectedDates.some(d => isSameDay(d, date));

                if (isSelected) {
                    onSelect?.(selectedDates.filter(d => !isSameDay(d, date)));
                } else {
                    onSelect?.([...selectedDates, date]);
                }
            } else if (mode === 'range') {
                const range = selected as { from: Date; to?: Date } | undefined;

                if (!range?.from || (range.from && range.to)) {
                    onSelect?.({ from: date, to: undefined });
                } else {
                    if (date < range.from) {
                        onSelect?.({ from: date, to: range.from });
                    } else {
                        onSelect?.({ from: range.from, to: date });
                    }
                }
            }
        };

        // Month selection handler
        const handleMonthSelect = (monthIndex: number) => {
            const newMonth = new Date(currentMonth.getFullYear(), monthIndex);
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
            setView('days');
        };

        // Year selection handler
        const handleYearSelect = (year: number) => {
            const newMonth = new Date(year, currentMonth.getMonth());
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
            setView('months');
        };

        // Check if date is selected
        const isDateSelected = (date: Date): boolean => {
            if (!selected) return false;

            if (mode === 'single') {
                return isSameDay(date, selected as Date);
            } else if (mode === 'multiple') {
                return (selected as Date[]).some(d => isSameDay(d, date));
            } else if (mode === 'range') {
                const range = selected as { from: Date; to?: Date };
                if (!range.from) return false;
                if (!range.to) return isSameDay(date, range.from);
                return isDateInRange(date, range.from, range.to);
            }
            return false;
        };

        // Check if date is in range (for hover effect)
        const isInHoverRange = (date: Date): boolean => {
            if (mode !== 'range' || !hoverDate) return false;
            const range = selected as { from: Date; to?: Date } | undefined;
            if (!range?.from || range.to) return false;

            const start = range.from < hoverDate ? range.from : hoverDate;
            const end = range.from < hoverDate ? hoverDate : range.from;
            return isDateInRange(date, start, end);
        };

        // Get events for a specific date
        const getEventsForDate = (date: Date): CalendarEvent[] => {
            return events.filter(event => isSameDay(event.date, date));
        };

        // Render day cell
        const renderDay = (date: Date, isOutside: boolean = false) => {
            const isSelected = isDateSelected(date);
            const isToday = isSameDay(date, today);
            const isDisabled = isDateDisabled(date, minDate, maxDate, disabled);
            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const isInRange = isInHoverRange(date);
            
            // Verificar se o dia tem disponibilidade
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const hasAvailability = availableDays.includes(dateStr);

            let state: 'default' | 'selected' | 'today' | 'disabled' | 'outside' | 'range' = 'default';
            if (isDisabled) state = 'disabled';
            else if (isOutside && !showOutsideDays) state = 'outside';
            else if (isSelected) state = 'selected';
            else if (isInRange) state = 'range';
            else if (isToday) state = 'today';
            else if (isOutside) state = 'outside';

            return (
                <div key={date.toISOString()} className="relative flex flex-col items-center">
                    <motion.button
                        type="button"
                        className={cn(dayButtonVariants({ size, state }))}
                        onClick={() => handleDateSelect(date)}
                        onMouseEnter={() => setHoverDate(date)}
                        onMouseLeave={() => setHoverDate(null)}
                        disabled={isDisabled}
                        whileHover={!isDisabled ? { scale: 1.05 } : {}}
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        initial={animateTransitions ? { opacity: 0, scale: 0.8 } : {}}
                        animate={animateTransitions ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.2 }}
                    >
                        <span className="relative z-10">
                            {date.getDate()}
                        </span>

                        {/* Event indicators */}
                        {showEventIndicator && hasEvents && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                {dayEvents.slice(0, 3).map((event, idx) => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "h-1 w-1 rounded-full",
                                            event.color || "bg-current"
                                        )}
                                        style={event.color ? { backgroundColor: event.color } : {}}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.button>
                    
                    {/* Indicador de disponibilidade */}
                    {hasAvailability && !isDisabled && !isOutside && (
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="h-1 w-8 bg-success rounded-full mt-1"
                        />
                    )}
                </div>
            );
        };

        // Render days view
        const renderDaysView = () => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();
            const daysInMonth = getDaysInMonth(year, month);
            const firstDay = (getFirstDayOfMonth(year, month) - firstDayOfWeek + 7) % 7;

            const days: React.JSX.Element[] = [];

            // Previous month days
            if (firstDay > 0) {
                const prevMonth = month === 0 ? 11 : month - 1;
                const prevYear = month === 0 ? year - 1 : year;
                const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

                for (let i = firstDay - 1; i >= 0; i--) {
                    const date = new Date(prevYear, prevMonth, daysInPrevMonth - i);
                    days.push(renderDay(date, true));
                }
            }

            // Current month days
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                days.push(renderDay(date, false));
            }

            // Next month days
            const remainingCells = 42 - days.length; // 6 weeks * 7 days
            for (let day = 1; day <= remainingCells; day++) {
                const nextMonth = month === 11 ? 0 : month + 1;
                const nextYear = month === 11 ? year + 1 : year;
                const date = new Date(nextYear, nextMonth, day);
                days.push(renderDay(date, true));
            }

            // Adjust days of week based on firstDayOfWeek
            const adjustedDaysOfWeek = [
                ...DAYS_OF_WEEK.slice(firstDayOfWeek),
                ...DAYS_OF_WEEK.slice(0, firstDayOfWeek)
            ];

            return (
                <div className="p-4">
                    {/* Days of week header */}
                    <div className={cn(
                        "grid gap-1 mb-2",
                        showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
                    )}>
                        {showWeekNumbers && (
                            <div className="flex items-center justify-center text-xs font-medium text-foreground">
                                #
                            </div>
                        )}
                        {adjustedDaysOfWeek.map((day) => (
                            <div
                                key={day}
                                className="flex items-center justify-center text-xs font-medium text-foreground"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className={cn(
                        "grid gap-1 justify-items-center",
                        showWeekNumbers ? "grid-cols-8" : "grid-cols-7"
                    )}>
                        {Array.from({ length: 6 }).map((_, weekIndex) => (
                            <React.Fragment key={weekIndex}>
                                {showWeekNumbers && (
                                    <div className="flex items-center justify-center text-xs text-muted-foreground">
                                        {getWeekNumber(new Date(year, month, weekIndex * 7 + 1))}
                                    </div>
                                )}
                                {days.slice(weekIndex * 7, (weekIndex + 1) * 7)}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            );
        };

        // Render week view
        const renderWeekView = () => {
            const startOfWeek = new Date(currentMonth);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + firstDayOfWeek);

            const weekDays: React.JSX.Element[] = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                weekDays.push(renderDay(date, false));
            }

            const adjustedDaysOfWeek = [
                ...DAYS_OF_WEEK.slice(firstDayOfWeek),
                ...DAYS_OF_WEEK.slice(0, firstDayOfWeek)
            ];

            return (
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {adjustedDaysOfWeek.map((day, index) => (
                            <div key={day} className="flex flex-col items-center gap-2">
                                <div className="text-xs font-medium text-muted-foreground">
                                    {day}
                                </div>
                                {weekDays[index]}
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        // Render months view
        const renderMonthsView = () => {
            return (
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((month, index) => {
                            const isCurrentMonth = index === currentMonth.getMonth() &&
                                currentMonth.getFullYear() === today.getFullYear();

                            return (
                                <motion.button
                                    key={month}
                                    type="button"
                                    className={cn(
                                        "px-4 py-3 rounded-lg font-medium transition-colors",
                                        isCurrentMonth
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent"
                                    )}
                                    onClick={() => handleMonthSelect(index)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={animateTransitions ? { opacity: 0, y: 10 } : {}}
                                    animate={animateTransitions ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                    {month.slice(0, 3)}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        };

        // Render years view
        const renderYearsView = () => {
            const currentYear = currentMonth.getFullYear();
            const startYear = Math.floor(currentYear / 12) * 12;
            const years = Array.from({ length: 12 }, (_, i) => startYear + i);

            return (
                <div className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                        {years.map((year, index) => {
                            const isCurrentYear = year === today.getFullYear();

                            return (
                                <motion.button
                                    key={year}
                                    type="button"
                                    className={cn(
                                        "px-4 py-3 rounded-lg font-medium transition-colors",
                                        isCurrentYear
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent"
                                    )}
                                    onClick={() => handleYearSelect(year)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={animateTransitions ? { opacity: 0, y: 10 } : {}}
                                    animate={animateTransitions ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                >
                                    {year}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            );
        };

        // Render header
        const renderHeader = () => {
            const getHeaderTitle = () => {
                switch (view) {
                    case 'days':
                        return `${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                    case 'week':
                        const startOfWeek = new Date(currentMonth);
                        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + firstDayOfWeek);
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6);
                        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
                    case 'months':
                        return currentMonth.getFullYear().toString();
                    case 'years':
                        const startYear = Math.floor(currentMonth.getFullYear() / 12) * 12;
                        return `${startYear} - ${startYear + 11}`;
                }
            };

            const handlePrevious = () => {
                if (view === 'years') {
                    const newMonth = new Date(currentMonth.getFullYear() - 12, currentMonth.getMonth());
                    setCurrentMonth(newMonth);
                } else if (view === 'months') {
                    goToPreviousYear();
                } else {
                    goToPreviousMonth();
                }
            };

            const handleNext = () => {
                if (view === 'years') {
                    const newMonth = new Date(currentMonth.getFullYear() + 12, currentMonth.getMonth());
                    setCurrentMonth(newMonth);
                } else if (view === 'months') {
                    goToNextYear();
                } else {
                    goToNextMonth();
                }
            };

            const handleTitleClick = () => {
                if (!allowViewChange) return;

                if (view === 'days') setView('months');
                else if (view === 'months') setView('years');
            };

            return (
                <div className="flex items-center justify-between p-4">
                    <motion.button
                        type="button"
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        onClick={handlePrevious}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <CaretLeftIcon size={20} />
                    </motion.button>

                    <motion.button
                        type="button"
                        className={cn(
                            "text-sm font-semibold px-4 py-2 rounded-lg transition-colors",
                            allowViewChange && "hover:bg-accent cursor-pointer"
                        )}
                        onClick={handleTitleClick}
                        whileHover={allowViewChange ? { scale: 1.05 } : {}}
                        whileTap={allowViewChange ? { scale: 0.95 } : {}}
                    >
                        {getHeaderTitle()}
                    </motion.button>

                    <motion.button
                        type="button"
                        className="p-2 rounded-lg hover:bg-accent transition-colors"
                        onClick={handleNext}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <CaretRightIcon size={20} />
                    </motion.button>
                </div>
            );
        };

        return (
            <div
                ref={ref}
                className={cn(calendarVariants({ variant, size }), className)}
            >
                {renderHeader()}

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={animateTransitions ? { opacity: 0, x: 20 } : {}}
                        animate={animateTransitions ? { opacity: 1, x: 0 } : {}}
                        exit={animateTransitions ? { opacity: 0, x: -20 } : {}}
                        transition={{ duration: 0.3 }}
                    >
                        {view === 'days' && renderDaysView()}
                        {view === 'week' && renderWeekView()}
                        {view === 'months' && renderMonthsView()}
                        {view === 'years' && renderYearsView()}
                    </motion.div>
                </AnimatePresence>
            </div>
        );
    }
);

Calendar.displayName = 'Calendar';

export { Calendar, calendarVariants };


