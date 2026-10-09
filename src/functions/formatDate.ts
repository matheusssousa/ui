import { format, parseISO, formatDistanceToNow, formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const invalidDateResponse = {
    date: 'Data inválida',
    time: '',
    dateTime: '',
    textDate: '',
    textDateTime: '',
    relative: '',
    calendar: '',
    iso: '',
    dayOfWeek: '',
    monthName: '',
    remaining: '',
};

type DateInput = string | number | Date;

function parseDateInput(dateInput: DateInput | null | undefined): Date | null {
    if (dateInput === null || dateInput === undefined || dateInput === '') return null;
    const date = typeof dateInput === 'string'
        ? parseISO(dateInput)
        : dateInput instanceof Date
            ? new Date(dateInput.getTime())
            : new Date(dateInput);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(dateInput: DateInput) {
    try {
        let date: Date;

        if (typeof dateInput === 'string') {
            date = parseISO(dateInput);
        } else if (typeof dateInput === 'number') {
            date = new Date(dateInput); // Aceita timestamp (ex: Date.now())
        } else if (dateInput instanceof Date) {
            date = dateInput; // Aceita objetos Date diretamente
        } else {
            throw new Error('Invalid input type');
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid Date');
        }

        return {
            // Formatos padrão
            date: format(date, 'dd/MM/yyyy', { locale: ptBR }),
            time: format(date, 'HH:mm', { locale: ptBR }),
            dateTime: format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
            
            // Formatos por extenso
            textDate: format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
            textDateTime: format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR }),

            // Formatos relativos
            relative: formatDistanceToNow(date, { locale: ptBR, addSuffix: true }),

            // Formato de Calendário (ex: "ontem às 14:30")
            calendar: formatRelative(date, new Date(), { locale: ptBR }),

            // Formatos Padrão e Componentes
            iso: date.toISOString(), // Formato universal ISO 8601
            dayOfWeek: format(date, 'EEEE', { locale: ptBR }), // ex: "quarta-feira"
            monthName: format(date, 'MMMM', { locale: ptBR }), // ex: "setembro"

            // Dias restantes para a data
            remaining: formatDistanceToNow(date, { locale: ptBR }),
        };
    } catch (error) {
        return invalidDateResponse;
    }
}

function formatDaysRemaining(days: number) {
    try {
        if (typeof days !== 'number' || isNaN(days)) {
            throw new Error('Invalid input type');
        }

        const roundedDays = Math.floor(Math.max(0, days));

        return {
            // Número inteiro de dias
            number: roundedDays,
            
            // Texto formatado
            text: roundedDays === 0 
                ? 'menos de 1 dia' 
                : roundedDays === 1 
                ? '1 dia' 
                : `${roundedDays} dias`,
            
            // Apenas o valor numérico como string
            value: roundedDays.toString(),
            
            // Texto curto para badges
            short: roundedDays === 0 
                ? '<1' 
                : roundedDays.toString(),
        };
    } catch (error) {
        return {
            number: 0,
            text: 'Data inválida',
            value: '0',
            short: '0',
        };
    }
}

function formatDateValue(dateInput: DateInput | null | undefined, pattern = 'dd/MM/yyyy', fallback = '—'): string {
    const date = parseDateInput(dateInput);
    return date ? format(date, pattern, { locale: ptBR }) : fallback;
}

function formatDateRange(start: DateInput | null | undefined, end: DateInput | null | undefined, pattern = 'dd/MM/yyyy'): string {
    const formattedStart = formatDateValue(start, pattern, '');
    const formattedEnd = formatDateValue(end, pattern, '');
    if (!formattedStart) return formattedEnd;
    if (!formattedEnd || formattedStart === formattedEnd) return formattedStart;
    return `${formattedStart} – ${formattedEnd}`;
}

function isValidDate(dateInput: DateInput | null | undefined): boolean {
    return parseDateInput(dateInput) !== null;
}

function isToday(dateInput: DateInput | null | undefined): boolean {
    const date = parseDateInput(dateInput);
    const today = new Date();
    return !!date && date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export { formatDate, formatDaysRemaining, formatDateValue, formatDateRange, parseDateInput, isValidDate, isToday };
