"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryPlural, colorHex, colorLabel, occasionLabel } from "@/domain/taxonomy";
import { useWardrobe, todayKey } from "@/store/useWardrobe";
import { computeStats, type ItemUsageRow } from "@/services/stats/stats";
import { formatDate } from "@/lib/util";
import { PageHeader, Stat } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { cn } from "@/components/ui/cn";

function Panel({ title, label, children, className, action }: { title: string; label?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn("rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6", className)}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {label && <p className="label text-ink-3">{label}</p>}
          <h2 className="display text-lg leading-tight">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Horizontal magnitude bars — one hue, values as text, recessive track. */
function Bars({ rows, max, unit = "" }: { rows: { key: string; label: React.ReactNode; value: number; swatch?: string; sub?: string }[]; max: number; unit?: string }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.key} className="group grid grid-cols-[minmax(0,8.5rem)_1fr_2.75rem] items-center gap-3 text-sm" title={`${typeof r.label === "string" ? r.label : r.key}: ${r.value}${unit}`}>
          <span className="flex min-w-0 items-center gap-2">
            {r.swatch && <span className="block size-3 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: r.swatch }} />}
            <span className="truncate">{r.label}</span>
          </span>
          <span className="h-2 overflow-hidden rounded-full bg-paper-2">
            <span className="block h-full rounded-full bg-accent transition-[width] duration-500 group-hover:bg-accent-ink" style={{ width: `${max ? (r.value / max) * 100 : 0}%` }} />
          </span>
          <span className="text-right tabular-nums text-ink-2">
            {r.value}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}

function UsageList({ rows, empty }: { rows: ItemUsageRow[]; empty: string }) {
  if (!rows.length) return <p className="text-sm text-ink-3">{empty}</p>;
  return (
    <ol className="divide-y divide-line">
      {rows.map((r, i) => (
        <li key={r.item.id}>
          <Link href={`/wardrobe/${r.item.id}`} className="group flex items-center gap-3 py-2">
            <span className="label w-4 text-ink-4">{i + 1}</span>
            <span className="size-11 shrink-0 overflow-hidden rounded-md bg-paper">
              <ItemImage item={r.item} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{r.item.name}</span>
              <span className="label text-ink-3">{r.lastWorn ? `Last ${formatDate(r.lastWorn)}` : "Never worn"}</span>
            </span>
            <span className="text-base font-semibold tabular-nums">{r.count}×</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default function StatsPage() {
  const items = useWardrobe((s) => s.items);
  const wearLog = useWardrobe((s) => s.wearLog);
  const outfits = useWardrobe((s) => s.outfits);
  const interactions = useWardrobe((s) => s.interactions);
  const today = todayKey();
  const stats = useMemo(() => computeStats(items, wearLog, Object.values(outfits), interactions, today), [items, wearLog, outfits, interactions, today]);
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <EmptyState title="No stats yet" body="Add pieces to your wardrobe and log a few outfits." action={<ButtonLink href="/wardrobe">Go to wardrobe</ButtonLink>} />
      </div>
    );
  }

  const weekMax = Math.max(1, ...stats.weekly.map((w) => w.count));
  const colorTop = stats.colorShare.slice(0, 8);
  const colorMax = Math.max(1, ...colorTop.map((c) => c.count));
  const catMax = Math.max(1, ...stats.categoryShare.map((c) => c.count));
  const occMax = Math.max(1, ...stats.occasionShare.map((c) => c.count));
  const ic = stats.interactionCounts;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader
        index="06"
        eyebrow="Style Stats"
        title={
          <>
            You wear <span className="text-accent">{Math.round(stats.utilization * 100)}%</span> of your wardrobe
          </>
        }
        intro={`${stats.itemsWorn90} of ${stats.totalItems} pieces have been worn in the last 90 days. Everything here updates as you log outfits.`}
      />

      <section className="mt-6 grid grid-cols-2 gap-6 rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)] sm:grid-cols-3 sm:p-6 lg:grid-cols-6" aria-label="Key numbers">
        <Stat label="Outfits worn" value={stats.totalWears} sub={`${stats.wearsLast30} in 30 days`} />
        <Stat label="Utilisation" value={`${Math.round(stats.utilization * 100)}%`} sub="last 90 days" tone="accent" />
        <Stat label="Avg item usage" value={`${stats.averageUsage.toFixed(1)}×`} sub="wears per piece" />
        <Stat label="Never worn" value={stats.neverWorn.length} sub={`of ${stats.totalItems} pieces`} />
        <Stat label="Saved looks" value={stats.savedOutfits} sub={`${stats.likedOutfits} liked`} />
        <Stat label="Streak" value={`${stats.streak}d`} sub="days logged in a row" />
      </section>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Panel title="Wears per week" label="Last 8 weeks">
          <div className="relative">
            <div className="flex h-44 items-end gap-2 border-b border-line" role="img" aria-label={stats.weekly.map((w) => `Week of ${formatDate(w.weekStart)}: ${w.count}`).join("; ")}>
              {stats.weekly.map((w, i) => (
                <button
                  key={w.weekStart}
                  type="button"
                  onMouseEnter={() => setHoverWeek(i)}
                  onMouseLeave={() => setHoverWeek(null)}
                  onFocus={() => setHoverWeek(i)}
                  onBlur={() => setHoverWeek(null)}
                  aria-label={`Week of ${formatDate(w.weekStart)}: ${w.count} wears`}
                  className="relative flex h-full flex-1 items-end"
                >
                  <span
                    className={cn("block w-full rounded-t-[6px] transition-colors", hoverWeek === i ? "bg-accent-ink" : i === stats.weekly.length - 1 ? "bg-accent" : "bg-accent/45")}
                    style={{ height: `${(w.count / weekMax) * 100}%`, minHeight: w.count ? 4 : 0 }}
                  />
                  {hoverWeek === i && (
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xs bg-ink px-2 py-1 text-xs text-paper">
                      {formatDate(w.weekStart)} · <strong>{w.count}</strong> wears
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {stats.weekly.map((w, i) => (
                <span key={w.weekStart} className="label flex-1 text-center !text-[9px] text-ink-4">
                  {i === stats.weekly.length - 1 ? "This wk" : formatDate(w.weekStart)}
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Wardrobe utilisation" label="By category · worn vs owned">
          <ul className="flex flex-col gap-3">
            {stats.categoryShare.map((c) => {
              const worn90 = items.filter((i) => i.category === c.category && wearLog.some((w) => w.itemIds.includes(i.id))).length;
              const pct = c.items ? worn90 / c.items : 0;
              return (
                <li key={c.category} className="grid grid-cols-[minmax(0,8.5rem)_1fr_3.5rem] items-center gap-3 text-sm" title={`${categoryPlural(c.category)}: ${worn90} of ${c.items} worn`}>
                  <span className="truncate">{categoryPlural(c.category)}</span>
                  <span className="flex h-2.5 gap-[2px]">
                    {Array.from({ length: c.items }).map((_, i) => (
                      <span key={i} className={cn("h-full flex-1 first:rounded-l-[4px] last:rounded-r-[4px]", i < worn90 ? "bg-accent" : "bg-paper-2")} />
                    ))}
                  </span>
                  <span className="text-right tabular-nums text-ink-2">
                    {worn90}/{c.items}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Each segment is one piece; filled = worn at least once.</p>
        </Panel>

        <Panel title="Most worn" label="Pieces">
          <UsageList rows={stats.mostUsed} empty="Log an outfit to see your most-worn pieces." />
        </Panel>

        <Panel
          title="Least worn"
          label="Rotation opportunities"
          action={
            <Link href="/stylist" className="label inline-flex items-center gap-1 text-ink-3 hover:text-ink">
              Style them <ArrowUpRight className="size-3.5" />
            </Link>
          }
        >
          <UsageList rows={stats.leastUsed} empty="—" />
        </Panel>

        <Panel title="Colours you wear" label="Share of worn pieces">
          {colorTop.length ? (
            <Bars
              rows={colorTop.map((c) => ({ key: c.color, label: colorLabel(c.color), value: c.count, swatch: colorHex(c.color) }))}
              max={colorMax}
            />
          ) : (
            <p className="text-sm text-ink-3">No wears logged yet.</p>
          )}
        </Panel>

        <Panel title="Categories you wear" label="Piece-wears by category">
          <Bars rows={stats.categoryShare.filter((c) => c.count).map((c) => ({ key: c.category, label: categoryPlural(c.category), value: c.count }))} max={catMax} />
        </Panel>

        <Panel title="Occasions" label="What you dress for">
          {stats.occasionShare.length ? (
            <Bars rows={stats.occasionShare.map((o) => ({ key: o.occasion, label: occasionLabel(o.occasion), value: o.count }))} max={occMax} />
          ) : (
            <p className="text-sm text-ink-3">No wears logged yet.</p>
          )}
        </Panel>

        <Panel title="Stylist feedback" label="Interactions tracked">
          <dl className="grid grid-cols-3 gap-x-4 gap-y-5">
            {(
              [
                ["Suggested", ic.suggested],
                ["Viewed", ic.viewed],
                ["Liked", ic.liked],
                ["Saved", ic.saved],
                ["Worn", ic.worn],
                ["Rejected", ic.rejected],
                ["Swapped", ic.item_replaced],
              ] as const
            ).map(([label, v]) => (
              <div key={label}>
                <dt className="label text-ink-3">{label}</dt>
                <dd className="display text-2xl tabular-nums">{v ?? 0}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </div>
  );
}
