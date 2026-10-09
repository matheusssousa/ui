export interface FormatTimeOptions {
  includeSeconds?: boolean;
  fallback?: string;
  locale?: string;
  hour12?: boolean;
}

export const parseTimeToMinutes = (time: string | null | undefined): number | null => {
  if (!time) return null;
  if (/^\d+$/.test(time.trim())) return Number(time.trim());
  const match = time.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number, includeSeconds = false): string => {
  if (!Number.isFinite(minutes)) return '';
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60).toString().padStart(2, '0');
  const mins = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${mins}${includeSeconds ? ':00' : ''}`;
};

export const formatTime = (value: string | number | Date | null | undefined, options: FormatTimeOptions = {}): string => {
  const { includeSeconds = false, fallback = '', locale = 'pt-BR', hour12 = false } = options;
  if (value instanceof Date || typeof value === 'number') {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: includeSeconds ? '2-digit' : undefined, hour12 }).format(date);
  }
  const minutes = parseTimeToMinutes(value);
  if (minutes === null) return fallback;
  return minutesToTime(minutes, includeSeconds);
};

export const formatTimeRange = (start: string | null | undefined, end: string | null | undefined, separator = '–'): string => {
  const formattedStart = formatTime(start);
  const formattedEnd = formatTime(end);
  if (!formattedStart) return formattedEnd;
  if (!formattedEnd) return formattedStart;
  return `${formattedStart} ${separator} ${formattedEnd}`;
};

export const formatDuration = (minutes: number, options: { compact?: boolean; fallback?: string; type?: 'time' | 'duration'; returnTypeTime?: 'milliseconds' | 'seconds' | 'minutes' | 'hours' } = {}): string | number => {
  if (!Number.isFinite(minutes) || minutes < 0) return options.fallback ?? '—';
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  
  if (options.returnTypeTime) {
    switch (options.returnTypeTime) {
      case 'milliseconds':
        return total * 60 * 1000;
      case 'seconds':
        return total * 60;
      case 'minutes':
        return total;
      case 'hours':
        return total / 60;
      default:
        return total;
    }
  }
  
  if (options.type === 'time') return formatTime(minutesToTime(total), { includeSeconds: false });
  if (options.type === 'duration') {
    if (options.compact) return [hours ? `${hours}h` : '', mins ? `${mins}min` : ''].filter(Boolean).join(' ') || '0min';
    if (!hours) return `${mins} minuto${mins === 1 ? '' : 's'}`;
    if (!mins) return `${hours} hora${hours === 1 ? '' : 's'}`;
    return `${hours}h ${mins}min`;
  }
  return [hours ? `${hours}h` : '', mins ? `${mins}min` : ''].filter(Boolean).join(' ') || '0min';
};

export default formatTime;
