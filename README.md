# @matheusssousa/ui

Biblioteca privada de componentes, hooks e funções utilitárias para projetos **Next.js 16, React 19 e Tailwind CSS 4**. Os componentes usam as variáveis de cor do arquivo `styles.css`; você pode trocar a identidade visual em cada projeto sem editar a biblioteca.

## Instalação

Configure o escopo do GitHub Packages no `.npmrc` do projeto consumidor:

```ini
@matheusssousa:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

Defina `GITHUB_PACKAGES_TOKEN` no seu ambiente com um token que tenha acesso de leitura ao pacote. Não grave o valor do token no repositório. Instale:

```bash
npm install @matheusssousa/ui
```

No CSS global, carregue o Tailwind e os tokens da biblioteca. Este exemplo assume que o arquivo está em `src/app/globals.css`; ajuste `@source` se ele estiver em outro lugar:

```css
@import "tailwindcss";
@import "@matheusssousa/ui/styles.css";
@source "../../node_modules/@matheusssousa/ui/dist";
@custom-variant dark (&:where(.dark, .dark *));
```

`@source` permite que o Tailwind encontre as classes usadas pelos componentes já compilados. Importe esse CSS global no layout do Next.js.

## Personalizar cores

Adicione suas variáveis **depois** dos imports no CSS global. A biblioteca já define valores padrão; os valores abaixo são um exemplo de outra identidade visual:

```css
:root {
  --background: #ffffff;
  --foreground: #172033;
  --card: #f8fafc;
  --card-foreground: #172033;
  --primary: #175cd3;
  --primary-foreground: #ffffff;
  --primary-text: #175cd3;
  --secondary: #7c3aed;
  --secondary-foreground: #ffffff;
  --secondary-text: #6d28d9;
  --tertiary-text: #0a6b82;
  --muted: #e9eef5;
  --muted-foreground: #566579;
  --border: #d6dfeb;
  --input: #ffffff;
  --ring: #175cd3;
}

:root.dark {
  --background: #101827;
  --foreground: #f1f5f9;
  --card: #182338;
  --card-foreground: #f1f5f9;
  --primary: #77a7ff;
  --primary-foreground: #101827;
  --primary-text: #77a7ff;
  --secondary: #b399ff;
  --secondary-foreground: #101827;
  --secondary-text: #b399ff;
  --tertiary-text: #21c3fc;
  --muted: #26344a;
  --muted-foreground: #a9bad0;
  --border: #35445b;
  --input: #1d2a3e;
  --ring: #77a7ff;
}
```

Principais grupos de tokens:

| Uso | Variáveis |
| --- | --- |
| Página e texto | `--background`, `--foreground` |
| Superfícies | `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--accent`, `--accent-foreground` |
| Marca | `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--tertiary`, `--tertiary-foreground` |
| Estados | `--success`, `--warning`, `--info`, `--destructive` e seus pares `-foreground` |
| Campos e foco | `--input`, `--input-foreground`, `--border`, `--ring` |
| Gráficos | `--chart-1` até `--chart-8` |

Esses tokens também aparecem como utilitários Tailwind, como `bg-primary`, `text-foreground`, `bg-card` e `border-border`. Os tokens `*-foreground` são usados sobre fundos sólidos da mesma cor. Para texto sobre fundos suaves, ajuste `--primary-text`, `--secondary-text` e `--tertiary-text` em cada tema. Mantenha contraste de pelo menos 4,5:1 para texto comum. O tema escuro usa a classe `dark` no elemento `<html>`.

## Provedores e hooks

Envolva o conteúdo do layout com os provedores. Ambos funcionam como componentes cliente e podem ser renderizados dentro do layout do Next.js:

```tsx
// src/app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@matheusssousa/ui/providers/ThemeProvider';
import { ToastProvider } from '@matheusssousa/ui/providers/ToastProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="my-app-theme">
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`useTheme` lê e altera `light`, `dark` ou `system`. `useToast` exibe notificações. Use os hooks em componentes cliente, dentro de seus provedores:

```tsx
'use client';

import { Button } from '@matheusssousa/ui/components/button';
import { useTheme } from '@matheusssousa/ui/hooks/useTheme';
import { useToast } from '@matheusssousa/ui/hooks/useToast';

export function SettingsActions() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  return (
    <div className="flex gap-2">
      <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Trocar tema</Button>
      <Button variant="outlined" onClick={() => toast.success('Salvo', 'Alterações concluídas')}>
        Mostrar aviso
      </Button>
    </div>
  );
}
```

