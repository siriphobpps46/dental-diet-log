"use client";

import { useCallback, useRef, useState } from "react";

export interface ToastState {
  id: number;
  message: string;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);

  const notify = useCallback((message: string) => {
    const id = ++counter.current;
    setToast({ id, message });
    window.setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  }, []);

  return { toast, notify };
}
