'use client';

import { useEffect, useRef } from 'react';
import type { Filter, SearchProps } from '../components/data-types.js';
import { useApiTable, type UseApiTableOptions, type LaravelPaginatedResponse } from './useApiTable.js';

export interface UseSearchOptions<T, Response = LaravelPaginatedResponse<T>> extends UseApiTableOptions<T, Response> {
  initialSearch?: string;
  initialFilters?: Record<string, unknown>;
  placeholder?: string;
  filters?: Filter[];
  onSearchChange?: (query: string, filters: Record<string, unknown>) => void;
}
export function useSearch<T = unknown, Response = LaravelPaginatedResponse<T>>(options: UseSearchOptions<T, Response> = {}) {
  const table = useApiTable<T, Response>({ ...options, initialState: {
    ...options.initialState,
    ...(options.initialSearch !== undefined ? { search: options.initialSearch } : {}),
    ...(options.initialFilters !== undefined ? { filters: options.initialFilters } : {}),
  } });
  const callback = useRef(options.onSearchChange);
  callback.current = options.onSearchChange;
  const { search, filters } = table.state;
  const delay = options.debounceMs ?? 300;
  useEffect(() => {
    const timer = setTimeout(() => callback.current?.(search, filters), Math.max(0, delay));
    return () => clearTimeout(timer);
  }, [search, filters, delay]);
  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v != null && (!Array.isArray(v) || v.length > 0));
  const searchProps: SearchProps = { value: search, filterValues: filters, filters: options.filters ?? [],
    placeholder: options.placeholder ?? 'Pesquisar...', debounceMs: 0,
    onSearch: table.setSearch, onFilterChange: table.setFilters, onClear: table.clearFilters,
    showFilters: Boolean(options.filters?.length), showClearAll: hasActiveFilters || Boolean(search) };
  return { ...table, searchQuery: search, filterValues: filters, hasActiveFilters,
    clearAll: table.clearFilters, searchProps,
    tableProps: { data: table.data, pagination: table.pagination, loading: table.isLoading,
      onPageChange: table.setPage, sortState: table.sortState, onSort: table.setSort } };
}

export { useSearch as useUnifiedSearch };