O `Button` também usa `useToast` para o recurso de cópia; coloque `ToastProvider` acima dos botões. Para atrasar uma pesquisa, use `useDebounce`:

```tsx
const delayedQuery = useDebounce(query, 300);
```

## Componentes

Importe diretamente por `@matheusssousa/ui/components/<arquivo>`. Os exports nomeados também estão disponíveis pela raiz do pacote. Componentes com estado, eventos ou animação devem ser usados em componentes cliente.

### Exemplos comuns

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@matheusssousa/ui/components/button';
import { Card } from '@matheusssousa/ui/components/card';
import { FormField } from '@matheusssousa/ui/components/form-field';
import { Input } from '@matheusssousa/ui/components/input';
import { Select } from '@matheusssousa/ui/components/select';
import { Switch } from '@matheusssousa/ui/components/switch';

export function ProfileForm() {
  const [enabled, setEnabled] = useState(false);
  const [plan, setPlan] = useState<string | number | undefined>();

  return (
    <Card title="Perfil" description="Preferências da conta">
      <FormField label="Nome" htmlFor="profile-name" required>
        <Input id="profile-name" placeholder="Seu nome" />
      </FormField>
      <Select
        label="Plano"
        options={[{ value: 'basic', label: 'Básico' }, { value: 'pro', label: 'Pro' }]}
        value={plan}
        onValueChange={(value) => {
          if (typeof value === 'string' || typeof value === 'number') setPlan(value);
        }}
      />
      <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Receber avisos" />
      <Button variant="filled" size="md" onClick={() => {}}>Salvar</Button>
    </Card>
  );
}
```

O `Text` recebe a prop obrigatória `text`. Use `Spinner` em modo `block` para carregamento de página e `overlay` dentro de um contêiner com `position: relative`:

```tsx
import Text from '@matheusssousa/ui/components/text';
import { Spinner } from '@matheusssousa/ui/components/spinner';
import { Pagination } from '@matheusssousa/ui/components/pagination';

<Text text="Visão geral" variant="emphasis" />
<Spinner mode="block" label="Carregando resultados" compact />
<Pagination currentPage={2} totalPages={5} onPageChange={(page) => console.log(page)} />
```

Para um modal e abas, controle o estado no componente cliente:

```tsx
import { Modal } from '@matheusssousa/ui/components/modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@matheusssousa/ui/components/tabs';

<Modal isOpen={open} onClose={() => setOpen(false)} title="Detalhes" size="md">
  Conteúdo do modal
</Modal>

<Tabs defaultValue="overview" variant="pills" color="primary">
  <TabsList aria-label="Seções">
    <TabsTrigger value="overview">Visão geral</TabsTrigger>
    <TabsTrigger value="history">Histórico</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Resumo</TabsContent>
  <TabsContent value="history">Eventos anteriores</TabsContent>
</Tabs>
```

### Seletor de mês e ano

```tsx
import { MonthYearPicker } from '@matheusssousa/ui/components/month-year-picker';

<MonthYearPicker
  defaultValue={new Date(2026, 9, 1)}
  minYear={2020}
  maxYear={2030}
  onValueChange={(month) => console.log(month)}
