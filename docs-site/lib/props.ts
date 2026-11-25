import ts from 'typescript';
import type { ComponentDoc } from './registry';
import { getProgram } from './examples';

export interface PropDoc {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

/** Resolve tipos herdados e separa os contratos de cada modo do Input. */
export function readProps(component: ComponentDoc): PropDoc[] {
  const program = getProgram();
  const checker = program.getTypeChecker();
  const source = program.getSourceFiles().find(file => file.fileName.replaceAll('\\', '/').endsWith(`/components/${component.source}`));
  if (!source) return [];
  const names = component.name === 'Input' ? ['TextInputProps', 'ImageInputProps'] : [component.name === 'Chart' ? 'BaseChartProps' : `${component.name}Props`];
  return names.flatMap(name => {
    const declaration = source.statements.find(node => (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === name);
    if (!declaration) return [];
    return checker.getPropertiesOfType(checker.getTypeAtLocation(declaration)).flatMap(symbol => {
      if (symbol.declarations?.every(node => node.getSourceFile().fileName.includes('node_modules'))) return [];
      const location = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? declaration;
      return [{
        name: names.length > 1 ? `${symbol.name} (${name === 'ImageInputProps' ? 'image' : 'texto'})` : symbol.name,
        type: checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, location), location, ts.TypeFormatFlags.NoTruncation),
        description: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
        required: !(symbol.flags & ts.SymbolFlags.Optional),
      }];
    });
  });
}
