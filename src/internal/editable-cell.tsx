'use client';

import * as React from 'react';
import { RowSaveContext, type PreparedCell } from './editable-row.js';
import { Input } from '../components/input.js';
import { Select } from '../components/select.js';
import type { CellEditor, CellEditorValue, CellSaveEvent, TableData } from '../components/data-types.js';

export function EditableCell({ row, rowId, columnKey, label, editor, onSave }: {
  row: TableData; rowId: string | number; columnKey: string; label: string;
  editor: CellEditor; onSave?: (event: CellSaveEvent) => Promise<void>;
}) {
  const rowSave = React.useContext(RowSaveContext);
  const rowPending = rowSave?.pending ?? false;
  const external = row[columnKey];
  const normalize = (value: unknown): CellEditorValue => editor.type === 'input'
    ? String(value ?? '') : value == null ? undefined : value as string | number;
  const [draft, setDraft] = React.useState(() => normalize(external));
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState('');
  const state = React.useRef({ draft, confirmed: external, dirty: false, pending: false, external });
  const mounted = React.useRef(true);
  const container = React.useRef<HTMLDivElement>(null);
  const messageId = React.useId();

  React.useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  React.useEffect(() => {
    const s = state.current;
    if (Object.is(external, s.external)) return;
    s.external = external;
    if (!s.dirty && !s.pending) {
      s.confirmed = external;
      s.draft = normalize(external);
      setDraft(s.draft);
      setError('');
    }
  }, [external]);

  const change = (value: CellEditorValue) => {
    state.current.draft = value;
    state.current.dirty = true;
    setDraft(value);
    setError('');
  };

  const prepare = (): PreparedCell | false | null => {
    const s = state.current;
    if (!mounted.current || s.pending || !s.dirty || editor.disabled) return null;
    let value: unknown;
    try {
      value = editor.parse ? editor.parse(s.draft, row) : s.draft;
      const previous = editor.parse ? editor.parse(normalize(s.confirmed), row) : normalize(s.confirmed);
      if (Object.is(value, previous)) { s.dirty = false; setError(''); return null; }
      const invalid = editor.validate?.(value, row);
      if (invalid) { setError(invalid); return false; }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Valor inv\u00e1lido');
      return false;
    }
    const externalAtSave = s.external;
    setError('');
    return {
      event: { row, rowKey: rowId, columnKey, value, previousValue: s.confirmed },
      commit: () => {
        s.confirmed = Object.is(s.external, externalAtSave) ? value : s.external;
        s.draft = normalize(s.confirmed);
        s.dirty = false;
        if (mounted.current) setDraft(s.draft);
      },
    };
  };
  const latestPrepare = React.useRef(prepare);
  latestPrepare.current = prepare;
  const register = rowSave?.register;
  React.useEffect(() => register?.(columnKey, {
    prepare: () => latestPrepare.current(),
    confirmed: () => state.current.confirmed,
  }), [register, columnKey]);

  const save = async () => {
    if (rowSave) return rowSave.save();
    if (!onSave) return;
    const prepared = prepare();
    if (!prepared) return;
    state.current.pending = true;
    setPending(true);
    try {
      await onSave(prepared.event);
      prepared.commit();
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : 'N\u00e3o foi poss\u00edvel salvar');
    } finally {
      state.current.pending = false;
      if (mounted.current) setPending(false);
    }
  };

  const field = {
    'aria-label': `${label}, linha ${rowId}`,
    'aria-describedby': error || pending ? messageId : undefined,
    'aria-invalid': Boolean(error),
    disabled: pending || rowPending || editor.disabled,
    placeholder: editor.placeholder,
  };
  return <div ref={container} data-table-editor="" className="min-w-0 rounded-sm focus-within:bg-muted/40"
    aria-busy={pending || rowPending} onClick={event => event.stopPropagation()} onTouchStart={event => event.stopPropagation()}
    onBlur={() => {
      if (rowSave) return;
      // Wait for focus transfer and option selection to finish before reading the draft.
      queueMicrotask(() => {
        if (mounted.current && !container.current?.contains(document.activeElement)) void save();
      });
    }}>
    {editor.type === 'input'
      ? <Input {...field} type={editor.inputType ?? 'text'} value={draft ?? ''} onChange={event => change(event.target.value)} />
      : <Select {...field} value={draft ?? null} options={editor.options} searchable={editor.searchable}
          clearable={editor.clearable} display={editor.display}
          onValueChange={value => { if (!Array.isArray(value)) change(value); }} />}
    <div id={messageId} aria-live="polite" className="px-2 text-xs">
      {pending && <span role="status" className="text-muted-foreground">Salvando…</span>}
      {error && <div className="text-destructive"><span role="alert"><span aria-hidden="true">⚠ </span>{error}</span>{' '}
        <button type="button" className="rounded-sm underline focus:bg-muted focus:outline-none" onClick={() => void save()}>Tentar novamente</button>
      </div>}
    </div>
  </div>;
}