/>
```

O valor é um `Date` normalizado para o primeiro dia do mês. Use `value` com `onValueChange` para controlar a seleção, ou `defaultValue` para deixá-la no componente. As setas respeitam `minYear` e `maxYear`; ao clicar no mês exibido, o painel permite escolher o ano e um dos 12 meses.

### Referência rápida

| Arquivo para importar | Uso principal |
| --- | --- |
| `accordion`, `log-accordion` | Seções expansíveis; `LogAccordion` é o export default de `log-accordion`. |
| `alert`, `toast`, `empty-state` | Feedback em página, aviso temporário e estado vazio. Para criar toasts, use `useToast`. |
| `avatar`, `badge` | Pessoa, rótulo e indicador de estado. `Avatar` recebe `name`, `src` e `status`. |
| `breadcrumbs`, `tabs`, `pagination` | Navegação hierárquica, por abas e por páginas. |
| `button`, `speed-dial`, `bulk-actions` | Ação comum, botão flutuante e ações para seleção. |
| `card`, `section`, `info` | Blocos de conteúdo e métricas. Use `Card` com a prop `metric`. |
| `input`, `textarea`, `select`, `switch`, `form-field`, `search` | Campos, controles e busca. `Input` aceita `label`, `error`, `mask` e `validation`; `Select` recebe `options`. |
| `modal`, `dropdown-menu` | Camadas acionadas pelo usuário. `Modal` recebe `isOpen` e `onClose`. |
| `table`, `draggable-table` | Tabelas com `columns` e `data`; a segunda permite reordenar linhas. |
| `calendar`, `month-year-picker`, `carousel`, `gallery`, `image` | Datas e conteúdo visual. `Calendar` recebe `mode`, `selected` e `onSelect`; `MonthYearPicker` seleciona apenas mês e ano. |
| `chart`, `progress-bar` | Visualização de valores. Os gráficos usam `--chart-1` a `--chart-8`. |
| `spinner`, `skeleton` | `Spinner` oferece os modos `inline`, `block` e `overlay`. |
| `text`, `tip`, `separator`, `motion` | Texto, dica, divisor e animação. `Text` é export default e recebe `text`. |
| `theme` | Tipos e classes compartilhados de cor, tamanho e raio. |

### SpeedDial

```tsx
import { SpeedDial } from "@matheusssousa/ui";

<SpeedDial
  position="bottom-left"
  icon="PlusIcon"
  openIcon="XIcon"
  triggerLabel="Ações rápidas"
  actions={[
    { id: "novo", label: "Novo", icon: "FilePlusIcon", active: true, onClick: criar },
    {
      id: "compartilhar",
      label: "Compartilhar",
      icon: "ShareIcon",
      children: [
        { id: "copiar", label: "Copiar link", icon: "LinkIcon", onClick: copiarLink },
      ],
    },
  ]}
/>
```

`icon` e `openIcon` aceitam o nome exportado por `@phosphor-icons/react/dist/ssr` (por exemplo, `"PlusIcon"`) ou um elemento React. Cada ação aceita `id`, `label`, `icon`, `onClick`, `disabled`, `active` e `children` para subitens. `active: true` destaca a opção; o estado é definido por quem usa o componente. Uma ação com `children` expande seus subitens; uma ação sem filhos chama `onClick`. Use `actionSize` e `buttonSize` para os tamanhos, e `closeOnAction={false}` para manter o menu aberto depois de uma ação.

### SpeedDialTabs

O `SpeedDialTabs` mostra texto no botão principal e reúne ícone e texto em cada opção. Ele pode ocupar qualquer canto, o centro das bordas ou o centro da tela: `top-left`, `top-center`, `top-right`, `middle-left`, `middle-center`, `middle-right`, `bottom-left`, `bottom-center` e `bottom-right`.

```tsx
import { SpeedDialTabs } from "@matheusssousa/ui";

<SpeedDialTabs
  position="bottom-center"
  color="primary"
  triggerLabel="Minhas áreas"
  icon="SquaresFourIcon"
  openIcon="XIcon"
  defaultValue="home"
  onValueChange={area => mudarArea(area)}
  tabs={[
    { value: "home", label: "Home", icon: "HouseIcon" },
    { value: "viagens", label: "Viagens", icon: "AirplaneIcon" },
    { value: "desejos", label: "Lista de desejos", icon: "MagicWandIcon" },
  ]}
/>
```

Use `value` e `onValueChange` para controlar a seleção externamente, ou `defaultValue` para mantê-la no componente. `closeOnSelect={false}` mantém as opções abertas. `color` aceita os tones de `UIColor`; `size` aceita `xs`, `sm`, `md` e `lg`.

Componentes que usam `next/link`, `next/navigation` ou `next/dynamic` exigem Next.js. O `Avatar` da biblioteca recebe `name` explicitamente; ele não acessa a autenticação do projeto.

## Funções utilitárias

As funções podem ser importadas individualmente, sem importar os componentes:

| Caminho `/functions/...` | Principais exports e exemplo |
| --- | --- |
| `formatBytes` | `formatBytes(1024)` → `1 KB`; aceita `binary`, `decimals` e `locale`. |
| `formatJson` | `formatJson({ a: 1 })`; aceita `indentation`, `sortKeys` e `redactKeys`. |
| `formatNumber` | `formatNumber(1234.5)` → `1.234,5`; inclui `formatCompactNumber`, `formatPercentage`, `clamp` e `calculatePercentage`. |
| `formatPhone` | `formatPhone('11987654321')` → `(11) 98765-4321`; inclui `maskPhone`, `unformatPhone` e `isValidPhone`. Usa formato brasileiro. |
| `formatText` | `capitalize`, `titleCase`, `initials`, `truncate`, `pluralize`, `normalizeSearchText` e `maskEmail`. |
| `formatTime` | `formatTime('14:30')`, `formatTimeRange`, `formatDuration`, `minutesToTime` e `parseTimeToMinutes`. |
| `formatCurrency` | `formatCurrency(1234.5)` com padrão BRL; inclui `formatCurrencyCompact`, `parseCurrency` e `currencyToCents`. |
| `formatDate` | `formatDateValue`, `formatDateRange`, `isValidDate`, `isToday` e outras funções de data. |

```ts
import { formatBytes } from '@matheusssousa/ui/functions/formatBytes';
import { formatPhone } from '@matheusssousa/ui/functions/formatPhone';
import { formatDateValue } from '@matheusssousa/ui/functions/formatDate';

