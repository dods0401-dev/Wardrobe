import type { Occasion, ScoreBreakdown, StyleTag } from "@/domain/types";
import { colorDef, colorLabel, fitLabel, occasionLabel, seasonLabel, styleLabel } from "@/domain/taxonomy";
import { hash } from "@/lib/util";
import { OCCASION_PROFILES } from "./config";
import type { ScoredPiece, ScoringContext } from "./scoring";
import { itemRotation } from "./scoring";

const NAMES: Record<StyleTag, string[]> = {
  streetwear: ["Block Party", "Late Drop", "Concrete Hours", "Corner Store", "Night Bus", "Sample Sale"],
  casual: ["Sunday Paper", "Errand Run", "Easy Rotation", "Coffee Order", "Open Window", "Slow Start"],
  minimal: ["Quiet Lines", "Negative Space", "White Room", "Low Contrast", "Clean Slate", "Plain Text"],
  vintage: ["Archive Pull", "Flea Market", "Second Pressing", "Worn In", "Back Catalogue", "Old Print"],
  "smart-casual": ["Studio Visit", "Gallery Hours", "Long Lunch", "Soft Tailoring", "Booked Table", "Proof Copy"],
  contemporary: ["Current Issue", "New Proportions", "After Hours", "Index Look", "Off Grid", "Cut & Edit"],
  sporty: ["Trail Head", "Track Notes", "Utility Club", "Recovery Day", "Tech Layer", "Outdoor Kit"],
};

/** Dominant style of an outfit, weighted by the requested styles. */
export const dominantStyle = (pieces: ScoredPiece[], targets: StyleTag[], occasion: Occasion): StyleTag => {
  const tally = new Map<StyleTag, number>();
  for (const p of pieces)
    p.item.styles.forEach((s, i) => tally.set(s, (tally.get(s) ?? 0) + (i === 0 ? 1.2 : 1) - i * 0.15));
  for (const t of targets) tally.set(t, (tally.get(t) ?? 0) + 1.5);
  const aff = OCCASION_PROFILES[occasion].styleAffinity;
  return [...tally.entries()].sort(
    (a, b) => b[1] + (aff[b[0]] ?? 0) - (a[1] + (aff[a[0]] ?? 0)) || a[0].localeCompare(b[0]),
  )[0][0];
};

export const outfitName = (style: StyleTag, signature: string, taken: Set<string> = new Set()) => {
  const bank = NAMES[style];
  const start = hash(signature) % bank.length;
  for (let i = 0; i < bank.length; i++) {
    const name = bank[(start + i) % bank.length];
    if (!taken.has(name)) return name;
  }
  return bank[start];
};

const article = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

const bySlot = (pieces: ScoredPiece[], slot: string) => pieces.find((p) => p.piece.slot === slot)?.item;

export const describeOutfit = (pieces: ScoredPiece[]): string => {
  const base = bySlot(pieces, "base");
  const layer = bySlot(pieces, "layer");
  const outer = bySlot(pieces, "outerwear");
  const bottom = bySlot(pieces, "bottom");
  const shoes = bySlot(pieces, "shoes");
  const acc = bySlot(pieces, "accessory");
  const top = outer ?? layer ?? base;
  const lower = (s?: { name: string }) => (s ? s.name.toLowerCase() : "");
  const parts: string[] = [];
  if (outer && (layer || base)) {
    const under = layer ? `${article(layer.name)} ${lower(layer)} and ${lower(base)}` : `${article(base!.name)} ${lower(base)}`;
    parts.push(`${outer.name} thrown over ${under}`);
  } else if (layer && base) {
    parts.push(`${layer.name} worn over ${article(base.name)} ${lower(base)}`);
  } else if (top) {
    parts.push(`${top.name}`);
  }
  if (bottom) parts.push(`${lower(bottom)}`);
  let sentence = parts.join(" with ");
  if (shoes) sentence += `, grounded by ${lower(shoes)}`;
  if (acc) sentence += ` — ${lower(acc)} to finish`;
  return sentence + ".";
};

