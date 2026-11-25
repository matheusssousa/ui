# Composições inspiradas nas referências

As APIs anteriores continuam disponíveis. `Card`, `Alert`, `Sidebar` e os gráficos recebem a variante `glow`, com cores derivadas do tema. Não há componentes específicos de finanças: metas são composições de `Card` e `ProgressBar`; insights usam `Alert`; perfis usam `AvatarGroup`, no mesmo módulo de `Avatar`. `Slider` acrescenta a entrada de intervalo com teclado e toque.

Importe `@matheusssousa/ui/styles.css` e configure o `@source` do Tailwind conforme o README. Exemplo de tema opcional, aplicado apenas à região desejada:

```css
.couple-dashboard {
  --background: #101615;
  --foreground: #f2f6f5;
  --card: #192220;
  --card-foreground: #f2f6f5;
  --muted: #293c38;
  --muted-foreground: #becdc9;
  --border: #38514b;
  --primary: #78dcca;
  --primary-text: #91e5d6;
  --primary-foreground: #10241f;
  --ring: #91e5d6;
  --surface-glow-color: #78dcca;
}
```

## Meta com imagem e participantes

```tsx
import { Card, ProgressBar, AvatarGroup } from '@matheusssousa/ui';

<Card
  variant="glow"
  radius="xl"
  size="sm"
  media={<img src="/images/thailand.jpg" alt="Praia na Tailândia ao pôr do sol" />}
  mediaPosition="responsive"
  eyebrow="Meta do casal"
  title="Nossa Viagem dos Sonhos"
  description="Tailândia em julho de 2027"
  action={<AvatarGroup size="md" avatars={[
    { name: 'Dan', src: '/images/dan.jpg' },
    { name: 'Hannah', src: '/images/hannah.jpg' },
  ]} />}
>
  <ProgressBar value={7850} max={12000} variant="glow" label="Economia para a viagem" showPercentage labelPosition="inline" />
  <p className="text-xs">R$ 7.850,00 de R$ 12.000,00</p>
</Card>
```

`mediaPosition="start"` mantém a foto lateral no cartão compacto; `top` mantém a mídia acima. `responsive` empilha a mídia em telas de até 480 px. Ajuste `--card-media-width`, `--card-media-gap` e `--card-media-radius` via `style` ou CSS. `slotClassNames` personaliza `media`, `content`, `header`, `title`, `description`, `footer` e `metricValue`.

O percentual é calculado pelos valores reais: 7.850 / 12.000 equivale a aproximadamente 65,4%. Use `formatValue` para escolher arredondamento e formato.

## Métrica, insight e perfil

```tsx
<Card variant="glow" radius="xl" metric={{
  label: 'Resultado do mês', value: 2657.25, format: 'currency',
  description: 'Entradas menos saídas', tone: 'primary',
}} />

<Alert variant="glow" contentLayout="inline" color="primary"
  title="Insight do mês"
  description="Seus gastos com alimentação caíram 12% em relação ao mês anterior. Ótimo!"
/>

<AvatarGroup label="Dan & Hannah" overlap="lg" size="lg"
  avatars={[{ name: 'Dan', src: '/images/dan.jpg' }, { name: 'Hannah', src: '/images/hannah.jpg' }]}
/>
```

`AvatarGroup.max` limita participantes visíveis e mostra `+N`. Imagens com erro usam as iniciais. Passe ícones próprios em `Card.metric.icon`, `Alert.icon` e `AvatarGroup.accessory`.

## Divisão de valores

```tsx
const [share, setShare] = useState(50);
const money = (value: number) => new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL',
}).format(value);

<Slider label="Divisão da despesa" variant="split" value={share}
  onValueChange={setShare} ticks={13}
  startLabel={<><strong>{money(500 * share / 100)}</strong><div>Você</div></>}
  endLabel={<><strong>{money(500 * (100 - share) / 100)}</strong><div>Hannah</div></>}
/>
```

Importe `useState` de React e `Slider` da biblioteca. Aceita modo controlado (`value`) ou local (`defaultValue`), `min`, `max`, `step`, `disabled`, `name`, `description`, `color`, `formatValue` e atributos nativos. Informe `label`, `aria-label` ou `aria-labelledby`. As setas e Home/End são fornecidos pelo input nativo. `onValueChange` recebe um número; `onChange` mantém o evento HTML.

## Gráfico, sidebar e indicadores

```tsx
<AreaChart variant="glow" size="sm" color="#f58e72" highlightLast
  data={[
    { label: 'Jun', value: 800 }, { label: 'Jul', value: 1350 },
    { label: 'Ago', value: 900 }, { label: 'Set', value: 1680 },
    { label: 'Out', value: 1250 }, { label: 'Nov', value: 1842.75 },
  ]}
/>

<Sidebar sections={sections} variant="glow" color="primary" defaultOpen
  itemVariant="soft" animation="smooth" footer={<AvatarGroup avatars={people} label="Dan & Hannah" />}
/>

<Carousel items={slides} variant="stacked" indicatorVariant="bars" showArrows={false} />
<ProgressBar value={40} variant="segmented" segments={5} label="Etapas concluídas" />
```

A variante `stacked` adiciona duas camadas decorativas atrás do slide ativo para indicar que existe mais conteúdo.

`sections`, `people` e `slides` são dados da aplicação. Indicadores do carrossel são botões de navegação; progresso segmentado é apenas informativo. `trackClassName` e `fillClassName` personalizam a barra; `indicatorsClassName` personaliza o grupo de indicadores. Gráficos já oferecem curva suave, área com gradiente, tooltip por foco/toque e redimensionamento via ResizeObserver.

As animações adicionadas respeitam `prefers-reduced-motion`. O carrossel pausa o autoplay durante foco, não inicia autoplay com movimento reduzido e respeita `loop={false}`. O slider mantém alvo de toque de 44 px e foco visível.
