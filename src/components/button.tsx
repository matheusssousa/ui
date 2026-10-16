"use client";

import * as React from 'react';
import Link from 'next/link.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';
import { useToast } from '../hooks/useToast.js';
import { handleCopy } from '../functions/handleCopy.js';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

const CircleNotchIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CircleNotchIcon));
const CopySimpleIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CopySimpleIcon));

const buttonVariants = cva(
    'w-full inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden transition-discrete',
    {
        variants: {
            variant: {
                filled: 'bg-primary text-background dark:text-foreground hover:bg-primary/90',
                outlined: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                text: 'hover:drop-shadow-md',
                ghost: 'bg-transparent hover:bg-accent hover:text-accent-foreground',
                soft: 'border border-transparent bg-primary/10 text-primary hover:bg-primary/15',
                success: 'bg-success text-success-foreground hover:bg-success/90',
                warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
                danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                gradient: 'bg-gradient-to-b from-primary to-secondary text-white hover:from-secondary hover:to-primary dark:font-semibold',
                icon: 'p-3 rounded-xl bg-transparent border-2 border-border/30 text-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg w-auto h-auto',
                edited: 'bg-warning text-warning-foreground hover:bg-warning/90',
                deleted: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                restored: 'bg-success text-success-foreground hover:bg-success/90',
                linkSettings: 'bg-transparent text-foreground hover:text-tertiary/80 hover:bg-background/50 px-2! justify-start',
                fastAction: 'w-25! h-25! p-2! flex flex-col items-start justify-between! text-start! gap-2!',
            },
            color: {
                default: '',
                blue: 'bg-tertiary-foreground hover:bg-tertiary-foreground/80 text-white dark:bg-tertiary-foreground dark:hover:bg-tertiary-foreground/80',
                red: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                green: 'bg-success hover:bg-success/90 text-success-foreground',
                amber: 'bg-warning hover:bg-warning/90 text-warning-foreground',
                purple: 'bg-violet hover:bg-violet/90 text-white',
                orange: 'bg-orange hover:bg-orange/90 text-white',
                cyan: 'bg-cyan hover:bg-cyan/90 text-white',
                pink: 'bg-pink hover:bg-pink/90 text-white',
                gray: 'bg-neutral hover:bg-neutral/90 text-neutral-foreground',
                card: 'bg-card text-card-foreground border border-border hover:bg-muted hover:border-foreground/20',
                dark: 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-background dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground border border-input',
            },
            size: {
                xs: 'h-6 px-1 rounded-xl text-xs',
                sm: 'h-9 px-3 rounded-xl',
                md: 'h-10 py-2 px-4',
                lg: 'h-11 px-8 rounded-xl',
                xl: 'h-12 px-10 rounded-xl text-base',
                icon: 'size-10 p-0 rounded-xl',
            },
        },
        compoundVariants: [
            {
                variant: 'outlined',
                color: 'blue',
                className: 'text-tertiary-foreground border-tertiary-foreground hover:bg-tertiary-foreground/10 dark:text-tertiary-foreground dark:border-tertiary-foreground dark:hover:bg-tertiary-foreground/10',
            },
            {
                variant: 'outlined',
                color: 'red',
                className: 'text-destructive border-destructive hover:bg-destructive/10',
            },
            {
                variant: 'outlined',
                color: 'green',
                className: 'text-success border-success hover:bg-success/10',
            },
            {
                variant: 'outlined',
                color: 'amber',
                className: 'text-warning border-warning hover:bg-warning/10',
            },
            {
                variant: 'outlined',
                color: 'orange',
                className: 'text-orange border-orange hover:bg-orange/10',
            },
            {
                variant: 'text',
                color: 'blue',
                className: 'text-tertiary-foreground hover:bg-tertiary-foreground/10 dark:text-tertiary-foreground dark:hover:bg-tertiary-foreground/10',
            },
            {
                variant: 'text',
                color: 'red',
                className: 'text-destructive bg-destructive/10 hover:bg-destructive/15',
            },
            {
                variant: 'text',
                color: 'green',
                className: 'text-success bg-success/10 hover:bg-success/15',
            },
            {
                variant: 'text',
                color: 'amber',
                className: 'text-warning bg-warning/10 hover:bg-warning/15',
            },
            // Icon variant color overrides
            {
                variant: 'icon',
                color: 'default',
                className: 'hover:text-primary hover:border-primary/50 hover:bg-primary/50 ',
            },
            {
                variant: 'icon',
                color: 'blue',
                className: 'bg-transparent! border-info/40! text-info! hover:border-info/70! hover:bg-info/10!',
            },
            {
                variant: 'icon',
                color: 'red',
                className: 'bg-transparent! border-destructive/40! text-destructive! hover:border-destructive/70! hover:bg-destructive/10!',
            },
            {
                variant: 'icon',
                color: 'green',
                className: 'bg-transparent! border-success/40! text-success! hover:border-success/70! hover:bg-success/10!',
            },
            {
                variant: 'icon',
                color: 'amber',
                className: 'bg-transparent! border-warning/40! text-warning! hover:border-warning/70! hover:bg-warning/10!',
            },
            {
                variant: 'icon',
                color: 'purple',
                className: 'bg-transparent! border-violet/40! text-violet! hover:border-violet/70! hover:bg-violet/10!',
            },
            {
                variant: 'icon',
                className: 'hover:border-primary/50 hover:bg-primary/5',
            },
            // Fast Action variant overrides
            {
                variant: 'fastAction',
                color: 'default',
                className: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90',
            },
            {
                variant: 'fastAction',
                color: 'blue',
                className: 'bg-tertiary-foreground text-white hover:bg-tertiary-foreground/80 dark:bg-tertiary-foreground dark:hover:bg-tertiary-foreground/80',
            },
            {
                variant: 'fastAction',
                color: 'red',
                className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            },
            {
                variant: 'fastAction',
                color: 'green',
                className: 'bg-success text-success-foreground hover:bg-success/90',
            },
            {
                variant: 'fastAction',
                color: 'amber',
                className: 'bg-warning text-warning-foreground hover:bg-warning/90',
            },
            {
                variant: 'fastAction',
                color: 'purple',
                className: 'bg-violet text-white hover:bg-violet/90',
            },
            {
                variant: 'fastAction',
                color: 'orange',
                className: 'bg-orange text-white hover:bg-orange/90',
            },
            {
                variant: 'fastAction',
                color: 'card',
                className: 'bg-card text-card-foreground border border-border hover:bg-muted hover:border-foreground/20',
            },
            {
                variant: 'soft',
                color: 'default',
                className: 'bg-primary/10 text-primary hover:bg-primary/15',
            },
            {
                variant: 'soft',
                color: 'blue',
                className: 'bg-tertiary-foreground/10 text-tertiary-foreground hover:bg-tertiary-foreground/15 dark:bg-tertiary-foreground/10 dark:text-tertiary-foreground dark:hover:bg-tertiary-foreground/15',
            },
            {
                variant: 'soft',
                color: 'red',
                className: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
            },
            {
                variant: 'soft',
                color: 'green',
                className: 'bg-success/10 text-success hover:bg-success/15',
            },
            {
                variant: 'soft',
                color: 'amber',
                className: 'bg-warning/10 text-warning hover:bg-warning/15',
            },
            {
                variant: 'soft',
                color: 'purple',
                className: 'bg-violet/10 text-violet hover:bg-violet/15',
            },
            {
                variant: 'soft',
                color: 'orange',
                className: 'bg-orange/10 text-orange hover:bg-orange/15',
            },
            {
                variant: 'soft',
                color: 'card',
                className: 'bg-card/10 text-card-foreground hover:bg-card/15',
            },
            {
                variant: 'soft',
                color: 'dark',
                className: 'bg-background/10 text-foreground hover:bg-background/15 dark:bg-background/10 dark:text-foreground dark:hover:bg-background/15',
            },
        ],
        defaultVariants: {
            variant: 'filled',
            size: 'md',
            color: 'default',
        },
    }
);

