import type {
  ColorId,
  OutfitPiece,
  ScoreBreakdown,
  Season,
  StylistRequest,
  UserProfile,
  WardrobeItem,
} from "@/domain/types";
import { colorDef } from "@/domain/taxonomy";
import { shapeDef } from "@/domain/garments";
import { clamp, daysBetween, fromDateKey } from "@/lib/util";
import type { ItemUsage } from "../usage";
import { DEFAULT_WEIGHTS, OCCASION_PROFILES, styleCompat, type ScoringWeights } from "./config";
import type { ParsedInstructions } from "./instructions";

export interface ScoringContext {
  profile: UserProfile;
  request: StylistRequest;
  parsed: ParsedInstructions;
  usage: Record<string, ItemUsage>;
  today: string;
  maxUsage: number;
}

export interface ScoredPiece {
  piece: OutfitPiece;
  item: WardrobeItem;
}

type Scorer = (pieces: ScoredPiece[], ctx: ScoringContext) => number;

const LOUD_PATTERNS = new Set(["graphic", "check", "stripe", "camo"]);

const luminance = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const clothing = (pieces: ScoredPiece[]) => pieces.filter((p) => p.piece.slot !== "accessory");

/* ───────────────────────────── 1. COLOR HARMONY ───────────────────────────── */

export const colorHarmony: Scorer = (pieces, ctx) => {
  const wear = clothing(pieces);
  const mains = wear.map((p) => p.item.mainColor);
  const accents = Array.from(new Set(mains.filter((c) => !colorDef(c).neutral)));
  const earthy = accents.filter((c) => colorDef(c).earthy);
  const bright = accents.filter((c) => !colorDef(c).earthy);

  let score: number;
  if (accents.length === 0) {
    // All-neutral: reward light/dark contrast, but tonal is also a deliberate look.
    const lum = mains.map((c) => luminance(colorDef(c).hex));
    const spread = Math.max(...lum) - Math.min(...lum);
    score = 0.78 + (ctx.parsed.tonal ? 0.17 : spread > 0.4 ? 0.12 : 0.06);
  } else if (accents.length === 1) {
    score = ctx.parsed.colourPop && bright.length === 1 ? 1 : 0.95;
  } else if (accents.length === 2) {
    const [a, b] = accents.map((c) => colorDef(c).hue ?? 0);
    const dist = hueDistance(a, b);
    if (earthy.length === 2) score = 0.86; // earthy tones sit together
    else if (dist <= 45) score = 0.82; // analogous
    else if (dist >= 150) score = 0.72; // complementary
    else score = 0.5;
  } else {
    score = earthy.length === accents.length ? 0.6 : 0.3;
  }

  // Secondary colours: clashing bright secondaries reduce harmony slightly.
  const secondaryBright = new Set(
    wear.flatMap((p) => p.item.secondaryColors).filter((c) => !colorDef(c).neutral && !colorDef(c).earthy),
  );
  for (const c of secondaryBright) {
    if (!accents.includes(c) && accents.length >= 1) score -= 0.04;
  }

  // Pattern clash: more than one loud pattern.
  const loud = wear.filter((p) => LOUD_PATTERNS.has(p.item.pattern)).length;
  if (loud > 1) score -= 0.22 * (loud - 1);

  // Monochrome repetition of the exact same colour on 3+ pieces — fine, but flat unless asked.
  const counts = new Map<ColorId, number>();
  mains.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1));
  const maxSame = Math.max(...counts.values());
  if (maxSame >= 4 && !ctx.parsed.tonal) score -= 0.08;

  if (ctx.parsed.tonal && accents.length > 1) score -= 0.15;

  return clamp(score);
};

/* ─────────────────────────── 2. STYLE CONSISTENCY ─────────────────────────── */

const bestCompat = (a: WardrobeItem, b: WardrobeItem) => {
  let best = 0;
  for (const x of a.styles) for (const y of b.styles) best = Math.max(best, styleCompat(x, y));
  return best;
};

export const styleConsistency: Scorer = (pieces, ctx) => {
  const items = pieces.map((p) => p.item);
  let pairSum = 0;
  let pairs = 0;
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++) {
      pairSum += bestCompat(items[i], items[j]);
      pairs++;
    }
  const cohesion = pairs ? pairSum / pairs : 1;

  const targets = [...ctx.request.styles, ...ctx.parsed.boostStyles];
  let alignment: number;
  if (targets.length) {
    alignment =
      items.reduce((acc, it) => {
        let best = 0;
        for (const s of it.styles) for (const t of targets) best = Math.max(best, styleCompat(s, t));
        return acc + best;
      }, 0) / items.length;
  } else {
    const aff = OCCASION_PROFILES[ctx.request.occasion].styleAffinity;
    alignment =
      items.reduce((acc, it) => acc + Math.max(...it.styles.map((s) => aff[s] ?? 0.3)), 0) / items.length;
  }
  return clamp(0.55 * cohesion + 0.45 * alignment);
};

/* ────────────────────────── 3. PERSONAL PREFERENCE ────────────────────────── */

