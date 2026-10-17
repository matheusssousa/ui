import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { Spinner } from '../dist/components/spinner.js';
import { Badge } from '../dist/components/badge.js';
import { Card } from '../dist/components/card.js';
import { useAction } from '../dist/hooks/useAction.js';
import { useFetch } from '../dist/hooks/useFetch.js';
import { useApi } from '../dist/hooks/useApi.js';
import { useCep } from '../dist/hooks/useCep.js';
import { SpeedDialTabs } from '../dist/components/speed-dial-tabs.js';
import { Tabs, TabsList, TabsTrigger } from '../dist/components/tabs.js';
import { toneClasses } from '../dist/components/theme.js';
import { MonthYearPicker } from '../dist/components/month-year-picker.js';

test('consolidated loading and status have accessible labels', () => {
  const spinner = renderToStaticMarkup(React.createElement(Spinner, { mode: 'block', label: 'Carregando dados' }));
  assert.match(spinner, /role="status"/);
  assert.match(spinner, /aria-label="Carregando dados"/);
  assert.match(renderToStaticMarkup(React.createElement(Badge, { status: 'active', display: 'indicator' })), /Ativo/);
  assert.match(renderToStaticMarkup(React.createElement(Badge, { status: 'active', display: 'indicator', showLabel: false })), /sr-only/);
});

test('metric card renders its value and loading skeleton', () => {
  const metric = { label: 'Receita', value: 100, format: 'currency', change: 2 };
  assert.match(renderToStaticMarkup(React.createElement(Card, { metric })), /Receita/);
  assert.match(renderToStaticMarkup(React.createElement(Card, { metric })), /vs anterior/);
  assert.match(renderToStaticMarkup(React.createElement(Card, { metric, loading: true })), /animate-pulse/);
});

test('all four client hooks render with their initial state', () => {
  function Fixture() {
    const action = useAction(async () => ({ success: true }));
    const fetched = useFetch(async () => ({ ok: true }));
    const api = useApi({ request: async () => ({ ok: true }) });
    const cep = useCep();
    return React.createElement('p', null, [action.pending, fetched.loading, api.isLoading, cep.loading].join(','));
  }
  assert.match(renderToStaticMarkup(React.createElement(Fixture)), /false,false,false,false/);
});

test('speed dial tabs renders a labelled trigger at a center position', () => {
  const markup = renderToStaticMarkup(React.createElement(SpeedDialTabs, {
    position: 'bottom-center',
    triggerLabel: 'Minhas áreas',
    icon: 'SquaresFourIcon',
    tabs: [{ value: 'home', label: 'Home', icon: 'HouseIcon' }],
  }));
  assert.match(markup, /bottom-4/);
  assert.match(markup, /left-1\/2/);
  assert.match(markup, /aria-expanded="false"/);
  assert.match(markup, /Minhas áreas/);
  assert.match(markup, /<svg/);
  assert.equal((markup.match(/<svg/g) ?? []).length, 1, 'the trigger has only its chosen icon');
  assert.match(markup, /bg-primary/);
  assert.match(markup, /text-primary-foreground/);
  const secondary = renderToStaticMarkup(React.createElement(SpeedDialTabs, {
    triggerLabel: 'Seções', color: 'secondary', tabs: [{ value: 'one', label: 'One' }],
  }));
  assert.match(secondary, /bg-secondary/);
  assert.match(secondary, /text-secondary-foreground/);
});

test('tabs use the selected tone in every variant', () => {
  const primaryPills = renderToStaticMarkup(React.createElement(Tabs, { defaultValue: 'first', variant: 'pills', color: 'primary' },
    React.createElement(TabsList, null, React.createElement(TabsTrigger, { value: 'first' }, 'First'))));
  assert.match(primaryPills, /bg-primary/);
  assert.match(primaryPills, /text-primary-foreground/);
  for (const variant of ['underline', 'pills', 'segmented', 'cards', 'sidebar']) {
    const markup = renderToStaticMarkup(React.createElement(Tabs, { defaultValue: 'first', variant, color: 'secondary' },
      React.createElement(TabsList, null,
        React.createElement(TabsTrigger, { value: 'first' }, 'First'),
        React.createElement(TabsTrigger, { value: 'second' }, 'Second'))));
    assert.match(markup, /aria-selected="true"/);
    assert.match(markup, /bg-secondary/);
    assert.match(markup, variant === 'pills' || variant === 'segmented' ? /text-secondary-foreground/ : /text-secondary-text/);
  }
  assert.match(toneClasses.secondary.soft, /text-secondary-text/);
  assert.doesNotMatch(toneClasses.secondary.soft, /text-secondary-foreground/);
});

test('default solid and soft theme colors meet text contrast in light and dark themes', () => {
  const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
  const blocks = [css.match(/:root\s*\{([^}]+)\}/)?.[1], css.match(/:root\.dark\s*\{([^}]+)\}/)?.[1]];
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const ratio = (first, second) => (Math.max(luminance(first), luminance(second)) + 0.05) / (Math.min(luminance(first), luminance(second)) + 0.05);
  for (const block of blocks) {
    assert.ok(block);
    const token = (name) => {
      const value = block.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
      assert.ok(value, `missing ${name}`);
      return value;
    };
    for (const color of ['primary', 'secondary', 'tertiary']) {
      assert.ok(ratio(token(color), token(`${color}-foreground`)) >= 4.5, `${color} solid contrast`);
      assert.ok(ratio(token('background'), token(`${color}-text`)) >= 4.5, `${color} soft contrast`);
    }
  }
});

test('month and year picker shows the selected month and disables navigation at year limits', () => {
  const october = renderToStaticMarkup(React.createElement(MonthYearPicker, {
    defaultValue: new Date(2026, 9, 1), minYear: 2025, maxYear: 2027,
  }));
  assert.match(october, /Outubro de 2026/);
  assert.match(october, /aria-label="Mês anterior"/);
  assert.match(october, /aria-label="Próximo mês"/);
  assert.match(october, /aria-haspopup="dialog"/);

  const january = renderToStaticMarkup(React.createElement(MonthYearPicker, {
    value: new Date(2026, 0, 1), minYear: 2026,
  }));
  assert.match(january, /aria-label="Mês anterior" disabled=""/);
  const december = renderToStaticMarkup(React.createElement(MonthYearPicker, {
    value: new Date(2026, 11, 1), maxYear: 2026,
  }));
  assert.match(december, /aria-label="Próximo mês" disabled=""/);
  assert.throws(() => renderToStaticMarkup(React.createElement(MonthYearPicker, {
    minYear: 2027, maxYear: 2026,
  })), RangeError);
});
