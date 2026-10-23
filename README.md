# @matheusssousa/ui

Biblioteca privada de componentes, hooks e funções utilitárias para projetos **Next.js 16, React 19 e Tailwind CSS 4**. Os componentes usam as variáveis de cor do arquivo `styles.css`; você pode trocar a identidade visual em cada projeto sem editar a biblioteca.


<!-- TOC:START -->
## Sumário

- [Instalação](#instalação)
- [Personalizar cores](#personalizar-cores)
- [Provedores e hooks](#provedores-e-hooks)
- [Componentes](#componentes)
- [Funções utilitárias](#funções-utilitárias)
- [Hooks e HTTP](#hooks-e-http)
- [Contrato HTTP e compatibilidade](#contrato-http-e-compatibilidade)
- [Tabelas remotas e busca unificada](#tabelas-remotas-e-busca-unificada)
- [Inputs de imagem e SwitchField](#inputs-de-imagem-e-switchfield)
- [Modal de detalhes configurável](#modal-de-detalhes-configurável)
- [Referência comportamental dos demais hooks e funções](#referência-comportamental-dos-demais-hooks-e-funções)
- [Migração dos utilitários do SaaS](#migração-dos-utilitários-do-saas)
- [Migração da versão 0.2](#migração-da-versão-02)
- [Desenvolvimento e publicação](#desenvolvimento-e-publicação)
- [Tipos de responses de actions e Laravel](#tipos-de-responses-de-actions-e-laravel)
- [Sidebar](#sidebar)
- [Referência completa da API](#referência-completa-da-api)

<!-- TOC:END -->

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

<Modal isOpen={open} onClose={() => setOpen(false)} title="Detalhes" size="md" headerBackgroundImage="/images/capa.jpg">
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

No `Modal`, `headerBackgroundImage` define uma imagem decorativa de fundo para o cabeçalho nas variantes `default` e `customer`. A faixa ocupa toda a largura, tem altura mínima de 120 px e recorte central (`cover`), com camada escura para manter o texto legível. Textos longos podem aumentar a altura. Sem imagem ou com string vazia, o cabeçalho mantém o visual padrão.

### Seletor de mês e ano

```tsx
import { MonthYearPicker } from '@matheusssousa/ui/components/month-year-picker';

<MonthYearPicker
  defaultValue={new Date(2026, 9, 1)}
  minYear={2020}
  maxYear={2030}
  variant="soft"
  size="md"
  color="primary"
  monthOptionClassName={({ selected }) => selected ? 'font-bold' : ''}
  yearOptionClassName={({ selected }) => selected ? 'font-bold' : ''}
  onValueChange={(month) => console.log(month)}
/>
```

O valor é um `Date` normalizado para o primeiro dia do mês. Use `value` com `onValueChange` para controlar a seleção, ou `defaultValue` para deixá-la no componente. As setas respeitam `minYear` e `maxYear`. O painel tem abas para meses e anos: sem limites de ano, mostra um campo numérico; com `minYear` ou `maxYear`, mostra anos em páginas de 12. Escolher um ano abre a aba de meses; a seleção só é enviada ao escolher o mês. `variant` aceita `outlined`, `soft` e `filled`; `size` aceita `sm`, `md` e `lg`; `color` aceita os tones de `UIColor`. Para personalizar cada opção, use `monthOptionClassName`, `yearOptionClassName`, `renderMonth` ou `renderYear`; o mês passado aos callbacks vai de 0 a 11. `yearInputClassName` personaliza o campo sem limites.

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
  color="primary"
  actionColor="secondary"
  icon="PlusIcon"
  openIcon="XIcon"
  triggerLabel="Ações rápidas"
  actions={[
    { id: "novo", label: "Novo", icon: "FilePlusIcon", active: true, color: "success", onClick: criar },
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

O `SpeedDial` aceita `color` no botão principal, `actionColor` nas ações e `color` em cada ação para sobrescrever esse padrão. Esses valores usam os tones definidos em `UIColor` e nos tokens CSS do tema.

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

Os utilitários de formulário podem ser importados pela raiz ou pelos caminhos abaixo:

```tsx
import { handleInputChange } from '@matheusssousa/ui/functions/handleInputChange';
import { getFieldError } from '@matheusssousa/ui/functions/getFieldError';
import { removeMask } from '@matheusssousa/ui/functions/removeMask';

handleInputChange('phone', '(11) 98765-4321', errors, clearFieldError, setFormData);
getFieldError('phone', errors); // Primeira mensagem de erro do campo.
removeMask('(11) 98765-4321'); // '11987654321'
```

`getFieldError` também exporta `ValidationErrors`, `getFieldErrors`, `hasFieldError` e `getFirstError`.
`removeMask` também exporta `removeMaskFromFields`, `keepAlphaNumeric`, `removeDiacritics` e `transformFields`.

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

## Contrato HTTP e compatibilidade

Todos os recursos HTTP novos recebem `HttpClient`: `request<T>(method, url, data?, options?): Promise<T>`. O retorno é **o corpo da resposta**, não um `Response` do fetch nem um `AxiosResponse`. Os adaptadores lançam erros; `useApi` captura falhas e retorna `null`. `useApiTable` e `ViewModal` mantêm o erro em estado. Axios é opcional: instale-o no projeto consumidor somente se escolher esse transporte.

| Recurso | Fetch nativo / Next | Axios |
| --- | --- | --- |
| Criação | `createFetchClient({ baseUrl, ... })` | `createAxiosClient(instancia)` |
| JSON | Serializa objetos e lê respostas JSON | Usa os transforms da instância |
| Upload | Aceita `FormData`, sem definir boundary manualmente | Encaminha `FormData` à instância |
| Query | `params`; arrays repetem a chave | `params`; serialização da instância |
| Cancelamento | Encaminha `AbortSignal` | Encaminha `AbortSignal` |
| Cabeçalhos | `HeadersInit`; mescla configuração e chamada | Converte `HeadersInit` em objeto de cabeçalhos |
| Credenciais | `credentials` da chamada ou configuração | `include` vira `withCredentials: true`; `omit`/`same-origin` viram `false`; omitido preserva a configuração da instância |
| Autenticação | `headers` estático/assíncrono e `onUnauthorized` | Interceptors da instância |
| Cache Next | Encaminha `cache`, `next.revalidate` e `next.tags` | Essas opções não são aplicadas |
| Falhas HTTP | `HttpError`, com `status` e `data` | Preserva o erro original do Axios |

`same-origin` não tem equivalente exato em Axios: `withCredentials: false` não bloqueia cookies de mesma origem. No servidor, nenhum adaptador copia automaticamente cookies da requisição recebida. Crie clientes por requisição quando houver credenciais de usuário; nunca compartilhe tokens mutáveis entre usuários.

### Configuração com fetch

```ts
// lib/http.ts
import { createFetchClient } from '@matheusssousa/ui/functions/http';

export const client = createFetchClient({
  baseUrl: '/api',
  credentials: 'include',
});
```

`FetchClientOptions` aceita `baseUrl` (padrão vazio), `fetcher` (padrão `fetch` do ambiente), `credentials`, `headers` (objeto, `Headers`, tuplas ou função que retorna esses valores, inclusive Promise) e `onUnauthorized`. O último só repete uma chamada 401 quando retorna `true`, no máximo uma vez por requisição. Headers da chamada prevalecem sobre os da configuração. `Accept` assume `application/json`; o adaptador define `Content-Type` para objetos JSON quando não informado. Não coloque `Content-Type: application/json` nos headers globais de um cliente usado para `FormData`.

O adaptador reconhece JSON pelo `Content-Type`; os outros corpos são lidos como texto. Respostas 204/205 retornam `null`: tipifique a chamada como `T | null` quando necessário. Downloads binários devem usar o transporte diretamente (`response.blob()`/Axios `responseType`) ou uma URL de download; este contrato não retorna streams ou blobs de resposta. Não envie corpo em GET/HEAD.

### Configuração com Axios

```ts
// lib/http.ts — alternativa ao exemplo fetch
import axios from 'axios';
import { createAxiosClient } from '@matheusssousa/ui/functions/http';

const api = axios.create({ baseURL: '/api', timeout: 15000, withCredentials: true });
// Configure aqui os interceptors de autenticação do seu projeto.
export const client = createAxiosClient(api);
```

Não use interceptor que transforme a resposta em `response.data`: o adaptador já faz isso. `timeout`, `paramsSerializer`, `validateStatus`, renovação de token e demais opções exclusivas do Axios devem ser configurados na instância. Se `validateStatus` aceitar uma falha HTTP, ela será tratada como sucesso pelo adaptador.

### Fetch no servidor Next

```tsx
// app/users/page.tsx — Server Component
import { createServerFetch } from '@matheusssousa/ui/server';

type User = { id: number; name: string };
const request = createServerFetch({ baseUrl: 'https://api.example.com' });

export default async function UsersPage() {
  const users = await request<User[]>('/users', {
    next: { revalidate: 60, tags: ['users'] },
  });
  return <ul>{users.map(user => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

`createServerFetch(config)` retorna `request<T>(url, options?)`. As opções são `HttpRequestOptions` mais `method` (padrão GET) e `body`. Use uma URL absoluta ou `baseUrl` absoluto no servidor. Para dados que precisam ser buscados a cada requisição, use `cache: 'no-store'`, sem `revalidate` positivo. A biblioteca não substitui o fetch do Next e não implementa cache próprio. Os hooks React executam no cliente: `next` não cria cache de servidor quando usado no navegador.

Referências: [fetch do Next](https://nextjs.org/docs/app/api-reference/functions/fetch) e [configuração de requisições Axios](https://axios-http.com/docs/req_config).

### Erros e utilitários HTTP

`resolveHttpError(error, fallback?)` entende `HttpError` e erros com `response.status/data` do Axios. Prioriza `data.message`, `data.error` e a primeira mensagem de validação não vazia. Sem mensagem do servidor, trata 401, 403, 404, 422, 429, erros 5xx, timeout e falha de conexão. Depois usa `Error.message` ou o fallback. Não realiza login, logout, retry nem redirecionamento.

`appendParams(url, params?)` ignora valores `null`/`undefined`, preserva `false`/`0` e repete a chave para arrays. Objetos aninhados não são serializados como JSON automaticamente: converta-os antes. `HttpRequestOptions` contém `params`, `signal`, `headers`, `credentials`, `cache` e `next`.

## Tabelas remotas e busca unificada

### Table editável e variantes

A `Table` agora usa um visual minimalista por padrão. Essa mudança visual é intencional: `default`, `ghost` e `striped` não têm bordas ou rings; `outline` adiciona contorno e divisórias horizontais, e `grid` adiciona divisórias entre células. `size="sm" | "default" | "lg"` ajusta espaçamento, campos e badges. `layout="auto" | "fixed"` controla a distribuição das colunas; o antigo `variant="fixed"` continua aceito como layout fixo com aparência padrão.

Inputs e selects dentro da tabela ficam integrados ao fundo da célula, sem caixas ou rings adicionais. O foco usa destaque de fundo, e erros usam texto e ícone. Os controles fora da tabela mantêm seu estilo. O menu do select mantém fundo e sombra e acompanha a rolagem da tabela.

```tsx
import { useState } from 'react';
import { Table, type Column, type CellSaveEvent } from '@matheusssousa/ui';

type Item = { id: number; name: string; status: string; locked?: boolean };

const columns: Column<Item>[] = [
  {
    key: 'name', label: 'Nome',
    editor: row => row.locked ? false : {
      type: 'input', inputType: 'text', placeholder: 'Nome',
      parse: value => String(value ?? '').trim(),
      validate: value => value ? undefined : 'Informe um nome',
    },
  },
  {
    key: 'status', label: 'Status',
    editor: {
      type: 'select', display: 'badge', searchable: true,
      options: [
        { value: 'pending', label: 'Pendente', color: 'warning' },
        { value: 'done', label: 'Concluído', color: 'success' },
      ],
    },
  },
];

export function EditableItems({ initialItems }: { initialItems: Item[] }) {
  const [data, setData] = useState(initialItems);
  async function saveCell({ rowKey, columnKey, value }: CellSaveEvent) {
    const response = await fetch(`/api/items/${encodeURIComponent(rowKey)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [columnKey]: value }),
    });
    if (!response.ok) throw new Error('Não foi possível salvar');
    setData(current => current.map(row => row.id === rowKey
      ? { ...row, [columnKey]: value } : row));
  }
  return <Table data={data} columns={columns} onCellSave={saveCell} variant="default" />;
}
```

- `editor` aceita configuração fixa ou `(row, index) => configuração | false`. Sem o callback do modo escolhido (`onCellSave` ou `onRowSave`), a tabela continua somente leitura e respeita `render`. Com edição, o editor tem precedência sobre `render`.
- `inputType` aceita `text`, `number`, `email`, `url`, `tel`, `password` e `search`. Inputs retornam texto; use `parse` para converter números. Selects preservam `string`/`number` das opções; `clearable` retorna `undefined` ao limpar. Converta para `null` com `parse` se a API precisar receber explicitamente um campo vazio em JSON.
- `parse(value, row)` é aplicado antes da comparação e validação; `validate(value, row)` retorna uma mensagem para impedir o salvamento. `disabled` bloqueia a célula. A seleção nesta versão é única.
- `onCellSave({ row, rowKey, columnKey, value, previousValue })` deve retornar `Promise<void>` e rejeitar em caso de falha. `rowKey` no evento é o identificador da linha, enquanto a prop `rowKey` indica o campo identificador (padrão `id`). Todas as linhas precisam de identificadores únicos e estáveis; `0` é válido.
- No modo por célula, só valores alterados são salvos, ao sair da célula inteira. Buscar ou selecionar dentro do select não salva imediatamente. A célula em processamento fica bloqueada; outras continuam editáveis.
- Falhas mantêm o rascunho e mostram “Tentar novamente”. Sair novamente da célula também tenta salvar. Não há novas tentativas automáticas nem salvamento por desmontagem.
- Atualizações de `data` sincronizam células sem edição pendente. Rascunhos são preservados; uma resposta normalizada recebida durante o salvamento é aplicada após o sucesso. Atualize `data` na aplicação para manter os valores após trocar de página ou remontar a tabela.
- O `Select` também aceita `display="badge"` fora da tabela. Cada opção pode ter `color: UIColor`; sem cor, usa `neutral`. Sem seleção, exibe o placeholder. `display="text"` continua sendo o padrão.

O novo comportamento pertence à `Table`; `DraggableTable` não recebe edição nesta versão.

#### Salvamento por linha

Use `saveMode="row"` e `onRowSave` para enviar todas as alterações de uma linha em uma única chamada ao sair dela. Tab entre campos, busca e seleção dentro do select mantêm o rascunho sem salvar. O padrão continua sendo `saveMode="cell"`, com `onCellSave`; somente o callback do modo ativo é chamado.

```tsx
<Table
  data={data}
  columns={columns}
  saveMode="row"
  onRowSave={async ({ rowKey, changes }) => {
    const response = await fetch(`/api/items/${encodeURIComponent(rowKey)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (!response.ok) throw new Error('Não foi possível salvar a linha');
    setData(current => current.map(row => row.id === rowKey
      ? { ...row, ...changes } : row));
  }}
/>
```

`onRowSave(event)` retorna `Promise<void>` e recebe `RowSaveEvent`, exportado pela biblioteca:

- `rowKey`: identificador estável da linha.
- `row`: snapshot confirmado antes das alterações.
- `changes`: somente campos alterados, convertidos e validados.
- `previousValues`: valores confirmados anteriores desses campos.
- `updatedRow`: linha completa com as alterações aplicadas.

Qualquer erro de validação impede o envio da linha inteira. Durante o salvamento, todos os editores dessa linha ficam bloqueados; outras linhas continuam disponíveis. Em falha, os rascunhos são preservados e aparece uma ação “Tentar novamente” abaixo da linha. Sair novamente da linha também repete a tentativa. Valores revertidos ao último confirmado não geram salvamento, e desmontar a tabela não envia novas alterações. A persistência atômica dos campos é responsabilidade da API consumidora.

#### Modo planilha

Use `variant="spreadsheet"` para grade compacta com interação de planilha, ou `appearance="spreadsheet"` com qualquer outra variante para escolher a aparência separadamente. `grid` mantém o comportamento anterior. O modo de salvamento continua independente; a combinação recomendada é `variant="spreadsheet" saveMode="row"`.

As células têm aproximadamente 36 px no desktop, contorno de foco de 2 px, apresentação discreta para campos somente leitura e indicadores internos de pendência/erro, sem inserir linhas durante o salvamento. `column.render(value, draftRow, index)` formata uma célula editável enquanto ela não estiver em edição. O cabeçalho fica fixo por padrão no modo planilha; use `stickyHeader={false}` para desativar. `maxHeight` controla a área de rolagem (padrão 480 px no modo planilha).

| Interação | Resultado |
| --- | --- |
| Clique | Inicia a edição preservando o conteúdo; em selects, abre as opções. |
| Digitação | Inicia edição substituindo o conteúdo. |
| F2 | Edita preservando o conteúdo. |
| Setas com célula selecionada | Movem a seleção. Durante edição de texto, movem o cursor. |
| Tab / Shift+Tab | Confirmam o rascunho e avançam/recuam; nas extremidades, saem da tabela. |
| Enter / Shift+Enter | Confirmam o rascunho e descem/sobem na mesma coluna. |
| Escape durante edição | Restaura a sessão de edição, incluindo seus campos dependentes, preservando alterações anteriores da linha. |
| Select aberto | Setas, Enter e Escape pertencem ao seletor; Tab confirma e avança. |
| Copiar | Copia o valor da célula selecionada; dentro do editor, mantém o comportamento nativo. |

Confirmar uma célula atualiza o rascunho; em `saveMode="row"`, apenas sair da linha envia a requisição. O foco usa células identificadas por `rowKey` e `column.key`, com cabeçalhos associados e estados acessíveis. Forneça `aria-label` para identificar cada tabela.

#### Rascunhos dependentes, datas e dinheiro

`column.editor(draftRow, index)` recebe todos os valores locais atuais. `required` valida campos obrigatórios, inclusive os ainda não tocados. `validateRow(draftRow)` na tabela pode retornar `{ campo: 'Mensagem' }` para validar relações entre campos. Qualquer erro bloqueia o salvamento da linha.

`editor.onChange(value, draftRow)` pode retornar um patch de campos dependentes. Os valores novos são aplicados antes de recalcular os editores:

```tsx
const transactionColumns: Column[] = [
  {
    key: 'kind', label: 'Tipo',
    editor: {
      type: 'select',
      options: [
        { value: 'expense', label: 'Despesa' },
        { value: 'transfer', label: 'Transferência' },
      ],
      onChange: value => value === 'transfer'
        ? { category: null } : { destination: null },
    },
  },
  { key: 'date', label: 'Data', editor: { type: 'date', required: true } },
  { key: 'amount', label: 'Valor', editor: { type: 'money', required: true } },
  {
    key: 'category', label: 'Categoria',
    editor: row => ({ type: 'input', disabled: row.kind === 'transfer', required: row.kind !== 'transfer' }),
  },
  {
    key: 'destination', label: 'Destino',
    editor: row => ({ type: 'input', disabled: row.kind !== 'transfer', required: row.kind === 'transfer' }),
  },
];
```

- `type: 'date'` usa o componente `Input` com calendário em portal, dimensionado para a tela sem cortes pela rolagem da tabela. Salva `YYYY-MM-DD`, exibe `dd/MM/aaaa` e respeita `min` e `max` em ISO.
- `type: 'money'` aceita `145,50` e `1.234,50`, retorna a string decimal exata `"145.50"` e formata em BRL fora da edição. Aceita `currency` para alterar o identificador monetário. Use strings decimais também nos dados recebidos; números JavaScript que já perderam precisão não podem ser recuperados. Mais de duas casas decimais são rejeitadas, sem arredondamento silencioso.
- Os helpers `parseTableMoney`, `formatTableMoney`, `parseTableDate` e `formatTableDate` são exportados pela raiz e por `functions/table-values`.

#### Controlador público e pendências

O `ref` da `Table` continua apontando para `HTMLTableElement`. Use `editingRef` separadamente:

```tsx
import { useRef } from 'react';
import { Table, type TableEditingController } from '@matheusssousa/ui';

const editing = useRef<TableEditingController>(null);

async function saveBeforeLeaving() {
  const result = await editing.current!.saveAll();
  if (!result.ok) {
    const failed = result.results.find(row => !row.ok)!;
    const field = Object.keys(failed.errors ?? {})[0];
    if (field) editing.current!.focusCell(failed.rowKey, field);
    return false;
  }
  return true;
}

<Table
  data={data}
  columns={transactionColumns}
  variant="spreadsheet"
  saveMode="row"
  onRowSave={saveTransaction}
  editingRef={editing}
  onEditingStateChange={state => setHasPendingChanges(state.dirtyRows.length > 0 || state.savingRows.length > 0)}
  mobileLayout="stacked"
  aria-label="Transações"
/>
```

| Operação | Contrato |
| --- | --- |
| `saveRow(rowKey)` | Valida e salva; aguarda uma requisição já em andamento sem duplicá-la. |
| `saveAll()` | Salva linhas alteradas e aguarda requisições pendentes; retorna `{ ok, results }`. |
| `discardRow(rowKey)` / `resetRow(rowKey)` | Descarta rascunhos; retorna `false` se a linha estiver salvando ou não existir. |
| `getEditingState()` | Retorna `dirtyRows`, `savingRows` e `errorRows` com mensagens por campo/linha. |
| `focusCell(rowKey, columnKey)` | Foca uma célula renderizada; retorna `false` se ela não estiver disponível. Não troca de página automaticamente. |
| `getDraftRow(rowKey)` | Retorna a linha com alterações locais; valores incompletos continuam disponíveis para correção. |
| `setDraftValue(rowKey, columnKey, value)` | Atualiza um campo e aplica seu `onChange`. |
| `patchDraft(rowKey, changes)` | Atualiza vários campos diretamente, sem encadear callbacks. |
| `validateRow(rowKey)` | Valida o conjunto completo e retorna erros por campo. |

`saveRow` retorna `{ rowKey, ok, status, errors?, error? }`. Os estados são `saved`, `unchanged`, `invalid`, `error`, `not-found` e `readonly`. `saveAll` considera apenas linhas alteradas ou salvando; para validar uma linha intacta, use `validateRow` ou `saveRow`. Em modo por célula, `saveRow`/`saveAll` usam `onCellSave` para os campos alterados. `onEditingStateChange` informa mudanças das pendências sem polling.

Rascunhos e requisições de linhas que saíram da página continuam no controlador enquanto a tabela estiver montada. Atualize `data` após persistir; desmontar a tabela não salva automaticamente nem preserva os rascunhos para uma nova instância.

#### Celular e limites desta entrega

`mobileLayout="stacked"` exibe todos os campos com seus rótulos, mantendo a mesma linha lógica e rascunho. As áreas de toque têm pelo menos 44 px; no celular, tocar na célula inicia a edição. `mobileLayout="scroll"` mantém todas as colunas com rolagem horizontal. O modo planilha usa `scroll` por padrão, evitando esconder campos obrigatórios. `mobileLayout="responsive"` conserva o comportamento legado de `limitColumnsShow`.

Para telas de orçamento com várias tabelas, a aplicação pode usar o componente `Tabs` existente e uma `Table` por aba. A biblioteca não introduz regras de orçamento ou transações.

Copiar/colar texto dentro do editor e copiar uma célula selecionada são suportados. Colar uma matriz com tabulações/quebras de linha na célula selecionada não importa intervalos. Fórmulas, seleção múltipla de células e arrastar para preencher não fazem parte desta versão.

### useApiTable

```tsx
'use client';
import { useApiTable } from '@matheusssousa/ui/hooks/useApiTable';
import { Table } from '@matheusssousa/ui/components/table';
import { client } from '@/lib/http';

type User = { id: number; name: string };
export function UsersTable() {
  const table = useApiTable<User>({ client, endpoint: '/users' });
  if (table.error) return <button onClick={table.refetchData}>Tentar novamente</button>;
  return <Table
    data={table.data}
    columns={[{ key: 'name', label: 'Nome', sortable: true }]}
    pagination={table.pagination}
    onPageChange={table.setPage}
    sortState={table.sortState}
    onSort={table.setSort}
    loading={table.isLoading}
  />;
}
```

| Opção | Padrão / comportamento |
| --- | --- |
| `client`, `endpoint` | Sem ambos, não faz requisições. Preserve a identidade do cliente fora do componente ou com `useMemo`. |
| `enabled` | `true`; `false` cancela a consulta e mantém os dados existentes. |
| `initialState` | `{ page: 1, per_page: 15, search: '', sort_by: 'created_at', sort_direction: 'desc', filters: {} }`; aplicado na montagem. |
| `debounceMs` | `300`; agrupa alterações antes da consulta, inclusive carga inicial, página, filtros e ordenação. Use `0` para consulta sem espera adicional. |
| `requestOptions` | Headers, credentials, cache e next. O hook controla params e signal. |
| `buildParams(state)` | Personaliza os parâmetros. Padrão: page/per_page/search/sort_by/sort_direction e filtros na raiz. Arrays de filtros usam chave `campo[]`; vazios, null e undefined são omitidos. |
| `mapResponse(response)` | Converte o corpo em `{ data, pagination }`. Padrão: paginação Laravel na raiz. |
| `onSuccess(response)` | Recebe o corpo original de uma resposta válida e atual. |
| `onError(error)` | Recebe o erro original; cancelamentos internos são ignorados. |

Formato padrão: `{ data: T[], current_page, last_page, total, per_page, from?, to? }`. `normalizePagination` converte esse formato; `buildTableParams` também é exportado. APIs que retornam metadados em `meta` devem usar `mapResponse`.

Retornos:

- `data`: linhas; `pagination`: currentPage, totalPages, totalItems, itemsPerPage, from, to, hasNextPage, hasPreviousPage.
- `state`: estado atual da consulta; `error`: erro original ou `null`.
- `isFetching`: espera do debounce ou requisição em curso. `isLoading`: isFetching com lista vazia. Durante uma atualização, mantém os dados anteriores, inclusive se a nova chamada falhar.
- `setPage(n)`, `setPerPage(n)`, `setSearch(text)`, `setFilters(record)`, `setSort(column, direction?)`: alteram a consulta. Filtros substituem o objeto inteiro. Todos, exceto setPage, voltam à página 1. Sem direction, setSort alterna asc/desc na mesma coluna e começa em asc em outra.
- `clearFilters()`: limpa texto e filtros e volta à página 1. `refetchData()`: repete a consulta, inclusive após erro. `sortState`: column/direction para Table.

Mudanças de consulta, desativação e desmontagem cancelam a chamada anterior; respostas antigas são ignoradas mesmo quando o transporte não respeita o cancelamento. Mudanças somente em callbacks, requestOptions ou adaptadores de formato não disparam nova consulta; chame `refetchData()` se precisar recarregar.

Formato personalizado:

```tsx
type User = { id: number; name: string };
type Result = { items: User[]; page: number; pages: number; total: number; size: number };
const table = useApiTable<User, Result>({
  client,
  endpoint: '/users',
  buildParams: state => ({ page: state.page, limit: state.per_page, q: state.search }),
  mapResponse: result => ({
    data: result.items,
    pagination: {
      currentPage: result.page, totalPages: result.pages, totalItems: result.total,
      itemsPerPage: result.size,
      from: result.items.length ? (result.page - 1) * result.size + 1 : 0,
      to: result.items.length ? (result.page - 1) * result.size + result.items.length : 0,
      hasNextPage: result.page < result.pages, hasPreviousPage: result.page > 1,
    },
  }),
});
```

### useSearch e useUnifiedSearch

`useUnifiedSearch` é um alias de `useSearch`, com a mesma implementação. Importações: `/hooks/useSearch` e `/hooks/useUnifiedSearch`. Funciona sem endpoint para controlar busca local, ou com client/endpoint para consultar a API. Não filtra um array local automaticamente: use `onSearchChange` ou `searchQuery` na aplicação.

```tsx
'use client';
import { useSearch } from '@matheusssousa/ui/hooks/useSearch';
import { Search } from '@matheusssousa/ui/components/search';
import { Table } from '@matheusssousa/ui/components/table';
import { client } from '@/lib/http';

type User = { id: number; name: string };
export function Users() {
  const search = useSearch<User>({
    client, endpoint: '/users', debounceMs: 300,
    filters: [{ key: 'active', label: 'Ativo', type: 'select',
      options: [{ value: 1, label: 'Sim' }, { value: 0, label: 'Não' }] }],
  });
  return <>
    <Search {...search.searchProps} />
    {search.error && <button onClick={search.refetchData}>Tentar novamente</button>}
    <Table {...search.tableProps} columns={[{ key: 'name', label: 'Nome', sortable: true }]} />
  </>;
}
```

Aceita todas as opções de useApiTable e ainda `initialSearch`, `initialFilters` (prevalecem sobre initialState), `placeholder`, `filters: Filter[]` e `onSearchChange(query, filters)`. O callback recebe o estado inicial e as alterações após debounce, mesmo em modo local. `enabled` controla apenas a consulta HTTP.

Além dos retornos da tabela, expõe `searchQuery`, `filterValues`, `hasActiveFilters`, `clearAll`, `searchProps` e `tableProps`. `clearAll` equivale a clearFilters. `searchProps` conecta value, filters, filterValues, onSearch, onFilterChange e onClear ao componente Search. O debounce pertence ao hook, evitando espera duplicada no componente. `tableProps` contém data, pagination, loading, onPageChange, sortState e onSort.

## Inputs de imagem e SwitchField

### ImageInput, LogoInput e BannerInput

Importe por `/components/image-input`, `/components/logo-input` e `/components/banner-input`. Todos compartilham `ImageInputProps` e encaminham ref ao `<input type="file">`. Selecionam **um arquivo por vez**, validam tipo/tamanho, leem uma prévia Data URL e permitem removê-la. Não enviam arquivos automaticamente.

| Prop | Padrão / função |
| --- | --- |
| `value`, `currentImageUrl` | URL inicial/externa; value prevalece quando definido, inclusive null para limpar. Mudanças externas atualizam a prévia. |
| `onChange(file, previewUrl)` | Chamado após leitura válida; ambos são null ao remover. |
| `onValueChange(url)` | Recebe a Data URL ou null. |
| `onFileSelect(file)`, `onRemove()` | Callbacks específicos para seleção e remoção. |
| `name`, `id`, `label`, `description` | Nome do campo, identificação e textos acessíveis. Label padrão: Imagem; descrição: Selecione ou arraste uma imagem. |
| `maxSize` | `1`, em MiB (1024 × 1024 bytes). |
| `accept` | `image/jpeg,image/png,image/webp`; aceita MIME, image/* e extensões como .jpg. |
| `disabled`, `isLoading` | `false`; bloqueiam seleção, drop e remoção. |
| `error` | Mensagem externa; prevalece sobre erro local de validação/leitura. |
| `required` | `false`; exige arquivo apenas quando não há prévia existente. |
| `variant` | circle, square ou rectangle (padrão). |
| `size` | sm, md (padrão) ou lg; define largura máxima. |
| `className` | Classes do contêiner. |

`LogoInput` aplica label Logo, variant circle e size sm; `BannerInput` aplica label Banner, variant rectangle e size lg. Todas essas opções podem ser sobrescritas. `validateImageFile(file, accept, maxSize)` retorna uma mensagem ou null. Leituras anteriores são canceladas ao selecionar outro arquivo, remover, atualizar a URL externa ou desmontar.

```tsx
'use client';
import { useState } from 'react';
import { ImageInput } from '@matheusssousa/ui/components/image-input';
import { client } from '@/lib/http';

export function UploadPhoto() {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  async function save() {
    if (!file) return;
    setSaving(true);
    try {
      const body = new FormData(); body.append('photo', file);
      await client.request('POST', '/profile/photo', body);
      setMessage('Imagem salva.');
    } catch { setMessage('Não foi possível salvar.'); }
    finally { setSaving(false); }
  }
  return <>
    <ImageInput name="photo" label="Foto" maxSize={5} isLoading={saving}
      onChange={selected => setFile(selected)} />
    <button type="button" onClick={save} disabled={!file || saving}>Enviar</button>
    <p role="status">{message}</p>
  </>;
}
```

Use o File recebido no callback para montar FormData, especialmente com drag-and-drop: o drop não popula automaticamente `input.files`. A prévia base64 é para exibição. Valide também o arquivo no servidor. Esse componente não faz recorte ou compressão.

### SwitchField

Importação: `/components/switch-field`. Recebe `name` e `label` obrigatórios, `description` opcional e props do Switch. `checked` + `onCheckedChange` controlam o valor; `defaultChecked` define o valor inicial não controlado. O rótulo aponta para o botão e a descrição está associada por aria-describedby. `className` aplica-se ao contêiner.

```tsx
<SwitchField name="active" label="Ativo" description="Permite acesso à conta" defaultChecked />
```

Um input hidden envia `1`/`0` no formulário; disabled também desativa esse input. Prefira onCheckedChange para mudanças de valor; não substitua onClick do Switch. Para resets externos, use checked controlado.

## Modal de detalhes configurável

### ViewModal

Importação: `/components/view-modal`. Recebe `isOpen`, `onClose` e `config` obrigatórios; `data`, `loading`, `client`, `endpoint`, `requestOptions`, `can(permission)`, `onSuccess` e `onError` são opcionais. `data` fornece o objeto local. Com client e endpoint, busca o objeto diretamente no corpo da resposta ao abrir; nesse modo endpoint tem prioridade sobre data. Endpoints com envelope `{ data: item }` devem ser consultados pela aplicação, passando o item pela prop data.

`ViewModalConfig<T>` define:

- `title` e `description`: string ou função do item; funções só executam quando há dados.
- `size`: tamanho do Modal, padrão xl.
- `sections`: seções com title, description, columns (1–4, padrão 1), className, permission, show e fields.
- `tabs`: lista de `{ key, label, sections }`; quando presente, usa as seções da aba selecionada, inicialmente a primeira.
- `actions`: lista de `{ id, label, onClick(data), permission?, show?, variant?, color?, icon? }`.

Cada `ViewField<T>` recebe key (chave direta do objeto), label e demais props de Info, além de value, render(data) e show. A prioridade é render → value explícito → valor da chave. Zero e false são preservados; null/undefined aparecem como `-`. Objetos complexos devem usar render. `show` pode ser booleano ou função do item.

Campos, seções e ações com show falso são ocultados. Seções e ações com permission só aparecem quando can retorna true. Isso controla a interface; a API continua responsável pela autorização.

As ações são callbacks da aplicação: podem usar client.request com POST/PUT/PATCH/DELETE, navegação ou qualquer operação. Enquanto executam, os botões de ação ficam desativados. onSuccess é chamado depois de uma ação concluída; não fecha nem recarrega automaticamente. Falhas aparecem no modal e são repassadas a onError. Fechar, trocar endpoint ou desmontar cancela consultas pendentes; callbacks de ações antigas são ignorados, mas a operação de escrita iniciada pela aplicação não é cancelada.

```tsx
'use client';
import { ViewModal, type ViewModalConfig } from '@matheusssousa/ui/components/view-modal';
import { useViewModal } from '@matheusssousa/ui/hooks/useViewModal';
import { client } from '@/lib/http';

type User = { id: number; name: string; active: boolean };
export function UserDetails({ user }: { user: User }) {
  const modal = useViewModal<User>();
  const config: ViewModalConfig<User> = {
    title: item => item.name,
    sections: [{ columns: 2, fields: [
      { key: 'name', label: 'Nome' },
      { key: 'active', label: 'Ativo', render: item => item.active ? 'Sim' : 'Não' },
    ] }],
    actions: [{ id: 'activate', label: 'Ativar', onClick: async item => {
      await client.request('PATCH', `/users/${item.id}`, { active: true });
      modal.setData({ ...item, active: true });
    } }],
  };
  return <>
    <button onClick={() => modal.open(user)}>Detalhes</button>
    <ViewModal {...modal.modalProps} config={config} />
  </>;
}
```

### useViewModal e ViewModalUtils

`useViewModal<T>(configs?)` recebe um registro nome → ViewModalConfig. Retorna isOpen, data, open(item?), close(), setData, configs, createConfig(key, overrides?), createCustomConfig(config) e modalProps (isOpen/data/onClose). createConfig faz merge superficial e lança erro para chave desconhecida; seções fornecidas nos overrides substituem as anteriores. createCustomConfig preserva a configuração recebida. close mantém os dados; open sem item limpa os dados.

`ViewModalUtils.simple<T>(fields)` cria uma configuração com uma seção de duas colunas. `ViewModalUtils.multiSection<T>(sections)` preserva as seções recebidas. Configurações de entidades e nomes de permissões pertencem à aplicação. O modal usa Button/Info: mantenha ToastProvider acima dele.

## Referência comportamental dos demais hooks e funções

| API | Parâmetros, retorno e observações |
| --- | --- |
| `useApi(client, notifier?)` | Retorna request, get, post, put, delete, execute e isLoading. get(url, params?, options?); demais verbos(url, data?, options?); request(method, url, data?, options?); execute(fn, options?). Opções incluem successMessage, errorMessage, showSuccessToast e showErrorToast. Toast de sucesso é padrão em mutações; erro é padrão em todos. Use request para PATCH. Operações concorrentes mantêm loading até a última terminar. |
| `useFetch(fetchFn, options?)` | options: immediate=false, initialData=null, onSuccess(data), onError(message). Retorna data, loading, error, execute(...args), reset e setData. Falhas retornam null; somente a execução mais recente atualiza o estado. immediate chama a função sem argumentos. reset invalida resultados pendentes sem abortar o transporte. |
| `useAction(action, options?)` | action(previousState, FormData) deve retornar ActionResponse. options: notifier, successMessage, errorMessage, onSuccess(data), onError(message). Retorna state, formAction, pending, isSuccess, isError, data, error, errors e clearFieldError(field). Use formAction em form action. Resposta: success, data, error, errors, message e flags de toast opcionais. |
| `useCep(fetcher?)` | Retorna loading, error e fetchAddress(cep, signal?). Exige 8 dígitos, consulta ViaCEP e retorna CepData ou null. Usa fetch, inclusive quando o restante da aplicação usa Axios; fetcher permite injeção para testes. |
| `useDebounce(value, delay)` | Retorna o valor após delay em ms; cancela o timer anterior em alterações/desmontagem. |
| `useTheme()` | Retorna theme e setTheme; exige ThemeProvider. defaultTheme=system, storageKey=minte-ui-theme, attribute=class, enableSystem=true, disableTransitionOnChange=false são props do provider. |
| `useToast()` | Exige ToastProvider. Métodos success/error/warning/info(title, description?, options?) retornam id; addToast(config) cria manualmente; removeToast(id) remove. ToastProvider recebe children. |
| `handleInputChange(field, value, errors, clearFieldError, setFormData)` | Atualiza o campo com setState funcional e limpa seu erro se houver. Preserva outros campos. Aceita string, number, array de strings/números, boolean, Date ou undefined. |
| `getFieldErrors(field, errors?)` | Retorna lista de mensagens não vazias; aceita erro string ou string[]. |
| `getFieldError(field, errors?, fallback?)` | Retorna primeira mensagem ou fallback; sem ambos, undefined. |
| `hasFieldError(field, errors?)`, `getFirstError(errors?)` | Retornam boolean e primeira mensagem do objeto, respectivamente. Ordem de propriedades define a prioridade. |
| `removeMask(value)` | Mantém somente dígitos; null/undefined viram string vazia. Não preserva sinais ou separador decimal. |
| `removeMaskFromFields(data, fields)` | Retorna cópia rasa com máscara removida dos campos truthy; preserva 0/null/undefined/false como no utilitário original. |
| `keepAlphaNumeric(value)` | Mantém apenas letras ASCII e números. |
| `removeDiacritics(value)` | Normaliza NFD e remove marcas diacríticas; null/undefined viram string vazia. |
| `transformFields(data, fields, transformer)` | Retorna cópia rasa, aplicando transformer(value, field) a cada chave indicada. |
| `handleCopy(value, onSuccess?, onError?)` | Usa navigator.clipboard no navegador; retorna void e comunica resultado por callbacks. Requer Clipboard API disponível e contexto seguro. |
| `openDownloadUrl(url)` | Abre URL relativa ou HTTP(S) com link temporário; outros protocolos geram erro. Retorna void. O servidor controla Content-Disposition; a função não garante download, não adiciona bearer token e não usa o cliente HTTP. |
| `cn(...classes)` | Combina classes com clsx e tailwind-merge; disponível em functions/utils. |
| `getStatusBadge(status)` | Mapeia status para text/color/variant; functions/getStatusBadge também oferece getStatusLabel, getStatusMeta, isPositiveStatus, isNegativeStatus e isPendingStatus. Consulte o módulo para o vocabulário de status. |

A referência de tipos abaixo lista todos os parâmetros, props, variantes e exports de cada módulo, incluindo os formatadores e componentes já existentes. Use importações por subcaminho no servidor para não carregar componentes cliente. O módulo server tem entrada própria; functions/utils e functions/getStatusBadge são acessíveis por subcaminho e não têm export agregado na raiz.

## Migração dos utilitários do SaaS

Os arquivos locais do SaaS continuam independentes: esta mudança amplia a biblioteca. Para adotar a versão publicada, instale/atualize o pacote e substitua imports gradualmente.

| Origem | Destino / mudança |
| --- | --- |
| `@/lib/functions/handleInputChange`, `getFieldError`, `removeMask` | `@matheusssousa/ui/functions/<nome>`; mesmos argumentos, tipos exportados. |
| `@/hooks/useApiTable` | `@matheusssousa/ui/hooks/useApiTable`; passe client explicitamente; resposta personalizada via mapResponse. |
| `useSearch`, `useUnifiedSearch` locais | Um hook compartilhado; defaultParams deve virar initialState/buildParams conforme a finalidade. |
| Inputs locais de imagem | `/components/image-input`, logo-input, banner-input; configure variant/size e use callback para envio. |
| `SwitchField` local | `/components/switch-field`; name e label continuam obrigatórios. |
| `ViewModal` local | `/components/view-modal`; config deve ser objeto, fetchData vira endpoint + client, permissões via can, ações via callbacks. |
| `useViewModal` local | Passe seu registro de configurações; VIEW_CONFIGS não é importado pela biblioteca. |
| `resolveApiErrorMessage` local | `resolveHttpError` em functions/http; revise textos específicos que sua aplicação exija. |

## Migração da versão 0.2

- `Loading` e `LoadingOverlay` → `Spinner mode="block"` e `Spinner mode="overlay"`.
- `KpiCard` e `SummaryCard` → `Card metric={{ label, value, icon, description, tone, format, change }}`.
- `StatusIndicator` → `Badge status={status} display="indicator"`; `Badge` também aceita `status` no formato normal.
- Os caminhos antigos foram removidos. A versão 0.3 atualiza a API, mas não migra as cópias locais no frontend do SaaS.
## Desenvolvimento e publicação

Comandos na pasta do pacote:

| Comando | Resultado |
| --- | --- |
| `npm ci` | Instala as versões do lockfile, incluindo ferramentas de teste. |
| `npm run build` | Limpa apenas dist, compila JS e declarações TypeScript e copia styles.css. |
| `npm test` | Compila e roda testes HTTP, renderização e interação no DOM via jsdom. |
| `npm run docs` | Compila e atualiza sumário e referência de API neste README. Preserve os marcadores gerados. |
| `npm run docs:check` | Falha se a referência gerada não corresponder aos tipos atuais. |
| `npm pack --dry-run` | Confere o conteúdo publicável; não publica. |

Ao alterar APIs, atualize os exemplos e as descrições comportamentais manualmente e rode `npm run docs`. A seção gerada documenta a superfície completa de tipos, mas não substitui os exemplos de integração. `dist` é gerado e não deve ser editado diretamente. O pacote publica apenas dist, README e metadados do npm; testes e ferramentas de documentação ficam no repositório.

Na pasta `Codes/packages/ui`, execute `npm install` e `npm run build`. `npm pack --dry-run` confere os arquivos que serão enviados. O `prepack` compila a biblioteca antes de cada `npm publish`.

Para publicar no GitHub Packages, autentique-se com um personal access token **classic** que tenha `write:packages`:

```bash
npm login --scope=@matheusssousa --registry=https://npm.pkg.github.com --auth-type=legacy
npm publish
```

Quando alterar uma versão já publicada, incremente o número antes de publicar novamente, por exemplo com `npm version patch` para correções ou `npm version minor` para novas funcionalidades. O pacote tem `publishConfig.registry` apontando para o GitHub Packages. Não comite tokens nem arquivos `.npmrc` com credenciais.

## Tipos de responses de actions e Laravel

Importe pela raiz ou por `@matheusssousa/ui/types/responses`.

- `IndexResponse<T>` / `LaravelPaginatedResponse<T>`: resposta de `paginate()`, com `data: T[]`, metadados e URLs de navega??o. Campos adicionais opcionais preservam a compatibilidade existente.
- `ShowResponse<T>`: objeto `T` retornado diretamente pelo controller, sem pagina??o.
- `LaravelResourceResponse<T>`: API Resource individual, com `{ data: T }`.
- `LaravelPaginatedResourceResponse<T>`: API Resources paginados, com `{ data: T[], links, meta }`. No `useApiTable`, use `mapResponse` para esse formato.
- `IndexActionResponse<T>` e `ShowActionResponse<T>`: respostas envolvidas em `ActionResponse`, com feedback de sucesso, erros e mensagens.

`Promise<IndexResponse<Account>>` serve para uma action que retorna o corpo HTTP paginado diretamente; `Promise<ShowResponse<Account>>` serve para o objeto individual.

Uma action com `IndexActionResponse<Account>` retorna `{ success: true, data: page }`: a lista fica em `response.data?.data` e o total em `response.data?.total`. O envelope de feedback ? uma conven??o da aplica??o; Laravel n?o adiciona `success` automaticamente.

Refer?ncias: [pagina??o](https://laravel.com/docs/12.x/pagination#converting-results-to-json) e [API Resources](https://laravel.com/docs/12.x/eloquent-resources#pagination).

## Sidebar

`Sidebar`, `SidebarSection` e `SidebarNavItem` são exportados pela raiz e por `components/sidebar`, `components/sidebarSection` e `components/sidebarNavItem`. Importe também `@matheusssousa/ui/styles.css` e mantenha a configuração Tailwind da biblioteca.

```tsx
import { Sidebar, Search } from '@matheusssousa/ui';

<Sidebar
  sections={[{ title: 'Principal', items: [
    { label: 'Início', href: '/', exact: true },
    { label: 'Projetos', href: '/projects' },
  ] }]}
  logo={<img src="/logo.svg" alt="Logo" />}
  name="Meu sistema"
  search={open => open ? <Search color="secondary" onSearch={buscar} /> : <button onClick={abrirBusca} aria-label="Search">S</button>}
  notifications={open => <button onClick={abrirNotificacoes} aria-label="Notifications">{open ? 'Notifications' : 'N'}</button>}
  color="secondary"
  footer="v1.0"
/>
```

Nenhuma seção ou rota de permissões é incluída automaticamente. `permission` nos itens e `can(permission)` na sidebar são opcionais: sem `can`, todos os itens configurados são exibidos. Com `can`, o filtro alcança os submenus; seções vazias são omitidas, e um pai com link próprio continua disponível quando seus filhos são filtrados. Use `loading` enquanto carrega as permissões.

No Next.js, passe `linkComponent={Link}` e `pathname={usePathname()}` para navegação pelo router e atualização do item ativo. Sem router, os links são âncoras nativas. `exact` define correspondência exata; rotas internas também ativam o item pai por padrão.

`isOpen` e `onOpenChange` controlam a abertura externamente; sem eles, use `defaultOpen`. O desktop alterna entre ícones e menu expandido. No mobile, o menu recolhido mantém o botão de abertura e fecha ao navegar. `SidebarSection` mantém as props `section`, `isOpen`, `onLinkClick`, `openSubMenus` e `toggleSubMenu`; os dois últimos são opcionais quando o estado é interno.

`logo` permanece visivel ao recolher; `name` aparece apenas ao expandir. `search` fica acima da navegacao e `notifications` no final, abaixo do rodape. Esses slots aceitam componentes ou funcoes `(isOpen) => ReactNode`; conecte as acoes de busca e notificacoes da aplicacao. `color` aceita as cores `UIColor` e usa `secondary` por padrao nos itens ativos e no hover, incluindo submenus. Use `hover={false}` para desativar o efeito. `header` e `footer` continuam disponiveis.

<!-- API-REFERENCE:START -->
## Referência completa da API

Gerada das declarações TypeScript da biblioteca por `npm run docs`. Abra um módulo para consultar todos os tipos, props, variantes, argumentos e retornos. Tipos herdados de React/HTML mantêm o contrato da dependência indicada. As declarações auxiliares sem `export` aparecem somente para explicar os tipos públicos.

Cada título indica o subcaminho de importação; use `@matheusssousa/ui/` antes dele. Para `functions/serverFetch`, prefira a entrada `@matheusssousa/ui/server`. As declarações do índice ao final mostram exatamente quais nomes também estão disponíveis pela raiz.

### components

<details>
<summary><code>components/accordion</code></summary>

Fonte: [components/accordion](src/components/accordion.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const accordionVariants: (props?: ({
    variant?: "default" | "bordered" | "separated" | "panel" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const accordionItemVariants: (props?: ({
    variant?: "default" | "filled" | "outlined" | "panel" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const accordionTriggerVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    variant?: "default" | "panel" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const accordionContentVariants: (props?: ({
    variant?: "default" | "panel" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Grupo de painéis expansíveis. */
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof accordionVariants> {
    /** Identificador ou identificadores inicialmente abertos. */
    defaultValue?: string | string[];
    /** Permite manter vários painéis abertos. */
    multiple?: boolean;
}
/** Item identificado por `value` dentro de Accordion. */
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof accordionItemVariants> {
    /** Identificador único do painel. */
    value: string;
}
/** Botão que abre ou fecha um item. */
export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof accordionTriggerVariants> {
    /** Conteúdo do botão. */
    children: React.ReactNode;
    /** Conteúdo adicional à direita. */
    rightContent?: React.ReactNode;
}
/** Conteúdo visível quando o item está aberto. */
export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof accordionContentVariants> {
    /** Elementos do painel. */
    children: React.ReactNode;
}
declare const Accordion: React.ForwardRefExoticComponent<AccordionProps & React.RefAttributes<HTMLDivElement>>;
declare const AccordionTrigger: React.ForwardRefExoticComponent<AccordionTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const AccordionItemWrapper: React.ForwardRefExoticComponent<AccordionItemProps & React.RefAttributes<HTMLDivElement>>;
declare const AccordionContent: React.ForwardRefExoticComponent<AccordionContentProps & React.RefAttributes<HTMLDivElement>>;
export { Accordion, AccordionItemWrapper as AccordionItem, AccordionTrigger, AccordionContent };
```

</details>

<details>
<summary><code>components/alert</code></summary>

Fonte: [components/alert](src/components/alert.tsx).

```ts
import * as React from 'react';
import { type MotionBoxProps, type MotionPreset } from './motion.js';
import { type UIColor } from './theme.js';
/** Aviso com tone semântico, ícone, ação e animação opcionais. */
export interface AlertProps extends Omit<MotionBoxProps, 'title' | 'color' | 'children' | 'preset'> {
    /** Título do aviso. */
    title?: React.ReactNode;
    /** Descrição abaixo do título. */
    description?: React.ReactNode;
    /** Tone do fundo suave, borda e texto; padrão `info`. */
    color?: UIColor;
    /** Ícone personalizado; `false` o oculta. */
    icon?: React.ReactNode | false;
    /** Ação exibida ao lado do conteúdo. */
    action?: React.ReactNode;
    /** Exibe o botão de fechar e recebe seu clique. */
    onDismiss?: () => void;
    /** Preset de animação de entrada. */
    motionPreset?: MotionPreset;
    /** Conteúdo adicional do aviso. */
    children?: React.ReactNode;
}
export declare function Alert({ title, description, color, icon, action, onDismiss, motionPreset, className, children, ...props }: AlertProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/avatar</code></summary>

Fonte: [components/avatar](src/components/avatar.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps } from 'framer-motion';
import { type UIColor } from './theme.js';
declare const avatarVariants: (props?: ({
    variant?: "default" | "primary" | "secondary" | "success" | "tertiary" | "outline" | "gradient" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "xs" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Avatar com imagem ou iniciais; `color` define a cor do fallback. */
export interface AvatarProps extends Omit<HTMLMotionProps<'span'>, 'children'>, VariantProps<typeof avatarVariants> {
    /** Nome usado nas iniciais e como texto alternativo padrão. */
    name?: string | null;
    /** URL da imagem; quando ausente, mostra `fallback` ou iniciais. */
    src?: string | null;
    /** Texto alternativo da imagem. */
    alt?: string;
    /** Conteúdo exibido quando não há imagem. */
    fallback?: React.ReactNode;
    /** Cor do fallback; sobrepõe as variantes de cor, exceto `outline` e `gradient`. */
    color?: UIColor;
    /** Indicador de presença no canto do avatar. */
    status?: 'online' | 'offline' | 'busy' | 'away';
    /** Anima o avatar ao passar o mouse ou pressionar. */
    interactive?: boolean;
}
declare const Avatar: React.ForwardRefExoticComponent<Omit<AvatarProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export { Avatar, avatarVariants };
```

</details>

<details>
<summary><code>components/badge</code></summary>

Fonte: [components/badge](src/components/badge.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const badgeVariants: (props?: ({
    variant?: "default" | "cyan" | "purple" | "secondary" | "success" | "warning" | "info" | "neutral" | "tertiary" | "destructive" | "scheduled" | "cancelled" | "completed" | "outline" | "gradient" | "muted" | null | undefined;
    size?: "default" | "sm" | "lg" | "xs" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Rótulo ou indicador de status; `color` aplica um tone suave ao badge. */
export interface BadgeProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof badgeVariants> {
    /** Cor do badge; quando informada, prevalece sobre a cor de `variant` e `status`. */
    color?: UIColor;
    /** Ícone à esquerda do texto */
    leftIcon?: React.ReactNode;
    /** Ícone à direita do texto */
    rightIcon?: React.ReactNode;
    /** Se true, torna o badge clicável */
    clickable?: boolean;
    /** Função chamada quando o badge é clicado */
    onBadgeClick?: (e: React.MouseEvent<HTMLElement>) => void;
    /** Se true, adiciona um ponto indicador */
    dot?: boolean;
    /** Usa bordas totalmente arredondadas. */
    pill?: boolean;
    /** Anima a entrada e o hover do badge. */
    animated?: boolean;
    /** Anima o ponto indicador. */
    pulse?: boolean;
    /** Código de status resolvido por `getStatusMeta`. */
    status?: string | null;
    /** Mostra o badge completo ou apenas o indicador. */
    display?: 'badge' | 'indicator';
    /** Oculta o texto visível, preservando o rótulo acessível no indicador. */
    showLabel?: boolean;
}
declare function Badge({ className, variant, color, size, children, leftIcon, rightIcon, clickable, onBadgeClick, dot, pill, animated, pulse, status, display, showLabel, ...props }: BadgeProps): React.JSX.Element;
declare function StatusBadge({ status, className, ...props }: {
    status: 'active' | 'inactive' | 'pending' | 'verified' | 'blocked';
} & Omit<BadgeProps, 'children' | 'variant'>): React.JSX.Element;
declare function RoleBadge({ role, className, ...props }: {
    role: string;
} & Omit<BadgeProps, 'children'>): React.JSX.Element;
declare function CountBadge({ count, maxCount, showZero, className, ...props }: {
    count: number;
    maxCount?: number;
    showZero?: boolean;
} & Omit<BadgeProps, 'children'>): React.JSX.Element | null;
export { Badge, StatusBadge, RoleBadge, CountBadge, badgeVariants };
```

</details>

<details>
<summary><code>components/banner-input</code></summary>

Fonte: [components/banner-input](src/components/banner-input.tsx).

```ts
import { type ImageInputProps } from './image-input.js';
export type BannerInputProps = ImageInputProps;
export declare const BannerInput: import("react").ForwardRefExoticComponent<ImageInputProps & import("react").RefAttributes<HTMLInputElement>>;
```

</details>

<details>
<summary><code>components/breadcrumbs</code></summary>

Fonte: [components/breadcrumbs](src/components/breadcrumbs.tsx).

```ts
import * as React from 'react';
export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
}
/** Trilha de navegação com início e separador configuráveis. */
export interface BreadcrumbsProps {
    /** Páginas em ordem de navegação. */
    items?: BreadcrumbItem[];
    /** Elemento entre páginas. */
    separator?: React.ReactNode;
    /** Exibe o link inicial. */
    showHome?: boolean;
    /** Texto do link inicial. */
    homeLabel?: string;
    /** Destino do link inicial. */
    homeHref?: string;
    /** Classe da trilha. */
    className?: string;
    /** Classe dos links. */
    itemClassName?: string;
    /** Classe dos separadores. */
    separatorClassName?: string;
    /** Máximo de itens exibidos sem abreviação. */
    maxItems?: number;
}
declare const Breadcrumbs: React.ForwardRefExoticComponent<BreadcrumbsProps & React.RefAttributes<HTMLElement>>;
export declare const BreadcrumbsBuilder: {
    create: (items: BreadcrumbItem[]) => BreadcrumbItem[];
    item: (label: string, href?: string, icon?: React.ReactNode) => BreadcrumbItem;
};
export { Breadcrumbs };
```

</details>

<details>
<summary><code>components/bulk-actions</code></summary>

Fonte: [components/bulk-actions](src/components/bulk-actions.tsx).

```ts
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
export declare function BulkActions<T>({ selectedItems, color, onClearSelection, onBulkDelete, onBulkRestore, onBulkForceDelete, onBulkStatusChange, onBulkSuspend, }: BulkActionsProps<T>): import("react").JSX.Element | null;
```

</details>

<details>
<summary><code>components/button</code></summary>

Fonte: [components/button](src/components/button.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    variant?: "text" | "filled" | "icon" | "success" | "warning" | "danger" | "deleted" | "gradient" | "soft" | "ghost" | "outlined" | "edited" | "restored" | "linkSettings" | "fastAction" | null | undefined;
    color?: "default" | "dark" | "blue" | "cyan" | "gray" | "green" | "orange" | "pink" | "purple" | "red" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral" | "tertiary" | "background" | "amber" | "card" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "icon" | "xs" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type PolymorphicProps = React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;
/**
 * Propriedades do componente Button, estendendo as propriedades de botões e links HTML, com variantes de estilo, estado de carregamento, ícones, animações e funcionalidade de cópia para área de transferência. Permite renderizar como um botão tradicional ou como um link, com estilos adaptados para cada caso. Ideal para ações comuns em interfaces de usuário, oferecendo feedback visual e interatividade aprimorada.
 *
 * @property {boolean} [asLink=false] - Indica se o componente deve ser renderizado como um link (anchor) em vez de um botão.
 * @property {string} [href] - URL para a qual o link deve apontar, se `asLink` for verdadeiro.
 * @property {boolean} [loading=false] - Indica se o botão está em estado de carregamento, desabilitando interações e mostrando um indicador visual.
 * @property {React.ReactNode} [leftIcon] - Ícone a ser exibido à esquerda do conteúdo do botão.
 * @property {React.ReactNode} [rightIcon] - Ícone a ser exibido à direita do conteúdo do botão.
 * @property {boolean} [ripple=true] - Indica se o efeito de ripple deve ser aplicado ao clicar no botão.
 * @property {string | number} [copyValue] - Valor a ser copiado para a área de transferência ao clicar no botão. Se fornecido, o botão exibirá um ícone de cópia e feedback visual.
 * @property {boolean} [openLinkInNewTab=false] - Indica se o link deve ser aberto em uma nova aba quando `asLink` for verdadeiro.
 * @property {boolean} [animationEntrance=false] - Indica se a animação de entrada deve ser aplicada ao renderizar o botão.
 * @property {boolean} [animationOut=false] - Indica se a animação de saída deve ser aplicada ao desmontar o botão.
 * @property {boolean} [active=false] - Indica se o botão está em estado ativo, aplicando estilos visuais adicionais.
 */
/** Botão ou link com variante, tamanho, tone e estados opcionais. */
export interface ButtonProps extends Omit<PolymorphicProps, 'color'>, VariantProps<typeof buttonVariants> {
    /** Renderiza como link usando `href`. */
    asLink?: boolean;
    /** Destino quando `asLink` está ativo. */
    href?: string;
    /** Mostra estado de carregamento e impede novos cliques. */
    loading?: boolean;
    /** Ícone antes do texto. */
    leftIcon?: React.ReactNode;
    /** Ícone depois do texto. */
    rightIcon?: React.ReactNode;
    /** Habilita efeito visual de clique. */
    ripple?: boolean;
    /** Valor copiado para a área de transferência ao clicar. */
    copyValue?: string | number;
    /** Anima a entrada. */
    animationEntrance?: boolean;
    /** Anima a saída. */
    animationOut?: boolean;
    /** Marca o botão como ativo. */
    active?: boolean;
    /** Faz o botão ocupar a largura disponível. */
    fullWidth?: boolean;
    /** Habilita escala na interação. */
    motionScale?: boolean;
}
/**
 * Botão altamente personalizável com suporte a variantes, estados de carregamento, ícones, animações e funcionalidade de cópia para área de transferência. Pode ser renderizado como um botão tradicional ou como um link, com estilos adaptados para cada caso. Ideal para ações comuns em interfaces de usuário, oferecendo feedback visual e interatividade aprimorada.
 *
 * @param {ButtonProps}
 * @returns {JSX.Element} Um componente de botão renderizado com base nas propriedades fornecidas.
 */
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;
export { Button, buttonVariants };
```

</details>

<details>
<summary><code>components/calendar</code></summary>

Fonte: [components/calendar](src/components/calendar.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const calendarVariants: (props?: ({
    variant?: "default" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface CalendarEvent {
    id: string | number;
    date: Date;
    title: string;
    color?: string;
    description?: string;
}
export type CalendarMode = 'single' | 'multiple' | 'range';
export type CalendarView = 'days' | 'months' | 'years' | 'week';
/** Calendário de dias, meses e anos com seleção simples, múltipla ou por intervalo. */
export interface CalendarProps extends VariantProps<typeof calendarVariants> {
    /** Modo de seleção; padrão `single`. */
    mode?: CalendarMode;
    /** Visualização inicial; padrão `days`. */
    view?: CalendarView;
    /** Data ou datas selecionadas, conforme `mode`. */
    selected?: Date | Date[] | {
        from: Date;
        to?: Date;
    };
    /** Chamado quando a seleção muda. */
    onSelect?: (date: Date | Date[] | {
        from: Date;
        to?: Date;
    } | undefined) => void;
    /** Retorna `true` para bloquear uma data. */
    disabled?: (date: Date) => boolean;
    /** Eventos exibidos nas datas correspondentes. */
    events?: CalendarEvent[];
    /** Datas disponíveis no formato `YYYY-MM-DD`. */
    availableDays?: string[];
    /** Exibe os números das semanas. */
    showWeekNumbers?: boolean;
    /** Exibe dias dos meses vizinhos. */
    showOutsideDays?: boolean;
    /** Limite inferior para seleção. */
    minDate?: Date;
    /** Limite superior para seleção. */
    maxDate?: Date;
    /** Localidade reservada para formatação futura; os nomes atuais são exibidos em português. */
    locale?: string;
    /** Dia inicial da semana, de 0 (domingo) a 6 (sábado). */
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    /** Tone dos estados de seleção e navegação; padrão `primary`. */
    color?: UIColor;
    /** Classes adicionais no contêiner. */
    className?: string;
    /** Estilos adicionais no contêiner. */
    style?: React.CSSProperties;
    /** Quantidade de meses visíveis. */
    numberOfMonths?: number;
    /** Anima as transições entre visualizações. */
    animateTransitions?: boolean;
    /** Chamado quando o mês visível muda. */
    onMonthChange?: (month: Date) => void;
    /** Chamado quando a visualização muda. */
    onViewChange?: (view: CalendarView) => void;
    /** Exibe pontos de eventos nas células. */
    showEventIndicator?: boolean;
    /** Permite alternar entre dias, meses e anos pelo título. */
    allowViewChange?: boolean;
}
declare const Calendar: React.ForwardRefExoticComponent<CalendarProps & React.RefAttributes<HTMLDivElement>>;
export { Calendar, calendarVariants };
```

</details>

<details>
<summary><code>components/card</code></summary>

Fonte: [components/card](src/components/card.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps } from 'framer-motion';
import { type MotionPreset } from './motion.js';
import { type UIColor, type UIRadius } from './theme.js';
/** Dados apresentados quando `Card` recebe a prop `metric`. */
export interface CardMetric {
    /** Nome da métrica. */
    label: React.ReactNode;
    /** Valor principal. */
    value: React.ReactNode;
    /** Texto auxiliar da métrica. */
    description?: React.ReactNode;
    /** Ícone ao lado do valor. */
    icon?: React.ReactNode;
    /** Tone do destaque da métrica. */
    tone?: UIColor;
    /** Formatação numérica aplicada ao valor. */
    format?: 'currency' | 'number';
    /** Variação percentual em relação ao período anterior. */
    change?: number;
}
declare const cardVariants: (props?: ({
    variant?: "default" | "filled" | "gradient" | "interactive" | "elevated" | "glass" | "minimal" | "outlined" | null | undefined;
    size?: "none" | "sm" | "md" | "lg" | "xl" | "xs" | null | undefined;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral" | "tertiary" | "background" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Superfície com cabeçalho, conteúdo e métrica opcionais. */
export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'title' | 'children'>, VariantProps<typeof cardVariants> {
    /** Título no cabeçalho. */
    title?: React.ReactNode;
    /** Descrição no cabeçalho. */
    description?: React.ReactNode;
    /** Ícone do cabeçalho. */
    icon?: React.ReactNode;
    /** Ação no cabeçalho. */
    action?: React.ReactNode;
    /** Conteúdo do rodapé. */
    footer?: React.ReactNode;
    /** Raio dos cantos. */
    radius?: UIRadius;
    /** Tone das superfícies coloridas e da métrica. */
    color?: UIColor;
    /** Habilita aparência interativa. */
    interactive?: boolean;
    /** Mostra estrutura provisória de carregamento. */
    loading?: boolean;
    /** Anima a entrada. */
    animationEntrance?: boolean;
    /** Anima a saída. */
    animationOut?: boolean;
    /** Preset de animação. */
    motionPreset?: MotionPreset;
    /** Atraso da animação em segundos. */
    animationDelay?: number;
    /** Conteúdo principal. */
    children?: React.ReactNode;
    /** Dados para apresentar um cartão de métrica. */
    metric?: CardMetric;
}
declare const Card: React.ForwardRefExoticComponent<Omit<CardProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Card, cardVariants };
```

</details>

<details>
<summary><code>components/carousel</code></summary>

Fonte: [components/carousel](src/components/carousel.tsx).

```ts
import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const carouselVariants: (props?: ({
    variant?: "default" | "full" | "card" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | "auto" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface CarouselItem {
    id: string | number;
    content: React.ReactNode;
    alt?: string;
}
/** Carrossel de conteúdo com navegação, indicadores e reprodução automática. */
export interface CarouselProps extends VariantProps<typeof carouselVariants> {
    /** Slides a exibir. */
    items: CarouselItem[];
    /** Classes do contêiner. */
    className?: string;
    /** Estilos do contêiner. */
    style?: React.CSSProperties;
    /** Cor do indicador ativo; padrão `primary`. */
    color?: UIColor;
    /** Exibe botões de navegação. */
    showArrows?: boolean;
    /** Exibe os indicadores de slide. */
    showIndicators?: boolean;
    /** Avança automaticamente. */
    autoPlay?: boolean;
    /** Intervalo da reprodução automática em milissegundos. */
    autoPlayInterval?: number;
    /** Pausa a reprodução automática ao passar o mouse. */
    pauseOnHover?: boolean;
    /** Habilita navegação por gesto. */
    enableSwipe?: boolean;
    /** Retorna ao primeiro slide após o último. */
    loop?: boolean;
    /** Recebe o índice do slide exibido. */
    onSlideChange?: (index: number) => void;
    /** Índice inicial do slide. */
    initialSlide?: number;
}
export declare const Carousel: React.ForwardRefExoticComponent<CarouselProps & React.RefAttributes<HTMLDivElement>>;
export interface ImageCarouselItem {
    id: string | number;
    src: string;
    alt: string;
    title?: string;
    description?: string;
}
/** Carrossel de imagens com efeito opcional de zoom. */
export interface ImageCarouselProps extends Omit<CarouselProps, 'items'> {
    /** Imagens a exibir. */
    images: ImageCarouselItem[];
    /** Ativa o efeito de zoom durante a exibição. */
    enableZoomEffect?: boolean;
    /** Duração do zoom em segundos. */
    zoomDuration?: number;
    /** Estilo da animação de zoom. */
    zoomVariant?: 'subtle' | 'smooth' | 'dramatic' | 'pulse';
}
export declare const ImageCarousel: React.ForwardRefExoticComponent<ImageCarouselProps & React.RefAttributes<HTMLDivElement>>;
export interface TabCarouselItem {
    id: string | number;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
}
/** Carrossel controlado por abas. */
export interface TabCarouselProps extends Omit<CarouselProps, 'items' | 'showArrows' | 'showIndicators'> {
    /** Abas e conteúdos correspondentes. */
    tabs: TabCarouselItem[];
    /** Posiciona as abas acima ou abaixo do conteúdo. */
    tabPosition?: 'top' | 'bottom';
    /** Aparência das abas. */
    tabVariant?: 'pills' | 'underline';
}
export declare const TabCarousel: React.ForwardRefExoticComponent<TabCarouselProps & React.RefAttributes<HTMLDivElement>>;
export {};
```

</details>

<details>
<summary><code>components/chart</code></summary>

Fonte: [components/chart](src/components/chart.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const chartVariants: (props?: ({
    variant?: "default" | "filled" | "minimal" | "outlined" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ChartDataPoint = {
    label: string;
    value: number;
    color?: string;
};
/** Configuração compartilhada pelos gráficos. */
export interface BaseChartProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chartVariants> {
    /** Pontos exibidos no gráfico. */
    data: ChartDataPoint[];
    /** Título acima do gráfico. */
    title?: string;
    /** Texto auxiliar abaixo do título. */
    subtitle?: string;
    /** Exibe a legenda. */
    showLegend?: boolean;
    /** Exibe linhas de grade. */
    showGrid?: boolean;
    /** Exibe valores dos pontos. */
    showValues?: boolean;
    /** Anima a apresentação dos dados. */
    animate?: boolean;
    /** Cores CSS usadas nas séries; padrão usa os tokens `--chart-*`. */
    colors?: string[];
}
/** Opções específicas do gráfico de linha. */
export interface LineChartProps extends BaseChartProps {
    /** Suaviza a curva. */
    smooth?: boolean;
    /** Espessura da linha em pixels. */
    strokeWidth?: number;
    /** Exibe marcadores dos pontos. */
    showDots?: boolean;
    /** Preenche a área abaixo da linha. */
    fillArea?: boolean;
}
export declare const LineChart: React.ForwardRefExoticComponent<LineChartProps & React.RefAttributes<HTMLDivElement>>;
/** Opções específicas do gráfico de barras. */
export interface BarChartProps extends BaseChartProps {
    /** Desenha as barras na horizontal. */
    horizontal?: boolean;
    /** Raio dos cantos das barras em pixels. */
    barRadius?: number;
}
export declare const BarChart: React.ForwardRefExoticComponent<BarChartProps & React.RefAttributes<HTMLDivElement>>;
/** Opções específicas do gráfico de setores. */
export interface PieChartProps extends BaseChartProps {
    /** Abre um espaço no centro do gráfico. */
    donut?: boolean;
    /** Largura do anel quando `donut` está ativo. */
    donutWidth?: number;
    /** Exibe a porcentagem por setor. */
    showPercentage?: boolean;
}
export declare const PieChart: React.ForwardRefExoticComponent<PieChartProps & React.RefAttributes<HTMLDivElement>>;
/** Opções específicas do gráfico de área. */
export interface AreaChartProps extends BaseChartProps {
    /** Suaviza a curva. */
    smooth?: boolean;
    /** Espessura da borda da área em pixels. */
    strokeWidth?: number;
    /** Opacidade do preenchimento, de 0 a 1. */
    fillOpacity?: number;
}
export declare const AreaChart: React.ForwardRefExoticComponent<AreaChartProps & React.RefAttributes<HTMLDivElement>>;
export declare const DonutChart: React.ForwardRefExoticComponent<PieChartProps & React.RefAttributes<HTMLDivElement>>;
export {};
```

</details>

<details>
<summary><code>components/data-types</code></summary>

Fonte: [components/data-types](src/components/data-types.ts).

```ts
import type * as React from 'react';
import type { UIColor } from './theme.js';
import type { SelectOption } from './select.js';
export type CellEditorValue = string | number | undefined;
export interface CellEditorBase<T = TableData> {
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    /** Retorne campos dependentes a atualizar junto com este valor. */
    onChange?: (value: unknown, draftRow: T) => Record<string, unknown> | void;
    /** Converte o rascunho antes de comparar, validar e salvar. */
    parse?: (value: CellEditorValue, row: T) => unknown;
    /** Retorne uma mensagem para impedir o salvamento. */
    validate?: (value: unknown, row: T) => string | undefined;
}
export type CellEditor<T = TableData> = CellEditorBase<T> & ({
    type: 'input';
    inputType?: 'text' | 'number' | 'email' | 'url' | 'tel' | 'password' | 'search';
} | {
    type: 'date';
    min?: string;
    max?: string;
} | {
    type: 'money';
    currency?: string;
} | {
    type: 'select';
    options: SelectOption[];
    searchable?: boolean;
    clearable?: boolean;
    display?: 'text' | 'badge';
});
export interface CellSaveEvent<T = TableData> {
    row: T;
    rowKey: string | number;
    columnKey: string;
    value: unknown;
    previousValue: unknown;
}
export interface RowSaveEvent<T = TableData> {
    /** Snapshot confirmado antes das alteracoes. */
    row: T;
    rowKey: string | number;
    /** Apenas os campos alterados, apos conversao e validacao. */
    changes: Record<string, unknown>;
    previousValues: Record<string, unknown>;
    /** Snapshot completo com as alteracoes aplicadas. */
    updatedRow: T;
}
export type TableRowKey = string | number;
export type TableFieldErrors = Record<string, string>;
export interface TableEditingState {
    dirtyRows: TableRowKey[];
    savingRows: TableRowKey[];
    errorRows: Array<{
        rowKey: TableRowKey;
        errors: TableFieldErrors;
        error?: string;
    }>;
}
export interface TableSaveResult {
    rowKey: TableRowKey;
    ok: boolean;
    status: 'saved' | 'unchanged' | 'invalid' | 'error' | 'not-found' | 'readonly';
    errors?: TableFieldErrors;
    error?: string;
}
export interface TableEditingController {
    saveRow(rowKey: TableRowKey): Promise<TableSaveResult>;
    saveAll(): Promise<{
        ok: boolean;
        results: TableSaveResult[];
    }>;
    /** Retorna false se a linha estiver salvando ou nao existir. */
    discardRow(rowKey: TableRowKey): boolean;
    resetRow(rowKey: TableRowKey): boolean;
    getEditingState(): TableEditingState;
    focusCell(rowKey: TableRowKey, columnKey: string): boolean;
    getDraftRow(rowKey: TableRowKey): TableData | undefined;
    setDraftValue(rowKey: TableRowKey, columnKey: string, value: unknown): boolean;
    patchDraft(rowKey: TableRowKey, changes: Record<string, unknown>): boolean;
    validateRow(rowKey: TableRowKey): TableFieldErrors;
}
export interface TableData {
    [key: string]: any;
}
export interface Column<T = any> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    /** Editor fixo ou definido individualmente por linha. */
    editor?: CellEditor<T> | ((row: T, index: number) => CellEditor<T> | false);
    className?: string;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
}
export interface SortState {
    column: string | null;
    direction: 'asc' | 'desc' | null;
}
export interface PaginationState {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
export interface FilterOption {
    value: string | number | boolean;
    label: string;
    count?: number;
}
export interface Filter {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'money';
    options?: FilterOption[];
    placeholder?: string;
    value?: any;
}
/** Busca com filtros opcionais; `color` define o tone dos acentos internos. */
export interface SearchProps {
    /** Termo controlado da busca. */
    value?: string;
    /** Texto mostrado quando a busca está vazia. */
    placeholder?: string;
    /** Recebe o termo pesquisado. */
    onSearch?: (query: string) => void;
    /** Chamado quando o termo é limpo. */
    onClear?: () => void;
    /** Classes do contêiner. */
    className?: string;
    /** Impede a interação com a busca. */
    disabled?: boolean;
    /** Definições dos filtros disponíveis. */
    filters?: Filter[];
    /** Valores atuais dos filtros. */
    filterValues?: Record<string, any>;
    /** Recebe os valores atualizados dos filtros. */
    onFilterChange?: (filters: Record<string, any>) => void;
    /** Exibe os controles de filtros. */
    showFilters?: boolean;
    /** Exibe a ação de limpar todos os filtros. */
    showClearAll?: boolean;
    /** Intervalo de debounce em milissegundos. */
    debounceMs?: number;
    /** Habilita o comportamento de busca global. */
    globalSearch?: boolean;
    /** Cor de foco, seleção e indicadores; padrão `primary`. */
    color?: UIColor;
}
```

</details>

<details>
<summary><code>components/draggable-table</code></summary>

Fonte: [components/draggable-table](src/components/draggable-table.tsx).

```ts
import type { TableData, Column, SortState, PaginationState } from './data-types.js';
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const tableVariants: (props?: ({
    variant?: "default" | "ghost" | "striped" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Tabela com suporte opcional a reordenação de linhas. */
export interface DraggableTableProps extends VariantProps<typeof tableVariants> {
    /** Definição das colunas. */
    columns: Column[];
    /** Linhas exibidas. */
    data: TableData[];
    /** Exibe estado de carregamento. */
    loading?: boolean;
    /** Texto quando não há linhas. */
    emptyMessage?: string;
    /** Classe do contêiner. */
    className?: string;
    /** Habilita ordenação pelos cabeçalhos. */
    sortable?: boolean;
    /** Coluna e direção de ordenação atuais. */
    sortState?: SortState;
    /** Recebe a coluna escolhida para ordenação. */
    onSort?: (column: string) => void;
    /** Estado da paginação. */
    pagination?: PaginationState;
    /** Recebe a página escolhida. */
    onPageChange?: (page: number) => void;
    /** Permite selecionar linhas. */
    selectable?: boolean;
    /** Recebe as chaves das linhas selecionadas. */
    onSelectionChange?: (selectedRows: (string | number)[]) => void;
    /** Campo que identifica cada linha. */
    rowKey?: string;
    /** Recebe a linha e o índice após clique. */
    onRowClick?: (row: TableData, index: number) => void;
    /** Renderiza ações para a seleção atual. */
    renderBulkActions?: (selectedRows: (string | number)[], clearSelection: () => void) => React.ReactNode;
    /** Habilita adaptação a telas estreitas. */
    responsive?: boolean;
    /** Permite arrastar linhas. */
    draggable?: boolean;
    /** Recebe as linhas na nova ordem. */
    onReorder?: (reorderedData: TableData[]) => void;
}
declare const DraggableTable: React.ForwardRefExoticComponent<DraggableTableProps & React.RefAttributes<HTMLTableElement>>;
export { DraggableTable, tableVariants };
```

</details>

<details>
<summary><code>components/dropdown-menu</code></summary>

Fonte: [components/dropdown-menu](src/components/dropdown-menu.tsx).

```ts
import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { type HTMLMotionProps } from "framer-motion";
import { type UIColor } from './theme.js';
type DropdownSide = "top" | "right" | "bottom" | "left";
type DropdownAlign = "start" | "center" | "end";
export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}
declare function DropdownMenu({ children, open: controlledOpen, defaultOpen, onOpenChange, className, ...props }: DropdownMenuProps): React.JSX.Element;
export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}
declare const DropdownMenuTrigger: React.ForwardRefExoticComponent<DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
declare const dropdownContentVariants: (props?: ({
    variant?: "default" | "elevated" | "glass" | "minimal" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface DropdownMenuContentProps extends Omit<HTMLMotionProps<"div">, "children">, VariantProps<typeof dropdownContentVariants> {
    children: React.ReactNode;
    align?: DropdownAlign;
    side?: DropdownSide;
    sideOffset?: number;
    alignOffset?: number;
    collisionPadding?: number;
    matchTriggerWidth?: boolean;
}
declare const DropdownMenuContent: React.ForwardRefExoticComponent<Omit<DropdownMenuContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const dropdownItemVariants: (props?: ({
    variant?: "default" | "primary" | "success" | "destructive" | "muted" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    inset?: boolean | null | undefined;
    selected?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Item de menu com ícone, descrição e seleção opcional. */
export interface DropdownMenuItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof dropdownItemVariants> {
    /** Cor do item e do estado selecionado; quando informada, prevalece sobre `variant`. */
    color?: UIColor;
    /** Usa o elemento filho como item em vez de uma `div`. */
    asChild?: boolean;
    /** Impede a seleção do item. */
    disabled?: boolean;
    /** Fecha o menu após selecionar; padrão `true`. */
    closeOnSelect?: boolean;
    /** Ícone no início do item. */
    icon?: React.ReactNode;
    /** Título do item. */
    title?: React.ReactNode;
    /** Texto auxiliar abaixo do título. */
    description?: React.ReactNode;
    /** Atalho alinhado à direita. */
    shortcut?: React.ReactNode;
}
declare const DropdownMenuItem: React.ForwardRefExoticComponent<DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuGroup: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuLabel: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
export interface DropdownMenuHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
    avatar?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: React.ReactNode;
}
declare const DropdownMenuHeader: React.ForwardRefExoticComponent<DropdownMenuHeaderProps & React.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSeparator: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuShortcut: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLSpanElement> & React.RefAttributes<HTMLSpanElement>>;
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuHeader, DropdownMenuSeparator, DropdownMenuShortcut, dropdownContentVariants, dropdownItemVariants, };
```

</details>

<details>
<summary><code>components/empty-state</code></summary>

Fonte: [components/empty-state](src/components/empty-state.tsx).

```ts
import * as React from 'react';
import { type MotionBoxProps, type MotionPreset } from './motion.js';
/** Mensagem exibida quando uma coleção está vazia. */
export interface EmptyStateProps extends Omit<MotionBoxProps, 'title' | 'children' | 'preset'> {
    /** Ícone acima do título. */
    icon?: React.ReactNode;
    /** Título principal. */
    title: React.ReactNode;
    /** Explicação abaixo do título. */
    description?: React.ReactNode;
    /** Botão ou link de ação. */
    action?: React.ReactNode;
    /** Reduz tamanho e espaçamento. */
    compact?: boolean;
    /** Preset de animação. */
    motionPreset?: MotionPreset;
}
export declare function EmptyState({ icon, title, description, action, compact, motionPreset, className, ...props }: EmptyStateProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/form-field</code></summary>

Fonte: [components/form-field](src/components/form-field.tsx).

```ts
import * as React from 'react';
/** Rótulo, ajuda e erro para um controle de formulário filho. */
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Rótulo acima do controle. */
    label?: React.ReactNode;
    /** ID do controle associado ao rótulo. */
    htmlFor?: string;
    /** Texto de ajuda quando não há erro. */
    description?: React.ReactNode;
    /** Mensagem de erro com `role="alert"`. */
    error?: React.ReactNode;
    /** Marca o campo como obrigatório. */
    required?: boolean;
    /** Texto para campos não obrigatórios. */
    optionalLabel?: string;
}
export declare function FormField({ label, htmlFor, description, error, required, optionalLabel, className, children, ...props }: FormFieldProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/gallery</code></summary>

Fonte: [components/gallery](src/components/gallery.tsx).

```ts
import React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const galleryVariants: (props?: ({
    variant?: "grid" | "slider" | "expandable" | "masonry" | "carousel" | "justified" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface GalleryImage {
    id: string | number;
    src: string;
    alt: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
}
interface GalleryProps extends VariantProps<typeof galleryVariants> {
    images: GalleryImage[];
    className?: string;
    enableLightbox?: boolean;
    showOverlay?: boolean;
    overlayActions?: boolean;
    onImageClick?: (image: GalleryImage, index: number) => void;
    enableLazyLoading?: boolean;
    gap?: 'sm' | 'md' | 'lg';
}
export declare const Gallery: React.ForwardRefExoticComponent<GalleryProps & React.RefAttributes<HTMLDivElement>>;
export {};
```

</details>

<details>
<summary><code>components/image-input</code></summary>

Fonte: [components/image-input](src/components/image-input.tsx).

```ts
import * as React from 'react';
export interface ImageInputProps {
    value?: string | null;
    currentImageUrl?: string | null;
    onChange?: (file: File | null, previewUrl: string | null) => void;
    onValueChange?: (previewUrl: string | null) => void;
    onFileSelect?: (file: File) => void;
    onRemove?: () => void;
    name?: string;
    id?: string;
    label?: string;
    description?: string;
    maxSize?: number;
    accept?: string;
    disabled?: boolean;
    isLoading?: boolean;
    error?: string;
    className?: string;
    required?: boolean;
    variant?: 'circle' | 'square' | 'rectangle';
    size?: 'sm' | 'md' | 'lg';
}
export declare function validateImageFile(file: Pick<File, 'name' | 'type' | 'size'>, accept: string, maxSize: number): string | null;
export declare const ImageInput: React.ForwardRefExoticComponent<ImageInputProps & React.RefAttributes<HTMLInputElement>>;
```

</details>

<details>
<summary><code>components/image</code></summary>

Fonte: [components/image](src/components/image.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const imageVariants: (props?: ({
    aspectRatio?: "auto" | "square" | "video" | "4/3" | "3/2" | "21/9" | null | undefined;
    objectFit?: "none" | "contain" | "cover" | "fill" | "scaleDown" | null | undefined;
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "2xl" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Imagem com placeholder e fallback. */
export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'>, VariantProps<typeof imageVariants> {
    /** URL da imagem principal. */
    src?: string | null;
    /** Descrição acessível da imagem. */
    alt: string;
    /** URL usada quando a imagem principal falha. */
    fallback?: string;
    /** Classe do contêiner externo. */
    containerClassName?: string;
    /** Mostra placeholder durante o carregamento. */
    showPlaceholder?: boolean;
    /** Classe do placeholder. */
    placeholderClassName?: string;
    /** Chamado após carregar a imagem. */
    onLoadSuccess?: () => void;
    /** Chamado quando a imagem falha. */
    onLoadError?: () => void;
}
declare const Image: React.ForwardRefExoticComponent<ImageProps & React.RefAttributes<HTMLDivElement>>;
/** Imagem formatada para avatar. */
export interface AvatarImageProps extends Omit<ImageProps, 'aspectRatio' | 'objectFit' | 'rounded'> {
    /** Diâmetro do avatar. */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    /** Forma do avatar. */
    shape?: 'circle' | 'square' | 'rounded';
}
declare const AvatarImage: React.ForwardRefExoticComponent<AvatarImageProps & React.RefAttributes<HTMLDivElement>>;
/** Imagem com proporções prontas para serviços. */
export interface ServiceImageProps extends Omit<ImageProps, 'aspectRatio' | 'rounded'> {
    /** Proporção e raio aplicados à imagem. */
    variant?: 'card' | 'detail' | 'thumbnail' | 'banner';
}
declare const ServiceImage: React.ForwardRefExoticComponent<ServiceImageProps & React.RefAttributes<HTMLDivElement>>;
export { Image, AvatarImage, ServiceImage, imageVariants };
```

</details>

<details>
<summary><code>components/info</code></summary>

Fonte: [components/info](src/components/info.tsx).

```ts
import { type VariantProps } from "class-variance-authority";
import React from "react";
declare const infoVariants: (props?: ({
    variant?: "default" | "filled" | "minimal" | "card" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    grid?: 1 | 3 | 5 | 4 | 2 | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Campo de informação com opção de cópia e link. */
export interface InfoProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof infoVariants> {
    /** Nome da informação. */
    label: React.ReactNode;
    /** Valor exibido; usa `children` quando omitido. */
    value?: React.ReactNode;
    /** Ícone ao lado da informação. */
    icon?: React.ReactNode;
    /** Exibe controle para copiar o valor. */
    copyable?: boolean;
    /** Exibe estado de carregamento. */
    loading?: boolean;
    /** Destino de navegação opcional. */
    link?: string;
}
/**
 * Componente de informação para exibir dados importantes de forma clara e destacada. Pode ser usado para mostrar estatísticas, status ou qualquer outro tipo de informação relevante. Suporta diferentes variantes visuais e tamanhos, além de permitir a cópia do valor para a área de transferência. Ideal para dashboards, páginas de detalhes ou qualquer lugar onde seja necessário destacar informações importantes.
 *
 * @param label - O rótulo ou título da informação.
 * @param value - O valor ou conteúdo da informação. Se não for fornecido, o conteúdo filho será usado.
 * @param icon - Um ícone opcional para acompanhar a informação.
 * @param copyable - Se verdadeiro, exibe um botão para copiar o valor para a área de transferência.
 * @param loading - Se verdadeiro, exibe um estado de carregamento no lugar do valor.
 * @param variant - A variante visual do componente (default, card, minimal, filled).
 * @param size - O tamanho do componente (sm, md, lg).
 */
declare const Info: React.ForwardRefExoticComponent<InfoProps & React.RefAttributes<HTMLDivElement>>;
export { Info };
```

</details>

<details>
<summary><code>components/input</code></summary>

Fonte: [components/input](src/components/input.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const inputVariants: (props?: ({
    variant?: "default" | "filled" | "outline" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    validation?: "default" | "success" | "error" | null | undefined;
    hasLabel?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const maskConfigs: {
    cpf: {
        mask: string;
    };
    cnpj: {
        mask: string;
    };
    cep: {
        mask: string;
    };
    phone: {
        mask: {
            mask: string;
        }[];
    };
    date: {
        mask: string;
    };
    time: {
        mask: string;
    };
    datetime: {
        mask: string;
    };
};
/** Campo de entrada com variantes de texto, máscara, data, hora e moeda. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
    /** Estado visual da validação, independente do tone de foco. */
    validation?: 'default' | 'error' | 'success';
    /** Mostra o estado de carregamento. */
    isLoading?: boolean;
    /** Mostra o estado pendente. */
    isPending?: boolean;
    /** Ícone no início do campo. */
    leftIcon?: React.ReactNode;
    /** Ícone no fim do campo. */
    rightIcon?: React.ReactNode;
    /** Tipo nativo ou um dos modos especiais `currency` e `checkbox`. */
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'currency' | 'checkbox';
    /** Rótulo do campo. */
    label?: string;
    /** Recebe o valor interpretado pelo modo do campo. */
    onValueChange?: (value: any) => void;
    /** Mensagem de erro mostrada abaixo do campo. */
    error?: string;
    /** Texto auxiliar à direita. */
    rightPlaceholder?: string;
    /** Máscara predefinida ou padrão aceito pelo `react-imask`. */
    mask?: keyof typeof maskConfigs | string;
    /** Cor do foco e das seleções internas; padrão `primary`. */
    color?: UIColor;
    /** Anima a entrada do campo. */
    animationEntrance?: boolean;
    /** Anima a saída do campo. */
    animationOut?: boolean;
    /** Ajusta a apresentação dentro de um card. */
    isInCard?: boolean;
}
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export { Input, inputVariants };
```

</details>

<details>
<summary><code>components/log-accordion</code></summary>

Fonte: [components/log-accordion](src/components/log-accordion.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const logAccordionVariants: (props?: ({
    size?: "default" | "sm" | "lg" | null | undefined;
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "neutral" | "tertiary" | "background" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type PolymorphicProps = React.HTMLProps<HTMLDivElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>;
/** Painel expansível que exibe dados de log. */
export interface LogAccordionProps extends Omit<PolymorphicProps, 'color' | 'size'>, VariantProps<typeof logAccordionVariants> {
    /** Substitui o ícone por indicador de carregamento e desativa a expansão. */
    isLoading?: boolean;
    /** Título do painel. */
    title: string;
    /** Data ou descrição exibida abaixo do título. */
    description?: string;
    /** Dados a exibir quando expandido. */
    log: unknown;
}
declare const LogAccordion: React.ForwardRefExoticComponent<Omit<LogAccordionProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export default LogAccordion;
```

</details>

<details>
<summary><code>components/logo-input</code></summary>

Fonte: [components/logo-input](src/components/logo-input.tsx).

```ts
import { type ImageInputProps } from './image-input.js';
export type LogoInputProps = ImageInputProps;
export declare const LogoInput: import("react").ForwardRefExoticComponent<ImageInputProps & import("react").RefAttributes<HTMLInputElement>>;
```

</details>

<details>
<summary><code>components/modal</code></summary>

Fonte: [components/modal](src/components/modal.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const modalOverlayVariants: (props?: ({
    isOpen?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const modalContentVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
    variant?: "default" | "customer" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type ModalProps = React.PropsWithChildren<VariantProps<typeof modalOverlayVariants> & VariantProps<typeof modalContentVariants> & {
    /** Tone do destaque do cabeçalho e dos botões; padrão `primary`. */
    color?: UIColor;
    /** Título do diálogo. */
    title?: string;
    /** Texto abaixo do título. */
    description?: string;
    /** URL da imagem de fundo do cabeçalho; usa recorte central e altura mínima de 120 px. */
    headerBackgroundImage?: string;
    /** Controla a abertura do diálogo. */
    isOpen: boolean;
    /** Chamado ao fechar pelo botão, pelo fundo ou pela tecla Escape. */
    onClose: () => void;
    /** Chamado ao confirmar. */
    onConfirm?: () => void;
    /** Chamado ao cancelar; usa `onClose` quando omitido. */
    onCancel?: () => void;
    /** Texto do botão de confirmação. */
    confirmText?: string;
    /** Texto do botão de cancelamento. */
    cancelText?: string;
    /** Ícone do botão de confirmação. */
    confirmIcon?: React.ReactNode;
    /** Ícone do botão de cancelamento. */
    cancelIcon?: React.ReactNode;
    confirmButtonVariant?: any;
    isConfirming?: boolean;
    submitButton?: boolean;
    disabled?: boolean;
    loading?: boolean;
    hideFooter?: boolean;
    hideConfirm?: boolean;
    hideCancel?: boolean;
    hideCloseIcon?: boolean;
    /** Quando muda, volta o conteúdo rolável ao início. */
    resetScrollKey?: React.Key;
    /** Classes adicionais para o conteúdo do diálogo. */
    className?: string;
    /** Estilos adicionais para o fundo do diálogo. */
    style?: React.CSSProperties;
}>;
declare const Modal: React.ForwardRefExoticComponent<VariantProps<(props?: ({
    isOpen?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string> & VariantProps<(props?: ({
    size?: "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
    variant?: "default" | "customer" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string> & {
    /** Tone do destaque do cabeçalho e dos botões; padrão `primary`. */
    color?: UIColor;
    /** Título do diálogo. */
    title?: string;
    /** Texto abaixo do título. */
    description?: string;
    /** URL da imagem de fundo do cabeçalho; usa recorte central e altura mínima de 120 px. */
    headerBackgroundImage?: string;
    /** Controla a abertura do diálogo. */
    isOpen: boolean;
    /** Chamado ao fechar pelo botão, pelo fundo ou pela tecla Escape. */
    onClose: () => void;
    /** Chamado ao confirmar. */
    onConfirm?: () => void;
    /** Chamado ao cancelar; usa `onClose` quando omitido. */
    onCancel?: () => void;
    /** Texto do botão de confirmação. */
    confirmText?: string;
    /** Texto do botão de cancelamento. */
    cancelText?: string;
    /** Ícone do botão de confirmação. */
    confirmIcon?: React.ReactNode;
    /** Ícone do botão de cancelamento. */
    cancelIcon?: React.ReactNode;
    confirmButtonVariant?: any;
    isConfirming?: boolean;
    submitButton?: boolean;
    disabled?: boolean;
    loading?: boolean;
    hideFooter?: boolean;
    hideConfirm?: boolean;
    hideCancel?: boolean;
    hideCloseIcon?: boolean;
    /** Quando muda, volta o conteúdo rolável ao início. */
    resetScrollKey?: React.Key;
    /** Classes adicionais para o conteúdo do diálogo. */
    className?: string;
    /** Estilos adicionais para o fundo do diálogo. */
    style?: React.CSSProperties;
} & {
    children?: React.ReactNode | undefined;
} & React.RefAttributes<HTMLDivElement>>;
export { Modal, modalOverlayVariants, modalContentVariants };
```

</details>

<details>
<summary><code>components/month-year-picker</code></summary>

Fonte: [components/month-year-picker](src/components/month-year-picker.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
export type MonthYearPickerVariant = 'outlined' | 'soft' | 'filled';
export type MonthYearPickerSize = 'sm' | 'md' | 'lg';
/** Dados de uma opção do painel de meses. */
export interface MonthYearPickerMonthOption {
    month: number;
    label: string;
    selected: boolean;
}
/** Dados de uma opção do painel de anos. */
export interface MonthYearPickerYearOption {
    year: number;
    selected: boolean;
}
/** Seletor de mês e ano com limites e renderização personalizável das opções. */
export interface MonthYearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
    /** Data selecionada em modo controlado; o dia é tratado como primeiro do mês. */
    value?: Date;
    /** Data inicial em modo não controlado. */
    defaultValue?: Date;
    /** Recebe o primeiro dia do mês selecionado. */
    onValueChange?: (month: Date) => void;
    /** Menor ano selecionável, entre 1 e 9999. */
    minYear?: number;
    /** Maior ano selecionável, entre 1 e 9999. */
    maxYear?: number;
    /** Desativa a seleção e as setas de navegação. */
    disabled?: boolean;
    /** Aparência do gatilho. */
    variant?: MonthYearPickerVariant;
    /** Dimensões do gatilho, painel e opções. */
    size?: MonthYearPickerSize;
    /** Tone do gatilho, abas e opções selecionadas; padrão `primary`. */
    color?: UIColor;
    /** Classe, ou função de classe, aplicada a cada mês. */
    monthOptionClassName?: string | ((option: MonthYearPickerMonthOption) => string);
    /** Classe, ou função de classe, aplicada a cada ano. */
    yearOptionClassName?: string | ((option: MonthYearPickerYearOption) => string);
    /** Classe adicional do campo de ano quando não há limites. */
    yearInputClassName?: string;
    /** Renderiza o conteúdo de cada opção de mês. */
    renderMonth?: (option: MonthYearPickerMonthOption) => React.ReactNode;
    /** Renderiza o conteúdo de cada opção de ano. */
    renderYear?: (option: MonthYearPickerYearOption) => React.ReactNode;
}
declare const MonthYearPicker: React.ForwardRefExoticComponent<MonthYearPickerProps & React.RefAttributes<HTMLDivElement>>;
export { MonthYearPicker };
```

</details>

<details>
<summary><code>components/motion</code></summary>

Fonte: [components/motion](src/components/motion.tsx).

```ts
import * as React from 'react';
import { type HTMLMotionProps, type Transition, type Variants } from 'framer-motion';
export type MotionPreset = 'none' | 'fade' | 'fade-up' | 'fade-down' | 'scale' | 'slide-left' | 'slide-right' | 'pop';
export declare const fluidTransition: Transition;
export declare const springTransition: Transition;
export declare const motionPresets: Record<Exclude<MotionPreset, 'none'>, Variants>;
/** Contêiner com animação de entrada e interação opcionais. */
export interface MotionBoxProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
    /** Animação pronta; `none` desativa a entrada. */
    preset?: MotionPreset;
    /** Atraso da animação em segundos. */
    delay?: number;
    /** Habilita movimentos sutis no hover e clique. */
    interactive?: boolean;
    /** Estados de animação personalizados, com prioridade sobre `preset`. */
    variants?: Variants;
}
export declare const MotionBox: React.ForwardRefExoticComponent<Omit<MotionBoxProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
```

</details>

<details>
<summary><code>components/pagination</code></summary>

Fonte: [components/pagination](src/components/pagination.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
declare const paginationVariants: (props?: ({
    variant?: "default" | "active" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Paginação numérica; `color` colore a página ativa. */
export interface PaginationProps {
    /** Página atual, começando em 1. */
    currentPage: number;
    /** Número total de páginas. */
    totalPages: number;
    /** Recebe o número da página escolhida. */
    onPageChange: (page: number) => void;
    /** Exibe os botões anterior e próximo; padrão `true`. */
    showPreviousNext?: boolean;
    /** Quantidade de páginas vizinhas à página atual; padrão 1. */
    siblingCount?: number;
    /** Cor da página ativa; padrão `default`. */
    color?: UIColor;
    /** Classes adicionais no contêiner. */
    className?: string;
}
declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLDivElement>>;
export { Pagination, paginationVariants };
```

</details>

<details>
<summary><code>components/progress-bar</code></summary>

Fonte: [components/progress-bar](src/components/progress-bar.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import type { UIColor } from './theme.js';
declare const progressBarVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type ColorVariant = UIColor | 'gradient';
/** Barra de progresso determinada por `value` e `max`. */
export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>, VariantProps<typeof progressBarVariants> {
    /** Valor atual. */
    value: number;
    /** Valor que representa 100%; padrão 100. */
    max?: number;
    /** Exibe o rótulo. */
    showLabel?: boolean;
    /** Exibe o percentual. */
    showPercentage?: boolean;
    /** Texto descritivo da barra. */
    label?: string;
    /** Formata o valor exibido. */
    formatValue?: (value: number, max: number) => string;
    /** Anima a largura ao mudar. */
    animated?: boolean;
    /** Aplica padrão de listras. */
    striped?: boolean;
    /** Escolhe a cor conforme o percentual. */
    autoColor?: boolean;
    /** Tone da barra quando `autoColor` está desativado. */
    color?: ColorVariant;
}
declare const ProgressBar: React.ForwardRefExoticComponent<ProgressBarProps & React.RefAttributes<HTMLDivElement>>;
/** Resumo numérico com barra de progresso. */
export interface StatsProgressProps {
    /** Nome da métrica. */
    label: string;
    /** Valor principal exibido. */
    value: string;
    /** Valor de referência exibido abaixo. */
    subValue?: string;
    /** Percentual exibido na barra. */
    percentage: number;
    /** Ícone ao lado do rótulo. */
    icon?: React.ReactNode;
    /** Tone da barra. */
    color?: ColorVariant;
    /** Escolhe a cor conforme o percentual. */
    autoColor?: boolean;
}
declare const StatsProgress: React.ForwardRefExoticComponent<StatsProgressProps & React.RefAttributes<HTMLDivElement>>;
export { ProgressBar, StatsProgress };
```

</details>

<details>
<summary><code>components/search</code></summary>

Fonte: [components/search](src/components/search.tsx).

```ts
import type { SearchProps } from './data-types.js';
import * as React from 'react';
declare const Search: React.ForwardRefExoticComponent<SearchProps & React.RefAttributes<HTMLInputElement>>;
export { Search };
```

</details>

<details>
<summary><code>components/section</code></summary>

Fonte: [components/section](src/components/section.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
/** Bloco de conteúdo com cabeçalho opcional e destaque por tone. */
export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
    /** Título da seção. */
    title?: React.ReactNode;
    /** Texto auxiliar abaixo do título. */
    description?: React.ReactNode;
    /** Ícone exibido antes do título. */
    icon?: React.ReactNode;
    /** Ação alinhada à direita do cabeçalho. */
    action?: React.ReactNode;
    /** Adiciona borda, fundo de card e espaçamento interno. */
    bordered?: boolean;
    /** Tone do ícone; padrão `primary`. */
    color?: UIColor;
}
export declare function Section({ title, description, icon, action, bordered, color, className, children, ...props }: SectionProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/select</code></summary>

Fonte: [components/select](src/components/select.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const selectVariants: (props?: ({
    variant?: "default" | "visible" | "filled" | "outline" | "times" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    validation?: "default" | "success" | "error" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface SelectOption {
    /** Cor usada na apresentação como badge. */
    color?: UIColor;
    /** Valor enviado em `onValueChange`. */
    value: string | number;
    /** Texto principal da opção. */
    label: string;
    /** Impede selecionar esta opção. */
    disabled?: boolean;
    /** Texto auxiliar mostrado sob o rótulo. */
    description?: string;
}
/** Seletor simples ou múltiplo com busca, validação e variantes visuais. */
export interface SelectProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'defaultValue'>, VariantProps<typeof selectVariants> {
    /** Opções disponíveis. */
    options: SelectOption[];
    /** Valor controlado, ou lista de valores em modo múltiplo. */
    value?: string | number | boolean | Array<string | number> | null;
    /** Apresentação da seleção e das opções; padrão texto. */
    display?: 'text' | 'badge';
    /** Valor inicial quando o componente não é controlado. */
    defaultValue?: string | number | Array<string | number>;
    /** Recebe a seleção atualizada. */
    onValueChange?: (value: string | number | Array<string | number> | undefined) => void;
    /** Texto mostrado sem seleção. */
    placeholder?: string;
    /** Rótulo do seletor. */
    label?: string;
    /** Impede interação. */
    disabled?: boolean;
    /** Marca o campo como obrigatório. */
    required?: boolean;
    /** Mostra carregamento. */
    isLoading?: boolean;
    /** Habilita busca entre opções. */
    searchable?: boolean;
    /** Permite limpar a seleção. */
    clearable?: boolean;
    /** Permite selecionar vários valores. */
    multiple?: boolean;
    /** Exibe a ação de selecionar todos em modo múltiplo. */
    showSelectAll?: boolean;
    /** Texto da ação de selecionar todos. */
    selectAllLabel?: string;
    /** Estado visual da validação. */
    validation?: 'default' | 'error' | 'success';
    /** Ícone no início do seletor. */
    leftIcon?: React.ReactNode;
    /** Texto mostrado quando a busca não encontra opções. */
    emptyMessage?: string;
    /** Nome usado na submissão de formulário. */
    name?: string;
    /** Mensagem de erro abaixo do campo. */
    error?: string;
    /** Cor do foco e das opções selecionadas; padrão `primary`. */
    color?: UIColor;
    /** Ajusta a apresentação dentro de um card. */
    isInCard?: boolean;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
export { Select, selectVariants };
```

</details>

<details>
<summary><code>components/separator</code></summary>

Fonte: [components/separator](src/components/separator.tsx).

```ts
import * as React from 'react';
/** Divisor horizontal ou vertical. */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Direção do divisor; padrão horizontal. */
    orientation?: 'horizontal' | 'vertical';
    /** Aparência da linha. */
    variant?: 'default' | 'gradient' | 'dashed';
    /** Texto central opcional. */
    text?: string;
    /** Anima a entrada. */
    animationEntrance?: boolean;
    /** Anima a saída. */
    animationOut?: boolean;
}
declare const Separator: React.ForwardRefExoticComponent<SeparatorProps & React.RefAttributes<HTMLDivElement>>;
export { Separator };
```

</details>

<details>
<summary><code>components/sidebar</code></summary>

Fonte: [components/sidebar](src/components/sidebar.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
import { type SidebarSectionConfig } from './sidebarSection.js';
export type SidebarSlot = React.ReactNode | ((isOpen: boolean) => React.ReactNode);
export interface SidebarProps {
    sections: SidebarSectionConfig[] | Record<string, SidebarSectionConfig>;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onLinkClick?: () => void;
    pathname?: string;
    linkComponent?: React.ElementType;
    can?: (permission: string) => boolean;
    loading?: boolean;
    /** Logo visible in both expanded and collapsed states. */
    logo?: SidebarSlot;
    /** Brand name visible only when expanded. */
    name?: React.ReactNode;
    /** Search above navigation. Render functions can supply a collapsed control. */
    search?: SidebarSlot;
    /** Notifications anchored below navigation and footer. */
    notifications?: SidebarSlot;
    /** Active item and hover tone. @default 'secondary' */
    color?: UIColor;
    /** Enable hover backgrounds. @default true */
    hover?: boolean;
    header?: SidebarSlot;
    footer?: SidebarSlot;
    className?: string;
    'aria-label'?: string;
}
/** Responsive sidebar with optional permission filtering and no application context dependency. */
export declare function Sidebar({ sections, isOpen: controlledOpen, defaultOpen, onOpenChange, onLinkClick, pathname, linkComponent, can, loading, logo, name, search, notifications, color, hover, header, footer, className, 'aria-label': label }: SidebarProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/sidebarNavItem</code></summary>

Fonte: [components/sidebarNavItem](src/components/sidebarNavItem.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
export interface SidebarItem {
    icon?: React.ElementType;
    label: string;
    href?: string;
    permission?: string;
    subItems?: SidebarItem[];
    exact?: boolean;
    dataTour?: string;
}
export interface SidebarNavItemProps {
    item: SidebarItem;
    isOpen: boolean;
    color?: UIColor;
    hover?: boolean;
    onClick?: () => void;
    isSubMenuOpen?: boolean;
    toggleSubMenu?: () => void;
    dataTour?: string;
    pathname?: string;
    /** Pass Next.js Link or another router's anchor-compatible component. */
    linkComponent?: React.ElementType;
}
export declare function SidebarNavItem({ item, isOpen, onClick, isSubMenuOpen, toggleSubMenu, dataTour, pathname, linkComponent: Link, color, hover }: SidebarNavItemProps): React.JSX.Element;
```

</details>

<details>
<summary><code>components/sidebarSection</code></summary>

Fonte: [components/sidebarSection](src/components/sidebarSection.tsx).

```ts
import * as React from 'react';
import { type UIColor } from './theme.js';
import { type SidebarItem } from './sidebarNavItem.js';
export interface SidebarSectionConfig {
    title: string;
    items: SidebarItem[];
}
export interface SidebarSectionProps {
    section: SidebarSectionConfig;
    isOpen: boolean;
    color?: UIColor;
    hover?: boolean;
    onLinkClick?: () => void;
    openSubMenus?: string[];
    toggleSubMenu?: (label: string) => void;
    pathname?: string;
    linkComponent?: React.ElementType;
    /** Optional permission checker; omitted for systems without permissions. */
    can?: (permission: string) => boolean;
}
export declare function SidebarSection({ section, isOpen, onLinkClick, openSubMenus, toggleSubMenu, pathname, linkComponent, can, color, hover }: SidebarSectionProps): React.JSX.Element | null;
```

</details>

<details>
<summary><code>components/skeleton</code></summary>

Fonte: [components/skeleton](src/components/skeleton.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const skeletonVariants: (props?: ({
    variant?: "default" | "light" | "dark" | null | undefined;
    rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Placeholder para conteúdo em carregamento. */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
    /** Largura CSS ou número em pixels. */
    width?: string | number;
    /** Altura CSS ou número em pixels. */
    height?: string | number;
}
declare const Skeleton: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonText: React.ForwardRefExoticComponent<Omit<SkeletonProps, "height"> & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonTitle: React.ForwardRefExoticComponent<Omit<SkeletonProps, "height"> & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonAvatar: React.ForwardRefExoticComponent<Omit<SkeletonProps, "width" | "height"> & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonButton: React.ForwardRefExoticComponent<Omit<SkeletonProps, "height"> & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonCard: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonList: React.ForwardRefExoticComponent<{
    items?: number;
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonTable: React.ForwardRefExoticComponent<{
    rows?: number;
    columns?: number;
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
declare const SkeletonForm: React.ForwardRefExoticComponent<SkeletonProps & React.RefAttributes<HTMLDivElement>>;
export { Skeleton, SkeletonText, SkeletonTitle, SkeletonAvatar, SkeletonButton, SkeletonCard, SkeletonList, SkeletonTable, SkeletonForm, skeletonVariants };
```

</details>

<details>
<summary><code>components/speed-dial-tabs</code></summary>

Fonte: [components/speed-dial-tabs](src/components/speed-dial-tabs.tsx).

```ts
import React from "react";
import { type VariantProps } from "class-variance-authority";
import type { SpeedDialIcon } from "./speed-dial.js";
import { type UIColor } from './theme.js';
declare const speedDialTabsVariants: (props?: ({
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "top-center" | "middle-left" | "middle-center" | "middle-right" | "bottom-center" | null | undefined;
    size?: "sm" | "md" | "lg" | "xs" | null | undefined;
    width?: "full" | "auto" | "fit" | null | undefined;
    rounded?: "none" | "sm" | "md" | "lg" | "full" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface SpeedDialTab {
    value: string;
    label: string;
    icon?: SpeedDialIcon;
    disabled?: boolean;
}
/** Navegação flutuante que expande uma lista de abas. */
export interface SpeedDialTabsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof speedDialTabsVariants> {
    /** Abas exibidas no menu. */
    tabs: SpeedDialTab[];
    /** Nome acessível do botão principal. */
    triggerLabel: string;
    /** Ícone do botão fechado. */
    icon?: SpeedDialIcon;
    /** Ícone opcional para o botão aberto. */
    openIcon?: SpeedDialIcon;
    /** Aba ativa em modo controlado. */
    value?: string;
    /** Aba inicialmente ativa em modo não controlado. */
    defaultValue?: string;
    /** Recebe o valor da aba selecionada. */
    onValueChange?: (value: string) => void;
    /** Fecha o menu após selecionar uma aba. */
    closeOnSelect?: boolean;
    /** Tone do botão e da aba ativa; padrão `primary`. */
    color?: UIColor;
    /** Arredondamento do botão principal. */
    rounded?: "none" | "sm" | "md" | "lg" | "full";
    /** Tamanho do botão principal. */
    size?: "xs" | "sm" | "md" | "lg";
    /** Largura do menu expandido. */
    width?: "auto" | "full" | "fit";
}
declare const SpeedDialTabs: React.ForwardRefExoticComponent<SpeedDialTabsProps & React.RefAttributes<HTMLDivElement>>;
export { SpeedDialTabs, speedDialTabsVariants };
```

</details>

<details>
<summary><code>components/speed-dial</code></summary>

Fonte: [components/speed-dial](src/components/speed-dial.tsx).

```ts
import React from "react";
import { type VariantProps } from "class-variance-authority";
import * as PhosphorIcons from "@phosphor-icons/react/dist/ssr";
import { type UIColor } from './theme.js';
declare const speedDialVariants: (props?: ({
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const buttonVariants: (props?: ({
    variant?: "action" | "trigger" | null | undefined;
    size?: "medium" | "large" | "small" | "xsmall" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type SpeedDialIcon = React.ReactNode | keyof typeof PhosphorIcons;
export interface SpeedDialAction {
    /** Identificador estável da ação, usado também para controlar submenus. */
    id?: string;
    /** Ícone React ou nome de ícone do Phosphor. */
    icon?: SpeedDialIcon;
    /** Texto visível ao lado da ação e rótulo acessível do botão. */
    label: string;
    /** Chamado ao selecionar uma ação sem filhos. */
    onClick?: () => void;
    /** Ações aninhadas que abrem um submenu. */
    children?: SpeedDialAction[];
    /** Impede a interação com esta ação. */
    disabled?: boolean;
    /** Destaca a ação com a cor do gatilho quando `color` não é informado. */
    active?: boolean;
    /** Sobrescreve `actionColor` para esta ação. */
    color?: UIColor;
}
/** Botão flutuante com ações e subações; as cores usam os tones de `UIColor`. */
export interface SpeedDialProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof speedDialVariants> {
    /** Ações mostradas ao abrir o menu. */
    actions: SpeedDialAction[];
    /** Ícone do gatilho fechado; padrão `PlusIcon`. */
    icon?: SpeedDialIcon;
    /** Ícone alternativo para o gatilho aberto. */
    openIcon?: SpeedDialIcon;
    /** Cor do gatilho e das ações com `active: true`; padrão `primary`. */
    color?: UIColor;
    /** Cor das ações comuns; padrão `secondary`. */
    actionColor?: UIColor;
    /** Tamanho do gatilho; padrão `medium`. */
    buttonSize?: "small" | "medium" | "large";
    /** Tamanho dos botões de ação; por padrão segue `buttonSize`. */
    actionSize?: VariantProps<typeof buttonVariants>["size"];
    /** Rótulo acessível do gatilho. */
    triggerLabel?: string;
    /** Fecha o menu após selecionar uma ação sem filhos; padrão `true`. */
    closeOnAction?: boolean;
}
declare const SpeedDial: React.ForwardRefExoticComponent<SpeedDialProps & React.RefAttributes<HTMLDivElement>>;
export { SpeedDial, speedDialVariants, buttonVariants };
```

</details>

<details>
<summary><code>components/spinner</code></summary>

Fonte: [components/spinner](src/components/spinner.tsx).

```ts
import * as React from 'react';
import type { UIColor, UISize } from './theme.js';
/** Indicador de carregamento com nome acessível. */
export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Tamanho do círculo; padrão depende de `mode`. */
    size?: UISize;
    /** Tone da borda animada; padrão `primary`. */
    color?: UIColor;
    /** Texto acessível e legenda nos modos block/overlay. */
    label?: string;
    /** Apresentação em linha, bloco ou sobreposição. */
    mode?: 'inline' | 'block' | 'overlay';
    /** Se falso, não renderiza o indicador. */
    visible?: boolean;
    /** Reduz o espaçamento do modo block. */
    compact?: boolean;
}
export declare function Spinner({ size, color, label, mode, visible, compact, className, ...props }: SpinnerProps): React.JSX.Element | null;
```

</details>

<details>
<summary><code>components/switch-field</code></summary>

Fonte: [components/switch-field](src/components/switch-field.tsx).

```ts
import { type SwitchProps } from './switch.js';
export interface SwitchFieldProps extends Omit<SwitchProps, 'name'> {
    name: string;
    label: string;
    description?: string;
}
export declare function SwitchField({ name, label, description, className, id, checked, defaultChecked, onCheckedChange, disabled, ...props }: SwitchFieldProps): import("react").JSX.Element;
```

</details>

<details>
<summary><code>components/switch</code></summary>

Fonte: [components/switch](src/components/switch.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const switchVariants: (props?: ({
    variant?: "default" | "success" | "outline" | "soft" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    state?: "checked" | "unchecked" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Controle liga/desliga; `color` define o tone quando ativado. */
export interface SwitchProps extends React.ComponentPropsWithoutRef<'button'>, VariantProps<typeof switchVariants> {
    /** Estado controlado do switch. */
    checked?: boolean;
    /** Recebe o próximo estado após o clique. */
    onCheckedChange?: (checked: boolean) => void;
    /** Impede alterações pelo usuário. */
    disabled?: boolean;
    /** Cor usada no estado ligado; padrão `primary`, ou `success` na variante homônima. */
    color?: UIColor;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
export { Switch };
```

</details>

<details>
<summary><code>components/table</code></summary>

Fonte: [components/table](src/components/table.tsx).

```ts
import type { TableData, Column, SortState, PaginationState, CellSaveEvent, RowSaveEvent, TableEditingController, TableEditingState, TableFieldErrors } from './data-types.js';
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const tableVariants: (props?: ({
    variant?: "default" | "fixed" | "grid" | "outline" | "ghost" | "striped" | "spreadsheet" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Tabela com ordenação, seleção e paginação opcionais. */
export interface TableProps extends VariantProps<typeof tableVariants> {
    /** Definição das colunas. */
    columns: Column[];
    /** Layout independente da aparência; variant=fixed permanece compatível. */
    layout?: 'auto' | 'fixed';
    /** Interacao de planilha independente da variante visual. */
    appearance?: 'default' | 'spreadsheet';
    /** Mantem todos os campos acessiveis no celular. */
    mobileLayout?: 'responsive' | 'scroll' | 'stacked';
    stickyHeader?: boolean;
    maxHeight?: number | string;
    /** Nome acessivel da tabela ou grade. */
    'aria-label'?: string;
    /** Controle de edicao separado do ref HTML existente. */
    editingRef?: React.Ref<TableEditingController>;
    onEditingStateChange?: (state: TableEditingState) => void;
    validateRow?: (draftRow: TableData) => TableFieldErrors;
    /** Rejeite a Promise para manter o rascunho e mostrar erro. */
    onCellSave?: (event: CellSaveEvent) => Promise<void>;
    /** Padrao cell; row salva ao sair da linha inteira. */
    saveMode?: 'cell' | 'row';
    /** Persiste todos os campos alterados da linha em uma chamada. */
    onRowSave?: (event: RowSaveEvent) => Promise<void>;
    /** Linhas exibidas. */
    data: TableData[];
    /** Exibe estado de carregamento. */
    loading?: boolean;
    /** Texto quando não há linhas. */
    emptyMessage?: string;
    /** Classe do contêiner. */
    className?: string;
    /** Habilita ordenação pelos cabeçalhos. */
    sortable?: boolean;
    /** Coluna e direção de ordenação atuais. */
    sortState?: SortState;
    /** Recebe a coluna escolhida para ordenação. */
    onSort?: (column: string) => void;
    /** Estado da paginação. */
    pagination?: PaginationState;
    /** Recebe a página escolhida. */
    onPageChange?: (page: number) => void;
    /** Permite selecionar linhas. */
    selectable?: boolean;
    /** Decide se uma linha pode ser selecionada. */
    isRowSelectable?: (row: TableData) => boolean;
    /** Recebe as chaves das linhas selecionadas. */
    onSelectionChange?: (selectedRows: (string | number)[]) => void;
    /** Campo que identifica cada linha. */
    rowKey?: string;
    /** Recebe a linha e o índice após clique. */
    onRowClick?: (row: TableData, index: number) => void;
    /** Renderiza ações para a seleção atual. */
    renderBulkActions?: (selectedRows: (string | number)[], clearSelection: () => void) => React.ReactNode;
    /** Habilita adaptação a telas estreitas. */
    responsive?: boolean;
    /** Número de colunas antes de ocultar extras em telas menores. */
    limitColumnsShow?: number;
}
declare const Table: React.ForwardRefExoticComponent<TableProps & React.RefAttributes<HTMLTableElement>>;
export { Table, tableVariants };
```

</details>

<details>
<summary><code>components/tabs</code></summary>

Fonte: [components/tabs](src/components/tabs.tsx).

```ts
import * as React from 'react';
import { type HTMLMotionProps } from 'framer-motion';
import { type UIColor } from './theme.js';
export type TabsVariant = 'underline' | 'pills' | 'segmented' | 'cards' | 'sidebar';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsMobileBehavior = 'scroll' | 'wrap' | 'equal';
export type TabsContentAnimation = 'fade' | 'slide' | 'none';
declare const tabsListVariants: (props?: ({
    variant?: "underline" | "pills" | "segmented" | "cards" | "sidebar" | null | undefined;
    mobileBehavior?: "scroll" | "wrap" | "equal" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const tabsTriggerVariants: (props?: ({
    variant?: "underline" | "pills" | "segmented" | "cards" | "sidebar" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    mobileBehavior?: "scroll" | "wrap" | "equal" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Grupo de abas controlado por `value` ou iniciado com `defaultValue`. */
export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
    /** Valor da aba inicialmente ativa. */
    defaultValue: string;
    /** Valor ativo quando o componente é controlado. */
    value?: string;
    /** Recebe o valor da aba escolhida. */
    onValueChange?: (value: string) => void;
    /** Aparência da lista e do indicador. */
    variant?: TabsVariant;
    /** Tone dos estados ativos e interativos; padrão `primary`. */
    color?: UIColor;
    /** Altura e espaçamento dos gatilhos. */
    size?: TabsSize;
    /** Comportamento da lista em telas estreitas. */
    mobileBehavior?: TabsMobileBehavior;
    /** Faz a lista ocupar toda a largura disponível. */
    fullWidth?: boolean;
    /** Animação ao trocar o conteúdo. */
    contentAnimation?: TabsContentAnimation;
}
declare const Tabs: React.ForwardRefExoticComponent<TabsProps & React.RefAttributes<HTMLDivElement>>;
export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;
declare const TabsList: React.ForwardRefExoticComponent<TabsListProps & React.RefAttributes<HTMLDivElement>>;
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}
declare const TabsTrigger: React.ForwardRefExoticComponent<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>;
export interface TabsContentProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    value: string;
    keepMounted?: boolean;
    children?: React.ReactNode;
}
declare const TabsContent: React.ForwardRefExoticComponent<Omit<TabsContentProps, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
```

</details>

<details>
<summary><code>components/text</code></summary>

Fonte: [components/text](src/components/text.tsx).

```ts
import { VariantProps } from "class-variance-authority";
import React from "react";
import { type UIColor } from './theme.js';
declare const textVariants: (props?: ({
    variant?: "default" | "large" | "small" | "success" | "warning" | "info" | "error" | "code" | "muted" | "emphasis" | "lead" | "highlight" | "subtle" | "field" | null | undefined;
    align?: "center" | "left" | "right" | null | undefined;
    weight?: "light" | "normal" | "medium" | "bold" | "semibold" | null | undefined;
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
    lineHeight?: "normal" | "relaxed" | "snug" | "tight" | null | undefined;
    truncate?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export type TextVariants = VariantProps<typeof textVariants>;
/** Texto com estilos tipográficos e opção de ícone em `field`. */
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement>, TextVariants {
    /** Texto principal a ser exibido. */
    text: string;
    /** Texto secundário usado na variante `field`. */
    description?: string;
    /** Exibe um separador após o texto. */
    textForm?: boolean;
    /** Ícone usado na variante `field`. */
    icon?: React.ReactNode;
    /** Tone do texto ou do destaque em `field`; padrão da variante quando ausente. */
    color?: UIColor;
}
declare const Text: React.ForwardRefExoticComponent<TextProps & React.RefAttributes<HTMLParagraphElement>>;
export default Text;
```

</details>

<details>
<summary><code>components/textarea</code></summary>

Fonte: [components/textarea](src/components/textarea.tsx).

```ts
import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { type UIColor } from './theme.js';
declare const textareaVariants: (props?: ({
    variant?: "default" | "filled" | "outline" | null | undefined;
    validation?: "default" | "success" | "warning" | "error" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
    /** Tone usado no foco; padrão `primary`. */
    color?: UIColor;
    /** Estado visual de validação. */
    validation?: 'default' | 'error' | 'success' | 'warning';
    /** Exibe o indicador de carregamento. */
    isLoading?: boolean;
    /** Rótulo flutuante. */
    label?: string;
    /** Mensagem de erro exibida abaixo do campo. */
    error?: string;
    /** Ajuda exibida abaixo do campo quando não há erro. */
    helperText?: string;
    /** Exibe a contagem de caracteres quando `maxLength` está definido. */
    showCharCount?: boolean;
    /** Ícone antes do texto. */
    leftIcon?: React.ReactNode;
    /** Ícone depois do texto. */
    rightIcon?: React.ReactNode;
    /** Limite de caracteres. */
    maxLength?: number;
    /** Usa o fundo de card. */
    isInCard?: boolean;
}
declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
export { Textarea, textareaVariants };
```

</details>

<details>
<summary><code>components/theme</code></summary>

Fonte: [components/theme](src/components/theme.ts).

```ts
import type { CSSProperties } from 'react';
export declare const uiSizes: readonly ["xs", "sm", "md", "lg", "xl"];
export declare const uiColors: readonly ["default", "primary", "secondary", "success", "warning", "danger", "info", "neutral", "tertiary", "background"];
export declare const uiRadii: readonly ["none", "sm", "md", "lg", "xl", "full"];
export type UISize = (typeof uiSizes)[number];
export type UIColor = (typeof uiColors)[number];
export type UIRadius = (typeof uiRadii)[number];
export declare const radiusClasses: Record<UIRadius, string>;
export declare const toneClasses: Record<UIColor, {
    solid: string;
    fill: string;
    onSolid: string;
    soft: string;
    outline: string;
    text: string;
    hoverSoft: string;
    hoverOutline: string;
}>;
/** Aplica um tone aos componentes legados que usam utilitários `primary` em elementos internos. */
export declare function toneScopeStyle(color: UIColor, style?: CSSProperties): CSSProperties;
```

</details>

<details>
<summary><code>components/tip</code></summary>

Fonte: [components/tip](src/components/tip.tsx).

```ts
import React from "react";
import { type VariantProps } from "class-variance-authority";
import { type UIColor } from './theme.js';
export declare const tipVariants: (props?: ({
    variant?: "default" | "pink" | "purple" | "success" | "warning" | "info" | "destructive" | "premium" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/** Dica contextual com ícone e ação opcional; `color` substitui a cor da variante. */
export interface TipProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tipVariants> {
    /** Tone aplicado ao fundo suave, borda e texto. */
    color?: UIColor;
    /** Ícone decorativo à esquerda. */
    icon?: React.ReactNode;
    /** Conteúdo da dica. */
    children?: React.ReactNode;
    /** Ação opcional como link ou botão. */
    action?: {
        /** Texto exibido na ação. */
        label?: string;
        /** Callback da ação quando `href` não é usado. */
        onClick?: () => void;
        /** Destino da ação quando renderizada como link. */
        href?: string;
    };
    /** Callback do botão de fechar. */
    onClose?: () => void;
}
export declare function Tip({ className, variant, size, color, icon, children, action, onClose, ...props }: TipProps): React.JSX.Element;
export declare namespace Tip {
    var displayName: string;
}
```

</details>

<details>
<summary><code>components/toast</code></summary>

Fonte: [components/toast](src/components/toast.tsx).

```ts
import React from 'react';
import { type UIColor } from './theme.js';
/** Notificação com variante semântica e tone opcional. */
export interface ToastProps {
    /** Identificador da notificação. */
    id: string;
    /** Aparência e ícone semântico; padrão `default`. */
    variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
    /** Sobrescreve o tone visual da variante sem alterar seu ícone. */
    color?: UIColor;
    /** Título da notificação. */
    title?: string;
    /** Detalhes exibidos abaixo do título. */
    description?: string;
    /** Tempo de exibição em milissegundos, gerenciado pelo provedor de toasts. */
    duration?: number;
    /** Ação personalizada exibida abaixo da descrição. */
    action?: React.ReactNode;
    /** Chamado ao fechar ou dispensar com gesto. */
    onClose?: () => void;
    /** Controla a animação de entrada e saída. */
    isVisible?: boolean;
}
declare const Toast: React.ForwardRefExoticComponent<ToastProps & React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
export { Toast };
```

</details>

<details>
<summary><code>components/view-modal</code></summary>

Fonte: [components/view-modal](src/components/view-modal.tsx).

```ts
import { type ReactNode } from 'react';
import { type ModalProps } from './modal.js';
import { type InfoProps } from './info.js';
import { type ButtonProps } from './button.js';
import { type HttpClient, type HttpRequestOptions } from '../functions/http.js';
export interface ViewField<T> extends Omit<InfoProps, 'value' | 'loading'> {
    key: Extract<keyof T, string>;
    value?: ReactNode;
    render?: (data: T) => ReactNode;
    show?: boolean | ((data: T) => boolean);
}
export interface ViewSection<T> {
    title?: string;
    description?: string;
    columns?: 1 | 2 | 3 | 4;
    className?: string;
    permission?: string;
    show?: boolean | ((data: T) => boolean);
    fields: ViewField<T>[];
}
export interface ViewAction<T> {
    id: string;
    label: string;
    permission?: string;
    show?: boolean | ((data: T) => boolean);
    variant?: ButtonProps['variant'];
    color?: ButtonProps['color'];
    icon?: ReactNode;
    onClick: (data: T) => void | Promise<void>;
}
export interface ViewModalConfig<T> {
    title?: string | ((data: T) => string);
    description?: string | ((data: T) => string);
    size?: ModalProps['size'];
    sections: ViewSection<T>[];
    tabs?: {
        key: string;
        label: string;
        sections: ViewSection<T>[];
    }[];
    actions?: ViewAction<T>[];
}
export interface ViewModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    data?: T;
    config: ViewModalConfig<T>;
    loading?: boolean;
    client?: HttpClient;
    endpoint?: string;
    requestOptions?: HttpRequestOptions;
    can?: (permission: string) => boolean;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}
export declare function ViewModal<T>({ isOpen, onClose, data, config, loading, client, endpoint, requestOptions, can, onSuccess, onError }: ViewModalProps<T>): import("react").JSX.Element;
```

</details>

### hooks

<details>
<summary><code>hooks/useAction</code></summary>

Fonte: [hooks/useAction](src/hooks/useAction.ts).

```ts
import type { ApiNotifier } from './useApi.js';
import type { ActionResponse } from '../types/responses.js';
export type { ActionResponse } from '../types/responses.js';
export interface UseActionOptions<T> {
    notifier?: ApiNotifier;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: T | undefined) => void;
    onError?: (message: string) => void;
}
export declare function useAction<T>(action: (previous: ActionResponse<T> | undefined, formData: FormData) => Promise<ActionResponse<T>>, options?: UseActionOptions<T>): {
    state: ActionResponse<T> | undefined;
    formAction: (payload: FormData) => void;
    pending: boolean;
    isSuccess: boolean;
    isError: boolean;
    data: T | undefined;
    error: string | undefined;
    errors: Record<string, string[]> | undefined;
    clearFieldError: (field: string) => void;
};
```

</details>

<details>
<summary><code>hooks/useApi</code></summary>

Fonte: [hooks/useApi](src/hooks/useApi.ts).

```ts
import { type HttpClient, type HttpRequestOptions } from '../functions/http.js';
export interface ApiNotifier {
    success: (title: string, message: string) => void;
    error: (title: string, message: string) => void;
}
export interface UseApiOptions extends HttpRequestOptions {
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
}
export declare function useApi(client: HttpClient, notifier?: ApiNotifier): {
    request: <T>(method: string, url: string, data?: unknown, options?: UseApiOptions) => Promise<T | null>;
    get: <T>(url: string, params?: Record<string, unknown>, options?: UseApiOptions) => Promise<T | null>;
    post: <T>(url: string, data?: unknown, options?: UseApiOptions) => Promise<T | null>;
    put: <T>(url: string, data?: unknown, options?: UseApiOptions) => Promise<T | null>;
    delete: <T>(url: string, data?: unknown, options?: UseApiOptions) => Promise<T | null>;
    execute: <T>(fn: () => Promise<T>, options?: UseApiOptions) => Promise<T | null>;
    isLoading: boolean;
};
```

</details>

<details>
<summary><code>hooks/useApiTable</code></summary>

Fonte: [hooks/useApiTable](src/hooks/useApiTable.ts).

```ts
import type { HttpClient, HttpRequestOptions } from '../functions/http.js';
import type { LaravelPaginatedResponse } from '../types/responses.js';
export type { LaravelPaginatedResponse } from '../types/responses.js';
export interface ApiTableState {
    page: number;
    per_page: number;
    search: string;
    sort_by: string;
    sort_direction: 'asc' | 'desc';
    filters: Record<string, unknown>;
}
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    from: number;
    to: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationInfo;
}
export declare function normalizePagination<T>(response: LaravelPaginatedResponse<T>): PaginatedResult<T>;
export declare function buildTableParams(state: ApiTableState): Record<string, unknown>;
export interface UseApiTableOptions<T, Response = LaravelPaginatedResponse<T>> {
    client?: HttpClient;
    endpoint?: string;
    enabled?: boolean;
    initialState?: Partial<ApiTableState>;
    debounceMs?: number;
    requestOptions?: Omit<HttpRequestOptions, 'params' | 'signal'>;
    mapResponse?: (response: Response) => PaginatedResult<T>;
    buildParams?: (state: ApiTableState) => Record<string, unknown>;
    onSuccess?: (response: Response) => void;
    onError?: (error: unknown) => void;
}
export declare function useApiTable<T, Response = LaravelPaginatedResponse<T>>(options: UseApiTableOptions<T, Response>): {
    data: T[];
    pagination: PaginationInfo;
    state: ApiTableState;
    error: unknown;
    isFetching: boolean;
    isLoading: boolean;
    setPage: (page: number) => void;
    setPerPage: (per_page: number) => void;
    setSearch: (search: string) => void;
    setFilters: (filters: Record<string, unknown>) => void;
    setSort: (sort_by: string, direction?: "asc" | "desc") => void;
    clearFilters: () => void;
    refetchData: () => void;
    sortState: {
        column: string | null;
        direction: "desc" | "asc";
    };
};
```

</details>

<details>
<summary><code>hooks/useCep</code></summary>

Fonte: [hooks/useCep](src/hooks/useCep.ts).

```ts
export interface CepData {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}
export declare function useCep(fetcher?: typeof fetch): {
    loading: boolean;
    error: string | null;
    fetchAddress: (cep: string, signal?: AbortSignal) => Promise<CepData | null>;
};
```

</details>

<details>
<summary><code>hooks/useDebounce</code></summary>

Fonte: [hooks/useDebounce](src/hooks/useDebounce.ts).

```ts
export declare function useDebounce<T>(value: T, delay: number): T;
```

</details>

<details>
<summary><code>hooks/useFetch</code></summary>

Fonte: [hooks/useFetch](src/hooks/useFetch.ts).

```ts
export interface UseFetchOptions<T> {
    immediate?: boolean;
    initialData?: T | null;
    onSuccess?: (data: T) => void;
    onError?: (message: string) => void;
}
export declare function useFetch<T, Args extends unknown[] = []>(fetchFn: (...args: Args) => Promise<T | null>, options?: UseFetchOptions<T>): {
    data: T | null;
    loading: boolean;
    error: string | null;
    execute: (...args: Args) => Promise<T | null>;
    reset: () => void;
    setData: import("react").Dispatch<import("react").SetStateAction<T | null>>;
};
```

</details>

<details>
<summary><code>hooks/useSearch</code></summary>

Fonte: [hooks/useSearch](src/hooks/useSearch.ts).

```ts
import type { Filter, SearchProps } from '../components/data-types.js';
import { type UseApiTableOptions, type LaravelPaginatedResponse } from './useApiTable.js';
export interface UseSearchOptions<T, Response = LaravelPaginatedResponse<T>> extends UseApiTableOptions<T, Response> {
    initialSearch?: string;
    initialFilters?: Record<string, unknown>;
    placeholder?: string;
    filters?: Filter[];
    onSearchChange?: (query: string, filters: Record<string, unknown>) => void;
}
export declare function useSearch<T = unknown, Response = LaravelPaginatedResponse<T>>(options?: UseSearchOptions<T, Response>): {
    searchQuery: string;
    filterValues: Record<string, unknown>;
    hasActiveFilters: boolean;
    clearAll: () => void;
    searchProps: SearchProps;
    tableProps: {
        data: T[];
        pagination: import("./useApiTable.js").PaginationInfo;
        loading: boolean;
        onPageChange: (page: number) => void;
        sortState: {
            column: string | null;
            direction: "desc" | "asc";
        };
        onSort: (sort_by: string, direction?: "asc" | "desc") => void;
    };
    data: T[];
    pagination: import("./useApiTable.js").PaginationInfo;
    state: import("./useApiTable.js").ApiTableState;
    error: unknown;
    isFetching: boolean;
    isLoading: boolean;
    setPage: (page: number) => void;
    setPerPage: (per_page: number) => void;
    setSearch: (search: string) => void;
    setFilters: (filters: Record<string, unknown>) => void;
    setSort: (sort_by: string, direction?: "asc" | "desc") => void;
    clearFilters: () => void;
    refetchData: () => void;
    sortState: {
        column: string | null;
        direction: "desc" | "asc";
    };
};
export { useSearch as useUnifiedSearch };
```

</details>

<details>
<summary><code>hooks/useTheme</code></summary>

Fonte: [hooks/useTheme](src/hooks/useTheme.ts).

```ts
export declare function useTheme(): import("../index.js").ThemeContextValue;
```

</details>

<details>
<summary><code>hooks/useToast</code></summary>

Fonte: [hooks/useToast](src/hooks/useToast.ts).

```ts
export { useToastContext as useToast } from '../providers/ToastProvider.js';
```

</details>

<details>
<summary><code>hooks/useUnifiedSearch</code></summary>

Fonte: [hooks/useUnifiedSearch](src/hooks/useUnifiedSearch.ts).

```ts
export { useSearch as useUnifiedSearch } from './useSearch.js';
export type { UseSearchOptions } from './useSearch.js';
```

</details>

<details>
<summary><code>hooks/useViewModal</code></summary>

Fonte: [hooks/useViewModal](src/hooks/useViewModal.ts).

```ts
import type { ViewField, ViewModalConfig, ViewSection } from '../components/view-modal.js';
export declare function useViewModal<T>(configs?: Record<string, ViewModalConfig<T>>): {
    isOpen: boolean;
    data: T | undefined;
    open: (item?: T) => void;
    close: () => void;
    setData: import("react").Dispatch<import("react").SetStateAction<T | undefined>>;
    configs: Record<string, ViewModalConfig<T>>;
    createConfig: (key: string, overrides?: Partial<ViewModalConfig<T>>) => ViewModalConfig<T>;
    createCustomConfig: (config: ViewModalConfig<T>) => ViewModalConfig<T>;
    modalProps: {
        isOpen: boolean;
        data: T | undefined;
        onClose: () => void;
    };
};
export declare const ViewModalUtils: {
    simple<T>(fields: ViewField<T>[]): ViewModalConfig<T>;
    multiSection<T>(sections: ViewSection<T>[]): ViewModalConfig<T>;
};
```

</details>

### providers

<details>
<summary><code>providers/ThemeProvider</code></summary>

Fonte: [providers/ThemeProvider](src/providers/ThemeProvider.tsx).

```ts
import * as React from 'react';
export type Theme = 'light' | 'dark' | 'system';
export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    attribute?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
}
export interface ThemeContextValue {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}
export declare const ThemeContext: React.Context<ThemeContextValue | undefined>;
export declare function ThemeProvider({ children, defaultTheme, storageKey, attribute, enableSystem, disableTransitionOnChange }: ThemeProviderProps): React.JSX.Element;
```

</details>

<details>
<summary><code>providers/ToastProvider</code></summary>

Fonte: [providers/ToastProvider](src/providers/ToastProvider.tsx).

```ts
import React from 'react';
import { type ToastProps } from '../components/toast.js';
export interface ToastContextType {
    addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
    removeToast: (id: string) => void;
    success: (title: string, description?: string, options?: Partial<ToastProps>) => string;
    error: (title: string, description?: string, options?: Partial<ToastProps>) => string;
    warning: (title: string, description?: string, options?: Partial<ToastProps>) => string;
    info: (title: string, description?: string, options?: Partial<ToastProps>) => string;
}
export declare function ToastProvider({ children }: {
    children: React.ReactNode;
}): React.JSX.Element;
export declare function useToastContext(): ToastContextType;
```

</details>

### functions

<details>
<summary><code>functions/formatBytes</code></summary>

Fonte: [functions/formatBytes](src/functions/formatBytes.ts).

```ts
export interface FormatBytesOptions {
    decimals?: number;
    binary?: boolean;
    fallback?: string;
    locale?: string;
}
export declare function formatBytes(bytes: number | string | null | undefined, options?: FormatBytesOptions): string;
```

</details>

<details>
<summary><code>functions/formatCurrency</code></summary>

Fonte: [functions/formatCurrency](src/functions/formatCurrency.ts).

```ts
export interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
    locale?: string;
    currency?: string;
    fallback?: string;
    fromCents?: boolean;
}
export declare function formatCurrency(value: number | string | null | undefined, options?: FormatCurrencyOptions): string;
export declare function formatCurrencyCompact(value: number | string | null | undefined, options?: FormatCurrencyOptions): string;
export declare function parseCurrency(value: string | number | null | undefined): number;
export declare function currencyToCents(value: string | number | null | undefined): number;
```

</details>

<details>
<summary><code>functions/formatDate</code></summary>

Fonte: [functions/formatDate](src/functions/formatDate.ts).

```ts
type DateInput = string | number | Date;
declare function parseDateInput(dateInput: DateInput | null | undefined): Date | null;
declare function formatDate(dateInput: DateInput): {
    date: string;
    time: string;
    dateTime: string;
    textDate: string;
    textDateTime: string;
    relative: string;
    calendar: string;
    iso: string;
    dayOfWeek: string;
    monthName: string;
    remaining: string;
};
declare function formatDaysRemaining(days: number): {
    number: number;
    text: string;
    value: string;
    short: string;
};
declare function formatDateValue(dateInput: DateInput | null | undefined, pattern?: string, fallback?: string): string;
declare function formatDateRange(start: DateInput | null | undefined, end: DateInput | null | undefined, pattern?: string): string;
declare function isValidDate(dateInput: DateInput | null | undefined): boolean;
declare function isToday(dateInput: DateInput | null | undefined): boolean;
export { formatDate, formatDaysRemaining, formatDateValue, formatDateRange, parseDateInput, isValidDate, isToday };
```

</details>

<details>
<summary><code>functions/formatJson</code></summary>

Fonte: [functions/formatJson](src/functions/formatJson.ts).

```ts
/**
 * Formata um objeto JavaScript ou uma string JSON para uma string formatada e legível.
 * @param data - O objeto ou string JSON a ser formatado.
 * @returns Uma string JSON formatada ou uma mensagem de erro/aviso.
 */
interface FormatJsonOptions {
    indentation?: number;
    fallback?: string;
    sortKeys?: boolean;
    redactKeys?: string[];
}
declare function formatJson(data: unknown, options?: FormatJsonOptions): string;
export { formatJson };
export type { FormatJsonOptions };
```

</details>

<details>
<summary><code>functions/formatNumber</code></summary>

Fonte: [functions/formatNumber](src/functions/formatNumber.ts).

```ts
export interface FormatNumberOptions extends Intl.NumberFormatOptions {
    locale?: string;
    fallback?: string;
}
export declare function formatNumber(value: number | string | null | undefined, options?: FormatNumberOptions): string;
export declare const formatCompactNumber: (value: number | string | null | undefined, options?: FormatNumberOptions) => string;
export declare const formatPercentage: (value: number | string | null | undefined, options?: FormatNumberOptions & {
    alreadyPercent?: boolean;
}) => string;
export declare const clamp: (value: number, min?: number, max?: number) => number;
export declare const calculatePercentage: (value: number, total: number, precision?: number) => number;
```

</details>

<details>
<summary><code>functions/formatPhone</code></summary>

Fonte: [functions/formatPhone](src/functions/formatPhone.ts).

```ts
/**
 * Formata um número de telefone brasileiro com DDD
 * Suporta números com 10 dígitos (fixo) ou 11 dígitos (celular)
 *
 * @param phone - Número de telefone (pode conter caracteres não numéricos)
 * @returns Telefone formatado no padrão (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
 *
 * @example
 * formatPhone('11987654321') // Retorna: (11) 98765-4321
 * formatPhone('1133334444') // Retorna: (11) 3333-4444
 * formatPhone('(11) 98765-4321') // Retorna: (11) 98765-4321
 */
export declare function formatPhone(phone: string | number | null | undefined): string | number;
/**
 * Remove a formatação do telefone, retornando apenas os números
 *
 * @param phone - Telefone formatado
 * @returns Apenas os números do telefone
 *
 * @example
 * unformatPhone('(11) 98765-4321') // Retorna: '11987654321'
 */
export declare function unformatPhone(phone: string | null | undefined): string;
/**
 * Valida se um telefone brasileiro é válido
 *
 * @param phone - Número de telefone
 * @returns true se o telefone for válido
 *
 * @example
 * isValidPhone('11987654321') // Retorna: true
 * isValidPhone('119876') // Retorna: false
 */
export declare function isValidPhone(phone: string | null | undefined): boolean;
/**
 * Formata o telefone enquanto o usuário digita (mask)
 * Útil para inputs controlados
 *
 * @param value - Valor atual do input
 * @returns Valor formatado
 *
 * @example
 * maskPhone('1198765') // Retorna: (11) 98765
 * maskPhone('11987654321') // Retorna: (11) 98765-4321
 */
export declare function maskPhone(value: string): string;
```

</details>

<details>
<summary><code>functions/formatText</code></summary>

Fonte: [functions/formatText](src/functions/formatText.ts).

```ts
export declare const capitalize: (value: string | null | undefined) => string;
export declare const titleCase: (value: string | null | undefined) => string;
export declare const initials: (value: string | null | undefined, limit?: number) => string;
export declare const truncate: (value: string | null | undefined, maxLength?: number, suffix?: string) => string;
export declare const pluralize: (count: number, singular: string, plural?: string) => string;
export declare const normalizeSearchText: (value: string | null | undefined) => string;
export declare const maskEmail: (email: string | null | undefined) => string;
```

</details>

<details>
<summary><code>functions/formatTime</code></summary>

Fonte: [functions/formatTime](src/functions/formatTime.ts).

```ts
export interface FormatTimeOptions {
    includeSeconds?: boolean;
    fallback?: string;
    locale?: string;
    hour12?: boolean;
}
export declare const parseTimeToMinutes: (time: string | null | undefined) => number | null;
export declare const minutesToTime: (minutes: number, includeSeconds?: boolean) => string;
export declare const formatTime: (value: string | number | Date | null | undefined, options?: FormatTimeOptions) => string;
export declare const formatTimeRange: (start: string | null | undefined, end: string | null | undefined, separator?: string) => string;
export declare const formatDuration: (minutes: number, options?: {
    compact?: boolean;
    fallback?: string;
    type?: "time" | "duration";
    returnTypeTime?: "milliseconds" | "seconds" | "minutes" | "hours";
}) => string | number;
export default formatTime;
```

</details>

<details>
<summary><code>functions/getFieldError</code></summary>

Fonte: [functions/getFieldError](src/functions/getFieldError.ts).

```ts
export type ValidationErrors = Record<string, string | string[] | undefined>;
export declare const getFieldErrors: (fieldName: string, errors?: ValidationErrors) => string[];
export declare const getFieldError: (fieldName: string, errors?: ValidationErrors, fallback?: string) => string | undefined;
export declare const hasFieldError: (fieldName: string, errors?: ValidationErrors) => boolean;
export declare const getFirstError: (errors?: ValidationErrors) => string | undefined;
```

</details>

<details>
<summary><code>functions/getStatusBadge</code></summary>

Fonte: [functions/getStatusBadge](src/functions/getStatusBadge.ts).

```ts
export type StatusVariant = "success" | "destructive" | "warning" | "info" | "default" | "scheduled";
export interface StatusMeta {
    text: string;
    label: string;
    color: string;
    variant: StatusVariant;
    normalized: string;
}
export declare function getStatusBadge(status: string | null | undefined): {
    text: string;
    color: string;
    variant: StatusVariant;
};
export declare const getStatusLabel: (status: string | null | undefined, fallback?: string) => string;
export declare const getStatusMeta: (status: string | null | undefined) => StatusMeta;
export declare const isPositiveStatus: (status: string | null | undefined) => boolean;
export declare const isNegativeStatus: (status: string | null | undefined) => boolean;
export declare const isPendingStatus: (status: string | null | undefined) => boolean;
```

</details>

<details>
<summary><code>functions/handleCopy</code></summary>

Fonte: [functions/handleCopy](src/functions/handleCopy.ts).

```ts
/**
 * Copia um valor para a área de transferência e executa callbacks de sucesso ou erro.
 * @param value O valor (string ou número) a ser copiado.
 * @param onSuccess Callback a ser executado em caso de sucesso.
 * @param onError Callback a ser executado em caso de erro.
 */
declare const handleCopy: (value: string | number, onSuccess?: () => void, onError?: (error: any) => void) => void;
export { handleCopy };
```

</details>

<details>
<summary><code>functions/handleInputChange</code></summary>

Fonte: [functions/handleInputChange](src/functions/handleInputChange.ts).

```ts
import type { Dispatch, SetStateAction } from 'react';
import { type ValidationErrors } from './getFieldError.js';
export declare const handleInputChange: <T extends object>(field: string, value: string | number | (string | number)[] | boolean | Date | undefined, errors: ValidationErrors | undefined, clearFieldError: (fieldName: string) => void, setFormData: Dispatch<SetStateAction<T>>) => void;
```

</details>

<details>
<summary><code>functions/http</code></summary>

Fonte: [functions/http](src/functions/http.ts).

```ts
export interface HttpRequestOptions {
    params?: Record<string, unknown>;
    signal?: AbortSignal;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    next?: {
        revalidate?: number | false;
        tags?: string[];
    };
}
export interface HttpClient {
    request<T>(method: string, url: string, data?: unknown, options?: HttpRequestOptions): Promise<T>;
}
export declare class HttpError extends Error {
    readonly status: number;
    readonly data: unknown;
    constructor(status: number, data: unknown, message?: string);
}
export declare function resolveHttpError(error: unknown, fallback?: string): string;
export declare function appendParams(url: string, params?: Record<string, unknown>): string;
export interface FetchClientOptions {
    baseUrl?: string;
    fetcher?: typeof fetch;
    credentials?: RequestCredentials;
    headers?: HeadersInit | (() => HeadersInit | Promise<HeadersInit>);
    /** Return true after refreshing credentials to retry the request once. */
    onUnauthorized?: () => boolean | void | Promise<boolean | void>;
}
export declare function createFetchClient(config?: FetchClientOptions): HttpClient;
/** Accepts an existing Axios instance; its interceptors keep ownership of auth and refresh. */
export interface AxiosLike {
    request<T = unknown>(config: any): Promise<{
        data: T;
    }>;
}
export declare function createAxiosClient(instance: AxiosLike): HttpClient;
```

</details>

<details>
<summary><code>functions/openDownloadUrl</code></summary>

Fonte: [functions/openDownloadUrl](src/functions/openDownloadUrl.ts).

```ts
/** Opens an HTTP(S) URL in the browser. The server controls download disposition. */
export declare function openDownloadUrl(downloadUrl: string): void;
```

</details>

<details>
<summary><code>functions/removeMask</code></summary>

Fonte: [functions/removeMask](src/functions/removeMask.ts).

```ts
/**
 * Remove todos os caracteres não numéricos de uma string
 * Útil para remover máscaras de telefone, CPF, CNPJ, CEP, etc.
 */
export declare const removeMask: (value: string | number | undefined | null) => string;
export declare const keepAlphaNumeric: (value: string | number | undefined | null) => string;
export declare const removeDiacritics: (value: string | null | undefined) => string;
/**
 * Remove máscaras de múltiplos campos de um objeto
 */
export declare const removeMaskFromFields: <T extends Record<string, any>>(data: T, fields: (keyof T)[]) => T;
export declare const transformFields: <T extends Record<string, unknown>>(data: T, fields: (keyof T)[], transformer: (value: unknown, field: keyof T) => unknown) => T;
```

</details>

<details>
<summary><code>functions/serverFetch</code></summary>

Fonte: [functions/serverFetch](src/functions/serverFetch.ts).

```ts
import { type FetchClientOptions, type HttpRequestOptions } from './http.js';
/** Call from Server Components, Server Actions or Route Handlers. */
export declare function createServerFetch(config?: FetchClientOptions): <T>(url: string, options?: HttpRequestOptions & {
    method?: string;
    body?: unknown;
}) => Promise<T>;
```

</details>

<details>
<summary><code>functions/table-values</code></summary>

Fonte: [functions/table-values](src/functions/table-values.ts).

```ts
/** Decimal monetario canonico como string, sem aritmetica de ponto flutuante. */
export declare function parseTableMoney(value: unknown): string | undefined;
export declare function formatTableMoney(value: unknown, currency?: string): string;
export declare function parseTableDate(value: unknown): string | undefined;
export declare function formatTableDate(value: unknown): string;
```

</details>

<details>
<summary><code>functions/utils</code></summary>

Fonte: [functions/utils](src/functions/utils.ts).

```ts
import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
```

</details>

### types

<details>
<summary><code>types/responses</code></summary>

Fonte: [types/responses](src/types/responses.ts).

```ts
/** Envelope returned by server actions, including form feedback. */
export interface ActionResponse<T = unknown> {
    success?: boolean;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
    message?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
}
export interface LaravelPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
/** Pagination fields shared by paginate() and paginated API Resources. */
export interface LaravelPaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    from?: number | null;
    to?: number | null;
    path?: string;
    links?: LaravelPaginationLink[];
}
/** JSON returned directly by Laravel's paginate(). */
export interface LaravelPaginatedResponse<T> extends LaravelPaginationMeta {
    data: T[];
    first_page_url?: string;
    last_page_url?: string;
    next_page_url?: string | null;
    prev_page_url?: string | null;
}
export interface LaravelResourcePaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}
/** Default JSON envelope for a single Laravel API Resource. */
export interface LaravelResourceResponse<T> {
    data: T;
}
/** JSON returned by Resource::collection() with paginate(). */
export interface LaravelPaginatedResourceResponse<T> {
    data: T[];
    links: LaravelResourcePaginationLinks;
    meta: LaravelPaginationMeta;
}
/** HTTP response for an index returning paginate() directly. */
export type IndexResponse<T> = LaravelPaginatedResponse<T>;
/** HTTP response for a show returning a model directly (no pagination). */
export type ShowResponse<T> = T;
/** Action wrapping an index HTTP response; pagination lives in action.data. */
export type IndexActionResponse<T> = ActionResponse<IndexResponse<T>>;
/** Action wrapping a single model. */
export type ShowActionResponse<T> = ActionResponse<ShowResponse<T>>;
```

</details>

### Exports da raiz

```ts
export * from './components/skeleton.js';
export * from './components/toast.js';
export * from './hooks/useDebounce.js';
export * from './hooks/useTheme.js';
export * from './hooks/useToast.js';
export * from './hooks/useAction.js';
export type * from './types/responses.js';
export * from './hooks/useFetch.js';
export * from './hooks/useApi.js';
export * from './hooks/useCep.js';
export * from './functions/http.js';
export * from './providers/ThemeProvider.js';
export * from './providers/ToastProvider.js';
export * from './components/badge.js';
export * from './components/separator.js';
export * from './components/theme.js';
export * from './components/motion.js';
export * from './components/form-field.js';
export * from './components/section.js';
export * from './components/spinner.js';
export * from './components/switch.js';
export * from './components/pagination.js';
export * from './components/text.js';
export * from './components/progress-bar.js';
export * from './components/tabs.js';
export * from './components/dropdown-menu.js';
export * from './components/button.js';
export * from './components/input.js';
export * from './components/textarea.js';
export * from './components/info.js';
export * from './components/modal.js';
export * from './components/accordion.js';
export * from './components/card.js';
export * from './components/alert.js';
export * from './components/empty-state.js';
export * from './components/select.js';
export * from './components/bulk-actions.js';
export * from './components/calendar.js';
export * from './components/month-year-picker.js';
export * from './components/carousel.js';
export * from './components/chart.js';
export * from './components/gallery.js';
export * from './components/image.js';
export * from './components/search.js';
export { SpeedDial, speedDialVariants, buttonVariants } from './components/speed-dial.js';
export type { SpeedDialAction, SpeedDialIcon, SpeedDialProps } from './components/speed-dial.js';
export { SpeedDialTabs, speedDialTabsVariants } from './components/speed-dial-tabs.js';
export type { SpeedDialTab, SpeedDialTabsProps } from './components/speed-dial-tabs.js';
export * from './components/table.js';
export * from './components/tip.js';
export * from './components/breadcrumbs.js';
export { DraggableTable } from './components/draggable-table.js';
export type * from './components/data-types.js';
export { default as Text } from './components/text.js';
export * from './components/avatar.js';
export { default as LogAccordion } from './components/log-accordion.js';
export * from './functions/formatBytes.js';
export * from './functions/formatJson.js';
export * from './functions/formatNumber.js';
export * from './functions/formatPhone.js';
export * from './functions/formatText.js';
export * from './functions/formatTime.js';
export * from './functions/formatCurrency.js';
export * from './functions/formatDate.js';
export * from './functions/getFieldError.js';
export * from './functions/handleInputChange.js';
export * from './functions/removeMask.js';
export * from './hooks/useApiTable.js';
export * from './hooks/useSearch.js';
export * from './hooks/useViewModal.js';
export * from './components/image-input.js';
export * from './components/logo-input.js';
export * from './components/banner-input.js';
export * from './components/switch-field.js';
export * from './components/view-modal.js';
export * from './functions/handleCopy.js';
export * from './functions/openDownloadUrl.js';
export * from './functions/table-values.js';
export * from './components/sidebar.js';
export * from './components/sidebarSection.js';
export * from './components/sidebarNavItem.js';
```

<!-- API-REFERENCE:END -->

### Personalização e responsividade da tabela

O padrão é `mobileLayout="scroll"`, com todas as colunas acessíveis. Use `mobileLayout="stacked"` para campos empilhados com rótulos ou `mobileLayout="responsive"` para manter a política de ocultar colunas extras com `limitColumnsShow`.

`containerClassName`, `scrollClassName`, `headerClassName` e `rowClassName` personalizam cada área; `rowClassName` também aceita `(row, index) => string`. `caption` adiciona uma legenda. Combine com `variant`, `size`, `layout`, `stickyHeader`, `maxHeight` e `columns[].className/width/align`.

Os editores de texto, número, moeda e data usam `Input`; seleção usa `Select`. `editor.inputProps` permite configurar máscara, ícones, variante e atributos do campo, preservando o controle de valor e salvamento da tabela. O editor monetário mantém strings decimais exatas.
