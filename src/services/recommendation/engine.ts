import type {
  Occasion,
  Outfit,
  OutfitPiece,
  OutfitSlot,
  StyleTag,
  StylistRequest,
  UserProfile,
  WardrobeItem,
  WearEntry,
} from "@/domain/types";
import { canLayer, shapeDef, slotsForItem } from "@/domain/garments";
import { SLOT_ORDER } from "@/domain/taxonomy";
import { hashId } from "@/lib/util";
import { computeUsage } from "../usage";
import { DEFAULT_WEIGHTS, OCCASION_PROFILES, POOL_SIZES, styleCompat, type ScoringWeights } from "./config";
import { buildRationale, describeOutfit, dominantStyle, outfitName } from "./explain";
import { parseInstructions, type ParsedInstructions } from "./instructions";
import {
  itemPreference,
  itemSeasonScore,
  scorePieces,
  type ScoredPiece,
  type ScoringContext,
} from "./scoring";

export interface EngineInput {
  items: WardrobeItem[];
  profile: UserProfile;
  wearLog: WearEntry[];
  request: StylistRequest;
  /** YYYY-MM-DD — injected so results are reproducible. */
  today: string;
  sessionId: string;
  /** Outfit signatures that must not be returned (rejected, or already shown in this session). */
  avoidSignatures?: string[];
}

export type GeneratedOutfit = Omit<Outfit, "saved" | "liked" | "rejected">;

export interface EngineResult {
  outfits: GeneratedOutfit[];
  parsed: ParsedInstructions;
  evaluated: number;
  /** Explains why fewer outfits than requested came back, if so. */
  shortfall?: string;
}

/** The contract a production recommender would implement. */
export interface RecommendationEngine {
  generate(input: EngineInput): EngineResult;
  alternatives(input: AlternativesInput): Alternative[];
  rescore(input: RescoreInput): Pick<Outfit, "score" | "breakdown" | "rationale" | "description">;
}

export const signatureOf = (pieces: OutfitPiece[]) =>
  pieces
    .map((p) => p.itemId)
    .sort()
    .join("|");

export const outfitIdFor = (pieces: OutfitPiece[]) => hashId("out", signatureOf(pieces));

/* ───────────────────────────── eligibility ───────────────────────────── */

const isEligible = (
  item: WardrobeItem,
  slot: OutfitSlot,
  request: StylistRequest,
  parsed: ParsedInstructions,
  opts: { ignoreAvailability?: boolean } = {},
): boolean => {
  if (!opts.ignoreAvailability && item.availability !== "available") return false;
  if (request.excludedItemIds.includes(item.id)) return false;
  if (parsed.avoidShapes.includes(item.shape)) return false;
  const season = itemSeasonScore(item, request.season);
  if (season === 0) return false;
  const strictSeason =
    item.category === "shorts" ||
    item.category === "outerwear" ||
    item.category === "accessory" ||
    shapeDef(item.shape).warmth >= 2;
  if (strictSeason && season < 1) return false;
  const occ = OCCASION_PROFILES[request.occasion];
  if (item.category === "shorts" && !occ.allowShorts) return false;
  if (slot !== "accessory") {
    if (item.formality < occ.minPieceFormality || item.formality > occ.maxPieceFormality) return false;
  }
  return true;
};

const itemPoolScore = (item: WardrobeItem, ctx: ScoringContext): number => {
  const occ = OCCASION_PROFILES[ctx.request.occasion];
  const aff = Math.max(...item.styles.map((s) => occ.styleAffinity[s] ?? 0.3));
  const formality = 1 - Math.min(1, Math.abs(item.formality - occ.formality) / 3);
  const targets = [...ctx.request.styles, ...ctx.parsed.boostStyles];
  const align = targets.length
    ? Math.max(...item.styles.flatMap((s) => targets.map((t) => styleCompat(s, t))))
    : aff;
  return (
    0.32 * itemPreference(item, ctx) +
    0.18 * aff +
    0.12 * formality +
    0.2 * itemSeasonScore(item, ctx.request.season) +
    0.18 * align
  );
};

const buildContext = (
  profile: UserProfile,
  request: StylistRequest,
  wearLog: WearEntry[],
  today: string,
): ScoringContext => {
  const usage = computeUsage(wearLog);
  const maxUsage = Math.max(1, ...Object.values(usage).map((u) => u.count));
  return { profile, request, parsed: parseInstructions(request.instructions), usage, today, maxUsage };
};

