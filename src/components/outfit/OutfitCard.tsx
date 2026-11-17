"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, Repeat2, ThumbsDown, Shirt, ArrowUpRight } from "lucide-react";
import type { Outfit, OutfitSlot } from "@/domain/types";
import { SLOT_LABEL, occasionLabel, styleLabel } from "@/domain/taxonomy";
import { useOutfitPieces } from "@/hooks/useDerived";
import { useWardrobe } from "@/store/useWardrobe";
import { toast } from "@/store/toast";
import { OutfitVisual } from "./OutfitVisual";
import { ScoreBadge } from "./Score";
import { ReplaceDialog } from "./ReplaceDialog";
import { WearDialog } from "./WearDialog";
import { Button, IconButton } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ItemImage } from "../wardrobe/ItemImage";
import { cn } from "../ui/cn";

/** Full recommendation card used on the results page. */
export function OutfitResultCard({ outfit, rank }: { outfit: Outfit; rank: number }) {
  const { pieces } = useOutfitPieces(outfit);
  const toggleSave = useWardrobe((s) => s.toggleSave);
  const toggleLike = useWardrobe((s) => s.toggleLike);
  const reject = useWardrobe((s) => s.reject);
  const restore = useWardrobe((s) => s.restore);
  const [replaceSlot, setReplaceSlot] = useState<OutfitSlot | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [wearOpen, setWearOpen] = useState(false);
  const [hover, setHover] = useState<OutfitSlot | null>(null);

  const openReplace = (slot: OutfitSlot) => {
    setReplaceSlot(slot);
    setReplaceOpen(true);
  };

  return (
    <article
      className="grid gap-5 rounded-lg bg-surface p-3 shadow-[var(--shadow-soft)] sm:p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8 md:p-5 animate-fade-up"
      style={{ animationDelay: `${rank * 70}ms` }}
      aria-label={`Outfit ${rank}: ${outfit.name}`}
    >
      <div className="relative">
        <Link href={`/outfits/${outfit.id}`} aria-label={`Open ${outfit.name}`} className="block overflow-hidden rounded-md bg-paper">
          <OutfitVisual outfit={outfit} pieces={pieces} highlight={hover} />
        </Link>
        <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1.5">
          <span className="flex h-7 items-center justify-center rounded-full bg-white/90 px-2.5 text-xs font-medium text-ink-2 shadow-sm">
            Look {rank}
          </span>
        </div>
        <div className="absolute right-3 top-3">
          <ScoreBadge score={outfit.score} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="outline">{occasionLabel(outfit.occasion)}</Badge>
          {styleLabel(outfit.style) !== occasionLabel(outfit.occasion) && <Badge tone="sage">{styleLabel(outfit.style)}</Badge>}
          {outfit.saved && <Badge tone="ink">Saved</Badge>}
        </div>
        <h3 className="display mt-3 text-2xl leading-tight sm:text-[1.75rem]">{outfit.name}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{outfit.description}</p>

        <ol className="mt-5 divide-y divide-line">
          {pieces.map((p) => (
            <li
              key={p.slot}
              onMouseEnter={() => setHover(p.slot)}
              onMouseLeave={() => setHover(null)}
              className="flex items-center gap-3 py-2"
            >
              <span className="label w-4 text-ink-4">{p.index}</span>
              <Link href={`/wardrobe/${p.item.id}`} className="size-12 shrink-0 overflow-hidden rounded-md bg-paper">
                <ItemImage item={p.item} />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="label text-ink-4">{SLOT_LABEL[p.slot]}</p>
                <p className="truncate text-sm font-semibold">{p.item.name}</p>
              </div>
              <button
                type="button"
                onClick={() => openReplace(p.slot)}
                className="label inline-flex h-8 items-center gap-1 rounded-full px-3 text-ink-3 hover:bg-ink/6 hover:text-ink"
                aria-label={`Replace ${p.item.name}`}
              >
                <Repeat2 className="size-3.5" /> Swap
              </button>
            </li>
          ))}
        </ol>

        <details className="group mt-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink-2 hover:text-ink">
            <span className="transition-transform group-open:rotate-45">+</span> Why this works
          </summary>
          <ul className="mt-3 flex flex-col gap-2 text-sm leading-relaxed text-ink-2">
            {outfit.rationale.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="mt-2 block size-1 shrink-0 rounded-full bg-accent" />
                {r}
              </li>
            ))}
          </ul>
        </details>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <Button
            variant={outfit.saved ? "primary" : "secondary"}
            icon={<Bookmark className={cn("size-4", outfit.saved && "fill-current")} />}
            onClick={() => {
              toggleSave(outfit.id);
              toast({ title: outfit.saved ? "Removed from lookbook" : "Saved to lookbook", tone: outfit.saved ? "neutral" : "success" });
            }}
          >
            {outfit.saved ? "Saved" : "Save"}
          </Button>
          <Button variant="accent" icon={<Shirt className="size-4" />} onClick={() => setWearOpen(true)}>
            Wear it
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <IconButton label={outfit.liked ? "Unlike" : "Like"} active={outfit.liked} onClick={() => toggleLike(outfit.id)}>
              <Heart className={cn("size-[18px]", outfit.liked && "fill-current")} />
            </IconButton>
            <IconButton
              label="Not for me"
              onClick={() => {
                reject(outfit.id);
                toast({
                  title: "Got it — less like this",
                  description: "Hidden from results and used to tune future suggestions.",
                  action: { label: "Undo", onClick: () => restore(outfit.id) },
                });
              }}
            >
              <ThumbsDown className="size-[18px]" />
            </IconButton>
            <Link
              href={`/outfits/${outfit.id}`}
              aria-label="Open outfit detail"
              className="inline-flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-ink/6"
            >
              <ArrowUpRight className="size-[18px]" />
            </Link>
          </div>
        </div>
      </div>

      <ReplaceDialog outfit={outfit} slot={replaceSlot} open={replaceOpen} onClose={() => setReplaceOpen(false)} onSlotChange={setReplaceSlot} />
      {wearOpen && <WearDialog outfit={outfit} open={wearOpen} onClose={() => setWearOpen(false)} />}
    </article>
  );
}

/** Compact tile used on Home and in the Lookbook grid. */
export function OutfitTile({ outfit, meta, className, static: isStatic }: { outfit: Outfit; meta?: string; className?: string; static?: boolean }) {
  const { pieces } = useOutfitPieces(outfit);
  const content = (
    <>
      <div className="relative overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-soft)]">
        <OutfitVisual outfit={outfit} pieces={pieces} showMarkers={false} className="transition-transform duration-500 group-hover:scale-[1.02]" />
        <div className="absolute right-2 top-2 flex gap-1">
          {outfit.saved && (
            <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm" title="Saved">
              <Bookmark className="size-3.5 fill-current" />
            </span>
          )}
          {outfit.liked && (
            <span className="flex size-7 items-center justify-center rounded-full bg-white/90 text-accent shadow-sm" title="Liked">
              <Heart className="size-3.5 fill-current" />
            </span>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <h3 className="display truncate text-base leading-tight">{outfit.name}</h3>
        <span className="label shrink-0 tabular-nums text-ink-3">{Math.round(outfit.score)}</span>
      </div>
      <p className="label mt-0.5 truncate text-ink-3">{meta ?? `${occasionLabel(outfit.occasion)} · ${pieces.length} pieces`}</p>
    </>
  );
  return isStatic ? (
    <div className={cn("group block", className)}>{content}</div>
  ) : (
    <Link href={`/outfits/${outfit.id}`} className={cn("group block", className)}>
      {content}
    </Link>
  );
}
