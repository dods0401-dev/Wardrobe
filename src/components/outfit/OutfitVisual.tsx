"use client";

import type { Outfit, OutfitSlot } from "@/domain/types";
import type { ResolvedPiece } from "@/hooks/useDerived";
import { useWardrobe } from "@/store/useWardrobe";
import { OutfitCollage } from "./OutfitCollage";
import { AiLook } from "./AiLook";
import { cn } from "../ui/cn";

/** Renders the outfit in the user's chosen visualisation mode (persisted globally). */
export function OutfitVisual({
  outfit,
  pieces,
  className,
  mode: forced,
  highlight,
  onPieceClick,
  showMarkers,
}: {
  outfit: Pick<Outfit, "id" | "name" | "style">;
  pieces: ResolvedPiece[];
  className?: string;
  mode?: "collage" | "ai";
  highlight?: OutfitSlot | null;
  onPieceClick?: (slot: OutfitSlot) => void;
  showMarkers?: boolean;
}) {
  const stored = useWardrobe((s) => s.visualMode);
  const mode = forced ?? stored;
  return mode === "ai" ? (
    <AiLook outfit={outfit} pieces={pieces} className={className} />
  ) : (
    <OutfitCollage pieces={pieces} className={className} highlight={highlight} onPieceClick={onPieceClick} showMarkers={showMarkers} />
  );
}

export function VisualModeSwitch({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const mode = useWardrobe((s) => s.visualMode);
  const setMode = useWardrobe((s) => s.setVisualMode);
  return (
    <div role="radiogroup" aria-label="Visualisation mode" className={cn("inline-flex rounded-full bg-ink/[0.05] p-1 shadow-[inset_0_1px_2px_rgba(43,42,40,0.06)]", className)}>
      {(
        [
          ["collage", "My pieces"],
          ["ai", "On model · demo"],
        ] as const
      ).map(([v, label]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={mode === v}
          onClick={() => setMode(v)}
          className={cn(
            "rounded-full text-[13px] font-medium transition-colors whitespace-nowrap",
            size === "sm" ? "h-7 px-3" : "h-8 px-3.5",
            mode === v ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-ink-3 hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
