import type * as React from 'react';
import type { UIColor } from './theme.js';

/** Presets de gradiente disponíveis para qualquer componente da biblioteca. */
export const uiGradients = [
  'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info',
  'primary-secondary', 'primary-tertiary', 'info-primary', 'success-info', 'warning-danger',
  'irregular', 'radial-ramp', 'blurred', 'edgy', 'landscape', 'multicolor',
  'retro', 'duotone', 'tricolor', 'volume-mesh', 'banding', 'gradient-image',
] as const;

export type UIGradient = (typeof uiGradients)[number];

/** Configuração reutilizável para presets que recebem imagem ou ajustes de posição. */
export interface UIGradientOptions {
  preset: UIGradient;
  /** Imagem usada pelo preset `gradient-image`. */
  image?: string;
  position?: React.CSSProperties['backgroundPosition'];
  size?: React.CSSProperties['backgroundSize'];
  /** Paleta semântica do tema. Padrão: primary, secondary e tertiary. */
  tones?: readonly [UIColor, UIColor?, UIColor?];
}

export type UIGradientValue = UIGradient | UIGradientOptions;
export type UIGradientSurface = 'vibrant' | 'subtle';

const token = (name: string, alpha?: number) => alpha === undefined
  ? `var(--${name})`
  : `color-mix(in srgb, var(--${name}) ${alpha}%, transparent)`;

const vividBackgrounds: Record<UIGradient, string> = {
  primary: `linear-gradient(120deg, ${token('primary')}, ${token('primary', 72)})`,
  secondary: `linear-gradient(120deg, ${token('secondary')}, ${token('secondary', 72)})`,
  tertiary: `linear-gradient(120deg, ${token('tertiary')}, ${token('tertiary', 72)})`,
  success: `linear-gradient(120deg, ${token('success')}, ${token('success', 72)})`,
  warning: `linear-gradient(120deg, ${token('warning')}, ${token('warning', 72)})`,
  danger: `linear-gradient(120deg, ${token('destructive')}, ${token('destructive', 72)})`,
  info: `linear-gradient(120deg, ${token('info')}, ${token('info', 72)})`,
  'primary-secondary': `linear-gradient(120deg, ${token('primary')}, ${token('secondary')})`,
  'primary-tertiary': `linear-gradient(120deg, ${token('primary')}, ${token('tertiary')})`,
  'info-primary': `linear-gradient(120deg, ${token('info')}, ${token('primary')})`,
  'success-info': `linear-gradient(120deg, ${token('success')}, ${token('info')})`,
  'warning-danger': `linear-gradient(120deg, ${token('warning')}, ${token('destructive')})`,
  irregular: 'radial-gradient(ellipse at 18% 18%, #00efd1 0 22%, transparent 48%), radial-gradient(ellipse at 78% 28%, #7938ff 0 18%, transparent 48%), radial-gradient(ellipse at 72% 86%, #ff5b93 0 14%, transparent 46%), linear-gradient(145deg, #15d4f4 10%, #3457ee 58%, #ff6ca4 100%)',
  'radial-ramp': 'radial-gradient(circle at 50% 78%, #3b176d 0 13%, #f03337 30%, #ff724f 43%, #49a6ff 68%, #6553ff 100%)',
  blurred: 'radial-gradient(circle at 18% 14%, #ff63a4 0 24%, transparent 58%), radial-gradient(circle at 88% 84%, #7259ee 0 34%, transparent 68%), linear-gradient(135deg, #ffafcc, #9b86ff)',
  edgy: 'conic-gradient(from 224deg at 52% 52%, #ff5b94 0 9%, #ff9c89 9% 24%, #ff668f 24% 38%, #5421c9 38% 57%, #130887 57% 72%, #ff5f91 72% 86%, #ff947f 86% 100%)',
  landscape: 'linear-gradient(to bottom, #ff7289 0 27%, #ff8aa2 27% 43%, #de75a3 43% 58%, #8d4b9c 58% 70%, #372078 82%, #150855 100%)',
  multicolor: 'linear-gradient(145deg, #008b9a 0 23%, #62b6aa 30%, #ffc383 48%, #f26f86 65%, #6f315e 82%, #27003e 100%)',
  retro: 'linear-gradient(125deg, #ffef63 0 16%, #60e696 25%, #00cfc5 38%, #087edd 54%, #7424f5 70%, #ef008d 86%, #ff2869 100%)',
  duotone: 'linear-gradient(145deg, #fff383 0%, #ffd469 44%, #ff9328 100%)',
  tricolor: 'radial-gradient(circle at 58% 93%, #ff43bd 0 14%, #bd2be9 30%, transparent 52%), linear-gradient(135deg, #3d16d8 5%, #007fb9 52%, #00a0b3 100%)',
  'volume-mesh': 'radial-gradient(circle at 28% 32%, #ff668c 0 20%, transparent 52%), radial-gradient(circle at 76% 76%, #ff7f98 0 24%, transparent 56%), linear-gradient(135deg, #ffb0a7 0%, #f43d78 52%, #121059 100%)',
  banding: 'linear-gradient(to bottom, #ffe7e4 0 12%, #ffd4d6 12% 25%, #ffc1c9 25% 38%, #ffadb9 38% 51%, #ff98aa 51% 64%, #ff839a 64% 77%, #fa708e 77% 89%, #ef5d81 89% 100%)',
  'gradient-image': 'linear-gradient(135deg, rgba(0,229,255,.72), rgba(255,72,116,.72) 54%, rgba(255,177,224,.76))',
};

