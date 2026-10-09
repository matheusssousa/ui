export interface FormatBytesOptions { decimals?: number; binary?: boolean; fallback?: string; locale?: string; }

export function formatBytes(bytes: number | string | null | undefined, options: FormatBytesOptions = {}): string {
    const { decimals = 1, binary = true, fallback = '—', locale = 'pt-BR' } = options;
    const value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return fallback;
    if (value === 0) return '0 B';
    const base = binary ? 1024 : 1000;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(base)), sizes.length - 1);
    const amount = value / Math.pow(base, index);
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: Math.max(0, decimals) }).format(amount)} ${sizes[index]}`;
}
