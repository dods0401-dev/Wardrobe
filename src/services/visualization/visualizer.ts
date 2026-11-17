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

const BACKDROPS = ["#ece8e1", "#e4e9e3", "#e9e4dc", "#e6e8ec", "#efe9e2", "#e2e7e1"];

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
