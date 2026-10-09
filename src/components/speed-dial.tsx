import React, { useState, useRef, useEffect } from "react";
import { cn } from "../utils.js"; // Supondo que você tenha esta função utilitária
import { cva, type VariantProps } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

// --- VARIANTES DE ESTILO COM CVA ---

const speedDialVariants = cva(
    "fixed z-50 flex flex-col gap-2",
    {
        variants: {
            position: {
                "bottom-right": "bottom-4 right-4 items-end",
                "bottom-left": "bottom-4 left-4 items-start",
                "top-right": "top-4 right-4 flex-col-reverse items-end",
                "top-left": "top-4 left-4 flex-col-reverse items-start",
            },
        },
        defaultVariants: {
            position: "bottom-right",
        },
    }
);

const buttonVariants = cva(
    "flex items-center justify-center rounded-full shadow-lg text-white transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer",
    {
        variants: {
            variant: {
                trigger: "bg-primary hover:bg-primary/90 focus:ring-primary/50 active:scale-95",
                action: "bg-secondary hover:bg-secondary/90 focus:ring-secondary/50 active:scale-95",
            },
            size: {
                small: "h-11 w-11",
                medium: "h-14 w-14",
                large: "h-16 w-16",
            },
        },
        defaultVariants: {
            variant: "trigger",
            size: "medium",
        },
    }
);


// --- TIPOS E INTERFACES ---

export interface SpeedDialAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}

export interface SpeedDialProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof speedDialVariants> {
    actions: SpeedDialAction[];
    icon?: React.ReactNode;
    openIcon?: React.ReactNode;
    buttonSize?: VariantProps<typeof buttonVariants>["size"];
}


// --- COMPONENTE PRINCIPAL ---

const SpeedDial = React.forwardRef<HTMLDivElement, SpeedDialProps>(
    (
        {
            className,
            position = "bottom-right",
            actions,
            icon = <PlusIcon size={25} />,
            openIcon, // Opcional, se não fornecido, o ícone principal irá girar
            buttonSize = "medium",
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const internalRef = useRef<HTMLDivElement>(null);

        // Hook para fechar o menu ao clicar fora
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (internalRef.current && !internalRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener("mousedown", handleClickOutside);
            } else {
                document.removeEventListener("mousedown", handleClickOutside);
            }

            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [isOpen]);

        const iconSizeClass = buttonVariants({ size: buttonSize });

        const isReversed = position?.includes("top");

        const listVariants = {
            hidden: {
                opacity: 0,
                transition: {
                    when: "afterChildren",
                    staggerChildren: 0.03,
                    staggerDirection: isReversed ? -1 : 1,
                },
            },
            visible: {
                opacity: 1,
                transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.03,
                    staggerDirection: isReversed ? 1 : -1,
                },
            },
        };

        const itemVariants = {
            hidden: { 
                opacity: 0, 
                y: isReversed ? -10 : 10, 
                scale: 0.9,
            },
            visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
            },
            exit: {
                opacity: 0,
                scale: 0.9,
                y: isReversed ? -5 : 5,
            }
        };

        return (
            <>
                {/* Backdrop para mobile */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                        />
                    )}
                </AnimatePresence>

                <div
                    ref={internalRef}
                    className={cn(speedDialVariants({ position }), className, 'space-y-4')}
                    {...props}
                >
                    {/* Botões de Ação */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                variants={listVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="flex flex-col gap-2 items-end md:items-center w-auto mr-1.5"
                            >
                                {actions.map((action, index) => (
                                    <motion.div 
                                        key={index} 
                                        variants={itemVariants}
                                        className="group relative flex items-center gap-2 md:gap-0"
                                    >
                                        {/* Label sempre visível no mobile, tooltip no desktop */}
                                        <motion.div
                                            initial={{ opacity: 0, x: 5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 5 }}
                                            transition={{ duration: 0.15, delay: index * 0.02 }}
                                            className={cn(
                                                "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium shadow-md order-first",
                                                "bg-card text-foreground border border-border",
                                                "md:order-none md:absolute md:bg-neutral md:text-neutral-foreground md:border-0 md:opacity-0 md:group-hover:opacity-100 md:transition-opacity",
                                                position?.includes("right") ? "md:right-full md:mr-2" : "md:left-full md:ml-2"
                                            )}
                                        >
                                            {action.label}
                                        </motion.div>
                                        
                                        {/* Botão de Ação */}
                                        <button
                                            onClick={() => {
                                                action.onClick();
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                buttonVariants({ variant: 'action', size: 'small' }),
                                                "relative shrink-0"
                                            )}
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center">
                                                {action.icon}
                                            </div>
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botão de Gatilho Principal */}
                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(buttonVariants({ variant: 'trigger', size: buttonSize }))}
                        aria-label="Toggle speed dial"
                        aria-expanded={isOpen}
                    >
                        <motion.div
                            animate={{ 
                                rotate: isOpen && !openIcon ? 45 : 0,
                            }}
                            transition={{ 
                                duration: 0.2, 
                                ease: "easeOut"
                            }}
                        >
                            {isOpen && openIcon ? openIcon : icon}
                        </motion.div>
                    </motion.button>
                </div>
            </>
        );
    }
);SpeedDial.displayName = "SpeedDial";

export { SpeedDial, speedDialVariants, buttonVariants };


