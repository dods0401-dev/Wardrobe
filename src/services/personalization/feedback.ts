import type { LearnedPreferences, WardrobeItem } from "@/domain/types";
import { clamp } from "@/lib/util";

/**
 * Progressive personalisation: each signal nudges learned affinities for the
 * fits, colours, styles and items involved. Values are clamped to [-1, 1] and
 * consumed by the recommendation engine's preference scorer.
 */
export const SIGNAL_WEIGHTS = {
  liked: 0.12,
  unliked: -0.12,
  saved: 0.08,
  unsaved: -0.08,
  worn: 0.15,
  rejected: -0.12,
  replaced_out: -0.1,
  replaced_in: 0.1,
} as const;

export type Signal = keyof typeof SIGNAL_WEIGHTS;

const bump = <K extends string>(rec: Partial<Record<K, number>>, key: K, delta: number) => {
  rec[key] = Math.round(clamp((rec[key] ?? 0) + delta, -1, 1) * 1000) / 1000;
};

export const applyFeedback = (
  learned: LearnedPreferences,
  items: WardrobeItem[],
  signal: Signal,
): LearnedPreferences => {
  const w = SIGNAL_WEIGHTS[signal];
  const next: LearnedPreferences = {
    fit: { ...learned.fit },
    color: { ...learned.color },
    style: { ...learned.style },
    item: { ...learned.item },
  };
  for (const item of items) {
    if (item.fit) bump(next.fit, item.fit, w * 0.6);
    bump(next.color, item.mainColor, w * 0.4);
    if (item.styles[0]) bump(next.style, item.styles[0], w * 0.35);
    bump(next.item, item.id, w);
  }
  return next;
};

export const EMPTY_LEARNED: LearnedPreferences = { fit: {}, color: {}, style: {}, item: {} };
