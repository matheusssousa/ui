'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'framer-motion';

// Context para gerenciar o estado do acordeon
interface AccordionContextProps {
    openItems: string[];
    toggleItem: (value: string) => void;
    multiple?: boolean;
}

const AccordionContext = React.createContext<AccordionContextProps | null>(null);

const useAccordion = () => {
    const context = React.useContext(AccordionContext);
    if (!context) {
        throw new Error('useAccordion deve ser usado dentro de um componente Accordion');
    }
    return context;
};

// Variantes do acordeon
const accordionVariants = cva(
    'w-full space-y-2',
    {
        variants: {
            variant: {
                default: '',
                bordered: 'border border-border rounded-lg p-2',
                separated: 'space-y-3',
                panel: 'space-y-2',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// Variantes do item
const accordionItemVariants = cva(
    'border border-border rounded-lg overflow-hidden transition-all',
    {
        variants: {
            variant: {
                default: 'bg-card',
                outlined: 'bg-transparent',
                filled: 'bg-muted/50',
                panel: 'rounded-xl border-border/80 bg-card shadow-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

// Variantes do trigger (botão que abre/fecha)
const accordionTriggerVariants = cva(
    'flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    {
        variants: {
            size: {
                sm: 'p-3 text-sm',
                md: 'p-4 text-base',
                lg: 'p-5 text-lg',
            },
            variant: {
                default: '',
                panel: 'px-4 py-3.5 text-sm hover:bg-muted/40',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

const accordionContentVariants = cva('text-sm', {
    variants: {
        variant: {
            default: 'p-4 pt-0',
            panel: 'border-t border-border bg-muted/15 p-3',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

// Props dos componentes
export interface AccordionProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof accordionVariants> {
    defaultValue?: string | string[];
    multiple?: boolean;
}

export interface AccordionItemProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof accordionItemVariants> {
    value: string;
}

export interface AccordionTriggerProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof accordionTriggerVariants> {
    children: React.ReactNode;
    rightContent?: React.ReactNode;
}

export interface AccordionContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof accordionContentVariants> {
    children: React.ReactNode;
}

// Componente principal Accordion
const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, variant, defaultValue, multiple = false, children, ...props }, ref) => {
        const [openItems, setOpenItems] = React.useState<string[]>(() => {
            if (!defaultValue) return [];
            return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
        });

        const toggleItem = React.useCallback((value: string) => {
            setOpenItems((prev) => {
                if (multiple) {
                    return prev.includes(value)
                        ? prev.filter((item) => item !== value)
                        : [...prev, value];
                } else {
                    return prev.includes(value) ? [] : [value];
                }
            });
        }, [multiple]);

        return (
            <AccordionContext.Provider value={{ openItems, toggleItem, multiple }}>
                <div
                    ref={ref}
                    className={cn(accordionVariants({ variant }), className)}
                    {...props}
                >
                    {children}
                </div>
            </AccordionContext.Provider>
        );
    }
);

Accordion.displayName = 'Accordion';

// Componente AccordionItem
const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, variant, value, children, ...props }, ref) => {
        const { openItems } = useAccordion();
        const isOpen = openItems.includes(value);

        return (
            <div
                ref={ref}
                data-state={isOpen ? 'open' : 'closed'}
                className={cn(accordionItemVariants({ variant }), className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);

AccordionItem.displayName = 'AccordionItem';

// Componente AccordionTrigger
const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    ({ className, size, variant, children, rightContent, onClick, ...props }, ref) => {
        const parent = React.useContext(AccordionItemContext);
        const { openItems, toggleItem } = useAccordion();

        if (!parent) {
            throw new Error('AccordionTrigger deve ser usado dentro de AccordionItem');
        }

        const isOpen = openItems.includes(parent.value);

        return (
            <button
                ref={ref}
                type="button"
                aria-expanded={isOpen}
                className={cn(accordionTriggerVariants({ size, variant }), className)}
                onClick={(event) => {
                    toggleItem(parent.value);
                    onClick?.(event);
                }}
                {...props}
            >
                <span className="flex-1 text-left">{children}</span>
                {rightContent && (
                    <span className="mr-3 text-sm text-muted-foreground flex items-center gap-2">
                        {rightContent}
                    </span>
                )}
                <CaretDownIcon
                    className={cn(
                        'h-5 w-5 shrink-0 transition-transform duration-200',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>
        );
    }
);

AccordionTrigger.displayName = 'AccordionTrigger';

// Context para o item (para conectar trigger e content)
interface AccordionItemContextProps {
    value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextProps | null>(null);

// Wrapper para AccordionItem com context
const AccordionItemWrapper = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ value, children, ...props }, ref) => {
        return (
            <AccordionItemContext.Provider value={{ value }}>
                <AccordionItem ref={ref} value={value} {...props}>
                    {children}
                </AccordionItem>
            </AccordionItemContext.Provider>
        );
    }
);

AccordionItemWrapper.displayName = 'AccordionItem';

// Componente AccordionContent
const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
    ({ className, variant, children, ...props }, ref) => {
        const parent = React.useContext(AccordionItemContext);
        const { openItems } = useAccordion();

        if (!parent) {
            throw new Error('AccordionContent deve ser usado dentro de AccordionItem');
        }

        const isOpen = openItems.includes(parent.value);

        return (
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={isOpen ? 'overflow-visible' : 'overflow-hidden'}
                    >
                        <div
                            ref={ref}
                            className={cn(accordionContentVariants({ variant }), className)}
                            {...props}
                        >
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
);

AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent };


