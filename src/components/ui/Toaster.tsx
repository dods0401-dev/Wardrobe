"use client";

import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToasts } from "@/store/toast";
import { cn } from "./cn";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md px-4 py-3 shadow-xl animate-sheet-up",
            t.tone === "error" ? "bg-accent text-white" : "bg-ink text-paper",
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.tone === "success" ? (
              <CheckCircle2 className="size-4 text-sage" />
            ) : t.tone === "error" ? (
              <AlertTriangle className="size-4" />
            ) : t.tone === "accent" ? (
              <span className="block size-2.5 mt-0.5 rounded-full bg-accent" />
            ) : (
              <Info className="size-4 text-stone" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">{t.title}</p>
            {t.description && <p className="mt-0.5 text-xs leading-relaxed opacity-80">{t.description}</p>}
          </div>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
              className="label shrink-0 self-center underline underline-offset-4 hover:opacity-80"
            >
              {t.action.label}
            </button>
          )}
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
