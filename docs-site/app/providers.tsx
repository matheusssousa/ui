'use client';

import { ThemeProvider } from '../../dist/providers/ThemeProvider.js';
import { ToastProvider } from '../../dist/providers/ToastProvider.js';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-docs-theme">
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
