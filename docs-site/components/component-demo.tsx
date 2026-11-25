'use client';

import { Children, cloneElement, isValidElement, useState, type ReactNode } from 'react';
import { BulkActions } from '../../dist/components/bulk-actions.js';
import { SpeedDial } from '../../dist/components/speed-dial.js';
import { SpeedDialTabs } from '../../dist/components/speed-dial-tabs.js';
import { Toast } from '../../dist/components/toast.js';
import { Breadcrumbs } from '../../dist/components/breadcrumbs.js';
import { Sidebar } from '../../dist/components/sidebar.js';
import { ViewModal } from '../../dist/components/view-modal.js';
import { Table } from '../../dist/components/table.js';
import { DraggableTable } from '../../dist/components/draggable-table.js';
import { Calendar } from '../../dist/components/calendar.js';
import { Carousel } from '../../dist/components/carousel.js';
import { Gallery } from '../../dist/components/gallery.js';
import { InfoIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../dist/components/accordion.js';
import { Alert } from '../../dist/components/alert.js';
import { Avatar, AvatarGroup } from '../../dist/components/avatar.js';
import { Badge } from '../../dist/components/badge.js';
import { Button } from '../../dist/components/button.js';
import { Card } from '../../dist/components/card.js';
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from '../../dist/components/dropdown.js';
import { Empty } from '../../dist/components/empty.js';
import { Info } from '../../dist/components/info.js';
import { Stepper } from '../../dist/components/stepper.js';
import { Timeline } from '../../dist/components/timeline.js';
import { RatingBar } from '../../dist/components/rating-bar.js';
import { Input } from '../../dist/components/input.js';
import { Modal } from '../../dist/components/modal.js';
import { MonthYearPicker } from '../../dist/components/month-year-picker.js';
import { Pagination } from '../../dist/components/pagination.js';
import { ProgressBar } from '../../dist/components/progress-bar.js';
import { Section } from '../../dist/components/section.js';
import { Select } from '../../dist/components/select.js';
import { Separator } from '../../dist/components/separator.js';
import { Skeleton } from '../../dist/components/skeleton.js';
import { Slider } from '../../dist/components/slider.js';
import { Spinner } from '../../dist/components/spinner.js';
import { Switch } from '../../dist/components/switch.js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../dist/components/tabs.js';
import { Textarea } from '../../dist/components/textarea.js';
import { Tip } from '../../dist/components/tip.js';
import { Image } from '../../dist/components/image.js';
import { BarChart, LineChart, AreaChart, PieChart, DonutChart, RadarChart, RadialBarChart, SparklineChart } from '../../dist/components/chart.js';

const landscape = 'https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&w=1470&q=80';
const portrait = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80';
const chartData = [{ label: 'Janeiro', value: 24 }, { label: 'Fevereiro', value: 38 }, { label: 'Março', value: 31 }];

const frame = 'flex min-h-48 w-full flex-wrap items-center justify-center gap-4 rounded-2xl border border-border bg-background p-6 sm:p-10';

export function ComponentDemo({ slug, overrides = {} }: { slug: string; overrides?: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(2);
  const [enabled, setEnabled] = useState(true);
  const [rating, setRating] = useState(3);
  const [rows, setRows] = useState([{ id: 1, name: 'Ana', email: 'ana@example.com' }, { id: 2, name: 'Bruno', email: 'bruno@example.com' }]);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState<import('../../dist/components/calendar.js').CalendarProps['selected']>();
  const columns = [{ key: 'name', label: 'Nome' }, { key: 'email', label: 'E-mail' }];
  const photos = [landscape, 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1000&q=80'].map((src, id) => ({ id, src, alt: `Paisagem natural ${id + 1}` }));

  let content: React.ReactNode;
  switch (slug) {
    case 'bulk-actions': content = <BulkActions selectedItems={rows} onClearSelection={() => setMessage('Seleção limpa')} onBulkDelete={() => setMessage('Exclusão simulada')} onBulkRestore={() => setMessage('Restauração simulada')} />; break;
    case 'speed-dial': content = <SpeedDial actions={[{ label: 'Criar', icon: 'PlusIcon', onClick: () => setMessage('Criar selecionado') }, { label: 'Copiar', icon: 'CopyIcon', onClick: () => setMessage('Copiar selecionado') }]} />; break;
    case 'speed-dial-tabs': content = <SpeedDialTabs triggerLabel="Navegar" tabs={[{ value: 'home', label: 'Início' }, { value: 'settings', label: 'Configurações' }]} onValueChange={setMessage} />; break;
    case 'toast': content = <Toast id="example" title="Alterações salvas" description="Notificação de exemplo" isVisible onClose={() => setMessage('Notificação dispensada')} />; break;
    case 'breadcrumbs': content = <Breadcrumbs items={[{ label: 'Biblioteca', href: '/' }, { label: 'Componentes' }]} />; break;
    case 'sidebar': content = <Sidebar position="static" defaultOpen name="Biblioteca" sections={[{ title: 'Menu', items: [{ label: 'Início', href: '/' }, { label: 'Componentes', href: '/components/button' }] }]} />; break;
    case 'table': content = <Table columns={columns} data={rows} selectable onSelectionChange={ids => setMessage(`${ids.length} selecionados`)} />; break;
    case 'draggable-table': content = <DraggableTable columns={columns} data={rows} draggable onReorder={data => setRows(data as typeof rows)} />; break;
    case 'calendar': content = <Calendar selected={selected} onSelect={setSelected} />; break;
    case 'carousel': content = <Carousel className="w-full" items={photos.map(photo => ({ id: photo.id, content: <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" /> }))} />; break;
    case 'gallery': content = <Gallery images={photos} className="w-full" enableLightbox />; break;
    case 'dropdown': content = <Dropdown><DropdownTrigger>Abrir menu</DropdownTrigger><DropdownContent><DropdownItem onClick={() => setMessage('Editar selecionado')}>Editar</DropdownItem><DropdownItem onClick={() => setMessage('Duplicar selecionado')}>Duplicar</DropdownItem></DropdownContent></Dropdown>; break;
    case 'view-modal': content = <><Button fullWidth={false} onClick={() => setOpen(true)}>Ver registro</Button><ViewModal isOpen={open} onClose={() => setOpen(false)} data={{ name: 'Ana' }} config={{ title: 'Perfil', sections: [{ fields: [{ key: 'name', label: 'Nome' }] }] }} /></>; break;
    case 'image': content = <Image src={landscape} alt="Paisagem com cabana junto ao lago" aspectRatio="video" containerClassName="w-full max-w-2xl" />; break;
    case 'chart': content = <div className="grid w-full gap-5 md:grid-cols-2"><BarChart data={chartData} title="Barras" /><LineChart data={chartData} title="Linha" /><AreaChart data={chartData} title="Área" /><PieChart data={chartData} title="Pizza" /><DonutChart data={chartData} title="Rosca" /><RadarChart data={chartData} title="Radar" /><RadialBarChart data={chartData} title="Barras radiais" /><SparklineChart data={chartData} title="Sparkline" /></div>; break;
    case 'button': content = (<div className='flex gap-3'>
      <Button fullWidth={false}>Continuar</Button>
      <Button fullWidth={false} variant="outline">Continuar</Button>
      <Button fullWidth={false} variant="ghost">Continuar</Button>
      <Button fullWidth={false} variant="soft">Continuar</Button>
    </div>);
      break;
    case 'alert': content = <div className="w-full max-w-xl space-y-3"><Alert color="info" title="Informação" description="Este é um aviso informativo." /><Alert color="success" title="Tudo certo" description="As alterações foram salvas." /></div>; break;
    case 'avatar': content = <><Avatar name="Maria Silva" status="online" /><Avatar name="João Souza" color="secondary" /><AvatarGroup avatars={[{ name: 'Ana' }, { name: 'Bruno' }, { name: 'Carla' }, { name: 'Diego' }]} /></>; break;
    case 'badge': content = <><Badge color="primary">Novo</Badge><Badge color="success" dot>Ativo</Badge><Badge color="warning" pill>Aguardando</Badge><Badge variant="gradient" gradient="retro">Premium</Badge></>; break;
    case 'card': content = <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2"><Card title="Resumo" description="Conteúdo agrupado em uma superfície.">Conteúdo do card</Card><Card metric={{ label: 'Receita', value: 24890, format: 'currency', change: 12.4, tone: 'success' }} /></div>; break;
    case 'empty': content = <Empty title="Nenhum resultado" description="Altere os filtros ou crie um novo registro." action={<Button fullWidth={false} size="sm">Criar registro</Button>} />; break;
    case 'stepper': content = <Stepper className="w-full" textPosition={'bottom'} steps={[{ title: 'Dados', description: 'Informações pessoais' }, { title: 'Endereço' }, { title: 'Confirmação' }]} currentStep={page - 1} onStepChange={index => setPage(index + 1)} />; break;
    case 'timeline': content = <Timeline className="w-full max-w-xl" items={[{ title: 'Pedido criado', date: '09:15', description: 'Pagamento confirmado.' }, { title: 'Em separação', date: '10:40', status: 'current' }, { title: 'Enviado', status: 'pending' }]} />; break;
    case 'input': content = <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2"><Input label="Nome" placeholder="Maria Silva" /><Input label="E-mail" type="email" validation="success" value="maria@empresa.com" readOnly /><Input label="Senha" type="password" placeholder="Sua senha" /><Input label="Telefone" mask="phone" placeholder="(00) 00000-0000" /></div>; break;
    case 'textarea': content = <Textarea className="w-full max-w-xl" label="Descrição" placeholder="Conte um pouco mais..." />; break;
    case 'select': content = <Select className="w-full max-w-sm" label="Plano" placeholder="Selecione" searchable clearable options={[{ value: 'basic', label: 'Básico' }, { value: 'pro', label: 'Profissional' }, { value: 'enterprise', label: 'Empresarial' }]} />; break;
    case 'switch': content = <div className="flex items-center gap-3"><Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Ativar notificações" /><span className="text-sm">Notificações {enabled ? 'ativadas' : 'desativadas'}</span></div>; break;
    case 'slider': content = <Slider className="w-full max-w-md" label="Volume" defaultValue={65} showValue />; break;
    case 'rating-bar': content = <RatingBar value={rating} onValueChange={setRating} label="Avaliação do atendimento" showValue allowClear />; break;
    case 'spinner': content = <><Spinner size="sm" /><Spinner size="md" color="secondary" /><Spinner size="lg" color="success" label="Carregando dados" /></>; break;
    case 'skeleton': content = <div className="w-full max-w-md space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-24 w-full" /></div>; break;
    case 'progress-bar': content = <div className="w-full max-w-xl space-y-5"><ProgressBar value={72} label="Progresso" showLabel showPercentage /><ProgressBar value={48} color="gradient" gradient="landscape" striped /></div>; break;
    case 'pagination': content = <Pagination currentPage={page} totalPages={8} onPageChange={setPage} color="primary" />; break;
    case 'tabs': content = <Tabs className="w-full max-w-xl" defaultValue="overview"><TabsList aria-label="Seções"><TabsTrigger value="overview">Visão geral</TabsTrigger><TabsTrigger value="history">Histórico</TabsTrigger></TabsList><TabsContent value="overview" className="rounded-xl border border-border p-5">Conteúdo da visão geral.</TabsContent><TabsContent value="history" className="rounded-xl border border-border p-5">Conteúdo do histórico.</TabsContent></Tabs>; break;
    case 'accordion': content = <Accordion className="w-full max-w-xl"><AccordionItem value="one"><AccordionTrigger>Como instalar?</AccordionTrigger><AccordionContent>Instale o pacote e importe os estilos globais.</AccordionContent></AccordionItem><AccordionItem value="two"><AccordionTrigger>Tem suporte a tema escuro?</AccordionTrigger><AccordionContent>Sim, por meio da classe dark e tokens semânticos.</AccordionContent></AccordionItem></Accordion>; break;
    case 'info': content = <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2"><Info label="Plano" value="Profissional" /><Info label="Status" value="Ativo" icon={<InfoIcon />} variant="card" /></div>; break;
    case 'section': content = <Section className="w-full max-w-2xl" title="Dados pessoais" description="Informações básicas do usuário" bordered><p className="text-sm text-muted-foreground">Conteúdo da seção.</p></Section>; break;
    case 'separator': content = <div className="w-full max-w-xl space-y-6"><Separator /><Separator text="ou continue com" /><Separator variant="gradient" gradient="retro" /></div>; break;
    case 'tip': content = <Tip className="w-full max-w-xl" color="info" icon={<InfoIcon />} action={{ label: 'Saiba mais', onClick: () => undefined }}>Você pode personalizar os tokens da biblioteca no CSS global.</Tip>; break;
    case 'modal': content = <><Button fullWidth={false} onClick={() => setOpen(true)}>Abrir modal</Button><Modal isOpen={open} onClose={() => setOpen(false)} title="Detalhes" size="md"><p className="text-sm text-muted-foreground">Conteúdo apresentado sobre a página atual.</p></Modal></>; break;
    case 'month-year-picker': content = <MonthYearPicker defaultValue={new Date(2026, 10, 1)} minYear={2020} maxYear={2030} />; break;
    default: content = <div className="max-w-lg text-center"><p className="font-medium">Componente disponível na biblioteca</p><p className="mt-2 text-sm text-muted-foreground">A demonstração interativa especializada deste componente será adicionada nesta mesma página.</p></div>;
  }
  if (slug === 'input' && overrides.type === 'image') {
    content = <Input type="image" label="Imagem" currentImageUrl={landscape} maxSize={5} />;
  }
  const targets = {
    button: Button,
    alert: Alert,
    avatar: Avatar,
    badge: Badge,
    card: Card,
    'empty': Empty,
    stepper: Stepper,
    timeline: Timeline,
    input: Input,
    textarea: Textarea,
    select: Select,
    switch: Switch,
    slider: Slider,
    'rating-bar': RatingBar,
    spinner: Spinner,
    skeleton: Skeleton,
    'progress-bar': ProgressBar,
    pagination: Pagination,
    tabs: Tabs,
    accordion: Accordion,
    info: Info,
    section: Section,
    separator: Separator,
    tip: Tip,
    modal: Modal,
    'month-year-picker': MonthYearPicker,
    image: Image,
    chart: BarChart,
    'bulk-actions': BulkActions,
    'speed-dial': SpeedDial,
    'speed-dial-tabs': SpeedDialTabs,
    toast: Toast,
    breadcrumbs: Breadcrumbs,
    sidebar: Sidebar,
    table: Table,
    'draggable-table': DraggableTable,
    calendar: Calendar,
    carousel: Carousel,
    gallery: Gallery,
    dropdown: Dropdown,
    'view-modal': ViewModal
  };
  const target = targets[slug as keyof typeof targets];
  function apply(node: ReactNode): ReactNode {
    return Children.map(node, child => {
      if (!isValidElement<Record<string, unknown>>(child)) return child;
      if (child.type === target || (slug === 'chart' && [LineChart, AreaChart, PieChart, DonutChart, RadarChart, RadialBarChart, SparklineChart].some(chart => child.type === chart))) return cloneElement(child, overrides);
      return child.props.children ? cloneElement(child, {}, apply(child.props.children as ReactNode)) : child;
    });
  }
  return <div className={`${frame} relative isolate [transform:translateZ(0)]`}><div className="w-full">{apply(content)}</div>{message && <output className="text-sm" aria-live="polite">{message}</output>}</div>;
}
