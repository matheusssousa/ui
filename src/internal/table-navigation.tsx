'use client';
import * as React from 'react';
import type { TableRowKey } from '../components/data-types.js';

export const cellIdentity = (row: TableRowKey, column: string) => JSON.stringify([row, column]);
export function useTableNavigation(rows: TableRowKey[], columns: string[], spreadsheet: boolean) {
  const cells = React.useRef(new Map<string, HTMLTableCellElement>());
  const [active, setActive] = React.useState<string | null>(null);
  const order = rows.flatMap(row => columns.map(column => cellIdentity(row, column)));
  const activeId = active && order.includes(active) ? active : order[0];
  const register = React.useCallback((row: TableRowKey, column: string, cell: HTMLTableCellElement | null) => {
    const id = cellIdentity(row, column);
    if (cell) cells.current.set(id, cell); else cells.current.delete(id);
  }, []);
  const focusCell = (row: TableRowKey, column: string): boolean => {
    const id = cellIdentity(row, column), cell = cells.current.get(id);
    if (!cell || getComputedStyleSafe(cell) === 'none') return false;
    setActive(id);
    const target = spreadsheet ? cell : cell.querySelector<HTMLElement>('input:not([type="hidden"]),[role="combobox"],button') ?? cell;
    target.focus(); target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' }); return document.activeElement === target;
  };
  const move = (row: TableRowKey, column: string, direction: 'left' | 'right' | 'up' | 'down' | 'next' | 'previous') => {
    const rowIndex = rows.indexOf(row), colIndex = columns.indexOf(column);
    if (direction === 'next' || direction === 'previous') {
      const delta = direction === 'next' ? 1 : -1;
      let index = order.indexOf(cellIdentity(row, column)) + delta;
      while (index >= 0 && index < order.length) {
        const [nextRow, nextColumn] = JSON.parse(order[index]);
        if (focusCell(nextRow, nextColumn)) return true;
        index += delta;
      }
      const cell = cells.current.get(cellIdentity(row, column));
      const table = cell?.closest('table');
      if (!table) return false;
      const outside = [...document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[tabindex]')]
        .filter(el => el.tabIndex >= 0 && !el.hasAttribute('disabled') && getComputedStyleSafe(el) !== 'none' && !table.contains(el));
      const target = delta > 0 ? outside.find(el => Boolean(table.compareDocumentPosition(el) & 4))
        : outside.reverse().find(el => Boolean(table.compareDocumentPosition(el) & 2));
      target?.focus(); return Boolean(target);
    }
    const r = rowIndex + (direction === 'down' ? 1 : direction === 'up' ? -1 : 0);
    const c = colIndex + (direction === 'right' ? 1 : direction === 'left' ? -1 : 0);
    return r >= 0 && r < rows.length && c >= 0 && c < columns.length ? focusCell(rows[r], columns[c]) : false;
  };
  return { activeId, setActive, register, focusCell, move };
}
function getComputedStyleSafe(element: HTMLElement) { return element.ownerDocument.defaultView?.getComputedStyle(element).display; }
export type TableNavigation = ReturnType<typeof useTableNavigation>;
