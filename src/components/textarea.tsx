'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import dynamic from 'next/dynamic.js';

const CircleNotchIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CircleNotchIcon), { ssr: false });

const textareaVariants = cva(
    'flex min-h-[80px] w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-sm placeholder:text-muted-foreground/60 placeholder:opacity-0 placeholder:transition-opacity placeholder:duration-300 placeholder:delay-150 focus:placeholder:opacity-100 disabled:cursor-not-allowed disabled:opacity-50 transition-colors focus-visible:outline-none focus:border-primary/60 focus:ring-primary/20 resize-none',
    {
        variants: {
            variant: {
                default: '',
                outline: 'border border-border/60',
                filled: 'bg-muted border-muted text-foreground',
            },
            validation: {
                default: '',
                error: 'border-destructive focus-visible:ring-destructive',
                success: 'border-success focus-visible:ring-success',
                warning: 'border-warning focus-visible:ring-warning',
            },
        },
        defaultVariants: {
            variant: 'default',
            validation: 'default',
        },
    }
);

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
    validation?: 'default' | 'error' | 'success' | 'warning';
    isLoading?: boolean;
    label?: string;
    error?: string;
    helperText?: string;
    showCharCount?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    maxLength?: number;
    isInCard?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            className,
            variant,
            validation,
            isLoading,
            label,
            placeholder,
            error,
            helperText,
            showCharCount = false,
            leftIcon,
            rightIcon,
            maxLength,
            value,
            isInCard = false,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);
        const [charCount, setCharCount] = React.useState(0);

        const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setCharCount(e.target.value.length);
            setHasValue(!!e.target.value);
            props.onChange?.(e);
        };

        React.useEffect(() => {
            const currentValue = (value ?? props.defaultValue ?? '') as string;
            setCharCount(currentValue.length);
            setHasValue(!!currentValue);
        }, [value, props.defaultValue]);

        const shouldFloatLabel = isFocused || hasValue;
        const showCounter = showCharCount && maxLength;
        const isNearLimit = maxLength && charCount > maxLength * 0.9;

        const renderTextareaWithLabel = () => (
            <div className="w-full">
                <div className="relative w-full">
                    {leftIcon && (
                        <span className="absolute left-3 top-3 z-10 text-muted-foreground">
                            {leftIcon}
                        </span>
                    )}
                    <textarea
                        ref={ref}
                        className={cn(
                            textareaVariants({ variant, validation }),
                            leftIcon && 'pl-10',
                            (isLoading || rightIcon) && 'pr-10',
                            'peer',
                            isInCard && 'bg-card',
                            className
                        )}
                        placeholder={shouldFloatLabel ? placeholder : ''}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={value}
                        maxLength={maxLength}
                        {...props}
                    />
                    <label
                        className={cn(
                            'absolute text-sm text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none',
                            leftIcon ? 'left-10' : 'left-3',
                            shouldFloatLabel
                                ? `-top-2 ${isInCard ? 'bg-card' : 'bg-background'} px-1 text-xs`
                                : 'top-3'
                        )}
                    >
                        {label}
                    </label>
                    {isLoading && (
                        <CircleNotchIcon className="absolute right-3 top-3 animate-spin text-muted-foreground" size={18} />
                    )}
                    {!isLoading && rightIcon && (
                        <span className="absolute right-3 top-3 text-muted-foreground">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Footer: Error, Helper Text e Character Count */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex-1">
                        {error && (
                            <small role="alert" className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                                {error}
                            </small>
                        )}
                        {!error && helperText && (
                            <small className="text-xs text-muted-foreground">
                                {helperText}
                            </small>
                        )}
                    </div>
                    {showCounter && (
                        <small className={cn(
                            'text-xs font-medium tabular-nums transition-colors',
                            isNearLimit ? 'text-warning' : 'text-muted-foreground'
                        )}>
                            {charCount}/{maxLength}
                        </small>
                    )}
                </div>
            </div>
        );

        const renderTextareaWithoutLabel = () => (
            <div className="w-full">
                <div className="relative w-full">
                    {leftIcon && (
                        <span className="absolute left-3 top-3 text-muted-foreground">
                            {leftIcon}
                        </span>
                    )}
                    <textarea
                        ref={ref}
                        className={cn(
                            textareaVariants({ variant, validation }),
                            leftIcon && 'pl-10',
                            (isLoading || rightIcon) && 'pr-10',
                            isInCard && 'bg-card',
                            className
                        )}
                        placeholder={placeholder}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={value}
                        maxLength={maxLength}
                        {...props}
                    />
                    {isLoading && (
                        <CircleNotchIcon className="absolute right-3 top-3 animate-spin text-muted-foreground" size={18} />
                    )}
                    {!isLoading && rightIcon && (
                        <span className="absolute right-3 top-3 text-muted-foreground">
                            {rightIcon}
                        </span>
                    )}
                </div>

                {/* Footer: Error, Helper Text e Character Count */}
                <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="flex-1">
                        {error && (
                            <small role="alert" className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                                {error}
                            </small>
                        )}
                        {!error && helperText && (
                            <small className="text-xs text-muted-foreground">
                                {helperText}
                            </small>
                        )}
                    </div>
                    {showCounter && (
                        <small className={cn(
                            'text-xs font-medium tabular-nums transition-colors',
                            isNearLimit ? 'text-warning' : 'text-muted-foreground'
                        )}>
                            {charCount}/{maxLength}
                        </small>
                    )}
                </div>
            </div>
        );

        return label ? renderTextareaWithLabel() : renderTextareaWithoutLabel();
    }
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };


