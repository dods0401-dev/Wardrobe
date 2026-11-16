import type { Occasion, StyleTag } from "@/domain/types";

/** Scoring weights — must sum to 1. Tune here, or inject a custom config into the engine. */
export interface ScoringWeights {
  colorHarmony: number;
  styleConsistency: number;
  personalPreference: number;
  occasionFit: number;
  seasonFit: number;
  rotation: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  colorHarmony: 0.25,
  styleConsistency: 0.25,
  personalPreference: 0.2,
  occasionFit: 0.15,
  seasonFit: 0.1,
  rotation: 0.05,
};

export interface OccasionProfile {
  /** Target average formality (1–5). */
  formality: number;
  /** Hard floor for any clothing piece (shoes & garments). */
  minPieceFormality: number;
  /** Hard ceiling — avoids e.g. blazer + derbies for a streetwear brief. */
  maxPieceFormality: number;
  allowShorts: boolean;
  styleAffinity: Partial<Record<StyleTag, number>>;
}

export const OCCASION_PROFILES: Record<Occasion, OccasionProfile> = {
  casual: {
    formality: 2.2,
    minPieceFormality: 1,
    maxPieceFormality: 4.6,
    allowShorts: true,
    styleAffinity: { casual: 1, minimal: 0.8, vintage: 0.8, streetwear: 0.7, contemporary: 0.7, sporty: 0.6, "smart-casual": 0.5 },
  },
  work: {
    formality: 3.8,
    minPieceFormality: 2,
    maxPieceFormality: 5,
    allowShorts: false,
    styleAffinity: { "smart-casual": 1, minimal: 0.9, contemporary: 0.8, vintage: 0.5, casual: 0.4, streetwear: 0.1, sporty: 0 },
  },
  "smart-casual": {
    formality: 3.5,
    minPieceFormality: 2,
    maxPieceFormality: 5,
    allowShorts: false,
    styleAffinity: { "smart-casual": 1, contemporary: 0.9, minimal: 0.85, vintage: 0.65, casual: 0.45, streetwear: 0.2, sporty: 0.1 },
  },
  streetwear: {
    formality: 1.8,
    minPieceFormality: 1,
    maxPieceFormality: 4,
    allowShorts: true,
    styleAffinity: { streetwear: 1, sporty: 0.8, vintage: 0.7, casual: 0.6, contemporary: 0.6, minimal: 0.5, "smart-casual": 0.15 },
  },
  evening: {
    formality: 3.7,
    minPieceFormality: 1.5,
    maxPieceFormality: 5,
    allowShorts: false,
    styleAffinity: { contemporary: 1, minimal: 0.9, "smart-casual": 0.85, vintage: 0.6, streetwear: 0.45, casual: 0.3, sporty: 0.05 },
  },
  special: {
    formality: 4.3,
    minPieceFormality: 2.5,
    maxPieceFormality: 5,
    allowShorts: false,
    styleAffinity: { "smart-casual": 1, contemporary: 0.95, minimal: 0.9, vintage: 0.4, casual: 0.15, streetwear: 0.05, sporty: 0 },
  },
  weekend: {
    formality: 1.9,
    minPieceFormality: 1,
    maxPieceFormality: 4.2,
    allowShorts: true,
    styleAffinity: { casual: 1, vintage: 0.85, streetwear: 0.75, sporty: 0.75, minimal: 0.7, contemporary: 0.6, "smart-casual": 0.4 },
  },
};

/** Pairwise style compatibility (symmetric). */
const PAIRS: [StyleTag, StyleTag, number][] = [
  ["streetwear", "casual", 0.8],
  ["streetwear", "minimal", 0.65],
  ["streetwear", "vintage", 0.75],
  ["streetwear", "smart-casual", 0.25],
  ["streetwear", "contemporary", 0.7],
  ["streetwear", "sporty", 0.9],
  ["casual", "minimal", 0.8],
  ["casual", "vintage", 0.85],
  ["casual", "smart-casual", 0.6],
  ["casual", "contemporary", 0.7],
  ["casual", "sporty", 0.7],
  ["minimal", "vintage", 0.6],
  ["minimal", "smart-casual", 0.85],
  ["minimal", "contemporary", 0.9],
  ["minimal", "sporty", 0.45],
  ["vintage", "smart-casual", 0.65],
  ["vintage", "contemporary", 0.6],
  ["vintage", "sporty", 0.45],
  ["smart-casual", "contemporary", 0.85],
  ["smart-casual", "sporty", 0.1],
  ["contemporary", "sporty", 0.5],
];

export const styleCompat = (a: StyleTag, b: StyleTag): number => {
  if (a === b) return 1;
  const p = PAIRS.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return p ? p[2] : 0.4;
};

/** Candidate pool sizes per slot — keeps enumeration bounded and fast. */
export const POOL_SIZES = { base: 10, layer: 5, outerwear: 5, bottom: 7, shoes: 5, accessory: 4 };
