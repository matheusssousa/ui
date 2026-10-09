'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';

const XIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.X));
const MagnifyingGlassIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.MagnifyingGlass));
const HeartIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.Heart));
const ShareIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.Share));
const DownloadIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.Download));

const galleryVariants = cva(
    'relative w-full',
    {
        variants: {
            variant: {
                expandable: 'hidden md:flex gap-2 h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96',
                masonry: 'columns-1 sm:columns-2 md:columns-2 lg:columns-3 xl:columns-4 gap-2 sm:gap-3 md:gap-4 space-y-2 sm:space-y-3 md:space-y-4',
                grid: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4',
                carousel: 'flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hide snap-x snap-mandatory',
                justified: 'flex flex-wrap gap-1 sm:gap-2',
                slider: 'relative overflow-hidden',
            },
            size: {
                sm: '',
                md: '',
                lg: '',
                xl: '',
            },
        },
        defaultVariants: {
            variant: 'grid',
            size: 'md',
        },
    }
);

const imageVariants = {
    expandable: {
        rest: { flex: 1, scale: 1, brightness: 0.8 },
        hover: { flex: 2, scale: 1.02, brightness: 1 },
    },
    masonry: {
        rest: { scale: 1, opacity: 1 },
        hover: { scale: 1.05, opacity: 1 },
    },
    grid: {
        rest: { scale: 1, rotate: 0 },
        hover: { scale: 1.05, rotate: 1 },
    },
    carousel: {
        rest: { scale: 1, x: 0 },
        hover: { scale: 1.1, x: 0 },
    },
    justified: {
        rest: { scale: 1 },
        hover: { scale: 1.1, zIndex: 10 },
    },
    slider: {
        rest: { scale: 1, opacity: 1 },
        hover: { scale: 1.02, opacity: 1 },
    },
};

export interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
}

interface GalleryProps extends VariantProps<typeof galleryVariants> {
    images: GalleryImage[];
    className?: string;
    enableLightbox?: boolean;
    showOverlay?: boolean;
    overlayActions?: boolean;
    onImageClick?: (image: GalleryImage, index: number) => void;
    enableLazyLoading?: boolean;
    gap?: 'sm' | 'md' | 'lg';
}

