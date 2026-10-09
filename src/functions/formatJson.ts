/**
 * Formata um objeto JavaScript ou uma string JSON para uma string formatada e legível.
 * @param data - O objeto ou string JSON a ser formatado.
 * @returns Uma string JSON formatada ou uma mensagem de erro/aviso.
 */
interface FormatJsonOptions { indentation?: number; fallback?: string; sortKeys?: boolean; redactKeys?: string[]; }

function formatJson(data: unknown, options: FormatJsonOptions = {}): string {
  const { indentation = 2, fallback = 'N/A', sortKeys = false, redactKeys = [] } = options;
  if (!data) {
    return fallback;
  }

  let objectToFormat;

  // Se 'data' for uma string, tente fazer o parse.
  if (typeof data === 'string') {
    try {
      objectToFormat = JSON.parse(data);
    } catch (error) {
      // Se não for um JSON válido, retorne a própria string.
      return data;
    }
  } else if (typeof data === 'object') {
    // Se já for um objeto, use-o diretamente.
    objectToFormat = data;
  } else {
    // Se for qualquer outro tipo, retorne como string.
    return String(data);
  }

  // Verifique se o objeto resultante está vazio.
  if (Object.keys(objectToFormat).length === 0) {
    return fallback;
  }

  // Formate o objeto com indentação.
  try {
    const seen = new WeakSet<object>();
    const redacted = new Set(redactKeys.map(key => key.toLocaleLowerCase('pt-BR')));
    return JSON.stringify(objectToFormat, (key, value) => {
      if (redacted.has(key.toLocaleLowerCase('pt-BR'))) return '[REDACTED]';
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
        if (sortKeys && !Array.isArray(value)) return Object.keys(value).sort().reduce<Record<string, unknown>>((result, currentKey) => { result[currentKey] = value[currentKey]; return result; }, {});
      }
      return value;
    }, indentation);
  } catch (error) {
    return 'Erro ao formatar o JSON.';
  }
}

export { formatJson };
export type { FormatJsonOptions };
