import { cn } from "../utils.js";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";
import { Separator } from "./separator.js";
import { toneClasses, type UIColor } from './theme.js';

const textVariants = cva("text-foreground", {
    variants: {
        variant: {
            default: "text-base",
            muted: "text-sm text-muted-foreground",
            emphasis: "text-base font-medium text-foreground",
            large: "text-lg",
            small: "text-sm",
            lead: "text-xl font-light",
            highlight: "text-base font-semibold text-info",
            error: "text-sm text-destructive",
            success: "text-sm text-success",
            warning: "text-sm text-warning",
            info: "text-sm text-indigo-600 dark:text-indigo-400",
            subtle: "text-sm text-muted-foreground/75",
            code: "font-mono bg-muted px-1 rounded text-sm",
            field: "text-sm font-medium text-foreground",
        },
        align: {
            left: "text-left",
            center: "text-center",
            right: "text-right",
        },
        weight: {
            light: "font-light",
            normal: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
        },
        size: {
            sm: "text-sm",
            md: "text-base",
            lg: "text-lg",
            xl: "text-xl",
        },
        lineHeight: {
            normal: "leading-normal",
            relaxed: "leading-relaxed",
            snug: "leading-snug",
            tight: "leading-tight",
        },
        truncate: {
            true: "truncate",
            false: "",
        },
    },
    defaultVariants: {
        variant: "default",
        align: "left",
        weight: "normal",
        size: "md",
        lineHeight: "normal",
        truncate: false,
    },
});

export type TextVariants = VariantProps<typeof textVariants>;

/** Texto com estilos tipográficos e opção de ícone em `field`. */
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextVariants {
    /** Texto principal a ser exibido. */
    text: string;
    /** Texto secundário usado na variante `field`. */
    description?: string;
    /** Exibe um separador após o texto. */
    textForm?: boolean;
    /** Ícone usado na variante `field`. */
    icon?: React.ReactNode;
    /** Tone do texto ou do destaque em `field`; padrão da variante quando ausente. */
    color?: UIColor;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(({ className, text, variant, align, weight, size, lineHeight, truncate, textForm, description, icon, color, ...props }, ref) => {

    if (variant === 'field') {
        return (
            <div
                ref={ref}
                className={cn(textVariants({ variant, align, weight, size, lineHeight, truncate }), color && toneClasses[color].text, className, "flex items-center gap-2")}
                {...props}
            >
                {icon ? (
                    <div className={cn('flex-shrink-0 rounded-md p-2', toneClasses[color ?? 'primary'].soft)}>
                        {icon}
                    </div>
                ) : (
                    <div className={cn('h-2 w-2 shrink-0 rounded-full', toneClasses[color ?? 'primary'].fill)} />
                )}
                <span className="flex flex-col gap-0 font-medium">
                    {text}
                    {description && <small className="text-muted-foreground font-normal">{description}</small>}
                </span>
            </div>
        );
    }

    return (
        <>
            <p
                ref={ref}
                className={cn(textVariants({ variant, align, weight, size, lineHeight, truncate }), color && toneClasses[color].text, className)}
                {...props}
            >
                {variant === 'code' ? <code>{text}</code> : text}
            </p>
            {textForm && <Separator className="mt-1" />}
        </>
    );
});

Text.displayName = "Text";

export default Text;


