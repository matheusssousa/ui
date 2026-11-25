# Changelog

Todas as mudanças relevantes de `@matheusssousa/ui` são documentadas neste arquivo.

O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto utiliza [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.5.0]

> **BREAKING:** esta seção contém alterações incompatíveis de API pública e deve ser publicada em uma nova versão minor, como `0.5.0`, enquanto a biblioteca estiver em `0.x`.

### Adicionado

- Variante `stacked` no `Carousel`, com camadas decorativas que indicam a existência de outros slides.
- Cor semântica `foreground` em `UIColor` e nos componentes que consomem as cores compartilhadas.
- Variantes de superfície compartilhadas `default`, `filled`, `outline`, `soft`, `minimal`, `elevated`, `glass` e `glow`, exportadas por `uiSurfaceVariants` e `UISurfaceVariant`.
- Classes reutilizáveis e coloridas para superfícies `glass` e `glow` por meio de `surfaceToneClasses`.

### Alterado

- Transição do `Carousel` corrigida para manter os slides anterior e seguinte visíveis durante todo o deslocamento.
- `Button` padronizado para combinar todas as variantes visuais com todas as cores de `UIColor`.
- Estado `active` do `Button` agora respeita sua variante e cor.
- Gradientes do `Button` e do `Card` agora são aplicados pela propriedade `gradient` e respeitam a variante visual escolhida.
- `Card` padronizado com variantes e cores semânticas compartilhadas, incluindo contraste herdado por títulos e descrições.
- Propriedade `interactive` do `Card` passou a controlar somente comportamento e movimento, independentemente da variante visual.

### Removido

- **BREAKING:** variantes semânticas e legadas do `Button`: `edited`, `deleted`, `restored`, `danger`, `warning`, `success`, `gradient`, `outlined` e `linkSettings`.
- **BREAKING:** cores legadas do `Button`; use os valores de `UIColor`.
- **BREAKING:** variantes `gradient`, `interactive` e `outlined` do `Card`.

### Migração

- Troque `Button variant="outlined"` por `variant="outline"`.
- Troque as variantes semânticas do `Button` por `variant="filled"` com `color`: `success` → `color="success"`, `warning` → `color="warning"` e `danger`/`deleted` → `color="danger"`.
- Troque as cores legadas mais comuns do `Button`: `blue` → `tertiary`, `red` → `danger`, `green` → `success`, `amber` → `warning` e `gray` → `neutral`. Para `purple`, `orange`, `cyan`, `pink`, `card` e `dark`, escolha o `UIColor` semântico correspondente ao contexto do produto.
- Troque `Button variant="gradient" gradient="..."` por `Button gradient="..."`.
- Troque `Button variant="linkSettings"` por `asLink`, `href` e, quando necessário, `className`.
- Troque `Card variant="gradient" gradient="..."` por `Card gradient="..."`, combinando-o opcionalmente com uma variante de superfície.
- Troque `Card variant="interactive"` pela propriedade booleana `interactive`.
- Troque `Card variant="outlined"` por `variant="outline"`.

### Corrigido

- Falha em tempo de execução do `Button` ao receber uma cor legada ou inválida; o componente agora usa `primary` como fallback seguro.
- Renderização de gradientes nas variantes `outline`, `text`, `ghost`, `soft`, `icon` e `iconSoft` do `Button`.
- Contraste do conteúdo interno do `Card` em superfícies preenchidas e com gradiente.

## [0.4.28] - 2026-11-25

### Alterado

- Animações do `Carousel` aprimoradas para transições mais suaves.

## [0.4.27] - 2026-11-25

### Adicionado

- Componentes `Stepper` e `Timeline`.

### Alterado

- Variantes e comportamentos de `Select`, `Switch` e `Textarea` aprimorados.

## [0.4.26] - 2026-11-14

### Alterado

- Suporte a movimento reduzido e novos recursos em componentes da biblioteca.

## [0.4.25] - 2026-10-25

### Corrigido

- Tamanho da fonte das células da planilha passou a herdar o estilo da tabela.

