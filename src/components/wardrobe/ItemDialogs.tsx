"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, ScanLine, Trash2, Upload, X } from "lucide-react";
import type { WardrobeItem } from "@/domain/types";
import { categoryLabel, colorLabel } from "@/domain/taxonomy";
import { services } from "@/services";
import type { RecognitionResult } from "@/services/images/recognition";
import { useWardrobe } from "@/store/useWardrobe";
import { toast } from "@/store/toast";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { DemoBadge } from "../ui/Badge";
import { cn } from "../ui/cn";
import { ItemForm, emptyDraft, validateDraft, type ItemDraft } from "./ItemForm";
import { ItemImage } from "./ItemImage";

const fromRecognition = (r: RecognitionResult, src: string, fileName: string): ItemDraft => {
  const base = emptyDraft(r.category);
  const cleaned = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b(img|dsc|photo|image)\s?\d*\b/gi, "")
    .trim();
  return {
    ...base,
    name: cleaned.length > 2 ? cleaned.replace(/\b\w/g, (m) => m.toUpperCase()).slice(0, 60) : `${colorLabel(r.mainColor)} ${r.subcategory}`,
    shape: r.shape,
    subcategory: r.subcategory,
    mainColor: r.mainColor,
    secondaryColors: r.secondaryColors,
    styles: r.styles,
    seasons: r.seasons,
    fit: r.fit,
    image: { kind: "upload", src },
  };
};

function RecognitionNote({ result }: { result: RecognitionResult }) {
  return (
    <div className="flex items-start gap-3 rounded-sm border border-dashed border-ink/40 bg-paper-2 p-3 text-xs leading-relaxed text-ink-2">
      <ScanLine className="mt-0.5 size-4 shrink-0" />
      <div>
        <div className="mb-1 flex items-center gap-2">
          <DemoBadge>Demo recognition</DemoBadge>
        </div>
        Suggested <strong>{categoryLabel(result.category)}</strong> ({Math.round(result.confidence.category * 100)}% — guessed from the file
        name) in <strong>{colorLabel(result.mainColor)}</strong> ({Math.round(result.confidence.color * 100)}% — sampled from the photo’s pixels).
        No AI vision model runs in this prototype: please check every field.
      </div>
    </div>
  );
}

/* ─────────────────────────────── Add (single) ─────────────────────────────── */

