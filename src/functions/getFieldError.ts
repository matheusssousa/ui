export type ValidationErrors = Record<string, string | string[] | undefined>;

export const getFieldErrors = (fieldName: string, errors?: ValidationErrors): string[] => {
    const value = errors?.[fieldName];
    if (!value) return [];
    return Array.isArray(value) ? value.filter(Boolean) : [value];
};

export const getFieldError = (fieldName: string, errors?: ValidationErrors, fallback?: string): string | undefined => getFieldErrors(fieldName, errors)[0] ?? fallback;
export const hasFieldError = (fieldName: string, errors?: ValidationErrors): boolean => getFieldErrors(fieldName, errors).length > 0;
export const getFirstError = (errors?: ValidationErrors): string | undefined => errors ? Object.keys(errors).flatMap(key => getFieldErrors(key, errors))[0] : undefined;