## [0.4.24] - 2026-10-25

### Adicionado

- Formatação de datas e novos tamanhos de tabela.

## [0.4.23] - 2026-10-24

### Adicionado

- Sistema compartilhado de gradientes em múltiplos componentes.

## [0.4.22] - 2026-10-23

> Não existe uma tag `v0.4.21`. A correção registrada no commit que atualizou internamente essa versão está incluída no intervalo publicado como `v0.4.22`.

### Corrigido

- Lógica de foco em campos editáveis.

## [0.4.20] - 2026-10-23

### Alterado

- Exemplos e referência dos componentes de gráficos.

## [0.4.19] - 2026-10-23

### Alterado

- `Sidebar` recebeu novas propriedades configuráveis e melhorias de comportamento.

## [0.4.18] - 2026-10-23

### Adicionado

- Largura relativa em colunas de tabela.

### Alterado

- Estilos de tabelas financeiras aprimorados.

## [0.4.17] - 2026-10-23

### Alterado

- Editores e componentes de tabela aprimorados, com mais personalização e responsividade.

## [0.4.16] - 2026-10-22

### Corrigido

- Hover da variante `iconSoft` do `Button`.

## [0.4.15] - 2026-10-22

### Alterado

- Cores de fundo da variante `iconSoft` do `Button`.

## [0.4.14] - 2026-10-22

### Adicionado

- Variante `iconSoft` do `Button` com suporte a cores personalizadas.

## [0.4.13] - 2026-10-22

### Adicionado

- Botões dinâmicos e variantes personalizadas no `Modal`.

## [0.4.12] - 2026-10-22

### Adicionado

- Opções adicionais de configuração da `Sidebar`.

## [0.4.11] - 2026-10-21

### Adicionado

- Componente `Sidebar` com seções e controle por permissões.

## [0.4.10] - 2026-10-20

- Somente incremento de versão no histórico Git.

## [0.4.9] - 2026-10-19

### Adicionado

- Edição em formato de planilha e novos recursos de tabela.

## [0.4.8] - 2026-10-19

### Adicionado

- Salvamento em modo de linha nas tabelas, com envio em lote ao sair da linha.

## [0.4.7] - 2026-10-19

### Adicionado

- Células editáveis com validação e persistência nas tabelas.

## [0.4.6] - 2026-10-19

### Alterado

- Altura mínima do cabeçalho do `Modal` ampliada.

## [0.4.5] - 2026-10-19

### Alterado

- Botões do `SpeedDialTabs` aprimorados e ícone de seleção adicionado.

## [0.4.4] - 2026-10-19

### Adicionado

- Suporte a botões e links apenas com ícone, mantendo dimensões quadradas.

## [0.4.3] - 2026-10-19

### Adicionado

- Imagem de fundo no cabeçalho do `Modal`.

## [0.4.2] - 2026-10-19

### Adicionado

- Tipos de resposta para Actions e Laravel.

## [0.4.1] - 2026-10-18

### Adicionado

- Componente `LogoInput`.
- Testes da animação ripple do `Button`.

### Alterado

- Funcionalidades do `Modal` aprimoradas.

## [0.3.11] - 2026-10-17

### Adicionado

- Suporte a tons e novas propriedades em componentes.

## [0.3.10] - 2026-10-17

### Alterado

- Classes de cores e acessibilidade de múltiplos componentes aprimoradas.

## [0.3.9] - 2026-10-16

### Alterado

- Estilos e variantes do `SpeedDialTabs` aprimorados.

## [0.3.8] - 2026-10-16

### Adicionado

- Variantes de tamanho, largura e arredondamento no `SpeedDialTabs`.

## [0.3.7] - 2026-10-16

### Alterado

- Tamanhos e estilos de botões e ícones do `SpeedDialTabs` ajustados.

## [0.3.6] - 2026-10-16

### Adicionado

- Componente `SpeedDialTabs`.

## [0.3.5] - 2026-10-16

### Corrigido

- Largura da coluna de ações do `SpeedDial` conforme o tamanho do botão.

## [0.3.4] - 2026-10-16

