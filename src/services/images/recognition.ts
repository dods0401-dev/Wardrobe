import type { Category, ColorId, Fit, Season, Silhouette, StyleTag } from "@/domain/types";
import { shapeDef } from "@/domain/garments";
import { browserImageService, type ImageService } from "./imageService";

/**
 * DEMO — simulated garment recognition.
 * Category is guessed from the file name; colours come from real pixel sampling.
 * A production adapter would call a vision model and return the same shape.
 */
export interface RecognitionResult {
  category: Category;
  shape: Silhouette;
  subcategory: string;
  mainColor: ColorId;
  secondaryColors: ColorId[];
  styles: StyleTag[];
  seasons: Season[];
  fit?: Fit;
  confidence: { category: number; color: number };
  isDemo: true;
}

export interface RecognitionService {
  analyze(file: File, preparedSrc: string): Promise<RecognitionResult>;
}

const KEYWORDS: [RegExp, Silhouette][] = [
  [/hood/, "hoodie"],
  [/crew|sweat/, "crewneck"],
  [/fleece|zip/, "zip-hoodie"],
  [/tank|vest/, "tank"],
  [/polo/, "polo"],
  [/knit|sweater|jumper|cardigan/, "knit"],
  [/long.?sleeve|\bls\b/, "longsleeve"],
  [/over.?shirt|shacket/, "overshirt"],
  [/shirt|oxford|flannel|blouse/, "shirt"],
  [/tee|t-?shirt|top/, "tee"],
  [/bomber/, "bomber"],
  [/trucker|denim.?jacket|jean.?jacket/, "trucker"],
  [/coat|trench|parka/, "coat"],
  [/puffer|down/, "puffer"],
  [/blazer|suit/, "blazer"],
  [/chore|jacket/, "chore"],
  [/short/, "shorts"],
  [/cargo/, "cargo"],
  [/jogger|track|sweatpant/, "joggers"],
  [/jean|denim/, "jeans"],
  [/trouser|pant|chino|slack/, "trousers"],
  [/boot/, "boot"],
  [/loafer/, "loafer"],
  [/derby|oxford.?shoe|brogue/, "derby"],
  [/high.?top|hi.?top/, "high-sneaker"],
  [/sneaker|trainer|shoe|runner/, "sneaker"],
  [/cap|hat/, "cap"],
  [/beanie/, "beanie"],
  [/tote|bag/, "tote"],
  [/belt/, "belt"],
  [/sunglass|glasses|shades/, "sunglasses"],
  [/scarf/, "scarf"],
];

const STYLE_GUESS: Partial<Record<Category, StyleTag[]>> = {
  top: ["casual", "minimal"],
  shirt: ["smart-casual", "casual"],
  sweatshirt: ["streetwear", "casual"],
  outerwear: ["contemporary", "casual"],
  bottom: ["casual", "minimal"],
  shorts: ["casual"],
  shoes: ["casual", "streetwear"],
  accessory: ["casual"],
};

const SEASON_GUESS: Partial<Record<Category, Season[]>> = {
  sweatshirt: ["spring", "autumn", "winter"],
  outerwear: ["autumn", "winter"],
  shorts: ["summer"],
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const createMockRecognition = (images: ImageService = browserImageService): RecognitionService => ({
  async analyze(file, preparedSrc) {
    const name = file.name.toLowerCase();
    const match = KEYWORDS.find(([re]) => re.test(name));
    const shape: Silhouette = match ? match[1] : "tee";
    const def = shapeDef(shape);
    let colors: ColorId[] = ["black"];
    try {
      colors = await images.dominantColors(preparedSrc);
    } catch {
      /* keep fallback */
    }
    // Simulated latency so the UI shows a realistic analysing state.
    await wait(700 + (file.size % 600));
    return {
      category: def.category,
      shape,
      subcategory: def.label,
      mainColor: colors[0] ?? "black",
      secondaryColors: colors.slice(1, 2).filter((c) => c !== colors[0]),
      styles: STYLE_GUESS[def.category] ?? ["casual"],
      seasons: SEASON_GUESS[def.category] ?? ["spring", "summer", "autumn", "winter"],
      fit: "regular",
      confidence: { category: match ? 0.82 : 0.34, color: 0.71 },
      isDemo: true,
    };
  },
});

export const mockRecognition = createMockRecognition();
