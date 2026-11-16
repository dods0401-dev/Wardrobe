import type { Interaction, Outfit, OutfitPiece, UserProfile, WardrobeItem, WearEntry } from "@/domain/types";
import { addDays, toDateKey } from "@/lib/util";
import { outfitIdFor, ruleBasedEngine } from "@/services/recommendation/engine";
import { seasonForDate } from "@/domain/taxonomy";

export const SEED_PROFILE: UserProfile = {
  name: "Noa",
  handle: "noa.wears",
  city: "Milan",
  styles: ["streetwear", "minimal", "vintage"],
  preferredColors: ["black", "white", "olive", "denim", "ecru"],
  avoidedColors: ["pink", "yellow"],
  preferredFits: ["relaxed", "regular"],
  favoriteCategories: ["outerwear", "shoes"],
  defaultOccasion: "casual",
  learned: { fit: {}, color: {}, style: {}, item: {} },
  onboardedAt: "2024-07-15T09:00:00.000Z",
};

interface SeedLook {
  name: string;
  occasion: Outfit["occasion"];
  style: Outfit["style"];
  pieces: [OutfitPiece["slot"], string][];
  saved: boolean;
  liked?: boolean;
  /** Days ago this look was worn (relative to seeding date). */
  wornDaysAgo: number[];
}

const LOOKS: SeedLook[] = [
  { name: "Concrete Hours", occasion: "streetwear", style: "streetwear", saved: true, liked: true, wornDaysAgo: [2, 16, 31],
    pieces: [["base", "itm_tee_white"], ["outerwear", "itm_jkt_bomber"], ["bottom", "itm_cargo_olive"], ["shoes", "itm_shoe_retro"]] },
  { name: "Studio Visit", occasion: "smart-casual", style: "smart-casual", saved: true, liked: true, wornDaysAgo: [5, 26],
    pieces: [["base", "itm_shirt_oxford"], ["layer", "itm_knit_navy"], ["bottom", "itm_chino_stone"], ["shoes", "itm_shoe_loafer"]] },
  { name: "Archive Pull", occasion: "weekend", style: "vintage", saved: true, wornDaysAgo: [9, 23],
    pieces: [["base", "itm_tee_stripe"], ["outerwear", "itm_jkt_trucker"], ["bottom", "itm_jeans_raw"], ["shoes", "itm_shoe_hightop"]] },
  { name: "Quiet Lines", occasion: "work", style: "minimal", saved: true, liked: true, wornDaysAgo: [7, 14, 21, 35],
    pieces: [["base", "itm_tee_black"], ["outerwear", "itm_blazer_char"], ["bottom", "itm_trouser_black"], ["shoes", "itm_shoe_derby"]] },
  { name: "Errand Run", occasion: "casual", style: "casual", saved: false, wornDaysAgo: [1, 12, 19, 28],
    pieces: [["base", "itm_hood_grey"], ["bottom", "itm_jeans_black"], ["shoes", "itm_shoe_white"], ["accessory", "itm_acc_cap"]] },
  { name: "Worn In", occasion: "weekend", style: "vintage", saved: true, wornDaysAgo: [4, 33],
    pieces: [["base", "itm_tee_white"], ["layer", "itm_shirt_flannel"], ["bottom", "itm_jeans_light"], ["shoes", "itm_shoe_boot"]] },
  { name: "Booked Table", occasion: "evening", style: "contemporary", saved: true, wornDaysAgo: [11],
    pieces: [["base", "itm_shirt_white"], ["outerwear", "itm_coat_camel"], ["bottom", "itm_trouser_black"], ["shoes", "itm_shoe_boot"]] },
  { name: "Clean Slate", occasion: "casual", style: "minimal", saved: true, wornDaysAgo: [],
    pieces: [["base", "itm_crew_sage"], ["bottom", "itm_chino_stone"], ["shoes", "itm_shoe_white"], ["accessory", "itm_acc_tote"]] },
];

export interface SeedState {
  outfits: Outfit[];
  wearLog: WearEntry[];
  interactions: Interaction[];
}

/** Builds a coherent outfit history relative to `now`, scored by the real engine. */
export const buildSeedHistory = (items: WardrobeItem[], profile: UserProfile, now: Date): SeedState => {
  const byId = new Map(items.map((i) => [i.id, i]));
  const outfits: Outfit[] = [];
  const wearLog: WearEntry[] = [];
  const interactions: Interaction[] = [];
  const today = toDateKey(now);
  const season = seasonForDate(now);

  LOOKS.forEach((look, idx) => {
    const pieces: OutfitPiece[] = look.pieces.map(([slot, itemId]) => ({ slot, itemId }));
    const id = outfitIdFor(pieces);
    const created = toDateKey(addDays(now, -40 + idx));
    const scored = ruleBasedEngine.rescore({ items, profile, wearLog: [], outfit: { ...look, pieces }, today, season });
    outfits.push({
      id,
      name: look.name,
      pieces,
      occasion: look.occasion,
      style: look.style,
      ...scored,
      createdAt: `${created}T09:00:00.000Z`,
      saved: look.saved,
      liked: !!look.liked,
      rejected: false,
      source: "seed",
    });
    if (look.saved) interactions.push({ id: `int_seed_s${idx}`, type: "saved", outfitId: id, at: `${created}T09:05:00.000Z` });
    if (look.liked) interactions.push({ id: `int_seed_l${idx}`, type: "liked", outfitId: id, at: `${created}T09:04:00.000Z` });
    for (const ago of look.wornDaysAgo) {
      const date = toDateKey(addDays(now, -ago));
      wearLog.push({
        id: `wear_seed_${idx}_${ago}`,
        outfitId: id,
        date,
        occasion: look.occasion,
        outfitName: look.name,
        itemIds: pieces.map((p) => p.itemId),
        itemSnapshots: pieces.map((p) => {
          const it = byId.get(p.itemId)!;
          return { id: it.id, name: it.name, category: it.category, mainColor: it.mainColor };
        }),
      });
      interactions.push({ id: `int_seed_w${idx}_${ago}`, type: "worn", outfitId: id, at: `${date}T08:30:00.000Z` });
    }
  });

  wearLog.sort((a, b) => b.date.localeCompare(a.date));
  interactions.sort((a, b) => b.at.localeCompare(a.at));
  return { outfits, wearLog, interactions };
};
