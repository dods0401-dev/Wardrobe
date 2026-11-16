import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "ink" | "accent" | "sage" | "outline" | "demo";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-stone/70 text-ink",
  ink: "bg-ink text-paper",
  accent: "bg-accent text-white",
  sage: "bg-sage text-sage-ink",
  outline: "border border-ink/30 text-ink",
  demo: "bg-[repeating-linear-gradient(-45deg,#171717_0_6px,#2a2a2a_6px_12px)] text-paper",
};

export function Badge({ tone = "neutral", children, className, icon }: { tone?: BadgeTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn("label inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 !text-[10px] !leading-4", tones[tone], className)}>
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
