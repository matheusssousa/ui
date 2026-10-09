import type { TableData, Column, SortState, PaginationState } from './data-types.js';
'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pagination } from './pagination.js';
import { SkeletonTable } from './skeleton.js';
import dynamic from 'next/dynamic.js';
import { Input } from './input.js';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CaretUpDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpDownIcon), { ssr: false });
const CaretUpIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretUpIcon), { ssr: false });
const CaretDownIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.CaretDownIcon), { ssr: false });
const DotsSixVerticalIcon = dynamic(() => import('@phosphor-icons/react/dist/ssr').then(mod => mod.DotsSixVerticalIcon), { ssr: false });

// Variantes do Table
const tableVariants = cva(
  'w-full bg-card',
  {
    variants: {
      variant: {
        default: '',
        ghost: 'border-none',
        striped: '[&_tbody_tr:nth-child(even)]:bg-muted/50',
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

interface SortableRowProps {
  row: TableData;
  rowIndex: number;
  columns: Column[];
  rowKey: string;
  selectable?: boolean;
  selectedRows: (string | number)[];
  onSelectRow: (rowId: string | number, checked: boolean) => void;
  onRowClick?: (row: TableData, index: number) => void;
  renderCell: (column: Column, row: TableData, rowIndex: number) => React.ReactNode;
  isDraggable?: boolean;
}

function SortableRow({
  row,
  rowIndex,
  columns,
  rowKey,
  selectable,
  selectedRows,
  onSelectRow,
  onRowClick,
  renderCell,
  isDraggable = false,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row[rowKey] });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isSelected = selectedRows.includes(row[rowKey]);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-colors',
        isSelected && 'bg-card-foreground/10',
        onRowClick && 'cursor-pointer',
        isDragging && 'opacity-50 bg-muted'
      )}
      onClick={() => onRowClick?.(row, rowIndex)}
    >
      {isDraggable && (
        <td className="p-4 align-middle w-8">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <DotsSixVerticalIcon className="h-5 w-5" />
          </button>
        </td>
      )}
      {selectable && (
        <td className="p-4 align-middle">
          <Input
            type='checkbox'
            checked={isSelected}
            onChange={(e) => onSelectRow(row[rowKey], e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      {columns.map((column) => (
        <td
          key={column.key}
          className={cn(
            'p-4 align-middle text-sm',
            column.className,
            column.align === 'center' && 'text-center',
            column.align === 'right' && 'text-right',
            column.align === 'left' && 'text-left',
          )}
        >
          {renderCell(column, row, rowIndex)}
        </td>
      ))}
    </tr>
  );
}

export interface DraggableTableProps extends VariantProps<typeof tableVariants> {
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
  onSelectionChange?: (selectedRows: (string | number)[]) => void;
  rowKey?: string;
  onRowClick?: (row: TableData, index: number) => void;
  renderBulkActions?: (
    selectedRows: (string | number)[],
    clearSelection: () => void
  ) => React.ReactNode;
  responsive?: boolean;
  draggable?: boolean;
  onReorder?: (reorderedData: TableData[]) => void;
}

const DraggableTable = React.forwardRef<HTMLTableElement, DraggableTableProps>(
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
    onSelectionChange,
    rowKey = 'id',
    onRowClick,
    renderBulkActions,
    responsive = true,
    draggable = false,
    onReorder,
    ...props
  }, ref) => {
    const [selectedRows, setSelectedRows] = React.useState<(string | number)[]>([]);
    const [items, setItems] = React.useState(data);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    React.useEffect(() => {
      setItems(data);
    }, [data]);

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
      const allKeys = checked ? items.map(row => row[rowKey]) : [];
      setSelectedRows(allKeys);
    };

    const handleSelectRow = (rowId: string | number, checked: boolean) => {
      const newSelected = checked ? [...selectedRows, rowId] : selectedRows.filter(id => id !== rowId);
      setSelectedRows(newSelected);
    };

    const isAllSelected = items.length > 0 && selectedRows.length === items.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length;

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

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setItems((items) => {
          const oldIndex = items.findIndex(item => item[rowKey] === active.id);
          const newIndex = items.findIndex(item => item[rowKey] === over.id);

          const newItems = arrayMove(items, oldIndex, newIndex);
          
          // Chama o callback com os dados reordenados
          onReorder?.(newItems);
          
          return newItems;
        });
      }
    };

    if (loading) {
      return <SkeletonTable rows={5} columns={4} className="w-full" />;
    }

    const TableContent = (
      <table ref={ref} className={cn(tableVariants({ variant, size }), className)} {...props}>
        <thead>
          <tr className="bg-card">
            {draggable && (
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-8">
                {/* Coluna para o ícone de drag */}
              </th>
            )}
            {selectable && (
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                <Input
                  type='checkbox'
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'h-12 px-4 align-middle font-medium text-sm text-muted-foreground',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.align === 'left' && 'text-left',
                  !column.align && 'text-left',
                  sortable && column.sortable && 'cursor-pointer select-none hover:text-foreground'
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0) + (draggable ? 1 : 0)}
                className="h-12 text-center text-muted-foreground text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            items.map((row, rowIndex) => (
              <SortableRow
                key={row[rowKey] || rowIndex}
                row={row}
                rowIndex={rowIndex}
                columns={columns}
                rowKey={rowKey}
                selectable={selectable}
                selectedRows={selectedRows}
                onSelectRow={handleSelectRow}
                onRowClick={onRowClick}
                renderCell={renderCell}
                isDraggable={draggable}
              />
            ))
          )}
        </tbody>
      </table>
    );

    return (
      <div className="w-full space-y-4">
        {renderBulkActions && selectedRows.length > 0 && (
          renderBulkActions(selectedRows, handleClearSelection)
        )}
        <div className={cn('rounded-md', responsive && 'overflow-x-auto')}>
          {draggable ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map(item => item[rowKey])}
                strategy={verticalListSortingStrategy}
              >
                {TableContent}
              </SortableContext>
            </DndContext>
          ) : (
            TableContent
          )}
        </div>

        {/* Pagination */}
        {pagination && onPageChange && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
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

DraggableTable.displayName = 'DraggableTable';

export { DraggableTable, tableVariants };