const toneToken = (tone: UIColor) => token(tone === 'danger' ? 'destructive' : tone);

function visualBackground(preset: UIGradient, tones: UIGradientOptions['tones']): string {
  if (!tones && !['irregular', 'radial-ramp', 'blurred', 'edgy', 'landscape', 'multicolor', 'retro', 'duotone', 'tricolor', 'volume-mesh', 'banding'].includes(preset)) {
    return vividBackgrounds[preset];
  }
  const [firstTone = 'primary', secondTone = 'secondary', thirdTone = 'tertiary'] = tones ?? [];
  const first = toneToken(firstTone);
  const second = toneToken(secondTone);
  const third = toneToken(thirdTone);
  const transparent = (color: string, amount: number) => `color-mix(in srgb, ${color} ${amount}%, transparent)`;
  const patterns: Partial<Record<UIGradient, string>> = {
    irregular: `radial-gradient(ellipse at 18% 18%, ${first} 0 22%, transparent 48%), radial-gradient(ellipse at 78% 28%, ${second} 0 18%, transparent 48%), radial-gradient(ellipse at 72% 86%, ${third} 0 14%, transparent 46%), linear-gradient(145deg, ${first} 10%, ${second} 58%, ${third} 100%)`,
    'radial-ramp': `radial-gradient(circle at 50% 78%, ${third} 0 13%, ${second} 30%, ${first} 55%, ${transparent(first, 72)} 76%, ${second} 100%)`,
    blurred: `radial-gradient(circle at 18% 14%, ${first} 0 24%, transparent 58%), radial-gradient(circle at 88% 84%, ${second} 0 34%, transparent 68%), linear-gradient(135deg, ${transparent(third, 70)}, ${transparent(second, 82)})`,
    edgy: `conic-gradient(from 224deg at 52% 52%, ${first} 0 9%, ${third} 9% 24%, ${first} 24% 38%, ${second} 38% 57%, ${transparent(second, 72)} 57% 72%, ${first} 72% 86%, ${third} 86% 100%)`,
    landscape: `linear-gradient(to bottom, ${first} 0 27%, ${transparent(first, 82)} 27% 43%, ${third} 43% 58%, ${transparent(second, 78)} 58% 70%, ${second} 82%, ${transparent(second, 65)} 100%)`,
    multicolor: `linear-gradient(145deg, ${second} 0 23%, ${transparent(second, 66)} 30%, ${third} 48%, ${first} 65%, ${transparent(first, 58)} 82%, ${transparent(second, 62)} 100%)`,
    retro: `linear-gradient(125deg, ${third} 0 16%, ${transparent(third, 72)} 25%, ${second} 42%, ${transparent(second, 72)} 56%, ${first} 72%, ${transparent(first, 72)} 86%, ${third} 100%)`,
    duotone: `linear-gradient(145deg, ${transparent(first, 48)} 0%, ${first} 52%, ${second} 100%)`,
    tricolor: `radial-gradient(circle at 58% 93%, ${third} 0 14%, ${first} 30%, transparent 52%), linear-gradient(135deg, ${first} 5%, ${second} 58%, ${third} 100%)`,
    'volume-mesh': `radial-gradient(circle at 28% 32%, ${first} 0 20%, transparent 52%), radial-gradient(circle at 76% 76%, ${third} 0 24%, transparent 56%), linear-gradient(135deg, ${transparent(third, 72)} 0%, ${first} 52%, ${second} 100%)`,
    banding: `linear-gradient(to bottom, ${transparent(first, 18)} 0 12%, ${transparent(first, 28)} 12% 25%, ${transparent(first, 38)} 25% 38%, ${transparent(first, 50)} 38% 51%, ${transparent(first, 62)} 51% 64%, ${transparent(first, 74)} 64% 77%, ${transparent(first, 86)} 77% 89%, ${first} 89% 100%)`,
    'gradient-image': `linear-gradient(135deg, ${transparent(first, 72)}, ${transparent(second, 72)} 54%, ${transparent(third, 76)})`,
  };
  return patterns[preset] ?? vividBackgrounds[preset];
}

const escapeCssUrl = (value: string) => value.replace(/(["\\\n\r])/g, '\\$1');

/** Resolve qualquer preset para estilos inline, inclusive composições com imagem. */
export function getGradientStyle(value?: UIGradientValue, surface: UIGradientSurface = 'vibrant'): React.CSSProperties | undefined {
  if (!value) return undefined;
  const options = typeof value === 'string' ? { preset: value } : value;
  let backgroundImage = visualBackground(options.preset, options.tones);
  if (options.preset === 'gradient-image' && options.image) {
    backgroundImage = `${backgroundImage}, url("${escapeCssUrl(options.image)}")`;
  }
  if (surface === 'subtle') {
    backgroundImage = `linear-gradient(color-mix(in srgb, var(--card) 58%, transparent), color-mix(in srgb, var(--card) 58%, transparent)), ${backgroundImage}`;
  }
  return { backgroundImage, backgroundPosition: options.position ?? 'center', backgroundSize: options.size ?? 'cover', backgroundRepeat: 'no-repeat' };
}

/** Classes estruturais mantidas para compatibilidade com a API anterior. */
export const gradientClasses = Object.fromEntries(uiGradients.map(preset => [preset, {
  card: 'border-primary/20', header: 'text-white',
}])) as Record<UIGradient, { card: string; header: string }>;
