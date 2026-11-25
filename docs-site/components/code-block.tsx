'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from '@phosphor-icons/react/dist/ssr';

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-neutral text-neutral-foreground">
      <button type="button" onClick={copy} className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20" aria-label="Copiar código">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre className="overflow-x-auto p-5 pr-14 text-sm leading-7"><code>{code}</code></pre>
    </div>
  );
}
