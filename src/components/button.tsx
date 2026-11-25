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
import { toneClasses, type UIColor } from './theme.js';
import { getGradientStyle, type UIGradientValue } from './gradient.js';

const CircleNotchIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CircleNotchIcon));
const CopySimpleIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CopySimpleIcon));

const buttonVariants = cva(
    'w-full inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background relative overflow-hidden transition-discrete',
    {
        variants: {
            variant: {
                filled: '',
                outline: 'border',
                text: 'hover:drop-shadow-md',
                ghost: 'bg-transparent',
                soft: 'border border-transparent',
                icon: 'p-3 rounded-xl bg-transparent border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg w-auto h-auto',
                iconSoft: 'p-2 rounded-full transition-all duration-300 hover:scale-110',
                fastAction: 'w-25! h-25! p-2! flex flex-col items-start justify-between! text-start! gap-2!',
            },
            color: {
                default: '',
                primary: '',
                secondary: '',
                tertiary: '',
                success: '',
                warning: '',
                danger: '',
                info: '',
                neutral: '',
                background: '',
                foreground: '',
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

/** Botão ou link com variante, tamanho, tone e estados opcionais. */
export interface ButtonProps
    extends Omit<PolymorphicProps, 'color'>,
    Omit<VariantProps<typeof buttonVariants>, 'color'> {
    /** Cor semântica aplicada à variante visual. */
    color?: UIColor;
    /** Renderiza como link usando `href`. */
    asLink?: boolean;
    /** Destino quando `asLink` está ativo. */
    href?: string;
    /** Mostra estado de carregamento e impede novos cliques. */
    loading?: boolean;
    /** Ícone antes do texto. */
    leftIcon?: React.ReactNode;
    /** Ícone depois do texto. */
    rightIcon?: React.ReactNode;
    /** Habilita efeito visual de clique. */
    ripple?: boolean;
    /** Valor copiado para a área de transferência ao clicar. */
    copyValue?: string | number;
    /** Anima a entrada. */
    animationEntrance?: boolean;
    /** Anima a saída. */
    animationOut?: boolean;
    /** Marca o botão como ativo. */
    active?: boolean;
    /** Faz o botão ocupar a largura disponível. */
    fullWidth?: boolean;
    /** Habilita escala na interação. */
    motionScale?: boolean;
    /** Preset de `gradient.ts` aplicado ao fundo do botão. */
    gradient?: UIGradientValue;
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
            gradient,
            style,
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

                // The effect must never participate in flex layout, even without the theme CSS.
                circle.style.position = 'absolute';
                circle.style.pointerEvents = 'none';
                circle.style.borderRadius = '50%';
                circle.style.backgroundColor = 'currentColor';
                circle.style.opacity = '0';
                circle.setAttribute('aria-hidden', 'true');
                circle.style.width = circle.style.height = `${diameter}px`;
                circle.style.left = `${event.clientX - rect.left - radius}px`;
                circle.style.top = `${event.clientY - rect.top - radius}px`;
                circle.classList.add('ripple');

                const rippleEffect = button.querySelector('.ripple');
                if (rippleEffect) {
                    rippleEffect.remove();
                }
                button.appendChild(circle);
                if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && circle.animate) {
                    const animation = circle.animate(
                        [{ transform: 'scale(0)', opacity: 0.25 }, { transform: 'scale(4)', opacity: 0 }],
                        { duration: 600, easing: 'linear' }
                    );
                    animation.onfinish = () => circle.remove();
                } else {
                    circle.remove();
                }
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

        const hasLabel = React.Children.toArray(children).some(child => child !== '');
        const iconOnly = variant === 'icon' || (!hasLabel && Boolean(finalLeftIcon || rightIcon));

        const content = (
            <>
                {iconOnly ? (
                    loading ? <CircleNotchIcon className="animate-spin" size={iconSizeClass} aria-hidden="true" /> : (
                        <span className="flex shrink-0 items-center justify-center">
                            {finalLeftIcon || rightIcon}
                        </span>
                    )
                ) : (
                    // For other variants, show normal layout
                    <>
                        {!loading && finalLeftIcon && (
                            <span className="mr-2 flex items-center">
                                {finalLeftIcon}
                            </span>
                        )}

                        <span className={cn('relative flex gap-3', loading && 'opacity-75')}>
                            {loading && (
                                <CircleNotchIcon className="animate-spin" size={iconSizeClass} aria-hidden="true" />
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

        const resolvedVariant = variant ?? 'filled';
        const resolvedColor: UIColor = color && color !== 'default' && color in toneClasses ? color : 'primary';
        const tone = toneClasses[resolvedColor] ?? toneClasses.primary;
        const isSolidVariant = resolvedVariant === 'filled' || resolvedVariant === 'fastAction';
        const hasGradient = Boolean(gradient);
        const hasGradientBorder = hasGradient && (resolvedVariant === 'outline' || resolvedVariant === 'icon');
        const hasGradientText = hasGradient && ['outline', 'text', 'ghost'].includes(resolvedVariant);

        const getActiveClasses = () => {
            if (!active) return '';
            const activeColorMap: Record<UIColor, { ring: string; soft: string; strong: string }> = {
                default: { ring: 'ring-primary', soft: 'bg-primary/15', strong: 'bg-primary/20' },
                primary: { ring: 'ring-primary', soft: 'bg-primary/15', strong: 'bg-primary/20' },
                secondary: { ring: 'ring-secondary', soft: 'bg-secondary/15', strong: 'bg-secondary/20' },
                tertiary: { ring: 'ring-tertiary', soft: 'bg-tertiary/15', strong: 'bg-tertiary/20' },
                success: { ring: 'ring-success', soft: 'bg-success/15', strong: 'bg-success/20' },
                warning: { ring: 'ring-warning', soft: 'bg-warning/15', strong: 'bg-warning/20' },
                danger: { ring: 'ring-destructive', soft: 'bg-destructive/15', strong: 'bg-destructive/20' },
                info: { ring: 'ring-info', soft: 'bg-info/15', strong: 'bg-info/20' },
                neutral: { ring: 'ring-neutral', soft: 'bg-neutral/15', strong: 'bg-neutral/20' },
                background: { ring: 'ring-foreground', soft: 'bg-foreground/10', strong: 'bg-foreground/15' },
                foreground: { ring: 'ring-background', soft: 'bg-background/10', strong: 'bg-background/15' },
            };
            const activeColor = activeColorMap[resolvedColor] ?? activeColorMap.primary;

            return cn(
                'ring-2 ring-offset-2 ring-offset-background',
                activeColor.ring,
                hasGradient && 'brightness-90 saturate-125 shadow-inner',
                !hasGradient && isSolidVariant && 'brightness-90 shadow-inner',
                !hasGradient && resolvedVariant === 'outline' && cn(activeColor.soft, 'shadow-inner'),
                !hasGradient && resolvedVariant === 'soft' && cn(activeColor.strong, 'shadow-inner'),
                !hasGradient && ['text', 'ghost', 'icon', 'iconSoft'].includes(resolvedVariant) && activeColor.soft,
            );
        };
        const gradientClassesByVariant = cn(
            isSolidVariant && 'text-white hover:brightness-95 dark:font-semibold',
            resolvedVariant === 'outline' && 'border border-transparent bg-transparent',
            (resolvedVariant === 'text' || resolvedVariant === 'ghost') && 'bg-transparent',
            (resolvedVariant === 'soft' || resolvedVariant === 'iconSoft') && 'text-foreground',
            resolvedVariant === 'icon' && 'border-2 border-transparent bg-transparent text-primary-text',
        );
        const toneClassesByVariant = hasGradient ? gradientClassesByVariant : cn(
            isSolidVariant && cn(tone.solid, 'hover:brightness-95'),
            resolvedVariant === 'outline' && cn('border bg-transparent', tone.outline, tone.hoverSoft),
            (resolvedVariant === 'text' || resolvedVariant === 'ghost') && cn('bg-transparent', tone.text, tone.hoverSoft),
            resolvedVariant === 'soft' && cn(tone.soft, tone.hoverSoft),
            resolvedVariant === 'icon' && cn('bg-transparent', tone.text, tone.outline, tone.hoverSoft),
            resolvedVariant === 'iconSoft' && cn(tone.soft, tone.hoverSoft),
        );

        const buttonClasses = cn(
            buttonVariants({ variant, size, color }),
            toneClassesByVariant,
            !fullWidth && 'w-auto',
            size === 'icon' && 'h-10 w-10 shrink-0 p-0',
            loading && 'cursor-wait',
            getActiveClasses(),
            className
        );

        const isDisabled = loading || props.disabled;
        const baseGradientStyle = gradient ? getGradientStyle(gradient) : undefined;
        const gradientImage = baseGradientStyle?.backgroundImage;
        const gradientStyle: React.CSSProperties | undefined = !gradient
            ? style
            : hasGradientBorder
                ? {
                    borderColor: 'transparent',
                    backgroundImage: `linear-gradient(var(--background), var(--background)), ${gradientImage}`,
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                    ...style,
                }
                : resolvedVariant === 'soft' || resolvedVariant === 'iconSoft'
                    ? { ...getGradientStyle(gradient, 'subtle'), ...style }
                    : resolvedVariant === 'text' || resolvedVariant === 'ghost'
                        ? style
                        : { ...baseGradientStyle, ...style };
        const gradientTextStyle: React.CSSProperties | undefined = hasGradientText ? {
            backgroundImage: gradientImage,
            backgroundPosition: baseGradientStyle?.backgroundPosition,
            backgroundSize: baseGradientStyle?.backgroundSize,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
        } : undefined;

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
                style={gradientStyle}
                {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
            >
                <span className={cn('inline-flex items-center justify-center', hasGradientText && 'ui-button-gradient-text')} style={gradientTextStyle}>
                    {content}
                </span>
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
                style={gradientStyle}
                {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
                <span className={cn('inline-flex items-center justify-center', hasGradientText && 'ui-button-gradient-text')} style={gradientTextStyle}>
                    {content}
                </span>
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