formatBytes(1024);
formatPhone('11987654321');
formatDateValue(new Date());
```

Todos esses exports nomeados também estão disponíveis pela raiz: `import { formatBytes } from '@matheusssousa/ui'`.


## Hooks e HTTP

Importe hooks por `@matheusssousa/ui/hooks/<nome>`. Todos executam em componentes cliente. `useAction` recebe uma Server Action do React e callbacks/notificações opcionais; `useFetch` recebe qualquer função assíncrona; `useCep` consulta o ViaCEP com `fetch`. `useApi` recebe um cliente HTTP e, opcionalmente, um notificador com métodos `success` e `error`.

```tsx
import { useApi } from '@matheusssousa/ui/hooks/useApi';
import { createAxiosClient, createFetchClient } from '@matheusssousa/ui/functions/http';

// Crie o cliente fora do componente para preservar sua identidade.
const axiosClient = createAxiosClient(api); // instância Axios da aplicação, com interceptors próprios
const fetchClient = createFetchClient({ baseUrl: '/api', credentials: 'include' });

function Example() {
  const { get, post, isLoading } = useApi(fetchClient);
  // get<User[]>('/users', { page: 1 }); post<User>('/users', { name: 'Ana' });
  return null;
}
```

`createFetchClient` aceita `headers` (valor ou função para tokens atualizados), `credentials`, `fetcher` e `onUnauthorized`. Quando `onUnauthorized` renova as credenciais e retorna `true`, a requisição é repetida uma vez. `createAxiosClient` usa a instância recebida, inclusive seus interceptors para autenticação e renovação de sessão. `useApi` retorna `null` em falhas e expõe notificações opcionais. `useFetch` e `useCep` retornam estado, dados e erro.

Para chamadas no servidor do Next, use a entrada separada. As opções `cache` e `next` são repassadas ao `fetch` do ambiente:

```ts
import { createServerFetch } from '@matheusssousa/ui/server';

const request = createServerFetch({ baseUrl: 'https://api.example.com' });
const users = await request<User[]>('/users', { cache: 'force-cache', next: { revalidate: 60, tags: ['users'] } });
```

## Migração da versão 0.2

- `Loading` e `LoadingOverlay` → `Spinner mode="block"` e `Spinner mode="overlay"`.
- `KpiCard` e `SummaryCard` → `Card metric={{ label, value, icon, description, tone, format, change }}`.
- `StatusIndicator` → `Badge status={status} display="indicator"`; `Badge` também aceita `status` no formato normal.
- Os caminhos antigos foram removidos. A versão 0.3 atualiza a API, mas não migra as cópias locais no frontend do SaaS.
## Desenvolvimento e publicação

Na pasta `Codes/packages/ui`, execute `npm install` e `npm run build`. `npm pack --dry-run` confere os arquivos que serão enviados. O `prepack` compila a biblioteca antes de cada `npm publish`.

Para publicar no GitHub Packages, autentique-se com um personal access token **classic** que tenha `write:packages`:

```bash
npm login --scope=@matheusssousa --registry=https://npm.pkg.github.com --auth-type=legacy
npm publish
```

Quando alterar uma versão já publicada, incremente o número antes de publicar novamente, por exemplo com `npm version patch` para correções ou `npm version minor` para novas funcionalidades. O pacote tem `publishConfig.registry` apontando para o GitHub Packages. Não comite tokens nem arquivos `.npmrc` com credenciais.
