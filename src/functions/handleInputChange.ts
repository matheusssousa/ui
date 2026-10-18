import type { Dispatch, SetStateAction } from 'react';
import { getFieldError, type ValidationErrors } from './getFieldError.js';

export const handleInputChange = <T extends object>(
    field: string,
    value: string | number | (string | number)[] | boolean | Date | undefined,
    errors: ValidationErrors | undefined,
    clearFieldError: (fieldName: string) => void,
    setFormData: Dispatch<SetStateAction<T>>,
): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (getFieldError(field, errors)) {
        clearFieldError(field);
    }
};
