import type { ScoreBreakdown as SB } from "@/domain/types";
import { DEFAULT_WEIGHTS } from "@/services/recommendation/config";
import { cn } from "../ui/cn";

export function ScoreBadge({ score, className, inverse }: { score: number; className?: string; inverse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-xs px-2 py-1",
        inverse ? "bg-paper text-ink" : "bg-ink text-paper",
        className,
      )}
      title="Match score"
    >
      <span className="display text-base leading-none tabular-nums">{Math.round(score)}</span>
      <span className="label !text-[9px] opacity-70">/100</span>
    </span>
  );
}

const ROWS: { key: keyof SB; label: string }[] = [
  { key: "colorHarmony", label: "Colour harmony" },
  { key: "styleConsistency", label: "Style consistency" },
  { key: "personalPreference", label: "Personal preference" },
  { key: "occasionFit", label: "Occasion" },
  { key: "seasonFit", label: "Season" },
  { key: "rotation", label: "Rotation" },
];

export function ScoreBreakdown({ breakdown, className }: { breakdown: SB; className?: string }) {
  return (
    <dl className={cn("flex flex-col gap-2.5", className)}>
      {ROWS.map((r) => {
        const v = breakdown[r.key];
        return (
          <div key={r.key} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
            <dt className="text-xs text-ink-2">
              {r.label} <span className="text-ink-4">· {Math.round(DEFAULT_WEIGHTS[r.key] * 100)}%</span>
            </dt>
            <dd className="text-xs font-semibold tabular-nums">{Math.round(v * 100)}</dd>
            <div className="col-span-2 h-1 overflow-hidden rounded-full bg-stone/70" aria-hidden>
              <div className={cn("h-full rounded-full", v >= 0.8 ? "bg-ink" : v >= 0.6 ? "bg-ink-3" : "bg-accent")} style={{ width: `${Math.round(v * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </dl>
  );
}
