export type StatusVariant = "success" | "destructive" | "warning" | "info" | "default" | "scheduled";
export interface StatusMeta { text: string; label: string; color: string; variant: StatusVariant; normalized: string }

export function getStatusBadge(status: string | null | undefined): { text: string; color: string; variant: StatusVariant } {
    const statusMap: { [key: string]: { text: string; color: string, variant: "success" | "destructive" | "warning" | "info" | "default" | "scheduled" } } = {
        active: {
            text: 'Ativo',
            color: 'green',
            variant: 'success',
        },
        inactive: {
            text: 'Inativo',
            color: 'red',
            variant: 'destructive',
        },
        pending: {
            text: 'Pendente',
            color: 'amber',
            variant: 'warning',
        },
        suspended: {
            text: 'Suspenso',
            color: 'amber',
            variant: 'warning',
        },
        deleted: {
            text: 'Deletado',
            color: 'red',
            variant: 'destructive',
        },
        verified: {
            text: 'Verificado',
            color: 'blue',
            variant: 'info',
        },
        blocked: {
            text: 'Bloqueado',
            color: 'red',
            variant: 'destructive',
        },
        rejected: {
            text: 'Rejeitado',
            color: 'red',
            variant: 'destructive',
        },
        cancelled: {
            text: 'Cancelado',
            color: 'red',
            variant: 'destructive',
        },
        completed: {
            text: 'Completo',
            color: 'green',
            variant: 'success',
        },
        no_show: {
            text: 'Não Compareceu',
            color: 'red',
            variant: 'destructive',
        },
        payment_pending: {
            text: 'Pagamento Pendente',
            color: 'amber',
            variant: 'warning',
        },
        payment_confirmed: {
            text: 'Pagamento Confirmado',
            color: 'green',
            variant: 'success',
        },
        trialing: {
            text: 'Em Teste',
            color: 'blue',
            variant: 'info',
        },
        demo: {
            text: 'Demo',
            color: 'purple',
            variant: 'info',
        },
        expired: {
            text: 'Expirado',
            color: 'amber',
            variant: 'warning',
        },
        past_due: {
            text: 'Vencido',
            color: 'red',
            variant: 'destructive',
        },
        upcoming: {
            text: 'Próximo',
            color: 'blue',
            variant: 'info',
        },
        unpaid: {
            text: 'Não Pago',
            color: 'red',
            variant: 'destructive',
        },
        paid: {
            text: 'Pago',
            color: 'green',
            variant: 'success',
        },
        paused: {
            text: 'Pausado',
            color: 'amber',
            variant: 'warning',
        },
        refunded: {
            text: 'Reembolsado',
            color: 'green',
            variant: 'success',
        },
        charged_back: {
            text: 'Chargeback',
            color: 'red',
            variant: 'destructive',
        },
        incomplete: {
            text: 'Incompleto',
            color: 'amber',
            variant: 'warning',
        },
        incomplete_expired: {
            text: 'Incompleto e Expirado',
            color: 'amber',
            variant: 'warning',
        },
        overdue: {
            text: 'Vencido',
            color: 'red',
            variant: 'destructive',
        },
        pending_payment: {
            text: 'Pendente de Pagamento',
            color: 'amber',
            variant: 'warning',
        },
        payment_failed: {
            text: 'Pagamento Falhou',
            color: 'red',
            variant: 'destructive',
        },
        payment_refunded: {
            text: 'Pagamento Reembolsado',
            color: 'green',
            variant: 'success',
        },   
        canceled: {
            text: 'Cancelado',
            color: 'red',
            variant: 'destructive',
        },
        other: {
            text: 'Outro',
            color: 'gray',
            variant: 'default',
        },
        scheduled: {
            text: 'Agendado',
            color: 'blue',
            variant: 'scheduled',
        },
        info: {
            text: 'Info',
            color: 'blue',
            variant: 'info',
        },
        error: {
            text: 'Erro',
            color: 'red',
            variant: 'destructive',
        },
        success: {
            text: 'Sucesso',
            color: 'green',
            variant: 'success',
        },
        warning: {
            text: 'Aviso',
            color: 'amber',
            variant: 'warning',
        },
        default: {
            text: 'Padrão',
            color: 'gray',
            variant: 'default',
        },
        authorized: {
            text: 'Autorizado',
            color: 'green',
            variant: 'success',
        },
        processed: {
            text: 'Processado',
            color: 'green',
            variant: 'success',
        },
        recycling: {
            text: 'Tentando Reprocessar',
            color: 'amber',
            variant: 'warning',
        },
        failed: {
            text: 'Falhou',
            color: 'red',
            variant: 'destructive',
        },
        created: {
            text: 'Criado',
            color: 'green',
            variant: 'success',
        },
        updated: {
            text: 'Atualizado',
            color: 'blue',
            variant: 'info',
        },
        debug: {
            text: 'Debug',
            color: 'gray',
            variant: 'default',
        },
        notice: {
            text: 'Aviso',
            color: 'amber',
            variant: 'warning',
        },
        alert: {
            text: 'Alerta',
            color: 'red',
            variant: 'destructive',
        },
        critical: {
            text: 'Crítico',
            color: 'red',
            variant: 'destructive',
        },
        emergency: {
            text: 'Emergência',
            color: 'red',
            variant: 'destructive',
        },
        approved: {
            text: 'Aprovado',
            color: 'blue',
            variant: 'info',
        },
        running: {
            text: 'Em Execução',
            color: 'blue',
            variant: 'info',
        },
        skipped: {
            text: 'Ignorado',
            color: 'gray',
            variant: 'default',
        },
        published: {
            text: 'Publicado',
            color: 'green',
            variant: 'success',
        },
        draft: {
            text: 'Rascunho',
            color: 'gray',
            variant: 'default',
        },
        archived: {
            text: 'Arquivado',
            color: 'gray',
            variant: 'default',
        }
    };

    const normalizedStatus = String(status ?? '').trim().toLocaleLowerCase('pt-BR').replace(/[\s-]+/g, '_');
    return statusMap[normalizedStatus] || {
        text: normalizedStatus ? normalizedStatus.replace(/_/g, ' ') : 'Desconhecido',
        color: 'gray',
        variant: 'default',
    };
}

export const getStatusLabel = (status: string | null | undefined, fallback?: string): string => {
    const meta = getStatusBadge(status);
    return meta.text === 'Desconhecido' && fallback ? fallback : meta.text;
};

export const getStatusMeta = (status: string | null | undefined): StatusMeta => {
    const normalized = String(status ?? '').trim().toLocaleLowerCase('pt-BR').replace(/[\s-]+/g, '_');
    const badge = getStatusBadge(normalized);
    return { ...badge, label: badge.text, normalized };
};

export const isPositiveStatus = (status: string | null | undefined): boolean => getStatusBadge(status).variant === 'success';
export const isNegativeStatus = (status: string | null | undefined): boolean => getStatusBadge(status).variant === 'destructive';
export const isPendingStatus = (status: string | null | undefined): boolean => ['warning', 'scheduled'].includes(getStatusBadge(status).variant);

