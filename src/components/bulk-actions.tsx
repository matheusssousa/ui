import { Button } from "./button.js";
import { Badge } from "./badge.js";
import type { UIColor } from './theme.js';

/** Barra de ações para uma seleção de itens. */
export interface BulkActionsProps<T> {
    /** Itens atualmente selecionados; a barra fica oculta se estiver vazio. */
    selectedItems: T[];
    /** Tone do contador e do botão de limpar a seleção. */
    color?: UIColor;
    /** Limpa a seleção. */
    onClearSelection: () => void;
    /** Exclui os itens selecionados. */
    onBulkDelete?: () => void;
    /** Restaura os itens selecionados. */
    onBulkRestore?: () => void;
    /** Exclui permanentemente os itens selecionados. */
    onBulkForceDelete?: () => void;
    /** Altera o status dos itens selecionados. */
    onBulkStatusChange?: () => void;
    /** Suspende os itens selecionados. */
    onBulkSuspend?: () => void;
}

export function BulkActions<T>({
    selectedItems,
    color = 'info',
    onClearSelection,
    onBulkDelete,
    onBulkRestore,
    onBulkForceDelete,
    onBulkStatusChange,
    onBulkSuspend,
}: BulkActionsProps<T>) {
    if (selectedItems.length === 0) return null;

    return (
        <div className="flex items-center justify-between">
            <Badge variant="info" color={color}>{selectedItems.length} selecionados</Badge>
            <div className="flex space-x-2">
                {onBulkRestore && (
                    <Button variant="filled" color={"green"} onClick={onBulkRestore}>
                        Restaurar
                    </Button>
                )}
                {onBulkForceDelete && (
                    <Button variant="filled" color={"red"} onClick={onBulkForceDelete}>
                        Forçar Exclusão
                    </Button>
                )}
                {onBulkDelete && (
                    <Button variant="filled" color={"red"} onClick={onBulkDelete}>
                        Excluir
                    </Button>
                )}
                {onBulkStatusChange && (
                    <Button variant="filled" color={"blue"} onClick={onBulkStatusChange} className="text-nowrap">
                        Alterar Status
                    </Button>
                )}
                {onBulkSuspend && (
                    <Button variant="filled" color={"amber"} onClick={onBulkSuspend} className="text-nowrap">
                        Suspender
                    </Button>
                )}
                <Button variant="outlined" color={color} onClick={onClearSelection} className="text-nowrap">
                    Desmarcar
                </Button>
            </div>
        </div>
    );
}

