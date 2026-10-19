/** Decimal monetario canonico como string, sem aritmetica de ponto flutuante. */
export function parseTableMoney(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const text = String(value).trim().replace(/^R\$\s*/, '').replace(/\s/g, '');
  // Comma denotes Brazilian decimals; dot-only input is canonical decimal.
  const normalized = text.includes(',')
    ? (/^-?(?:\d+|\d{1,3}(?:\.\d{3})+),\d{0,2}$/.test(text) ? text.replace(/\./g, '').replace(',', '.') : '')
    : text;
  if (!/^-?\d+(?:\.\d{0,2})?$/.test(normalized)) throw new Error('Valor monet\u00e1rio inv\u00e1lido');
  const negative = normalized.startsWith('-');
  const [integer, fraction = ''] = normalized.replace(/^-/, '').split('.');
  const whole = integer.replace(/^0+(?=\d)/, '');
  const cents = fraction.padEnd(2, '0');
  return (negative && (whole !== '0' || cents !== '00') ? '-' : '') + whole + '.' + cents;
}

export function formatTableMoney(value: unknown, currency = 'BRL'): string {
  const decimal = parseTableMoney(value);
  if (decimal === undefined) return '';
  const [integer, fraction] = decimal.split('.');
  const sign = integer.startsWith('-') ? '-' : '';
  const whole = integer.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + (currency === 'BRL' ? 'R$' : currency) + '\u00a0' + whole + ',' + fraction;
}

export function parseTableDate(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const text = String(value);
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!parts) throw new Error('Data inv\u00e1lida');
  const year = Number(parts[1]), month = Number(parts[2]), day = Number(parts[3]);
  const date = new Date(0); date.setUTCFullYear(year, month - 1, day); date.setUTCHours(0, 0, 0, 0);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Data inv\u00e1lida');
  return text;
}

export function formatTableDate(value: unknown): string {
  const date = parseTableDate(value);
  return date ? date.slice(8, 10) + '/' + date.slice(5, 7) + '/' + date.slice(0, 4) : '';
}
