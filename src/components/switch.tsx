'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { toneClasses, type UIColor } from './theme.js';

const switchVariants = cva(
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-muted',
                outline: 'bg-transparent border-border-foreground',
                soft: 'bg-muted',
                success: 'bg-muted',
            },
            size: {
                sm: 'h-5 w-9', md: 'h-6 w-11', lg: 'h-8 w-14',
            },
            state: {
                checked: '',
                unchecked: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            state: 'unchecked',
        },
    }
);


const thumbColors: Record<UIColor, string> = {
    default: 'bg-background', primary: 'bg-primary-foreground', secondary: 'bg-secondary-foreground',
    tertiary: 'bg-tertiary-foreground', success: 'bg-success-foreground', warning: 'bg-warning-foreground',
    danger: 'bg-destructive-foreground', info: 'bg-info-foreground', neutral: 'bg-neutral-foreground',
    background: 'bg-foreground',
};

/** Controle liga/desliga; `color` define o tone quando ativado. */
export interface SwitchProps
    extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof switchVariants> {
    /** Estado controlado do switch. */
    checked?: boolean;
    /** Recebe o próximo estado após o clique. */
    onCheckedChange?: (checked: boolean) => void;
    /** Impede alterações pelo usuário. */
    disabled?: boolean;
    /** Cor usada no estado ligado; padrão `primary`, ou `success` na variante homônima. */
    color?: UIColor;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        { className, variant, size, state, checked, onCheckedChange, disabled, color, ...props },
        ref
    ) => {
        const [isChecked, setIsChecked] = React.useState(!!checked);
        const toggle = () => {
            if (disabled) return;
            const newChecked = !isChecked;
            setIsChecked(newChecked);
            onCheckedChange?.(newChecked);
        }

        React.useEffect(() => {
            if (typeof checked === 'boolean') {
                setIsChecked(checked);
            }
        }, [checked]);

        const resolvedColor = color ?? (variant === 'success' ? 'success' : 'primary');

        return (
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                data-state={isChecked ? 'checked' : 'unchecked'}
                className={cn(
                    switchVariants({ variant, size, state: isChecked ? 'checked' : 'unchecked' }),
                    isChecked && (variant === 'outline' ? toneClasses[resolvedColor].outline : variant === 'soft' ? toneClasses[resolvedColor].soft : toneClasses[resolvedColor].solid),
                    className,
                )}
                onClick={toggle}
                ref={ref}
                disabled={disabled}
                {...props}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    className={cn(
                        'pointer-events-none block rounded-full shadow-sm',
                        isChecked ? (variant === 'outline' ? 'bg-foreground' : variant === 'soft' ? toneClasses[resolvedColor].fill : thumbColors[resolvedColor]) : 'bg-background',
                        size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-4.5',
                        isChecked ? 'ml-auto' : 'mr-auto',
                    )}
                />
            </button>
        );
    }
);

Switch.displayName = 'Switch';

export { Switch };


