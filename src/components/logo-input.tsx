'use client';
import { forwardRef } from 'react';
import { ImageInput, type ImageInputProps } from './image-input.js';
export type LogoInputProps = ImageInputProps;
export const LogoInput = forwardRef<HTMLInputElement, LogoInputProps>(function LogoInput(props, ref) {
  return <ImageInput label="Logo" variant="circle" size="sm" {...props} ref={ref} />;
});
