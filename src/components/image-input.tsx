'use client';

import * as React from 'react';
import { cn } from '../utils.js';

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
    <div onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); select(event.dataTransfer.files[0]); }}
      className={cn('overflow-hidden border border-border bg-muted/30 p-3', variant === 'circle' ? 'rounded-full' : 'rounded-xl',
        size === 'sm' ? 'max-w-40' : size === 'lg' ? 'max-w-xl' : 'max-w-sm', variant !== 'rectangle' && 'aspect-square')}>
      {preview && <img src={preview} alt={`Prévia: ${label}`} className="h-full max-h-64 w-full object-contain" />}
      <input ref={input} id={inputId} type="file" name={name} accept={accept} disabled={blocked}
        required={required && !preview} aria-invalid={Boolean(displayError)} aria-describedby={`${inputId}-description${displayError ? ` ${inputId}-error` : ''}`}
        onChange={event => select(event.target.files?.[0])} className="block w-full text-sm" />
    </div>
    <p id={`${inputId}-description`} className="text-xs text-muted-foreground">{description}</p>
    {preview && <button type="button" onClick={remove} disabled={blocked} className="text-sm text-destructive disabled:opacity-50">Remover imagem</button>}
    {displayError && <p id={`${inputId}-error`} role="alert" className="text-sm text-destructive">{displayError}</p>}
  </div>;
});
