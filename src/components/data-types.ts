import type * as React from 'react';

export interface TableData { [key: string]: any }
export interface Column<T = any> {
  key: string; label: string; sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string; width?: string | number; align?: 'left' | 'center' | 'right';
}
export interface SortState { column: string | null; direction: 'asc' | 'desc' | null }
export interface PaginationState { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number }
export interface FilterOption { value: string | number | boolean; label: string; count?: number }
export interface Filter {
  key: string; label: string; type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'money';
  options?: FilterOption[]; placeholder?: string; value?: any;
}
export interface SearchProps {
  value?: string; placeholder?: string; onSearch?: (query: string) => void; onClear?: () => void;
  className?: string; disabled?: boolean; filters?: Filter[]; filterValues?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void; showFilters?: boolean;
  showClearAll?: boolean; debounceMs?: number; globalSearch?: boolean;
}