const toScored = (pieces: OutfitPiece[], byId: Map<string, WardrobeItem>): ScoredPiece[] =>
  pieces
    .map((piece) => ({ piece, item: byId.get(piece.itemId)! }))
    .filter((p) => p.item)
    .sort((a, b) => SLOT_ORDER.indexOf(a.piece.slot) - SLOT_ORDER.indexOf(b.piece.slot));

/** Structural sanity rules beyond single-item eligibility. */
const isCoherent = (pieces: ScoredPiece[]): boolean => {
  const get = (s: OutfitSlot) => pieces.find((p) => p.piece.slot === s)?.item;
  const bottom = get("bottom");
  const shoes = get("shoes");
  const outer = get("outerwear");
  const base = get("base");
  const layer = get("layer");
  if (bottom?.category === "shorts") {
    if (outer && shapeDef(outer.shape).warmth >= 2) return false;
    if (shoes && (shoes.shape === "boot" || shoes.shape === "derby")) return false;
    if (layer && shapeDef(layer.shape).warmth >= 2) return false;
  }
  // Puffers and coats over a tank top read as a mistake.
  if (outer && base?.shape === "tank") return false;
  // Hood under a tailored coat/blazer is a deliberate street look — only when the brief is not formal.
  return true;
};

/* ─────────────────────────────── generate ─────────────────────────────── */

