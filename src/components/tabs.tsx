'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils.js';
import { toneClasses, type UIColor } from './theme.js';

export type TabsVariant = 'underline' | 'pills' | 'segmented' | 'cards' | 'sidebar';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsMobileBehavior = 'scroll' | 'wrap' | 'equal';
export type TabsContentAnimation = 'fade' | 'slide' | 'none';

const tabsListVariants = cva('relative flex items-center', {
    variants: {
        variant: {
            underline: 'border-b border-border/60',
            pills: 'gap-1 rounded-xl bg-muted/50 p-1',
            segmented: 'gap-1 rounded-xl border border-border/70 bg-background p-1 shadow-sm',
            cards: 'gap-2',
            sidebar: 'w-full gap-2 pb-3 lg:flex-col lg:overflow-visible lg:rounded-2xl',
        },
        mobileBehavior: {
            scroll: 'w-full max-w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            wrap: 'flex-wrap gap-y-2',
            equal: 'grid w-full auto-cols-fr grid-flow-col overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        },
        fullWidth: {
            true: 'w-full',
            false: 'w-fit max-w-full',
        },
    },
    defaultVariants: {
        variant: 'underline',
        mobileBehavior: 'scroll',
        fullWidth: false,
    },
});

const tabsTriggerVariants = cva(
    'relative isolate inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium text-muted-foreground transition-colors duration-200 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                underline: '-mb-px rounded-t-lg',
                pills: 'rounded-lg',
                segmented: 'rounded-lg',
                cards: 'rounded-xl border border-border/70 bg-card shadow-sm',
                sidebar: 'min-w-max justify-start rounded-xl text-left lg:min-w-0 lg:w-full lg:border-transparent lg:bg-transparent',
            },
            size: {
                sm: 'min-h-10 px-3 py-2 text-xs',
                md: 'min-h-11 px-4 py-2.5 text-sm',
                lg: 'min-h-12 px-5 py-3 text-sm',
            },
            mobileBehavior: {
                scroll: 'snap-start',
                wrap: '',
                equal: 'min-w-28',
            },
            fullWidth: {
                true: 'flex-1',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'underline',
            size: 'md',
            mobileBehavior: 'scroll',
            fullWidth: false,
        },
    },
);

