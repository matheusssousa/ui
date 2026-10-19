'use client';
import * as React from 'react';
import type { Column, TableRowKey } from '../components/data-types.js';
import { Input } from '../components/input.js';
import { Select } from '../components/select.js';
import { cn } from '../utils.js';
import { formatTableDate, formatTableMoney } from '../functions/table-values.js';
import { cellIdentity } from './table-navigation.js';
import { useTableRuntime } from './table-runtime.js';

export function EditableCell({ rowId, column, rowIndex, columnIndex, className }: {
  rowId: TableRowKey; column: Column; rowIndex: number; columnIndex: number; className?: string;
}) {
  const { store, spreadsheet, navigation, canEdit, tableId, stacked, columnOffset } = useTableRuntime();
  const td = React.useRef<HTMLTableCellElement | null>(null);
  const mounted = React.useRef(true);
  const [editing, setEditing] = React.useState(false);
  const startKey = React.useRef<string | undefined>(undefined);
  const session = React.useRef<Record<string, unknown>>({});
  const draftRow = store.getDraftRow(rowId) ?? {};
  const state = store.rows.get(rowId);
  const editor = store.editor(rowId, column, draftRow);
  const editable = Boolean(editor && !editor.disabled && canEdit);
  const pending = Boolean(state?.pending.has('*') || state?.pending.has(column.key));
  const rowPending = Boolean(state?.pending.size);
  const error = state?.errors[column.key];
  const rowError = columnIndex === 0 ? state?.error || state?.errors._row : undefined;
  const dirty = column.key in store.changes(rowId);
  const id = cellIdentity(rowId, column.key);
  const messageId = React.useId();
  const nativeId = React.useId();
  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  React.useEffect(() => {
    if (editing && spreadsheet) {
      const input = td.current?.querySelector<HTMLElement>('input:not([type="hidden"]),[role="combobox"]');
      input?.focus();
      if (input && startKey.current) {
        const key = startKey.current; startKey.current = undefined;
        input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      }
    }
  }, [editing, spreadsheet]);
  React.useEffect(() => { if (!editable && editing) { setEditing(false); td.current?.focus(); } }, [editable, editing]);
  const begin = (replacement?: string) => {
    if (!editable || pending || !editor) return;
    session.current = store.capture(rowId);
    if (replacement !== undefined) {
      if (editor.type === 'select') startKey.current = replacement;
      else store.setDraftValue(rowId, column.key, replacement);
    }
    setEditing(true);
  };
  const finish = () => {
    setEditing(false);
    if (store.options.saveMode === 'cell') void store.saveCell(rowId, column.key);
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLTableCellElement>) => {
    if (!spreadsheet || event.nativeEvent.isComposing) return;
    // The open list owns its arrows, Enter, Escape and Tab.
    const openSelect = td.current?.querySelector('[role="combobox"][aria-expanded="true"]');
    if (editing && openSelect && event.key !== 'Tab') return;
    if (event.key === 'Escape' && editing) {
      event.preventDefault(); event.stopPropagation(); store.restore(rowId, column.key, session.current); setEditing(false); td.current?.focus(); return;
    }
    if (event.key === 'Tab' || event.key === 'Enter') {
      if (event.target instanceof HTMLElement && event.target.closest('[data-table-status]')) return;
      event.preventDefault(); if (editing) finish();
      td.current?.focus();
      navigation.move(rowId, column.key, event.key === 'Tab' ? (event.shiftKey ? 'previous' : 'next') : (event.shiftKey ? 'up' : 'down'));
      return;
    }
    if (editing) return;
    const directions = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' } as const;
    if (event.key in directions) { event.preventDefault(); navigation.move(rowId, column.key, directions[event.key as keyof typeof directions]); return; }
    if (event.key === 'F2') { event.preventDefault(); begin(); return; }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); begin(event.key); }
  };
  const value = draftRow[column.key];
  let display: React.ReactNode = value == null ? '' : String(value);
  try {
    if (column.render) display = column.render(value, draftRow, rowIndex);
    else if (editor && editor.type === 'money') display = formatTableMoney(value, editor.currency);
    else if (editor && editor.type === 'date') display = formatTableDate(value);
    else if (editor && editor.type === 'select') display = editor.options.find(option => option.value === value)?.label ?? editor.placeholder ?? '';
  } catch { /* Incomplete data remains visible for correction. */ }
  const showEditor = canEdit && editor && (!spreadsheet || editing);
  const field = {
    'aria-label': column.label + ', linha ' + rowId,
    'aria-describedby': error ? messageId : undefined,
    'aria-invalid': Boolean(error), disabled: pending || Boolean(editor && editor.disabled),
    placeholder: editor ? editor.placeholder : undefined,
  };
  const raw = editor ? store.value(rowId, column.key, editor) : value;
  return <td ref={element => { td.current = element; navigation.register(rowId, column.key, element); }}
    role={spreadsheet ? 'gridcell' : undefined} headers={tableId + '-column-' + columnIndex}
    aria-colindex={spreadsheet ? columnIndex + 1 + columnOffset : undefined} aria-readonly={spreadsheet ? !editable : undefined}
    aria-selected={spreadsheet ? navigation.activeId === id : undefined}
    aria-invalid={error ? true : undefined} aria-describedby={error || rowError ? messageId : undefined}
    aria-busy={pending} tabIndex={spreadsheet ? (navigation.activeId === id ? 0 : -1) : -1}
    data-table-cell="" data-editing={editing || undefined} data-readonly={!editable || undefined}
    data-dirty={dirty || undefined} data-error={Boolean(error || rowError) || undefined}
    className={cn('align-middle', className, spreadsheet && 'ui-sheet-cell', stacked && 'ui-table-stacked-cell',
      editor && editor.type === 'money' && 'text-right tabular-nums')}
    onFocus={() => navigation.setActive(id)} onKeyDown={onKeyDown}
    onClick={event => {
      if (spreadsheet) { event.stopPropagation(); if (!editing) { td.current?.focus(); if (stacked && window.innerWidth < 768) begin(); } }
    }} onDoubleClick={() => spreadsheet && begin()}
    onBlur={() => {
      queueMicrotask(() => {
        if (!mounted.current || td.current?.contains(document.activeElement)) return;
        if (editing) setEditing(false);
        if (canEdit && store.options.saveMode === 'cell') void store.saveCell(rowId, column.key);
      });
    }}
    onCopy={event => {
      if (spreadsheet && !editing) { event.clipboardData.setData('text/plain', value == null ? '' : String(value)); event.preventDefault(); }
    }} onPaste={event => {
      if (spreadsheet && !editing) {
        const text = event.clipboardData.getData('text/plain');
        event.preventDefault(); if (!/[\t\r\n]/.test(text)) begin(text);
      }
    }}>
    {stacked && <span className="ui-table-mobile-label" aria-hidden="true">{column.label}</span>}
    <div className={cn('relative min-w-0', !spreadsheet && 'rounded-sm focus-within:bg-muted/40')}
      data-table-editor={showEditor ? '' : undefined}
      onClick={event => { if (showEditor) event.stopPropagation(); }} onTouchStart={event => { if (showEditor || spreadsheet) event.stopPropagation(); }}>
      {showEditor && editor ? editor.type === 'select'
        ? <Select {...field} value={(raw ?? null) as string | number | null} options={editor.options} searchable={editor.searchable}
            clearable={editor.clearable} display={editor.display}
            onValueChange={next => { if (!Array.isArray(next)) store.setDraftValue(rowId, column.key, next); }} />
        : editor.type === 'date'
          ? <input {...field} id={nativeId} type="date" min={editor.min} max={editor.max} value={String(raw ?? '')}
              className="ui-table-date" onChange={event => store.setDraftValue(rowId, column.key, event.target.value)} />
          : <Input {...field} type={editor.type === 'money' ? 'text' : editor.inputType ?? 'text'}
              inputMode={editor.type === 'money' ? 'decimal' : undefined} value={String(raw ?? '')}
              onChange={event => store.setDraftValue(rowId, column.key, event.target.value)} />
        : <div className={spreadsheet ? 'ui-sheet-value' : undefined}>{display}</div>}
      {spreadsheet && (dirty || error || rowError || (columnIndex === 0 && rowPending)) && <span data-table-status="" className="ui-sheet-status">
        {columnIndex === 0 && rowPending ? <span role="status" aria-label="Salvando linha">{'\u2022'}</span>
          : error || rowError ? <button type="button" title={error || rowError} aria-label="Tentar novamente"
              onMouseDown={event => event.preventDefault()} onClick={event => { event.stopPropagation(); void store.saveRow(rowId); }}>{'!'}</button>
          : <span aria-label="Alteracao pendente">{'\u2022'}</span>}
      </span>}
      <div id={messageId} aria-live="polite" className={spreadsheet ? 'sr-only' : 'px-2 text-xs'}>
        {!spreadsheet && pending && store.options.saveMode === 'cell' && <span role="status">{'Salvando\u2026'}</span>}
        {(error || rowError) && <span role="alert">{error || rowError}</span>}
        {!spreadsheet && error && <button type="button" className="underline" onClick={() => void (store.options.saveMode === 'row' ? store.saveRow(rowId) : store.saveCell(rowId, column.key))}>Tentar novamente</button>}
      </div>
    </div>
  </td>;
}
