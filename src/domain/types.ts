/**
 * Domain models for PROJECT WARDROBE.
 * Pure types — no React, no storage, no browser APIs.
 */

export type Category =
  | "top"
  | "shirt"
  | "sweatshirt"
  | "outerwear"
  | "bottom"
  | "shorts"
  | "shoes"
  | "accessory";

export type Season = "spring" | "summer" | "autumn" | "winter";

export type StyleTag =
  | "streetwear"
  | "casual"
  | "minimal"
  | "vintage"
  | "smart-casual"
  | "contemporary"
  | "sporty";

export type Occasion =
  | "casual"
  | "work"
  | "smart-casual"
  | "streetwear"
  | "evening"
  | "special"
  | "weekend";

export type Fit = "slim" | "regular" | "relaxed" | "oversized" | "cropped" | "wide";

export type Pattern = "solid" | "stripe" | "check" | "graphic" | "texture" | "camo" | "washed";

export type Availability = "available" | "laundry" | "repair" | "stored";

export type ColorId =
  | "black"
  | "white"
  | "ecru"
  | "grey"
  | "charcoal"
  | "navy"
  | "denim"
  | "lightdenim"
  | "beige"
  | "stone"
  | "camel"
  | "brown"
  | "olive"
  | "sage"
  | "forest"
  | "burgundy"
  | "red"
  | "rust"
  | "orange"
  | "yellow"
  | "skyblue"
  | "cobalt"
  | "lilac"
  | "pink";

/**
 * Silhouette keys drive the generated product cutouts used by the demo dataset.
 * A real backend would instead return photo URLs (with optional background-removed cutouts).
 */
export type Silhouette =
  | "tee"
  | "longsleeve"
  | "tank"
  | "polo"
  | "knit"
  | "shirt"
  | "overshirt"
  | "hoodie"
  | "crewneck"
  | "zip-hoodie"
  | "bomber"
  | "trucker"
  | "coat"
  | "puffer"
  | "blazer"
  | "chore"
  | "jeans"
  | "trousers"
  | "cargo"
  | "wide-trousers"
  | "joggers"
  | "shorts"
  | "sneaker"
  | "high-sneaker"
  | "boot"
  | "loafer"
  | "derby"
  | "cap"
  | "beanie"
  | "tote"
  | "belt"
  | "sunglasses"
  | "scarf"
  | "crossbody";

/**
 * "render": the demo dataset ships generated product cutouts drawn from the item's shape & colours.
 * "upload": a user photo (stored as a compressed data URL in this prototype).
 */
export type ItemImage = { kind: "render" } | { kind: "upload"; src: string };

export interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  /** Garment archetype. Drives outfit compatibility rules and cutout rendering. */
  shape: Silhouette;
  mainColor: ColorId;
  secondaryColors: ColorId[];
  styles: StyleTag[];
  seasons: Season[];
  pattern: Pattern;
  availability: Availability;
  image: ItemImage;
  brand?: string;
  material?: string;
  fit?: Fit;
  /** 1 (very casual) – 5 (formal). Derived from subcategory when omitted. */
  formality: number;
  favorite?: boolean;
  notes?: string;
  createdAt: string; // ISO
  updatedAt?: string;
}

export type OutfitSlot = "base" | "layer" | "outerwear" | "bottom" | "shoes" | "accessory";

export interface OutfitPiece {
  slot: OutfitSlot;
  itemId: string;
}

export interface ScoreBreakdown {
  colorHarmony: number; // 0..1
  styleConsistency: number;
  personalPreference: number;
  occasionFit: number;
  seasonFit: number;
  rotation: number;
}

export type OutfitStatus = "suggested" | "saved" | "rejected";

export interface Outfit {
  id: string;
  name: string;
  pieces: OutfitPiece[];
  occasion: Occasion;
  style: StyleTag;
  description: string;
  rationale: string[];
  score: number; // 0..100
  breakdown: ScoreBreakdown;
  createdAt: string;
  sessionId?: string;
  saved: boolean;
  liked: boolean;
  rejected: boolean;
  source: "stylist" | "seed";
}

export type InteractionType =
  | "suggested"
  | "viewed"
  | "liked"
  | "unliked"
  | "saved"
  | "unsaved"
  | "worn"
  | "rejected"
  | "item_replaced";

export interface Interaction {
  id: string;
  type: InteractionType;
  outfitId: string;
  at: string;
  itemId?: string;
  replacedWithId?: string;
}

/** A record of an outfit actually worn. Keeps a snapshot so history survives deletions. */
export interface WearEntry {
  id: string;
  outfitId: string;
  date: string; // YYYY-MM-DD
  occasion: Occasion;
  outfitName: string;
  itemIds: string[];
  itemSnapshots: { id: string; name: string; category: Category; mainColor: ColorId }[];
  note?: string;
}

/** Learned affinity weights, nudged by feedback. Each value is clamped to [-1, 1]. */
export interface LearnedPreferences {
  fit: Partial<Record<Fit, number>>;
  color: Partial<Record<ColorId, number>>;
  style: Partial<Record<StyleTag, number>>;
  item: Record<string, number>;
}

export interface UserProfile {
  name: string;
  handle: string;
  city: string;
  styles: StyleTag[];
  preferredColors: ColorId[];
  avoidedColors: ColorId[];
  preferredFits: Fit[];
  favoriteCategories: Category[];
  defaultOccasion: Occasion;
  learned: LearnedPreferences;
  onboardedAt: string;
}

export interface StylistRequest {
  occasion: Occasion;
  styles: StyleTag[];
  instructions: string;
  preferredColors: ColorId[];
  excludedItemIds: string[];
  /** Optional anchor pieces every look must include ("style this piece"). */
  anchorItemIds?: string[];
  count: number; // 3..5
  season: Season;
  includeAccessory: boolean;
}

export interface StylistSession {
  id: string;
  request: StylistRequest;
  outfitIds: string[];
  createdAt: string;
  /** How many times the user regenerated with the same request. */
  iteration: number;
  /** Every outfit signature shown in this session — regenerate never repeats them. */
  shownSignatures: string[];
  /** What the (mock) brief parser understood, shown back to the user. */
  understood: string[];
  shortfall?: string;
  evaluated: number;
}
