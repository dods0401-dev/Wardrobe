"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import type { Category, ColorId, Fit, Occasion, StyleTag, UserProfile } from "@/domain/types";
import { CATEGORIES, COLORS, FITS, OCCASIONS, STYLES, colorHex, colorLabel, fitLabel, styleLabel } from "@/domain/taxonomy";
import { useWardrobe } from "@/store/useWardrobe";
import { computeStyleDNA } from "@/services/stats/stats";
import { PageHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Chip, ColorToggle } from "@/components/ui/Chip";
import { Field, Input, Select } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Modal";
import { toast } from "@/store/toast";
import { cn } from "@/components/ui/cn";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const DNA_TONES = ["#6f8c7b", "#a9bfae", "#c9b79c", "#8d9aab", "#d8cfc2", "#b98f7a", "#c8ccc4"];

function Block({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6 md:grid-cols-[12rem_1fr] md:gap-10">
      <div>

        <h2 className="display text-lg leading-tight">{title}</h2>
        {hint && <p className="mt-2 text-xs leading-relaxed text-ink-3">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const profile = useWardrobe((s) => s.profile);
  const items = useWardrobe((s) => s.items);
  const wearLog = useWardrobe((s) => s.wearLog);
  const updateProfile = useWardrobe((s) => s.updateProfile);
  const resetLearned = useWardrobe((s) => s.resetLearned);
  const [draft, setDraft] = useState<UserProfile>(profile);
  const [confirmReset, setConfirmReset] = useState(false);

  // Keep learned values live (they change from other screens) while preserving local edits.
  useEffect(() => setDraft((d) => ({ ...d, learned: profile.learned })), [profile.learned]);

  const dirty = JSON.stringify({ ...draft, learned: null }) !== JSON.stringify({ ...profile, learned: null });
  const nameError = !draft.name.trim() ? "Name can't be empty." : undefined;
  const set = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const dna = useMemo(() => computeStyleDNA(items, wearLog, profile.learned.style), [items, wearLog, profile.learned.style]);
  const learnedRows = useMemo(() => {
    const rows: { label: string; value: number; kind: string }[] = [];
    for (const [k, v] of Object.entries(profile.learned.fit)) rows.push({ label: fitLabel(k as Fit), value: v ?? 0, kind: "Fit" });
    for (const [k, v] of Object.entries(profile.learned.color)) rows.push({ label: colorLabel(k as ColorId), value: v ?? 0, kind: "Colour" });
    for (const [k, v] of Object.entries(profile.learned.style)) rows.push({ label: styleLabel(k as StyleTag), value: v ?? 0, kind: "Style" });
    return rows.filter((r) => Math.abs(r.value) >= 0.02).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 8);
  }, [profile.learned]);

  const save = () => {
    if (nameError) return;
    updateProfile({ ...draft, name: draft.name.trim(), handle: draft.handle.trim().replace(/^@/, ""), learned: profile.learned });
    toast({ title: "Profile updated", description: "New preferences apply to your next outfits.", tone: "success" });
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-32 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader
        index="05"
        eyebrow="Style Profile"
        title={
          <>
            {profile.name}’s style
          </>
        }
        intro="Tell the stylist what you like. It also learns from what you save, wear, swap and dismiss."
        actions={
          <Link href="/stats" className="label inline-flex items-center gap-1 hover:text-accent-ink">
            Style stats <ArrowUpRight className="size-3.5" />
          </Link>
        }
      />

      {/* Style DNA */}
      <section className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <p className="text-sm font-semibold">Style DNA</p>
          <p className="mt-1 text-xs text-ink-3">Blend of what you own, what you actually wear, and learned feedback.</p>
          <div className="mt-5 flex h-4 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={dna.map((d) => `${styleLabel(d.style)} ${Math.round(d.share * 100)}%`).join(", ")}>
            {dna.map((d, i) => (
              <div
                key={d.style}
                style={{ width: `${d.share * 100}%`, background: DNA_TONES[i % DNA_TONES.length] }}
                className="h-full transition-[width] duration-500"
                title={`${styleLabel(d.style)} ${Math.round(d.share * 100)}%`}
              />
            ))}
          </div>
          <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {dna.map((d, i) => (
              <li key={d.style} className="flex items-baseline gap-2">
                <span className="block size-2.5 shrink-0 translate-y-[-1px] rounded-full" style={{ background: DNA_TONES[i % DNA_TONES.length] }} />
                <span className="text-sm">{styleLabel(d.style)}</span>
                <span className="ml-auto text-sm font-semibold tabular-nums">{Math.round(d.share * 100)}%</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Learned from your feedback</p>
              <p className="mt-1 text-xs text-ink-3">Likes, saves and wears push up; dismissals and swaps-out push down.</p>
            </div>
            <button type="button" onClick={() => setConfirmReset(true)} className="label inline-flex shrink-0 items-center gap-1 text-ink-3 hover:text-ink" disabled={!learnedRows.length}>
              <RotateCcw className="size-3" /> Reset
            </button>
          </div>
          {learnedRows.length ? (
            <ul className="mt-4 flex flex-col gap-2.5">
              {learnedRows.map((r) => (
                <li key={`${r.kind}-${r.label}`} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                  <span className="truncate">
                    <span className="text-ink-4">{r.kind} · </span>
                    {r.label}
                  </span>
                  <span className="relative h-1.5 rounded-full bg-paper-2">
                    <span className="absolute left-1/2 top-0 h-full w-px bg-ink-4" />
                    <span
                      className={cn("absolute top-0 h-full rounded-full", r.value >= 0 ? "left-1/2 bg-accent" : "right-1/2 bg-danger")}
                      style={{ width: `${Math.min(50, Math.abs(r.value) * 50)}%` }}
                    />
                  </span>
                  <span className="text-right tabular-nums">{r.value > 0 ? "+" : ""}{Math.round(r.value * 100)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-ink-3">Nothing learned yet. Like, save, wear or dismiss a few outfits and patterns appear here.</p>
          )}
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Block n="01" title="About you">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name" htmlFor="p-name" error={nameError}>
              <Input id="p-name" value={draft.name} maxLength={30} onChange={(e) => set("name", e.target.value)} aria-invalid={!!nameError} />
            </Field>
            <Field label="Handle" htmlFor="p-handle">
              <Input id="p-handle" value={draft.handle} maxLength={30} onChange={(e) => set("handle", e.target.value)} />
            </Field>
            <Field label="City" htmlFor="p-city">
              <Input id="p-city" value={draft.city} maxLength={40} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <Field label="Default occasion" htmlFor="p-occ" hint="Used for your outfit of the day." className="sm:col-span-1">
              <Select id="p-occ" value={draft.defaultOccasion} onChange={(e) => set("defaultOccasion", e.target.value as Occasion)}>
                {OCCASIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Block>

        <Block n="02" title="Style preferences" hint="The registers you feel most like yourself in.">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip key={s.id} selected={draft.styles.includes(s.id)} onClick={() => set("styles", toggle(draft.styles, s.id))}>
                {s.label}
              </Chip>
            ))}
          </div>
        </Block>

        <Block n="03" title="Preferred colours" hint="Boosted in recommendations.">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <ColorToggle
                key={c.id}
                color={c.id}
                selected={draft.preferredColors.includes(c.id)}
                onClick={() => setDraft((d) => ({ ...d, preferredColors: toggle(d.preferredColors, c.id), avoidedColors: d.avoidedColors.filter((x) => x !== c.id) }))}
              />
            ))}
          </div>
        </Block>

        <Block n="04" title="Avoided colours" hint="Strongly demoted — the stylist will rarely use them.">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <ColorToggle
                key={c.id}
                tone="avoid"
                color={c.id}
                selected={draft.avoidedColors.includes(c.id)}
                onClick={() => setDraft((d) => ({ ...d, avoidedColors: toggle(d.avoidedColors, c.id), preferredColors: d.preferredColors.filter((x) => x !== c.id) }))}
              />
            ))}
          </div>
          {draft.avoidedColors.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-3 text-xs text-ink-3">
              Avoiding:
              {draft.avoidedColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1">
                  <span className="block size-2 rounded-full" style={{ background: colorHex(c) }} /> {colorLabel(c)}
                </span>
              ))}
            </p>
          )}
        </Block>

        <Block n="05" title="Preferred fits">
          <div className="flex flex-wrap gap-2">
            {FITS.map((f) => (
              <Chip key={f.id} selected={draft.preferredFits.includes(f.id)} onClick={() => set("preferredFits", toggle<Fit>(draft.preferredFits, f.id))}>
                {f.label}
              </Chip>
            ))}
          </div>
        </Block>

        <Block n="06" title="Favourite categories" hint="Pieces you love to build a look around.">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} selected={draft.favoriteCategories.includes(c.id)} onClick={() => set("favoriteCategories", toggle<Category>(draft.favoriteCategories, c.id))}>
                {c.plural}
              </Chip>
            ))}
          </div>
        </Block>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-line bg-paper/90 backdrop-blur animate-sheet-up lg:bottom-0 lg:left-[15.5rem]">
          <div className="mx-auto flex max-w-[1200px] items-center justify-end gap-2 px-4 py-3 sm:px-8 lg:px-12">
            <span className="mr-auto text-sm text-ink-2">Unsaved changes</span>
            <Button variant="ghost" onClick={() => setDraft(profile)}>
              Discard
            </Button>
            <Button onClick={save} disabled={!!nameError}>
              Save changes
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmReset}
        title="Reset learned preferences?"
        body="The stylist forgets what it learned from your likes, saves, wears and dismissals. Your explicit profile settings stay."
        confirmLabel="Reset learning"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetLearned();
          setConfirmReset(false);
          toast({ title: "Learning reset" });
        }}
      />
    </div>
  );
}
