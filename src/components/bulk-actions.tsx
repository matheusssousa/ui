import { Button } from "./button.js";
import { Badge } from "./badge.js";

interface BulkActionsProps<T> {
    selectedItems: T[];
    onClearSelection: () => void;
    onBulkDelete?: () => void;
    onBulkRestore?: () => void;
    onBulkForceDelete?: () => void;
    onBulkStatusChange?: () => void;
    onBulkSuspend?: () => void;
}

export function BulkActions<T>({
    selectedItems,
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
            <Badge variant="info">{selectedItems.length} selecionados</Badge>
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
                <Button variant="outlined" onClick={onClearSelection} className="text-nowrap">
                    Desmarcar
                </Button>
            </div>
        </div>
    );
}

