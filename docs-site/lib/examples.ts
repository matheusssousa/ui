import path from 'node:path';
import ts from 'typescript';
import type { ComponentDoc } from './registry';

export interface ExampleGroup { name: string; values: (string | number | boolean)[] }

let cachedProgram: ts.Program | undefined;
export function getProgram() {
  if (cachedProgram) return cachedProgram;
  const configPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) throw new Error('tsconfig.json não encontrado');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
  cachedProgram = ts.createProgram(parsed.fileNames, parsed.options);
  return cachedProgram;
}

/** Extrai opções finitas das props, incluindo tipos herdados e variantes CVA. */
export function readExampleGroups(component: ComponentDoc): ExampleGroup[] {
  const program = getProgram();
  const checker = program.getTypeChecker();
  const fileName = component.source;
  const source = program.getSourceFiles().find(file => file.fileName.replaceAll('\\', '/').endsWith(`/components/${fileName}`));
  if (!source) throw new Error(`Fonte ausente: ${fileName}`);
  const name = component.name === 'Input' ? 'TextInputProps' : component.name === 'Chart' ? 'BaseChartProps' : `${component.name}Props`;
  let target: ts.Node | undefined;
  source.forEachChild(node => {
    if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === name) target = node;
  });
  if (!target) return [];
  return checker.getPropertiesOfType(checker.getTypeAtLocation(target)).flatMap(symbol => {
    const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0] ?? target!;
    const native = symbol.declarations?.every(node => node.getSourceFile().fileName.includes('node_modules'));
    if (native && !['disabled', 'readOnly', 'required', 'type'].includes(symbol.name)) return [];
    if (['asChild', 'isOpen', 'isVisible', 'state'].includes(symbol.name)) return [];
    const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
    const parts = type.isUnion() ? type.types : [type];
    const finite = parts.every(part => part.isStringLiteral() || part.isNumberLiteral() || Boolean(part.flags & (ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
    if (!finite && !['gradient', 'headerGradient'].includes(symbol.name)) return [];
    const values = parts.flatMap<string | number | boolean>(part => {
      if (part.isStringLiteral() || part.isNumberLiteral()) return [part.value];
      if (part.flags & ts.TypeFlags.BooleanLiteral) return [checker.typeToString(part) === 'true'];
      return [];
    });
    return values.length ? [{ name: symbol.name, values: [...new Set(values)] }] : [];
  });
}
