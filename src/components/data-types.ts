import type * as React from 'react';
import type { UIColor } from './theme.js';
import type { SelectOption } from './select.js';

export type CellEditorValue = string | number | undefined;
export interface CellEditorBase<T = TableData> {
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Retorne campos dependentes a atualizar junto com este valor. */
  onChange?: (value: unknown, draftRow: T) => Record<string, unknown> | void;
  /** Converte o rascunho antes de comparar, validar e salvar. */
  parse?: (value: CellEditorValue, row: T) => unknown;
  /** Retorne uma mensagem para impedir o salvamento. */
  validate?: (value: unknown, row: T) => string | undefined;
}
export type CellEditor<T = TableData> = CellEditorBase<T> & (
  | { type: 'input'; inputType?: 'text' | 'number' | 'email' | 'url' | 'tel' | 'password' | 'search' }
  | { type: 'date'; min?: string; max?: string }
  | { type: 'money'; currency?: string }
  | { type: 'select'; options: SelectOption[]; searchable?: boolean; clearable?: boolean; display?: 'text' | 'badge' }
);
export interface CellSaveEvent<T = TableData> {
  row: T;
  rowKey: string | number;
  columnKey: string;
  value: unknown;
  previousValue: unknown;
}

export interface RowSaveEvent<T = TableData> {
  /** Snapshot confirmado antes das alteracoes. */
  row: T;
  rowKey: string | number;
  /** Apenas os campos alterados, apos conversao e validacao. */
  changes: Record<string, unknown>;
  previousValues: Record<string, unknown>;
  /** Snapshot completo com as alteracoes aplicadas. */
  updatedRow: T;
}

export type TableRowKey = string | number;
export type TableFieldErrors = Record<string, string>;
export interface TableEditingState {
  dirtyRows: TableRowKey[];
  savingRows: TableRowKey[];
  errorRows: Array<{ rowKey: TableRowKey; errors: TableFieldErrors; error?: string }>;
}
export interface TableSaveResult {
  rowKey: TableRowKey;
  ok: boolean;
  status: 'saved' | 'unchanged' | 'invalid' | 'error' | 'not-found' | 'readonly';
  errors?: TableFieldErrors;
  error?: string;
}
export interface TableEditingController {
  saveRow(rowKey: TableRowKey): Promise<TableSaveResult>;
  saveAll(): Promise<{ ok: boolean; results: TableSaveResult[] }>;
  /** Retorna false se a linha estiver salvando ou nao existir. */
  discardRow(rowKey: TableRowKey): boolean;
  resetRow(rowKey: TableRowKey): boolean;
  getEditingState(): TableEditingState;
  focusCell(rowKey: TableRowKey, columnKey: string): boolean;
  getDraftRow(rowKey: TableRowKey): TableData | undefined;
  setDraftValue(rowKey: TableRowKey, columnKey: string, value: unknown): boolean;
  patchDraft(rowKey: TableRowKey, changes: Record<string, unknown>): boolean;
  validateRow(rowKey: TableRowKey): TableFieldErrors;
}

export interface TableData { [key: string]: any }
export interface Column<T = any> {
  key: string; label: string; sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  /** Editor fixo ou definido individualmente por linha. */
  editor?: CellEditor<T> | ((row: T, index: number) => CellEditor<T> | false);
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
