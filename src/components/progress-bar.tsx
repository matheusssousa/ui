'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { motion, useReducedMotion } from 'framer-motion';
import type { UIColor } from './theme.js';
import { getGradientStyle, type UIGradientValue } from './gradient.js';

const progressBarVariants = cva(
    'relative w-full overflow-hidden rounded-full bg-muted',
    {
        variants: {
            size: {
                sm: 'h-1.5',
                md: 'h-2.5',
                lg: 'h-4',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
);

const progressFillVariants = cva(
    'h-full w-full origin-left rounded-full',
    {
        variants: {
            color: {
                default: 'bg-primary',
                primary: 'bg-primary',
                secondary: 'bg-secondary',
                tertiary: 'bg-tertiary',
                success: 'bg-success',
                warning: 'bg-warning',
                danger: 'bg-destructive',
                info: 'bg-info',
                neutral: 'bg-neutral',
                background: 'bg-background',
                foreground: 'bg-foreground',
                gradient: 'bg-gradient-to-r from-primary to-secondary',
            },
        },
        defaultVariants: {
            color: 'default',
        },
    }
);

type ColorVariant = UIColor | 'gradient';

/** Barra de progresso determinada por `value` e `max`. */
export interface ProgressBarProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressBarVariants> {
    /** Valor atual. */
    value: number;
    /** Valor que representa 100%; padrão 100. */
    max?: number;
    /** Exibe o rótulo. */
    showLabel?: boolean;
    /** Exibe o percentual. */
    showPercentage?: boolean;
    /** Texto descritivo da barra. */
    label?: string;
    /** Formata o valor exibido. */
    formatValue?: (value: number, max: number) => string;
    /** Anima a largura ao mudar. */
    animated?: boolean;
    /** Aplica padrão de listras. */
    striped?: boolean;
    /** Escolhe a cor conforme o percentual. */
    autoColor?: boolean;
    /** Tone da barra quando `autoColor` está desativado. */
    color?: ColorVariant;
    /** Preset compartilhado usado quando `color="gradient"`. */
    gradient?: UIGradientValue;
    variant?: 'default' | 'glow' | 'segmented';
    segments?: number;
    trackClassName?: string;
    fillClassName?: string;
    /** Posição do percentual em relação à barra. */
    labelPosition?: 'top' | 'bottom' | 'inline';
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
    ({
        className,
        size,
        color,
        gradient,
        value,
        max = 100,
        showLabel = false,
        showPercentage = false,
        label,
        formatValue,
        animated = false,
        striped = false,
        autoColor = false,
        variant = 'default',
        segments = 5,
        trackClassName,
        fillClassName,
        labelPosition = 'top',
        ...props
    }, ref) => {
        const reducedMotion = useReducedMotion();
        const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
        const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
        const percentage = safeValue / safeMax * 100;
        const count = Number.isFinite(segments) ? Math.min(100, Math.max(1, Math.floor(segments))) : 5;

        // Auto color based on percentage
        const getAutoColor = (): ColorVariant => {
            if (percentage < 50) return 'success';
            if (percentage < 75) return 'warning';
            return 'danger';
        };

        const finalColor: ColorVariant = autoColor ? getAutoColor() : (color || 'default');

        const stripedClasses = striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]' : '';
        const animatedClasses = animated && !reducedMotion ? 'animate-[progress-stripes_1s_linear_infinite]' : '';

        return (
            <div className={cn('ui-progress w-full min-w-0 gap-2', className)} data-label-position={labelPosition} ref={ref} {...props}>
                {(showLabel || showPercentage) && (
                    <div className="ui-progress-label flex flex-wrap items-center justify-between gap-2 text-sm">
                        {showLabel && label && (
                            <span className="text-muted-foreground">{label}</span>
                        )}
                        {showPercentage && (
                            <span className="text-muted-foreground font-medium">
                                {formatValue 
                                    ? formatValue(safeValue, safeMax)
                                    : `${percentage.toFixed(1)}%`
                                }
                            </span>
                        )}
                    </div>
                )}
                <div className={cn(progressBarVariants({ size }), 'ui-progress-track', variant === 'glow' && 'ui-progress-glow', trackClassName)} role="progressbar" aria-label={label ?? props['aria-label'] ?? 'Progresso'} aria-labelledby={props['aria-labelledby']} aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={safeMax}>
                    <motion.div
                        className={cn(
                            progressFillVariants({ color: finalColor }),
                            stripedClasses,
                            animatedClasses,
                            fillClassName
                        )}
                        initial={reducedMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: percentage / 100 }}
                        transition={{ duration: reducedMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                        style={finalColor === 'gradient' && gradient ? getGradientStyle(gradient) : undefined}
                    />
                    {variant === 'segmented' && <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex">{Array.from({ length: count }, (_, index) => <span key={index} className="flex-1" style={{ borderInlineStart: index ? '4px solid var(--card)' : undefined }} />)}</div>}
                </div>
            </div>
        );
    }
);

ProgressBar.displayName = 'ProgressBar';

// Stats Progress Card Component
/** Resumo numérico com barra de progresso. */
export interface StatsProgressProps {
    /** Nome da métrica. */
    label: string;
    /** Valor principal exibido. */
    value: string;
    /** Valor de referência exibido abaixo. */
    subValue?: string;
    /** Percentual exibido na barra. */
    percentage: number;
    /** Ícone ao lado do rótulo. */
    icon?: React.ReactNode;
    /** Tone da barra. */
    color?: ColorVariant;
    /** Escolhe a cor conforme o percentual. */
    autoColor?: boolean;
    /** Preset compartilhado usado quando `color="gradient"`. */
    gradient?: UIGradientValue;
}

const StatsProgress = React.forwardRef<HTMLDivElement, StatsProgressProps>(
    ({ label, value, subValue, percentage, icon, color = 'default', autoColor = false, gradient }, ref) => {
        return (
            <div ref={ref} className="flex flex-col gap-2 p-4 rounded-xl bg-background/50 border border-border/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-muted-foreground">{icon}</span>}
                        <span className="text-sm font-medium text-muted-foreground">{label}</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage.toFixed(1)}%</span>
                </div>
                <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold">{value}</span>
                    {subValue && (
                        <span className="text-xs text-muted-foreground">de {subValue}</span>
                    )}
                </div>
                <ProgressBar 
                    value={percentage} 
                    color={color} 
                    autoColor={autoColor}
                    gradient={gradient}
                    size="sm" 
                />
            </div>
        );
    }
);

StatsProgress.displayName = 'StatsProgress';

export { ProgressBar, StatsProgress };


