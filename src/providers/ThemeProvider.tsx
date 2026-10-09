'use client';

import * as React from 'react';

export type Theme = 'light' | 'dark' | 'system';
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}
export interface ThemeContextValue { theme: Theme; setTheme: (theme: Theme) => void; }
export const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'minte-ui-theme', attribute = 'class', enableSystem = true, disableTransitionOnChange = false }: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme);
  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') setTheme(stored);
  }, [storageKey]);
  React.useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const resolved = theme === 'system' && enableSystem ? (media.matches ? 'dark' : 'light') : theme;
      if (attribute === 'class') { root.classList.remove('light', 'dark'); root.classList.add(resolved); }
      else root.setAttribute(attribute, resolved);
    };
    if (disableTransitionOnChange) root.classList.add('minte-disable-transitions');
    apply();
    if (disableTransitionOnChange) requestAnimationFrame(() => root.classList.remove('minte-disable-transitions'));
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme, attribute, enableSystem, disableTransitionOnChange]);
  const updateTheme = React.useCallback((next: Theme) => { window.localStorage.setItem(storageKey, next); setTheme(next); }, [storageKey]);
  return <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>{children}</ThemeContext.Provider>;
}

