'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { CaretDoubleDownIcon, CaretDoubleUpIcon, CircleNotchIcon } from '@phosphor-icons/react/dist/ssr';
import { formatDate } from '../functions/formatDate.js';


const logAccordionVariants = cva(
    'w-full inline-flex overflow-x-auto flex flex-col justify-between rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden transition-discrete duration-300',
    {
        variants: {
            size: {
                default: 'py-2 px-4',
                sm: 'py-1 px-2 text-xs',
                lg: 'py-3 px-6 text-base',
            },
            color: {
                default: 'bg-background text-foreground hover:bg-background/80',
                primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                tertiary: 'bg-tertiary text-tertiary-foreground hover:bg-tertiary/80',
                success: 'bg-success text-success-foreground hover:bg-success/80',
                warning: 'bg-warning text-warning-foreground hover:bg-warning/80',
                danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
                info: 'bg-info text-info-foreground hover:bg-info/80',
                neutral: 'bg-neutral text-neutral-foreground hover:bg-neutral/80',
                background: 'bg-background text-foreground hover:bg-muted/80',
            },
        },
        defaultVariants: {
            size: 'default',
            color: 'default',
        }
    }
);

type PolymorphicProps = React.HTMLProps<HTMLDivElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/** Painel expansível que exibe dados de log. */
export interface LogAccordionProps extends Omit<PolymorphicProps, 'color' | 'size'>, VariantProps<typeof logAccordionVariants> {
    /** Substitui o ícone por indicador de carregamento e desativa a expansão. */
    isLoading?: boolean;
    /** Título do painel. */
    title: string;
    /** Data ou descrição exibida abaixo do título. */
    description?: string;
    /** Dados a exibir quando expandido. */
    log: unknown;
}

const LogAccordion = React.forwardRef<HTMLDivElement, LogAccordionProps>(
    ({ isLoading, title, description, log, size, color, ...props }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const handleToggle = () => {
            setIsOpen(!isOpen);
        };

        const renderIcon = () => {
            if (isLoading) {
                return <CircleNotchIcon className="animate-spin" />;
            }
            return isOpen ? <CaretDoubleUpIcon /> : <CaretDoubleDownIcon />;
        };

        return (
            <div ref={ref} {...props} className={cn(logAccordionVariants({ size, color }))}>
                <button
                    className='cursor-pointer'
                    onClick={handleToggle}
                    disabled={isLoading}
                >
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h3 className="font-semibold capitalize">{title}</h3>
                            {description && <p className="text-xs text-start">{formatDate(description).date} | {formatDate(description).time}</p>}
                        </div>
                        <span className="text-lg">{renderIcon()}</span>
                    </div>
                </button>
                {isOpen && (
                    <div className="mt-2 p-4 text-xs rounded-lg">
                        <pre>{JSON.stringify(log, null, 2)}</pre>
                    </div>
                )}
            </div>
        );
    }
);

LogAccordion.displayName = 'LogAccordion';

export default LogAccordion;



