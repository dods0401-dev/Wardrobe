"use client";

import type { Outfit } from "@/domain/types";
import type { ResolvedPiece } from "@/hooks/useDerived";
import { services } from "@/services";
import { GarmentArt } from "../garment/GarmentArt";
import { cn } from "../ui/cn";

/**
 * MODE B — simulated "AI generated look".
 * An illustrative figure dressed with stylised versions of the outfit's garments
 * (shape + colour only). It is never presented as a photo of the user's clothes.
 */
export function AiLook({
  outfit,
  pieces,
  className,
}: {
  outfit: Pick<Outfit, "id" | "name" | "style">;
  pieces: ResolvedPiece[];
  className?: string;
}) {
  const render = services.visualizer.render(outfit);
  const get = (slot: string) => pieces.find((p) => p.slot === slot)?.item;
  const base = get("base");
  const layer = get("layer");
  const outer = get("outerwear");
  const bottom = get("bottom");
  const shoes = get("shoes");
  const acc = get("accessory");
  const skin = "#c9b8a6";
  const backdrop = render.kind === "simulated" ? render.backdrop : "#d8d4cb";
  const pose = render.kind === "simulated" ? render.pose : 0;
  const art = (it: NonNullable<typeof base>, frame: { x: number; y: number; width: number; height: number }, flip = false) => (
    <GarmentArt shape={it.shape} main={it.mainColor} secondary={it.secondaryColors} pattern={it.pattern} frame={frame} shadow={false} flip={flip} />
  );
  const shorts = bottom?.category === "shorts";
  const coatLong = outer && (outer.shape === "coat" || outer.shape === "blazer");

  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden grain", className)} style={{ background: backdrop }} data-mode="ai">
      <svg viewBox="0 0 320 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {/* set */}
        {pose === 0 && <circle cx="250" cy="90" r="70" fill="#ffffff" opacity="0.25" />}
        {pose === 1 && <rect x="0" y="250" width="320" height="150" fill="#000" opacity="0.06" />}
        {pose === 2 && <rect x="196" y="0" width="124" height="400" fill="#ffffff" opacity="0.18" />}
        <ellipse cx="160" cy="388" rx="90" ry="8" fill="#000" opacity="0.12" />
        <g transform={pose === 1 ? "translate(-10 0)" : pose === 2 ? "translate(6 0)" : undefined}>
          {/* legs */}
          <path d="M138 210 L134 380 L150 380 L158 230 L162 230 L170 380 L186 380 L182 210 Z" fill={skin} />
          {/* arms */}
          <path d="M104 92 Q92 160 96 248 L108 248 Q110 170 118 110 Z M216 92 Q228 160 224 248 L212 248 Q210 170 202 110 Z" fill={skin} />
          {/* bottoms */}
          {bottom && art(bottom, shorts ? { x: 112, y: 196, width: 96, height: 82 } : { x: 108, y: 194, width: 104, height: 190 })}
          {/* shoes */}
          {shoes && (
            <>
              {art(shoes, { x: 98, y: 360, width: 62, height: 40 }, true)}
              {art(shoes, { x: 160, y: 360, width: 62, height: 40 })}
            </>
          )}
          {/* tops */}
          {base && art(base, { x: 92, y: 74, width: 136, height: 160 })}
          {layer && (
            <g opacity={0.97} clipPath="url(#open-front)">
              {art(layer, { x: 88, y: 72, width: 144, height: 168 })}
            </g>
          )}
          {outer && (
            <g clipPath="url(#open-front)">
              {art(outer, coatLong ? { x: 82, y: 66, width: 156, height: 230 } : { x: 82, y: 68, width: 156, height: 178 })}
            </g>
          )}
          <defs>
            <clipPath id="open-front">
              <path d="M0 0 H152 L156 400 H0 Z M168 0 H320 V400 H164 Z" />
            </clipPath>
          </defs>
          {/* head */}
          <path d="M152 58 L168 58 L170 84 L150 84 Z" fill={skin} />
          <ellipse cx="160" cy="40" rx="19" ry="23" fill={skin} />
          <path d="M141 36 Q142 14 160 14 Q180 14 180 36 Q172 24 160 24 Q148 24 141 36 Z" fill="#2a2522" />
          {acc && acc.shape === "cap" && art(acc, { x: 132, y: 4, width: 62, height: 46 })}
          {acc && acc.shape === "beanie" && art(acc, { x: 136, y: 2, width: 48, height: 40 })}
          {acc && acc.shape === "sunglasses" && art(acc, { x: 140, y: 26, width: 40, height: 30 })}
          {acc && (acc.shape === "tote" || acc.shape === "crossbody") && art(acc, { x: 206, y: 196, width: 64, height: 68 })}
          {acc && acc.shape === "belt" && art(acc, { x: 112, y: 188, width: 96, height: 24 })}
          {acc && acc.shape === "scarf" && art(acc, { x: 130, y: 60, width: 60, height: 90 })}
        </g>
      </svg>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="label rounded-xs bg-ink px-2 py-1 !text-[10px] text-paper">AI Visualization — Demo</span>
      </div>
      <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent px-3 pb-2.5 pt-8 text-[11px] leading-snug text-white">
        Illustrative render built from colours &amp; shapes. Not an image of your actual garments; no image generation runs in this prototype.
      </p>
    </div>
  );
}
