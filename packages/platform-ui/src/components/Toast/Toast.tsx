import React, { useState, useEffect, useCallback } from "react";
import "./Toast.styles.css";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContainerProps {
  /** Max toasts visible simultaneously. */
  maxVisible?: number;
}

let toastIdCounter = 0;
const listeners = new Set<(toast: ToastItem) => void>();

/** Imperative API — call from anywhere to show a toast. */
export function showToast(toast: Omit<ToastItem, "id">): void {
  const item: ToastItem = { ...toast, id: `pui-toast-${++toastIdCounter}` };
  listeners.forEach((l) => l(item));
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ maxVisible = 5 }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev.slice(-(maxVisible - 1)), toast]);

    // Auto-dismiss
    const delay = toast.duration ?? 4000;
    if (delay > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, delay);
    }
  }, [maxVisible]);

  useEffect(() => {
    listeners.add(addToast);
    return () => { listeners.delete(addToast); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="pui-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`pui-toast pui-toast--${t.variant}`}>
          <div className="pui-toast__title">{t.title}</div>
          <div className="pui-toast__message">{t.message}</div>
        </div>
      ))}
    </div>
  );
};
