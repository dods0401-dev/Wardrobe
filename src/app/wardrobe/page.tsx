"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Plus, Search, SlidersHorizontal, Upload, X } from "lucide-react";
import type { Category } from "@/domain/types";
import { AVAILABILITY, CATEGORIES, COLORS, SEASONS, STYLES, availabilityLabel, categoryLabel, colorLabel, seasonLabel, styleLabel } from "@/domain/taxonomy";
import { useWardrobe } from "@/store/useWardrobe";
import { useUsage } from "@/hooks/useDerived";
import { EMPTY_FILTERS, activeFilterCount, filterItems, type WardrobeFilters } from "@/services/wardrobe/query";
import { PageHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Chip, ColorToggle } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/States";
import { Badge } from "@/components/ui/Badge";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { AddItemDialog, BulkUploadDialog } from "@/components/wardrobe/ItemDialogs";
import { cn } from "@/components/ui/cn";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function FilterPanel({ f, set }: { f: WardrobeFilters; set: (f: WardrobeFilters) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="label mb-2.5 text-ink-3">Colour</legend>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <ColorToggle key={c.id} color={c.id} selected={f.colors.includes(c.id)} onClick={() => set({ ...f, colors: toggle(f.colors, c.id) })} />
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label mb-2.5 text-ink-3">Style</legend>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} size="sm" selected={f.styles.includes(s.id)} onClick={() => set({ ...f, styles: toggle(f.styles, s.id) })}>
              {s.label}
            </Chip>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="label mb-2.5 text-ink-3">Season</legend>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <Chip key={s.id} size="sm" selected={f.seasons.includes(s.id)} onClick={() => set({ ...f, seasons: toggle(f.seasons, s.id) })}>
                {s.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label mb-2.5 text-ink-3">Availability</legend>
          <div className="flex flex-wrap gap-2">
            <Chip size="sm" selected={f.availability === "all"} onClick={() => set({ ...f, availability: "all" })}>
              All
            </Chip>
            {AVAILABILITY.map((a) => (
              <Chip key={a.id} size="sm" selected={f.availability === a.id} onClick={() => set({ ...f, availability: a.id })}>
                {a.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

function WardrobeView() {
  const items = useWardrobe((s) => s.items);
  const usage = useUsage();
  const params = useSearchParams();
  const router = useRouter();
  const [f, setF] = useState<WardrobeFilters>(() => {
    const cat = params.get("category") as Category | null;
    return { ...EMPTY_FILTERS, categories: cat && CATEGORIES.some((c) => c.id === cat) ? [cat] : [] };
  });
  const [panel, setPanel] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Keep the category in the URL so it is shareable / survives back-navigation.
  useEffect(() => {
    const cat = f.categories.length === 1 ? f.categories[0] : null;
    const current = params.get("category");
    if (cat !== current) router.replace(cat ? `/wardrobe?category=${cat}` : "/wardrobe", { scroll: false });
  }, [f.categories, params, router]);

  const results = useMemo(() => filterItems(items, f, usage), [items, f, usage]);
  const extra = activeFilterCount({ ...f, categories: [] });
  const chips = [
    ...f.colors.map((c) => ({ key: `c-${c}`, label: colorLabel(c), clear: () => setF({ ...f, colors: f.colors.filter((x) => x !== c) }) })),
    ...f.styles.map((s) => ({ key: `s-${s}`, label: styleLabel(s), clear: () => setF({ ...f, styles: f.styles.filter((x) => x !== s) }) })),
    ...f.seasons.map((s) => ({ key: `se-${s}`, label: seasonLabel(s), clear: () => setF({ ...f, seasons: f.seasons.filter((x) => x !== s) }) })),
    ...(f.availability !== "all" ? [{ key: "av", label: availabilityLabel(f.availability), clear: () => setF({ ...f, availability: "all" as const }) }] : []),
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader
        index="02"
        eyebrow={`${items.length} pieces · ${items.filter((i) => i.availability === "available").length} available`}
        title="My Wardrobe"
        intro="Everything you own, in one place. Keep it accurate and the stylist gets sharper."
        actions={
          <>
            <Button variant="secondary" icon={<Upload className="size-4" />} onClick={() => setBulkOpen(true)}>
              Bulk upload
            </Button>
            <Button icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
              Add item
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="sticky top-14 z-20 -mx-4 mt-6 border-b border-line bg-paper/95 px-4 pb-3 pt-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-12 lg:px-12">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              icon={<Search className="size-4" />}
              placeholder="Search name, brand, colour…"
              value={f.query}
              onChange={(e) => setF({ ...f, query: e.target.value })}
              aria-label="Search wardrobe"
              type="search"
            />
          </div>
          <Button
            variant={panel || extra ? "primary" : "secondary"}
            icon={<SlidersHorizontal className="size-4" />}
            onClick={() => (window.matchMedia("(min-width: 768px)").matches ? setPanel(!panel) : setSheet(true))}
            aria-expanded={panel}
            aria-label={extra ? `Filters, ${extra} active` : "Filters"}
          >
            <span className="hidden sm:inline">Filters</span>
            {extra > 0 && <span className="tabular-nums">{extra}</span>}
          </Button>
          <div className="hidden w-44 sm:block">
            <Select aria-label="Sort" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as WardrobeFilters["sort"] })}>
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="most-worn">Most worn</option>
              <option value="least-worn">Least worn</option>
            </Select>
          </div>
        </div>
        <div className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
          <Chip size="sm" selected={!f.categories.length} onClick={() => setF({ ...f, categories: [] })}>
            All
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} size="sm" selected={f.categories.includes(c.id)} onClick={() => setF({ ...f, categories: toggle(f.categories, c.id) })}>
              {c.plural}
              <span className="opacity-50 tabular-nums">{items.filter((i) => i.category === c.id).length}</span>
            </Chip>
          ))}
        </div>
        {panel && (
          <div className="mt-4 hidden border-t border-line pt-4 md:block animate-fade-in">
            <FilterPanel f={f} set={setF} />
          </div>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={c.clear} className="label inline-flex h-7 items-center gap-1 rounded-sm bg-ink/8 px-2 hover:bg-ink/12">
              {c.label} <X className="size-3" />
            </button>
          ))}
          <button type="button" onClick={() => setF({ ...EMPTY_FILTERS, query: f.query, sort: f.sort })} className="label ml-1 text-accent hover:underline">
            Clear all
          </button>
        </div>
      )}

      <p className="label mt-5 text-ink-3" aria-live="polite">
        {results.length} {results.length === 1 ? "piece" : "pieces"}
        {f.categories.length === 1 ? ` · ${categoryLabel(f.categories[0])}` : ""}
      </p>

      {results.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5">
          {results.map((item, idx) => {
            const u = usage[item.id];
            return (
              <li key={item.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(idx, 12) * 25}ms` }}>
                <Link href={`/wardrobe/${item.id}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm ring-1 ring-line transition group-hover:ring-ink">
                    <ItemImage item={item} fit="cover" className={cn("transition-transform duration-500 group-hover:scale-[1.03]", item.availability !== "available" && "opacity-55")} />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {item.availability !== "available" && <Badge tone="ink">{availabilityLabel(item.availability)}</Badge>}
                      {item.image.kind === "upload" && <Badge tone="neutral">Photo</Badge>}
                    </div>
                    {item.favorite && <Heart className="absolute right-2 top-2 size-4 fill-accent text-accent" aria-label="Favourite" />}
                  </div>
                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold leading-snug">{item.name}</p>
                      <p className="truncate text-xs text-ink-3">{item.brand ?? item.subcategory}</p>
                    </div>
                    <span className="label shrink-0 pt-0.5 tabular-nums text-ink-4" title="Times worn">
                      {u?.count ?? 0}×
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : items.length ? (
        <EmptyState
          className="mt-6"
          title="No pieces match"
          body="Try a broader search, or clear some filters."
          action={
            <Button variant="secondary" onClick={() => setF(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <EmptyState
          className="mt-6"
          title="Your wardrobe is empty"
          body="Add your first pieces — a photo of each is enough to get started."
          action={
            <>
              <Button onClick={() => setAddOpen(true)}>Add item</Button>
              <Button variant="secondary" onClick={() => setBulkOpen(true)}>
                Bulk upload
              </Button>
            </>
          }
        />
      )}

      <Modal
        open={sheet}
        onClose={() => setSheet(false)}
        title="Filters"
        eyebrow={`${results.length} results`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setF({ ...EMPTY_FILTERS, query: f.query })}>
              Reset
            </Button>
            <Button onClick={() => setSheet(false)}>Show {results.length}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="label mb-2.5 text-ink-3">Sort</p>
            <Select aria-label="Sort" value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value as WardrobeFilters["sort"] })}>
              <option value="newest">Newest first</option>
              <option value="name">Name A–Z</option>
              <option value="most-worn">Most worn</option>
              <option value="least-worn">Least worn</option>
            </Select>
          </div>
          <FilterPanel f={f} set={setF} />
        </div>
      </Modal>
      <AddItemDialog open={addOpen} onClose={() => setAddOpen(false)} onAdded={(id) => router.push(`/wardrobe/${id}`)} />
      <BulkUploadDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}

export default function WardrobePage() {
  return (
    <Suspense>
      <WardrobeView />
    </Suspense>
  );
}
