import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "ink" | "accent" | "sage" | "outline" | "demo";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-paper-2 text-ink-2",
  ink: "bg-ink/85 text-white",
  accent: "bg-accent text-white",
  sage: "bg-sage text-sage-ink",
  outline: "border border-line bg-surface text-ink-2",
  demo: "border border-dashed border-ink-4 bg-surface text-ink-3",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}

/** Explicit marker for simulated functionality. */
export function DemoBadge({ children = "Demo", className }: { children?: ReactNode; className?: string }) {
  return (
    <Badge tone="demo" className={className}>
      {children}
    </Badge>
  );
}
