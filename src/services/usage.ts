import type { WearEntry } from "@/domain/types";

export interface ItemUsage {
  count: number;
  lastWorn?: string; // YYYY-MM-DD
}

/** Item usage counters, derived from the wear log (single source of truth). */
export const computeUsage = (wearLog: WearEntry[]): Record<string, ItemUsage> => {
  const usage: Record<string, ItemUsage> = {};
  for (const entry of wearLog) {
    for (const id of entry.itemIds) {
      const u = (usage[id] ??= { count: 0 });
      u.count += 1;
      if (!u.lastWorn || entry.date > u.lastWorn) u.lastWorn = entry.date;
    }
  }
  return usage;
};
