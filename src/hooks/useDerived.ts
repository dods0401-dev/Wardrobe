"use client";

import { useMemo } from "react";
import type { Outfit, OutfitSlot, WardrobeItem } from "@/domain/types";
import { SLOT_ORDER } from "@/domain/taxonomy";
import { useWardrobe } from "@/store/useWardrobe";
import { computeUsage } from "@/services/usage";

export const useItemsById = () => {
  const items = useWardrobe((s) => s.items);
  return useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
};

export const useUsage = () => {
  const wearLog = useWardrobe((s) => s.wearLog);
  return useMemo(() => computeUsage(wearLog), [wearLog]);
};

export interface ResolvedPiece {
  slot: OutfitSlot;
  item: WardrobeItem;
  index: number;
}

/** Resolves outfit pieces to real wardrobe items, in display order. Missing items are reported. */
export const useOutfitPieces = (outfit: Pick<Outfit, "pieces"> | undefined) => {
  const byId = useItemsById();
  return useMemo(() => {
    if (!outfit) return { pieces: [] as ResolvedPiece[], missing: 0 };
    const sorted = [...outfit.pieces].sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
    const pieces: ResolvedPiece[] = [];
    let missing = 0;
    for (const p of sorted) {
      const item = byId.get(p.itemId);
      if (item) pieces.push({ slot: p.slot, item, index: pieces.length + 1 });
      else missing++;
    }
    return { pieces, missing };
  }, [outfit, byId]);
};
