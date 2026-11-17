"use client";

import { useId, type ReactNode } from "react";
import type { ColorId, Pattern, Silhouette } from "@/domain/types";
import { colorHex } from "@/domain/taxonomy";

/**
 * Generated product cutouts for the demo dataset.
 * Each garment is drawn from its shape, colours and pattern, giving the whole
 * catalogue one consistent "studio flat-lay" treatment with transparent edges —
 * which is what the collage mode needs. Real photos replace these when uploaded.
 */

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt < 0 ? c * amt : (255 - c) * amt))));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

interface Palette {
  main: string;
  dark: string;
  line: string;
  light: string;
  second: string;
  third: string;
}

interface ShapeArt {
  viewBox: string;
  body: string;
  /** Additional filled parts drawn on top of the body (collars, soles, cuffs…). */
  parts?: (p: Palette) => ReactNode;
  /** Stroked construction lines. */
  lines?: string;
  /** Pattern is clipped to the body; some items (shoes/acc) skip pattern. */
  noPattern?: boolean;
}

const G = "0 0 200 240";
const S = "0 0 200 130";
const A = "0 0 200 160";

const ART: Record<Silhouette, ShapeArt> = {
  tee: {
    viewBox: G,
    body: "M78 24 Q100 38 122 24 L146 30 L182 58 L166 96 L146 86 L146 214 Q100 220 54 214 L54 86 L34 96 L18 58 L54 30 Z",
    lines: "M78 24 Q100 44 122 24 M54 86 L54 60 M146 86 L146 60 M54 206 Q100 212 146 206",
  },
  longsleeve: {
    viewBox: G,
    body: "M80 22 Q100 36 120 22 L142 28 L164 44 L182 168 L184 204 L162 206 L156 170 L146 104 L146 216 Q100 222 54 216 L54 104 L44 170 L38 206 L16 204 L18 168 L36 44 L58 28 Z",
    lines: "M80 22 Q100 42 120 22 M54 104 L54 60 M146 104 L146 60 M162 196 L183 194 M38 196 L17 194",
  },
  tank: {
    viewBox: G,
    body: "M72 20 L86 20 Q100 58 114 20 L128 20 Q130 62 150 76 L150 216 Q100 222 50 216 L50 76 Q70 62 72 20 Z",
    lines: "M86 20 Q100 64 114 20 M72 20 Q70 62 50 76 M128 20 Q130 62 150 76",
  },
  polo: {
    viewBox: G,
    body: "M78 24 Q100 34 122 24 L146 30 L180 58 L164 94 L146 86 L146 214 Q100 220 54 214 L54 86 L36 94 L20 58 L54 30 Z",
    parts: (p) => (
      <>
        <path d="M78 24 L100 34 L90 52 L72 30 Z M122 24 L100 34 L110 52 L128 30 Z" fill={p.dark} />
        <path d="M96 34 L104 34 L104 74 L96 74 Z" fill={p.dark} opacity={0.5} />
        <circle cx="100" cy="46" r="2" fill={p.light} />
        <circle cx="100" cy="60" r="2" fill={p.light} />
      </>
    ),
    lines: "M54 206 Q100 212 146 206",
  },
  knit: {
    viewBox: G,
    body: "M80 22 Q100 34 120 22 L144 28 L166 46 L182 166 L184 204 L160 206 L154 168 L146 106 L148 216 Q100 224 52 216 L54 106 L46 168 L40 206 L16 204 L18 166 L34 46 L56 28 Z",
    parts: (p) => (
      <>
        <path d="M80 22 Q100 34 120 22 L124 30 Q100 46 76 30 Z" fill={p.dark} />
        <path d="M52 202 Q100 210 148 202 L148 216 Q100 224 52 216 Z" fill={p.dark} />
        <path d="M160 192 L184 190 L184 204 L160 206 Z M40 192 L16 190 L16 204 L40 206 Z" fill={p.dark} />
      </>
    ),
    lines: "M86 70 L86 200 M100 72 L100 202 M114 70 L114 200 M72 66 L72 198 M128 66 L128 198",
  },
  shirt: {
    viewBox: G,
    body: "M80 20 L120 20 L142 28 L164 42 L182 166 L184 204 L162 206 L156 170 L146 104 L148 210 Q124 222 100 214 Q76 222 52 210 L54 104 L44 170 L38 206 L16 204 L18 166 L36 42 L58 28 Z",
    parts: (p) => (
      <>
        <path d="M80 20 L100 38 L84 50 L70 28 Z M120 20 L100 38 L116 50 L130 28 Z" fill={p.light} stroke={p.line} strokeWidth="1" />
        <path d="M162 190 L184 188 L184 204 L162 206 Z M38 190 L16 188 L16 204 L38 206 Z" fill={p.dark} opacity={0.35} />
        {[60, 84, 108, 132, 156, 180].map((y) => (
          <circle key={y} cx="100" cy={y} r="2.2" fill={p.light} stroke={p.line} strokeWidth="0.6" />
        ))}
      </>
    ),
    lines: "M100 38 L100 214 M60 70 L80 70 L80 92 L60 92 Z",
  },
  overshirt: {
    viewBox: G,
    body: "M78 18 L122 18 L144 26 L166 40 L184 164 L186 204 L162 206 L156 170 L148 104 L150 214 Q100 222 50 214 L52 104 L44 170 L38 206 L14 204 L16 164 L34 40 L56 26 Z",
    parts: (p) => (
      <>
        <path d="M78 18 L100 36 L82 52 L66 26 Z M122 18 L100 36 L118 52 L134 26 Z" fill={p.dark} />
        <path d="M60 64 L88 64 L88 98 L60 98 Z M112 64 L140 64 L140 98 L112 98 Z" fill={p.dark} opacity={0.3} />
        <path d="M60 64 L88 64 L88 74 L60 74 Z M112 64 L140 64 L140 74 L112 74 Z" fill={p.dark} opacity={0.55} />
        {[58, 88, 118, 148, 178].map((y) => (
          <circle key={y} cx="100" cy={y} r="2.6" fill={p.dark} />
        ))}
      </>
    ),
    lines: "M100 36 L100 216",
  },
  hoodie: {
    viewBox: G,
    body: "M72 30 Q66 4 100 2 Q134 4 128 30 L146 34 L166 50 L182 168 L184 206 L160 208 L154 170 L148 110 L150 216 Q100 224 50 216 L52 110 L46 170 L40 208 L16 206 L18 168 L34 50 L54 34 Z",
    parts: (p) => (
      <>
        <path d="M78 34 Q100 52 122 34 Q120 12 100 10 Q80 12 78 34 Z" fill={p.dark} />
        <path d="M66 150 L134 150 L144 194 L56 194 Z" fill={p.dark} opacity={0.22} />
        <path d="M50 202 Q100 210 150 202 L150 216 Q100 224 50 216 Z M160 194 L184 192 L184 206 L160 208 Z M40 194 L16 192 L16 206 L40 208 Z" fill={p.dark} opacity={0.55} />
        <path d="M92 46 L90 80 M108 46 L110 80" stroke={p.light} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ),
  },
  crewneck: {
    viewBox: G,
    body: "M80 24 Q100 36 120 24 L144 30 L166 48 L182 168 L184 206 L160 208 L154 170 L148 108 L150 216 Q100 224 50 216 L52 108 L46 170 L40 208 L16 206 L18 168 L34 48 L56 30 Z",
    parts: (p) => (
      <>
        <path d="M80 24 Q100 36 120 24 L126 32 Q100 50 74 32 Z" fill={p.dark} />
        <path d="M50 200 Q100 208 150 200 L150 216 Q100 224 50 216 Z M160 192 L184 190 L184 206 L160 208 Z M40 192 L16 190 L16 206 L40 208 Z" fill={p.dark} opacity={0.6} />
        <path d="M92 40 L100 52 L108 40" fill="none" stroke={p.dark} strokeWidth="3" />
      </>
    ),
  },
  "zip-hoodie": {
    viewBox: G,
    body: "M78 14 L122 14 L124 30 L146 34 L166 50 L182 168 L184 206 L160 208 L154 170 L148 108 L150 216 Q100 224 50 216 L52 108 L46 170 L40 208 L16 206 L18 168 L34 50 L54 34 L76 30 Z",
    parts: (p) => (
      <>
        <path d="M78 14 L122 14 L124 32 Q100 40 76 32 Z" fill={p.dark} />
        <path d="M99 14 L101 14 L101 96 L99 96 Z" fill={p.line} />
        <rect x="96" y="92" width="8" height="12" rx="2" fill={p.light} />
        <path d="M60 120 L84 120 L84 150 L60 150 Z" fill={p.dark} opacity={0.3} />
      </>
    ),
    lines: "M50 204 Q100 212 150 204",
  },
  bomber: {
    viewBox: G,
    body: "M78 22 L122 22 L150 32 L170 52 L184 162 L182 198 L160 200 L154 164 L150 110 L152 196 Q100 206 48 196 L50 110 L46 164 L40 200 L18 198 L16 162 L30 52 L50 32 Z",
    parts: (p) => (
      <>
        <path d="M78 22 L122 22 L124 34 Q100 44 76 34 Z" fill={p.dark} />
        <path d="M98 34 L102 34 L102 200 L98 200 Z" fill={p.second} />
        <path d="M48 186 Q100 196 152 186 L152 208 Q100 216 48 208 Z" fill={p.dark} />
        <path d="M160 186 L182 184 L182 200 L160 202 Z M40 186 L18 184 L18 200 L40 202 Z" fill={p.dark} />
        <path d="M126 60 L144 60 L144 68 L126 68 Z" fill={p.dark} opacity={0.6} />
      </>
    ),
    lines: "M60 120 L74 150 M140 120 L126 150",
  },
  trucker: {
    viewBox: G,
    body: "M78 20 L122 20 L146 28 L168 44 L184 162 L184 198 L162 200 L156 166 L148 104 L150 192 L52 192 L52 104 L44 166 L38 200 L16 198 L16 162 L32 44 L54 28 Z",
    parts: (p) => (
      <>
        <path d="M78 20 L100 40 L80 56 L64 28 Z M122 20 L100 40 L120 56 L136 28 Z" fill={p.dark} />
        <path d="M60 70 L88 70 L88 80 L74 84 L60 80 Z M112 70 L140 70 L140 80 L126 84 L112 80 Z" fill={p.dark} opacity={0.5} />
        <path d="M52 172 L150 172 L150 192 L52 192 Z" fill={p.dark} opacity={0.35} />
        {[66, 100, 134, 182].map((y) => (
          <circle key={y} cx="100" cy={y} r="3" fill="#c49a4a" />
        ))}
      </>
    ),
    lines: "M100 40 L100 192 M74 84 L74 172 M126 84 L126 172",
  },
  coat: {
    viewBox: "0 0 200 260",
    body: "M76 14 L124 14 L148 24 L168 40 L184 170 L184 208 L162 210 L156 172 L150 112 L156 252 L44 252 L50 112 L44 172 L38 210 L16 208 L16 170 L32 40 L52 24 Z",
    parts: (p) => (
      <>
        <path d="M76 14 L100 60 L104 110 L84 70 L64 40 L70 24 Z" fill={p.dark} />
        <path d="M124 14 L100 60 L96 110 L116 70 L136 40 L130 24 Z" fill={p.dark} opacity={0.75} />
        <circle cx="112" cy="128" r="3.5" fill={p.line} />
        <circle cx="112" cy="168" r="3.5" fill={p.line} />
        <path d="M62 170 L84 166 M138 170 L116 166" stroke={p.line} strokeWidth="2" />
      </>
    ),
    lines: "M100 110 L100 252",
  },
  puffer: {
    viewBox: G,
    body: "M74 14 L126 14 L130 30 L156 36 L176 56 L190 160 L188 200 L162 202 L156 166 L152 120 L156 206 Q100 216 44 206 L48 120 L44 166 L38 202 L12 200 L10 160 L24 56 L44 36 L70 30 Z",
    parts: (p) => (
      <>
        <path d="M74 14 L126 14 L130 34 Q100 42 70 34 Z" fill={p.dark} />
        <path d="M99 30 L101 30 L101 210 L99 210 Z" fill={p.line} />
      </>
    ),
    lines:
      "M46 72 Q100 80 154 72 M46 104 Q100 112 154 104 M47 136 Q100 144 153 136 M47 168 Q100 176 153 168 M24 92 L40 90 M22 124 L44 122 M176 92 L160 90 M178 124 L156 122 M16 156 L44 154 M184 156 L156 154",
  },
  blazer: {
    viewBox: "0 0 200 250",
    body: "M76 16 L124 16 L148 24 L168 40 L184 166 L184 204 L162 206 L156 168 L150 108 L154 222 Q130 236 100 226 Q70 236 46 222 L50 108 L44 168 L38 206 L16 204 L16 166 L32 40 L52 24 Z",
    parts: (p) => (
      <>
        <path d="M76 16 L94 120 L100 126 L86 72 L74 64 L82 50 L68 30 Z" fill={p.dark} />
        <path d="M124 16 L106 120 L100 126 L114 72 L126 64 L118 50 L132 30 Z" fill={p.dark} opacity={0.8} />
        <path d="M84 16 L100 70 L116 16 Z" fill={p.third} />
        <circle cx="100" cy="148" r="3.4" fill={p.line} />
        <path d="M58 170 L84 168 M116 168 L142 170 M120 78 L140 76" stroke={p.line} strokeWidth="2" />
      </>
    ),
    lines: "M100 126 L100 226",
  },
  chore: {
    viewBox: G,
    body: "M78 18 L122 18 L146 26 L168 42 L184 164 L184 202 L162 204 L156 168 L148 104 L150 206 L50 206 L52 104 L44 168 L38 204 L16 202 L16 164 L32 42 L54 26 Z",
    parts: (p) => (
      <>
        <path d="M78 18 L100 34 L84 48 L66 26 Z M122 18 L100 34 L116 48 L134 26 Z" fill={p.dark} />
        <path d="M60 70 L86 70 L86 96 L60 96 Z M58 140 L88 140 L88 176 L58 176 Z M112 140 L142 140 L142 176 L112 176 Z" fill={p.dark} opacity={0.3} />
        {[52, 86, 120, 154, 188].map((y) => (
          <circle key={y} cx="100" cy={y} r="2.8" fill={p.dark} />
        ))}
      </>
    ),
    lines: "M100 34 L100 206",
  },
  jeans: {
    viewBox: G,
    body: "M58 10 L142 10 L148 34 L156 230 L114 232 L102 80 L98 80 L86 232 L44 230 L52 34 Z",
    parts: (p) => <path d="M58 10 L142 10 L144 24 L56 24 Z" fill={p.dark} />,
    lines: "M100 24 L100 72 M92 24 Q92 60 100 72 M56 24 Q76 30 80 46 M144 24 Q124 30 120 46 M46 222 L86 224 M114 224 L154 222",
  },
  trousers: {
    viewBox: G,
    body: "M60 10 L140 10 L146 36 L152 230 L112 232 L101 82 L99 82 L88 232 L48 230 L54 36 Z",
    parts: (p) => <path d="M60 10 L140 10 L142 22 L58 22 Z" fill={p.dark} />,
    lines: "M100 22 L100 76 M74 22 L70 230 M126 22 L130 230 M82 22 L82 40 M118 22 L118 40",
  },
  cargo: {
    viewBox: G,
    body: "M56 10 L144 10 L152 36 L162 228 L114 232 L102 84 L98 84 L86 232 L38 228 L48 36 Z",
    parts: (p) => (
      <>
        <path d="M56 10 L144 10 L146 24 L54 24 Z" fill={p.dark} />
        <path d="M42 112 L66 112 L68 154 L40 154 Z M158 112 L134 112 L132 154 L160 154 Z" fill={p.dark} opacity={0.35} />
        <path d="M42 112 L66 112 L66 122 L42 122 Z M158 112 L134 112 L134 122 L158 122 Z" fill={p.dark} opacity={0.55} />
      </>
    ),
    lines: "M100 24 L100 74 M54 180 L84 180 M146 180 L116 180",
  },
  "wide-trousers": {
    viewBox: G,
    body: "M62 10 L138 10 L146 36 L170 230 L110 232 L101 84 L99 84 L90 232 L30 230 L54 36 Z",
    parts: (p) => <path d="M62 10 L138 10 L140 22 L60 22 Z" fill={p.dark} />,
    lines: "M100 22 L100 76 M80 22 L64 230 M120 22 L136 230 M86 22 L86 44 M114 22 L114 44",
  },
  joggers: {
    viewBox: G,
    body: "M58 10 L142 10 L148 36 L150 200 L146 230 L116 232 L112 200 L102 84 L98 84 L88 200 L84 232 L54 230 L50 200 L52 36 Z",
    parts: (p) => (
      <>
        <path d="M58 10 L142 10 L144 26 L56 26 Z" fill={p.dark} />
        <path d="M50 206 L88 206 L84 232 L54 230 Z M150 206 L112 206 L116 232 L146 230 Z" fill={p.dark} />
        <path d="M96 26 L94 44 M104 26 L106 44" stroke={p.light} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    lines: "M54 40 L54 196 M146 40 L146 196",
  },
  shorts: {
    viewBox: "0 0 200 170",
    body: "M52 14 L148 14 L156 40 L166 148 L112 154 L101 76 L99 76 L88 154 L34 148 L44 40 Z",
    parts: (p) => <path d="M52 14 L148 14 L150 28 L50 28 Z" fill={p.dark} />,
    lines: "M100 28 L100 70 M50 28 Q70 34 74 50 M150 28 Q130 34 126 50 M36 138 L88 144 M112 144 L164 138",
  },
  sneaker: {
    viewBox: S,
    body: "M20 86 Q18 58 40 54 L76 46 Q90 26 112 30 L128 34 Q150 52 180 66 Q194 72 192 92 L192 100 L20 100 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M18 96 L194 96 Q196 110 182 112 L28 112 Q16 110 18 96 Z" fill={p.light === "#ffffff" ? "#e9e5dc" : "#f2efe8"} stroke={p.line} strokeWidth="1" />
        <path d="M86 46 Q104 70 140 76 Q120 84 92 80 Z" fill={p.second} opacity={0.9} />
        <path d="M150 58 Q160 72 186 74" fill="none" stroke={p.dark} strokeWidth="2" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${92 + i * 10} ${38 + i * 3} L${102 + i * 10} ${44 + i * 3}`} stroke={p.light} strokeWidth="3" strokeLinecap="round" />
        ))}
      </>
    ),
    lines: "M20 86 L192 86",
  },
  "high-sneaker": {
    viewBox: S,
    body: "M28 92 Q24 30 34 12 L84 10 Q92 30 104 40 L132 50 Q160 60 184 72 Q194 78 192 94 L192 100 L28 100 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M24 96 L194 96 Q196 112 182 114 L36 114 Q22 112 24 96 Z" fill="#f2efe8" stroke={p.line} strokeWidth="1" />
        <path d="M160 64 Q182 70 192 82 L192 92 Q176 76 156 74 Z" fill="#f2efe8" />
        <circle cx="44" cy="62" r="7" fill="#f2efe8" stroke={p.line} strokeWidth="1" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${80 + i * 7} ${16 + i * 7} L${92 + i * 7} ${20 + i * 7}`} stroke={p.light} strokeWidth="3" strokeLinecap="round" />
        ))}
      </>
    ),
  },
  boot: {
    viewBox: S,
    body: "M40 98 L36 8 L96 8 L100 54 Q140 58 176 70 Q194 78 192 98 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M34 96 L194 96 L194 110 L34 110 Z" fill={p.dark} />
        <path d="M62 10 Q74 34 70 62 L94 60 Q98 34 90 10 Z" fill={p.dark} opacity={0.55} />
        <path d="M38 8 L50 0 L54 10 Z" fill={p.dark} />
      </>
    ),
  },
  loafer: {
    viewBox: S,
    body: "M18 100 Q14 74 36 70 L78 62 Q120 56 162 66 Q192 74 190 100 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M16 98 L192 98 L192 108 Q190 112 180 112 L28 112 Q16 110 16 98 Z" fill={p.dark} />
        <path d="M96 64 Q130 60 156 70 L150 80 Q124 72 100 76 Z" fill={p.dark} opacity={0.6} />
        <path d="M118 70 L136 70 L134 76 L120 76 Z" fill={p.light} opacity={0.6} />
      </>
    ),
    lines: "M96 64 Q90 82 100 98",
  },
  derby: {
    viewBox: S,
    body: "M18 94 Q14 62 40 58 L84 50 Q102 40 120 46 Q160 56 182 68 Q196 76 194 94 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M14 90 L196 90 L196 112 Q194 118 184 118 L24 118 Q14 116 14 106 Z" fill={shade(p.main, -0.35)} />
        <path d="M14 104 L196 104" stroke={p.light} strokeWidth="1.2" strokeDasharray="3 3" opacity={0.6} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${94 + i * 12} ${50 + i * 4} L${108 + i * 12} ${54 + i * 4}`} stroke={p.light} strokeWidth="2" strokeLinecap="round" />
        ))}
      </>
    ),
    lines: "M84 50 Q96 76 132 66",
  },
  cap: {
    viewBox: A,
    body: "M34 104 Q30 30 104 26 Q170 30 166 104 Z",
    parts: (p) => (
      <>
        <path d="M120 98 Q172 92 196 116 Q160 124 112 114 Z" fill={p.dark} />
        <circle cx="102" cy="27" r="5" fill={p.dark} />
      </>
    ),
    lines: "M102 28 Q86 60 82 104 M102 28 Q120 60 126 102 M34 98 L166 98",
  },
  beanie: {
    viewBox: A,
    body: "M40 120 Q34 20 100 18 Q166 20 160 120 Z",
    parts: (p) => <path d="M34 92 L166 92 L166 132 Q100 140 34 132 Z" fill={p.dark} />,
    lines: "M60 40 L56 92 M80 26 L78 92 M100 20 L100 92 M120 26 L122 92 M140 40 L144 92",
  },
  tote: {
    viewBox: "0 0 200 210",
    body: "M30 70 L170 70 L162 200 L38 200 Z",
    parts: (p) => (
      <>
        <path d="M64 72 Q64 10 100 10 Q136 10 136 72" fill="none" stroke={p.second} strokeWidth="9" />
        <path d="M64 72 L64 110 M136 72 L136 110" stroke={p.second} strokeWidth="9" />
      </>
    ),
  },
  crossbody: {
    viewBox: A,
    body: "M50 70 L150 70 Q160 70 160 82 L160 140 Q160 150 150 150 L50 150 Q40 150 40 140 L40 82 Q40 70 50 70 Z",
    parts: (p) => (
      <>
        <path d="M44 72 Q100 -30 156 72" fill="none" stroke={p.dark} strokeWidth="6" />
        <path d="M40 92 L160 92" stroke={p.line} strokeWidth="2" />
        <rect x="92" y="88" width="16" height="10" rx="2" fill={p.light} />
      </>
    ),
  },
  belt: {
    viewBox: A,
    body: "M10 64 L190 64 L190 92 L10 92 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <rect x="18" y="56" width="34" height="44" rx="4" fill="none" stroke="#b58d3c" strokeWidth="6" />
        <path d="M35 64 L35 92" stroke="#b58d3c" strokeWidth="4" />
        {[90, 110, 130, 150].map((x) => (
          <circle key={x} cx={x} cy="78" r="3" fill={p.dark} />
        ))}
      </>
    ),
    lines: "M10 69 L190 69 M10 87 L190 87",
  },
  sunglasses: {
    viewBox: A,
    body: "M14 62 Q14 54 24 54 L84 54 Q92 54 92 62 L90 92 Q88 112 66 112 L40 112 Q16 112 14 92 Z M108 62 Q108 54 116 54 L176 54 Q186 54 186 62 L186 92 Q184 112 160 112 L134 112 Q112 112 110 92 Z",
    noPattern: true,
    parts: (p) => (
      <>
        <path d="M92 64 Q100 56 108 64" fill="none" stroke={p.main} strokeWidth="6" />
        <path d="M24 66 L80 66 L78 92 Q76 102 64 102 L42 102 Q28 102 26 92 Z M120 66 L176 66 L174 92 Q172 102 158 102 L136 102 Q124 102 122 92 Z" fill="#2b2b2b" />
        <path d="M32 72 L48 72 M128 72 L144 72" stroke="#ffffff" strokeWidth="3" opacity={0.35} strokeLinecap="round" />
      </>
    ),
  },
  scarf: {
    viewBox: G,
    body: "M50 20 Q100 50 150 20 L156 40 Q120 70 110 80 L118 220 L84 220 L84 80 Q60 62 46 40 Z",
    lines: "M84 210 L84 230 M92 210 L92 230 M100 210 L100 230 M108 210 L108 230 M116 210 L116 230",
  },
};

/** Pattern fills drawn over the body (clipped). */
const PatternFill = ({ pattern, p, id }: { pattern: Pattern; p: Palette; id: string }) => {
  switch (pattern) {
    case "stripe":
      return (
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="5" fill={p.second} />
        </pattern>
      );
    case "check":
      return (
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <rect width="28" height="10" fill={p.second} opacity={0.55} />
          <rect width="10" height="28" fill={p.second} opacity={0.45} />
          <rect x="18" width="2" height="28" fill={p.third} opacity={0.6} />
          <rect y="18" width="28" height="2" fill={p.third} opacity={0.6} />
        </pattern>
      );
    case "texture":
      return (
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.9" fill={p.dark} opacity={0.35} />
          <circle cx="4.5" cy="4.5" r="0.9" fill={p.light} opacity={0.25} />
        </pattern>
      );
    case "camo":
      return (
        <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M5 10 Q20 0 30 12 Q24 26 8 22 Z M36 34 Q52 28 56 44 Q44 56 34 46 Z" fill={p.dark} opacity={0.55} />
          <path d="M30 2 Q44 6 40 18 Q30 22 28 12 Z M6 40 Q20 36 22 50 Q10 58 4 50 Z" fill={p.second} opacity={0.5} />
        </pattern>
      );
    case "washed":
      return (
        <radialGradient id={id} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.28} />
          <stop offset="70%" stopColor="#ffffff" stopOpacity={0.05} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.12} />
        </radialGradient>
      );
    default:
      return null;
  }
};

export interface GarmentArtProps {
  shape: Silhouette;
  main: ColorId;
  secondary?: ColorId[];
  pattern?: Pattern;
  className?: string;
  title?: string;
  shadow?: boolean;
  /** Position when nested inside another SVG. */
  frame?: { x: number; y: number; width: number; height: number };
  flip?: boolean;
}

export function GarmentArt({ shape, main, secondary = [], pattern = "solid", className, title, shadow = true, frame, flip }: GarmentArtProps) {
  const uid = useId().replace(/:/g, "");
  const art = ART[shape] ?? ART.tee;
  const mainHex = colorHex(main);
  const dark = lum(mainHex) < 0.18;
  const p: Palette = {
    main: mainHex,
    dark: dark ? shade(mainHex, 0.18) : shade(mainHex, -0.22),
    line: dark ? shade(mainHex, 0.32) : shade(mainHex, -0.38),
    light: lum(mainHex) > 0.8 ? "#ffffff" : shade(mainHex, 0.55),
    second: colorHex(secondary[0] ?? (dark ? "white" : "black")),
    third: colorHex(secondary[1] ?? secondary[0] ?? (dark ? "grey" : "charcoal")),
  };
  const [, , w, h] = art.viewBox.split(" ").map(Number);
  const showPattern = pattern !== "solid" && !art.noPattern;
  const isGraphic = pattern === "graphic" && !art.noPattern;

  return (
    <svg
      viewBox={art.viewBox}
      className={className}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      overflow="visible"
      {...frame}
    >
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={`c${uid}`}>
          <path d={art.body} />
        </clipPath>
        <linearGradient id={`l${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 0.16 : 0.3} />
          <stop offset="45%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={dark ? 0.25 : 0.14} />
        </linearGradient>
        {/* Fabric sheen + ambient occlusion */}
        <radialGradient id={`h${uid}`} cx="34%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 0.18 : 0.42} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`a${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="70%" stopColor="#000000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.12} />
        </linearGradient>
        <radialGradient id={`s${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2b2a28" stopOpacity={0.22} />
          <stop offset="100%" stopColor="#2b2a28" stopOpacity={0} />
        </radialGradient>
        {showPattern && !isGraphic && <PatternFill pattern={pattern} p={p} id={`p${uid}`} />}
      </defs>
      <g transform={flip ? `translate(${w} 0) scale(-1 1)` : undefined}>
      {shadow && <ellipse cx={w / 2} cy={h - 4} rx={w * 0.4} ry={7} fill={`url(#s${uid})`} />}
      <path d={art.body} fill={p.main} stroke={p.line} strokeOpacity={0.55} strokeWidth="0.9" strokeLinejoin="round" />
      <g clipPath={`url(#c${uid})`}>
        {showPattern && !isGraphic && <rect width={w} height={h} fill={`url(#p${uid})`} />}
        {isGraphic && (
          <g>
            <rect x={w / 2 - 28} y={62} width={56} height={44} fill={p.second} opacity={0.9} />
            <rect x={w / 2 - 22} y={68} width={44} height={8} fill={p.main} />
            <rect x={w / 2 - 22} y={82} width={30} height={5} fill={p.third} />
            <rect x={w / 2 - 22} y={92} width={38} height={5} fill={p.third} />
          </g>
        )}
        <rect width={w} height={h} fill={`url(#l${uid})`} />
        <rect width={w} height={h} fill={`url(#h${uid})`} />
        <rect width={w} height={h} fill={`url(#a${uid})`} />
      </g>
      {art.parts?.(p)}
      {art.lines && <path d={art.lines} fill="none" stroke={p.line} strokeWidth="0.9" strokeLinecap="round" opacity={0.5} />}
      </g>
    </svg>
  );
}
