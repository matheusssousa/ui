export const capitalize = (value: string | null | undefined): string => value ? value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1) : '';
export const titleCase = (value: string | null | undefined): string => value ? value.toLocaleLowerCase('pt-BR').replace(/(^|\s)\S/g, letter => letter.toLocaleUpperCase('pt-BR')) : '';
export const initials = (value: string | null | undefined, limit = 2): string => value ? value.trim().split(/\s+/).slice(0, limit).map(part => part[0]?.toLocaleUpperCase('pt-BR')).join('') : '';
export const truncate = (value: string | null | undefined, maxLength = 80, suffix = '…'): string => !value || value.length <= maxLength ? value ?? '' : `${value.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd()}${suffix}`;
export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
export const normalizeSearchText = (value: string | null | undefined): string => value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim() ?? '';
export const maskEmail = (email: string | null | undefined): string => {
  if (!email || !email.includes('@')) return email ?? '';
  const [name, domain] = email.split('@');
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(2, name.length - 2))}@${domain}`;
};

