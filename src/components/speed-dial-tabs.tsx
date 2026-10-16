import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import * as PhosphorIcons from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils.js";
import type { SpeedDialIcon } from "./speed-dial.js";

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
    },
    defaultVariants: { position: "bottom-right" },
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
    size?: "small" | "medium" | "large";
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
            icon,
            openIcon,
            value,
            defaultValue,
            onValueChange,
            closeOnSelect = true,
            position = "bottom-right",
            size = "medium",
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
        const triggerSize = size === "small" ? "min-h-10 px-3 text-xs" : size === "large" ? "min-h-12 px-4 text-sm" : "min-h-11 px-3.5 text-sm";
        const tabSize = size === "small" ? "min-h-9 px-2.5 text-xs" : size === "large" ? "min-h-11 px-3.5 text-sm" : "min-h-10 px-3 text-sm";
        const iconSize = size === "small" ? 18 : size === "large" ? 24 : 20;

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
            <div
                {...props}
                ref={node => {
                    containerRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                className={cn(speedDialTabsVariants({ position }), className)}
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
                                "flex w-max min-w-44 max-w-[min(80vw,20rem)] flex-col gap-0.5 overflow-y-auto rounded-xl border border-border/70 bg-card/95 p-1.5 text-foreground shadow-lg backdrop-blur-sm",
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
                                        "flex w-full items-center gap-2.5 rounded-lg text-left font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                        "aria-pressed:bg-primary/10 aria-pressed:text-primary",
                                        tabSize
                                    )}
                                >
                                    {tab.icon && <span className="flex shrink-0 items-center justify-center" aria-hidden="true">{renderIcon(tab.icon, iconSize)}</span>}
                                    <span className="min-w-0 flex-1 truncate">{tab.label}</span>
                                    {selectedValue === tab.value && <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
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
                        "flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary font-medium text-white shadow-md transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        triggerSize
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
                    <span>{triggerLabel}</span>
                    <motion.span aria-hidden="true" animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.18 }} className="ml-1 flex items-center">
                        {renderIcon("CaretDownIcon", 14)}
                    </motion.span>
                </button>
            </div>
        );
    }
);

SpeedDialTabs.displayName = "SpeedDialTabs";

export { SpeedDialTabs, speedDialTabsVariants };
