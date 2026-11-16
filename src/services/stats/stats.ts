import type { Category, ColorId, Interaction, Occasion, Outfit, StyleTag, WardrobeItem, WearEntry } from "@/domain/types";
import { CATEGORIES, STYLES } from "@/domain/taxonomy";
import { addDays, daysBetween, fromDateKey, toDateKey } from "@/lib/util";
import { computeUsage, type ItemUsage } from "../usage";

export interface ItemUsageRow {
  item: WardrobeItem;
  count: number;
  lastWorn?: string;
}

export interface WardrobeStats {
  totalItems: number;
  availableItems: number;
  totalWears: number;
  wearsLast30: number;
  savedOutfits: number;
  likedOutfits: number;
  rejectedOutfits: number;
  suggestedOutfits: number;
  /** Share of items worn at least once in the last 90 days (0..1). */
  utilization: number;
  itemsWorn90: number;
  averageUsage: number;
  mostUsed: ItemUsageRow[];
  leastUsed: ItemUsageRow[];
  neverWorn: WardrobeItem[];
  colorShare: { color: ColorId; count: number }[];
  categoryShare: { category: Category; count: number; items: number }[];
  occasionShare: { occasion: Occasion; count: number }[];
  weekly: { weekStart: string; count: number }[];
  streak: number;
  interactionCounts: Record<Interaction["type"], number>;
}

export const computeStats = (
  items: WardrobeItem[],
  wearLog: WearEntry[],
  outfits: Outfit[],
  interactions: Interaction[],
  today: string,
): WardrobeStats => {
  const usage: Record<string, ItemUsage> = computeUsage(wearLog);
  const now = fromDateKey(today);
  const rows: ItemUsageRow[] = items.map((item) => ({ item, ...(usage[item.id] ?? { count: 0 }) }));
  const ninety = toDateKey(addDays(now, -90));
  const thirty = toDateKey(addDays(now, -30));
  const worn90 = new Set(wearLog.filter((w) => w.date >= ninety).flatMap((w) => w.itemIds));
  const itemsWorn90 = items.filter((i) => worn90.has(i.id)).length;

  const colorCount = new Map<ColorId, number>();
  const catCount = new Map<Category, number>();
  const occCount = new Map<Occasion, number>();
  const byId = new Map(items.map((i) => [i.id, i]));
  for (const w of wearLog) {
    occCount.set(w.occasion, (occCount.get(w.occasion) ?? 0) + 1);
    for (const snap of w.itemSnapshots) {
      const item = byId.get(snap.id);
      const color = item?.mainColor ?? snap.mainColor;
      const cat = item?.category ?? snap.category;
      colorCount.set(color, (colorCount.get(color) ?? 0) + 1);
      catCount.set(cat, (catCount.get(cat) ?? 0) + 1);
    }
  }

  // Weekly wear counts — last 8 weeks, Monday-based.
  const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
  const thisWeek = monday(now);
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const start = addDays(thisWeek, -7 * (7 - i));
    const end = toDateKey(addDays(start, 6));
    const s = toDateKey(start);
    return { weekStart: s, count: wearLog.filter((w) => w.date >= s && w.date <= end).length };
  });

  // Consecutive days (ending today or yesterday) with at least one logged outfit.
  const days = new Set(wearLog.map((w) => w.date));
  let streak = 0;
  let cursor = days.has(today) ? now : addDays(now, -1);
  while (days.has(toDateKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  const interactionCounts = interactions.reduce(
    (acc, i) => ((acc[i.type] = (acc[i.type] ?? 0) + 1), acc),
    {} as Record<Interaction["type"], number>,
  );

  const sortedRows = [...rows].sort((a, b) => b.count - a.count || a.item.name.localeCompare(b.item.name));
  return {
    totalItems: items.length,
    availableItems: items.filter((i) => i.availability === "available").length,
    totalWears: wearLog.length,
    wearsLast30: wearLog.filter((w) => w.date >= thirty).length,
    savedOutfits: outfits.filter((o) => o.saved).length,
    likedOutfits: outfits.filter((o) => o.liked).length,
    rejectedOutfits: outfits.filter((o) => o.rejected).length,
    suggestedOutfits: interactionCounts.suggested ?? 0,
    utilization: items.length ? itemsWorn90 / items.length : 0,
    itemsWorn90,
    averageUsage: items.length ? rows.reduce((a, r) => a + r.count, 0) / items.length : 0,
    mostUsed: sortedRows.filter((r) => r.count > 0).slice(0, 6),
    leastUsed: [...rows]
      .sort((a, b) => a.count - b.count || (a.lastWorn ?? "").localeCompare(b.lastWorn ?? "") || a.item.createdAt.localeCompare(b.item.createdAt))
      .slice(0, 6),
    neverWorn: rows.filter((r) => r.count === 0).map((r) => r.item),
    colorShare: [...colorCount.entries()].map(([color, count]) => ({ color, count })).sort((a, b) => b.count - a.count),
    categoryShare: CATEGORIES.map((c) => ({
      category: c.id,
      count: catCount.get(c.id) ?? 0,
      items: items.filter((i) => i.category === c.id).length,
    })),
    occasionShare: [...occCount.entries()].map(([occasion, count]) => ({ occasion, count })).sort((a, b) => b.count - a.count),
    weekly,
    streak,
    interactionCounts,
  };
};

/** Style DNA: blends wardrobe composition, what is actually worn, and learned feedback. */
export const computeStyleDNA = (
  items: WardrobeItem[],
  wearLog: WearEntry[],
  learned: Partial<Record<StyleTag, number>>,
): { style: StyleTag; share: number }[] => {
  const usage = computeUsage(wearLog);
  const score = new Map<StyleTag, number>();
  for (const item of items) {
    const worn = usage[item.id]?.count ?? 0;
    item.styles.forEach((s, idx) => {
      const w = (idx === 0 ? 1 : 0.6) * (1 + worn * 0.8);
      score.set(s, (score.get(s) ?? 0) + w);
    });
  }
  for (const s of STYLES) {
    const l = learned[s.id] ?? 0;
    score.set(s.id, Math.max(0, (score.get(s.id) ?? 0) * (1 + l * 0.6)));
  }
  const total = [...score.values()].reduce((a, b) => a + b, 0) || 1;
  return [...score.entries()]
    .map(([style, v]) => ({ style, share: v / total }))
    .sort((a, b) => b.share - a.share || a.style.localeCompare(b.style));
};

export const daysSince = (date: string | undefined, today: string) =>
  date ? daysBetween(fromDateKey(date), fromDateKey(today)) : null;
