'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, type ModalProps } from './modal.js';
import { Info, type InfoProps } from './info.js';
import { Button, type ButtonProps } from './button.js';
import { resolveHttpError, type HttpClient, type HttpRequestOptions } from '../functions/http.js';
import { cn } from '../utils.js';

export interface ViewField<T> extends Omit<InfoProps, 'value' | 'loading'> {
  key: Extract<keyof T, string>;
  value?: ReactNode;
  render?: (data: T) => ReactNode;
  show?: boolean | ((data: T) => boolean);
}
export interface ViewSection<T> {
  title?: string; description?: string; columns?: 1 | 2 | 3 | 4; className?: string;
  permission?: string; show?: boolean | ((data: T) => boolean); fields: ViewField<T>[];
}
export interface ViewAction<T> {
  id: string; label: string; permission?: string; show?: boolean | ((data: T) => boolean);
  variant?: ButtonProps['variant']; color?: ButtonProps['color']; icon?: ReactNode;
  onClick: (data: T) => void | Promise<void>;
}
export interface ViewModalConfig<T> {
  title?: string | ((data: T) => string);
  description?: string | ((data: T) => string);
  size?: ModalProps['size'];
  sections: ViewSection<T>[];
  tabs?: { key: string; label: string; sections: ViewSection<T>[] }[];
  actions?: ViewAction<T>[];
}
export interface ViewModalProps<T> {
  isOpen: boolean; onClose: () => void; data?: T; config: ViewModalConfig<T>; loading?: boolean;
  client?: HttpClient; endpoint?: string; requestOptions?: HttpRequestOptions;
  can?: (permission: string) => boolean;
  onSuccess?: () => void; onError?: (error: unknown) => void;
}
const columns = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3', 4: 'grid-cols-1 md:grid-cols-4' };

export function ViewModal<T>({ isOpen, onClose, data, config, loading = false, client, endpoint,
  requestOptions, can, onSuccess, onError }: ViewModalProps<T>) {
  const [remote, setRemote] = useState<{ endpoint: string; data: T } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('');
  const [action, setAction] = useState<string | null>(null);
  const running = useRef(false);
  const generation = useRef(0);
  const latest = useRef({ requestOptions, onError, onSuccess });
  latest.current = { requestOptions, onError, onSuccess };
  useEffect(() => {
    generation.current++;
    running.current = false; setAction(null); setError(null); setRemote(null); setActiveTab('');
    if (!isOpen || !endpoint || !client) { setFetching(false); return; }
    const controller = new AbortController();
    const externalSignal = latest.current.requestOptions?.signal;
    const abort = () => { controller.abort(); setFetching(false); };
    externalSignal?.addEventListener('abort', abort, { once: true });
    setFetching(true);
    if (externalSignal?.aborted) abort();
    void client.request<T>('GET', endpoint, undefined, { ...latest.current.requestOptions, signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setRemote({ endpoint, data: value }); })
      .catch(reason => { if (!controller.signal.aborted) { setError(resolveHttpError(reason)); latest.current.onError?.(reason); } })
      .finally(() => { if (!controller.signal.aborted) setFetching(false); });
    return () => { generation.current++; controller.abort(); externalSignal?.removeEventListener('abort', abort); };
  }, [isOpen, client, endpoint]);
  const item = endpoint ? (remote?.endpoint === endpoint ? remote.data : undefined) : data;
  const busy = loading || fetching;
  const visible = (value: { permission?: string; show?: boolean | ((data: T) => boolean) }) =>
    (!value.permission || can?.(value.permission) === true) &&
    (typeof value.show === 'function' ? item != null && value.show(item) : value.show !== false);
  const title = typeof config.title === 'function' ? (item == null ? 'Visualizar' : config.title(item)) : config.title ?? 'Visualizar';
  const description = typeof config.description === 'function' ? (item == null ? undefined : config.description(item)) : config.description;
  const tab = config.tabs?.find(t => t.key === activeTab) ?? config.tabs?.[0];
  const run = async (button: ViewAction<T>) => {
    if (running.current || item == null) return;
    const current = generation.current;
    running.current = true; setAction(button.id); setError(null);
    try {
      await button.onClick(item);
      if (generation.current === current) latest.current.onSuccess?.();
    } catch (reason) {
      if (generation.current === current) { setError(resolveHttpError(reason)); latest.current.onError?.(reason); }
    } finally {
      if (generation.current === current) { running.current = false; setAction(null); }
    }
  };
  return <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size={config.size ?? 'xl'} cancelText="Fechar">
    <div className="space-y-4" aria-busy={busy}>
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {busy && <p role="status">Carregando...</p>}
      {!busy && item == null && <p>Nenhum dado disponível.</p>}
      <div className="flex flex-wrap gap-2">{config.tabs?.map(t => <button type="button" key={t.key}
        aria-pressed={tab?.key === t.key} onClick={() => setActiveTab(t.key)} className="rounded border border-border p-2">{t.label}</button>)}</div>
      {item != null && !busy && (tab?.sections ?? config.sections).filter(visible).map((section, index) =>
        <section key={index} className={cn('space-y-2', section.className)}>
          {section.title && <h3 className="font-medium">{section.title}</h3>}
          {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
          <div className={cn('grid gap-4', columns[section.columns ?? 1])}>{section.fields.filter(visible).map(field => {
            const { key, render, show: _show, value, ...props } = field;
            const raw = item?.[key];
            const content = render ? render(item) : value !== undefined ? value : raw == null ? '-' : String(raw);
            return <Info key={key} {...props} value={typeof content === 'number' || typeof content === 'boolean' ? String(content) : content} />;
          })}</div>
        </section>)}
      {item != null && !busy && <div className="flex flex-wrap gap-2">{config.actions?.filter(visible).map(button =>
        <Button key={button.id} type="button" variant={button.variant} color={button.color} leftIcon={button.icon}
          disabled={action !== null} loading={action === button.id} onClick={() => void run(button)}>{button.label}</Button>)}</div>}
    </div>
  </Modal>;
}
