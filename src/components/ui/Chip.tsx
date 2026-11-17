"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check } from "lucide-react";
import type { ColorId } from "@/domain/types";
import { colorHex, colorLabel } from "@/domain/taxonomy";
import { cn } from "./cn";

/** Toggleable filter / choice chip. */
export function Chip({
  selected,
  children,
  icon,
  className,
  size = "md",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; icon?: ReactNode; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full font-medium transition-colors duration-150 whitespace-nowrap",
        size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-3.5 text-sm",
        selected ? "bg-ink text-white border-ink" : "bg-surface text-ink-2 border-line hover:border-stone-2 hover:text-ink",
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function Swatch({ color, size = 14, className }: { color: ColorId; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0 rounded-full ring-1 ring-ink/15", className)}
      style={{ width: size, height: size, background: colorHex(color) }}
    />
  );
}

/** Round colour toggle used in colour filters and preference pickers. */
export function ColorToggle({
  color,
  selected,
  onClick,
  tone = "default",
}: {
  color: ColorId;
  selected: boolean;
  onClick: () => void;
  tone?: "default" | "avoid";
}) {
  const hex = colorHex(color);
  const light = ["white", "ecru", "beige", "stone", "sage", "skyblue", "lilac", "pink", "yellow", "grey", "lightdenim"].includes(color);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${colorLabel(color)}${selected ? " (selected)" : ""}`}
      title={colorLabel(color)}
      className={cn(
        "relative size-8 rounded-full ring-1 ring-ink/15 transition-transform duration-150 hover:scale-110",
        selected && (tone === "avoid" ? "ring-2 ring-danger ring-offset-2 ring-offset-paper" : "ring-2 ring-accent ring-offset-2 ring-offset-paper"),
      )}
      style={{ background: hex }}
    >
      {selected && (
        <span className={cn("absolute inset-0 flex items-center justify-center", light ? "text-ink" : "text-white")}>
          {tone === "avoid" ? <span className="block h-0.5 w-5 rotate-45 bg-current" /> : <Check className="size-4" strokeWidth={3} />}
        </span>
      )}
    </button>
  );
}
