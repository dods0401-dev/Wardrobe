"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import type { Occasion, WearEntry } from "@/domain/types";
import { OCCASIONS, colorHex, occasionLabel } from "@/domain/taxonomy";
import { useWardrobe, todayKey } from "@/store/useWardrobe";
import { useItemsById } from "@/hooks/useDerived";
import { addDays, formatDate, fromDateKey, toDateKey } from "@/lib/util";
import { PageHeader } from "@/components/ui/Section";
import { Segmented } from "@/components/ui/Section";
import { Chip } from "@/components/ui/Chip";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/States";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { OutfitTile } from "@/components/outfit/OutfitCard";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { cn } from "@/components/ui/cn";
import { toast } from "@/store/toast";

type Tab = "saved" | "worn" | "history" | "calendar";
const TABS: Tab[] = ["saved", "worn", "history", "calendar"];

function EntryThumbs({ entry, size = "md" }: { entry: WearEntry; size?: "sm" | "md" }) {
  const byId = useItemsById();
  return (
    <div className="flex -space-x-2">
      {entry.itemSnapshots.slice(0, 5).map((snap) => {
        const item = byId.get(snap.id);
        return (
          <div
            key={snap.id}
            title={item?.name ?? `${snap.name} (deleted)`}
            className={cn("overflow-hidden rounded-xs ring-2 ring-paper", size === "sm" ? "size-8" : "size-11")}
          >
            {item ? <ItemImage item={item} /> : <div className="h-full w-full" style={{ background: colorHex(snap.mainColor) }} />}
          </div>
        );
      })}
    </div>
  );
}

