"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bookmark, Shirt } from "lucide-react";
import type { Outfit } from "@/domain/types";
import { CATEGORIES, occasionLabel, seasonLabel } from "@/domain/taxonomy";
import { useWardrobe, todayKey, currentSeason } from "@/store/useWardrobe";
import { services } from "@/services";
import { computeStats } from "@/services/stats/stats";
import { useOutfitPieces, useUsage } from "@/hooks/useDerived";
import { formatDate } from "@/lib/util";
import { OutfitVisual, VisualModeSwitch } from "@/components/outfit/OutfitVisual";
import { OutfitTile } from "@/components/outfit/OutfitCard";
import { WearDialog } from "@/components/outfit/WearDialog";
import { ScoreBadge } from "@/components/outfit/Score";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeader, Stat } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/States";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/store/toast";
import { PRESETS } from "@/data/presets";

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

export default function HomePage() {
  const items = useWardrobe((s) => s.items);
  const profile = useWardrobe((s) => s.profile);
  const wearLog = useWardrobe((s) => s.wearLog);
  const outfits = useWardrobe((s) => s.outfits);
  const interactions = useWardrobe((s) => s.interactions);
  const upsertGenerated = useWardrobe((s) => s.upsertGenerated);
  const toggleSave = useWardrobe((s) => s.toggleSave);
  const usage = useUsage();
  const today = todayKey();
  const season = currentSeason();
  const [wearOpen, setWearOpen] = useState(false);

  const wornToday = wearLog.find((w) => w.date === today);
  const wornTodayOutfit = wornToday ? outfits[wornToday.outfitId] : undefined;

  // Outfit of the day: deterministic per day, from the real wardrobe.
  const ootd = useMemo(() => {
    const res = services.engine.generate({
      items,
      profile,
      wearLog,
      today,
      sessionId: `ootd-${today}`,
      request: {
        occasion: profile.defaultOccasion,
        styles: [],
        instructions: "",
        preferredColors: [],
        excludedItemIds: [],
        count: 1,
        season,
        includeAccessory: true,
      },
    });
    return res.outfits[0];
    // Recompute when wardrobe or preferences change, not on every wear.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, profile.styles, profile.preferredColors, profile.avoidedColors, profile.preferredFits, profile.defaultOccasion, today, season]);

  const stored = ootd ? outfits[ootd.id] : undefined;
  const hero: Outfit | undefined = wornTodayOutfit ?? (ootd ? (stored ?? { ...ootd, saved: false, liked: false, rejected: false }) : undefined);
  const { pieces } = useOutfitPieces(hero);

  const stats = useMemo(
    () => computeStats(items, wearLog, Object.values(outfits), interactions, today),
    [items, wearLog, outfits, interactions, today],
  );

  const recent = useMemo(() => {
    const seen = new Set<string>();
    const rows: { outfit: Outfit; meta: string; at: string }[] = [];
    for (const w of wearLog) {
      const o = outfits[w.outfitId];
      if (o && !seen.has(o.id)) {
        seen.add(o.id);
        rows.push({ outfit: o, meta: `Worn ${formatDate(w.date)} · ${occasionLabel(w.occasion)}`, at: w.date });
      }
    }
    for (const o of Object.values(outfits)) {
      if (o.saved && !seen.has(o.id)) {
        seen.add(o.id);
        rows.push({ outfit: o, meta: `Saved · ${occasionLabel(o.occasion)}`, at: o.createdAt.slice(0, 10) });
      }
    }
    return rows.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4);
  }, [wearLog, outfits]);

  const forgotten = useMemo(
    () =>
      items
        .filter((i) => i.availability === "available")
        .map((i) => ({ i, u: usage[i.id] }))
        .sort((a, b) => (a.u?.count ?? 0) - (b.u?.count ?? 0) || (a.u?.lastWorn ?? "").localeCompare(b.u?.lastWorn ?? "") || a.i.id.localeCompare(b.i.id))
        .slice(0, 6)
        .map((x) => x.i),
    [items, usage],
  );

  const ensureHero = () => {
    if (hero && !outfits[hero.id] && ootd) upsertGenerated(ootd);
  };

  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      {/* Greeting */}
      <section className="flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
        <div>
          <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-3">
                        <span>{dateLabel}</span>
            <span>{profile.city}</span>
            <span>{seasonLabel(season)}</span>
          </p>
          <h1 className="display mt-2 text-[2rem] leading-[1.08] sm:text-display lg:text-display-lg">
            <span className="font-light text-ink-3">{greeting()},</span> <span className="text-gradient">{profile.name}</span>
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink-3 sm:text-right">
          {stats.neverWorn.length > 0
            ? `${stats.neverWorn.length} pieces in your wardrobe haven't been worn yet. Let's change that.`
            : "Every piece in your wardrobe has had an outing. Nice rotation."}
        </p>
      </section>

      {/* Outfit of the day */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12" aria-labelledby="ootd">
        <div className="relative">
          {hero && pieces.length ? (
            <Link href={`/outfits/${hero.id}`} onClick={ensureHero} className="block overflow-hidden rounded-lg shadow-[var(--shadow-soft)]" aria-label="Open outfit of the day">
              <OutfitVisual outfit={hero} pieces={pieces} />
            </Link>
          ) : (
            <EmptyState title="Not enough pieces yet" body="Add at least a top, a bottom and a pair of shoes to get daily outfits." action={<ButtonLink href="/wardrobe">Go to wardrobe</ButtonLink>} />
          )}
          {hero && (
            <div className="absolute right-3 top-3">
              <ScoreBadge score={hero.score} />
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-8">
          {hero && (
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                <p className="label text-accent-ink" id="ootd">
                  {wornTodayOutfit ? "Today's look — logged" : "Outfit of the day"}
                </p>
                <Badge tone="outline">{occasionLabel(hero.occasion)}</Badge>
              </div>
              <h2 className="display mt-2 text-3xl leading-tight sm:text-4xl">{hero.name}</h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-2">{hero.description}</p>
              <ul className="mt-4 flex max-w-md flex-col gap-1.5 text-sm text-ink-2">
                {hero.rationale.slice(0, 2).map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 block size-1 shrink-0 rounded-full bg-accent" />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {!wornTodayOutfit && (
                  <Button
                    variant="accent"
                    icon={<Shirt className="size-4" />}
                    onClick={() => {
                      ensureHero();
                      setWearOpen(true);
                    }}
                  >
                    Wear it today
                  </Button>
                )}
                <Button
                  variant="secondary"
                  icon={<Bookmark className={stored?.saved ? "size-4 fill-current" : "size-4"} />}
                  onClick={() => {
                    ensureHero();
                    toggleSave(hero.id);
                    toast({ title: stored?.saved ? "Removed from lookbook" : "Saved to lookbook", tone: "success" });
                  }}
                >
                  {stored?.saved ? "Saved" : "Save"}
                </Button>
                <VisualModeSwitch size="sm" className="ml-auto" />
              </div>
            </div>
          )}

          {/* Main CTA */}
          <Link
            href="/stylist"
            className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-lg bg-[linear-gradient(135deg,#e6f1ea_0%,#d3e6da_45%,#f1e6dc_100%)] p-6 text-ink shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)] sm:p-7"
          >
            <div>
              <p className="label text-accent-ink">Stylist</p>
              <p className="display mt-1 text-2xl leading-tight sm:text-[1.75rem]">Build an outfit</p>
              <p className="mt-2 max-w-xs text-sm text-ink-3">Pick an occasion, add a brief — get looks made only from pieces you own.</p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full gloss-accent text-white transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight className="size-5" />
            </span>
          </Link>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mt-10 grid grid-cols-2 gap-6 rounded-lg bg-surface p-6 shadow-[var(--shadow-soft)] sm:grid-cols-4" aria-label="Wardrobe at a glance">
        <Stat label="Pieces" value={stats.totalItems} sub={`${stats.availableItems} available now`} />
        <Stat label="Wears · 30 days" value={stats.wearsLast30} sub={`${stats.totalWears} logged in total`} />
        <Stat label="Utilisation" value={`${Math.round(stats.utilization * 100)}%`} sub="worn in last 90 days" tone="accent" />
        <Stat label="Saved looks" value={stats.savedOutfits} sub={`${stats.likedOutfits} liked`} />
      </section>

      {/* Quick wardrobe access */}
      <section className="mt-12">
        <SectionHeader
          label="Quick access"
          title="Your wardrobe"
          action={
            <Link href="/wardrobe" className="label inline-flex items-center gap-1 hover:text-accent-ink">
              All {items.length} <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
          {CATEGORIES.map((c) => {
            const catItems = items.filter((i) => i.category === c.id);
            const sample = catItems[0];
            return (
              <Link key={c.id} href={`/wardrobe?category=${c.id}`} className="group w-32 shrink-0 sm:w-auto">
                <div className="aspect-square overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-soft)] transition group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-lift)]">
                  {sample ? <ItemImage item={sample} /> : <div className="studio h-full w-full" />}
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-tight">{c.plural}</p>
                <p className="label text-ink-3 tabular-nums">{catItems.length}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent */}
      <section className="mt-14">
        <SectionHeader
          label="Lookbook"
          title="Recently worn & saved"
          action={
            <Link href="/lookbook" className="label inline-flex items-center gap-1 hover:text-accent-ink">
              Lookbook <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />
        {recent.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {recent.map((r) => (
              <OutfitTile key={r.outfit.id} outfit={r.outfit} meta={r.meta} />
            ))}
          </div>
        ) : (
          <EmptyState compact title="Nothing here yet" body="Save or wear an outfit and it will show up here." action={<ButtonLink href="/stylist">Open the stylist</ButtonLink>} />
        )}
      </section>

      {/* Inspiration */}
      <section className="mt-14">
        <SectionHeader label="Style inspiration" title="Start from a mood" />
        <div className="grid gap-4 md:grid-cols-3">
          {PRESETS.map((p, i) => (
            <Link
              key={p.id}
              href={`/stylist?preset=${p.id}`}
              className={`group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-lg p-5 ${p.tone}`}
            >
              <div className="flex items-start justify-between">
                <span className="label opacity-70">Mood</span>
                <ArrowUpRight className="size-5 transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-lift)] group-hover:translate-x-0.5" />
              </div>
              <div>
                <h3 className="display text-2xl leading-tight">{p.title}</h3>
                <p className="mt-2 max-w-[18rem] text-sm opacity-80">{p.blurb}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="label text-accent-ink">Rediscover</p>
              <h3 className="display mt-1 text-xl">Pieces waiting for their moment</h3>
            </div>
            <Link href="/stats" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink">
              Usage stats <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="no-scrollbar -mx-5 mt-5 flex gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-6 sm:px-0">
            {forgotten.map((i) => (
              <Link key={i.id} href={`/wardrobe/${i.id}`} className="group w-28 shrink-0 sm:w-auto">
                <div className="aspect-square overflow-hidden rounded-lg bg-paper">
                  <ItemImage item={i} />
                </div>
                <p className="mt-1.5 truncate text-xs font-semibold">{i.name}</p>
                <p className="label text-ink-4">{usage[i.id]?.count ? `Worn ${usage[i.id].count}×` : "Never worn"}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {hero && outfits[hero.id] && wearOpen && <WearDialog outfit={outfits[hero.id]} open={wearOpen} onClose={() => setWearOpen(false)} />}
    </div>
  );
}