type PolymorphicProps = React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/**
 * Propriedades do componente Button, estendendo as propriedades de botões e links HTML, com variantes de estilo, estado de carregamento, ícones, animações e funcionalidade de cópia para área de transferência. Permite renderizar como um botão tradicional ou como um link, com estilos adaptados para cada caso. Ideal para ações comuns em interfaces de usuário, oferecendo feedback visual e interatividade aprimorada.
 * 
 * @property {boolean} [asLink=false] - Indica se o componente deve ser renderizado como um link (anchor) em vez de um botão.
 * @property {string} [href] - URL para a qual o link deve apontar, se `asLink` for verdadeiro.
 * @property {boolean} [loading=false] - Indica se o botão está em estado de carregamento, desabilitando interações e mostrando um indicador visual.
 * @property {React.ReactNode} [leftIcon] - Ícone a ser exibido à esquerda do conteúdo do botão.
 * @property {React.ReactNode} [rightIcon] - Ícone a ser exibido à direita do conteúdo do botão.
 * @property {boolean} [ripple=true] - Indica se o efeito de ripple deve ser aplicado ao clicar no botão.
 * @property {string | number} [copyValue] - Valor a ser copiado para a área de transferência ao clicar no botão. Se fornecido, o botão exibirá um ícone de cópia e feedback visual.
 * @property {boolean} [openLinkInNewTab=false] - Indica se o link deve ser aberto em uma nova aba quando `asLink` for verdadeiro.
 * @property {boolean} [animationEntrance=false] - Indica se a animação de entrada deve ser aplicada ao renderizar o botão.
 * @property {boolean} [animationOut=false] - Indica se a animação de saída deve ser aplicada ao desmontar o botão.
 * @property {boolean} [active=false] - Indica se o botão está em estado ativo, aplicando estilos visuais adicionais.
 */

