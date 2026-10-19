'use client';

import * as React from 'react';
import { cn } from '../utils.js';
import { ImageIcon, UploadSimpleIcon, TrashIcon, CircleNotchIcon } from '@phosphor-icons/react/dist/ssr';

export interface ImageInputProps {
  value?: string | null;
  currentImageUrl?: string | null;
  onChange?: (file: File | null, previewUrl: string | null) => void;
  onValueChange?: (previewUrl: string | null) => void;
  onFileSelect?: (file: File) => void;
  onRemove?: () => void;
  name?: string; id?: string; label?: string; description?: string;
  maxSize?: number; accept?: string; disabled?: boolean; isLoading?: boolean;
  error?: string; className?: string; required?: boolean;
  variant?: 'circle' | 'square' | 'rectangle'; size?: 'sm' | 'md' | 'lg';
}

export function validateImageFile(file: Pick<File, 'name' | 'type' | 'size'>, accept: string, maxSize: number): string | null {
  if (!file.type.startsWith('image/')) return 'Selecione um arquivo de imagem.';
  const rules = accept.toLowerCase().split(',').map(v => v.trim()).filter(Boolean);
  const type = file.type.toLowerCase();
  if (rules.length && !rules.some(rule => rule.startsWith('.') ? file.name.toLowerCase().endsWith(rule)
    : rule === 'image/*' || rule === type || (rule === 'image/jpg' && type === 'image/jpeg'))) {
    return `Formato não permitido. Use: ${accept}.`;
  }
  return file.size > maxSize * 1024 * 1024 ? `O arquivo deve ter no máximo ${maxSize} MB.` : null;
}

export const ImageInput = React.forwardRef<HTMLInputElement, ImageInputProps>(function ImageInput({
  value, currentImageUrl, onChange, onValueChange, onFileSelect, onRemove, name, id, label = 'Imagem',
  description = 'Selecione ou arraste uma imagem.', maxSize = 1,
  accept = 'image/jpeg,image/png,image/webp', disabled = false, isLoading = false, error, className,
  required = false, variant = 'rectangle', size = 'md',
}, forwardedRef) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const input = React.useRef<HTMLInputElement>(null);
  const reader = React.useRef<FileReader | null>(null);
  const [preview, setPreview] = React.useState(value !== undefined ? value : currentImageUrl ?? null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [reading, setReading] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const blocked = disabled || isLoading;
  React.useImperativeHandle(forwardedRef, () => input.current!);
  React.useEffect(() => {
    reader.current?.abort();
    setReading(false);
    setPreview(value !== undefined ? value : currentImageUrl ?? null);
  }, [value, currentImageUrl]);
  React.useEffect(() => () => reader.current?.abort(), []);
  React.useEffect(() => { if (blocked) { reader.current?.abort(); setReading(false); } }, [blocked]);
  const select = (file?: File) => {
    if (blocked || !file) return;
    reader.current?.abort();
    setReading(false);
    const message = validateImageFile(file, accept, maxSize);
    setLocalError(message);
    if (message) { if (input.current) input.current.value = ''; return; }
    const next = new FileReader();
    reader.current = next;
    setReading(true);
    next.onload = () => {
      if (reader.current !== next) return;
      const url = String(next.result);
      setReading(false); setPreview(url);
      onChange?.(file, url); onValueChange?.(url); onFileSelect?.(file);
    };
    next.onerror = () => { setReading(false); setLocalError('Não foi possível ler a imagem.'); };
    next.readAsDataURL(file);
  };
  const remove = () => {
    if (blocked) return;
    reader.current?.abort(); reader.current = null;
    setReading(false); setPreview(null); setLocalError(null);
    if (input.current) input.current.value = '';
    onChange?.(null, null); onValueChange?.(null); onRemove?.();
  };
  const displayError = error || localError;
  return <div className={cn('space-y-2', className)} aria-busy={isLoading || reading}>
    <label htmlFor={inputId} className="block text-sm font-medium">{label}{required && ' *'}</label>
    <div onDragOver={event => { event.preventDefault(); if (!blocked) setDragging(true); }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={event => { event.preventDefault(); setDragging(false); select(event.dataTransfer.files[0]); }}
      className={cn('group relative w-full overflow-hidden border bg-muted/30 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
        variant === 'circle' ? 'rounded-full' : 'rounded-xl',
        size === 'sm' ? 'max-w-40' : size === 'lg' ? 'max-w-xl' : 'max-w-sm',
        variant === 'rectangle' ? 'aspect-video' : 'aspect-square',
        blocked ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/60 hover:bg-muted/50',
        dragging && !blocked ? 'border-primary bg-primary/10' : displayError ? 'border-destructive' : 'border-border',
        !preview && 'border-dashed')}>
      <input ref={input} id={inputId} type="file" name={name} accept={accept} disabled={blocked}
        required={required && !preview} aria-invalid={Boolean(displayError)} aria-describedby={`${inputId}-description${displayError ? ` ${inputId}-error` : ''}`}
        onChange={event => select(event.target.files?.[0])} className="sr-only" />
      <label htmlFor={inputId} className={cn('absolute inset-0 flex flex-col items-center justify-center gap-2 text-center', blocked ? 'cursor-not-allowed' : 'cursor-pointer')}>
        {preview ? <>
          <img src={preview} alt={`Prévia: ${label}`} className="absolute inset-0 h-full w-full object-contain" />
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-black/65 px-3 py-3 text-xs font-medium text-white">
            <UploadSimpleIcon size={18} aria-hidden="true" /> Trocar imagem
          </span>
        </> : <span className="flex flex-col items-center gap-2 px-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ImageIcon size={24} aria-hidden="true" /></span>
          <span className="text-sm font-medium text-foreground">Selecionar imagem</span>
          {size !== 'sm' && <span className="text-xs text-muted-foreground">ou arraste e solte aqui</span>}
        </span>}
        {(isLoading || reading) && <span role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-background/80 text-sm text-foreground">
          <CircleNotchIcon size={20} className="animate-spin" aria-hidden="true" /> Carregando...
        </span>}
      </label>
    </div>
    <p id={`${inputId}-description`} className="text-xs text-muted-foreground">{description}</p>
    {preview && <button type="button" onClick={remove} disabled={blocked} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"><TrashIcon size={16} aria-hidden="true" />Remover imagem</button>}
    {displayError && <p id={`${inputId}-error`} role="alert" className="text-sm text-destructive">{displayError}</p>}
  </div>;
});
