import { describe, expect, it } from "vitest";
import { SEED_ITEMS } from "@/data/seedItems";
import { SEED_PROFILE, buildSeedHistory } from "@/data/seedProfile";
import type { StylistRequest } from "@/domain/types";
import { canLayer } from "@/domain/garments";
import { ruleBasedEngine, signatureOf } from "./engine";
import { parseInstructions } from "./instructions";

const NOW = new Date(2026, 10, 16);
const history = buildSeedHistory(SEED_ITEMS, SEED_PROFILE, NOW);
const base: StylistRequest = {
  occasion: "casual",
  styles: [],
  instructions: "",
  preferredColors: [],
  excludedItemIds: [],
  count: 4,
  season: "autumn",
  includeAccessory: true,
};
const run = (req: Partial<StylistRequest> = {}, extra: { avoid?: string[]; items?: typeof SEED_ITEMS } = {}) =>
  ruleBasedEngine.generate({
    items: extra.items ?? SEED_ITEMS,
    profile: SEED_PROFILE,
    wearLog: history.wearLog,
    request: { ...base, ...req },
    today: "2026-11-16",
    sessionId: "s1",
    avoidSignatures: extra.avoid,
  });

const byId = new Map(SEED_ITEMS.map((i) => [i.id, i]));

describe("rule-based engine", () => {
  it("is deterministic for identical inputs", () => {
    expect(run().outfits).toEqual(run().outfits);
  });

  it("returns the requested number of outfits for every occasion", () => {
    for (const occasion of ["casual", "work", "smart-casual", "streetwear", "evening", "special", "weekend"] as const) {
      const r = run({ occasion, count: 3 });
      expect(r.outfits.length, occasion).toBe(3);
    }
  });

  it("only uses existing, available, non-excluded items", () => {
    const r = run({ excludedItemIds: ["itm_tee_white", "itm_jeans_raw"], count: 5 });
    for (const o of r.outfits)
      for (const p of o.pieces) {
        const item = byId.get(p.itemId);
        expect(item).toBeDefined();
        expect(item!.availability).toBe("available");
        expect(["itm_tee_white", "itm_jeans_raw"]).not.toContain(p.itemId);
      }
  });

  it("builds structurally valid outfits", () => {
    for (const season of ["spring", "summer", "autumn", "winter"] as const) {
      for (const o of run({ season, count: 5 }).outfits) {
        const slots = o.pieces.map((p) => p.slot);
        expect(slots).toContain("base");
        expect(slots).toContain("bottom");
        expect(slots).toContain("shoes");
        expect(new Set(o.pieces.map((p) => p.itemId)).size).toBe(o.pieces.length);
        const baseItem = byId.get(o.pieces.find((p) => p.slot === "base")!.itemId)!;
        const layer = o.pieces.find((p) => p.slot === "layer");
        if (layer) expect(canLayer(baseItem, byId.get(layer.itemId)!)).toBe(true);
        expect(o.score).toBeGreaterThan(0);
        expect(o.score).toBeLessThanOrEqual(100);
        expect(o.rationale.length).toBeGreaterThan(2);
      }
    }
  });

  it("never suggests shorts for work or in winter", () => {
    for (const o of [...run({ occasion: "work", season: "summer", count: 5 }).outfits, ...run({ season: "winter", count: 5 }).outfits])
      for (const p of o.pieces) expect(byId.get(p.itemId)!.category).not.toBe("shorts");
  });

  it("returns diverse recommendations", () => {
    const r = run({ count: 5 });
    const bases = r.outfits.map((o) => o.pieces.find((p) => p.slot === "base")!.itemId);
    expect(new Set(bases).size).toBe(bases.length);
  });

  it("does not repeat avoided signatures on regenerate", () => {
    const first = run();
    const second = run({}, { avoid: first.outfits.map((o) => signatureOf(o.pieces)) });
    const firstSigs = new Set(first.outfits.map((o) => signatureOf(o.pieces)));
    for (const o of second.outfits) expect(firstSigs.has(signatureOf(o.pieces))).toBe(false);
  });

  it("respects instruction keywords", () => {
    const r = run({ instructions: "no sneakers, keep it tonal", count: 4 });
    expect(r.parsed.avoidShapes).toContain("sneaker");
    for (const o of r.outfits)
      for (const p of o.pieces) expect(["sneaker", "high-sneaker"]).not.toContain(byId.get(p.itemId)!.shape);
  });

  it("reports a shortfall instead of inventing items", () => {
    const tiny = SEED_ITEMS.filter((i) => i.category !== "shoes");
    const r = run({}, { items: tiny });
    expect(r.outfits).toHaveLength(0);
    expect(r.shortfall).toMatch(/shoes/);
  });

  it("learned fit preference shifts results toward that fit", () => {
    const relaxedShare = (learned: number) => {
      const r = ruleBasedEngine.generate({
        items: SEED_ITEMS,
        profile: { ...SEED_PROFILE, preferredFits: [], learned: { ...SEED_PROFILE.learned, fit: { relaxed: learned, slim: -learned } } },
        wearLog: history.wearLog,
        request: { ...base, count: 5 },
        today: "2026-11-16",
        sessionId: "s1",
      });
      const fits = r.outfits.flatMap((o) => o.pieces.map((p) => byId.get(p.itemId)!.fit)).filter(Boolean);
      return fits.filter((f) => f === "relaxed").length / fits.length;
    };
    expect(relaxedShare(1)).toBeGreaterThanOrEqual(relaxedShare(-1));
  });

  it("offers alternatives for a slot with score deltas", () => {
    const o = run().outfits[0];
    const alts = ruleBasedEngine.alternatives({
      items: SEED_ITEMS,
      profile: SEED_PROFILE,
      wearLog: history.wearLog,
      outfit: o,
      slot: "shoes",
      today: "2026-11-16",
      season: "autumn",
    });
    expect(alts.length).toBeGreaterThan(0);
    for (const a of alts) expect(a.item.category).toBe("shoes");
  });
});

describe("instruction parser", () => {
  it("handles negation per clause", () => {
    const p = parseInstructions("No black, but with boots and something relaxed");
    expect(p.avoidColors).toContain("black");
    expect(p.requireShapes).toContain("boot");
    expect(p.relaxed).toBe(true);
  });
});
