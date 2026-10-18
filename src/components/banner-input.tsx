'use client';
import { forwardRef } from 'react';
import { ImageInput, type ImageInputProps } from './image-input.js';
export type BannerInputProps = ImageInputProps;
export const BannerInput = forwardRef<HTMLInputElement, BannerInputProps>(function BannerInput(props, ref) {
  return <ImageInput label="Banner" variant="rectangle" size="lg" {...props} ref={ref} />;
});
