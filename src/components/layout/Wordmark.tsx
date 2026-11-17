import { cn } from "../ui/cn";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 leading-none select-none", className)}>
      <span className="flex size-[1.4em] items-center justify-center rounded-full bg-accent text-white" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-[0.8em]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5a2 2 0 1 1 2 2c-1 0-2 .6-2 1.6V9l8.2 5.6a1.5 1.5 0 0 1-.9 2.7H4.7a1.5 1.5 0 0 1-.9-2.7L12 9" />
        </svg>
      </span>
      <span className="display font-semibold tracking-[-0.03em]">wardrobe</span>
      {!compact && <span className="rounded-full bg-paper-2 px-1.5 py-0.5 text-[0.45em] font-medium tracking-wide text-ink-3">PROJECT</span>}
    </span>
  );
}
