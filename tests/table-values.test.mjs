import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTableMoney, formatTableMoney, parseTableDate, formatTableDate } from '../dist/functions/table-values.js';
test('decimal conversion preserves large values and validates Brazilian precision without rounding', () => {
  assert.equal(parseTableMoney('145,50'), '145.50');
  assert.equal(parseTableMoney('1.234,5'), '1234.50');
  assert.equal(parseTableMoney('-000,00'), '0.00');
  assert.equal(parseTableMoney('9007199254740993,01'), '9007199254740993.01');
  assert.equal(parseTableMoney(''), undefined);
  assert.throws(() => parseTableMoney('1,234'));
  assert.throws(() => parseTableMoney('1.2.3,00'));
  assert.match(formatTableMoney('-1234.50'), /-R\$\s1\.234,50/);
});
test('ISO date validation does not shift days across timezones', () => {
  assert.equal(parseTableDate('2024-02-29'), '2024-02-29');
  assert.equal(formatTableDate('2026-10-19'), '19/10/2026');
  assert.throws(() => parseTableDate('2026-02-29'));
  assert.throws(() => parseTableDate('19/10/2026'));
  assert.equal(parseTableDate(''), undefined);
});
