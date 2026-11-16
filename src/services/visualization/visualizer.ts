import type { Outfit } from "@/domain/types";
import { hash } from "@/lib/util";

/**
 * Outfit visualisation contract.
 *  - "collage": composed client-side from the user's real item images (always truthful).
 *  - "ai": a model-worn look. In this prototype it is a SIMULATED editorial render built from
 *    the outfit's own colours and shapes — no image generation runs. A production adapter would
 *    call an image model and return { kind: "image", url }.
 */
export type LookRender =
  | { kind: "simulated"; backdrop: string; pose: 0 | 1 | 2; grain: number; caption: string }
  | { kind: "image"; url: string; caption: string };

export interface LookVisualizer {
  readonly isDemo: boolean;
  render(outfit: Pick<Outfit, "id" | "name" | "style">): LookRender;
}

const BACKDROPS = ["#d8d4cb", "#c9c3b5", "#b7c5a4", "#e2ddd2", "#cfc6b4", "#bfc4bd"];

export const simulatedLookVisualizer: LookVisualizer = {
  isDemo: true,
  render(outfit) {
    const h = hash(outfit.id);
    return {
      kind: "simulated",
      backdrop: BACKDROPS[h % BACKDROPS.length],
      pose: (h % 3) as 0 | 1 | 2,
      grain: 0.08 + (h % 5) / 100,
      caption: `${outfit.name} — illustrative render, not a photo of your garments`,
    };
  },
};
