import { create } from "zustand";

export type ToastTone = "neutral" | "success" | "error" | "accent";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "tone"> & { tone?: ToastTone; duration?: number }) => void;
  dismiss: (id: number) => void;
}

let next = 1;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: ({ duration = 3800, tone = "neutral", ...t }) => {
    const id = next++;
    set({ toasts: [...get().toasts.slice(-2), { ...t, tone, id }] });
    window.setTimeout(() => get().dismiss(id), duration);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = (t: Parameters<ToastState["push"]>[0]) => useToasts.getState().push(t);
