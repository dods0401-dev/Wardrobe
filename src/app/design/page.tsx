"use client";

import { useState } from "react";
import { Bookmark, Heart, Plus, Sparkles } from "lucide-react";
import { COLORS } from "@/domain/taxonomy";
import { SHAPES } from "@/domain/garments";
import { PageHeader, SectionHeader, Segmented, Stat } from "@/components/ui/Section";
import { Button, IconButton } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Chip, ColorToggle } from "@/components/ui/Chip";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/States";
import { GarmentArt } from "@/components/garment/GarmentArt";
import { toast } from "@/store/toast";

const TOKENS = [
  ["ink", "#171717"],
  ["paper", "#F4F1EA"],
  ["stone", "#D8D4CB"],
  ["accent", "#D94A38"],
  ["sage", "#B7C5A4"],
  ["ink-3", "#6B6A66"],
];

/** Living reference for the design system. Not linked from the main navigation. */
export default function DesignSystemPage() {
  const [tab, setTab] = useState<"a" | "b" | "c">("a");
  const [chip, setChip] = useState(true);
  const [color, setColor] = useState(true);
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <PageHeader index="00" eyebrow="Reference" title="Design system" intro="Tokens and components used across PROJECT WARDROBE. Streetwear / editorial: photography first, oversized display type, compact uppercase labels, moderate radii." />

      <section className="mt-10">
        <SectionHeader label="Tokens" title="Colour" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {TOKENS.map(([name, hex]) => (
            <div key={name}>
              <div className="h-20 rounded-sm ring-1 ring-ink/10" style={{ background: hex }} />
              <p className="mt-2 text-sm font-semibold">{name}</p>
              <p className="label text-ink-3">{hex}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader label="Tokens" title="Typography" />
        <div className="flex flex-col gap-4 border-y border-line py-6">
          <p className="display text-display-lg">Display XL</p>
          <p className="display text-display">Display — Space Grotesk</p>
          <p className="display text-2xl">Section heading</p>
          <p className="text-[15px] leading-relaxed text-ink-2">Body — Inter. Discover new ways to wear what you already own.</p>
          <p className="label text-ink-3">Label — uppercase, tracked 0.12em</p>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader label="Components" title="Buttons" />
        <div className="flex flex-wrap items-center gap-2">
          <Button>Primary</Button>
          <Button variant="accent" icon={<Sparkles className="size-4" />}>Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" icon={<Plus className="size-3.5" />}>Small</Button>
          <Button size="lg">Large</Button>
          <IconButton label="Like" active>
            <Heart className="size-[18px] fill-current" />
          </IconButton>
          <IconButton label="Save">
            <Bookmark className="size-[18px]" />
          </IconButton>
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <SectionHeader label="Components" title="Inputs" />
          <div className="flex flex-col gap-4">
            <Field label="Text" htmlFor="ds-t" hint="Helper text">
              <Input id="ds-t" placeholder="Placeholder" />
            </Field>
            <Field label="With error" htmlFor="ds-e" error="Something needs fixing.">
              <Input id="ds-e" aria-invalid defaultValue="Invalid value" />
            </Field>
            <Field label="Select" htmlFor="ds-s">
              <Select id="ds-s">
                <option>Option one</option>
                <option>Option two</option>
              </Select>
            </Field>
            <Field label="Textarea" htmlFor="ds-ta" optional>
              <Textarea id="ds-ta" placeholder="Longer text" />
            </Field>
          </div>
        </div>
        <div>
          <SectionHeader label="Components" title="Filters & badges" />
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Chip selected={chip} onClick={() => setChip(!chip)}>Toggle chip</Chip>
              <Chip>Default</Chip>
              <Chip size="sm" selected>Small</Chip>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <ColorToggle color="olive" selected={color} onClick={() => setColor(!color)} />
              <ColorToggle color="ecru" selected onClick={() => {}} />
              <ColorToggle color="pink" tone="avoid" selected onClick={() => {}} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge>Neutral</Badge>
              <Badge tone="ink">Ink</Badge>
              <Badge tone="accent">Accent</Badge>
              <Badge tone="sage">Sage</Badge>
              <Badge tone="outline">Outline</Badge>
              <DemoBadge />
            </div>
            <Segmented ariaLabel="Example tabs" value={tab} onChange={setTab} options={[{ value: "a", label: "Saved", count: 7 }, { value: "b", label: "Worn" }, { value: "c", label: "History" }]} />
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Stat" value="47" sub="Supporting text" />
              <Stat label="Accent stat" value="53%" tone="accent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader label="Components" title="Feedback" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setModal(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => setConfirm(true)}>Confirm dialog</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Saved to lookbook", tone: "success" })}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Not saved", description: "Storage is full.", tone: "error" })}>Error toast</Button>
          <Button variant="secondary" onClick={() => toast({ title: "Dismissed", action: { label: "Undo", onClick: () => {} } })}>Toast with action</Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <EmptyState compact title="Empty state" body="Explains what's missing and what to do next." action={<Button size="sm">Action</Button>} />
          <ErrorState body="Error copy explains what happened." />
          <div className="flex flex-col gap-2 rounded-md border border-line p-4">
            <p className="label text-ink-3">Loading skeleton</p>
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader label="Imagery" title="Generated product cutouts" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-9">
          {SHAPES.map((s, i) => (
            <div key={s.id} className="studio aspect-square rounded-sm p-2">
              <GarmentArt shape={s.id} main={COLORS[(i * 5) % COLORS.length].id} secondary={[COLORS[(i * 7 + 3) % COLORS.length].id]} pattern={i % 6 === 0 ? "stripe" : i % 6 === 3 ? "check" : "solid"} className="h-full w-full" title={s.label} />
            </div>
          ))}
        </div>
      </section>

      <Modal open={modal} onClose={() => setModal(false)} title="Modal" eyebrow="Component" footer={<Button onClick={() => setModal(false)}>Close</Button>}>
        <p className="text-sm text-ink-2">Bottom sheet on mobile, centred panel on desktop. Focus is trapped; Escape closes.</p>
      </Modal>
      <ConfirmDialog open={confirm} title="Delete this?" body="Confirmation dialogs guard destructive actions." onCancel={() => setConfirm(false)} onConfirm={() => setConfirm(false)} />
    </div>
  );
}