// Componente de Lightbox
const Lightbox = ({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex, 
    onNext, 
    onPrev 
}: {
    isOpen: boolean;
    onClose: () => void;
    images: GalleryImage[];
    currentIndex: number;
    onNext: () => void;
    onPrev: () => void;
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Close button */}
                <button
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    onClick={onClose}
                >
                    <XIcon className="w-6 h-6" />
                </button>

                {/* Navigation */}
                {images.length > 1 && (
                    <>
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        >
                            ←
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); onNext(); }}
                        >
                            →
                        </button>
                    </>
                )}

                {/* Image */}
                <motion.div
                    key={currentIndex}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative max-w-full max-h-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={images[currentIndex]?.src}
                        alt={images[currentIndex]?.alt}
                        className="max-w-full max-h-full object-contain"
                    />
                    
                    {/* Image info */}
                    {(images[currentIndex]?.title || images[currentIndex]?.description) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                            {images[currentIndex]?.title && (
                                <h3 className="text-lg font-semibold mb-1">{images[currentIndex].title}</h3>
                            )}
                            {images[currentIndex]?.description && (
                                <p className="text-sm opacity-90">{images[currentIndex].description}</p>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export const Gallery = React.forwardRef<HTMLDivElement, GalleryProps>(({
    images,
    className,
    variant = 'grid',
    size = 'md',
    enableLightbox = false,
    showOverlay = true,
    overlayActions = false,
    onImageClick,
    enableLazyLoading = true,
    gap = 'md',
    ...props
}, ref) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hoveredImage, setHoveredImage] = useState<string | number | null>(null);
    const [sliderIndex, setSliderIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detecta se é dispositivo móvel
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleImageClick = useCallback((image: GalleryImage, index: number) => {
        if (enableLightbox) {
            setCurrentImageIndex(index);
            setLightboxOpen(true);
        }
        onImageClick?.(image, index);
    }, [enableLightbox, onImageClick]);

    const handleNext = useCallback(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const handlePrev = useCallback(() => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const getGapClass = () => {
        switch (gap) {
            case 'sm': return variant === 'expandable' ? 'gap-1' : 'gap-2';
            case 'md': return variant === 'expandable' ? 'gap-2' : 'gap-4';
            case 'lg': return variant === 'expandable' ? 'gap-4' : 'gap-6';
            default: return variant === 'expandable' ? 'gap-2' : 'gap-4';
        }
    };

    const renderExpandableGallery = () => (
        <LayoutGroup>
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    layout
                    className="relative overflow-hidden rounded-lg cursor-pointer group"
                    variants={imageVariants.expandable}
                    initial="rest"
                    whileHover="hover"
                    whileTap="hover"
                    onHoverStart={() => setHoveredImage(image.id)}
                    onHoverEnd={() => setHoveredImage(null)}
                    onTap={() => {
                        if (hoveredImage === image.id) {
                            handleImageClick(image, index);
                        } else {
                            setHoveredImage(image.id);
                        }
                    }}
                    onClick={() => !isMobile && handleImageClick(image, index)}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <motion.img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.8)' }}
                        animate={{
                            filter: hoveredImage === image.id ? 'brightness(1)' : 'brightness(0.8)'
                        }}
                        loading={enableLazyLoading ? "lazy" : undefined}
                    />
                    
                    {/* Overlay */}
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: hoveredImage === image.id ? 1 : 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 flex flex-col justify-between p-2 sm:p-3 md:p-4"
                        >
                            {overlayActions && (
                                <div className="flex justify-end gap-1.5 sm:gap-2">
                                    <button className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                                        <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                    <button className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                                        <ShareIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="text-white">
                                {image.title && (
                                    <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-1">{image.title}</h3>
                                )}
                                {image.description && (
                                    <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{image.description}</p>
                                )}
                                {enableLightbox && (
                                    <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 text-xs opacity-75">
                                        <MagnifyingGlassIcon className="w-3 h-3" />
                                        <span className="hidden sm:inline">Clique para ampliar</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </LayoutGroup>
    );

    const renderMasonryGallery = () => (
        <>
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    className="relative break-inside-avoid mb-2 sm:mb-3 md:mb-4 cursor-pointer group overflow-hidden rounded-lg"
                    variants={imageVariants.masonry}
                    initial="rest"
                    whileHover="hover"
                    onClick={() => handleImageClick(image, index)}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-auto object-cover"
                        loading={enableLazyLoading ? "lazy" : undefined}
                        style={{
                            aspectRatio: image.aspectRatio || 'auto'
                        }}
                    />
                    
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center"
                        >
                            <div className="text-white text-center p-2 sm:p-3 md:p-4">
                                {image.title && (
                                    <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1">{image.title}</h3>
                                )}
                                {enableLightbox && (
                                    <MagnifyingGlassIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 mx-auto opacity-75" />
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </>
    );

    const renderGridGallery = () => (
        <>
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                    variants={imageVariants.grid}
                    initial="rest"
                    whileHover="hover"
                    onClick={() => handleImageClick(image, index)}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading={enableLazyLoading ? "lazy" : undefined}
                    />
                    
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2 sm:p-3 md:p-4 text-white"
                        >
                            {image.title && (
                                <h3 className="font-semibold text-xs sm:text-sm md:text-base mb-1">{image.title}</h3>
                            )}
                            {image.description && (
                                <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{image.description}</p>
                            )}
                            {overlayActions && (
                                <div className="flex gap-1.5 sm:gap-2 mt-2">
                                    <button className="p-1 sm:p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                        <HeartIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                    <button className="p-1 sm:p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                        <DownloadIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </>
    );

    const renderCarouselGallery = () => (
        <>
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    className="relative flex-shrink-0 w-48 h-32 sm:w-56 sm:h-36 md:w-64 md:h-40 lg:w-72 lg:h-48 overflow-hidden rounded-lg cursor-pointer group snap-center"
                    variants={imageVariants.carousel}
                    initial="rest"
                    whileHover="hover"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleImageClick(image, index)}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading={enableLazyLoading ? "lazy" : undefined}
                    />
                    
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white"
                        >
                            <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </>
    );

    const renderJustifiedGallery = () => (
        <>
            {images.map((image, index) => (
                <motion.div
                    key={image.id}
                    className="relative overflow-hidden rounded-lg cursor-pointer"
                    variants={imageVariants.justified}
                    initial="rest"
                    whileHover="hover"
                    onClick={() => handleImageClick(image, index)}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                        width: `${120 + (image.width || 200) / 4}px`,
                        height: '200px'
                    }}
                >
                    <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading={enableLazyLoading ? "lazy" : undefined}
                    />
                    
                    {showOverlay && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                        >
                            <div className="text-center p-2">
                                {image.title && (
                                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{image.title}</h3>
                                )}
                                <MagnifyingGlassIcon className="w-5 h-5 mx-auto opacity-75" />
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            ))}
        </>
    );

    const renderSliderGallery = () => {
        const handleSliderNext = () => {
            setSliderIndex((prev) => (prev + 1) % images.length);
        };

        const handleSliderPrev = () => {
            setSliderIndex((prev) => (prev - 1 + images.length) % images.length);
        };

        return (
            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={sliderIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden rounded-lg cursor-pointer group"
                        onClick={() => handleImageClick(images[sliderIndex], sliderIndex)}
                    >
                        <img
                            src={images[sliderIndex].src}
                            alt={images[sliderIndex].alt}
                            className="w-full h-full object-cover"
                            loading={enableLazyLoading ? "lazy" : undefined}
                        />
                        
                        {showOverlay && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileHover={{ opacity: 1, y: 0 }}
                                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 text-white"
                            >
                                {images[sliderIndex].title && (
                                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{images[sliderIndex].title}</h3>
                                )}
                                {images[sliderIndex].description && (
                                    <p className="text-sm sm:text-base opacity-90 line-clamp-2">{images[sliderIndex].description}</p>
                                )}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSliderPrev(); }}
                            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all duration-300 z-10"
                            aria-label="Anterior"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleSliderNext(); }}
                            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white transition-all duration-300 z-10"
                            aria-label="Próximo"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => { e.stopPropagation(); setSliderIndex(index); }}
                                className={cn(
                                    "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                                    index === sliderIndex 
                                        ? "w-6 sm:w-8 bg-white" 
                                        : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/75"
                                )}
                                aria-label={`Ir para imagem ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderGalleryContent = () => {
        switch (variant) {
            case 'expandable':
                return renderExpandableGallery();
            case 'masonry':
                return renderMasonryGallery();
            case 'grid':
                return renderGridGallery();
            case 'carousel':
                return renderCarouselGallery();
            case 'justified':
                return renderJustifiedGallery();
            case 'slider':
                return renderSliderGallery();
            default:
                return renderGridGallery();
        }
    };

    // Em mobile, se for expandable, usa grid ao invés
    const effectiveVariant = isMobile && variant === 'expandable' ? 'grid' : variant;

    return (
        <>
            {/* Mobile fallback para expandable */}
            {variant === 'expandable' && isMobile && (
                <div
                    ref={ref}
                    className={cn(galleryVariants({ variant: 'grid', size }), getGapClass(), className)}
                    {...props}
                >
                    {renderGridGallery()}
                </div>
            )}

            {/* Desktop ou outros variants */}
            {(variant !== 'expandable' || !isMobile) && (
                <div
                    ref={ref}
                    className={cn(galleryVariants({ variant: effectiveVariant, size }), getGapClass(), className)}
                    {...props}
                >
                    {renderGalleryContent()}
                </div>
            )}

            {/* Lightbox */}
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={images}
                currentIndex={currentImageIndex}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </>
    );
});

Gallery.displayName = 'Gallery';