export const buildRationale = (
  pieces: ScoredPiece[],
  breakdown: ScoreBreakdown,
  ctx: ScoringContext,
): string[] => {
  const out: string[] = [];
  const wear = pieces.filter((p) => p.piece.slot !== "accessory");
  const mains = Array.from(new Set(wear.map((p) => p.item.mainColor)));
  const accents = mains.filter((c) => !colorDef(c).neutral);
  const names = (cs: string[]) => cs.map((c) => colorLabel(c as never).toLowerCase());

  // Colour
  if (accents.length === 0)
    out.push(
      ctx.parsed.tonal
        ? `Tonal palette — ${names(mains).join(", ")} — exactly the quiet look you asked for.`
        : `Neutral palette (${names(mains).join(", ")}) lets texture and proportion do the talking.`,
    );
  else if (accents.length === 1)
    out.push(`One accent: ${colorLabel(accents[0]).toLowerCase()} lifts an otherwise neutral base.`);
  else if (accents.every((c) => colorDef(c).earthy))
    out.push(`Earthy pairing of ${names(accents).join(" and ")} — they sit next to each other on the wheel.`);
  else out.push(`${names(accents).join(" + ")} as a deliberate colour story.`);

  // Style
  const style = dominantStyle(pieces, ctx.request.styles, ctx.request.occasion);
  if (breakdown.styleConsistency >= 0.8)
    out.push(`Every piece speaks ${styleLabel(style).toLowerCase()} — a cohesive silhouette.`);
  else out.push(`Mixes registers on purpose, anchored in ${styleLabel(style).toLowerCase()}.`);

  // Occasion
  const avg = wear.reduce((a, p) => a + p.item.formality, 0) / wear.length;
  out.push(
    `Formality ${avg.toFixed(1)}/5 — ${breakdown.occasionFit >= 0.75 ? "right on the brief" : "a relaxed read of the brief"} for ${occasionLabel(ctx.request.occasion).toLowerCase()}.`,
  );

  // Personal
  const fits = Array.from(new Set(pieces.map((p) => p.item.fit).filter(Boolean))) as string[];
  const prefFits = fits.filter((f) => ctx.profile.preferredFits.includes(f as never));
  const favs = pieces.filter((p) => p.item.favorite);
  const learnedFit = fits
    .map((f) => [f, ctx.profile.learned.fit[f as never] ?? 0] as const)
    .filter(([, v]) => v > 0.2)
    .sort((a, b) => b[1] - a[1])[0];
  if (learnedFit) out.push(`You've been reaching for ${fitLabel(learnedFit[0] as never).toLowerCase()} fits lately — this leans into it.`);
  else if (prefFits.length) out.push(`${prefFits.map((f) => fitLabel(f as never)).join(" & ")} fits, as in your profile.`);
  if (favs.length) out.push(`Features ${favs.map((f) => f.item.name).slice(0, 2).join(" and ")} from your favourites.`);

  // Season
  const outer = bySlot(pieces, "outerwear");
  if (ctx.request.season === "winter" || ctx.request.season === "autumn")
    out.push(outer ? `${outer.name} handles ${seasonLabel(ctx.request.season).toLowerCase()} temperatures.` : `Layered for ${seasonLabel(ctx.request.season).toLowerCase()}.`);
  else out.push(`Weight and fabrics suit ${seasonLabel(ctx.request.season).toLowerCase()}.`);

  // Rotation
  const neglected = pieces
    .map((p) => ({ item: p.item, r: itemRotation(p.item, ctx), u: ctx.usage[p.item.id] }))
    .filter((x) => x.r > 0.85)
    .sort((a, b) => b.r - a.r || a.item.id.localeCompare(b.item.id))[0];
  if (neglected)
    out.push(
      neglected.u?.count
        ? `Brings back ${neglected.item.name}, which hasn't been out in a while.`
        : `Puts ${neglected.item.name} into rotation for the first time.`,
    );

  return out;
};
