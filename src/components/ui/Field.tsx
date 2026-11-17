"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./cn";

const control =
  "w-full bg-surface border border-line rounded-sm px-3.5 text-sm text-ink placeholder:text-ink-4 transition-colors focus:border-accent focus:ring-2 focus:ring-accent/15 focus:outline-none focus-visible:outline-none aria-[invalid=true]:border-danger";

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  className,
  optional,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
  optional?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2 flex items-baseline justify-between gap-2">
        <span>{label}</span>
        {optional && <span className="text-ink-4 normal-case tracking-normal font-normal text-[11px]">Optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }>(
  function Input({ className, icon, ...rest }, ref) {
    if (!icon) return <input ref={ref} className={cn(control, "h-10", className)} {...rest} />;
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">{icon}</span>
        <input ref={ref} className={cn(control, "h-10 pl-9", className)} {...rest} />
      </div>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...rest },
  ref,
) {
  return <textarea ref={ref} className={cn(control, "py-2.5 min-h-24 resize-y leading-relaxed", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(control, "h-10 appearance-none pr-9 cursor-pointer", className)} {...rest}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
    </div>
  );
});
