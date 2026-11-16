"use client";

import type { WardrobeItem } from "@/domain/types";
import { GarmentArt } from "../garment/GarmentArt";
import { cn } from "../ui/cn";

/**
 * Single entry point for showing an item's picture: user photo when uploaded,
 * generated cutout otherwise. `bare` drops the studio backdrop (for collages).
 */
export function ItemImage({
  item,
  className,
  bare,
  fit = "contain",
}: {
  item: Pick<WardrobeItem, "name" | "shape" | "mainColor" | "secondaryColors" | "pattern" | "image">;
  className?: string;
  bare?: boolean;
  fit?: "contain" | "cover";
}) {
  if (item.image.kind === "upload") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image.src}
        alt={item.name}
        draggable={false}
        className={cn("h-full w-full", fit === "cover" ? "object-cover" : "object-contain", !bare && "bg-paper-3", className)}
      />
    );
  }
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
