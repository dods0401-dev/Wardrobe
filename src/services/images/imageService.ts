import type { ColorId } from "@/domain/types";
import { COLORS } from "@/domain/taxonomy";

/**
 * Browser image utilities. Uploads are downscaled and re-encoded so they fit
 * comfortably in local storage. A backend implementation would upload to object
 * storage and return URLs (plus an optional background-removed cutout).
 */
export interface ImageService {
  prepareUpload(file: File): Promise<string>;
  dominantColors(src: string): Promise<ColorId[]>;
}

const MAX_EDGE = 640;
const QUALITY = 0.8;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This file could not be read as an image."));
    img.src = src;
  });

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("The file could not be read."));
    r.readAsDataURL(file);
  });

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const nearestColor = (r: number, g: number, b: number): ColorId => {
  let best: ColorId = "black";
  let bestD = Infinity;
  for (const c of COLORS) {
    const [cr, cg, cb] = hexToRgb(c.hex);
    // Weighted euclidean distance (approximates perceived difference).
    const d = 2 * (cr - r) ** 2 + 4 * (cg - g) ** 2 + 3 * (cb - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c.id;
    }
  }
  return best;
};

export const browserImageService: ImageService = {
  async prepareUpload(file) {
    if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
    if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} is larger than 15 MB.`);
    const src = await readAsDataURL(file);
    const img = await loadImage(src);
    const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", QUALITY);
  },

  /** Samples the central region, buckets pixels to the palette and returns the top matches. */
  async dominantColors(src) {
    const img = await loadImage(src);
    const size = 48;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return ["black"];
    // Crop to the centre 60% where the garment usually is.
    const sw = img.width * 0.6;
    const sh = img.height * 0.6;
    ctx.drawImage(img, img.width * 0.2, img.height * 0.2, sw, sh, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const tally = new Map<ColorId, number>();
    for (let i = 0; i < data.length; i += 4) {
      const c = nearestColor(data[i], data[i + 1], data[i + 2]);
      tally.set(c, (tally.get(c) ?? 0) + 1);
    }
    return [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 3);
  },
};
