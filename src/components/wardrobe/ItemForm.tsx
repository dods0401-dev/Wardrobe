"use client";

import { useState, type ReactNode } from "react";
import type { Availability, Category, ColorId, Fit, Pattern, Season, Silhouette, StyleTag, WardrobeItem } from "@/domain/types";
import { AVAILABILITY, CATEGORIES, COLORS, FITS, PATTERNS, SEASONS, STYLES, colorLabel } from "@/domain/taxonomy";
import { SHAPES, defaultShapeFor, shapeDef, shapesForCategory } from "@/domain/garments";
import { SILHOUETTE_FORMALITY } from "@/data/seedItems";
import { Field, Input, Select } from "../ui/Field";
import { Chip, ColorToggle } from "../ui/Chip";
import { cn } from "../ui/cn";

export type ItemDraft = Omit<WardrobeItem, "id" | "createdAt">;

export const emptyDraft = (category: Category = "top"): ItemDraft => {
  const shape = defaultShapeFor(category);
  return {
    name: "",
    category,
    subcategory: shapeDef(shape).label,
    shape,
    mainColor: "black",
    secondaryColors: [],
    styles: ["casual"],
    seasons: ["spring", "summer", "autumn", "winter"],
    pattern: "solid",
    availability: "available",
    image: { kind: "render" },
    formality: SILHOUETTE_FORMALITY[shape],
    fit: "regular",
  };
};

export const validateDraft = (d: ItemDraft) => {
  const errors: Partial<Record<"name" | "styles" | "seasons", string>> = {};
  if (!d.name.trim()) errors.name = "Give the piece a name.";
  else if (d.name.trim().length > 60) errors.name = "Keep the name under 60 characters.";
  if (!d.styles.length) errors.styles = "Pick at least one style.";
  if (!d.seasons.length) errors.seasons = "Pick at least one season.";
  return errors;
};

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Group({ label, children, error, hint }: { label: string; children: ReactNode; error?: string; hint?: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label mb-2 text-ink-3">{label}</legend>
      {children}
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-ink-3">{hint}</p> : null}
    </fieldset>
  );
}

/** Controlled form for all item attributes. */
export function ItemForm({
  draft,
  onChange,
  showErrors,
  idPrefix = "item",
  compact,
}: {
  draft: ItemDraft;
  onChange: (d: ItemDraft) => void;
  showErrors?: boolean;
  idPrefix?: string;
  compact?: boolean;
}) {
  const errors = showErrors ? validateDraft(draft) : {};
  const set = <K extends keyof ItemDraft>(k: K, v: ItemDraft[K]) => onChange({ ...draft, [k]: v });
  const [moreColors, setMoreColors] = useState(false);

  const setCategory = (category: Category) => {
    const shape = defaultShapeFor(category);
    onChange({ ...draft, category, shape, subcategory: shapeDef(shape).label, formality: SILHOUETTE_FORMALITY[shape] });
  };
  const setShape = (shape: Silhouette) =>
    onChange({
      ...draft,
      shape,
      subcategory: SHAPES.some((s) => s.label === draft.subcategory) || !draft.subcategory ? shapeDef(shape).label : draft.subcategory,
      formality: SILHOUETTE_FORMALITY[shape],
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor={`${idPrefix}-name`} error={errors.name} className="sm:col-span-2">
          <Input
            id={`${idPrefix}-name`}
            value={draft.name}
            maxLength={60}
            placeholder="e.g. Washed Black Hoodie"
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
        </Field>
        <Field label="Category" htmlFor={`${idPrefix}-cat`}>
          <Select id={`${idPrefix}-cat`} value={draft.category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type" htmlFor={`${idPrefix}-shape`} hint="Drives how the stylist layers this piece.">
          <Select id={`${idPrefix}-shape`} value={draft.shape} onChange={(e) => setShape(e.target.value as Silhouette)}>
            {shapesForCategory(draft.category).map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subcategory" htmlFor={`${idPrefix}-sub`}>
          <Input id={`${idPrefix}-sub`} value={draft.subcategory} maxLength={40} onChange={(e) => set("subcategory", e.target.value)} />
        </Field>
        <Field label="Availability" htmlFor={`${idPrefix}-av`}>
          <Select id={`${idPrefix}-av`} value={draft.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
            {AVAILABILITY.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Group label={`Main colour · ${colorLabel(draft.mainColor)}`}>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((c) => (
            <ColorToggle key={c.id} color={c.id} selected={draft.mainColor === c.id} onClick={() => set("mainColor", c.id)} />
          ))}
        </div>
      </Group>

      <Group label="Secondary colours" hint="Optional — trims, prints, stripes. Up to two.">
        {moreColors || draft.secondaryColors.length ? (
          <div className="flex flex-wrap gap-2.5">
            {COLORS.filter((c) => c.id !== draft.mainColor).map((c) => (
              <ColorToggle
                key={c.id}
                color={c.id}
                selected={draft.secondaryColors.includes(c.id)}
                onClick={() => {
                  const next = toggle<ColorId>(draft.secondaryColors, c.id);
                  set("secondaryColors", next.slice(-2));
                }}
              />
            ))}
          </div>
        ) : (
          <button type="button" className="label self-start text-ink-3 underline underline-offset-4 hover:text-ink" onClick={() => setMoreColors(true)}>
            + Add secondary colours
          </button>
        )}
      </Group>

      <Group label="Style" error={errors.styles}>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Chip key={s.id} size="sm" selected={draft.styles.includes(s.id)} onClick={() => set("styles", toggle<StyleTag>(draft.styles, s.id))}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Group>

      <Group label="Season" error={errors.seasons}>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((s) => (
            <Chip key={s.id} size="sm" selected={draft.seasons.includes(s.id)} onClick={() => set("seasons", toggle<Season>(draft.seasons, s.id))}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Group>

      <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
        <Field label="Pattern" htmlFor={`${idPrefix}-pat`}>
          <Select id={`${idPrefix}-pat`} value={draft.pattern} onChange={(e) => set("pattern", e.target.value as Pattern)}>
            {PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Fit" htmlFor={`${idPrefix}-fit`} optional>
          <Select id={`${idPrefix}-fit`} value={draft.fit ?? ""} onChange={(e) => set("fit", (e.target.value || undefined) as Fit | undefined)}>
            <option value="">—</option>
            {FITS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Formality · ${draft.formality.toFixed(1)}`} htmlFor={`${idPrefix}-form`} hint="1 relaxed — 5 formal">
          <input
            id={`${idPrefix}-form`}
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={draft.formality}
            onChange={(e) => set("formality", Number(e.target.value))}
            className="h-10 w-full accent-ink"
          />
        </Field>
        <Field label="Brand" htmlFor={`${idPrefix}-brand`} optional>
          <Input id={`${idPrefix}-brand`} value={draft.brand ?? ""} maxLength={40} onChange={(e) => set("brand", e.target.value || undefined)} />
        </Field>
        <Field label="Material" htmlFor={`${idPrefix}-mat`} optional>
          <Input id={`${idPrefix}-mat`} value={draft.material ?? ""} maxLength={40} onChange={(e) => set("material", e.target.value || undefined)} />
        </Field>
      </div>
    </div>
  );
}
