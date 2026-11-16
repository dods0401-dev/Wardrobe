import type {
  Availability,
  Category,
  ColorId,
  Fit,
  Pattern,
  Season,
  Silhouette,
  StyleTag,
  WardrobeItem,
} from "@/domain/types";

/** Default formality per silhouette (1 = very casual, 5 = formal). */
export const SILHOUETTE_FORMALITY: Record<Silhouette, number> = {
  tee: 1.5,
  longsleeve: 2,
  tank: 1,
  polo: 3,
  knit: 3.5,
  shirt: 4,
  overshirt: 3,
  hoodie: 1,
  crewneck: 2,
  "zip-hoodie": 1,
  bomber: 2.5,
  trucker: 2,
  coat: 4.5,
  puffer: 2,
  blazer: 5,
  chore: 3,
  jeans: 2.5,
  trousers: 4,
  cargo: 1.5,
  "wide-trousers": 3.5,
  joggers: 1,
  shorts: 1.5,
  sneaker: 2,
  "high-sneaker": 1.5,
  boot: 3,
  loafer: 4.5,
  derby: 5,
  cap: 1,
  beanie: 1.5,
  tote: 2,
  belt: 4,
  sunglasses: 3,
  scarf: 3.5,
  crossbody: 2,
};

const ALL: Season[] = ["spring", "summer", "autumn", "winter"];
const TRANS: Season[] = ["spring", "autumn"];
const WARM: Season[] = ["spring", "summer"];
const COLD: Season[] = ["autumn", "winter"];
const NOT_SUMMER: Season[] = ["spring", "autumn", "winter"];

interface SeedSpec {
  id: string;
  name: string;
  category: Category;
  subcategory: string;
  silhouette: Silhouette;
  main: ColorId;
  secondary?: ColorId[];
  styles: StyleTag[];
  seasons: Season[];
  pattern?: Pattern;
  brand?: string;
  material?: string;
  fit?: Fit;
  availability?: Availability;
  formality?: number;
  favorite?: boolean;
  created: string;
}

const make = (s: SeedSpec): WardrobeItem => ({
  id: s.id,
  name: s.name,
  category: s.category,
  subcategory: s.subcategory,
  shape: s.silhouette,
  mainColor: s.main,
  secondaryColors: s.secondary ?? [],
  styles: s.styles,
  seasons: s.seasons,
  pattern: s.pattern ?? "solid",
  availability: s.availability ?? "available",
  image: { kind: "render" },
  brand: s.brand,
  material: s.material,
  fit: s.fit,
  formality: s.formality ?? SILHOUETTE_FORMALITY[s.silhouette],
  favorite: s.favorite,
  createdAt: `${s.created}T10:00:00.000Z`,
});

