import type * as React from 'react';
import type { UIColor } from './theme.js';

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
/** Busca com filtros opcionais; `color` define o tone dos acentos internos. */
export interface SearchProps {
  /** Termo controlado da busca. */
  value?: string;
  /** Texto mostrado quando a busca está vazia. */
  placeholder?: string;
  /** Recebe o termo pesquisado. */
  onSearch?: (query: string) => void;
  /** Chamado quando o termo é limpo. */
  onClear?: () => void;
  /** Classes do contêiner. */
  className?: string;
  /** Impede a interação com a busca. */
  disabled?: boolean;
  /** Definições dos filtros disponíveis. */
  filters?: Filter[];
  /** Valores atuais dos filtros. */
  filterValues?: Record<string, any>;
  /** Recebe os valores atualizados dos filtros. */
  onFilterChange?: (filters: Record<string, any>) => void;
  /** Exibe os controles de filtros. */
  showFilters?: boolean;
  /** Exibe a ação de limpar todos os filtros. */
  showClearAll?: boolean;
  /** Intervalo de debounce em milissegundos. */
  debounceMs?: number;
  /** Habilita o comportamento de busca global. */
  globalSearch?: boolean;
  /** Cor de foco, seleção e indicadores; padrão `primary`. */
  color?: UIColor;
}
