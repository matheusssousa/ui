export type DocCategory = 'Ações' | 'Formulários' | 'Feedback' | 'Navegação' | 'Conteúdo' | 'Overlays' | 'Dados' | 'Datas e mídia';

export interface ComponentDoc {
  name: string;
  slug: string;
  category: DocCategory;
  source: string;
  description: string;
}

const doc = (name: string, slug: string, category: DocCategory, description: string, source = `${slug}.tsx`): ComponentDoc => ({ name, slug, category, source, description });

export const components: ComponentDoc[] = [
  doc('Button', 'button', 'Ações', 'Botões, links, ícones, carregamento e gradientes.'),
  doc('BulkActions', 'bulk-actions', 'Ações', 'Ações aplicadas a uma seleção de registros.'),
  doc('SpeedDial', 'speed-dial', 'Ações', 'Menu flutuante de ações rápidas.'),
  doc('SpeedDialTabs', 'speed-dial-tabs', 'Ações', 'Alternância flutuante entre áreas da aplicação.'),
  doc('Input', 'input', 'Formulários', 'Campo textual com máscaras, tipos e validação.'),
  doc('Textarea', 'textarea', 'Formulários', 'Campo de texto multilinha.'),
  doc('Select', 'select', 'Formulários', 'Seleção simples ou múltipla com busca.'),
  doc('Switch', 'switch', 'Formulários', 'Controle para ativar ou desativar uma opção.'),
  doc('Slider', 'slider', 'Formulários', 'Seleção numérica dentro de um intervalo.'),
  doc('RatingBar', 'rating-bar', 'Formulários', 'Avaliação por estrelas com suporte a teclado.'),
  doc('Alert', 'alert', 'Feedback', 'Avisos semânticos persistentes.'),
  doc('Toast', 'toast', 'Feedback', 'Notificações temporárias.'),
  doc('Empty', 'empty', 'Feedback', 'Estado vazio com orientação e ação.'),
  doc('Spinner', 'spinner', 'Feedback', 'Indicador de carregamento.'),
  doc('Skeleton', 'skeleton', 'Feedback', 'Placeholder de conteúdo em carregamento.'),
  doc('ProgressBar', 'progress-bar', 'Feedback', 'Progresso linear simples ou segmentado.'),
  doc('Tip', 'tip', 'Feedback', 'Informação contextual curta.'),
  doc('Breadcrumbs', 'breadcrumbs', 'Navegação', 'Caminho hierárquico da página atual.'),
  doc('Pagination', 'pagination', 'Navegação', 'Navegação entre páginas de resultados.'),
  doc('Stepper', 'stepper', 'Navegação', 'Etapas de um fluxo com progresso e navegação opcional.'),
  doc('Timeline', 'timeline', 'Conteúdo', 'Eventos cronológicos em disposição vertical ou horizontal.'),
  doc('Tabs', 'tabs', 'Navegação', 'Organização de conteúdo em abas.'),
  doc('Sidebar', 'sidebar', 'Navegação', 'Navegação lateral expansível.'),
  doc('Accordion', 'accordion', 'Conteúdo', 'Seções de conteúdo expansíveis.'),
  doc('Avatar', 'avatar', 'Conteúdo', 'Imagem, iniciais e status de uma pessoa.'),
  doc('Badge', 'badge', 'Conteúdo', 'Rótulos e indicadores de estado.'),
  doc('Card', 'card', 'Conteúdo', 'Superfície para conteúdo, mídia e métricas.'),
  doc('Info', 'info', 'Conteúdo', 'Apresentação estruturada de rótulo e valor.'),
  doc('ListItem', 'list-item', 'Conteúdo', 'Item de lista com ícone, título, descrição, badge e ação.'),
  doc('Section', 'section', 'Conteúdo', 'Agrupamento semântico com cabeçalho.'),
  doc('Separator', 'separator', 'Conteúdo', 'Divisor visual horizontal ou vertical.'),
  doc('Modal', 'modal', 'Overlays', 'Janela modal com cabeçalho e ações.'),
  doc('ViewModal', 'view-modal', 'Overlays', 'Modal configurável de registros.'),
  doc('Dropdown', 'dropdown', 'Overlays', 'Menu contextual acionado pelo usuário.'),
  doc('Table', 'table', 'Dados', 'Tabela tipada com ordenação, edição e seleção.'),
  doc('DraggableTable', 'draggable-table', 'Dados', 'Tabela com reordenação de linhas.'),
  doc('Chart', 'chart', 'Dados', 'Gráficos de linha, área, barra, pizza e radar.'),
  doc('Calendar', 'calendar', 'Datas e mídia', 'Seleção e visualização de datas.'),
  doc('MonthYearPicker', 'month-year-picker', 'Datas e mídia', 'Seletor de mês e ano.'),
  doc('Carousel', 'carousel', 'Datas e mídia', 'Navegação horizontal entre conteúdos.'),
  doc('Gallery', 'gallery', 'Datas e mídia', 'Galeria responsiva de imagens.'),
  doc('Image', 'image', 'Datas e mídia', 'Imagem com fallback e proporção.'),
];

export const categories = [...new Set(components.map((item) => item.category))];
export const getComponent = (slug: string) => components.find((item) => item.slug === slug);
