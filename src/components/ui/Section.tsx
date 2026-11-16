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
    <header className={cn("flex flex-col gap-5 border-b border-ink pb-6 sm:pb-8 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="min-w-0 animate-fade-up">
        <p className="label flex items-center gap-3 text-ink-3">
          {index && <span className="text-accent">{index}</span>}
          <span>{eyebrow}</span>
        </p>
        <h1 className="display mt-3 text-[2.6rem] leading-[0.92] sm:text-display lg:text-display-lg">{title}</h1>
        {intro && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">{intro}</p>}
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
        <h2 className="display text-2xl sm:text-[1.75rem] leading-none">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, sub, className, tone }: { label: string; value: ReactNode; sub?: ReactNode; className?: string; tone?: "accent" }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="label text-ink-3">{label}</span>
      <span className={cn("display mt-1 text-3xl sm:text-4xl leading-none tabular-nums", tone === "accent" && "text-accent")}>{value}</span>
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
    <div role="tablist" aria-label={ariaLabel} className={cn("inline-flex rounded-sm border border-ink p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "label inline-flex items-center gap-1.5 rounded-xs transition-colors",
            size === "sm" ? "h-7 px-2.5" : "h-9 px-3.5",
            value === o.value ? "bg-ink text-paper" : "text-ink hover:bg-ink/6",
          )}
        >
          {o.label}
          {o.count !== undefined && <span className="opacity-60 tabular-nums">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
