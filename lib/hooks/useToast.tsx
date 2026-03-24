"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { newId } from "@/lib/utils/ids";

export type ToastType = "info" | "error" | "success";

export interface ToastAction {
  label: string;
  fn: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 2500, action?: ToastAction) => {
      setToasts((prev) => [...prev, { id: newId(), message, type, duration, action }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo(
    () => ({ toasts: toasts.slice(0, 1), showToast, dismissToast }),
    [toasts, showToast, dismissToast]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
