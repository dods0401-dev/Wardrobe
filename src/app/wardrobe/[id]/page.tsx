"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, Pencil, Sparkles, Trash2 } from "lucide-react";
import type { Availability } from "@/domain/types";
import {
  AVAILABILITY,
  categoryLabel,
  colorLabel,
  fitLabel,
  patternLabel,
  seasonLabel,
  styleLabel,
} from "@/domain/taxonomy";
import { shapeDef } from "@/domain/garments";
import { useWardrobe, todayKey } from "@/store/useWardrobe";
import { useUsage } from "@/hooks/useDerived";
import { daysSince } from "@/services/stats/stats";
import { formatDate, pluralize } from "@/lib/util";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { Swatch } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/Section";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { EditItemDialog } from "@/components/wardrobe/ItemDialogs";
import { OutfitTile } from "@/components/outfit/OutfitCard";
import { toast } from "@/store/toast";
import { cn } from "@/components/ui/cn";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const item = useWardrobe((s) => s.items.find((i) => i.id === id));
  const outfits = useWardrobe((s) => s.outfits);
  const wearLog = useWardrobe((s) => s.wearLog);
  const updateItem = useWardrobe((s) => s.updateItem);
  const deleteItem = useWardrobe((s) => s.deleteItem);
  const usage = useUsage();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const featuring = useMemo(
    () => Object.values(outfits).filter((o) => !o.rejected && o.pieces.some((p) => p.itemId === id)),
    [outfits, id],
  );
  const savedFeaturing = featuring.filter((o) => o.saved);
  const wears = wearLog.filter((w) => w.itemIds.includes(id));

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <EmptyState title="This piece isn't in your wardrobe" body="It may have been deleted." action={<ButtonLink href="/wardrobe">Back to wardrobe</ButtonLink>} />
      </div>
    );
  }

  const u = usage[item.id];
  const since = daysSince(u?.lastWorn, todayKey());
  const rows: [string, React.ReactNode][] = [
    ["Category", `${categoryLabel(item.category)} · ${item.subcategory}`],
    ["Type", shapeDef(item.shape).label],
    [
      "Colours",
      <span key="c" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {[item.mainColor, ...item.secondaryColors].map((c, i) => (
          <span key={c} className="inline-flex items-center gap-1.5">
            <Swatch color={c} /> {colorLabel(c)}
            {i === 0 && item.secondaryColors.length > 0 && <span className="text-ink-4">(main)</span>}
          </span>
        ))}
      </span>,
    ],
    ["Pattern", patternLabel(item.pattern)],
    ["Style", item.styles.map(styleLabel).join(", ")],
    ["Season", item.seasons.length === 4 ? "All year" : item.seasons.map(seasonLabel).join(", ")],
    ["Fit", item.fit ? fitLabel(item.fit) : "—"],
    ["Formality", `${item.formality.toFixed(1)} / 5`],
    ["Brand", item.brand ?? "—"],
    ["Material", item.material ?? "—"],
    ["Added", new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })],
  ];

  return (
    <div className="mx-auto max-w-[1300px] px-4 pb-16 pt-5 sm:px-8 lg:px-12 lg:pt-8">
      <button type="button" onClick={() => router.back()} className="label inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Back
      </button>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-soft)]">
            <ItemImage item={item} fit="contain" className="p-6" />
          </div>
          {item.image.kind === "render" && (
            <p className="mt-2 text-xs text-ink-3">Generated product cutout. Upload a photo from “Edit” to replace it.</p>
          )}
        </div>

        <div className="flex flex-col animate-fade-up">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="outline">{categoryLabel(item.category)}</Badge>
            {item.availability !== "available" && <Badge tone="ink">{AVAILABILITY.find((a) => a.id === item.availability)?.label}</Badge>}
          </div>
          <h1 className="display mt-3 text-[2rem] leading-tight sm:text-display">{item.name}</h1>
          {item.brand && <p className="label mt-3 text-ink-3">{item.brand}</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink href={`/stylist?anchor=${item.id}`} variant="accent" icon={<Sparkles className="size-4" />}>
              Style this piece
            </ButtonLink>
            <Button variant="secondary" icon={<Pencil className="size-4" />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              icon={<Heart className={cn("size-4", item.favorite && "fill-accent text-accent")} />}
              onClick={() => updateItem(item.id, { favorite: !item.favorite })}
              aria-pressed={!!item.favorite}
            >
              {item.favorite ? "Favourite" : "Add to favourites"}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)]">
            <Stat label="Worn" value={`${u?.count ?? 0}×`} />
            <Stat label="Last worn" value={since === null ? "—" : since === 0 ? "Today" : `${since}d`} sub={u?.lastWorn ? formatDate(u.lastWorn) : "Never"} />
            <Stat label="In looks" value={featuring.length} sub={`${savedFeaturing.length} saved`} />
          </div>

          <fieldset className="mt-6">
            <legend className="label mb-2 text-ink-3">Availability</legend>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABILITY.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={item.availability === a.id}
                  onClick={() => {
                    updateItem(item.id, { availability: a.id as Availability });
                    toast({ title: `Marked as ${a.label.toLowerCase()}`, description: a.id === "available" ? "The stylist can use it again." : "The stylist will skip it until it's back." });
                  }}
                  className={cn("h-8 rounded-full border px-3.5 text-[13px] font-medium", item.availability === a.id ? "border-accent bg-accent-soft text-accent-ink" : "border-line bg-surface text-ink-2 hover:border-stone-2")}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </fieldset>

          <dl className="mt-6 divide-y divide-line rounded-lg bg-surface px-5 shadow-[var(--shadow-soft)]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 py-2.5 text-sm">
                <dt className="label pt-0.5 text-ink-3">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="label mt-6 inline-flex items-center gap-1.5 self-start text-ink-3 hover:text-danger"
          >
            <Trash2 className="size-3.5" /> Delete piece
          </button>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="display mb-4 text-xl">Looks featuring this piece</h2>
        {featuring.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {featuring.slice(0, 8).map((o) => (
              <OutfitTile key={o.id} outfit={o} />
            ))}
          </div>
        ) : (
          <EmptyState
            compact
            title="Not in any look yet"
            body="Ask the stylist to build outfits around it."
            action={<ButtonLink href={`/stylist?anchor=${item.id}`}>Style this piece</ButtonLink>}
          />
        )}
        {wears.length > 0 && <p className="mt-4 text-xs text-ink-3">Logged in {pluralize(wears.length, "wear")}.</p>}
      </section>

      {editOpen && <EditItemDialog item={item} open={editOpen} onClose={() => setEditOpen(false)} />}
      <ConfirmDialog
        open={confirmDelete}
        title={`Delete “${item.name}”?`}
        body={
          <>
            <p>This removes the piece from your wardrobe.</p>
            {featuring.length > 0 && (
              <p className="mt-2">
                It appears in <strong>{pluralize(featuring.length, "outfit")}</strong>
                {savedFeaturing.length ? ` (${savedFeaturing.length} saved)` : ""} — those outfits will be removed too.
              </p>
            )}
            {wears.length > 0 && <p className="mt-2">Your wear history keeps a record of it, so past stats stay accurate.</p>}
          </>
        }
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          const name = item.name;
          setConfirmDelete(false);
          router.push("/wardrobe");
          deleteItem(item.id);
          toast({ title: `${name} deleted` });
        }}
      />
    </div>
  );
}
