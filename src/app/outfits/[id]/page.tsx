"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Heart, Repeat2, Shirt, ThumbsDown, Undo2 } from "lucide-react";
import type { OutfitSlot } from "@/domain/types";
import { SLOT_LABEL, colorLabel, fitLabel, occasionLabel, styleLabel } from "@/domain/taxonomy";
import { useWardrobe } from "@/store/useWardrobe";
import { useOutfitPieces, useUsage } from "@/hooks/useDerived";
import { formatDate } from "@/lib/util";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { Swatch } from "@/components/ui/Chip";
import { OutfitVisual, VisualModeSwitch } from "@/components/outfit/OutfitVisual";
import { ScoreBadge, ScoreBreakdown } from "@/components/outfit/Score";
import { ReplaceDialog } from "@/components/outfit/ReplaceDialog";
import { WearDialog } from "@/components/outfit/WearDialog";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { toast } from "@/store/toast";
import { cn } from "@/components/ui/cn";

export default function OutfitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const outfit = useWardrobe((s) => s.outfits[id]);
  const wearLog = useWardrobe((s) => s.wearLog);
  const markViewed = useWardrobe((s) => s.markViewed);
  const toggleSave = useWardrobe((s) => s.toggleSave);
  const toggleLike = useWardrobe((s) => s.toggleLike);
  const reject = useWardrobe((s) => s.reject);
  const restore = useWardrobe((s) => s.restore);
  const { pieces, missing } = useOutfitPieces(outfit);
  const usage = useUsage();
  const [slot, setSlot] = useState<OutfitSlot | null>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [wearOpen, setWearOpen] = useState(false);
  const visualMode = useWardrobe((s) => s.visualMode);

  useEffect(() => {
    if (outfit) markViewed(outfit.id);
  }, [outfit?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!outfit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <EmptyState
          title="Outfit not found"
          body="It may have been removed because one of its pieces was deleted, or it expired from an old styling session."
          action={<ButtonLink href="/lookbook">Open lookbook</ButtonLink>}
        />
      </div>
    );
  }

  const wears = wearLog.filter((w) => w.outfitId === outfit.id);
  const openReplace = (s: OutfitSlot) => {
    setSlot(s);
    setReplaceOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-5 sm:px-8 lg:px-12 lg:pt-8">
      <button type="button" onClick={() => router.back()} className="label inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back
      </button>

      {outfit.rejected && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm bg-ink px-4 py-3 text-sm text-paper">
          You dismissed this look. It won’t be suggested again.
          <Button size="sm" variant="inverse" icon={<Undo2 className="size-3.5" />} className="ml-auto" onClick={() => restore(outfit.id)}>
            Restore
          </Button>
        </div>
      )}
      {missing > 0 && (
        <p className="mt-4 rounded-sm border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent" role="alert">
          {missing} piece{missing > 1 ? "s" : ""} from this outfit no longer exist in your wardrobe.
        </p>
      )}

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="relative overflow-hidden rounded-sm">
            <OutfitVisual outfit={outfit} pieces={pieces} onPieceClick={openReplace} />
            <div className="absolute right-3 top-3">
              <ScoreBadge score={outfit.score} />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <VisualModeSwitch size="sm" />
            <p className="text-xs text-ink-3">{visualMode === "collage" ? "Tap a piece to swap it." : "Switch to Real wardrobe to see your actual pieces."}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col animate-fade-up">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="outline">{occasionLabel(outfit.occasion)}</Badge>
            {styleLabel(outfit.style) !== occasionLabel(outfit.occasion) && <Badge tone="sage">{styleLabel(outfit.style)}</Badge>}
            {outfit.saved && <Badge tone="ink">Saved</Badge>}
            {wears.length > 0 && <Badge tone="accent">Worn {wears.length}×</Badge>}
          </div>
          <h1 className="display mt-3 text-5xl leading-[0.9] sm:text-6xl">{outfit.name}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{outfit.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
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
            <Button variant="accent" icon={<Shirt className="size-4" />} onClick={() => setWearOpen(true)} disabled={missing > 0}>
              Wear it
            </Button>
            <div className="ml-auto flex gap-1">
              <IconButton label={outfit.liked ? "Unlike" : "Like"} active={outfit.liked} onClick={() => toggleLike(outfit.id)}>
                <Heart className={cn("size-[18px]", outfit.liked && "fill-current")} />
              </IconButton>
              {!outfit.rejected && (
                <IconButton
                  label="Not for me"
                  onClick={() => {
                    reject(outfit.id);
                    toast({ title: "Dismissed", description: "Used to tune future suggestions.", action: { label: "Undo", onClick: () => restore(outfit.id) } });
                  }}
                >
                  <ThumbsDown className="size-[18px]" />
                </IconButton>
              )}
            </div>
          </div>

          <section className="mt-8">
            <div className="flex items-baseline justify-between border-b border-ink pb-2">
              <h2 className="display text-xl">The pieces</h2>
              <button type="button" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink" onClick={() => openReplace(pieces[0]?.slot ?? "base")}>
                <Repeat2 className="size-3.5" /> Swap or add
              </button>
            </div>
            <ol className="divide-y divide-line">
              {pieces.map((p) => (
                <li key={p.slot} className="flex items-center gap-3 py-3" data-item-id={p.item.id}>
                  <span className="label w-4 text-ink-4">{p.index}</span>
                  <Link href={`/wardrobe/${p.item.id}`} className="size-16 shrink-0 overflow-hidden rounded-xs ring-1 ring-line hover:ring-ink">
                    <ItemImage item={p.item} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="label text-ink-4">{SLOT_LABEL[p.slot]}</p>
                    <Link href={`/wardrobe/${p.item.id}`} className="block truncate text-sm font-semibold hover:underline">
                      {p.item.name}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
                      <span className="inline-flex items-center gap-1">
                        <Swatch color={p.item.mainColor} size={10} /> {colorLabel(p.item.mainColor)}
                      </span>
                      {p.item.fit && <span>· {fitLabel(p.item.fit)}</span>}
                      <span>· worn {usage[p.item.id]?.count ?? 0}×</span>
                      {p.item.availability !== "available" && <span className="text-accent">· unavailable</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReplace(p.slot)}
                    aria-label={`Replace ${p.item.name}`}
                    className="label inline-flex h-8 items-center gap-1 rounded-sm px-2 text-ink-3 hover:bg-ink/6 hover:text-ink"
                  >
                    <Repeat2 className="size-3.5" /> Swap
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="display border-b border-ink pb-2 text-xl">Why it works</h2>
              <ul className="mt-3 flex flex-col gap-2.5 text-sm leading-relaxed text-ink-2">
                {outfit.rationale.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 block size-1 shrink-0 rounded-full bg-accent" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="display flex items-baseline justify-between border-b border-ink pb-2 text-xl">
                Score <span className="tabular-nums">{Math.round(outfit.score)}</span>
              </h2>
              <ScoreBreakdown breakdown={outfit.breakdown} className="mt-3" />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="display border-b border-ink pb-2 text-xl">History</h2>
            {wears.length ? (
              <ul className="divide-y divide-line">
                {wears.map((w) => (
                  <li key={w.id} className="flex justify-between py-2 text-sm">
                    <span>{formatDate(w.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                    <span className="text-ink-3">{occasionLabel(w.occasion)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-3">Not worn yet. Hit “Wear it” when you do — it keeps your stats honest.</p>
            )}
          </section>
        </div>
      </div>

      <ReplaceDialog outfit={outfit} slot={slot} open={replaceOpen} onClose={() => setReplaceOpen(false)} onSlotChange={setSlot} />
      {wearOpen && <WearDialog outfit={outfit} open={wearOpen} onClose={() => setWearOpen(false)} />}
    </div>
  );
}
