import type { Category, OutfitSlot, Silhouette, WardrobeItem } from "./types";

export interface ShapeDef {
  id: Silhouette;
  label: string;
  category: Category;
  /** Can be worn as the innermost top. */
  base?: boolean;
  /** Can be worn open over a tee-like base. */
  openLayer?: boolean;
  /** Can be worn over a collared shirt (knit / crewneck). */
  overShirt?: boolean;
  /** Tee-like bases that accept an open layer. */
  acceptsOpenLayer?: boolean;
  /** Collared bases that accept a knit on top. */
  collared?: boolean;
  /** Warmth contribution, 0 (none) – 3 (very warm). */
  warmth: number;
}

export const SHAPES: ShapeDef[] = [
  { id: "tee", label: "T-shirt", category: "top", base: true, acceptsOpenLayer: true, warmth: 0 },
  { id: "longsleeve", label: "Longsleeve", category: "top", base: true, acceptsOpenLayer: true, warmth: 1 },
  { id: "tank", label: "Tank", category: "top", base: true, acceptsOpenLayer: true, warmth: 0 },
  { id: "polo", label: "Polo", category: "top", base: true, warmth: 0 },
  { id: "knit", label: "Knit sweater", category: "top", base: true, overShirt: true, warmth: 2 },
  { id: "shirt", label: "Shirt", category: "shirt", base: true, openLayer: true, collared: true, warmth: 1 },
  { id: "overshirt", label: "Overshirt", category: "shirt", openLayer: true, base: true, collared: true, warmth: 1.5 },
  { id: "hoodie", label: "Hoodie", category: "sweatshirt", base: true, warmth: 2 },
  { id: "crewneck", label: "Crewneck", category: "sweatshirt", base: true, overShirt: true, warmth: 2 },
  { id: "zip-hoodie", label: "Zip fleece", category: "sweatshirt", base: true, overShirt: true, warmth: 2 },
  { id: "bomber", label: "Bomber", category: "outerwear", warmth: 2 },
  { id: "trucker", label: "Denim jacket", category: "outerwear", warmth: 1 },
  { id: "coat", label: "Coat", category: "outerwear", warmth: 3 },
  { id: "puffer", label: "Puffer", category: "outerwear", warmth: 3 },
  { id: "blazer", label: "Blazer", category: "outerwear", warmth: 1 },
  { id: "chore", label: "Chore jacket", category: "outerwear", warmth: 1.5 },
  { id: "jeans", label: "Jeans", category: "bottom", warmth: 1 },
  { id: "trousers", label: "Trousers", category: "bottom", warmth: 1 },
  { id: "cargo", label: "Cargo pants", category: "bottom", warmth: 1 },
  { id: "wide-trousers", label: "Wide trousers", category: "bottom", warmth: 1 },
  { id: "joggers", label: "Joggers", category: "bottom", warmth: 1 },
  { id: "shorts", label: "Shorts", category: "shorts", warmth: 0 },
  { id: "sneaker", label: "Sneakers", category: "shoes", warmth: 0 },
  { id: "high-sneaker", label: "High-top sneakers", category: "shoes", warmth: 0 },
  { id: "boot", label: "Boots", category: "shoes", warmth: 0 },
  { id: "loafer", label: "Loafers", category: "shoes", warmth: 0 },
  { id: "derby", label: "Derby shoes", category: "shoes", warmth: 0 },
  { id: "cap", label: "Cap", category: "accessory", warmth: 0 },
  { id: "beanie", label: "Beanie", category: "accessory", warmth: 0 },
  { id: "tote", label: "Tote bag", category: "accessory", warmth: 0 },
  { id: "crossbody", label: "Crossbody bag", category: "accessory", warmth: 0 },
  { id: "belt", label: "Belt", category: "accessory", warmth: 0 },
  { id: "sunglasses", label: "Sunglasses", category: "accessory", warmth: 0 },
  { id: "scarf", label: "Scarf", category: "accessory", warmth: 1 },
];

export const shapeDef = (s: Silhouette): ShapeDef => SHAPES.find((x) => x.id === s) ?? SHAPES[0];
export const shapesForCategory = (c: Category) => SHAPES.filter((s) => s.category === c);
export const defaultShapeFor = (c: Category): Silhouette => shapesForCategory(c)[0].id;

/** Slots an item may occupy in an outfit. */
export const slotsForItem = (item: WardrobeItem): OutfitSlot[] => {
  const d = shapeDef(item.shape);
  switch (item.category) {
    case "top":
    case "shirt":
    case "sweatshirt": {
      const slots: OutfitSlot[] = [];
      if (d.base) slots.push("base");
      if (d.openLayer || d.overShirt) slots.push("layer");
      return slots;
    }
    case "outerwear":
      return ["outerwear"];
    case "bottom":
    case "shorts":
      return ["bottom"];
    case "shoes":
      return ["shoes"];
    case "accessory":
      return ["accessory"];
  }
};

/** Whether `layer` can be worn over `base`. */
export const canLayer = (base: WardrobeItem, layer: WardrobeItem): boolean => {
  if (base.id === layer.id) return false;
  const b = shapeDef(base.shape);
  const l = shapeDef(layer.shape);
  // Open shirt / overshirt over a tee-like base.
  if (l.openLayer && b.acceptsOpenLayer) return layer.formality <= 3.6 || layer.shape === "overshirt";
  // Knit or sweat over a collared shirt (not over an overshirt).
  if (l.overShirt && b.collared && base.shape === "shirt") return true;
  return false;
};
