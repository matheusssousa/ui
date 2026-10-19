'use client';

import * as React from 'react';
import type { CellSaveEvent, RowSaveEvent, TableData } from '../components/data-types.js';

export interface PreparedCell {
  event: CellSaveEvent;
  commit: () => void;
}
export interface RowCell {
  prepare: () => PreparedCell | false | null;
  confirmed: () => unknown;
}
export const RowSaveContext = React.createContext<{
  pending: boolean;
  register: (key: string, cell: RowCell) => () => void;
  save: () => Promise<void>;
} | null>(null);

export function EditableRow({ row, rowId, onSave, colSpan, children, ...props }: React.HTMLAttributes<HTMLTableRowElement> & {
  row: TableData; rowId: string | number; onSave?: (event: RowSaveEvent) => Promise<void>; colSpan: number;
}) {
  const cells = React.useRef(new Map<string, RowCell>());
  const container = React.useRef<HTMLTableRowElement>(null);
  const mounted = React.useRef(true);
  const busy = React.useRef(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState('');
  const messageId = React.useId();
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const register = React.useCallback((key: string, cell: RowCell) => {
    cells.current.set(key, cell);
    return () => { cells.current.delete(key); };
  }, []);
  const save = async () => {
    if (!mounted.current || busy.current || !onSave) return;
    const prepared: PreparedCell[] = [];
    const previousRow = { ...row };
    let invalid = false;
    for (const [key, cell] of cells.current) {
      previousRow[key] = cell.confirmed();
      const result = cell.prepare();
      if (result === false) invalid = true;
      else if (result) prepared.push(result);
    }
    if (invalid || !prepared.length) { setError(''); return; }
    const changes = Object.fromEntries(prepared.map(({ event }) => [event.columnKey, event.value]));
    const previousValues = Object.fromEntries(prepared.map(({ event }) => [event.columnKey, event.previousValue]));
    busy.current = true;
    setPending(true);
    setError('');
    try {
      await onSave({ row: previousRow, rowKey: rowId, changes, previousValues, updatedRow: { ...previousRow, ...changes } });
      for (const cell of prepared) cell.commit();
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'N\u00e3o foi poss\u00edvel salvar a linha');
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return <RowSaveContext.Provider value={onSave ? { pending, register, save } : null}>
    <tr {...props} ref={container} aria-busy={onSave ? pending : undefined}
      aria-describedby={pending || error ? messageId : undefined}
      onBlur={event => {
        props.onBlur?.(event);
        if (onSave) queueMicrotask(() => {
          if (mounted.current && !container.current?.contains(document.activeElement)) void save();
        });
      }}>{children}</tr>
    {(pending || error) && <tr><td colSpan={colSpan}>
      <div id={messageId} aria-live="polite" className="px-2 text-xs">
        {pending && <span role="status">{'Salvando linha\u2026'}</span>}
        {error && <div className="text-destructive"><span role="alert">{error}</span>{' '}
          <button type="button" className="rounded-sm underline focus:bg-muted focus:outline-none"
            onMouseDown={event => event.preventDefault()} onClick={() => void save()}>Tentar novamente</button>
        </div>}
      </div>
    </td></tr>}
  </RowSaveContext.Provider>;
}
