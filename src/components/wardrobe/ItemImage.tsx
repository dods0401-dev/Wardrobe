"use client";

import { useState } from "react";
import type { WardrobeItem } from "@/domain/types";
import { GarmentArt } from "../garment/GarmentArt";
import { cn } from "../ui/cn";

type ImageItem = Pick<WardrobeItem, "name" | "shape" | "mainColor" | "secondaryColors" | "pattern" | "image">;

/** Builds an Unsplash-resized URL (imgix params) for the size actually displayed. */
const sized = (src: string, w: number) => src.replace(/([?&])w=\d+/, `$1w=${w}`);

function Render({ item, bare, className }: { item: ImageItem; bare?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center", !bare && "studio", className)}>
      <GarmentArt
        shape={item.shape}
        main={item.mainColor}
        secondary={item.secondaryColors}
        pattern={item.pattern}
        title={item.name}
        shadow={!bare}
        className={cn("h-[78%] w-[78%]", bare && "h-full w-full")}
      />
    </div>
  );
}

/**
 * Single entry point for an item's picture: product photo, user upload, or generated cutout.
 * Photos fall back to the cutout if they fail to load (e.g. offline).
 */
export function ItemImage({
  item,
  className,
  bare,
  fit = "cover",
  size = 600,
}: {
  item: ImageItem;
  className?: string;
  bare?: boolean;
  fit?: "contain" | "cover";
  /** Approximate rendered width in CSS px, used to request a right-sized photo. */
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  if (item.image.kind === "render" || failed) return <Render item={item} bare={bare} className={className} />;
  const src = item.image.kind === "photo" ? sized(item.image.src, Math.round(size * 2)) : item.image.src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={item.name}
      draggable={false}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", !bare && "bg-white", className)}
    />
  );
}
