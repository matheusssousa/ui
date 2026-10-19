'use client';

import { createContext, useContext } from 'react';

export const TableStyleContext = createContext<{ size: 'sm' | 'default' | 'lg'; borderless: boolean; spreadsheet?: boolean } | null>(null);
export const useTableStyle = () => useContext(TableStyleContext);

// Applied last so validation and disabled states cannot restore field borders.
export const tableFieldClass = 'border-0! ring-0! outline-none! shadow-none! bg-transparent! focus:ring-0! focus-visible:ring-0! focus:outline-none! focus-visible:outline-none! focus:bg-muted/60! rounded-sm px-2!';
export const tableFieldSizes = { sm: 'h-8! min-h-8! py-1! text-xs!', default: 'h-10! min-h-10! py-2! text-sm!', lg: 'h-12! min-h-12! py-3! text-base!' };
export const tableBadgeClass = 'border-0! ring-0! outline-none! shadow-none! focus:ring-0!';
