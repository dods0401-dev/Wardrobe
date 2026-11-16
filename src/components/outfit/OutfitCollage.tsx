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
  const boxes = layout(new Set(pieces.map((p) => p.slot)));
  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden studio grain", className)} data-mode="collage">
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
        const upload = p.item.image.kind === "upload";
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
              upload && "overflow-hidden rounded-sm shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] ring-4 ring-white",
              highlight && highlight !== p.slot && "opacity-35 saturate-50",
              onPieceClick && "cursor-pointer hover:scale-[1.03]",
            )}
            style={style}
          >
            <ItemImage item={p.item} bare fit="cover" className={upload ? "" : "drop-shadow-[0_10px_14px_rgba(23,23,23,0.18)]"} />
            {showMarkers && (
              <span className="label absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-ink !text-[10px] text-paper">
                {p.index}
              </span>
            )}
          </Tag>
        );
      })}
    </div>
  );
}
