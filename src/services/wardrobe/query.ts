import type { Availability, Category, ColorId, Season, StyleTag, WardrobeItem } from "@/domain/types";
import { categoryLabel, colorLabel } from "@/domain/taxonomy";
import type { ItemUsage } from "../usage";

export interface WardrobeFilters {
  query: string;
  categories: Category[];
  colors: ColorId[];
  styles: StyleTag[];
  seasons: Season[];
  availability: Availability | "all";
  sort: "newest" | "name" | "most-worn" | "least-worn";
}

export const EMPTY_FILTERS: WardrobeFilters = {
  query: "",
  categories: [],
  colors: [],
  styles: [],
  seasons: [],
  availability: "all",
  sort: "newest",
};

export const activeFilterCount = (f: WardrobeFilters) =>
  f.categories.length + f.colors.length + f.styles.length + f.seasons.length + (f.availability !== "all" ? 1 : 0);

const haystack = (i: WardrobeItem) =>
  [i.name, i.brand, i.subcategory, i.material, categoryLabel(i.category), colorLabel(i.mainColor), ...i.secondaryColors.map(colorLabel), ...i.styles]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

export const filterItems = (
  items: WardrobeItem[],
  f: WardrobeFilters,
  usage: Record<string, ItemUsage> = {},
): WardrobeItem[] => {
  const terms = f.query.toLowerCase().split(/\s+/).filter(Boolean);
  const res = items.filter((i) => {
    if (f.categories.length && !f.categories.includes(i.category)) return false;
    if (f.colors.length && !f.colors.includes(i.mainColor) && !i.secondaryColors.some((c) => f.colors.includes(c)))
      return false;
    if (f.styles.length && !i.styles.some((s) => f.styles.includes(s))) return false;
    if (f.seasons.length && !i.seasons.some((s) => f.seasons.includes(s))) return false;
    if (f.availability !== "all" && i.availability !== f.availability) return false;
    if (terms.length) {
      const h = haystack(i);
      if (!terms.every((t) => h.includes(t))) return false;
    }
    return true;
  });
  const count = (i: WardrobeItem) => usage[i.id]?.count ?? 0;
  switch (f.sort) {
    case "name":
      return res.sort((a, b) => a.name.localeCompare(b.name));
    case "most-worn":
      return res.sort((a, b) => count(b) - count(a) || a.name.localeCompare(b.name));
    case "least-worn":
      return res.sort((a, b) => count(a) - count(b) || a.name.localeCompare(b.name));
    default:
      return res.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name));
  }
};