interface TabsContextProps {
    activeTab: string;
    setActiveTab: (value: string) => void;
    baseId: string;
    layoutId: string;
    variant: TabsVariant;
    color: UIColor;
    size: TabsSize;
    mobileBehavior: TabsMobileBehavior;
    fullWidth: boolean;
    contentAnimation: TabsContentAnimation;
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

const useTabs = () => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('useTabs deve ser usado dentro de um componente Tabs');
    return context;
};

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    variant?: TabsVariant;
    color?: UIColor;
    size?: TabsSize;
    mobileBehavior?: TabsMobileBehavior;
    fullWidth?: boolean;
    contentAnimation?: TabsContentAnimation;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
    {
        defaultValue,
        value,
        onValueChange,
        variant = 'underline',
        color = 'primary',
        size = 'md',
        mobileBehavior = 'scroll',
        fullWidth = false,
        contentAnimation = 'slide',
        className,
        children,
        ...props
    },
    ref,
) {
    const [uncontrolledActiveTab, setUncontrolledActiveTab] = React.useState(defaultValue);
    const reactId = React.useId().replace(/:/g, '');
    const activeTab = value ?? uncontrolledActiveTab;

    const setActiveTab = React.useCallback((nextValue: string) => {
        if (value === undefined) setUncontrolledActiveTab(nextValue);
        onValueChange?.(nextValue);
    }, [onValueChange, value]);

    const contextValue = React.useMemo<TabsContextProps>(() => ({
        activeTab,
        setActiveTab,
        baseId: `tabs-${reactId}`,
        layoutId: `tabs-indicator-${reactId}`,
        variant,
        color,
        size,
        mobileBehavior,
        fullWidth,
        contentAnimation,
    }), [activeTab, color, contentAnimation, fullWidth, mobileBehavior, reactId, setActiveTab, size, variant]);

    return (
        <TabsContext.Provider value={contextValue}>
            <div ref={ref} className={cn('min-w-0', className)} {...props}>{children}</div>
        </TabsContext.Provider>
    );
});

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
    { children, className, ...props },
    ref,
) {
    const { variant, mobileBehavior, fullWidth } = useTabs();
    const [sidebarIsVertical, setSidebarIsVertical] = React.useState(false);

    React.useEffect(() => {
        if (variant !== 'sidebar') return;
        const media = window.matchMedia('(min-width: 1024px)');
        const updateOrientation = () => setSidebarIsVertical(media.matches);
        updateOrientation();
        media.addEventListener('change', updateOrientation);
        return () => media.removeEventListener('change', updateOrientation);
    }, [variant]);

    return (
        <div
            ref={ref}
            role="tablist"
            aria-orientation={variant === 'sidebar' && sidebarIsVertical ? 'vertical' : 'horizontal'}
            className={cn(tabsListVariants({ variant, mobileBehavior, fullWidth }), variant === 'sidebar' && 'w-full', className)}
            {...props}
        >
            {children}
        </div>
    );
});

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger(
    { value, children, className, disabled, onClick, onKeyDown, ...props },
    ref,
) {
    const { activeTab, setActiveTab, baseId, layoutId, variant, color, size, mobileBehavior, fullWidth } = useTabs();
    const reduceMotion = useReducedMotion();
    const isActive = activeTab === value;
    const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, '-');
    const localRef = React.useRef<HTMLButtonElement>(null);

    React.useImperativeHandle(ref, () => localRef.current as HTMLButtonElement);

    React.useEffect(() => {
        if (isActive && mobileBehavior === 'scroll') {
            localRef.current?.scrollIntoView({
                behavior: reduceMotion ? 'auto' : 'smooth',
                block: 'nearest',
                inline: 'center',
            });
        }
    }, [isActive, mobileBehavior, reduceMotion]);

    const tone = toneClasses[color];
    const indicatorClassName = cn({
        underline: 'absolute inset-x-2 -bottom-px h-0.5 rounded-full',
        pills: 'absolute inset-0 z-0 rounded-lg shadow-sm',
        segmented: 'absolute inset-0 z-0 rounded-lg shadow-sm',
        cards: 'absolute inset-0 z-0 rounded-xl',
        sidebar: 'absolute inset-0 z-0 rounded-xl ring-1 ring-inset',
    }[variant], variant === 'underline' || variant === 'pills' || variant === 'segmented' ? tone.fill : tone.soft,
    variant === 'sidebar' && tone.outline);

    return (
        <button
            ref={localRef}
            id={`${baseId}-trigger-${safeValue}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`${baseId}-panel-${safeValue}`}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            data-state={isActive ? 'active' : 'inactive'}
            onClick={(event) => {
                setActiveTab(value);
                onClick?.(event);
            }}
            onKeyDown={(event) => {
                onKeyDown?.(event);
                if (event.defaultPrevented || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;

                const triggers = Array.from(
                    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? [],
                );
                const currentIndex = triggers.indexOf(event.currentTarget);
                if (currentIndex < 0 || triggers.length === 0) return;

                event.preventDefault();
                const nextIndex = event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                        ? triggers.length - 1
                        : event.key === 'ArrowRight' || event.key === 'ArrowDown'
                            ? (currentIndex + 1) % triggers.length
                            : (currentIndex - 1 + triggers.length) % triggers.length;

                triggers[nextIndex]?.focus();
                triggers[nextIndex]?.click();
            }}
            className={cn(
                tabsTriggerVariants({ variant, size, mobileBehavior, fullWidth }),
                isActive && (variant === 'pills' || variant === 'segmented' ? tone.onSolid : tone.text),
                isActive && (variant === 'cards' || variant === 'sidebar') && tone.outline,
                !isActive && cn('hover:text-foreground', tone.hoverSoft),
                !isActive && (variant === 'cards' || variant === 'sidebar') && tone.hoverOutline,
                className,
            )}
            {...props}
        >
            <span className={cn('relative z-10 inline-flex items-center justify-center gap-2', variant === 'sidebar' && 'w-full justify-start')}>
                {children}
            </span>
            {isActive && (
                <motion.span
                    aria-hidden="true"
                    layoutId={layoutId}
                    className={indicatorClassName}
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                />
            )}
        </button>
    );
});

export interface TabsContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    value: string;
    keepMounted?: boolean;
    children?: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent(
    { value, children, className, keepMounted = false, ...props },
    ref,
) {
    const { activeTab, baseId, contentAnimation } = useTabs();
    const reduceMotion = useReducedMotion();
    const isActive = activeTab === value;
    const safeValue = value.replace(/[^a-zA-Z0-9_-]/g, '-');

    if (!isActive && !keepMounted) return null;

    const initial = reduceMotion || contentAnimation === 'none'
        ? false
        : contentAnimation === 'fade'
            ? { opacity: 0 }
            : { opacity: 0, y: 8 };
    const animate = isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 };

    return (
        <motion.div
            ref={ref}
            id={`${baseId}-panel-${safeValue}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-trigger-${safeValue}`}
            tabIndex={0}
            hidden={!isActive}
            initial={initial}
            animate={animate}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn('min-w-0 focus-visible:outline-none', className)}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Tabs.displayName = 'Tabs';
TabsList.displayName = 'TabsList';
TabsTrigger.displayName = 'TabsTrigger';
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };


