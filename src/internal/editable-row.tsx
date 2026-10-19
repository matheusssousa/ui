'use client';
import * as React from 'react';
import type { TableRowKey } from '../components/data-types.js';
import { useTableRuntime } from './table-runtime.js';

export function EditableRow({ rowId, colSpan, children, ...props }: React.HTMLAttributes<HTMLTableRowElement> & {
  rowId: TableRowKey; colSpan: number;
}) {
  const { store, spreadsheet, canEdit, stacked } = useTableRuntime();
  const container = React.useRef<HTMLTableRowElement>(null);
  const mounted = React.useRef(true);
  const messageId = React.useId();
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const row = store.rows.get(rowId);
  const pending = Boolean(row?.pending.size);
  const error = row?.error;
  return <>
    <tr {...props} ref={container} role={spreadsheet ? 'row' : undefined} aria-busy={canEdit ? pending : undefined}
      aria-describedby={!spreadsheet && (pending || error) ? messageId : undefined}
      className={[props.className, stacked ? 'ui-table-stacked-row' : ''].filter(Boolean).join(' ')}
      onBlur={event => {
        props.onBlur?.(event);
        if (canEdit && store.options.saveMode === 'row') queueMicrotask(() => {
          if (mounted.current && !container.current?.contains(document.activeElement) && Object.keys(store.changes(rowId)).length) void store.saveRow(rowId);
        });
      }}>{children}</tr>
    {!spreadsheet && (pending || error) && <tr><td colSpan={colSpan}>
      <div id={messageId} aria-live="polite" className="px-2 text-xs">
        {pending && <span role="status">{'Salvando linha\u2026'}</span>}
        {error && <div className="text-destructive"><span role="alert">{error}</span>{' '}
          <button type="button" className="rounded-sm underline focus:bg-muted focus:outline-none"
            onMouseDown={event => event.preventDefault()} onClick={() => void store.saveRow(rowId)}>Tentar novamente</button>
        </div>}
      </div>
    </td></tr>}
  </>;
}
