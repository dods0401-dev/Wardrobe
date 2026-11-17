import type { ReactNode } from "react";
import { cn } from "./cn";

/** Editorial page header: index number + label + oversized title. */
export function PageHeader({
  index,
  eyebrow,
  title,
  intro,
  actions,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-5 pb-2 sm:pb-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0 animate-fade-up">
        <p className="label text-ink-3" data-index={index}>
          {eyebrow}
        </p>
        <h1 className="display mt-2 text-[2rem] leading-[1.08] sm:text-display lg:text-display-lg">{title}</h1>
        {intro && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-3">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>}
    </header>
  );
}

export function SectionHeader({
  label,
  title,
  action,
  className,
}: {
  label?: string;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-end justify-between gap-4", className)}>
      <div>
        {label && <p className="label text-ink-3 mb-1">{label}</p>}
        <h2 className="display text-xl sm:text-2xl leading-tight">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, className, tone }: { label: string; value: ReactNode; sub?: ReactNode; className?: string; tone?: "accent" }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="label text-ink-3">{label}</span>
      <span className={cn("display mt-1 text-2xl sm:text-3xl leading-none tabular-nums font-semibold", tone === "accent" && "text-accent-ink")}>{value}</span>
      {sub && <span className="mt-1 text-xs text-ink-3">{sub}</span>}
    </div>
  );
}

/** Segmented control used for tabs and mode switches. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number }[];
  className?: string;
  size?: "sm" | "md";
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn("inline-flex rounded-full bg-paper-2 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            size === "sm" ? "h-7 px-3" : "h-8 px-4",
            value === o.value ? "bg-surface text-ink shadow-[var(--shadow-soft)]" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="opacity-60 tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
