'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { motion } from 'framer-motion';

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
    'h-full transition-all duration-500 ease-out rounded-full',
    {
        variants: {
            color: {
                default: 'bg-primary',
                success: 'bg-success',
                warning: 'bg-warning',
                danger: 'bg-destructive',
                info: 'bg-info',
                gradient: 'bg-gradient-to-r from-primary to-secondary',
            },
        },
        defaultVariants: {
            color: 'default',
        },
    }
);

type ColorVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';

export interface ProgressBarProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof progressBarVariants> {
    value: number;
    max?: number;
    showLabel?: boolean;
    showPercentage?: boolean;
    label?: string;
    formatValue?: (value: number, max: number) => string;
    animated?: boolean;
    striped?: boolean;
    autoColor?: boolean;
    color?: ColorVariant;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
    ({
        className,
        size,
        color,
        value,
        max = 100,
        showLabel = false,
        showPercentage = false,
        label,
        formatValue,
        animated = false,
        striped = false,
        autoColor = false,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

        // Auto color based on percentage
        const getAutoColor = (): ColorVariant => {
            if (percentage < 50) return 'success';
            if (percentage < 75) return 'warning';
            return 'danger';
        };

        const finalColor: ColorVariant = autoColor ? getAutoColor() : (color || 'default');

        const stripedClasses = striped ? 'bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]' : '';
        const animatedClasses = animated ? 'animate-[progress-stripes_1s_linear_infinite]' : '';

        return (
            <div className={cn('w-full space-y-1', className)} ref={ref} {...props}>
                {(showLabel || showPercentage) && (
                    <div className="flex items-center justify-between text-sm">
                        {showLabel && label && (
                            <span className="text-muted-foreground">{label}</span>
                        )}
                        {showPercentage && (
                            <span className="text-muted-foreground font-medium">
                                {formatValue 
                                    ? formatValue(value, max) 
                                    : `${percentage.toFixed(1)}%`
                                }
                            </span>
                        )}
                    </div>
                )}
                <div className={cn(progressBarVariants({ size }))}>
                    <motion.div
                        className={cn(
                            progressFillVariants({ color: finalColor }),
                            stripedClasses,
                            animatedClasses
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        role="progressbar"
                        aria-valuenow={value}
                        aria-valuemin={0}
                        aria-valuemax={max}
                    />
                </div>
            </div>
        );
    }
);

ProgressBar.displayName = 'ProgressBar';

// Stats Progress Card Component
export interface StatsProgressProps {
    label: string;
    value: string;
    subValue?: string;
    percentage: number;
    icon?: React.ReactNode;
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gradient';
    autoColor?: boolean;
}

const StatsProgress = React.forwardRef<HTMLDivElement, StatsProgressProps>(
    ({ label, value, subValue, percentage, icon, color = 'default', autoColor = false }, ref) => {
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
                    size="sm" 
                />
            </div>
        );
    }
);

StatsProgress.displayName = 'StatsProgress';

export { ProgressBar, StatsProgress };


