'use client';

import { useState, useEffect, useRef } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const actualDelay = isFirstRun.current ? 50 : delay;
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (isFirstRun.current) {
        isFirstRun.current = false;
      }
    }, actualDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


