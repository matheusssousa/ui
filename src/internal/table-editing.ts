import type { CellEditor, CellSaveEvent, Column, RowSaveEvent, TableData, TableEditingState, TableFieldErrors, TableRowKey, TableSaveResult } from '../components/data-types.js';
import { parseTableDate, parseTableMoney } from '../functions/table-values.js';

export interface EditingOptions {
  columns: Column[]; rowKey: string; saveMode: 'cell' | 'row';
  onCellSave?: (event: CellSaveEvent) => Promise<void>;
  onRowSave?: (event: RowSaveEvent) => Promise<void>;
  validateRow?: (row: TableData) => TableFieldErrors;
}
interface RowState {
  external: TableData; confirmed: TableData; draft: Record<string, unknown>;
  errors: TableFieldErrors; error?: string; pending: Map<string, Promise<TableSaveResult>>; index: number;
}
const message = (reason: unknown) => reason instanceof Error ? reason.message : 'N\u00e3o foi poss\u00edvel salvar';
export function editorValue(value: unknown, editor: CellEditor): string | number | undefined {
  if (editor.type === 'select') return value == null ? undefined : value as string | number;
  if (editor.type === 'money') return value == null ? '' : String(value).replace('.', ',');
  return String(value ?? '');
}
function convert(value: unknown, editor: CellEditor | false | undefined, row: TableData): unknown {
  if (!editor) return value;
  if (editor.parse) return editor.parse(value as string | number | undefined, row);
  if (editor.type === 'money') return parseTableMoney(value);
  if (editor.type === 'date') return parseTableDate(value);
  return value;
}

