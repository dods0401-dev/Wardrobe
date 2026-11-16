import { cn } from "../ui/cn";

export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("display inline-flex items-baseline leading-none select-none", className)}>
      {!compact && <span className="mr-1.5 text-[0.55em] font-medium tracking-[0.18em] text-ink-3">PROJECT</span>}
      <span className="tracking-[-0.04em]">WARDROBE</span>
      <span className="text-accent">/</span>
    </span>
  );
}
