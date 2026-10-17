'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';
import { toneScopeStyle, type UIColor } from './theme.js';

const CaretLeftIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretLeft));
const CaretRightIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretRight));

const carouselVariants = cva(
    'relative w-full overflow-hidden',
    {
        variants: {
            variant: {
                default: 'rounded-lg',
                card: 'rounded-xl shadow-lg border border-border',
                full: 'rounded-none',
            },
            size: {
                sm: 'h-48 md:h-64',
                md: 'h-64 md:h-80',
                lg: 'h-80 md:h-96',
                xl: 'h-96 md:h-[32rem]',
                auto: 'min-h-[200px]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

const buttonVariants = cva(
    'absolute top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    {
        variants: {
            position: {
                left: 'left-2 md:left-4',
                right: 'right-2 md:right-4',
            },
        },
    }
);

const indicatorVariants = cva(
    'w-2 h-2 rounded-full transition-all duration-300 cursor-pointer',
    {
        variants: {
            active: {
                true: 'bg-primary scale-125',
                false: 'bg-white/50 hover:bg-white/75',
            },
        },
    }
);

export interface CarouselItem {
    id: string | number;
    content: React.ReactNode;
    alt?: string;
}

/** Carrossel de conteúdo com navegação, indicadores e reprodução automática. */
export interface CarouselProps extends VariantProps<typeof carouselVariants> {
    /** Slides a exibir. */
    items: CarouselItem[];
    /** Classes do contêiner. */
    className?: string;
    /** Estilos do contêiner. */
    style?: React.CSSProperties;
    /** Cor do indicador ativo; padrão `primary`. */
    color?: UIColor;
    /** Exibe botões de navegação. */
    showArrows?: boolean;
    /** Exibe os indicadores de slide. */
    showIndicators?: boolean;
    /** Avança automaticamente. */
    autoPlay?: boolean;
    /** Intervalo da reprodução automática em milissegundos. */
    autoPlayInterval?: number;
    /** Pausa a reprodução automática ao passar o mouse. */
    pauseOnHover?: boolean;
    /** Habilita navegação por gesto. */
    enableSwipe?: boolean;
    /** Retorna ao primeiro slide após o último. */
    loop?: boolean;
    /** Recebe o índice do slide exibido. */
    onSlideChange?: (index: number) => void;
    /** Índice inicial do slide. */
    initialSlide?: number;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(({
    items,
    className,
    style,
    color = 'primary',
    variant,
    size,
    showArrows = true,
    showIndicators = true,
    autoPlay = false,
    autoPlayInterval = 5000,
    pauseOnHover = true,
    enableSwipe = true,
    loop = true,
    onSlideChange,
    initialSlide = 0,
    ...props
}, ref) => {
    const [currentIndex, setCurrentIndex] = useState(initialSlide);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isAutoPlayPausedRef = useRef(false);

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    const swipeConfidence = (velocity: number, offset: number) => {
        return swipePower(offset, velocity) > swipeConfidenceThreshold;
    };

    const paginate = useCallback((newDirection: number) => {
        if (!loop && newDirection > 0 && currentIndex === items.length - 1) return;
        if (!loop && newDirection < 0 && currentIndex === 0) return;

        const newIndex = newDirection > 0 
            ? (currentIndex + 1) % items.length 
            : currentIndex === 0 
                ? items.length - 1 
                : currentIndex - 1;

        setDirection(newDirection);
        setCurrentIndex(newIndex);
        onSlideChange?.(newIndex);
    }, [currentIndex, items.length, loop, onSlideChange]);

    const goToSlide = useCallback((index: number) => {
        if (index === currentIndex) return;
        const newDirection = index > currentIndex ? 1 : -1;
        setDirection(newDirection);
        setCurrentIndex(index);
        onSlideChange?.(index);
    }, [currentIndex, onSlideChange]);

    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        const swipe = swipeConfidence(velocity.x, offset.x);

        if (swipe) {
            paginate(offset.x > 0 ? -1 : 1);
        }
    };

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay) return;

        const startAutoPlay = () => {
            intervalRef.current = setInterval(() => {
                if (!isAutoPlayPausedRef.current) {
                    setDirection(1);
                    setCurrentIndex((prev) => {
                        const newIndex = (prev + 1) % items.length;
                        onSlideChange?.(newIndex);
                        return newIndex;
                    });
                }
            }, autoPlayInterval);
        };

        startAutoPlay();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoPlay, autoPlayInterval, items.length, onSlideChange]);

    const handleMouseEnter = () => {
        if (pauseOnHover && autoPlay) {
            isAutoPlayPausedRef.current = true;
        }
    };

    const handleMouseLeave = () => {
        if (pauseOnHover && autoPlay) {
            isAutoPlayPausedRef.current = false;
        }
    };

    if (items.length === 0) {
        return (
            <div ref={ref} className={cn(carouselVariants({ variant, size }), className)} style={toneScopeStyle(color, style)}>
                <div className="flex items-center justify-center h-full bg-muted">
                    <p className="text-muted-foreground">Nenhum item para exibir</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className={cn(carouselVariants({ variant, size }), className)}
            style={toneScopeStyle(color, style)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    drag={enableSwipe ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0 w-full h-full flex items-center justify-center"
                >
                    {items[currentIndex]?.content}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {showArrows && items.length > 1 && (
                <>
                    <button
                        className={cn(buttonVariants({ position: 'left' }))}
                        onClick={() => paginate(-1)}
                        disabled={!loop && currentIndex === 0}
                        aria-label="Slide anterior"
                    >
                        <CaretLeftIcon className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                        className={cn(buttonVariants({ position: 'right' }))}
                        onClick={() => paginate(1)}
                        disabled={!loop && currentIndex === items.length - 1}
                        aria-label="Próximo slide"
                    >
                        <CaretRightIcon className="w-5 h-5 text-foreground" />
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            className={cn(indicatorVariants({ active: index === currentIndex }))}
                            onClick={() => goToSlide(index)}
                            aria-label={`Ir para slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

Carousel.displayName = 'Carousel';

// Componente auxiliar para imagens
export interface ImageCarouselItem {
    id: string | number;
    src: string;
    alt: string;
    title?: string;
    description?: string;
}

/** Carrossel de imagens com efeito opcional de zoom. */
export interface ImageCarouselProps extends Omit<CarouselProps, 'items'> {
    /** Imagens a exibir. */
    images: ImageCarouselItem[];
    /** Ativa o efeito de zoom durante a exibição. */
    enableZoomEffect?: boolean;
    /** Duração do zoom em segundos. */
    zoomDuration?: number;
    /** Estilo da animação de zoom. */
    zoomVariant?: 'subtle' | 'smooth' | 'dramatic' | 'pulse';
}

export const ImageCarousel = React.forwardRef<HTMLDivElement, ImageCarouselProps>(({
    images,
    enableZoomEffect = false,
    zoomDuration = 8,
    zoomVariant = 'smooth',
    autoPlayInterval = 5000,
    ...props
}, ref) => {
    // Configurações diferentes de zoom por variante
    const getZoomAnimation = (variant: string) => {
        switch (variant) {
            case 'subtle':
                return {
                    scale: [1, 1.03],
                    transition: {
                        duration: zoomDuration,
                        ease: [0.4, 0.0, 0.2, 1] as const,
                        repeat: Infinity,
                        repeatType: "reverse" as const
                    }
                };
            case 'smooth':
                return {
                    scale: [1, 1.05, 1.1],
                    transition: {
                        duration: zoomDuration,
                        ease: [0.4, 0.0, 0.2, 1] as const,
                        repeat: Infinity,
                        repeatType: "reverse" as const
                    }
                };
            case 'dramatic':
                return {
                    scale: [1, 1.15],
                    rotate: [0, 1, -1, 0],
                    transition: {
                        duration: zoomDuration,
                        ease: [0.4, 0.0, 0.2, 1] as const,
                        repeat: Infinity,
                        repeatType: "reverse" as const
                    }
                };
            case 'pulse':
                return {
                    scale: [1, 1.05, 1, 1.03, 1],
                    transition: {
                        duration: zoomDuration / 2,
                        ease: [0.4, 0.0, 0.2, 1] as const,
                        repeat: Infinity,
                        repeatType: "loop" as const
                    }
                };
            default:
                return {
                    scale: [1, 1.05],
                    transition: {
                        duration: zoomDuration,
                        ease: [0.4, 0.0, 0.2, 1] as const,
                        repeat: Infinity,
                        repeatType: "reverse" as const
                    }
                };
        }
    };

    const items: CarouselItem[] = images.map((image, index) => ({
        id: image.id,
        content: (
            <div className="relative w-full h-full overflow-hidden">
                <motion.img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    initial={enableZoomEffect ? { scale: 1 } : undefined}
                    animate={enableZoomEffect ? getZoomAnimation(zoomVariant) : undefined}
                    style={{
                        transformOrigin: 'center center'
                    }}
                />
                {(image.title || image.description) && (
                    <motion.div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        {image.title && (
                            <motion.h3 
                                className="text-lg font-semibold mb-1 drop-shadow-lg"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                {image.title}
                            </motion.h3>
                        )}
                        {image.description && (
                            <motion.p 
                                className="text-sm opacity-90 drop-shadow-md"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7, duration: 0.6 }}
                            >
                                {image.description}
                            </motion.p>
                        )}
                    </motion.div>
                )}
                
                {/* Overlay sutil para melhor legibilidade do texto */}
                {(image.title || image.description) && enableZoomEffect && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                )}
            </div>
        ),
        alt: image.alt,
    }));

    return <Carousel 
        ref={ref} 
        items={items} 
        autoPlayInterval={enableZoomEffect ? Math.max(autoPlayInterval, zoomDuration * 1000) : autoPlayInterval}
        {...props} 
    />;
});

ImageCarousel.displayName = 'ImageCarousel';

// Componente auxiliar para tabs
export interface TabCarouselItem {
    id: string | number;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
}

/** Carrossel controlado por abas. */
export interface TabCarouselProps extends Omit<CarouselProps, 'items' | 'showArrows' | 'showIndicators'> {
    /** Abas e conteúdos correspondentes. */
    tabs: TabCarouselItem[];
    /** Posiciona as abas acima ou abaixo do conteúdo. */
    tabPosition?: 'top' | 'bottom';
    /** Aparência das abas. */
    tabVariant?: 'pills' | 'underline';
}

export const TabCarousel = React.forwardRef<HTMLDivElement, TabCarouselProps>(({
    tabs,
    tabPosition = 'top',
    tabVariant = 'pills',
    className,
    style,
    color = 'primary',
    onSlideChange,
    initialSlide = 0,
    ...props
}, ref) => {
    const [activeTab, setActiveTab] = useState(initialSlide);

    const items: CarouselItem[] = tabs.map((tab) => ({
        id: tab.id,
        content: tab.content,
    }));

    const handleSlideChange = (index: number) => {
        setActiveTab(index);
        onSlideChange?.(index);
    };

    const tabButtonClass = tabVariant === 'pills'
        ? 'px-4 py-2 rounded-lg transition-all duration-200'
        : 'px-4 py-2 border-b-2 transition-all duration-200';

    const activeTabClass = tabVariant === 'pills'
        ? 'bg-primary text-primary-foreground'
        : 'border-primary text-primary-text';

    const inactiveTabClass = tabVariant === 'pills'
        ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
        : 'border-transparent text-muted-foreground hover:text-foreground';

    const TabButtons = (
        <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
            {tabs.map((tab, index) => (
                <button
                    key={tab.id}
                    className={cn(
                        tabButtonClass,
                        activeTab === index ? activeTabClass : inactiveTabClass,
                        'flex items-center space-x-2 text-sm font-medium'
                    )}
                    onClick={() => handleSlideChange(index)}
                >
                    {tab.icon && <span>{tab.icon}</span>}
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <div className={cn('space-y-4', className)} style={toneScopeStyle(color, style)}>
            {tabPosition === 'top' && TabButtons}
            <Carousel
                ref={ref}
                items={items}
                showArrows={false}
                showIndicators={false}
                onSlideChange={handleSlideChange}
                initialSlide={initialSlide}
                enableSwipe={true}
                color={color}
                {...props}
            />
            {tabPosition === 'bottom' && TabButtons}
        </div>
    );
});

TabCarousel.displayName = 'TabCarousel';


