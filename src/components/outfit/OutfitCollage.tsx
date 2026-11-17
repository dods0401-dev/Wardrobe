"use client";

import type { CSSProperties } from "react";
import type { OutfitSlot } from "@/domain/types";
import type { ResolvedPiece } from "@/hooks/useDerived";
import { ItemImage } from "../wardrobe/ItemImage";
import { cn } from "../ui/cn";

type Box = { left: number; top: number; w: number; h: number; z: number; rot?: number };

/** Editorial flat-lay layout. Positions adapt to which slots are present. */
const layout = (slots: Set<OutfitSlot>): Partial<Record<OutfitSlot, Box>> => {
  const hasOuter = slots.has("outerwear");
  const hasLayer = slots.has("layer");
  const boxes: Partial<Record<OutfitSlot, Box>> = {
    bottom: { left: 30, top: 41, w: 42, h: 55, z: 1 },
    shoes: { left: 64, top: 77, w: 33, h: 19, z: 5, rot: -4 },
    accessory: { left: 3, top: 70, w: 26, h: 24, z: 6, rot: 3 },
  };
  if (hasOuter && hasLayer) {
    boxes.outerwear = { left: 1, top: 2, w: 47, h: 47, z: 4, rot: -2 };
    boxes.layer = { left: 38, top: 3, w: 38, h: 38, z: 3, rot: 2 };
    boxes.base = { left: 66, top: 18, w: 32, h: 30, z: 2, rot: 4 };
  } else if (hasOuter) {
    boxes.outerwear = { left: 3, top: 2, w: 50, h: 50, z: 4, rot: -2 };
    boxes.base = { left: 49, top: 6, w: 45, h: 38, z: 3, rot: 2 };
  } else if (hasLayer) {
    boxes.layer = { left: 4, top: 3, w: 48, h: 44, z: 3, rot: -2 };
    boxes.base = { left: 48, top: 7, w: 44, h: 37, z: 2, rot: 3 };
  } else {
    boxes.base = { left: 20, top: 2, w: 58, h: 46, z: 3 };
    boxes.bottom = { left: 28, top: 42, w: 44, h: 55, z: 1 };
  }
  return boxes;
};

export function OutfitCollage({
  pieces,
  className,
  showMarkers = true,
  highlight,
  onPieceClick,
}: {
  pieces: ResolvedPiece[];
  className?: string;
  showMarkers?: boolean;
  highlight?: OutfitSlot | null;
  onPieceClick?: (slot: OutfitSlot) => void;
}) {
  // With real photos, a tidy moodboard grid reads better than an overlapping flat-lay.
  if (pieces.some((p) => p.item.image.kind !== "render")) {
    const tops = pieces.filter((p) => ["outerwear", "layer", "base"].includes(p.slot));
    const rest = pieces.filter((p) => !["outerwear", "layer", "base"].includes(p.slot));
    const tile = (p: ResolvedPiece, grow: number) => {
      const Tag = onPieceClick ? "button" : "div";
      return (
        <Tag
          key={p.slot}
          type={onPieceClick ? "button" : undefined}
          onClick={onPieceClick ? () => onPieceClick(p.slot) : undefined}
          aria-label={onPieceClick ? `${p.item.name} — swap` : undefined}
          data-item-id={p.item.id}
          style={{ flexGrow: grow }}
          className={cn(
            "relative min-h-0 basis-0 overflow-hidden rounded-md bg-white transition-[opacity,filter,transform] duration-300",
            highlight && highlight !== p.slot && "opacity-35 saturate-50",
            onPieceClick && "cursor-pointer hover:scale-[1.015]",
          )}
        >
          <ItemImage item={p.item} size={320} className={p.item.image.kind === "render" ? "p-[8%]" : ""} />
          {showMarkers && (
            <span className="absolute left-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-white/90 text-[10px] font-semibold text-ink-2 shadow-sm">
              {p.index}
            </span>
          )}
        </Tag>
      );
    };
    const weight = (slot: OutfitSlot) => (slot === "bottom" ? 2.2 : slot === "shoes" ? 1.1 : slot === "accessory" ? 0.9 : 1);
    return (
      <div className={cn("relative grid aspect-[4/5] w-full grid-cols-2 gap-1.5 overflow-hidden bg-paper-2 p-1.5", className)} data-mode="collage">
        <div className="flex min-h-0 flex-col gap-1.5">
          {tops.map((p) => tile(p, 1))}
        </div>
        <div className="flex min-h-0 flex-col gap-1.5">
          {rest.map((p) => tile(p, weight(p.slot)))}
        </div>
      </div>
    );
  }

  const boxes = layout(new Set(pieces.map((p) => p.slot)));
  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden bg-surface", className)} data-mode="collage">
      {pieces.map((p) => {
        const b = boxes[p.slot];
        if (!b) return null;
        const style: CSSProperties = {
          left: `${b.left}%`,
          top: `${b.top}%`,
          width: `${b.w}%`,
          height: `${b.h}%`,
          zIndex: highlight === p.slot ? 20 : b.z,
          transform: b.rot ? `rotate(${b.rot}deg)` : undefined,
        };
        const upload = p.item.image.kind !== "render";
        const Tag = onPieceClick ? "button" : "div";
        return (
          <Tag
            key={p.slot}
            type={onPieceClick ? "button" : undefined}
            onClick={onPieceClick ? () => onPieceClick(p.slot) : undefined}
            aria-label={onPieceClick ? `${p.item.name} — swap` : undefined}
            data-item-id={p.item.id}
            className={cn(
              "absolute transition-[transform,opacity,filter] duration-300",
              upload && "overflow-hidden rounded-md shadow-[0_8px_24px_-14px_rgba(0,0,0,0.35)]",
              highlight && highlight !== p.slot && "opacity-35 saturate-50",
              onPieceClick && "cursor-pointer hover:scale-[1.03]",
            )}
            style={style}
          >
            <ItemImage item={p.item} bare fit={upload ? "cover" : "contain"} className={upload ? "" : "drop-shadow-[0_6px_10px_rgba(43,42,40,0.10)]"} />
            {showMarkers && (
              <span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-ink-2 shadow-sm ring-1 ring-line">
                {p.index}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
