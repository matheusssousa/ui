'use client';
import { useId, useState } from 'react';
import { Switch, type SwitchProps } from './switch.js';
import { cn } from '../utils.js';
export interface SwitchFieldProps extends Omit<SwitchProps, 'name'> {
  name: string; label: string; description?: string;
}
export function SwitchField({ name, label, description, className, id, checked, defaultChecked = false,
  onCheckedChange, disabled, ...props }: SwitchFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [localChecked, setLocalChecked] = useState(defaultChecked);
  const value = checked ?? localChecked;
  return <div className={cn('flex items-center justify-between gap-6', className)}>
    <div><label htmlFor={fieldId} className="text-sm">{label}</label>
      {description && <p id={`${fieldId}-description`} className="text-xs text-muted-foreground">{description}</p>}</div>
    <Switch {...props} id={fieldId} checked={value} disabled={disabled}
      aria-describedby={props['aria-describedby'] ?? (description ? `${fieldId}-description` : undefined)}
      onCheckedChange={next => { setLocalChecked(next); onCheckedChange?.(next); }} />
    <input type="hidden" name={name} value={value ? '1' : '0'} disabled={disabled} />
  </div>;
}
