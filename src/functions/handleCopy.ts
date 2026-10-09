/**
 * Copia um valor para a área de transferência e executa callbacks de sucesso ou erro.
 * @param value O valor (string ou número) a ser copiado.
 * @param onSuccess Callback a ser executado em caso de sucesso.
 * @param onError Callback a ser executado em caso de erro.
 */
const handleCopy = (
    value: string | number,
    onSuccess?: () => void,
    onError?: (error: any) => void
) => {
    if (value === null || value === undefined) {
        onError?.(new Error("O valor a ser copiado é nulo ou indefinido."));
        return;
    }

    navigator.clipboard.writeText(String(value))
        .then(() => {
            onSuccess?.();
        })
        .catch((err) => {
            console.error("Falha ao copiar para a área de transferência:", err);
            onError?.(err);
        });
};

export { handleCopy };