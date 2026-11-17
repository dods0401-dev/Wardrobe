import type { StylistRequest } from "@/domain/types";

/** Editorial "moods" that pre-fill the Stylist form. */
export const PRESETS: {
  id: string;
  title: string;
  blurb: string;
  tone: string;
  request: Partial<StylistRequest>;
}[] = [
  {
    id: "tonal-layers",
    title: "Tonal layers",
    blurb: "Quiet neutrals, stacked for the cold. One texture doing the work.",
    tone: "bg-[#ece7df] text-ink",
    request: { occasion: "smart-casual", styles: ["minimal"], instructions: "tonal, layered, warm" },
  },
  {
    id: "off-duty-utility",
    title: "Off-duty utility",
    blurb: "Cargos, fleece and runners. Weekend errands with intent.",
    tone: "bg-sage text-ink",
    request: { occasion: "weekend", styles: ["streetwear", "sporty"], instructions: "relaxed, comfortable" },
  },
  {
    id: "gallery-opening",
    title: "Gallery opening",
    blurb: "Sharp but unbuttoned. Tailoring with a little edge.",
    tone: "bg-[#e3e7ec] text-ink",
    request: { occasion: "evening", styles: ["contemporary"], instructions: "sharp, no sneakers" },
  },
];