const SPECS: SeedSpec[] = [
  // ── TOPS & TEES (9)
  { id: "itm_tee_white", name: "Heavyweight Boxy Tee", category: "top", subcategory: "T-shirt", silhouette: "tee", main: "white", styles: ["minimal", "streetwear", "casual"], seasons: ALL, brand: "Lady White Co.", material: "Cotton jersey 260gsm", fit: "relaxed", favorite: true, created: "2025-03-02" },
  { id: "itm_tee_black", name: "Essential Black Tee", category: "top", subcategory: "T-shirt", silhouette: "tee", main: "black", styles: ["minimal", "contemporary", "casual"], seasons: ALL, brand: "Uniqlo U", material: "Cotton", fit: "regular", created: "2025-03-02" },
  { id: "itm_tee_graphic", name: "Archive Graphic Tee", category: "top", subcategory: "Graphic tee", silhouette: "tee", main: "ecru", secondary: ["red", "black"], styles: ["streetwear", "vintage"], seasons: WARM.concat("autumn"), pattern: "graphic", brand: "Stüssy", material: "Washed cotton", fit: "oversized", created: "2025-04-11" },
  { id: "itm_tee_stripe", name: "Breton Stripe Longsleeve", category: "top", subcategory: "Longsleeve", silhouette: "longsleeve", main: "ecru", secondary: ["navy"], styles: ["casual", "vintage", "minimal"], seasons: TRANS, pattern: "stripe", brand: "Armor Lux", material: "Cotton", fit: "regular", created: "2025-02-18" },
  { id: "itm_ls_grey", name: "Waffle Knit Longsleeve", category: "top", subcategory: "Longsleeve", silhouette: "longsleeve", main: "grey", styles: ["casual", "sporty", "minimal"], seasons: COLD.concat("spring"), pattern: "texture", brand: "Arket", material: "Cotton waffle", fit: "regular", created: "2025-10-03" },
  { id: "itm_tank_black", name: "Ribbed Tank", category: "top", subcategory: "Tank top", silhouette: "tank", main: "black", styles: ["minimal", "streetwear"], seasons: ["summer"], brand: "COS", material: "Ribbed cotton", fit: "slim", created: "2025-06-01" },
  { id: "itm_polo_knit", name: "Knitted Polo", category: "top", subcategory: "Polo", silhouette: "polo", main: "sage", styles: ["smart-casual", "vintage", "contemporary"], seasons: WARM, pattern: "texture", brand: "Our Legacy", material: "Merino", fit: "regular", favorite: true, created: "2025-05-20" },
  { id: "itm_knit_navy", name: "Merino Crew Knit", category: "top", subcategory: "Knitwear", silhouette: "knit", main: "navy", styles: ["smart-casual", "minimal"], seasons: COLD, pattern: "texture", brand: "John Smedley", material: "Extra-fine merino", fit: "slim", created: "2024-11-12" },
  { id: "itm_knit_ecru", name: "Chunky Fisherman Sweater", category: "top", subcategory: "Knitwear", silhouette: "knit", main: "ecru", styles: ["vintage", "casual", "contemporary"], seasons: ["winter", "autumn"], pattern: "texture", brand: "Inverallan", material: "Wool", fit: "relaxed", created: "2024-12-03" },

  // ── SHIRTS (6)
  { id: "itm_shirt_oxford", name: "Oxford Button-Down", category: "shirt", subcategory: "Oxford shirt", silhouette: "shirt", main: "skyblue", styles: ["smart-casual", "vintage", "minimal"], seasons: ALL, brand: "Drake's", material: "Oxford cotton", fit: "regular", favorite: true, created: "2025-01-15" },
  { id: "itm_shirt_white", name: "Crisp Poplin Shirt", category: "shirt", subcategory: "Dress shirt", silhouette: "shirt", main: "white", styles: ["smart-casual", "minimal", "contemporary"], seasons: ALL, brand: "COS", material: "Cotton poplin", fit: "slim", formality: 4.5, created: "2025-01-15" },
  { id: "itm_shirt_flannel", name: "Brushed Flannel Check", category: "shirt", subcategory: "Flannel shirt", silhouette: "shirt", main: "rust", secondary: ["navy", "ecru"], styles: ["vintage", "casual"], seasons: COLD, pattern: "check", brand: "Portuguese Flannel", material: "Brushed cotton", fit: "relaxed", formality: 2.5, created: "2024-10-21" },
  { id: "itm_shirt_overshirt", name: "Cord Overshirt", category: "shirt", subcategory: "Overshirt", silhouette: "overshirt", main: "brown", styles: ["vintage", "contemporary", "smart-casual"], seasons: COLD.concat("spring"), pattern: "texture", brand: "Folk", material: "Needlecord", fit: "relaxed", created: "2024-10-05" },
  { id: "itm_shirt_camp", name: "Camp Collar Shirt", category: "shirt", subcategory: "Camp shirt", silhouette: "shirt", main: "ecru", secondary: ["olive"], styles: ["contemporary", "casual", "vintage"], seasons: ["summer", "spring"], pattern: "texture", brand: "Story mfg.", material: "Linen", fit: "relaxed", formality: 3, created: "2025-06-14" },
  { id: "itm_shirt_denim", name: "Western Denim Shirt", category: "shirt", subcategory: "Denim shirt", silhouette: "shirt", main: "denim", styles: ["vintage", "casual", "streetwear"], seasons: TRANS, pattern: "washed", brand: "Levi's Vintage", material: "Denim 8oz", fit: "regular", formality: 2.5, availability: "laundry", created: "2025-02-01" },

  // ── SWEATSHIRTS & HOODIES (5)
  { id: "itm_hood_grey", name: "Heather Grey Hoodie", category: "sweatshirt", subcategory: "Hoodie", silhouette: "hoodie", main: "grey", styles: ["streetwear", "casual", "sporty"], seasons: NOT_SUMMER, brand: "Reigning Champ", material: "Fleece", fit: "relaxed", favorite: true, created: "2024-09-30" },
  { id: "itm_hood_black", name: "Oversized Black Hoodie", category: "sweatshirt", subcategory: "Hoodie", silhouette: "hoodie", main: "black", styles: ["streetwear", "minimal"], seasons: NOT_SUMMER, brand: "Fear of God Essentials", material: "Cotton fleece", fit: "oversized", created: "2024-11-02" },
  { id: "itm_crew_sage", name: "Garment-Dyed Crewneck", category: "sweatshirt", subcategory: "Crewneck", silhouette: "crewneck", main: "sage", styles: ["casual", "minimal", "contemporary"], seasons: NOT_SUMMER, pattern: "washed", brand: "Colorful Standard", material: "Organic cotton", fit: "regular", created: "2025-03-21" },
  { id: "itm_crew_navy", name: "Varsity Crewneck", category: "sweatshirt", subcategory: "Crewneck", silhouette: "crewneck", main: "navy", secondary: ["white"], styles: ["vintage", "streetwear", "casual"], seasons: NOT_SUMMER, pattern: "graphic", brand: "Champion", material: "Reverse weave", fit: "relaxed", created: "2024-10-14" },
  { id: "itm_zip_olive", name: "Half-Zip Fleece", category: "sweatshirt", subcategory: "Zip sweat", silhouette: "zip-hoodie", main: "olive", styles: ["sporty", "streetwear", "casual"], seasons: COLD, pattern: "texture", brand: "Patagonia", material: "Recycled fleece", fit: "relaxed", created: "2024-12-18" },

  // ── OUTERWEAR (5)
  { id: "itm_jkt_bomber", name: "MA-1 Bomber", category: "outerwear", subcategory: "Bomber jacket", silhouette: "bomber", main: "black", secondary: ["orange"], styles: ["streetwear", "contemporary"], seasons: TRANS, brand: "Alpha Industries", material: "Nylon", fit: "regular", created: "2024-09-12" },
  { id: "itm_jkt_trucker", name: "Vintage Trucker Jacket", category: "outerwear", subcategory: "Denim jacket", silhouette: "trucker", main: "lightdenim", styles: ["vintage", "casual", "streetwear"], seasons: TRANS.concat("summer"), pattern: "washed", brand: "Levi's", material: "Denim", fit: "regular", favorite: true, created: "2025-03-08" },
  { id: "itm_coat_camel", name: "Camel Overcoat", category: "outerwear", subcategory: "Overcoat", silhouette: "coat", main: "camel", styles: ["smart-casual", "minimal", "contemporary"], seasons: COLD, brand: "Studio Nicholson", material: "Wool blend", fit: "relaxed", created: "2024-11-20" },
  { id: "itm_jkt_puffer", name: "Matte Puffer Jacket", category: "outerwear", subcategory: "Puffer", silhouette: "puffer", main: "forest", styles: ["streetwear", "sporty"], seasons: ["winter"], brand: "The North Face", material: "Recycled nylon, down", fit: "oversized", created: "2024-12-01" },
  { id: "itm_blazer_char", name: "Unstructured Blazer", category: "outerwear", subcategory: "Blazer", silhouette: "blazer", main: "charcoal", styles: ["smart-casual", "contemporary", "minimal"], seasons: ALL, pattern: "texture", brand: "Boglioli", material: "Wool hopsack", fit: "regular", created: "2025-01-28" },

  // ── TROUSERS & JEANS (8)
  { id: "itm_jeans_raw", name: "Raw Selvedge Jeans", category: "bottom", subcategory: "Jeans", silhouette: "jeans", main: "denim", styles: ["vintage", "minimal", "casual"], seasons: ALL, brand: "A.P.C.", material: "Selvedge denim", fit: "slim", favorite: true, created: "2024-08-10" },
  { id: "itm_jeans_light", name: "Light Wash Loose Jeans", category: "bottom", subcategory: "Jeans", silhouette: "jeans", main: "lightdenim", styles: ["streetwear", "vintage", "casual"], seasons: ALL, pattern: "washed", brand: "Levi's 568", material: "Denim", fit: "relaxed", created: "2025-04-02" },
  { id: "itm_jeans_black", name: "Washed Black Jeans", category: "bottom", subcategory: "Jeans", silhouette: "jeans", main: "black", styles: ["streetwear", "minimal", "contemporary"], seasons: ALL, pattern: "washed", brand: "Acne Studios", material: "Denim", fit: "regular", created: "2024-09-01" },
  { id: "itm_chino_stone", name: "Pleated Chinos", category: "bottom", subcategory: "Chinos", silhouette: "trousers", main: "stone", styles: ["smart-casual", "minimal", "vintage"], seasons: ALL, brand: "Universal Works", material: "Cotton twill", fit: "relaxed", created: "2025-02-25" },
  { id: "itm_cargo_olive", name: "Ripstop Cargo Pants", category: "bottom", subcategory: "Cargo pants", silhouette: "cargo", main: "olive", styles: ["streetwear", "sporty", "casual"], seasons: NOT_SUMMER, pattern: "texture", brand: "Carhartt WIP", material: "Ripstop", fit: "relaxed", favorite: true, created: "2024-10-09" },
  { id: "itm_trouser_black", name: "Wide Wool Trousers", category: "bottom", subcategory: "Tailored trousers", silhouette: "wide-trousers", main: "black", styles: ["contemporary", "minimal", "smart-casual"], seasons: NOT_SUMMER, brand: "Our Legacy", material: "Wool", fit: "wide", formality: 4.5, created: "2024-11-05" },
  { id: "itm_trouser_grey", name: "Grey Flannel Trousers", category: "bottom", subcategory: "Tailored trousers", silhouette: "trousers", main: "grey", styles: ["smart-casual", "minimal"], seasons: COLD, pattern: "texture", brand: "Incotex", material: "Wool flannel", fit: "regular", formality: 4.5, created: "2024-11-05" },
  { id: "itm_jogger_black", name: "Technical Joggers", category: "bottom", subcategory: "Joggers", silhouette: "joggers", main: "charcoal", styles: ["sporty", "streetwear"], seasons: NOT_SUMMER, brand: "Arc'teryx Veilance", material: "Stretch nylon", fit: "slim", availability: "laundry", created: "2025-01-04" },

  // ── SHORTS (3)
  { id: "itm_short_denim", name: "Cut-Off Denim Shorts", category: "shorts", subcategory: "Denim shorts", silhouette: "shorts", main: "lightdenim", styles: ["vintage", "casual", "streetwear"], seasons: ["summer"], pattern: "washed", brand: "Levi's", material: "Denim", fit: "relaxed", created: "2025-06-05" },
  { id: "itm_short_chino", name: "Pleated Chino Shorts", category: "shorts", subcategory: "Chino shorts", silhouette: "shorts", main: "beige", styles: ["smart-casual", "casual", "minimal"], seasons: ["summer"], brand: "Arket", material: "Cotton twill", fit: "regular", formality: 2.5, created: "2025-05-28" },
  { id: "itm_short_nylon", name: "Nylon Trail Shorts", category: "shorts", subcategory: "Technical shorts", silhouette: "shorts", main: "black", styles: ["sporty", "streetwear"], seasons: ["summer"], brand: "Satisfy", material: "Nylon", fit: "regular", formality: 1, created: "2025-06-20" },

  // ── SHOES (6)
  { id: "itm_shoe_white", name: "White Leather Sneakers", category: "shoes", subcategory: "Low-top sneakers", silhouette: "sneaker", main: "white", styles: ["minimal", "casual", "smart-casual", "contemporary"], seasons: ALL, brand: "Common Projects", material: "Leather", favorite: true, created: "2024-07-15" },
  { id: "itm_shoe_retro", name: "Retro Runners", category: "shoes", subcategory: "Running sneakers", silhouette: "sneaker", main: "grey", secondary: ["red", "white"], styles: ["streetwear", "sporty", "vintage"], seasons: ALL, pattern: "graphic", brand: "New Balance 990", material: "Suede & mesh", created: "2025-03-30" },
  { id: "itm_shoe_hightop", name: "Canvas High-Tops", category: "shoes", subcategory: "High-top sneakers", silhouette: "high-sneaker", main: "black", secondary: ["white"], styles: ["streetwear", "vintage", "casual"], seasons: TRANS.concat("summer"), brand: "Converse Chuck 70", material: "Canvas", created: "2024-05-02" },
  { id: "itm_shoe_boot", name: "Suede Chelsea Boots", category: "shoes", subcategory: "Boots", silhouette: "boot", main: "brown", styles: ["smart-casual", "vintage", "contemporary"], seasons: COLD.concat("spring"), pattern: "texture", brand: "R.M. Williams", material: "Suede", formality: 3.8, created: "2024-10-25" },
  { id: "itm_shoe_loafer", name: "Penny Loafers", category: "shoes", subcategory: "Loafers", silhouette: "loafer", main: "black", styles: ["smart-casual", "contemporary", "vintage"], seasons: ALL, brand: "G.H. Bass", material: "Polished leather", created: "2025-01-10" },
  { id: "itm_shoe_derby", name: "Chunky Derby Shoes", category: "shoes", subcategory: "Derby shoes", silhouette: "derby", main: "black", styles: ["contemporary", "smart-casual", "minimal"], seasons: NOT_SUMMER, brand: "Dr. Martens 1461", material: "Leather", formality: 4, created: "2024-11-30" },

  // ── ACCESSORIES (5)
  { id: "itm_acc_cap", name: "Washed Six-Panel Cap", category: "accessory", subcategory: "Cap", silhouette: "cap", main: "navy", styles: ["streetwear", "casual", "sporty"], seasons: WARM.concat("autumn"), pattern: "washed", brand: "Noah", material: "Cotton twill", created: "2025-04-18" },
  { id: "itm_acc_beanie", name: "Ribbed Wool Beanie", category: "accessory", subcategory: "Beanie", silhouette: "beanie", main: "red", styles: ["streetwear", "casual", "vintage"], seasons: COLD, pattern: "texture", brand: "Acne Studios", material: "Wool", created: "2024-11-15" },
  { id: "itm_acc_tote", name: "Canvas Tote Bag", category: "accessory", subcategory: "Bag", silhouette: "tote", main: "ecru", secondary: ["black"], styles: ["minimal", "casual", "contemporary"], seasons: ALL, brand: "L.L.Bean", material: "Heavy canvas", created: "2024-06-01" },
  { id: "itm_acc_belt", name: "Leather Belt", category: "accessory", subcategory: "Belt", silhouette: "belt", main: "brown", styles: ["smart-casual", "vintage", "minimal"], seasons: ALL, brand: "Anderson's", material: "Bridle leather", created: "2024-08-02" },
  { id: "itm_acc_sunglasses", name: "Acetate Sunglasses", category: "accessory", subcategory: "Sunglasses", silhouette: "sunglasses", main: "black", styles: ["contemporary", "streetwear", "minimal"], seasons: WARM, brand: "Jacques Marie Mage", material: "Acetate", created: "2025-05-10" },
];

export const SEED_ITEMS: WardrobeItem[] = SPECS.map(make);
