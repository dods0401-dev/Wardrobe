import type { ReactNode } from "react";
import { cn } from "./cn";

export function EmptyState({
  title,
  body,
  action,
  art,
  className,
  compact,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  art?: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center border border-dashed border-stone-2 rounded-md",
        compact ? "px-6 py-10" : "px-6 py-16 sm:py-24",
        className,
      )}
    >
      {art && <div className="mb-5 text-ink-4">{art}</div>}
      <h3 className="display text-xl sm:text-2xl">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-3">{body}</p>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-sm", className)} aria-hidden />;
}

export function ErrorState({ title = "Something went wrong", body, action }: { title?: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-md border border-accent/40 bg-accent/5 px-5 py-6" role="alert">
      <p className="label text-accent">Error</p>
      <h3 className="display mt-1 text-xl">{title}</h3>
      {body && <p className="mt-2 text-sm text-ink-2">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
