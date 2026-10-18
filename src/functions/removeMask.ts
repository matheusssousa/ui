/**
 * Remove todos os caracteres não numéricos de uma string
 * Útil para remover máscaras de telefone, CPF, CNPJ, CEP, etc.
 */
export const removeMask = (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/\D/g, '');
};

export const keepAlphaNumeric = (value: string | number | undefined | null): string => value == null ? '' : String(value).replace(/[^a-zA-Z0-9]/g, '');
export const removeDiacritics = (value: string | null | undefined): string => value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';

/**
 * Remove máscaras de múltiplos campos de um objeto
 */
export const removeMaskFromFields = <T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
): T => {
    const result = { ...data };
    fields.forEach(field => {
        if (result[field]) {
            result[field] = removeMask(result[field]) as any;
        }
    });
    return result;
};

export const transformFields = <T extends Record<string, unknown>>(data: T, fields: (keyof T)[], transformer: (value: unknown, field: keyof T) => unknown): T => {
    const result = { ...data };
    fields.forEach(field => { result[field] = transformer(result[field], field) as T[keyof T]; });
    return result;
};