export class TableEditingStore {
  options: EditingOptions;
  rows = new Map<TableRowKey, RowState>();
  private version = 0;
  private listeners = new Set<() => void>();
  constructor(options: EditingOptions, data: TableData[]) { this.options = options; this.sync(data); }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  snapshot = () => this.version;
  private notify() { this.version++; this.listeners.forEach(listener => listener()); }
  sync(data: TableData[]) {
    let changed = false;
    data.forEach((row, index) => {
      const id = row[this.options.rowKey] ?? index;
      const current = this.rows.get(id);
      if (!current) {
        this.rows.set(id, { external: { ...row }, confirmed: { ...row }, draft: {}, errors: {}, pending: new Map(), index }); changed = true; return;
      }
      current.index = index;
      for (const key of new Set([...Object.keys(current.external), ...Object.keys(row)])) {
        if (Object.is(current.external[key], row[key])) continue;
        current.external[key] = row[key];
        if (!(key in current.draft) && !current.pending.has('*') && !current.pending.has(key)) current.confirmed[key] = row[key];
        changed = true;
      }
    });
    // Keep off-page drafts and pending requests for saveAll; prune clean rows.
    const visible = new Set(data.map((row, index) => row[this.options.rowKey] ?? index));
    for (const [id, row] of this.rows) if (!visible.has(id) && !Object.keys(row.draft).length && !row.pending.size && !row.error && !Object.keys(row.errors).length) { this.rows.delete(id); changed = true; }
    if (changed) this.notify();
  }
  editor(id: TableRowKey, column: Column, draft = this.getDraftRow(id)): CellEditor | false | undefined {
    if (!draft) return undefined;
    return typeof column.editor === 'function' ? column.editor(draft, this.rows.get(id)?.index ?? 0) : column.editor;
  }
  getDraftRow = (id: TableRowKey): TableData | undefined => {
    const row = this.rows.get(id); if (!row) return undefined;
    const draft = { ...row.confirmed, ...row.draft };
    for (const column of this.options.columns) {
      if (!(column.key in row.draft)) continue;
      try { draft[column.key] = convert(row.draft[column.key], this.editor(id, column, draft), draft); } catch { /* Preserve incomplete input for editor conditions. */ }
    }
    return draft;
  };
  value(id: TableRowKey, key: string, editor: CellEditor) {
    const row = this.rows.get(id);
    return row && key in row.draft ? row.draft[key] : editorValue(row?.confirmed[key], editor);
  }
  capture(id: TableRowKey) { return { ...this.rows.get(id)?.draft }; }
  restore(id: TableRowKey, key: string, snapshot: Record<string, unknown>) {
    const row = this.rows.get(id); if (!row || row.pending.size) return;
    // Escape restores just this edit session, including patches it produced.
    row.draft = { ...snapshot }; row.errors = {}; row.error = undefined; this.notify();
  }
  setDraftValue = (id: TableRowKey, key: string, value: unknown): boolean => {
    const row = this.rows.get(id); if (!row || row.pending.has('*') || row.pending.has(key)) return false;
    const column = this.options.columns.find(column => column.key === key);
    const previousEditor = column && this.editor(id, column);
    row.draft[key] = value; delete row.errors[key]; row.error = undefined;
    const draft = this.getDraftRow(id)!;
    const patch = previousEditor && previousEditor.onChange?.(draft[key], draft);
    if (patch) Object.assign(row.draft, patch);
    this.notify(); return true;
  };
  patchDraft = (id: TableRowKey, changes: Record<string, unknown>): boolean => {
    const row = this.rows.get(id); if (!row || row.pending.size) return false;
    Object.assign(row.draft, changes); row.errors = {}; row.error = undefined; this.notify(); return true;
  };
  discardRow = (id: TableRowKey): boolean => {
    const row = this.rows.get(id); if (!row || row.pending.size) return false;
    row.draft = {}; row.errors = {}; row.error = undefined; this.notify(); return true;
  };
  changes(id: TableRowKey) {
    const row = this.rows.get(id); if (!row) return {};
    const draft = this.getDraftRow(id)!;
    const changes: Record<string, unknown> = {};
    for (const key of Object.keys(row.draft)) {
      const column = this.options.columns.find(column => column.key === key);
      const editor = column && this.editor(id, column, draft);
      let previous = row.confirmed[key];
      try { if (editor) previous = convert(editorValue(previous, editor), editor, row.confirmed); } catch { /* Invalid old data must remain editable. */ }
      if (!Object.is(draft[key], previous)) changes[key] = draft[key];
    }
    return changes;
  }
  validateRow = (id: TableRowKey, onlyKey?: string): TableFieldErrors => {
    const row = this.rows.get(id); if (!row) return {};
    const draft = this.getDraftRow(id)!;
    const errors: TableFieldErrors = {};
    for (const column of this.options.columns) {
      if (onlyKey && column.key !== onlyKey) continue;
      const editor = this.editor(id, column, draft); if (!editor || editor.disabled) continue;
      try {
        const raw = column.key in row.draft ? row.draft[column.key] : editorValue(row.confirmed[column.key], editor);
        const value = convert(raw, editor, draft);
        if (editor.required && (value == null || value === '')) errors[column.key] = 'Campo obrigat\u00f3rio';
        if (editor.type === 'select' && value != null && !editor.options.some(option => Object.is(option.value, value))) errors[column.key] = 'Selecao invalida';
        if (editor.type === 'date' && typeof value === 'string' && ((editor.min && value < editor.min) || (editor.max && value > editor.max))) errors[column.key] = 'Data fora do intervalo permitido';
        const invalid = editor.validate?.(value, draft); if (invalid) errors[column.key] = invalid;
      } catch (reason) { errors[column.key] = message(reason); }
    }
    if (!onlyKey) {
      try { Object.assign(errors, this.options.validateRow?.(draft)); }
      catch (reason) { errors._row = message(reason); }
      row.errors = errors;
    } else { delete row.errors[onlyKey]; Object.assign(row.errors, errors); }
    this.notify(); return errors;
  };
  getEditingState = (): TableEditingState => {
    const state: TableEditingState = { dirtyRows: [], savingRows: [], errorRows: [] };
    for (const [id, row] of this.rows) {
      if (Object.keys(this.changes(id)).length) state.dirtyRows.push(id);
      if (row.pending.size) state.savingRows.push(id);
      if (row.error || Object.keys(row.errors).length) state.errorRows.push({ rowKey: id, errors: { ...row.errors }, error: row.error });
    }
    return state;
  };
  private execute(id: TableRowKey, keys: string[], slot: string): Promise<TableSaveResult> {
    const row = this.rows.get(id)!;
    const changes = this.changes(id);
    const selected = Object.fromEntries(keys.filter(key => key in changes).map(key => [key, changes[key]]));
    if (!Object.keys(selected).length) { row.error = undefined; this.notify(); return Promise.resolve({ rowKey: id, ok: true, status: 'unchanged' }); }
    const previous = { ...row.confirmed }, external = { ...row.external };
    row.error = undefined;
    const onRowSave = this.options.onRowSave, onCellSave = this.options.onCellSave;
    // Defer the callback until the in-flight entry exists, including sync exceptions.
    const promise = Promise.resolve().then(async (): Promise<TableSaveResult> => {
      try {
        if (slot === '*') await onRowSave!({ row: previous, rowKey: id, changes: selected,
          previousValues: Object.fromEntries(Object.keys(selected).map(key => [key, previous[key]])), updatedRow: { ...previous, ...selected } });
        else await onCellSave!({ row: previous, rowKey: id, columnKey: slot, value: selected[slot], previousValue: previous[slot] });
        for (const key of Object.keys(selected)) {
          row.confirmed[key] = Object.is(external[key], row.external[key]) ? selected[key] : row.external[key];
          delete row.draft[key]; delete row.errors[key];
        }
        return { rowKey: id, ok: true, status: 'saved' };
      } catch (reason) {
        row.error = message(reason);
        if (slot !== '*') row.errors[slot] = row.error;
        return { rowKey: id, ok: false, status: 'error', error: row.error };
      } finally { row.pending.delete(slot); this.notify(); }
    });
    row.pending.set(slot, promise); this.notify(); return promise;
  }
  saveCell = (id: TableRowKey, key: string): Promise<TableSaveResult> => {
    const row = this.rows.get(id);
    if (!row) return Promise.resolve({ rowKey: id, ok: false, status: 'not-found' });
    if (row.pending.has('*')) return row.pending.get('*')!;
    if (row.pending.has(key)) return row.pending.get(key)!;
    if (!this.options.onCellSave) return Promise.resolve({ rowKey: id, ok: false, status: 'readonly' });
    if (!(key in this.changes(id))) return Promise.resolve({ rowKey: id, ok: true, status: 'unchanged' });
    const errors = this.validateRow(id, key);
    if (Object.keys(errors).length) return Promise.resolve({ rowKey: id, ok: false, status: 'invalid', errors });
    return this.execute(id, [key], key);
  };
  saveRow = (id: TableRowKey): Promise<TableSaveResult> => {
    const row = this.rows.get(id);
    if (!row) return Promise.resolve({ rowKey: id, ok: false, status: 'not-found' });
    if (row.pending.has('*')) return row.pending.get('*')!;
    const rowMode = this.options.saveMode === 'row';
    if (!(rowMode ? this.options.onRowSave : this.options.onCellSave)) return Promise.resolve({ rowKey: id, ok: false, status: 'readonly' });
    const errors = this.validateRow(id);
    if (Object.keys(errors).length) return Promise.all(row.pending.values()).then(() => ({ rowKey: id, ok: false, status: 'invalid' as const, errors }));
    if (rowMode) return this.execute(id, Object.keys(this.changes(id)), '*');
    const tasks = new Set(row.pending.values());
    for (const key of Object.keys(this.changes(id))) tasks.add(this.saveCell(id, key));
    return Promise.all(tasks).then(results => results.find(result => !result.ok) ?? { rowKey: id, ok: true, status: results.some(result => result.status === 'saved') ? 'saved' : 'unchanged' });
  };
  saveAll = async () => {
    const state = this.getEditingState();
    const ids = new Set([...state.dirtyRows, ...state.savingRows]);
    const results = await Promise.all([...ids].map(id => this.saveRow(id)));
    return { ok: results.every(result => result.ok), results };
  };
}