export function AddItemDialog({ open, onClose, onAdded }: { open: boolean; onClose: () => void; onAdded?: (id: string) => void }) {
  const addItems = useWardrobe((s) => s.addItems);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft());
  const [stage, setStage] = useState<"pick" | "analyzing" | "form">("pick");
  const [recognition, setRecognition] = useState<RecognitionResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setDraft(emptyDraft());
    setStage("pick");
    setRecognition(null);
    setShowErrors(false);
    setError(null);
    setPreview(null);
  };
  const close = () => {
    reset();
    onClose();
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    try {
      const src = await services.images.prepareUpload(file);
      setPreview(src);
      setStage("analyzing");
      const r = await services.recognition.analyze(file, src);
      setRecognition(r);
      setDraft(fromRecognition(r, src, file.name));
      setStage("form");
    } catch (e) {
      setStage("pick");
      setError(e instanceof Error ? e.message : "That file could not be used.");
    }
  };

  const save = () => {
    if (Object.keys(validateDraft(draft)).length) {
      setShowErrors(true);
      return;
    }
    const [id] = addItems([{ ...draft, name: draft.name.trim() }]);
    toast({ title: `${draft.name.trim()} added`, description: "It's now available to the stylist.", tone: "success" });
    onAdded?.(id);
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow="Wardrobe"
      title="Add a piece"
      size="lg"
      footer={
        stage === "form" ? (
          <>
            <Button variant="ghost" onClick={reset}>
              Start over
            </Button>
            <Button onClick={save}>Add to wardrobe</Button>
          </>
        ) : undefined
      }
    >
      {stage === "pick" && (
        <div className="flex flex-col gap-4">
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-stone-2 px-6 py-14 text-center transition hover:border-ink"
          >
            <ImagePlus className="size-8 text-ink-3" />
            <span className="display text-xl">Drop a photo, or browse</span>
            <span className="max-w-xs text-sm text-ink-3">JPG, PNG or WebP. A flat-lay on a plain background works best. Photos stay in this browser.</span>
            <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} data-testid="single-upload" />
          </label>
          {error && (
            <p className="text-sm text-accent" role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-ink-3">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
          <Button variant="secondary" onClick={() => setStage("form")}>
            Add without a photo
          </Button>
          <p className="text-xs text-ink-3">Without a photo, the piece gets a generated product cutout from its type and colours.</p>
        </div>
      )}

      {stage === "analyzing" && (
        <div className="flex flex-col items-center gap-5 py-8 text-center" aria-live="polite">
          {preview && (
            <div className="relative size-48 overflow-hidden rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
              <div className="absolute inset-x-0 h-0.5 animate-[scan_1.2s_ease-in-out_infinite] bg-accent shadow-[0_0_12px_#d94a38]" />
            </div>
          )}
          <p className="display flex items-center gap-2 text-xl">
            <Loader2 className="size-5 animate-spin" /> Reading the garment…
          </p>
          <DemoBadge>Simulated recognition</DemoBadge>
        </div>
      )}

      {stage === "form" && (
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-3">
            <div className="aspect-square overflow-hidden rounded-sm ring-1 ring-line">
              <ItemImage item={draft} fit="cover" />
            </div>
            {draft.image.kind === "upload" ? (
              <Button size="sm" variant="ghost" icon={<X className="size-3.5" />} onClick={() => setDraft({ ...draft, image: { kind: "render" } })}>
                Use generated cutout
              </Button>
            ) : (
              <Button size="sm" variant="ghost" icon={<Upload className="size-3.5" />} onClick={() => setStage("pick")}>
                Add a photo
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-5">
            {recognition && <RecognitionNote result={recognition} />}
            <ItemForm draft={draft} onChange={setDraft} showErrors={showErrors} idPrefix="add" compact />
          </div>
        </div>
      )}
      <style>{`@keyframes scan{0%{top:0}50%{top:calc(100% - 2px)}100%{top:0}}`}</style>
    </Modal>
  );
}

/* ─────────────────────────────────── Edit ─────────────────────────────────── */

export function EditItemDialog({ item, open, onClose }: { item: WardrobeItem; open: boolean; onClose: () => void }) {
  const updateItem = useWardrobe((s) => s.updateItem);
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
  const [draft, setDraft] = useState<ItemDraft>(rest);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const replacePhoto = async (file?: File) => {
    if (!file) return;
    try {
      const src = await services.images.prepareUpload(file);
      setDraft((d) => ({ ...d, image: { kind: "upload", src } }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be used.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Edit piece"
      title={item.name}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (Object.keys(validateDraft(draft)).length) return setShowErrors(true);
              updateItem(item.id, { ...draft, name: draft.name.trim() });
              toast({ title: "Changes saved", tone: "success" });
              onClose();
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-sm ring-1 ring-line">
            <ItemImage item={draft} fit="cover" />
          </div>
          <label className="label inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-sm hover:bg-ink/6">
            <Upload className="size-3.5" /> {draft.image.kind === "upload" ? "Replace photo" : "Upload photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => replacePhoto(e.target.files?.[0])} />
          </label>
          {draft.image.kind === "upload" && (
            <Button size="sm" variant="ghost" onClick={() => setDraft({ ...draft, image: { kind: "render" } })}>
              Use generated cutout
            </Button>
          )}
          {error && <p className="text-xs text-accent">{error}</p>}
        </div>
        <ItemForm draft={draft} onChange={setDraft} showErrors={showErrors} idPrefix="edit" compact />
      </div>
    </Modal>
  );
}

/* ─────────────────────────────── Bulk upload ─────────────────────────────── */

interface BulkRow {
  key: string;
  fileName: string;
  status: "processing" | "ready" | "error";
  draft?: ItemDraft;
  recognition?: RecognitionResult;
  error?: string;
}

const SAMPLE_BATCH: ItemDraft[] = [
  { ...emptyDraft("outerwear"), name: "Nylon Track Jacket", shape: "bomber", subcategory: "Track jacket", mainColor: "cobalt", secondaryColors: ["white"], styles: ["sporty", "streetwear", "vintage"], seasons: ["spring", "autumn"], formality: 2, fit: "relaxed" },
  { ...emptyDraft("top"), name: "Striped Rugby Shirt", shape: "longsleeve", subcategory: "Rugby shirt", mainColor: "forest", secondaryColors: ["ecru"], pattern: "stripe", styles: ["vintage", "casual"], seasons: ["spring", "autumn", "winter"], formality: 2.5, fit: "relaxed" },
  { ...emptyDraft("shoes"), name: "Suede Low Sneakers", shape: "sneaker", subcategory: "Low-top sneakers", mainColor: "beige", secondaryColors: ["brown"], styles: ["casual", "vintage", "minimal"], seasons: ["spring", "summer", "autumn"], formality: 2.5 },
  { ...emptyDraft("bottom"), name: "Ecru Painter Pants", shape: "wide-trousers", subcategory: "Work pants", mainColor: "ecru", styles: ["vintage", "contemporary", "casual"], seasons: ["spring", "summer", "autumn"], formality: 2.5, fit: "wide" },
];

export function BulkUploadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addItems = useWardrobe((s) => s.addItems);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [simulated, setSimulated] = useState(false);

  const update = (key: string, patch: Partial<BulkRow>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 12);
    const fresh: BulkRow[] = list.map((f, i) => ({ key: `${Date.now()}-${i}-${f.name}`, fileName: f.name, status: "processing" }));
    setRows((rs) => [...rs, ...fresh]);
    // Process sequentially to mimic a queued pipeline.
    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      const key = fresh[i].key;
      try {
        const src = await services.images.prepareUpload(file);
        const r = await services.recognition.analyze(file, src);
        update(key, { status: "ready", draft: fromRecognition(r, src, file.name), recognition: r });
      } catch (e) {
        update(key, { status: "error", error: e instanceof Error ? e.message : "Could not process file" });
      }
    }
  };

  const simulate = async () => {
    setSimulated(true);
    const fresh: BulkRow[] = SAMPLE_BATCH.map((d, i) => ({ key: `sim-${Date.now()}-${i}`, fileName: `sample_${i + 1}.jpg`, status: "processing" }));
    setRows((rs) => [...rs, ...fresh]);
    for (let i = 0; i < fresh.length; i++) {
      await new Promise((r) => setTimeout(r, 450));
      update(fresh[i].key, { status: "ready", draft: SAMPLE_BATCH[i] });
    }
  };

  const ready = rows.filter((r) => r.status === "ready" && r.draft);
  const invalid = ready.filter((r) => Object.keys(validateDraft(r.draft!)).length);
  const processing = rows.some((r) => r.status === "processing");

  const close = () => {
    setRows([]);
    setEditing(null);
    setSimulated(false);
    onClose();
  };

  const editRow = rows.find((r) => r.key === editing);

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow="Wardrobe"
      title="Bulk upload"
      size="xl"
      footer={
        <>
          <span className="mr-auto text-xs text-ink-3">
            {ready.length} ready{invalid.length ? ` · ${invalid.length} need a name` : ""}
            {processing ? " · processing…" : ""}
          </span>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            disabled={!ready.length || processing || invalid.length > 0}
            onClick={() => {
              addItems(ready.map((r) => ({ ...r.draft!, name: r.draft!.name.trim() })));
              toast({ title: `${ready.length} pieces added`, description: "Review them anytime in your wardrobe.", tone: "success" });
              close();
            }}
          >
            Add {ready.length || ""} to wardrobe
          </Button>
        </>
      }
    >
      {editRow?.draft ? (
        <div className="flex flex-col gap-4">
          <button type="button" className="label self-start text-ink-3 hover:text-ink" onClick={() => setEditing(null)}>
            ← Back to batch
          </button>
          {editRow.recognition && <RecognitionNote result={editRow.recognition} />}
          <div className="grid gap-6 md:grid-cols-[180px_1fr]">
            <div className="aspect-square overflow-hidden rounded-sm ring-1 ring-line">
              <ItemImage item={editRow.draft} fit="cover" />
            </div>
            <ItemForm draft={editRow.draft} onChange={(d) => update(editRow.key, { draft: d })} showErrors idPrefix="bulk" compact />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="flex cursor-pointer items-center gap-4 rounded-sm border-2 border-dashed border-stone-2 px-5 py-5 transition hover:border-ink">
              <Upload className="size-6 shrink-0 text-ink-3" />
              <span>
                <span className="display block text-lg">Select up to 12 photos</span>
                <span className="text-sm text-ink-3">Each one is analysed in turn, then you review before adding.</span>
              </span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} data-testid="bulk-upload" />
            </label>
            <Button variant="secondary" className="h-auto py-4" onClick={simulate} disabled={simulated}>
              Simulate sample batch
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-3">
            <DemoBadge /> Recognition is simulated: categories come from file names, colours from pixel sampling. The sample batch uses
            generated cutouts instead of photos.
          </div>

          {rows.length > 0 && (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {rows.map((r) => (
                <li key={r.key} className={cn("rounded-sm border border-line p-2", r.status === "error" && "border-accent/50")}>
                  <div className="relative aspect-square overflow-hidden rounded-xs bg-paper-2">
                    {r.draft ? (
                      <ItemImage item={r.draft} fit="cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        {r.status === "processing" ? <Loader2 className="size-6 animate-spin text-ink-3" /> : <X className="size-6 text-accent" />}
                      </div>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${r.fileName}`}
                      onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                      className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-xs bg-paper/90 hover:bg-paper"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  {r.draft ? (
                    <div className="mt-2 flex flex-col gap-1">
                      <input
                        aria-label="Item name"
                        value={r.draft.name}
                        onChange={(e) => update(r.key, { draft: { ...r.draft!, name: e.target.value } })}
                        className={cn("w-full rounded-xs border bg-paper-3 px-2 py-1 text-[13px] font-semibold focus:border-ink focus:outline-none", r.draft.name.trim() ? "border-transparent" : "border-accent")}
                      />
                      <p className="label truncate px-2 text-ink-3">
                        {categoryLabel(r.draft.category)} · {colorLabel(r.draft.mainColor)}
                      </p>
                      <button type="button" className="label self-start px-2 text-ink-3 underline underline-offset-4 hover:text-ink" onClick={() => setEditing(r.key)}>
                        Edit details
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 truncate px-1 text-xs text-ink-3">{r.status === "error" ? r.error : `Analysing ${r.fileName}…`}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
}
