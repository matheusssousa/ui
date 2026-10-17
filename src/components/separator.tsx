import * as React from 'react';
import { cn } from '../utils.js';
import { motion } from 'framer-motion';

/** Divisor horizontal ou vertical. */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Direção do divisor; padrão horizontal. */
    orientation?: 'horizontal' | 'vertical';
    /** Aparência da linha. */
    variant?: 'default' | 'gradient' | 'dashed';
    /** Texto central opcional. */
    text?: string;
    /** Anima a entrada. */
    animationEntrance?: boolean;
    /** Anima a saída. */
    animationOut?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, orientation = 'horizontal', variant = 'default', text, animationEntrance = false, animationOut = false, ...props }, ref) => {
        const animationProps = (animationEntrance || animationOut) ? {
            initial: { opacity: 0, scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 },
            animate: { opacity: 1, scaleX: 1, scaleY: 1 },
            exit: { opacity: 0, scaleX: orientation === 'horizontal' ? 0 : 1, scaleY: orientation === 'vertical' ? 0 : 1 },
            transition: { duration: 0.4, ease: "easeOut" as const }
        } : {};

        const wrapWithAnimation = (content: React.ReactElement) => {
            if (animationEntrance || animationOut) {
                return (
                    <motion.div {...animationProps}>
                        {content}
                    </motion.div>
                );
            }
            return content;
        };

        if (text) {
            return wrapWithAnimation(
                <div
                    ref={ref}
                    className={cn('relative flex items-center my-6', className)}
                    {...props}
                >
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="px-4 text-sm text-muted-foreground font-medium bg-background">
                        {text}
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                </div>
            );
        }

        if (variant === 'gradient') {
            return wrapWithAnimation(
                <div
                    ref={ref}
                    className={cn(
                        orientation === 'horizontal' 
                            ? 'w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-6'
                            : 'h-full w-px bg-gradient-to-b from-transparent via-border to-transparent mx-6',
                        className
                    )}
                    {...props}
                />
            );
        }

        if (variant === 'dashed') {
            return wrapWithAnimation(
                <div
                    ref={ref}
                    className={cn(
                        orientation === 'horizontal'
                            ? 'w-full border-t border-dashed border-border my-6'
                            : 'h-full border-l border-dashed border-border mx-6',
                        className
                    )}
                    {...props}
                />
            );
        }

        return wrapWithAnimation(
            <div
                ref={ref}
                className={cn(
                    orientation === 'horizontal' 
                        ? 'w-full h-px bg-border my-6' 
                        : 'h-full w-px bg-border mx-6',
                    className
                )}
                {...props}
            />
        );
    }
);

Separator.displayName = 'Separator';

export { Separator };