export const itemPreference = (item: WardrobeItem, ctx: ScoringContext): number => {
  const { profile, request, parsed } = ctx;
  const L = profile.learned;
  let s = 0.5;
  const colors = [item.mainColor, ...item.secondaryColors];
  if (profile.preferredColors.includes(item.mainColor)) s += 0.12;
  if (request.preferredColors.includes(item.mainColor)) s += 0.2;
  else if (item.secondaryColors.some((c) => request.preferredColors.includes(c))) s += 0.08;
  if (parsed.boostColors.includes(item.mainColor)) s += 0.18;
  if (profile.avoidedColors.includes(item.mainColor)) s -= 0.35;
  else if (item.secondaryColors.some((c) => profile.avoidedColors.includes(c))) s -= 0.12;
  if (colors.some((c) => parsed.avoidColors.includes(c))) s -= 0.4;
  if (item.fit && profile.preferredFits.includes(item.fit)) s += 0.08;
  if (item.fit && parsed.boostFits.includes(item.fit)) s += 0.12;
  if (profile.favoriteCategories.includes(item.category)) s += 0.05;
  if (item.styles.some((st) => profile.styles.includes(st))) s += 0.07;
  if (item.favorite) s += 0.06;
  if (parsed.requireShapes.includes(item.shape)) s += 0.25;
  if (parsed.avoidShapes.includes(item.shape)) s -= 0.6;
  // Learned feedback (progressive personalisation).
  if (item.fit) s += 0.12 * (L.fit[item.fit] ?? 0);
  s += 0.1 * (L.color[item.mainColor] ?? 0);
  s += 0.1 * Math.max(0, ...item.styles.map((st) => L.style[st] ?? 0)) + 0.05 * Math.min(0, ...item.styles.map((st) => L.style[st] ?? 0));
  s += 0.15 * (L.item[item.id] ?? 0);
  return clamp(s);
};

export const personalPreference: Scorer = (pieces, ctx) =>
  pieces.reduce((acc, p) => acc + itemPreference(p.item, ctx), 0) / pieces.length;

/* ─────────────────────────── 4. OCCASION SUITABILITY ───────────────────────── */

export const occasionFit: Scorer = (pieces, ctx) => {
  const prof = OCCASION_PROFILES[ctx.request.occasion];
  const wear = clothing(pieces);
  let target = prof.formality;
  if (ctx.parsed.sharper) target += 0.5;
  if (ctx.parsed.relaxed) target -= 0.3;
  const avg = wear.reduce((a, p) => a + p.item.formality, 0) / wear.length;
  const formalityScore = clamp(1 - Math.abs(avg - target) / 2.2);
  const affinity =
    wear.reduce((a, p) => a + Math.max(...p.item.styles.map((s) => prof.styleAffinity[s] ?? 0.3)), 0) / wear.length;
  return clamp(0.6 * formalityScore + 0.4 * affinity);
};

/* ──────────────────────────── 5. SEASON / WEATHER ─────────────────────────── */

const NEIGHBOURS: Record<Season, Season[]> = {
  spring: ["winter", "summer"],
  summer: ["spring", "autumn"],
  autumn: ["summer", "winter"],
  winter: ["autumn", "spring"],
};

export const itemSeasonScore = (item: WardrobeItem, season: Season): number => {
  if (item.seasons.includes(season)) return 1;
  if (item.seasons.some((s) => NEIGHBOURS[season].includes(s))) return 0.4;
  return 0;
};

export const seasonFit: Scorer = (pieces, ctx) => {
  const season = ctx.request.season;
  const base = pieces.reduce((a, p) => a + itemSeasonScore(p.item, season), 0) / pieces.length;
  const warmth = pieces.reduce((a, p) => a + shapeDef(p.item.shape).warmth, 0);
  const hasOuter = pieces.some((p) => p.piece.slot === "outerwear");
  const hasLayer = pieces.some((p) => p.piece.slot === "layer");
  let target = { winter: 6, autumn: 4, spring: 3, summer: 1.5 }[season];
  if (ctx.parsed.warmer) target += 1.5;
  if (ctx.parsed.lighter) target -= 1.5;
  const warmthScore = clamp(1 - Math.abs(warmth - target) / 5);
  let s = 0.65 * base + 0.35 * warmthScore;
  if (season === "winter" && !hasOuter) s *= 0.75;
  if (season === "autumn" && !hasOuter && !hasLayer) s *= 0.9;
  if (ctx.parsed.layered && (hasLayer || hasOuter)) s = Math.min(1, s + 0.08);
  return clamp(s);
};

/* ───────────────────────────── 6. WARDROBE ROTATION ───────────────────────── */

export const itemRotation = (item: WardrobeItem, ctx: ScoringContext): number => {
  const u = ctx.usage[item.id];
  if (!u || !u.count) return 1;
  const freq = 1 - u.count / Math.max(ctx.maxUsage, 1);
  const since = u.lastWorn ? daysBetween(fromDateKey(u.lastWorn), fromDateKey(ctx.today)) : 60;
  return clamp(0.5 * freq + 0.5 * clamp(since / 21));
};

export const rotation: Scorer = (pieces, ctx) =>
  pieces.reduce((a, p) => a + itemRotation(p.item, ctx), 0) / pieces.length;

/* ───────────────────────────────── COMPOSITE ──────────────────────────────── */

export const SCORERS: Record<keyof ScoreBreakdown, Scorer> = {
  colorHarmony,
  styleConsistency,
  personalPreference,
  occasionFit,
  seasonFit,
  rotation,
};

export const scorePieces = (
  pieces: ScoredPiece[],
  ctx: ScoringContext,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): { score: number; breakdown: ScoreBreakdown } => {
  const breakdown = {} as ScoreBreakdown;
  let total = 0;
  for (const key of Object.keys(SCORERS) as (keyof ScoreBreakdown)[]) {
    const v = SCORERS[key](pieces, ctx);
    breakdown[key] = Math.round(v * 1000) / 1000;
    total += v * weights[key];
  }
  // Instruction requirements: if the brief asks for a garment, outfits without it are demoted.
  if (ctx.parsed.requireShapes.length) {
    const has = pieces.some((p) => ctx.parsed.requireShapes.includes(p.item.shape));
    if (!has) total *= 0.88;
  }
  return { score: Math.round(total * 1000) / 10, breakdown };
};
