import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';

const skeletonVariants = cva(
  'animate-pulse bg-muted rounded-md dark:bg-card',
  {
    variants: {
      variant: {
        default: 'bg-muted dark:bg-card',
        light: 'bg-muted/70',
        dark: 'bg-neutral/25',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      rounded: 'md',
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof skeletonVariants> {
  width?: string | number;
  height?: string | number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, rounded, width, height, style, ...props }, ref) => {
    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, rounded }), className)}
        style={skeletonStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Componentes pré-definidos para casos comuns
const SkeletonText = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'height'>>(
  ({ className, width = '100%', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-4', className)}
        width={width}
        {...props}
      />
    );
  }
);

SkeletonText.displayName = 'SkeletonText';

const SkeletonTitle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'height'>>(
  ({ className, width = '60%', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-6', className)}
        width={width}
        {...props}
      />
    );
  }
);

SkeletonTitle.displayName = 'SkeletonTitle';

const SkeletonAvatar = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'width' | 'height'>>(
  ({ className, ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-12 w-12', className)}
        rounded="full"
        {...props}
      />
    );
  }
);

SkeletonAvatar.displayName = 'SkeletonAvatar';

const SkeletonButton = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, 'height'>>(
  ({ className, width = '100px', ...props }, ref) => {
    return (
      <Skeleton
        ref={ref}
        className={cn('h-10', className)}
        width={width}
        {...props}
      />
    );
  }
);

SkeletonButton.displayName = 'SkeletonButton';

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('space-y-3', className)} ref={ref}>
        <Skeleton className="h-48 w-full" rounded="lg" />
        <div className="space-y-2">
          <SkeletonTitle />
          <SkeletonText />
          <SkeletonText width="80%" />
        </div>
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

const SkeletonList = React.forwardRef<HTMLDivElement, { items?: number; className?: string }>(
  ({ items = 3, className }, ref) => {
    return (
      <div className={cn('space-y-4', className)} ref={ref}>
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <SkeletonAvatar />
            <div className="space-y-2 flex-1">
              <SkeletonTitle width="40%" />
              <SkeletonText />
            </div>
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = 'SkeletonList';

const SkeletonTable = React.forwardRef<HTMLDivElement, { rows?: number; columns?: number; className?: string }>(
  ({ rows = 5, columns = 4, className }, ref) => {
    return (
      // 1. Adicionado 'w-full' para ocupar toda a largura e aumentado o espaço vertical
      <div className={cn('w-full space-y-4', className)} ref={ref}>
        {/* Header */}
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            // 2. Removido width fixo e usado 'flex-1' para que a coluna cresça
            //    Adicionada uma altura maior para o cabeçalho.
            <Skeleton key={index} className="h-6 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              // 3. O mesmo para as linhas de dados, com altura um pouco menor
              <Skeleton key={colIndex} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }
);

SkeletonTable.displayName = 'SkeletonTable';


const SkeletonForm = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn('space-y-4', className)} ref={ref}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
);

SkeletonForm.displayName = 'SkeletonForm';

export {
  Skeleton,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonForm,
  skeletonVariants
};




