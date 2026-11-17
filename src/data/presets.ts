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
    tone: "bg-[linear-gradient(140deg,#f4efe7,#e6ddcf)] text-ink",
    request: { occasion: "smart-casual", styles: ["minimal"], instructions: "tonal, layered, warm" },
  },
  {
    id: "off-duty-utility",
    title: "Off-duty utility",
    blurb: "Cargos, fleece and runners. Weekend errands with intent.",
    tone: "bg-[linear-gradient(140deg,#e7f1ea,#c9dfd0)] text-ink",
    request: { occasion: "weekend", styles: ["streetwear", "sporty"], instructions: "relaxed, comfortable" },
  },
  {
    id: "gallery-opening",
    title: "Gallery opening",
    blurb: "Sharp but unbuttoned. Tailoring with a little edge.",
    tone: "bg-[linear-gradient(140deg,#f6ebe5,#e3cfc4)] text-ink",
    request: { occasion: "evening", styles: ["contemporary"], instructions: "sharp, no sneakers" },
  },
];
