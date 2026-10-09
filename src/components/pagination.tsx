import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils.js';
import dynamic from 'next/dynamic.js';

const CaretLeftIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretLeftIcon), { ssr: false });
const CaretRightIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretRightIcon), { ssr: false });

const paginationVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground dark:text-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
        active: 'bg-foreground text-background dark:bg-foreground dark:text-background',
        ghost: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPreviousNext?: boolean;
  siblingCount?: number;
  className?: string;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    showPreviousNext = true,
    siblingCount = 1,
    className,
    ...props 
  }, ref) => {
    // Gerar lista de páginas a serem exibidas
    const generatePageNumbers = () => {
      const pages: (number | string)[] = [];
      
      // Sempre mostrar primeira página
      pages.push(1);
      
      // Calcular início e fim das páginas do meio
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);
      
      // Adicionar ellipsis se necessário antes das páginas do meio
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Adicionar páginas do meio
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      // Adicionar ellipsis se necessário depois das páginas do meio
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Sempre mostrar última página (se não for a primeira)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
      
      return pages;
    };

    const pageNumbers = generatePageNumbers();

    const handlePrevious = () => {
      if (currentPage > 1) {
        onPageChange(currentPage - 1);
      }
    };

    const handleNext = () => {
      if (currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    const handlePageClick = (page: number | string) => {
      if (typeof page === 'number') {
        onPageChange(page);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center space-x-2', className)}
        {...props}
      >
        {/* Previous Button */}
        {showPreviousNext && (
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className={cn(
              paginationVariants({ variant: 'ghost', size: 'default' }),
              'gap-2 cursor-pointer'
            )}
          >
            <CaretLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">ANTERIOR</span>
          </button>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="flex h-10 w-10 items-center justify-center text-muted-foreground">
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageClick(page)}
                className={cn(
                  paginationVariants({
                    variant: currentPage === page ? 'active' : 'default',
                    size: 'icon',
                  }), 'cursor-pointer'
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        {showPreviousNext && (
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={cn(
              paginationVariants({ variant: 'ghost', size: 'default' }),
              'gap-2 cursor-pointer'
            )}
          >
            <span className="hidden sm:inline">PRÓXIMO</span>
            <CaretRightIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Pagination.displayName = 'Pagination';

export { Pagination, paginationVariants };