export interface ButtonProps
    extends Omit<PolymorphicProps, 'color'>,
    VariantProps<typeof buttonVariants> {
    asLink?: boolean;
    href?: string;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    ripple?: boolean;
    copyValue?: string | number;
    animationEntrance?: boolean;
    animationOut?: boolean;
    active?: boolean;
    fullWidth?: boolean;
    motionScale?: boolean;
};

/**
 * Botão altamente personalizável com suporte a variantes, estados de carregamento, ícones, animações e funcionalidade de cópia para área de transferência. Pode ser renderizado como um botão tradicional ou como um link, com estilos adaptados para cada caso. Ideal para ações comuns em interfaces de usuário, oferecendo feedback visual e interatividade aprimorada.
 * 
 * @param {ButtonProps}
 * @returns {JSX.Element} Um componente de botão renderizado com base nas propriedades fornecidas.
 */
const Button = React.forwardRef<
    HTMLButtonElement | HTMLAnchorElement,
    ButtonProps
>(
    (
        {
            className,
            children,
            variant,
            size,
            color,
            asLink = false,
            href,
            loading = false,
            leftIcon,
            rightIcon,
            ripple = true,
            copyValue,
            animationEntrance = false,
            animationOut = false,
            active = false,
            fullWidth = true,
            motionScale = true,
            onClick,
            ...props
        },
        ref
    ) => {
        const { success, error } = useToast();
        const [isCopied, setIsCopied] = React.useState(false);

        const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            if (copyValue !== undefined) {
                handleCopy(
                    copyValue,
                    () => { // onSuccess
                        setIsCopied(true);
                        success("Conteúdo copiado para a área de transferência!");
                        setTimeout(() => setIsCopied(false), 2000); // Reseta o estado após 2 segundos
                    },
                    () => { // onError
                        error("Não foi possível copiar o conteúdo.");
                    }
                );
            }

            // Executa o onClick original se ele existir
            if (onClick) {
                onClick(event as React.MouseEvent<HTMLButtonElement>);
            }
        };

        const handleRippleAndCopy = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            if (ripple && !loading && !props.disabled) {
                handleRipple(event);
            }

            if (copyValue !== undefined) {
                handleCopyClick(event);
            } else if (onClick && !loading && !props.disabled) {
                onClick(event as React.MouseEvent<HTMLButtonElement>);
            }
        };

        const handleRipple = (
            event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
        ) => {
            if (ripple && !loading && !props.disabled) {
                const button = event.currentTarget;
                const rect = button.getBoundingClientRect();
                const circle = document.createElement('span');
                const diameter = Math.max(button.clientWidth, button.clientHeight);
                const radius = diameter / 2;

                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${event.clientX - rect.left - radius}px`;
                circle.style.top = `${event.clientY - rect.top - radius}px`;
                circle.classList.add('ripple');

                const rippleEffect = button.querySelector('.ripple');
                if (rippleEffect) {
                    rippleEffect.remove();
                }
                button.appendChild(circle);
            }
            // NOTA: onClick é chamado pelo handleRippleAndCopy, não aqui
        };

        const getIconSize = () => {
            if (variant === 'icon') {
                return 15; // Fixed size for icon variant
            }
            switch (size) {
                case 'xs': return 13;
                case 'sm': return 15;
                case 'md': return 20;
                case 'lg': return 25;
                default: return 20;
            }
        };

        const iconSizeClass = getIconSize();

        const finalLeftIcon = copyValue !== undefined
            ? isCopied ? <CheckIcon size={iconSizeClass} /> : <CopySimpleIcon size={iconSizeClass} />
            : leftIcon;

        const content = (
            <>
                {variant === 'icon' ? (
                    // For icon variant, show only the left icon
                    finalLeftIcon ? (
                        <span className={cn("flex items-center")}>
                            {finalLeftIcon}
                        </span>
                    ) : null
                ) : (
                    // For other variants, show normal layout
                    <>
                        {!loading && finalLeftIcon && (
                            <span className="mr-2 flex items-center">
                                {finalLeftIcon}
                            </span>
                        )}

                        <span className={cn('relative', loading && 'opacity-75')}>
                            {loading && (
                                <CircleNotchIcon className="absolute right-full top-1/2 mr-2 -translate-y-1/2 animate-spin" size={iconSizeClass} aria-hidden="true" />
                            )}
                            {children}
                        </span>

                        {rightIcon && !loading && (
                            <span className={cn("ml-2 flex items-center")}>
                                {rightIcon}
                            </span>
                        )}
                    </>
                )}
            </>
        );

        const getActiveClasses = () => {
            if (!active) return '';
            
            const activeColorMap: Record<string, string> = {
                default: 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/90 dark:bg-primary/80',
                blue: 'ring-2 ring-tertiary-foreground ring-offset-2 ring-offset-background bg-tertiary-foreground/90 dark:bg-tertiary-foreground/80',
                red: 'ring-2 ring-destructive ring-offset-2 ring-offset-background bg-destructive',
                green: 'ring-2 ring-success ring-offset-2 ring-offset-background bg-success',
                amber: 'ring-2 ring-warning ring-offset-2 ring-offset-background bg-warning',
                purple: 'ring-2 ring-violet ring-offset-2 ring-offset-background bg-violet',
                orange: 'ring-2 ring-orange ring-offset-2 ring-offset-background bg-orange',
                card: 'ring-2 ring-border-foreground ring-offset-2 ring-offset-background bg-card/70',
            };
            
            return activeColorMap[color || 'default'] || activeColorMap.default;
        };

        const buttonClasses = cn(
            buttonVariants({ variant, size, color }),
            !fullWidth && 'w-auto',
            loading && 'cursor-wait',
            getActiveClasses(),
            className
        );

        const isDisabled = loading || props.disabled;

        // Animações do Framer Motion
        const animationProps = (animationEntrance || animationOut) ? {
            initial: { opacity: 0, y: animationEntrance ? 20 : 0, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            transition: { duration: 0.3, ease: "easeOut" as const }
        } : {};

        const Component = (animationEntrance || animationOut) ? motion.div : 'div';

        const buttonElement = (
            <button
                className={buttonClasses}
                ref={ref as React.ForwardedRef<HTMLButtonElement>}
                disabled={isDisabled}
                onClick={handleRippleAndCopy}
                type={props.type || 'button'}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
                {content}
            </button>
        );

        const linkElement = (
            <Link
                href={isDisabled ? '#' : href || '#'}
                className={buttonClasses}
                ref={ref as React.ForwardedRef<HTMLAnchorElement>}
                onClick={(e) => {
                    if (isDisabled) {
                        e.preventDefault();
                        return;
                    }
                    handleRippleAndCopy(e);
                }}
                aria-disabled={isDisabled}
                tabIndex={isDisabled ? -1 : undefined}
                {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
                {content}
            </Link>
        );

        if (animationEntrance || animationOut) {
            return (
                <Component
                    {...animationProps}
                    className="inline-block w-full"
                >
                    {asLink ? linkElement : buttonElement}
                </Component>
            );
        }
        if (motionScale) {
            return (
                <motion.span className={fullWidth ? 'block w-full' : 'inline-block'} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}>
                    {asLink ? linkElement : buttonElement}
                </motion.span>
            );
        }

        return asLink ? linkElement : buttonElement;
    }
);

Button.displayName = 'Button';

export { Button, buttonVariants };


