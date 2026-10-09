import { cn } from "../utils.js";
import { cva, type VariantProps } from "class-variance-authority";
import React from "react";
import { Button } from "./button.js";
import { LinkIcon } from "@phosphor-icons/react/dist/ssr";

const infoVariants = cva(
    'w-full flex flex-col gap-1 rounded-xl transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-background/50 border border-border/30 p-3',
                card: 'bg-card border border-border/50 p-4 shadow-sm',
                minimal: 'border-b border-border/30 pb-2',
                filled: 'bg-muted/30 p-3',
            },
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
            },
            grid: {
                1: 'sm:col-span-1',
                2: 'sm:col-span-2',
                3: 'sm:col-span-3',
                4: 'sm:col-span-4',
                5: 'sm:col-span-5',
            }
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            grid: 1,
        }
    }
);

const labelVariants = cva(
    'font-medium text-muted-foreground',
    {
        variants: {
            size: {
                sm: 'text-xs',
                md: 'text-sm',
                lg: 'text-base',
            },
        },
        defaultVariants: {
            size: 'md',
        }
    }
);

const valueVariants = cva(
    'font-medium text-foreground flex items-center gap-2 min-w-0',
    {
        variants: {
            size: {
                xs: 'text-xs',
                sm: 'text-sm',
                md: 'text-md',
            },
        },
        defaultVariants: {
            size: 'sm',
        }
    }
);

export interface InfoProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof infoVariants> {
    label: React.ReactNode;
    value?: React.ReactNode;
    icon?: React.ReactNode;
    copyable?: boolean;
    loading?: boolean;
    link?: string;
}

/**
 * Componente de informação para exibir dados importantes de forma clara e destacada. Pode ser usado para mostrar estatísticas, status ou qualquer outro tipo de informação relevante. Suporta diferentes variantes visuais e tamanhos, além de permitir a cópia do valor para a área de transferência. Ideal para dashboards, páginas de detalhes ou qualquer lugar onde seja necessário destacar informações importantes.
 * 
 * @param label - O rótulo ou título da informação.
 * @param value - O valor ou conteúdo da informação. Se não for fornecido, o conteúdo filho será usado.
 * @param icon - Um ícone opcional para acompanhar a informação.
 * @param copyable - Se verdadeiro, exibe um botão para copiar o valor para a área de transferência.
 * @param loading - Se verdadeiro, exibe um estado de carregamento no lugar do valor.
 * @param variant - A variante visual do componente (default, card, minimal, filled).
 * @param size - O tamanho do componente (sm, md, lg).
 */
const Info = React.forwardRef<HTMLDivElement, InfoProps>(
    ({ className, variant, size, label, value, icon, copyable, loading, children, link, grid, ...props }, ref) => {
        const valueSize: 'xs' | 'sm' | 'md' | undefined = size === 'lg' ? 'md' : (size as 'sm' | 'md' | undefined);
        const contentValue = value || children;

        return (
            <div
                ref={ref}
                className={cn(infoVariants({ variant, size, grid }), className)}
                {...props}
            >
                <span className={cn(labelVariants({ size }))}>
                    {label}
                </span>

                <div className={cn(valueVariants({ size: valueSize }))}>
                    {icon && (
                        <span className="text-muted-foreground">
                            {icon}
                        </span>
                    )}

                    {loading ? (
                        <div className="h-4 w-20 bg-muted-foreground/50 animate-pulse rounded" />
                    ) : (
                        <span className="flex-1 min-w-0 whitespace-pre-wrap break-all">
                            {value || children || '-'}
                        </span>
                    )}

                    {copyable && contentValue && typeof contentValue !== 'object' && (
                        <Button
                            copyValue={String(contentValue)}
                            variant="text"
                            size="xs"
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Copiar"
                            fullWidth={false}
                        />
                    )}

                    {link && (
                        <Button
                            asLink
                            href={link}
                            leftIcon={<LinkIcon size={12} />}
                            variant="text"
                            className="text-muted-foreground hover:text-foreground p-1 h-fit"
                            fullWidth={false}
                        />
                    )}
                </div>
            </div>
        );
    }
);

Info.displayName = 'Info';

export { Info };


