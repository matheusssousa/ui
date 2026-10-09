export interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  locale?: string;
  currency?: string;
  fallback?: string;
  fromCents?: boolean;
}
const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(value: number | string | null | undefined, options: FormatCurrencyOptions = {}): string {
  const { locale = 'pt-BR', currency = 'BRL', fallback = '—', fromCents = false, ...intlOptions } = options;
  const parsed = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  if (!Number.isFinite(parsed)) return fallback;

  const normalizedValue = fromCents ? parsed / 100 : parsed;
  const config: Intl.NumberFormatOptions = { style: 'currency', currency, ...intlOptions };
  const key = `${locale}:${currency}:${JSON.stringify(config)}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, config);
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(normalizedValue);
}

export function formatCurrencyCompact(value: number | string | null | undefined, options: FormatCurrencyOptions = {}): string {
  return formatCurrency(value, { notation: 'compact', maximumFractionDigits: 1, ...options });
}

export function parseCurrency(value: string | number | null | undefined): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const normalized = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function currencyToCents(value: string | number | null | undefined): number {
  return Math.round(parseCurrency(value) * 100);
}
