"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw, SlidersHorizontal } from "lucide-react";
import { occasionLabel, seasonLabel, styleLabel, colorLabel } from "@/domain/taxonomy";
import { useWardrobe } from "@/store/useWardrobe";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { DemoBadge } from "@/components/ui/Badge";
import { OutfitResultCard } from "@/components/outfit/OutfitCard";
import { VisualModeSwitch } from "@/components/outfit/OutfitVisual";
import { toast } from "@/store/toast";

function Results() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session");
  const session = useWardrobe((s) => s.sessions.find((x) => x.id === (sessionId ?? s.currentSessionId)));
  const outfits = useWardrobe((s) => s.outfits);
  const regenerate = useWardrobe((s) => s.regenerate);
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
        <EmptyState title="No results to show" body="This styling session has expired or was cleared. Start a new brief." action={<ButtonLink href="/stylist">Open the stylist</ButtonLink>} />
      </div>
    );
  }

  const list = session.outfitIds.map((id) => outfits[id]).filter((o) => o && !o.rejected);
  const rejectedCount = session.outfitIds.filter((id) => outfits[id]?.rejected).length;
  const r = session.request;

  const onRegenerate = async () => {
    setBusy(true);
    await new Promise((res) => setTimeout(res, 450));
    const next = regenerate(session.id);
    setBusy(false);
    if (next) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({ title: `${next.outfitIds.length} fresh looks`, description: "None of these repeat what you've already seen for this brief." });
    }
  };

  const summary = [
    occasionLabel(r.occasion),
    seasonLabel(r.season),
    ...r.styles.map(styleLabel),
    ...r.preferredColors.map(colorLabel),
    r.excludedItemIds.length ? `${r.excludedItemIds.length} excluded` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1300px] px-4 pb-16 pt-5 sm:px-8 lg:px-12 lg:pt-8">
      <button type="button" onClick={() => router.push("/stylist")} className="label inline-flex items-center gap-1.5 text-ink-3 hover:text-ink">
        <ArrowLeft className="size-3.5" /> Edit brief
      </button>
      <header className="mt-4 flex flex-col gap-5 border-b border-ink pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="animate-fade-up">
          <p className="label flex items-center gap-3 text-ink-3">
            <span className="text-accent">03</span> Results{session.iteration ? ` · round ${session.iteration + 1}` : ""}
          </p>
          <h1 className="display mt-3 text-[2.6rem] leading-[0.92] sm:text-display lg:text-display-lg">
            {list.length} looks for
            <br />
            <span className="text-ink-3">{occasionLabel(r.occasion).toLowerCase()}.</span>
          </h1>
          <p className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-sm text-ink-2">
            {summary.map((s, i) => (
              <span key={i}>
                {i > 0 && <span className="mr-2 text-ink-4">/</span>}
                {s}
              </span>
            ))}
          </p>
          {r.instructions && <p className="mt-2 max-w-xl text-sm italic text-ink-2">“{r.instructions}”</p>}
          {session.understood.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <DemoBadge>Brief understood as</DemoBadge>
              {session.understood.map((u) => (
                <span key={u} className="label rounded-xs border border-ink/25 px-1.5 py-0.5 !text-[10px]">
                  {u}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VisualModeSwitch />
          <Button variant="secondary" icon={<SlidersHorizontal className="size-4" />} onClick={() => router.push("/stylist")}>
            Adjust
          </Button>
          <Button icon={<RefreshCw className="size-4" />} loading={busy} onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      </header>

      <p className="mt-3 text-xs text-ink-3">
        {session.evaluated.toLocaleString()} valid combinations scored from your wardrobe
        {rejectedCount ? ` · ${rejectedCount} dismissed` : ""}. Every piece shown is one you own.
      </p>
      {session.shortfall && <p className="mt-2 text-sm text-accent">{session.shortfall}</p>}

      {list.length ? (
        <div className="mt-8 flex flex-col gap-12">
          {list.map((o, i) => (
            <OutfitResultCard key={o.id} outfit={o} rank={i + 1} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="mt-8"
          title="All looks dismissed"
          body="Noted — the stylist will steer away from those. Generate a fresh set for the same brief."
          action={
            <Button icon={<RefreshCw className="size-4" />} loading={busy} onClick={onRegenerate}>
              Regenerate
            </Button>
          }
        />
      )}

      {list.length > 0 && (
        <div className="mt-14 flex flex-col items-center gap-3 border-t border-ink pt-10 text-center">
          <p className="display text-2xl">Not quite it?</p>
          <p className="max-w-sm text-sm text-ink-3">Regenerate for a different set — looks already shown in this session won’t repeat.</p>
          <Button icon={<RefreshCw className="size-4" />} loading={busy} onClick={onRegenerate}>
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  );
}
