'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import { ImageIcon } from '@phosphor-icons/react/dist/ssr';

const imageVariants = cva(
    'relative overflow-hidden bg-muted',
    {
        variants: {
            aspectRatio: {
                square: 'aspect-square',
                video: 'aspect-video',
                '4/3': 'aspect-[4/3]',
                '3/2': 'aspect-[3/2]',
                '21/9': 'aspect-[21/9]',
                auto: '',
            },
            objectFit: {
                cover: '',
                contain: '',
                fill: '',
                none: '',
                scaleDown: '',
            },
            rounded: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                '2xl': 'rounded-2xl',
                full: 'rounded-full',
            }
        },
        defaultVariants: {
            aspectRatio: 'auto',
            objectFit: 'cover',
            rounded: 'md',
        }
    }
);

const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    scaleDown: 'object-scale-down',
};

export interface ImageProps
    extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>,
    VariantProps<typeof imageVariants> {
    src?: string | null;
    alt: string;
    fallback?: string;
    containerClassName?: string;
    showPlaceholder?: boolean;
    placeholderClassName?: string;
    onLoadSuccess?: () => void;
    onLoadError?: () => void;
}

const Image = React.forwardRef<HTMLDivElement, ImageProps>(
    (
        {
            src,
            alt,
            fallback = '/placeholder-image.png',
            className,
            containerClassName,
            aspectRatio,
            objectFit = 'cover',
            rounded,
            loading = 'lazy',
            showPlaceholder = true,
            placeholderClassName,
            onLoadSuccess,
            onLoadError,
            ...props
        },
        ref
    ) => {
        const [imageSrc, setImageSrc] = React.useState<string | undefined>(src || undefined);
        const [isLoading, setIsLoading] = React.useState<boolean>(true);
        const [hasError, setHasError] = React.useState<boolean>(false);

        React.useEffect(() => {
            if (src) {
                setImageSrc(src);
                setIsLoading(true);
                setHasError(false);
            } else {
                setImageSrc(undefined);
                setIsLoading(false);
                setHasError(true);
            }
        }, [src]);

        const handleLoad = () => {
            setIsLoading(false);
            setHasError(false);
            onLoadSuccess?.();
        };

        const handleError = () => {
            setIsLoading(false);
            setHasError(true);
            if (fallback) {
                setImageSrc(fallback);
            }
            onLoadError?.();
        };

        return (
            <div
                ref={ref}
                className={cn(
                    imageVariants({ aspectRatio, rounded }),
                    containerClassName
                )}
            >
                {/* Placeholder/Loading State */}
                {(isLoading || !imageSrc) && showPlaceholder && (
                    <div
                        className={cn(
                            'absolute inset-0 flex flex-col items-center justify-center bg-muted animate-pulse',
                            placeholderClassName
                        )}
                    >
                        <ImageIcon className="w-10 h-10 text-muted-foreground/20" weight="duotone" />
                        {hasError && !fallback && (
                            <span className="text-xs text-muted-foreground/50 mt-2">
                                Sem imagem
                            </span>
                        )}
                    </div>
                )}

                {/* Actual Image */}
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={alt}
                        loading={loading}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={cn(
                            'w-full h-full transition-opacity duration-300',
                            objectFit && objectFitClasses[objectFit],
                            isLoading ? 'opacity-0' : 'opacity-100',
                            className
                        )}
                        {...props}
                    />
                )}

                {/* Error State Indicator */}
                {hasError && imageSrc === fallback && (
                    <div className="absolute bottom-2 right-2 bg-destructive/80 text-destructive-foreground text-xs px-2 py-1 rounded">
                        Falha ao carregar
                    </div>
                )}
            </div>
        );
    }
);

Image.displayName = 'Image';

// Avatar Image Component
export interface AvatarImageProps extends Omit<ImageProps, 'aspectRatio' | 'objectFit' | 'rounded'> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    shape?: 'circle' | 'square' | 'rounded';
}

const avatarSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-24 h-24',
};

const avatarShapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-md',
};

const AvatarImage = React.forwardRef<HTMLDivElement, AvatarImageProps>(
    ({ size = 'md', shape = 'circle', className, containerClassName, ...props }, ref) => {
        return (
            <Image
                ref={ref}
                {...props}
                aspectRatio="square"
                objectFit="cover"
                rounded={shape === 'circle' ? 'full' : shape === 'rounded' ? 'md' : 'none'}
                containerClassName={cn(
                    avatarSizeClasses[size],
                    containerClassName
                )}
                className={className}
            />
        );
    }
);

AvatarImage.displayName = 'AvatarImage';

// Service Image Component
export interface ServiceImageProps extends Omit<ImageProps, 'aspectRatio' | 'rounded'> {
    variant?: 'card' | 'detail' | 'thumbnail' | 'banner';
}

const serviceImageVariants = {
    card: {
        aspectRatio: 'video' as const,
        rounded: 'lg' as const,
    },
    detail: {
        aspectRatio: '4/3' as const,
        rounded: 'xl' as const,
    },
    thumbnail: {
        aspectRatio: 'square' as const,
        rounded: 'md' as const,
    },
    banner: {
        aspectRatio: '21/9' as const,
        rounded: 'lg' as const,
    },
};

const ServiceImage = React.forwardRef<HTMLDivElement, ServiceImageProps>(
    ({ variant = 'card', containerClassName, ...props }, ref) => {
        const variantConfig = serviceImageVariants[variant];

        return (
            <Image
                ref={ref}
                {...props}
                aspectRatio={variantConfig.aspectRatio}
                rounded={variantConfig.rounded}
                containerClassName={containerClassName}
            />
        );
    }
);

ServiceImage.displayName = 'ServiceImage';

export { Image, AvatarImage, ServiceImage, imageVariants };


