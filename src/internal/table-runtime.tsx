'use client';
import { createContext, useContext } from 'react';
import type { TableEditingStore } from './table-editing.js';
import type { TableNavigation } from './table-navigation.js';
export const TableRuntimeContext = createContext<{
  store: TableEditingStore; navigation: TableNavigation; spreadsheet: boolean;
  canEdit: boolean; tableId: string; stacked: boolean; columnOffset: number;
} | null>(null);
export function useTableRuntime() {
  const runtime = useContext(TableRuntimeContext);
  if (!runtime) throw new Error('Missing table context');
  return runtime;
}
