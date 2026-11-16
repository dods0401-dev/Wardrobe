import type { ColorId, Fit, Silhouette, StyleTag } from "@/domain/types";
import { COLORS } from "@/domain/taxonomy";

/**
 * MOCK natural-language understanding.
 * Deterministic keyword matching over the optional free-text brief.
 * A production system would replace this with an LLM / intent parser behind the same output shape.
 */
export interface ParsedInstructions {
  boostColors: ColorId[];
  avoidColors: ColorId[];
  boostStyles: StyleTag[];
  boostFits: Fit[];
  avoidShapes: Silhouette[];
  requireShapes: Silhouette[];
  warmer: boolean;
  lighter: boolean;
  sharper: boolean;
  relaxed: boolean;
  tonal: boolean;
  colourPop: boolean;
  layered: boolean;
  /** Human-readable list of what was understood, for transparency in the UI. */
  understood: string[];
}

const SHAPE_WORDS: [RegExp, Silhouette[], string][] = [
  [/\bsneakers?\b|\btrainers?\b/, ["sneaker", "high-sneaker"], "sneakers"],
  [/\bboots?\b/, ["boot"], "boots"],
  [/\bloafers?\b/, ["loafer"], "loafers"],
  [/\bderb(y|ies)\b/, ["derby"], "derbies"],
  [/\bhoodies?\b/, ["hoodie"], "hoodie"],
  [/\bblazer\b/, ["blazer"], "blazer"],
  [/\bbomber\b/, ["bomber"], "bomber"],
  [/\bcoat\b/, ["coat"], "coat"],
  [/\bpuffer\b/, ["puffer"], "puffer"],
  [/\bjeans\b|\bdenim\b/, ["jeans"], "jeans"],
  [/\bcargos?\b/, ["cargo"], "cargos"],
  [/\bshorts\b/, ["shorts"], "shorts"],
  [/\bknit\b|\bsweater\b|\bjumper\b/, ["knit"], "knitwear"],
  [/\bovershirt\b/, ["overshirt"], "overshirt"],
  [/\bcap\b/, ["cap"], "cap"],
  [/\bbeanie\b/, ["beanie"], "beanie"],
];

const STYLE_WORDS: [RegExp, StyleTag][] = [
  [/street/, "streetwear"],
  [/minimal|clean|simple/, "minimal"],
  [/vintage|retro|archive|90s|80s/, "vintage"],
  [/smart|tailor|polished|office/, "smart-casual"],
  [/sport|athletic|gym|technical|gorpcore/, "sporty"],
  [/contemporary|modern|editorial/, "contemporary"],
  [/casual|easy|laid.?back/, "casual"],
];

const NEGATION = /\b(no|not|without|avoid|skip|except|nothing)\b/;

export const parseInstructions = (raw: string): ParsedInstructions => {
  const text = raw.toLowerCase();
  const out: ParsedInstructions = {
    boostColors: [],
    avoidColors: [],
    boostStyles: [],
    boostFits: [],
    avoidShapes: [],
    requireShapes: [],
    warmer: false,
    lighter: false,
    sharper: false,
    relaxed: false,
    tonal: false,
    colourPop: false,
    layered: false,
    understood: [],
  };
  if (!text.trim()) return out;

  // Split into clauses so "no sneakers, with boots" negates only the first clause.
  const clauses = text.split(/[,.;]| but | and /);
  for (const clause of clauses) {
    const negated = NEGATION.test(clause);
    for (const c of COLORS) {
      const re = new RegExp(`\\b${c.label.toLowerCase().replace(" ", "\\s?")}\\b`);
      if (re.test(clause)) {
        if (negated) {
          out.avoidColors.push(c.id);
          out.understood.push(`Avoid ${c.label.toLowerCase()}`);
        } else {
          out.boostColors.push(c.id);
          out.understood.push(`Lean on ${c.label.toLowerCase()}`);
        }
      }
    }
    for (const [re, shapes, label] of SHAPE_WORDS) {
      if (re.test(clause)) {
        if (negated) {
          out.avoidShapes.push(...shapes);
          out.understood.push(`No ${label}`);
        } else {
          out.requireShapes.push(...shapes);
          out.understood.push(`Include ${label}`);
        }
      }
    }
    if (!negated) {
      for (const [re, style] of STYLE_WORDS) {
        if (re.test(clause) && !out.boostStyles.includes(style)) {
          out.boostStyles.push(style);
          out.understood.push(`${style.replace("-", " ")} mood`);
        }
      }
    }
  }

  if (/cold|chilly|freezing|rain|wind|warm(er)?\b|cosy|cozy/.test(text)) {
    out.warmer = true;
    out.understood.push("Extra warmth");
  }
  if (/hot|heat|light(weight)?\b|breathable|sunny/.test(text)) {
    out.lighter = true;
    out.understood.push("Keep it light");
  }
  if (/sharp|dressy|dressed.?up|elevated|meeting|interview|date/.test(text)) {
    out.sharper = true;
    out.understood.push("Sharper finish");
  }
  if (/comfort|relaxed|loose|baggy|roomy|oversized/.test(text)) {
    out.relaxed = true;
    out.boostFits.push("relaxed", "oversized", "wide");
    out.understood.push("Relaxed fits");
  }
  if (/slim|fitted|tight/.test(text)) {
    out.boostFits.push("slim");
    out.understood.push("Slimmer fits");
  }
  if (/tonal|monochrome|all.?black|neutral|muted/.test(text)) {
    out.tonal = true;
    out.understood.push("Tonal palette");
  }
  if (/colou?r(ful)?|pop|bold|bright|statement/.test(text)) {
    out.colourPop = true;
    out.understood.push("Pop of colour");
  }
  if (/layer/.test(text)) {
    out.layered = true;
    out.understood.push("Layered");
  }

  out.understood = Array.from(new Set(out.understood));
  return out;
};
