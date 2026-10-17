import React from "react";
import { cn } from "../utils.js";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link.js";
import { toneClasses, type UIColor } from './theme.js';

export const tipVariants = cva(
    "rounded-lg border p-4 transition-all",
    {
        variants: {
            variant: {
                default:
                    "bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/50 text-foreground",
                destructive:
                    "bg-destructive/10 border-destructive/25 text-destructive",
                success:
                    "bg-success/10 border-success/25 text-success",
                warning:
                    "bg-warning/10 border-warning/25 text-warning",
                info:
                    "bg-info/10 border-info/25 text-info",
                purple:
                    "bg-violet/10 border-violet/25 text-violet",
                pink:
                    "bg-pink/10 border-pink/25 text-pink",
                premium:
                    "bg-gradient-to-r from-warning/10 to-orange/10 border-warning/25 text-warning",
            },
            size: {
                default: "p-4",
                sm: "p-3 text-sm",
                lg: "p-6 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

/** Dica contextual com ícone e ação opcional; `color` substitui a cor da variante. */
export interface TipProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tipVariants> {
    /** Tone aplicado ao fundo suave, borda e texto. */
    color?: UIColor;
    /** Ícone decorativo à esquerda. */
    icon?: React.ReactNode;
    /** Conteúdo da dica. */
    children?: React.ReactNode;
    /** Ação opcional como link ou botão. */
    action?: {
        /** Texto exibido na ação. */
        label?: string;
        /** Callback da ação quando `href` não é usado. */
        onClick?: () => void;
        /** Destino da ação quando renderizada como link. */
        href?: string;
    };
    /** Callback do botão de fechar. */
    onClose?: () => void;
}

export function Tip({
    className,
    variant,
    size,
    color,
    icon,
    children,
    action,
    onClose,
    ...props
}: TipProps) {
    return (
        <div
            className={cn(tipVariants({ variant: color ? null : variant, size }), color && toneClasses[color].soft, color && toneClasses[color].outline, className)}
            role="alert"
            {...props}
        >
            <div className="flex items-start gap-3">
                {icon && (
                    <span className="flex-shrink-0 mt-0.5" aria-hidden="true">
                        {icon}
                    </span>
                )}

                <div className="flex flex-col md:flex-row gap-3 justify-between w-full items-start md:items-center">
                    <div className="text-sm leading-relaxed">
                        {children}
                    </div>

                    {action && (
                        <div className="flex items-center gap-2">
                            {action.href ? (
                                <Link
                                    href={action.href}
                                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                                >
                                    {action.label}
                                    <ArrowRightIcon size={14} />
                                </Link>
                            ) : (
                                <button
                                    onClick={action.onClick}
                                    className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                                >
                                    {action.label}
                                    <ArrowRightIcon size={14} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        aria-label="Fechar"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

Tip.displayName = "Tip";


