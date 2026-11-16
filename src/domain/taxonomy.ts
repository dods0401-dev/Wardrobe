import type {
  Availability,
  Category,
  ColorId,
  Fit,
  Occasion,
  OutfitSlot,
  Pattern,
  Season,
  StyleTag,
} from "./types";

export const CATEGORIES: { id: Category; label: string; plural: string }[] = [
  { id: "top", label: "Top", plural: "Tops & Tees" },
  { id: "shirt", label: "Shirt", plural: "Shirts" },
  { id: "sweatshirt", label: "Sweatshirt", plural: "Sweats & Hoodies" },
  { id: "outerwear", label: "Outerwear", plural: "Outerwear" },
  { id: "bottom", label: "Trousers", plural: "Trousers & Jeans" },
  { id: "shorts", label: "Shorts", plural: "Shorts" },
  { id: "shoes", label: "Shoes", plural: "Shoes" },
  { id: "accessory", label: "Accessory", plural: "Accessories" },
];

export const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.id === c)?.label ?? c;
export const categoryPlural = (c: Category) => CATEGORIES.find((x) => x.id === c)?.plural ?? c;

export interface ColorDef {
  id: ColorId;
  label: string;
  hex: string;
  /** Hue in degrees, or null for neutrals. */
  hue: number | null;
  neutral: boolean;
  /** Earthy/muted tones that read as near-neutral in outfits. */
  earthy?: boolean;
}

export const COLORS: ColorDef[] = [
  { id: "black", label: "Black", hex: "#1b1b1b", hue: null, neutral: true },
  { id: "white", label: "White", hex: "#f7f6f2", hue: null, neutral: true },
  { id: "ecru", label: "Ecru", hex: "#ebe3d2", hue: null, neutral: true },
  { id: "grey", label: "Grey", hex: "#a5a5a2", hue: null, neutral: true },
  { id: "charcoal", label: "Charcoal", hex: "#45464a", hue: null, neutral: true },
  { id: "navy", label: "Navy", hex: "#1f2a44", hue: 225, neutral: true },
  { id: "denim", label: "Denim", hex: "#3d5679", hue: 215, neutral: true },
  { id: "lightdenim", label: "Light Denim", hex: "#8ea5c2", hue: 213, neutral: true },
  { id: "beige", label: "Beige", hex: "#d6c4a3", hue: 38, neutral: true, earthy: true },
  { id: "stone", label: "Stone", hex: "#bcb6a6", hue: 45, neutral: true, earthy: true },
  { id: "camel", label: "Camel", hex: "#b88a55", hue: 32, neutral: false, earthy: true },
  { id: "brown", label: "Brown", hex: "#5e4130", hue: 22, neutral: true, earthy: true },
  { id: "olive", label: "Olive", hex: "#5f6440", hue: 66, neutral: false, earthy: true },
  { id: "sage", label: "Sage", hex: "#b7c5a4", hue: 90, neutral: false, earthy: true },
  { id: "forest", label: "Forest", hex: "#2f4a3a", hue: 145, neutral: false, earthy: true },
  { id: "burgundy", label: "Burgundy", hex: "#6b2430", hue: 350, neutral: false },
  { id: "red", label: "Red", hex: "#d94a38", hue: 7, neutral: false },
  { id: "rust", label: "Rust", hex: "#a8532c", hue: 20, neutral: false, earthy: true },
  { id: "orange", label: "Orange", hex: "#e2793a", hue: 25, neutral: false },
  { id: "yellow", label: "Yellow", hex: "#e3c04a", hue: 47, neutral: false },
  { id: "skyblue", label: "Sky Blue", hex: "#a9c6e0", hue: 208, neutral: false },
  { id: "cobalt", label: "Cobalt", hex: "#2c4fb0", hue: 224, neutral: false },
  { id: "lilac", label: "Lilac", hex: "#b9a7cf", hue: 270, neutral: false },
  { id: "pink", label: "Pink", hex: "#e3a9b2", hue: 352, neutral: false },
];

