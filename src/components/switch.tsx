'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';

const switchVariants = cva(
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-muted data-[state=checked]:bg-primary',
                outline: 'bg-transparent border-border-foreground data-[state=checked]:border-primary',
                soft: 'bg-muted data-[state=checked]:bg-primary/25',
                success: 'bg-muted data-[state=checked]:bg-success',
            },
            size: {
                sm: 'h-5 w-9', md: 'h-6 w-11', lg: 'h-8 w-14',
            },
            state: {
                checked: 'data-[state=checked]:bg-primary',
                unchecked: 'data-[state=unchecked]:bg-muted',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            state: 'unchecked',
        },
    }
);


export interface SwitchProps
    extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof switchVariants> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    (
        { className, variant, size, state, checked, onCheckedChange, disabled, ...props },
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

        return (
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                data-state={isChecked ? 'checked' : 'unchecked'}
                className={cn(switchVariants({ variant, size, state: isChecked ? 'checked' : 'unchecked', className }))}
                onClick={toggle}
                ref={ref}
                disabled={disabled}
                {...props}
            >
                <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                    className={cn(
                        'pointer-events-none block rounded-full bg-white shadow-sm',
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


