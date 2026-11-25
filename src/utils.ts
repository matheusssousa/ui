import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
/**
 * Combina classes condicionais e resolve conflitos entre utilitários Tailwind.
 *
 * @param inputs - Classes e condições aceitas por `clsx`.
 * @returns Classes consolidadas para aplicação ao elemento.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