function LookbookView() {
  const params = useSearchParams();
  const router = useRouter();
  const tabParam = params.get("tab") as Tab | null;
  const tab: Tab = tabParam && TABS.includes(tabParam) ? tabParam : "saved";
  const setTab = (t: Tab) => router.replace(`/lookbook?tab=${t}`, { scroll: false });

  const outfits = useWardrobe((s) => s.outfits);
  const wearLog = useWardrobe((s) => s.wearLog);
  const removeWear = useWardrobe((s) => s.removeWear);
  const wear = useWardrobe((s) => s.wear);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [day, setDay] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WearEntry | null>(null);
  const [logPicker, setLogPicker] = useState(false);

  const occOk = (o: Occasion) => !occasions.length || occasions.includes(o);
  const dateOk = (d: string) => (!from || d >= from) && (!to || d <= to);

  const saved = useMemo(
    () => Object.values(outfits).filter((o) => o.saved && occOk(o.occasion) && dateOk(o.createdAt.slice(0, 10))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outfits, occasions, from, to],
  );
  const entries = useMemo(() => wearLog.filter((w) => occOk(w.occasion) && dateOk(w.date)), [wearLog, occasions, from, to]); // eslint-disable-line react-hooks/exhaustive-deps
  const worn = useMemo(() => {
    const map = new Map<string, { count: number; last: string }>();
    for (const e of entries) {
      const m = map.get(e.outfitId);
      if (m) m.count++;
      else map.set(e.outfitId, { count: 1, last: e.date });
    }
    return [...map.entries()].filter(([id]) => outfits[id]).map(([id, v]) => ({ outfit: outfits[id], ...v }));
  }, [entries, outfits]);

  const byMonth = useMemo(() => {
    const groups = new Map<string, WearEntry[]>();
    for (const e of entries) {
      const k = e.date.slice(0, 7);
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    return [...groups.entries()];
  }, [entries]);

  const filtersActive = occasions.length > 0 || !!from || !!to;
  const today = todayKey();

  // Calendar grid (Monday first)
  const start = addDays(month, -((month.getDay() + 6) % 7));
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const byDay = new Map<string, WearEntry[]>();
  for (const e of entries) byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  const dayEntries = day ? (byDay.get(day) ?? []) : [];

  const savedForPicker = Object.values(outfits).filter((o) => o.saved || wearLog.some((w) => w.outfitId === o.id));

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader
        index="04"
        eyebrow={`${Object.values(outfits).filter((o) => o.saved).length} saved · ${wearLog.length} wears logged`}
        title="Lookbook"
        intro="Saved looks are ideas. Worn looks are history. Both teach the stylist what you actually reach for."
      />

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Segmented
            ariaLabel="Lookbook view"
            value={tab}
            onChange={setTab}
            options={[
              { value: "saved", label: "Saved", count: saved.length },
              { value: "worn", label: "Worn", count: worn.length },
              { value: "history", label: "History", count: entries.length },
              { value: "calendar", label: "Calendar" },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="From" htmlFor="lb-from" className="w-[9.5rem]">
            <Input id="lb-from" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To" htmlFor="lb-to" className="w-[9.5rem]">
            <Input id="lb-to" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Occasion filter">
        {OCCASIONS.map((o) => (
          <Chip key={o.id} size="sm" selected={occasions.includes(o.id)} onClick={() => setOccasions((x) => (x.includes(o.id) ? x.filter((y) => y !== o.id) : [...x, o.id]))}>
            {o.label}
          </Chip>
        ))}
        {filtersActive && (
          <button
            type="button"
            className="label ml-1 shrink-0 text-accent hover:underline"
            onClick={() => {
              setOccasions([]);
              setFrom("");
              setTo("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-8">
        {tab === "saved" &&
          (saved.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {saved.map((o) => (
                <OutfitTile key={o.id} outfit={o} meta={`${occasionLabel(o.occasion)} · saved ${formatDate(o.createdAt.slice(0, 10))}`} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={filtersActive ? "No saved looks match" : "No saved looks yet"}
              body={filtersActive ? "Try clearing the filters." : "Save outfits from the stylist to build your personal lookbook."}
              action={<ButtonLink href="/stylist">Open the stylist</ButtonLink>}
            />
          ))}

        {tab === "worn" &&
          (worn.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
              {worn.map((w) => (
                <OutfitTile key={w.outfit.id} outfit={w.outfit} meta={`Worn ${w.count}× · last ${formatDate(w.last)}`} />
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing worn in this range" body="When you wear a look, tap “Wear it” and it lands here." action={<ButtonLink href="/">Today’s outfit</ButtonLink>} />
          ))}

        {tab === "history" &&
          (byMonth.length ? (
            <div className="flex flex-col gap-10">
              {byMonth.map(([monthKey, list]) => (
                <section key={monthKey}>
                  <h2 className="display border-b border-ink pb-2 text-2xl">
                    {fromDateKey(`${monthKey}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    <span className="label ml-3 text-ink-3">{list.length} wears</span>
                  </h2>
                  <ol className="divide-y divide-line">
                    {list.map((e) => {
                      const exists = !!outfits[e.outfitId];
                      return (
                        <li key={e.id} className="grid grid-cols-[3.25rem_1fr_auto] items-center gap-3 py-3 sm:grid-cols-[4.5rem_1fr_auto_auto] sm:gap-5">
                          <div className="leading-none">
                            <span className="display block text-2xl tabular-nums">{fromDateKey(e.date).getDate()}</span>
                            <span className="label text-ink-3">{fromDateKey(e.date).toLocaleDateString("en-GB", { weekday: "short" })}</span>
                          </div>
                          <div className="min-w-0">
                            {exists ? (
                              <Link href={`/outfits/${e.outfitId}`} className="block truncate font-semibold hover:underline">
                                {e.outfitName}
                              </Link>
                            ) : (
                              <span className="block truncate font-semibold text-ink-3">{e.outfitName}</span>
                            )}
                            <span className="label text-ink-3">{occasionLabel(e.occasion)}</span>
                          </div>
                          <div className="hidden sm:block">
                            <EntryThumbs entry={e} />
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove wear of ${e.outfitName} on ${e.date}`}
                            onClick={() => setPendingDelete(e)}
                            className="flex size-9 items-center justify-center rounded-sm text-ink-3 hover:bg-ink/6 hover:text-accent"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState title="No history in this range" body="Log what you wear to see it here." />
          ))}

        {tab === "calendar" && (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              <div className="flex items-center justify-between border-b border-ink pb-3">
                <h2 className="display text-2xl">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
                <div className="flex gap-1">
                  <button type="button" aria-label="Previous month" className="flex size-9 items-center justify-center rounded-sm hover:bg-ink/6" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                    <ChevronLeft className="size-5" />
                  </button>
                  <button type="button" aria-label="Next month" className="flex size-9 items-center justify-center rounded-sm hover:bg-ink/6" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="label py-1 text-ink-3">
                    {d.slice(0, 1)}
                    <span className="hidden sm:inline">{d.slice(1)}</span>
                  </span>
                ))}
                {days.map((d) => {
                  const key = toDateKey(d);
                  const list = byDay.get(key) ?? [];
                  const inMonth = d.getMonth() === month.getMonth();
                  const isToday = key === today;
                  const selected = key === day;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDay(key)}
                      aria-label={`${formatDate(key, { day: "numeric", month: "long" })}${list.length ? `, ${list.length} outfit${list.length > 1 ? "s" : ""}` : ""}`}
                      aria-pressed={selected}
                      className={cn(
                        "relative flex aspect-square flex-col items-start overflow-hidden rounded-sm border p-1 text-left transition-colors sm:p-1.5",
                        inMonth ? "border-line" : "border-transparent opacity-40",
                        selected ? "border-ink bg-ink text-paper" : list.length ? "bg-paper-2 hover:border-ink" : "hover:border-ink",
                      )}
                    >
                      <span className={cn("text-xs font-semibold tabular-nums", isToday && !selected && "text-accent")}>{d.getDate()}</span>
                      {list.length > 0 && (
                        <span className="absolute inset-x-1 bottom-1 flex justify-center sm:inset-x-1.5 sm:bottom-1.5">
                          <span className="hidden sm:block">
                            <EntryThumbs entry={list[0]} size="sm" />
                          </span>
                          <span className={cn("block size-1.5 rounded-full sm:hidden", selected ? "bg-paper" : "bg-accent")} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <aside className="rounded-sm border border-ink p-5">
              {day ? (
                <>
                  <p className="label text-ink-3">{fromDateKey(day).toLocaleDateString("en-GB", { weekday: "long" })}</p>
                  <h3 className="display text-2xl">{formatDate(day, { day: "numeric", month: "long", year: "numeric" })}</h3>
                  {dayEntries.length ? (
                    <ul className="mt-4 flex flex-col gap-3">
                      {dayEntries.map((e) => (
                        <li key={e.id} className="flex items-center gap-3">
                          <EntryThumbs entry={e} />
                          <div className="min-w-0">
                            {outfits[e.outfitId] ? (
                              <Link href={`/outfits/${e.outfitId}`} className="block truncate font-semibold hover:underline">
                                {e.outfitName}
                              </Link>
                            ) : (
                              <span className="block truncate font-semibold">{e.outfitName}</span>
                            )}
                            <span className="label text-ink-3">{occasionLabel(e.occasion)}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-ink-3">Nothing logged for this day.</p>
                  )}
                  {day <= today && (
                    <Button className="mt-5" variant="secondary" size="sm" icon={<Plus className="size-3.5" />} onClick={() => setLogPicker(true)}>
                      Log an outfit
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="display text-2xl">Pick a day</h3>
                  <p className="mt-2 text-sm text-ink-3">See what you wore, or backfill a day you forgot to log.</p>
                </>
              )}
            </aside>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove this wear?"
        body="It will be removed from your history and stats. The outfit itself stays in your lookbook."
        confirmLabel="Remove"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeWear(pendingDelete.id);
          setPendingDelete(null);
          toast({ title: "Wear removed" });
        }}
      />

      <Modal open={logPicker} onClose={() => setLogPicker(false)} eyebrow={day ? formatDate(day, { day: "numeric", month: "long" }) : ""} title="Which outfit did you wear?" size="lg">
        {savedForPicker.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {savedForPicker.map((o) => (
              <button
                key={o.id}
                type="button"
                className="text-left"
                onClick={() => {
                  if (day && wear(o.id, day)) toast({ title: `Logged ${o.name}`, tone: "success" });
                  setLogPicker(false);
                }}
              >
                <OutfitTile outfit={o} static />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState compact title="No saved outfits" body="Save a look from the stylist first." />
        )}
      </Modal>
    </div>
  );
}

export default function LookbookPage() {
  return (
    <Suspense>
      <LookbookView />
    </Suspense>
  );
}
