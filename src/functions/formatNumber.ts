export interface FormatNumberOptions extends Intl.NumberFormatOptions {
  locale?: string;
  fallback?: string;
}

export function formatNumber(value: number | string | null | undefined, options: FormatNumberOptions = {}): string {
  const { locale = 'pt-BR', fallback = '—', ...intlOptions } = options;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? new Intl.NumberFormat(locale, intlOptions).format(parsed) : fallback;
}

export const formatCompactNumber = (value: number | string | null | undefined, options: FormatNumberOptions = {}) =>
  formatNumber(value, { notation: 'compact', maximumFractionDigits: 1, ...options });

export const formatPercentage = (value: number | string | null | undefined, options: FormatNumberOptions & { alreadyPercent?: boolean } = {}) => {
  const { alreadyPercent = true, ...rest } = options;
  const parsed = Number(value);
  return formatNumber(alreadyPercent ? parsed / 100 : parsed, { style: 'percent', maximumFractionDigits: 1, ...rest });
};

export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
export const calculatePercentage = (value: number, total: number, precision = 1) => total > 0 ? Number(((value / total) * 100).toFixed(precision)) : 0;