- Somente incremento de versão no histórico Git.

## [0.3.3] - 2026-10-16

### Adicionado

- Função `cn` para composição de classes com `clsx` e `tailwind-merge`.

## [0.3.2] - 2026-10-16

### Corrigido

- Responsividade da classe de exibição do `Button`.

## [0.3.1] - 2026-10-16

### Alterado

- Ícones e layout dos componentes `Button` e `Toast` aprimorados.

## [0.2.0] - 2026-10-09

### Adicionado

- Primeira versão publicada da biblioteca compartilhada de componentes, hooks e clientes HTTP.

[Não lançado]: https://github.com/matheusssousa/ui/compare/v0.4.28...HEAD
[0.4.28]: https://github.com/matheusssousa/ui/compare/v0.4.27...v0.4.28
[0.4.27]: https://github.com/matheusssousa/ui/compare/v0.4.26...v0.4.27
[0.4.26]: https://github.com/matheusssousa/ui/compare/v0.4.25...v0.4.26
[0.4.25]: https://github.com/matheusssousa/ui/compare/v0.4.24...v0.4.25
[0.4.24]: https://github.com/matheusssousa/ui/compare/v0.4.23...v0.4.24
[0.4.23]: https://github.com/matheusssousa/ui/compare/v0.4.22...v0.4.23
[0.4.22]: https://github.com/matheusssousa/ui/compare/v0.4.20...v0.4.22
[0.4.20]: https://github.com/matheusssousa/ui/compare/v0.4.19...v0.4.20
[0.4.19]: https://github.com/matheusssousa/ui/compare/v0.4.18...v0.4.19
[0.4.18]: https://github.com/matheusssousa/ui/compare/v0.4.17...v0.4.18
[0.4.17]: https://github.com/matheusssousa/ui/compare/v0.4.16...v0.4.17
[0.4.16]: https://github.com/matheusssousa/ui/compare/v0.4.15...v0.4.16
[0.4.15]: https://github.com/matheusssousa/ui/compare/v0.4.14...v0.4.15
[0.4.14]: https://github.com/matheusssousa/ui/compare/v0.4.13...v0.4.14
[0.4.13]: https://github.com/matheusssousa/ui/compare/v0.4.12...v0.4.13
[0.4.12]: https://github.com/matheusssousa/ui/compare/v0.4.11...v0.4.12
[0.4.11]: https://github.com/matheusssousa/ui/compare/v0.4.10...v0.4.11
[0.4.10]: https://github.com/matheusssousa/ui/compare/v0.4.9...v0.4.10
[0.4.9]: https://github.com/matheusssousa/ui/compare/v0.4.8...v0.4.9
[0.4.8]: https://github.com/matheusssousa/ui/compare/v0.4.7...v0.4.8
[0.4.7]: https://github.com/matheusssousa/ui/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/matheusssousa/ui/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/matheusssousa/ui/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/matheusssousa/ui/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/matheusssousa/ui/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/matheusssousa/ui/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/matheusssousa/ui/compare/v0.3.11...v0.4.1
[0.3.11]: https://github.com/matheusssousa/ui/compare/v0.3.10...v0.3.11
[0.3.10]: https://github.com/matheusssousa/ui/compare/v0.3.9...v0.3.10
[0.3.9]: https://github.com/matheusssousa/ui/compare/v0.3.8...v0.3.9
[0.3.8]: https://github.com/matheusssousa/ui/compare/v0.3.7...v0.3.8
[0.3.7]: https://github.com/matheusssousa/ui/compare/v0.3.6...v0.3.7
[0.3.6]: https://github.com/matheusssousa/ui/compare/v0.3.5...v0.3.6
[0.3.5]: https://github.com/matheusssousa/ui/compare/v0.3.4...v0.3.5
[0.3.4]: https://github.com/matheusssousa/ui/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/matheusssousa/ui/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/matheusssousa/ui/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/matheusssousa/ui/compare/v0.2.0...v0.3.1
[0.2.0]: https://github.com/matheusssousa/ui/releases/tag/v0.2.0
