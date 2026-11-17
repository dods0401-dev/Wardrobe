"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "inverse" | "danger" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-sans font-medium transition-[background,color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100 select-none whitespace-nowrap rounded-full";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-accent text-white hover:bg-accent-ink",
  secondary: "bg-surface border border-stone-2 text-ink hover:border-ink-3 shadow-[var(--shadow-soft)]",
  ghost: "text-ink-2 hover:bg-ink/5 hover:text-ink",
  inverse: "bg-white text-ink hover:bg-paper",
  danger: "border border-danger/50 text-danger hover:bg-danger hover:text-white",
  destructive: "bg-danger text-white hover:brightness-95",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", icon, iconRight, loading, block, className, children, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  block,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children: ReactNode;
  block?: boolean;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], block && "w-full", className)}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}

export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean; tone?: "default" | "inverse" | "accent"; size?: "sm" | "md" }
>(function IconButton({ label, active, tone = "default", size = "md", className, children, type = "button", ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors duration-150 disabled:opacity-40",
        size === "sm" ? "size-8" : "size-10",
        tone === "default" && (active ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-ink/6"),
        tone === "inverse" && (active ? "bg-white text-ink" : "bg-white/80 text-ink backdrop-blur hover:bg-white"),
        tone === "accent" && (active ? "bg-accent text-white" : "bg-white/90 text-ink backdrop-blur hover:bg-white"),
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
