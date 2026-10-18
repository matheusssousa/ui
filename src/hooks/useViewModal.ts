'use client';
import { useCallback, useState } from 'react';
import type { ViewField, ViewModalConfig, ViewSection } from '../components/view-modal.js';

export function useViewModal<T>(configs: Record<string, ViewModalConfig<T>> = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | undefined>();
  const open = useCallback((item?: T) => { setData(item); setIsOpen(true); }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const createConfig = (key: string, overrides?: Partial<ViewModalConfig<T>>): ViewModalConfig<T> => {
    if (!configs[key]) throw new Error(`Configuração de modal desconhecida: ${key}`);
    return { ...configs[key], ...overrides };
  };
  return { isOpen, data, open, close, setData, configs, createConfig,
    createCustomConfig: (config: ViewModalConfig<T>) => config,
    modalProps: { isOpen, data, onClose: close } };
}
export const ViewModalUtils = {
  simple<T>(fields: ViewField<T>[]): ViewModalConfig<T> { return { sections: [{ columns: 2, fields }] }; },
  multiSection<T>(sections: ViewSection<T>[]): ViewModalConfig<T> { return { sections }; },
};
