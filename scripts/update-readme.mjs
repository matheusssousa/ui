import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const file = path.join(root, 'README.md');
const start = '<!-- API-REFERENCE:START -->';
const end = '<!-- API-REFERENCE:END -->';
let content = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const sections = [start, '## Referência completa da API', '',
  'Gerada das declarações TypeScript da biblioteca por `npm run docs`. Abra um módulo para consultar todos os tipos, props, variantes, argumentos e retornos. Tipos herdados de React/HTML mantêm o contrato da dependência indicada. As declarações auxiliares sem `export` aparecem somente para explicar os tipos públicos.', '',
  'Cada título indica o subcaminho de importação; use `@matheusssousa/ui/` antes dele. Para `functions/serverFetch`, prefira a entrada `@matheusssousa/ui/server`. As declarações do índice ao final mostram exatamente quais nomes também estão disponíveis pela raiz.', ''];
for (const directory of ['components', 'hooks', 'providers', 'functions', 'types']) {
  sections.push(`### ${directory}`, '');
  for (const name of readdirSync(path.join(root, 'dist', directory)).filter(n => n.endsWith('.d.ts')).sort()) {
    const module = `${directory}/${name.replace(/\.d\.ts$/, '')}`;
    const declarations = readFileSync(path.join(root, 'dist', directory, name), 'utf8').trim();
    sections.push('<details>', `<summary><code>${module}</code></summary>`, '',
      `Fonte: [${module}](src/${module}.${directory === 'components' && !['data-types', 'gradient', 'theme'].includes(name.replace(/\.d\.ts$/, '')) || directory === 'providers' ? 'tsx' : 'ts'}).`, '',
      '```ts', declarations, '```', '', '</details>', '');
  }
}
sections.push('### Exports da raiz', '', '```ts', readFileSync(path.join(root, 'dist/index.d.ts'), 'utf8').trim(), '```', '', end);
const generated = sections.join('\n');
if (content.includes(start)) content = content.slice(0, content.indexOf(start)) + generated + content.slice(content.indexOf(end) + end.length);
else content = content.trimEnd() + '\n\n' + generated + '\n';

const tocStart = '<!-- TOC:START -->', tocEnd = '<!-- TOC:END -->';
const slug = title => title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
const toc = [tocStart, '## Sumário', '', ...[...content.matchAll(/^## (.+)$/gm)]
  .map(match => match[1]).filter(title => title !== 'Sumário')
  .map(title => `- [${title}](#${slug(title)})`), '', tocEnd].join('\n');
if (content.includes(tocStart)) content = content.slice(0, content.indexOf(tocStart)) + toc + content.slice(content.indexOf(tocEnd) + tocEnd.length);
else { const position = content.indexOf('\n## '); content = content.slice(0, position) + '\n\n' + toc + '\n' + content.slice(position); }
if (process.argv.includes('--check')) {
  if (content !== readFileSync(file, 'utf8').replace(/\r\n/g, '\n')) {
    console.error('README desatualizado. Execute npm run docs.'); process.exitCode = 1;
  } else console.log('README e referencia de API atualizados.');
} else { writeFileSync(file, content); console.log('README atualizado.'); }
