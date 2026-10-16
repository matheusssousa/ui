import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import * as PhosphorIcons from "@phosphor-icons/react/dist/ssr";
import { cn } from "../utils.js";

const speedDialVariants = cva("fixed z-50 flex flex-col gap-2", {
    variants: {
        position: {
            "bottom-right": "bottom-4 right-4 items-end",
            "bottom-left": "bottom-4 left-4 items-start",
            "top-right": "top-4 right-4 flex-col-reverse items-end",
            "top-left": "top-4 left-4 flex-col-reverse items-start",
        },
    },
    defaultVariants: { position: "bottom-right" },
});

const buttonVariants = cva(
    "flex items-center justify-center rounded-full shadow-lg text-white transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                trigger: "bg-primary hover:bg-primary/90 focus:ring-primary/50 active:scale-95",
                action: "bg-secondary hover:bg-secondary/90 focus:ring-secondary/50 active:scale-95",
            },
            size: { small: "h-11 w-11", medium: "h-14 w-14", large: "h-16 w-16" },
        },
        defaultVariants: { variant: "trigger", size: "medium" },
    }
);

export type SpeedDialIcon = React.ReactNode | keyof typeof PhosphorIcons;

export interface SpeedDialAction {
    id?: string;
    icon?: SpeedDialIcon;
    label: string;
    onClick?: () => void;
    children?: SpeedDialAction[];
    disabled?: boolean;
}

export interface SpeedDialProps
    extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof speedDialVariants> {
    actions: SpeedDialAction[];
    icon?: SpeedDialIcon;
    openIcon?: SpeedDialIcon;
    buttonSize?: VariantProps<typeof buttonVariants>["size"];
    actionSize?: VariantProps<typeof buttonVariants>["size"];
    triggerLabel?: string;
    closeOnAction?: boolean;
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

const SpeedDial = React.forwardRef<HTMLDivElement, SpeedDialProps>(
    (
        {
            className,
            position = "bottom-right",
            actions,
            icon = "PlusIcon",
            openIcon,
            buttonSize = "medium",
            actionSize = "small",
            triggerLabel = "Abrir ações",
            closeOnAction = true,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [expandedPath, setExpandedPath] = useState<string[]>([]);
        const internalRef = useRef<HTMLDivElement>(null);
        const menuId = useId();
        const isLeft = position?.includes("left");
        const isTop = position?.includes("top");

        useEffect(() => {
            if (!isOpen) return;
            const handlePointerDown = (event: PointerEvent) => {
                if (internalRef.current && !internalRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    setIsOpen(false);
                    internalRef.current?.querySelector<HTMLButtonElement>("[data-speed-dial-trigger]")?.focus();
                }
            };
            document.addEventListener("pointerdown", handlePointerDown);
            document.addEventListener("keydown", handleKeyDown);
            return () => {
                document.removeEventListener("pointerdown", handlePointerDown);
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [isOpen]);

        useEffect(() => {
            if (!isOpen) setExpandedPath([]);
        }, [isOpen]);

        const renderActions = (items: SpeedDialAction[], depth = 0) => (
            <div className={cn("flex flex-col gap-2", isLeft ? "items-start" : "items-end")}>
                {items.map((action, index) => {
                    const key = action.id ?? `${depth}-${index}`;
                    const expanded = expandedPath[depth] === key;
                    const hasChildren = Boolean(action.children?.length);
                    const childrenId = `${menuId}-${depth}-${index}`;
                    return (
                        <div key={key} className={cn("flex flex-col gap-2", isLeft ? "items-start" : "items-end")}>
                            <div className={cn("group relative flex items-center gap-2", isLeft && "flex-row-reverse")}>
                                <span className={cn(
                                    "whitespace-nowrap rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-md",
                                    "md:pointer-events-none md:absolute md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100",
                                    isLeft ? "md:left-full md:ml-2" : "md:right-full md:mr-2"
                                )}>
                                    {action.label}
                                </span>
                                <button
                                    type="button"
                                    disabled={action.disabled}
                                    aria-label={action.label}
                                    aria-expanded={hasChildren ? expanded : undefined}
                                    aria-controls={hasChildren ? childrenId : undefined}
                                    onClick={() => {
                                        if (hasChildren) {
                                            setExpandedPath(current => expanded ? current.slice(0, depth) : [...current.slice(0, depth), key]);
                                        } else {
                                            action.onClick?.();
                                            if (closeOnAction) setIsOpen(false);
                                        }
                                    }}
                                    className={cn(buttonVariants({ variant: "action", size: actionSize }), "shrink-0 disabled:cursor-not-allowed disabled:opacity-50")}
                                >
                                    {renderIcon(action.icon, 20)}
                                </button>
                            </div>
                            {hasChildren && expanded && (
                                <div id={childrenId} className={cn("border-border", isLeft ? "ml-5 border-l pl-3" : "mr-5 border-r pr-3")}>
                                    {renderActions(action.children!, depth + 1)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );

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
                        internalRef.current = node;
                        if (typeof ref === "function") ref(node);
                        else if (ref) ref.current = node;
                    }}
                    className={cn(speedDialVariants({ position }), className)}
                >
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                id={menuId}
                                initial={{ opacity: 0, y: isTop ? -8 : 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: isTop ? -8 : 8 }}
                                transition={{ duration: 0.15 }}
                                className={cn("max-h-[min(70vh,32rem)] overflow-y-auto", isLeft ? "self-start" : "self-end")}
                            >
                                {renderActions(actions)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button
                        type="button"
                        data-speed-dial-trigger
                        onClick={() => setIsOpen(open => !open)}
                        className={buttonVariants({ variant: "trigger", size: buttonSize })}
                        aria-label={triggerLabel}
                        aria-expanded={isOpen}
                        aria-controls={menuId}
                    >
                        <motion.span animate={{ rotate: isOpen && !openIcon ? 45 : 0 }} transition={{ duration: 0.2 }}>
                            {renderIcon(isOpen && openIcon ? openIcon : icon, 25)}
                        </motion.span>
                    </motion.button>
                </div>
            </>
        );
    }
);

SpeedDial.displayName = "SpeedDial";

export { SpeedDial, speedDialVariants, buttonVariants };
