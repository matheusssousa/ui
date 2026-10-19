'use client';

import type { TableData, Column, SortState, PaginationState, CellSaveEvent, RowSaveEvent } from './data-types.js';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pagination } from './pagination.js';
import { SkeletonTable } from './skeleton.js';
import dynamic from 'next/dynamic.js';
import { Input } from './input.js';
import { EditableRow } from '../internal/editable-row.js';
import { EditableCell } from '../internal/editable-cell.js';
import { TableStyleContext } from '../internal/table-style.js';

const CaretUpDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpDownIcon), { ssr: false });
const CaretUpIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpIcon), { ssr: false });
const CaretDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretDownIcon), { ssr: false });

// Variantes do Table
const tableVariants = cva(
  'w-full border-collapse bg-card text-foreground [&_th]:font-medium [&_th]:text-muted-foreground [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-muted/30',
  {
    variants: {
      variant: {
        default: '',
        ghost: 'bg-transparent',
        striped: '[&_tbody_tr:nth-child(even)]:bg-muted/20',
        outline: '[&_thead]:bg-muted/30 [&_tbody_tr:not(:last-child)]:border-b [&_tbody_tr]:border-border/60',
        grid: '[&_th]:border [&_td]:border [&_th]:border-border/60 [&_td]:border-border/60 [&_thead]:bg-muted/30',
        fixed: 'table-fixed',
      },
      size: {
        sm: 'text-xs [&_th]:px-2 [&_th]:py-2 [&_td]:px-2 [&_td]:py-1',
        default: 'text-sm [&_th]:px-3 [&_th]:py-3 [&_td]:px-3 [&_td]:py-2',
        lg: 'text-base [&_th]:px-4 [&_th]:py-4 [&_td]:px-4 [&_td]:py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/** Tabela com ordenação, seleção e paginação opcionais. */
export interface TableProps extends VariantProps<typeof tableVariants> {
  /** Definição das colunas. */
  columns: Column[];
  /** Layout independente da aparência; variant=fixed permanece compatível. */
  layout?: 'auto' | 'fixed';
  /** Rejeite a Promise para manter o rascunho e mostrar erro. */
  onCellSave?: (event: CellSaveEvent) => Promise<void>;
  /** Padrao cell; row salva ao sair da linha inteira. */
  saveMode?: 'cell' | 'row';
  /** Persiste todos os campos alterados da linha em uma chamada. */
  onRowSave?: (event: RowSaveEvent) => Promise<void>;
  /** Linhas exibidas. */
  data: TableData[];
  /** Exibe estado de carregamento. */
  loading?: boolean;
  /** Texto quando não há linhas. */
  emptyMessage?: string;
  /** Classe do contêiner. */
  className?: string;
  /** Habilita ordenação pelos cabeçalhos. */
  sortable?: boolean;
  /** Coluna e direção de ordenação atuais. */
  sortState?: SortState;
  /** Recebe a coluna escolhida para ordenação. */
  onSort?: (column: string) => void;
  /** Estado da paginação. */
  pagination?: PaginationState;
  /** Recebe a página escolhida. */
  onPageChange?: (page: number) => void;
  /** Permite selecionar linhas. */
  selectable?: boolean;
  /** Decide se uma linha pode ser selecionada. */
  isRowSelectable?: (row: TableData) => boolean;
  /** Recebe as chaves das linhas selecionadas. */
  onSelectionChange?: (selectedRows: (string | number)[]) => void; // Apenas o callback
  /** Campo que identifica cada linha. */
  rowKey?: string;
  /** Recebe a linha e o índice após clique. */
  onRowClick?: (row: TableData, index: number) => void;
  /** Renderiza ações para a seleção atual. */
  renderBulkActions?: (
    selectedRows: (string | number)[],
    clearSelection: () => void
  ) => React.ReactNode; // Função para renderizar ações em massa
  /** Habilita adaptação a telas estreitas. */
  responsive?: boolean;
  /** Número de colunas antes de ocultar extras em telas menores. */
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
    layout,
    onCellSave,
    saveMode = 'cell',
    onRowSave,
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

    const canEdit = saveMode === 'row' ? Boolean(onRowSave) : Boolean(onCellSave);
    const renderCell = (column: Column, row: TableData, rowIndex: number) => {
      const value = row[column.key];
      const editor = typeof column.editor === 'function' ? column.editor(row, rowIndex) : column.editor;
      if (editor && canEdit) return <EditableCell row={row} rowId={row[rowKey]} columnKey={column.key}
        label={column.label} editor={editor} onSave={onCellSave} />;
      if (column.render) return column.render(value, row, rowIndex);

      return value;
    };

    if (canEdit && columns.some(column => column.editor)) {
      const ids = new Set<string | number>();
      for (const row of data) {
        const id = row[rowKey];
        if ((typeof id !== 'string' && typeof id !== 'number') || (typeof id === 'number' && !Number.isFinite(id)) || ids.has(id)) {
          throw new Error('Table editável exige rowKey único e estável em todas as linhas.');
        }
        ids.add(id);
      }
    }

    if (loading) {
      return <SkeletonTable rows={5} columns={4} className="w-full" />;
    }

    return (
      <TableStyleContext.Provider value={{ size: size ?? 'default', borderless: variant !== 'outline' && variant !== 'grid' }}>
      <div className="w-full space-y-4">
        {renderBulkActions && selectedRows.length > 0 && (
          renderBulkActions(selectedRows, handleClearSelection)
        )}
        <div className={cn('rounded-lg', (variant === 'outline' || variant === 'grid') && 'border border-border/60', responsive && 'overflow-x-auto')}>
          <table ref={ref} className={cn(tableVariants({ variant, size }), (layout ?? (variant === 'fixed' ? 'fixed' : 'auto')) === 'fixed' ? 'table-fixed' : 'table-auto', className)} {...props}>
            <thead>
              <tr>
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
                      'align-middle font-medium text-muted-foreground whitespace-nowrap',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.align === 'left' && 'text-left',
                      !column.align && 'text-left',
                      sortable && column.sortable && 'cursor-pointer select-none hover:text-foreground',
                      responsive && index >= limitColumnsShow && 'hidden md:table-cell'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className={cn('flex items-center gap-1 whitespace-nowrap', column.align === 'right' && 'justify-end', column.align === 'center' && 'justify-center')}>
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
                    <EditableRow row={row} rowId={row[rowKey]} colSpan={columns.length + (selectable ? 1 : 0)}
                      onSave={saveMode === 'row' ? onRowSave : undefined}
                      key={row[rowKey] == null ? rowIndex : `${typeof row[rowKey]}:${row[rowKey]}`}
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
                      onTouchStart={() => handleTouchStart(row, row[rowKey] ?? rowIndex)}
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
                            'align-middle',
                            column.className,
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.align === 'left' && 'text-left',
                            responsive && index >= limitColumnsShow && 'hidden md:table-cell'
                          )}
                        >
                          {renderCell(column, row, rowIndex)}
                        </td>
                      ))}
                    </EditableRow>
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
      </TableStyleContext.Provider>
    );
  }
);

Table.displayName = 'Table';

export { Table, tableVariants };



