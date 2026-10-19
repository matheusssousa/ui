'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';
import { motion, AnimatePresence } from 'framer-motion';
import { toneScopeStyle, type UIColor } from './theme.js';

// Supondo que seu Button aceite uma prop `isLoading`
const Button = dynamic(() => import('./button.js').then(mod => mod.Button), { ssr: false });
const XIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.XIcon), { ssr: false });

const modalOverlayVariants = cva(
    'fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-transparent sm:bg-black/60 backdrop-blur-sm transition-all h-dvh',
    {
        variants: {
            isOpen: {
                true: 'opacity-100 scale-100',
                false: 'opacity-0 scale-95 pointer-events-none',
            },
        },
        defaultVariants: {
            isOpen: false,
        },
    }
);

const modalContentVariants = cva(
    'relative bg-card shadow-lg p-4 md:p-6 space-y-4 flex flex-col w-full h-full md:max-h-[90vh] md:h-fit overflow-hidden',
    {
        variants: {
            size: {
                sm: 'md:max-w-sm',
                md: 'md:max-w-md',
                lg: 'md:max-w-lg',
                xl: 'md:max-w-1/2',
                full: 'md:max-w-full',
            },
            variant: {
                default: 'sm:rounded-lg',
                customer: 'border border-border/80 sm:rounded-2xl shadow-2xl shadow-black/20',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

// --- 1. PROPS ATUALIZADAS ---
export type ModalProps = React.PropsWithChildren<
    VariantProps<typeof modalOverlayVariants> &
    VariantProps<typeof modalContentVariants> & {
        /** Tone do destaque do cabeçalho e dos botões; padrão `primary`. */
        color?: UIColor;
        /** Título do diálogo. */
        title?: string;
        /** Texto abaixo do título. */
        description?: string;
        /** URL da imagem de fundo do cabeçalho; usa recorte central e altura mínima de 120 px. */
        headerBackgroundImage?: string;
        /** Controla a abertura do diálogo. */
        isOpen: boolean;
        /** Chamado ao fechar pelo botão, pelo fundo ou pela tecla Escape. */
        onClose: () => void;
        /** Chamado ao confirmar. */
        onConfirm?: () => void;
        /** Chamado ao cancelar; usa `onClose` quando omitido. */
        onCancel?: () => void;
        /** Texto do botão de confirmação. */
        confirmText?: string;
        /** Texto do botão de cancelamento. */
        cancelText?: string;
        /** Ícone do botão de confirmação. */
        confirmIcon?: React.ReactNode;
        /** Ícone do botão de cancelamento. */
        cancelIcon?: React.ReactNode;
        confirmButtonVariant?: any; // Idealmente, importe o tipo de variante do seu botão
        isConfirming?: boolean; // Para o estado de carregamento
        submitButton?: boolean; // Nova prop para indicar se o botão de confirmar é do tipo submit
        disabled?: boolean; // Para desabilitar o botão de confirmar
        loading?: boolean; // Para mostrar loading no botão
        hideFooter?: boolean;
        hideConfirm?: boolean; // Para esconder apenas o botão de confirmar
        hideCancel?: boolean; // Para esconder apenas o botão de cancelar
        hideCloseIcon?: boolean; // Para esconder o ícone de fechar no canto superior direito
        /** Quando muda, volta o conteúdo rolável ao início. */
        resetScrollKey?: React.Key;
        /** Classes adicionais para o conteúdo do diálogo. */
        className?: string;
        /** Estilos adicionais para o fundo do diálogo. */
        style?: React.CSSProperties;
    }>;

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
    ({
        isOpen,
        color = 'primary',
        onClose,
        size,
        variant,
        title,
        description,
        headerBackgroundImage,
        children,
        onConfirm,
        onCancel,
        // --- 2. VALORES PADRÃO PARA AS NOVAS PROPS ---
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        confirmIcon = undefined,
        cancelIcon = undefined,
        confirmButtonVariant = 'filled',
        isConfirming = false,
        submitButton = false,
        disabled = false,
        loading = false,
        hideFooter = false,
        hideConfirm = false,
        hideCancel = false,
        hideCloseIcon = false,
        resetScrollKey,
        className,
        style,
        ...props
    }, ref) => {
        const contentRef = React.useRef<HTMLDivElement>(null);
        const hasHeaderImage = Boolean(headerBackgroundImage?.trim());

        // Impede que o modal seja fechado enquanto uma ação está em andamento
        const handleClose = () => !isConfirming && onClose();
        const handleCancel = () => !isConfirming && (onCancel ? onCancel() : onClose());

        React.useEffect(() => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    handleClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }, [isConfirming, onClose]);

        React.useEffect(() => {
            if (isOpen) {
                contentRef.current?.scrollTo({ top: 0 });
            }
        }, [isOpen, resetScrollKey]);

        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={ref}
                        className={cn(modalOverlayVariants({ isOpen }))}
                        style={toneScopeStyle(color, style)}
                        onClick={handleClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        {...props}
                    >
                        <motion.div
                            className={cn(modalContentVariants({ size, variant }), className)}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <div className={cn(
                                'flex items-start justify-between gap-3',
                                hasHeaderImage
                                    ? '-mx-4 -mt-4 min-h-[160px] shrink-0 bg-black bg-cover bg-center bg-no-repeat px-4 py-4 md:-mx-6 md:-mt-6 md:px-6'
                                    : variant === 'customer' && '-mx-4 -mt-4 border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card px-4 py-4 md:-mx-6 md:-mt-6 md:px-6',
                            )} style={hasHeaderImage ? {
                                backgroundImage: `linear-gradient(rgb(0 0 0 / 60%), rgb(0 0 0 / 60%)), url(${JSON.stringify(headerBackgroundImage)})`,
                            } : undefined}>
                                <div className={cn('w-full', hasHeaderImage && 'min-w-0 break-words')}>
                                    <h2 className={cn('text-lg font-semibold', hasHeaderImage ? 'text-white' : 'text-foreground')}>{title}</h2>
                                    {description && <p className={cn('text-xs', hasHeaderImage ? 'text-white/80' : 'text-muted-foreground')}>{description}</p>}
                                </div>
                                {!hideCloseIcon && (
                                    <Button
                                        variant={'text'}
                                        color={color}
                                        onClick={handleClose}
                                        leftIcon={<XIcon size={20} />}
                                        className={cn('w-fit p-0', hasHeaderImage ? 'shrink-0 text-white focus-visible:ring-white' : 'text-muted-foreground')}
                                        disabled={isConfirming}
                                        fullWidth={false}
                                    />
                                )}
                            </div>

                            <div
                                ref={contentRef}
                                className={cn('flex-1 min-h-0 overflow-y-auto overflow-x-hidden', variant === 'customer' ? 'py-3' : 'py-2')}
                            >
                                {children}
                            </div>

                            {/* --- 3. BOTÕES AGORA SÃO DINÂMICOS --- */}
                            {!hideFooter && (
                                <div className={cn(
                                    'sticky bottom-0 z-10 flex justify-end space-x-2 bg-card',
                                    variant === 'customer'
                                        ? '-mx-4 -mb-4 border-t border-border/70 px-4 py-3 md:-mx-6 md:-mb-6 md:px-6'
                                        : 'pt-2 pb-1',
                                )}>
                                    {!hideCancel && (
                                        <Button
                                        type="button"
                                        variant="outlined"
                                        color={color}
                                        onClick={handleCancel}
                                        disabled={isConfirming || loading}
                                        leftIcon={cancelIcon}
                                    >
                                        {cancelText}
                                    </Button>
                                    )}
                                    {!hideConfirm && (onConfirm || submitButton) && (
                                        <Button
                                            type={submitButton ? 'submit' : 'button'}
                                            variant={confirmButtonVariant}
                                            color={color}
                                            onClick={onConfirm}
                                            loading={isConfirming || loading}
                                            disabled={isConfirming || loading || disabled}
                                            leftIcon={confirmIcon}
                                        >
                                            {confirmText}
                                        </Button>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }
);

Modal.displayName = 'Modal';

export { Modal, modalOverlayVariants, modalContentVariants };


