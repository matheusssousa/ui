import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import * as PhosphorIcons from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils.js";
import type { SpeedDialIcon } from "./speed-dial.js";
import { toneClasses, type UIColor } from './theme.js';

const speedDialTabsVariants = cva("fixed z-50 flex flex-col gap-2", {
    variants: {
        position: {
            "top-left": "top-4 left-4 items-start flex-col-reverse",
            "top-center": "top-4 left-1/2 -translate-x-1/2 items-center flex-col-reverse",
            "top-right": "top-4 right-4 items-end flex-col-reverse",
            "middle-left": "top-1/2 left-4 -translate-y-1/2 items-start",
            "middle-center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center",
            "middle-right": "top-1/2 right-4 -translate-y-1/2 items-end",
            "bottom-left": "bottom-4 left-4 items-start",
            "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
            "bottom-right": "bottom-4 right-4 items-end",
        },
        size: {
            xs: "text-xs",
            sm: "text-sm",
            md: "text-md",
            lg: "text-lg",
        },
        width: {
            auto: "w-auto",
            full: "w-full",
            fit: "w-fit",
        },
        rounded: {
            none: "rounded-none",
            sm: "rounded-md",
            md: "rounded-xl",
            lg: "rounded-2xl",
            full: "rounded-full",
        },
    },
    defaultVariants: { position: "bottom-right", size: "md", width: "auto", rounded: "lg" },
});

export interface SpeedDialTab {
    value: string;
    label: string;
    icon?: SpeedDialIcon;
    disabled?: boolean;
}

export interface SpeedDialTabsProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof speedDialTabsVariants> {
    tabs: SpeedDialTab[];
    triggerLabel: string;
    icon?: SpeedDialIcon;
    openIcon?: SpeedDialIcon;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    closeOnSelect?: boolean;
    color?: UIColor;
    rounded?: "none" | "sm" | "md" | "lg" | "full";
    size?: "xs" | "sm" | "md" | "lg";
    width?: "auto" | "full" | "fit";
}

function renderIcon(icon: SpeedDialIcon | undefined, size: number): React.ReactNode {
    if (typeof icon !== "string") return icon;
    const Icon = (PhosphorIcons as Record<string, unknown>)[icon];
    if (typeof Icon !== "function" && typeof Icon !== "object") return null;
    return React.createElement(Icon as React.ComponentType<{ size: number; "aria-hidden": boolean }>, {
        size,
        "aria-hidden": true,
    });
}

const SpeedDialTabs = React.forwardRef<HTMLDivElement, SpeedDialTabsProps>(
    (
        {
            tabs,
            triggerLabel,
            icon = "SquaresFourIcon",
            openIcon,
            value,
            defaultValue,
            onValueChange,
            closeOnSelect = true,
            color = 'primary',
            position = "bottom-right",
            size = "md",
            width = "auto",
            rounded = "lg",
            className,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [internalValue, setInternalValue] = useState(defaultValue);
        const selectedValue = value !== undefined ? value : internalValue;
        const containerRef = useRef<HTMLDivElement>(null);
        const listId = useId();
        const isTop = position?.startsWith("top");
        const isMiddle = position?.startsWith("middle");
        const triggerHeight = size === "xs" ? "min-h-9" : size === "sm" ? "min-h-10" : size === "lg" ? "min-h-14" : "min-h-12";
        const actionHeight = size === "xs" ? "min-h-8" : size === "sm" ? "min-h-9" : size === "lg" ? "min-h-12" : "min-h-10";
        const roundedClass = rounded === "none" ? "rounded-none" : rounded === "sm" ? "rounded-sm" : rounded === "md" ? "rounded-md" : rounded === "lg" ? "rounded-lg" : "rounded-full";
        const triggerTextSize = size === "xs" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
        const actionTextSize = size === "xs" ? "text-xs" : "text-sm";
        const iconSize = size === "xs" ? 16 : size === "sm" ? 18 : size === "lg" ? 24 : 20;
        const widthClass = width === "full" ? "w-[calc(100vw-2rem)] max-w-72" : width === "fit" ? "w-fit min-w-44" : "w-52";
        const tone = toneClasses[color];

        useEffect(() => {
            if (!isOpen) return;
            const handlePointerDown = (event: PointerEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
            };
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsOpen(false);
                    containerRef.current?.querySelector<HTMLButtonElement>("[data-speed-dial-tabs-trigger]")?.focus();
                }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("pointerdown", handlePointerDown);
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [isOpen]);

        return (
            <>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                            aria-hidden="true"
                        />
                    )}
                </AnimatePresence>
            <div
                {...props}
                ref={node => {
                    containerRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                className={cn(speedDialTabsVariants({ position }), widthClass, className)}
            >
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            id={listId}
                            role="group"
                            aria-label={triggerLabel}
                            initial={{ opacity: 0, y: isTop ? -8 : 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: isTop ? -8 : 8, scale: 0.96 }}
                            transition={{ duration: 0.16 }}
                            className={cn(
                                "flex w-full flex-col gap-1.5 overflow-y-auto p-0.5",
                                isMiddle ? "max-h-[min(40vh,20rem)]" : "max-h-[min(70vh,32rem)]"
                            )}
                        >
                            {tabs.map(tab => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    disabled={tab.disabled}
                                    aria-pressed={selectedValue === tab.value}
                                    onClick={() => {
                                        if (value === undefined) setInternalValue(tab.value);
                                        onValueChange?.(tab.value);
                                        if (closeOnSelect) setIsOpen(false);
                                    }}
                                    className={cn(
                                        "flex w-full items-center gap-3 border px-3 text-left font-medium shadow-sm transition-colors duration-150",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                        selectedValue === tab.value
                                            ? cn(tone.soft, tone.outline, tone.hoverSoft)
                                            : cn("border-border/70 bg-card text-foreground hover:bg-muted/50", tone.hoverOutline),
                                        actionHeight,
                                        actionTextSize,
                                        roundedClass
                                    )}
                                >
                                    {tab.icon && <span className="flex w-5 shrink-0 items-center justify-center" aria-hidden="true">{renderIcon(tab.icon, iconSize)}</span>}
                                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    type="button"
                    data-speed-dial-tabs-trigger
                    onClick={() => setIsOpen(open => !open)}
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    className={cn(
                        "flex w-full items-center gap-3 px-3.5 font-semibold shadow-lg transition-colors duration-150",
                        tone.solid,
                        "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        triggerHeight,
                        triggerTextSize,
                        roundedClass
                    )}
                >
                    {(icon || openIcon) && (
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={isOpen && openIcon ? "open" : "closed"}
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ duration: 0.12 }}
                                className="flex items-center justify-center"
                            >
                                {renderIcon(isOpen && openIcon ? openIcon : icon, iconSize)}
                            </motion.span>
                        </AnimatePresence>
                    )}
                    <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
                </button>
            </div>
            </>
        );
    }
);

SpeedDialTabs.displayName = "SpeedDialTabs";

export { SpeedDialTabs, speedDialTabsVariants };
