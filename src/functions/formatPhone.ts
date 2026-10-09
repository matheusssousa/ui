/**
 * Formata um número de telefone brasileiro com DDD
 * Suporta números com 10 dígitos (fixo) ou 11 dígitos (celular)
 * 
 * @param phone - Número de telefone (pode conter caracteres não numéricos)
 * @returns Telefone formatado no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 * 
 * @example
 * formatPhone('11987654321') // Retorna: (11) 98765-4321
 * formatPhone('1133334444') // Retorna: (11) 3333-4444
 * formatPhone('(11) 98765-4321') // Retorna: (11) 98765-4321
 */
export function formatPhone(phone: string | number | null | undefined): string | number {
    if (!phone) return '';

    // Converte para string se for número
    const phoneStr = String(phone);

    // Remove todos os caracteres não numéricos
    const numbers = phoneStr.replace(/\D/g, '');

    // Se não tiver números suficientes, retorna vazio
    if (numbers.length < 10) return phoneStr;

    // Extrai DDD e número
    const ddd = numbers.slice(0, 2);
    
    // Verifica se é celular (11 dígitos) ou fixo (10 dígitos)
    if (numbers.length === 11) {
        // Celular: (XX) XXXXX-XXXX
        const part1 = numbers.slice(2, 7);
        const part2 = numbers.slice(7, 11);
        return `(${ddd}) ${part1}-${part2}`;
    } else if (numbers.length === 10) {
        // Fixo: (XX) XXXX-XXXX
        const part1 = numbers.slice(2, 6);
        const part2 = numbers.slice(6, 10);
        return `(${ddd}) ${part1}-${part2}`;
    }

    // Se tiver mais de 11 dígitos, formata apenas os 11 primeiros
    if (numbers.length > 11) {
        const truncated = numbers.slice(0, 11);
        const part1 = truncated.slice(2, 7);
        const part2 = truncated.slice(7, 11);
        return `(${ddd}) ${part1}-${part2}`;
    }

    return phone;
}

/**
 * Remove a formatação do telefone, retornando apenas os números
 * 
 * @param phone - Telefone formatado
 * @returns Apenas os números do telefone
 * 
 * @example
 * unformatPhone('(11) 98765-4321') // Retorna: '11987654321'
 */
export function unformatPhone(phone: string | null | undefined): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
}

/**
 * Valida se um telefone brasileiro é válido
 * 
 * @param phone - Número de telefone
 * @returns true se o telefone for válido
 * 
 * @example
 * isValidPhone('11987654321') // Retorna: true
 * isValidPhone('119876') // Retorna: false
 */
export function isValidPhone(phone: string | null | undefined): boolean {
    if (!phone) return false;
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
}

/**
 * Formata o telefone enquanto o usuário digita (mask)
 * Útil para inputs controlados
 * 
 * @param value - Valor atual do input
 * @returns Valor formatado
 * 
 * @example
 * maskPhone('1198765') // Retorna: (11) 98765
 * maskPhone('11987654321') // Retorna: (11) 98765-4321
 */
export function maskPhone(value: string): string {
    if (!value) return '';

    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara progressivamente
    if (numbers.length <= 2) {
        return numbers;
    }
    
    if (numbers.length <= 6) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    
    if (numbers.length <= 10) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    // Para 11 dígitos (celular)
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}
