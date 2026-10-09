import { cn } from "../utils.js";
import { VariantProps, cva } from "class-variance-authority";
import React from "react";
import { Separator } from "./separator.js";

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

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextVariants {
    text: string;
    description?: string;
    textForm?: boolean;
    icon?: React.ReactNode;
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(({ className, text, variant, align, weight, size, lineHeight, truncate, textForm, description, icon, ...props }, ref) => {

    if (variant === 'field') {
        return (
            <div
                ref={ref}
                className={cn(textVariants({ variant, align, weight, size, lineHeight, truncate }), className, "flex items-center gap-2")}
                {...props}
            >
                {icon ? (
                    <div className="flex-shrink-0 p-2 rounded-md bg-primary/10 text-primary">
                        {icon}
                    </div>
                ) : (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
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
                className={cn(textVariants({ variant, align, weight, size, lineHeight, truncate }), className)}
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


