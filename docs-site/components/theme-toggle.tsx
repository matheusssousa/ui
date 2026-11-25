'use client';

import { MoonIcon, SunIcon } from '@phosphor-icons/react/dist/ssr';
import { useTheme } from '../../dist/hooks/useTheme.js';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'}
    >
      {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
