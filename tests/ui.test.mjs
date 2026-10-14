import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Spinner } from '../dist/components/spinner.js';
import { Badge } from '../dist/components/badge.js';
import { Card } from '../dist/components/card.js';
import { useAction } from '../dist/hooks/useAction.js';
import { useFetch } from '../dist/hooks/useFetch.js';
import { useApi } from '../dist/hooks/useApi.js';
import { useCep } from '../dist/hooks/useCep.js';

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
