"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Minus } from "lucide-react";
import type { Outfit, OutfitSlot } from "@/domain/types";
import { SLOT_LABEL, categoryLabel, colorLabel } from "@/domain/taxonomy";
import { useWardrobe, currentSeason, todayKey } from "@/store/useWardrobe";
import { services } from "@/services";
import { useItemsById } from "@/hooks/useDerived";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/States";
import { ItemImage } from "../wardrobe/ItemImage";
import { cn } from "../ui/cn";
import { toast } from "@/store/toast";

const OPTIONAL: OutfitSlot[] = ["layer", "outerwear", "accessory"];

/** Pick a slot, see engine-ranked alternatives from the wardrobe, swap one in. */
export function ReplaceDialog({
  outfit,
  slot,
  open,
  onClose,
  onSlotChange,
}: {
  outfit: Outfit;
  slot: OutfitSlot | null;
  open: boolean;
  onClose: () => void;
  onSlotChange: (s: OutfitSlot) => void;
}) {
  const items = useWardrobe((s) => s.items);
  const profile = useWardrobe((s) => s.profile);
  const wearLog = useWardrobe((s) => s.wearLog);
  const replaceItem = useWardrobe((s) => s.replaceItem);
  const removePiece = useWardrobe((s) => s.removePiece);
  const byId = useItemsById();
  const [pending, setPending] = useState<string | null>(null);

  const current = slot ? byId.get(outfit.pieces.find((p) => p.slot === slot)?.itemId ?? "") : undefined;
  const alternatives = useMemo(
    () =>
      slot
        ? services.engine.alternatives({ items, profile, wearLog, outfit, slot, today: todayKey(), season: currentSeason(), limit: 9 })
        : [],
    [slot, items, profile, wearLog, outfit],
  );

  const slots = outfit.pieces.map((p) => p.slot);
  const addable = OPTIONAL.filter((s) => !slots.includes(s));

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Swap a piece"
      title={slot ? `Replace ${SLOT_LABEL[slot].toLowerCase()}` : "Replace a piece"}
      size="lg"
      footer={
        <>
          {slot && current && OPTIONAL.includes(slot) && (
            <Button
              variant="ghost"
              icon={<Minus className="size-4" />}
              onClick={() => {
                removePiece(outfit.id, slot);
                toast({ title: `${current.name} removed from the look` });
                onClose();
              }}
            >
              Remove piece
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="no-scrollbar -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1">
        {[...slots, ...addable].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSlotChange(s)}
            className={cn(
              "label h-8 shrink-0 rounded-sm border px-3",
              s === slot ? "border-ink bg-ink text-paper" : "border-stone-2 hover:border-ink",
              !slots.includes(s) && s !== slot && "border-dashed",
            )}
          >
            {slots.includes(s) ? SLOT_LABEL[s] : `+ ${SLOT_LABEL[s]}`}
          </button>
        ))}
      </div>

      {current && (
        <div className="mb-5 flex items-center gap-3 rounded-sm bg-paper-2 p-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-xs">
            <ItemImage item={current} />
          </div>
          <div className="min-w-0">
            <p className="label text-ink-3">Currently</p>
            <p className="truncate text-sm font-semibold">{current.name}</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-ink-3" />
        </div>
      )}

      {alternatives.length === 0 ? (
        <EmptyState
          compact
          title="No alternatives"
          body="No other available items in your wardrobe fit this slot with the rest of the look. Items in the laundry or out of season are skipped."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {alternatives.map((alt) => (
            <li key={alt.item.id}>
              <button
                type="button"
                disabled={!!pending}
                onClick={() => {
                  setPending(alt.item.id);
                  replaceItem(outfit.id, slot!, alt.item.id);
                  toast({
                    title: current ? `Swapped in ${alt.item.name}` : `Added ${alt.item.name}`,
                    description: "Score and styling notes updated. Your preferences learned from this swap.",
                    tone: "success",
                  });
                  setPending(null);
                  onClose();
                }}
                className="group block w-full text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-sm ring-1 ring-line transition group-hover:ring-ink">
                  <ItemImage item={alt.item} />
                  <span
                    className={cn(
                      "label absolute right-1.5 top-1.5 rounded-xs px-1.5 py-0.5 !text-[10px]",
                      alt.delta > 0 ? "bg-sage text-sage-ink" : alt.delta < 0 ? "bg-paper text-ink-3" : "bg-paper text-ink",
                    )}
                  >
                    {alt.delta > 0 ? "+" : ""}
                    {alt.delta.toFixed(1)}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-[13px] font-semibold">{alt.item.name}</p>
                <p className="truncate text-xs text-ink-3">
                  {categoryLabel(alt.item.category)} · {colorLabel(alt.item.mainColor)}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-5 text-xs text-ink-3">Ranked by the stylist engine: the figure shows how the outfit score would change.</p>
    </Modal>
  );
}
