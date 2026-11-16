"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Ban, Plus, Sparkles, X } from "lucide-react";
import type { ColorId, Occasion, Season, StyleTag, StylistRequest } from "@/domain/types";
import { CATEGORIES, COLORS, OCCASIONS, SEASONS, STYLES, occasionLabel, seasonLabel } from "@/domain/taxonomy";
import { useWardrobe, currentSeason } from "@/store/useWardrobe";
import { PRESETS } from "@/data/presets";
import { PageHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Chip, ColorToggle } from "@/components/ui/Chip";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { DemoBadge } from "@/components/ui/Badge";
import { ItemImage } from "@/components/wardrobe/ItemImage";
import { cn } from "@/components/ui/cn";
import { toast } from "@/store/toast";

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const BRIEF_IDEAS = ["No sneakers", "Keep it tonal", "Relaxed fits", "Cold and rainy", "Something sharp for a meeting", "A pop of colour"];

const STEPS = ["Reading your wardrobe", "Building valid combinations", "Scoring colour, style & fit", "Picking diverse looks"];

function Step({ n, title, children, hint }: { n: string; title: string; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-ink py-7 md:grid-cols-[13rem_1fr] md:gap-10">
      <div>
        <p className="label text-accent">{n}</p>
        <h2 className="display mt-1 text-2xl leading-none">{title}</h2>
        {hint && <p className="mt-2 text-xs leading-relaxed text-ink-3">{hint}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function StylistForm() {
  const router = useRouter();
  const params = useSearchParams();
  const items = useWardrobe((s) => s.items);
  const profile = useWardrobe((s) => s.profile);
  const sessions = useWardrobe((s) => s.sessions);
  const outfits = useWardrobe((s) => s.outfits);
  const generate = useWardrobe((s) => s.generate);

  const [req, setReq] = useState<StylistRequest>(() => {
    const base: StylistRequest = {
      occasion: profile.defaultOccasion,
      styles: [],
      instructions: "",
      preferredColors: [],
      excludedItemIds: [],
      anchorItemIds: [],
      count: 4,
      season: currentSeason(),
      includeAccessory: true,
    };
    const preset = PRESETS.find((p) => p.id === params.get("preset"));
    const anchor = params.get("anchor");
    return {
      ...base,
      ...(preset?.request ?? {}),
      anchorItemIds: anchor && items.some((i) => i.id === anchor) ? [anchor] : [],
    };
  });
  const [pickerOpen, setPickerOpen] = useState<null | "exclude" | "anchor">(null);
  const [pickerQuery, setPickerQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const set = <K extends keyof StylistRequest>(k: K, v: StylistRequest[K]) => setReq((r) => ({ ...r, [k]: v }));
  const anchors = (req.anchorItemIds ?? []).map((id) => byId.get(id)).filter(Boolean) as typeof items;
  const excluded = req.excludedItemIds.map((id) => byId.get(id)).filter(Boolean) as typeof items;

  const run = async () => {
    setLoading(true);
    // Short, honest progress sequence — the engine itself runs locally in milliseconds.
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 260));
    }
    const session = generate(req);
    setLoading(false);
    if (!session) return;
    if (!session.outfitIds.length) {
      toast({ title: "No outfits for this brief", description: session.shortfall, tone: "error", duration: 6000 });
      return;
    }
    router.push(`/stylist/results?session=${session.id}`);
  };

  const pickerItems = items.filter((i) => {
    const q = pickerQuery.trim().toLowerCase();
    return !q || `${i.name} ${i.brand ?? ""} ${i.subcategory}`.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-32 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader
        index="03"
        eyebrow="The Stylist"
        title={
          <>
            What are we
            <br />
            dressing for?
          </>
        }
        intro="Every look is built only from pieces in your wardrobe — scored for colour, style, your preferences, the occasion, the season and rotation."
      />

      {anchors.length > 0 && (
        <div className="mt-6 flex items-center gap-4 rounded-sm bg-ink p-3 text-paper">
          {anchors.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <div className="size-14 overflow-hidden rounded-xs">
                <ItemImage item={a} />
              </div>
              <div>
                <p className="label text-stone">Built around</p>
                <p className="display text-lg leading-tight">{a.name}</p>
              </div>
            </div>
          ))}
          <button type="button" className="ml-auto flex size-9 items-center justify-center rounded-sm hover:bg-paper/10" aria-label="Remove anchor" onClick={() => set("anchorItemIds", [])}>
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="mt-8">
        <Step n="01" title="Occasion">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="radiogroup" aria-label="Occasion">
            {OCCASIONS.map((o) => {
              const active = req.occasion === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("occasion", o.id as Occasion)}
                  className={cn(
                    "flex min-h-24 flex-col justify-between rounded-sm border p-3 text-left transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-stone-2 hover:border-ink",
                  )}
                >
                  <span className="display text-lg leading-tight">{o.label}</span>
                  <span className={cn("text-xs leading-snug", active ? "text-paper/70" : "text-ink-3")}>{o.blurb}</span>
                </button>
              );
            })}
          </div>
        </Step>

        <Step n="02" title="Style direction" hint="Optional. Leave empty to let your Style Profile lead.">
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <Chip key={s.id} selected={req.styles.includes(s.id)} onClick={() => set("styles", toggle<StyleTag>(req.styles, s.id))}>
                {s.label}
              </Chip>
            ))}
          </div>
          <div className="mt-5">
            <p className="label mb-2 text-ink-3">Season</p>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <Chip key={s.id} selected={req.season === s.id} onClick={() => set("season", s.id as Season)}>
                  {s.label}
                  {s.id === currentSeason() && <span className="opacity-60">· now</span>}
                </Chip>
              ))}
            </div>
          </div>
        </Step>

        <Step
          n="03"
          title="The brief"
          hint={
            <>
              Optional. Plain words like “no sneakers”, “tonal”, “cold”, “relaxed”. <DemoBadge className="mt-1">Keyword parsing</DemoBadge>
            </>
          }
        >
          <Field label="Instructions" htmlFor="brief" optional>
            <Textarea
              id="brief"
              value={req.instructions}
              maxLength={280}
              placeholder="e.g. Dinner with friends, it might rain — no sneakers, something relaxed"
              onChange={(e) => set("instructions", e.target.value)}
            />
          </Field>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {BRIEF_IDEAS.map((idea) => (
              <button
                key={idea}
                type="button"
                onClick={() => set("instructions", req.instructions ? `${req.instructions.replace(/[,\s]+$/, "")}, ${idea.toLowerCase()}` : idea)}
                className="label h-7 rounded-sm border border-dashed border-stone-2 px-2.5 text-ink-3 hover:border-ink hover:text-ink"
              >
                + {idea}
              </button>
            ))}
          </div>
        </Step>

        <Step n="04" title="Colours" hint="Optional. Lean towards these.">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <ColorToggle key={c.id} color={c.id} selected={req.preferredColors.includes(c.id)} onClick={() => set("preferredColors", toggle<ColorId>(req.preferredColors, c.id))} />
            ))}
          </div>
        </Step>

        <Step n="05" title="Leave out" hint="Pieces the stylist must not use today.">
          <div className="flex flex-wrap items-center gap-2">
            {excluded.map((i) => (
              <span key={i.id} className="inline-flex h-10 items-center gap-2 rounded-sm border border-ink pl-1 pr-1.5">
                <span className="size-8 overflow-hidden rounded-xs">
                  <ItemImage item={i} />
                </span>
                <span className="max-w-40 truncate text-[13px] font-medium">{i.name}</span>
                <button type="button" aria-label={`Allow ${i.name}`} className="flex size-6 items-center justify-center rounded-xs hover:bg-ink/8" onClick={() => set("excludedItemIds", req.excludedItemIds.filter((x) => x !== i.id))}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <Button variant="secondary" icon={<Ban className="size-4" />} onClick={() => setPickerOpen("exclude")}>
              {excluded.length ? "Edit" : "Exclude items"}
            </Button>
            {!anchors.length && (
              <Button variant="ghost" icon={<Plus className="size-4" />} onClick={() => setPickerOpen("anchor")}>
                Build around a piece
              </Button>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-3">Items marked as in the laundry, at repair or stored are skipped automatically.</p>
        </Step>

        <Step n="06" title="How many looks">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex gap-2" role="radiogroup" aria-label="Number of recommendations">
              {[3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={req.count === n}
                  onClick={() => set("count", n)}
                  className={cn("display size-12 rounded-sm border text-xl", req.count === n ? "border-ink bg-ink text-paper" : "border-stone-2 hover:border-ink")}
                >
                  {n}
                </button>
              ))}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={req.includeAccessory} onChange={(e) => set("includeAccessory", e.target.checked)} className="size-4 accent-ink" />
              Finish with an accessory
            </label>
          </div>
        </Step>
      </div>

      {/* Sticky generate bar */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-ink bg-paper/95 backdrop-blur lg:bottom-0 lg:left-[15.5rem]">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 sm:px-8 lg:px-12">
          <p className="hidden min-w-0 flex-1 truncate text-sm text-ink-2 sm:block">
            <strong>{occasionLabel(req.occasion)}</strong> · {seasonLabel(req.season)}
            {req.styles.length ? ` · ${req.styles.map((s) => STYLES.find((x) => x.id === s)?.label).join(", ")}` : ""}
            {req.excludedItemIds.length ? ` · ${req.excludedItemIds.length} excluded` : ""}
          </p>
          <Button variant="accent" size="lg" className="flex-1 sm:flex-none" icon={<Sparkles className="size-4" />} loading={loading} onClick={run}>
            {loading ? STEPS[step] : `Generate ${req.count} outfits`}
          </Button>
        </div>
      </div>

      {sessions.length > 0 && (
        <section className="mt-6 border-t border-ink pt-7">
          <h2 className="display text-2xl">Recent briefs</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {sessions.slice(0, 5).map((s) => {
              const live = s.outfitIds.filter((id) => outfits[id] && !outfits[id].rejected).length;
              return (
                <li key={s.id}>
                  <Link href={`/stylist/results?session=${s.id}`} className="group flex items-center gap-4 py-3">
                    <span className="label w-20 shrink-0 text-ink-3">{new Date(s.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <strong>{occasionLabel(s.request.occasion)}</strong>
                      {s.request.instructions ? ` — “${s.request.instructions}”` : ""}
                    </span>
                    <span className="label shrink-0 text-ink-3">{live} looks</span>
                    <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <Modal
        open={!!pickerOpen}
        onClose={() => setPickerOpen(null)}
        eyebrow={pickerOpen === "anchor" ? "Build around" : "Leave out"}
        title={pickerOpen === "anchor" ? "Choose a piece to style" : "Exclude pieces"}
        size="lg"
        footer={<Button onClick={() => setPickerOpen(null)}>Done</Button>}
      >
        <Input placeholder="Search…" value={pickerQuery} onChange={(e) => setPickerQuery(e.target.value)} aria-label="Search pieces" />
        {CATEGORIES.map((c) => {
          const list = pickerItems.filter((i) => i.category === c.id);
          if (!list.length) return null;
          return (
            <div key={c.id} className="mt-5">
              <p className="label mb-2 text-ink-3">{c.plural}</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {list.map((i) => {
                  const selected = pickerOpen === "anchor" ? req.anchorItemIds?.includes(i.id) : req.excludedItemIds.includes(i.id);
                  const unavailable = i.availability !== "available";
                  return (
                    <button
                      key={i.id}
                      type="button"
                      disabled={pickerOpen === "anchor" && unavailable}
                      aria-pressed={selected}
                      onClick={() => {
                        if (pickerOpen === "anchor") {
                          set("anchorItemIds", [i.id]);
                          set("excludedItemIds", req.excludedItemIds.filter((x) => x !== i.id));
                          setPickerOpen(null);
                        } else set("excludedItemIds", toggle(req.excludedItemIds, i.id));
                      }}
                      className="group text-left disabled:opacity-40"
                    >
                      <div className={cn("relative aspect-square overflow-hidden rounded-sm ring-1", selected ? "ring-2 ring-accent" : "ring-line group-hover:ring-ink")}>
                        <ItemImage item={i} />
                        {selected && pickerOpen === "exclude" && (
                          <span className="absolute inset-0 flex items-center justify-center bg-paper/60">
                            <Ban className="size-7 text-accent" />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs font-medium">{i.name}</p>
                      {unavailable && <p className="label text-ink-4">Unavailable</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Modal>
    </div>
  );
}

export default function StylistPage() {
  return (
    <Suspense>
      <StylistForm />
    </Suspense>
  );
}
