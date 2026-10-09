import type { TableData, Column, SortState, PaginationState } from './data-types.js';
'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pagination } from './pagination.js';
import { SkeletonTable } from './skeleton.js';
import dynamic from 'next/dynamic.js';
import { Input } from './input.js';

const CaretUpDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpDownIcon), { ssr: false });
const CaretUpIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpIcon), { ssr: false });
const CaretDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretDownIcon), { ssr: false });

// Variantes do Table
const tableVariants = cva(
  'w-full bg-card',
  {
    variants: {
      variant: {
        default: 'table-auto',
        ghost: 'border-none',
        striped: '[&_tbody_tr:nth-child(even)]:bg-muted/10',
        fixed: 'table-fixed',
      },
      size: {
        sm: 'text-sm',
        default: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TableProps extends VariantProps<typeof tableVariants> {
  columns: Column[];
  data: TableData[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  sortable?: boolean;
  sortState?: SortState;
  onSort?: (column: string) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  isRowSelectable?: (row: TableData) => boolean;
  onSelectionChange?: (selectedRows: (string | number)[]) => void; // Apenas o callback
  rowKey?: string;
  onRowClick?: (row: TableData, index: number) => void;
  renderBulkActions?: (
    selectedRows: (string | number)[],
    clearSelection: () => void
  ) => React.ReactNode; // Função para renderizar ações em massa
  responsive?: boolean;
  limitColumnsShow?: number; // Quantidade de colunas a mostrar antes de esconder em telas menores
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({
    columns,
    data,
    loading = false,
    emptyMessage = 'Nenhum item encontrado',
    className,
    variant,
    size,
    sortState,
    onSort,
    sortable = !!onSort,
    pagination,
    onPageChange,
    selectable = false,
    isRowSelectable,
    onSelectionChange,
    rowKey = 'id',
    onRowClick,
    renderBulkActions,
    responsive = true,
    limitColumnsShow = 3,
    ...props
  }, ref) => {
    const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([]);
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    React.useEffect(() => {
      setSelectedRows([]);
    }, [data]);

    React.useEffect(() => {
      onSelectionChange?.(selectedRows);
    }, [selectedRows, onSelectionChange]);

    const handleClearSelection = React.useCallback(() => {
      setSelectedRows([]);
    }, []);

    const handleSort = (column: string) => {
      if (!sortable || !onSort) return;
      onSort(column);
    };

    const handleSelectAll = (checked: boolean) => {
      const allKeys = checked
        ? data.filter((row) => isRowSelectable?.(row) ?? true).map((row) => row[rowKey])
        : [];
      setSelectedRows(allKeys);
    };

    const handleSelectRow = (rowId: string | number, checked: boolean) => {
      const newSelected = checked ? [...selectedRows, rowId] : selectedRows.filter(id => id !== rowId);
      setSelectedRows(newSelected);
    };

    const selectableRows = data.filter((row) => isRowSelectable?.(row) ?? true);
    const isAllSelected = selectableRows.length > 0 && selectedRows.length === selectableRows.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < selectableRows.length;

    const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleTouchStart = (row: TableData, rowId: string | number) => {
      if (!selectable || (isRowSelectable && !isRowSelectable(row))) return;
      pressTimer.current = setTimeout(() => {
        if (!selectedRows.includes(rowId)) {
          handleSelectRow(rowId, true);
        }
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      }, 500);
    };

    const handleTouchEnd = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };

    const handleTouchMove = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
      }
    };

    const getSortIcon = (columnKey: string) => {
      if (!sortable) return null;
      if (sortState?.column !== columnKey) return <CaretUpDownIcon className="h-4 w-4 text-muted-foreground" />;

      return sortState.direction === 'asc' ? <CaretUpIcon className="h-4 w-4" /> : <CaretDownIcon className="h-4 w-4" />;
    };

    const renderCell = (column: Column, row: TableData, rowIndex: number) => {
      const value = row[column.key];
      if (column.render) return column.render(value, row, rowIndex);

      return value;
    };

    if (loading) {
      return <SkeletonTable rows={5} columns={4} className="w-full" />;
    }

    return (
      <div className="w-full space-y-4">
        {renderBulkActions && selectedRows.length > 0 && (
          renderBulkActions(selectedRows, handleClearSelection)
        )}
        <div className={cn('rounded-md', responsive && 'overflow-x-auto')}>
          <table ref={ref} className={cn(tableVariants({ variant, size }), className)} {...props}>
            <thead>
              <tr className="bg-card">
                {selectable && (
                  <th className={cn(
                    "h-10 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap",
                    "hidden md:table-cell",
                    selectedRows.length > 0 && "!table-cell"
                  )}>
                    <Input
                      type='checkbox'
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      disabled={selectableRows.length === 0}
                      className="h-4 w-4 rounded"
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      'h-10 px-3 align-middle font-medium text-sm text-muted-foreground whitespace-nowrap',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.align === 'left' && 'text-left',
                      !column.align && 'text-left',
                      sortable && column.sortable && 'cursor-pointer select-none hover:text-foreground',
                      index >= limitColumnsShow && 'hidden md:table-cell'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="h-12 text-center text-muted-foreground text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => {
                  const isSelected = selectedRows.includes(row[rowKey]);
                  return (
                    <tr
                      key={row[rowKey] || rowIndex}
                      className={cn(
                        'transition-colors',
                        isSelected && 'bg-card-foreground/10',
                        (isMobile && onRowClick) && 'cursor-pointer'
                      )}
                      onClick={(e) => {
                         // Evita o onRowClick se o usuário clicou no checkbox
                         if ((e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                         if (isMobile && onRowClick) {
                           onRowClick(row, rowIndex);
                         }
                      }}
                      onTouchStart={() => handleTouchStart(row, row[rowKey] || rowIndex)}
                      onTouchEnd={handleTouchEnd}
                      onTouchMove={handleTouchMove}
                    >
                      {selectable && (
                        <td className={cn(
                          "px-3 py-2 align-middle",
                          "hidden md:table-cell",
                          selectedRows.length > 0 && "!table-cell"
                        )}>
                          <Input
                            type='checkbox'
                            checked={isSelected}
                            disabled={isRowSelectable ? !isRowSelectable(row) : false}
                            onChange={(e) => handleSelectRow(row[rowKey], e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      {columns.map((column, index) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-3 py-2 align-middle text-sm',
                            column.className,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.align === 'left' && 'text-left',
                            index >= limitColumnsShow && 'hidden md:table-cell'
                          )}
                        >
                          {renderCell(column, row, rowIndex)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && onPageChange && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center sm:justify-between">
            <div className="hidden sm:block text-sm text-muted-foreground">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} até{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
              {pagination.totalItems} resultados
            </div>
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    );
  }
);

Table.displayName = 'Table';

export { Table, tableVariants };