const generate = (input: EngineInput, weights: ScoringWeights = DEFAULT_WEIGHTS): EngineResult => {
  const { items, profile, wearLog, request, today, sessionId } = input;
  const ctx = buildContext(profile, request, wearLog, today);
  const parsed = ctx.parsed;
  const byId = new Map(items.map((i) => [i.id, i]));
  const avoid = new Set(input.avoidSignatures ?? []);

  // 1. Build ranked candidate pools per slot from the real wardrobe.
  const pools: Record<OutfitSlot, WardrobeItem[]> = {
    base: [],
    layer: [],
    outerwear: [],
    bottom: [],
    shoes: [],
    accessory: [],
  };
  const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));
  for (const item of sortedItems)
    for (const slot of slotsForItem(item)) if (isEligible(item, slot, request, parsed)) pools[slot].push(item);
  for (const slot of Object.keys(pools) as OutfitSlot[]) {
    const scored = pools[slot]
      .map((it) => ({ it, s: itemPoolScore(it, ctx) }))
      .sort((a, b) => b.s - a.s || a.it.id.localeCompare(b.it.id));
    // Required garments from the brief are always kept in the pool.
    const required = scored.filter((x) => parsed.requireShapes.includes(x.it.shape));
    const top = scored.slice(0, POOL_SIZES[slot]);
    pools[slot] = Array.from(new Set([...top, ...required].map((x) => x.it)));
  }

  // Anchors: lock the slot to the anchored piece.
  const anchoredSlots = new Set<OutfitSlot>();
  for (const id of request.anchorItemIds ?? []) {
    const item = byId.get(id);
    if (!item || item.availability !== "available") continue;
    const slots = slotsForItem(item);
    const slot = slots.includes("base") ? "base" : slots[0];
    pools[slot] = [item];
    anchoredSlots.add(slot);
    if (slot === "layer") pools.base = pools.base.filter((b) => canLayer(b, item));
  }

  const missing = (["base", "bottom", "shoes"] as OutfitSlot[]).filter((s) => pools[s].length === 0);
  if (missing.length) {
    return {
      outfits: [],
      parsed,
      evaluated: 0,
      shortfall: `No available ${missing.join(", ")} match this brief. Try another occasion or season, or check items marked as unavailable.`,
    };
  }

  // 2. Enumerate valid combinations and score them.
  type Candidate = { pieces: OutfitPiece[]; scored: ScoredPiece[]; score: number; sig: string };
  const candidates: Candidate[] = [];
  let evaluated = 0;
  const outerOptions: (WardrobeItem | null)[] = anchoredSlots.has("outerwear") ? pools.outerwear : [null, ...pools.outerwear];
  for (const base of pools.base) {
    const layers = pools.layer.filter((l) => canLayer(base, l));
    const layerOptions: (WardrobeItem | null)[] = anchoredSlots.has("layer") ? layers : [null, ...layers];
    for (const layer of layerOptions) {
      for (const outer of outerOptions) {
        for (const bottom of pools.bottom) {
          for (const shoes of pools.shoes) {
            const pieces: OutfitPiece[] = [{ slot: "base", itemId: base.id }];
            if (layer) pieces.push({ slot: "layer", itemId: layer.id });
            if (outer) pieces.push({ slot: "outerwear", itemId: outer.id });
            pieces.push({ slot: "bottom", itemId: bottom.id }, { slot: "shoes", itemId: shoes.id });
            const scored = toScored(pieces, byId);
            if (!isCoherent(scored)) continue;
            evaluated++;
            const { score } = scorePieces(scored, ctx, weights);
            candidates.push({ pieces, scored, score, sig: signatureOf(pieces) });
          }
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score || a.sig.localeCompare(b.sig));

  const head = candidates.slice(0, 400);

  // 4. Diversity-aware selection (greedy, with progressively relaxed overlap limits).
  const target = Math.max(1, Math.min(5, request.count));
  const picked: Candidate[] = [];
  const core = (c: Candidate) => c.pieces.filter((p) => p.slot !== "accessory").map((p) => p.itemId);
  const passes = [
    { maxShared: 1, uniqueBase: true, uniqueBottom: true },
    { maxShared: 2, uniqueBase: true, uniqueBottom: false },
    { maxShared: 3, uniqueBase: false, uniqueBottom: false },
  ];
  const coreSig = (c: Candidate) => core(c).sort().join("|");
  const avoidCore = new Set([...avoid].map((s) => s.split("|").filter((id) => byId.get(id)?.category !== "accessory").sort().join("|")));
  for (const pass of passes) {
    for (const c of head) {
      if (picked.length >= target) break;
      if (picked.includes(c) || avoid.has(c.sig) || avoidCore.has(coreSig(c))) continue;
      const ids = core(c);
      const base = c.pieces.find((p) => p.slot === "base")!.itemId;
      const bottom = c.pieces.find((p) => p.slot === "bottom")!.itemId;
      const ok = picked.every((p) => {
        const shared = core(p).filter((id) => ids.includes(id)).length;
        if (shared > pass.maxShared) return false;
        if (pass.uniqueBase && p.pieces.find((x) => x.slot === "base")!.itemId === base) return false;
        if (pass.uniqueBottom && p.pieces.find((x) => x.slot === "bottom")!.itemId === bottom) return false;
        return true;
      });
      if (ok) picked.push(c);
    }
  }

  // 3. Accessories: finish each picked look, preferring accessories not already used in this batch.
  const anchoredAcc = (request.anchorItemIds ?? []).some((id) => byId.get(id)?.category === "accessory");
  if ((request.includeAccessory || anchoredAcc) && pools.accessory.length) {
    const used = new Set<string>();
    for (const c of picked) {
      let best: { item: WardrobeItem; score: number; eff: number } | null = null;
      for (const acc of pools.accessory) {
        const pieces = [...c.pieces, { slot: "accessory" as const, itemId: acc.id }];
        const { score } = scorePieces(toScored(pieces, byId), ctx, weights);
        evaluated++;
        const eff = score - (used.has(acc.id) ? 2 : 0);
        if (!best || eff > best.eff) best = { item: acc, score, eff };
      }
      if (best && (anchoredAcc || best.eff >= c.score - 1.5) && !avoid.has(signatureOf([...c.pieces, { slot: "accessory", itemId: best.item.id }]))) {
        used.add(best.item.id);
        c.pieces = [...c.pieces, { slot: "accessory", itemId: best.item.id }];
        c.scored = toScored(c.pieces, byId);
        c.score = best.score;
        c.sig = signatureOf(c.pieces);
      }
    }
  }

  // Present best-first.
  picked.sort((a, b) => b.score - a.score || a.sig.localeCompare(b.sig));

  const createdAt = `${today}T12:00:00.000Z`;
  const usedNames = new Set<string>();
  const outfits: GeneratedOutfit[] = picked.map((c) => {
    const { score, breakdown } = scorePieces(c.scored, ctx, weights);
    const style = dominantStyle(c.scored, [...request.styles, ...parsed.boostStyles], request.occasion);
    const name = outfitName(style, c.sig, usedNames);
    usedNames.add(name);
    return {
      id: outfitIdFor(c.pieces),
      name,
      pieces: c.scored.map((s) => s.piece),
      occasion: request.occasion,
      style,
      description: describeOutfit(c.scored),
      rationale: buildRationale(c.scored, breakdown, ctx),
      score,
      breakdown,
      createdAt,
      sessionId,
      source: "stylist",
    };
  });

  return {
    outfits,
    parsed,
    evaluated,
    shortfall:
      outfits.length < target
        ? `Only ${outfits.length} distinct outfit${outfits.length === 1 ? "" : "s"} could be built without repeating looks. Add more pieces or loosen the brief.`
        : undefined,
  };
};

/* ────────────────────────────── alternatives ────────────────────────────── */

export interface AlternativesInput {
  items: WardrobeItem[];
  profile: UserProfile;
  wearLog: WearEntry[];
  outfit: Pick<Outfit, "pieces" | "occasion" | "style">;
  slot: OutfitSlot;
  today: string;
  season: StylistRequest["season"];
  limit?: number;
}

export interface Alternative {
  item: WardrobeItem;
  score: number;
  delta: number;
}

export const requestForOutfit = (
  outfit: { occasion: Occasion; style: StyleTag },
  season: StylistRequest["season"],
): StylistRequest => ({
  occasion: outfit.occasion,
  styles: [outfit.style],
  instructions: "",
  preferredColors: [],
  excludedItemIds: [],
  count: 3,
  season,
  includeAccessory: true,
});

const alternatives = (input: AlternativesInput, weights: ScoringWeights = DEFAULT_WEIGHTS): Alternative[] => {
  const { items, profile, wearLog, outfit, slot, today, season } = input;
  const request = requestForOutfit(outfit, season);
  const ctx = buildContext(profile, request, wearLog, today);
  const byId = new Map(items.map((i) => [i.id, i]));
  const current = toScored(outfit.pieces, byId);
  const currentScore = scorePieces(current, ctx, weights).score;
  const currentId = outfit.pieces.find((p) => p.slot === slot)?.itemId;
  const usedIds = new Set(outfit.pieces.map((p) => p.itemId));
  const base = current.find((p) => p.piece.slot === "base")?.item;
  const layer = current.find((p) => p.piece.slot === "layer")?.item;

  const out: Alternative[] = [];
  for (const item of [...items].sort((a, b) => a.id.localeCompare(b.id))) {
    if (item.id === currentId || usedIds.has(item.id)) continue;
    if (!slotsForItem(item).includes(slot)) continue;
    if (item.availability !== "available") continue;
    if (itemSeasonScore(item, season) === 0) continue;
    if (slot === "layer" && base && !canLayer(base, item)) continue;
    if (slot === "base" && layer && !canLayer(item, layer)) continue;
    const pieces = outfit.pieces.map((p) => (p.slot === slot ? { slot, itemId: item.id } : p));
    const scored = toScored(pieces, byId);
    if (!isCoherent(scored)) continue;
    const { score } = scorePieces(scored, ctx, weights);
    out.push({ item, score, delta: Math.round((score - currentScore) * 10) / 10 });
  }
  return out.sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id)).slice(0, input.limit ?? 8);
};

/* ──────────────────────────────── rescore ──────────────────────────────── */

export interface RescoreInput {
  items: WardrobeItem[];
  profile: UserProfile;
  wearLog: WearEntry[];
  outfit: Pick<Outfit, "pieces" | "occasion" | "style">;
  today: string;
  season: StylistRequest["season"];
}

const rescore = (input: RescoreInput, weights: ScoringWeights = DEFAULT_WEIGHTS) => {
  const request = requestForOutfit(input.outfit, input.season);
  const ctx = buildContext(input.profile, request, input.wearLog, input.today);
  const byId = new Map(input.items.map((i) => [i.id, i]));
  const scored = toScored(input.outfit.pieces, byId);
  const { score, breakdown } = scorePieces(scored, ctx, weights);
  return { score, breakdown, rationale: buildRationale(scored, breakdown, ctx), description: describeOutfit(scored) };
};

/** Factory: a rule-based engine with configurable weights. */
export const createRuleBasedEngine = (weights: ScoringWeights = DEFAULT_WEIGHTS): RecommendationEngine => ({
  generate: (input) => generate(input, weights),
  alternatives: (input) => alternatives(input, weights),
  rescore: (input) => rescore(input, weights),
});

export const ruleBasedEngine = createRuleBasedEngine();
