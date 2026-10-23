# Gráficos

Os componentes são importados de `@matheusssousa/ui` ou `@matheusssousa/ui/components/chart`. Importe também os estilos da biblioteca, conforme o README.

| Componente | Uso e variantes |
| --- | --- |
| `LineChart` | Linhas `linear`, `smooth` ou `step`; pontos, preenchimento e gradiente opcionais |
| `AreaChart` | Área com gradiente ou preenchimento sólido e opacidade configurável |
| `BarChart` | Barras verticais ou `horizontal`, valores negativos, raio e espaçamento |
| `PieChart` | Participação por categoria, separação entre setores e destaque no hover |
| `DonutChart` | Pie com centro personalizável e valor da categoria ativa |
| `SparklineChart` | Tendência sem eixos, ideal para cards (`className="h-16"`) |
| `RadarChart` | Comparação de dimensões numa escala comum; use pelo menos três categorias |
| `RadialBarChart` | Progresso em anéis concêntricos; `maxValue` define a meta comum |

Todos aceitam `variant="default | outlined | filled | minimal | elevated | soft"`, `size="sm | md | lg | xl"`, tooltip, formatação, legenda e eventos. O tamanho total inclui cabeçalho e legenda. O desenho acompanha mudanças no container com `ResizeObserver`; use uma altura suficiente para o conteúdo. `minimal` tem fundo transparente, facilitando a composição dentro de cards existentes.

## Despesas: donut sem textos sobrepostos

```tsx
const moeda = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

<DonutChart
  data={[{ label: 'Restaurante', value: 2.5 }]}
  title="Para onde foi"
  subtitle="Distribuição das despesas do mês."
  variant="minimal"
  size="lg"
  valueFormatter={moeda}
  centerLabel="Despesas"
  showLegend
/>
```

O centro mostra o total em repouso e a categoria no hover/foco. `activeCenter={false}` mantém o total. `centerValue` substitui apenas o valor; `centerContent` substitui **todo** o conteúdo central. Para inserir um centro externo já existente, use `showCenter={false}` e evite duplicar textos. O anel de uma categoria não tem emenda. Categorias pequenas ficam no tooltip/legenda, evitando sobreposição de rótulos de setores.

## Linhas, áreas e barras

```tsx
<AreaChart
  data={gastosDiarios}
  title="O ritmo dos seus gastos"
  valueFormatter={moeda}
  color="primary"
  curve="linear"
  fillOpacity={0.25}
  showDots={false}
  variant="minimal"
  size="lg"
/>

<BarChart data={categorias} horizontal palette="ocean" barGap={0.35} />
<LineChart data={saldo} curve="step" color="#8b7cf8" />
<SparklineChart data={saldo} fillArea className="h-16" aria-label="Tendência do saldo" />
<RadarChart data={indicadores} maxValue={100} />
<RadialBarChart data={metas} maxValue={100} legendPosition="right" />
```

`color` aceita CSS ou tokens semânticos (`primary`, `secondary`, `success`, etc.). `colors` aceita uma paleta própria; `palette` oferece `default`, `ocean` e `sunset`. `data[i].color` tem prioridade. Linhas usam uma única cor; pontos podem ter cores explícitas. O padrão utiliza `--chart-1` a `--chart-8`, com cores de fallback.

## Interação e formatação

- `valueFormatter` formata eixos, tooltip, valores e centro; `labelFormatter` formata categorias.
- `legendPosition`: `top`, `bottom` ou `right`. Legendas longas possuem rolagem.
- `showTooltip={false}` desativa o tooltip; `renderTooltip` recebe `{ data, index, color, percentage }` para conteúdo próprio.
- `onDataPointClick(point, index)` recebe o índice original do array, mesmo quando valores inválidos são filtrados.
- Setores, pontos, barras e legenda aceitam foco por teclado. Enter/Espaço ativam; Escape fecha o tooltip. Toque também ativa a categoria.
- `animate={false}` desativa transições; a preferência de movimento reduzido é respeitada.

Arrays vazios mostram `emptyMessage`. Valores não finitos são ignorados. Linhas e barras aceitam negativos e zeros, incluindo séries constantes ou de um único ponto. Pie/donut e anéis consideram apenas valores positivos; radar limita valores ao intervalo entre zero e `maxValue`. Valores superiores à meta nos anéis preenchem o círculo, mantendo o valor real no tooltip. Não há suporte a múltiplas séries agrupadas/empilhadas nesta API.