export const colorDef = (c: ColorId): ColorDef => COLORS.find((x) => x.id === c) ?? COLORS[0];
export const colorHex = (c: ColorId) => colorDef(c).hex;
export const colorLabel = (c: ColorId) => colorDef(c).label;

export const STYLES: { id: StyleTag; label: string; blurb: string }[] = [
  { id: "streetwear", label: "Streetwear", blurb: "Graphic, oversized, sneaker-led." },
  { id: "casual", label: "Casual", blurb: "Easy everyday staples." },
  { id: "minimal", label: "Minimal", blurb: "Clean lines, quiet palette." },
  { id: "vintage", label: "Vintage", blurb: "Worn-in, archival, characterful." },
  { id: "smart-casual", label: "Smart Casual", blurb: "Tailored meets relaxed." },
  { id: "contemporary", label: "Contemporary", blurb: "Current silhouettes, considered details." },
  { id: "sporty", label: "Sporty", blurb: "Technical and athletic references." },
];
export const styleLabel = (s: StyleTag) => STYLES.find((x) => x.id === s)?.label ?? s;

export const OCCASIONS: { id: Occasion; label: string; blurb: string }[] = [
  { id: "casual", label: "Casual", blurb: "Errands, coffee, nothing to prove." },
  { id: "work", label: "Work", blurb: "Office-ready, still yourself." },
  { id: "smart-casual", label: "Smart Casual", blurb: "Dinner, gallery, first impressions." },
  { id: "streetwear", label: "Streetwear", blurb: "Statement pieces, sneakers first." },
  { id: "evening", label: "Evening", blurb: "After dark, sharper edges." },
  { id: "special", label: "Special Occasion", blurb: "Events worth dressing for." },
  { id: "weekend", label: "Weekend", blurb: "Slow mornings, long walks." },
];
export const occasionLabel = (o: Occasion) => OCCASIONS.find((x) => x.id === o)?.label ?? o;

export const SEASONS: { id: Season; label: string }[] = [
  { id: "spring", label: "Spring" },
  { id: "summer", label: "Summer" },
  { id: "autumn", label: "Autumn" },
  { id: "winter", label: "Winter" },
];
export const seasonLabel = (s: Season) => SEASONS.find((x) => x.id === s)?.label ?? s;

export const FITS: { id: Fit; label: string }[] = [
  { id: "slim", label: "Slim" },
  { id: "regular", label: "Regular" },
  { id: "relaxed", label: "Relaxed" },
  { id: "oversized", label: "Oversized" },
  { id: "cropped", label: "Cropped" },
  { id: "wide", label: "Wide" },
];
export const fitLabel = (f: Fit) => FITS.find((x) => x.id === f)?.label ?? f;

export const PATTERNS: { id: Pattern; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "stripe", label: "Stripe" },
  { id: "check", label: "Check" },
  { id: "graphic", label: "Graphic" },
  { id: "texture", label: "Texture" },
  { id: "camo", label: "Camo" },
  { id: "washed", label: "Washed" },
];
export const patternLabel = (p: Pattern) => PATTERNS.find((x) => x.id === p)?.label ?? p;

export const AVAILABILITY: { id: Availability; label: string }[] = [
  { id: "available", label: "Available" },
  { id: "laundry", label: "In laundry" },
  { id: "repair", label: "At repair" },
  { id: "stored", label: "Stored away" },
];
export const availabilityLabel = (a: Availability) =>
  AVAILABILITY.find((x) => x.id === a)?.label ?? a;

export const SLOT_LABEL: Record<OutfitSlot, string> = {
  base: "Base",
  layer: "Layer",
  outerwear: "Outerwear",
  bottom: "Bottom",
  shoes: "Shoes",
  accessory: "Accessory",
};

/** Slot order used for collage composition and lists. */
export const SLOT_ORDER: OutfitSlot[] = ["outerwear", "layer", "base", "bottom", "shoes", "accessory"];

export const seasonForDate = (d: Date): Season => {
  const m = d.getMonth();
  if (m >= 2 && m <= 4) return "spring";
  if (m >= 5 && m <= 7) return "summer";
  if (m >= 8 && m <= 10) return "autumn";
  return "winter";
};
