"use client";

import { create } from "zustand";
import type {
  Interaction,
  InteractionType,
  Occasion,
  Outfit,
  OutfitPiece,
  OutfitSlot,
  StylistRequest,
  StylistSession,
  UserProfile,
  WardrobeItem,
  WearEntry,
} from "@/domain/types";
import { SEED_ITEMS, withSeedPhoto } from "@/data/seedItems";
import { SEED_PROFILE, buildSeedHistory } from "@/data/seedProfile";
import { seasonForDate } from "@/domain/taxonomy";
import { toDateKey, uid } from "@/lib/util";
import { services } from "@/services";
import { SCHEMA_VERSION, type PersistedState } from "@/services/persistence/adapter";
import { applyFeedback, EMPTY_LEARNED, type Signal } from "@/services/personalization/feedback";
import { signatureOf, type GeneratedOutfit } from "@/services/recommendation/engine";
import { toast } from "./toast";

const MAX_SESSIONS = 12;
const MAX_INTERACTIONS = 1500;

export const todayKey = () => toDateKey(new Date());
export const currentSeason = () => seasonForDate(new Date());

interface Actions {
  init: () => void;
  // Wardrobe
  addItems: (items: Omit<WardrobeItem, "id" | "createdAt">[]) => string[];
  updateItem: (id: string, patch: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  // Stylist
  generate: (request: StylistRequest) => StylistSession | null;
  regenerate: (sessionId: string) => StylistSession | null;
  upsertGenerated: (outfit: GeneratedOutfit) => void;
  // Outfit interactions
  markViewed: (outfitId: string) => void;
  toggleLike: (outfitId: string) => void;
  toggleSave: (outfitId: string) => void;
  reject: (outfitId: string) => void;
  restore: (outfitId: string) => void;
  wear: (outfitId: string, date?: string, occasion?: Occasion) => WearEntry | null;
  removeWear: (entryId: string) => void;
  replaceItem: (outfitId: string, slot: OutfitSlot, newItemId: string) => void;
  removePiece: (outfitId: string, slot: OutfitSlot) => void;
  // Profile
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetLearned: () => void;
  // Misc
  setVisualMode: (mode: PersistedState["visualMode"]) => void;
  resetDemo: () => void;
}

export type WardrobeState = PersistedState & { hydrated: boolean } & Actions;

const seedState = (): PersistedState => {
  const now = new Date();
  const history = buildSeedHistory(SEED_ITEMS, SEED_PROFILE, now);
  return {
    version: SCHEMA_VERSION,
    seededAt: now.toISOString(),
    items: SEED_ITEMS,
    profile: SEED_PROFILE,
    outfits: Object.fromEntries(history.outfits.map((o) => [o.id, o])),
    wearLog: history.wearLog,
    interactions: history.interactions,
    sessions: [],
    currentSessionId: null,
    visualMode: "collage",
  };
};

const snapshot = (s: WardrobeState): PersistedState => ({
  version: s.version,
  seededAt: s.seededAt,
  items: s.items,
  profile: s.profile,
  outfits: s.outfits,
  wearLog: s.wearLog,
  interactions: s.interactions,
  sessions: s.sessions,
  currentSessionId: s.currentSessionId,
  visualMode: s.visualMode,
});

const interaction = (type: InteractionType, outfitId: string, extra: Partial<Interaction> = {}): Interaction => ({
  id: uid("int"),
  type,
  outfitId,
  at: new Date().toISOString(),
  ...extra,
});

/** Removes suggestion-only outfits that are no longer reachable (keeps storage bounded). */
const pruneOutfits = (
  outfits: Record<string, Outfit>,
  sessions: StylistSession[],
  wearLog: WearEntry[],
): Record<string, Outfit> => {
  const keep = new Set<string>([...sessions.flatMap((s) => s.outfitIds), ...wearLog.map((w) => w.outfitId)]);
  return Object.fromEntries(
    Object.entries(outfits).filter(([id, o]) => o.saved || o.liked || o.source === "seed" || keep.has(id)),
  );
};

export const useWardrobe = create<WardrobeState>((set, get) => {
  const itemsOf = (outfit: Outfit) => {
    const byId = new Map(get().items.map((i) => [i.id, i]));
    return outfit.pieces.map((p) => byId.get(p.itemId)).filter(Boolean) as WardrobeItem[];
  };

  const learn = (items: WardrobeItem[], signal: Signal) => {
    const profile = get().profile;
    return { ...profile, learned: applyFeedback(profile.learned, items, signal) };
  };

  const log = (...entries: Interaction[]) =>
    [...entries, ...get().interactions].slice(0, MAX_INTERACTIONS);

  const rescoreOutfit = (o: Outfit, items = get().items): Outfit => ({
    ...o,
    ...services.engine.rescore({
      items,
      profile: get().profile,
      wearLog: get().wearLog,
      outfit: o,
      today: todayKey(),
      season: currentSeason(),
    }),
  });

  const runSession = (request: StylistRequest, previous?: StylistSession): StylistSession | null => {
    const s = get();
    const rejected = Object.values(s.outfits)
      .filter((o) => o.rejected)
      .map((o) => signatureOf(o.pieces));
    const shown = previous?.shownSignatures ?? [];
    const sessionId = previous?.id ?? uid("ses");
    const result = services.engine.generate({
      items: s.items,
      profile: s.profile,
      wearLog: s.wearLog,
      request,
      today: todayKey(),
      sessionId,
      avoidSignatures: [...rejected, ...shown],
    });
    if (previous && result.outfits.length === 0) {
      toast({ title: "No new combinations left", description: "Every distinct look for this brief has been shown. Adjust the brief to explore more.", tone: "neutral" });
      return null;
    }
    const outfits = { ...s.outfits };
    for (const g of result.outfits) {
      const existing = outfits[g.id];
      outfits[g.id] = {
        ...g,
        name: existing?.name ?? g.name,
        source: existing?.source ?? "stylist",
        saved: existing?.saved ?? false,
        liked: existing?.liked ?? false,
        rejected: false,
      };
    }
    const session: StylistSession = {
      id: sessionId,
      request,
      outfitIds: result.outfits.map((o) => o.id),
      createdAt: new Date().toISOString(),
      iteration: previous ? previous.iteration + 1 : 0,
      shownSignatures: [...shown, ...result.outfits.map((o) => signatureOf(o.pieces))],
      understood: result.parsed.understood,
      shortfall: result.shortfall,
      evaluated: result.evaluated,
    };
    const sessions = [session, ...s.sessions.filter((x) => x.id !== sessionId)].slice(0, MAX_SESSIONS);
    set({
      outfits: pruneOutfits(outfits, sessions, s.wearLog),
      sessions,
      currentSessionId: sessionId,
      interactions: log(...result.outfits.map((o) => interaction("suggested", o.id))),
    });
    return session;
  };

  return {
    // Empty until init() runs on the client (persisted state or fresh demo seed).
    version: SCHEMA_VERSION,
    seededAt: "",
    items: [],
    profile: SEED_PROFILE,
    outfits: {},
    wearLog: [],
    interactions: [],
    sessions: [],
    currentSessionId: null,
    visualMode: "collage",
    hydrated: false,

    init: () => {
      if (get().hydrated) return;
      const { state, error } = services.persistence.load();
      if (state) {
        // Upgrade untouched demo items saved before product photography was added.
        const items = state.items.map((i) => (i.image.kind === "render" && !i.updatedAt ? withSeedPhoto(i) : i));
        set({ ...state, items, hydrated: true });
      }
      else set({ ...seedState(), hydrated: true });
      if (error) toast({ title: "Storage reset", description: error, tone: "error" });
    },

    addItems: (drafts) => {
      const now = new Date().toISOString();
      const items = drafts.map((d) => ({ ...d, id: uid("itm"), createdAt: now }) as WardrobeItem);
      set({ items: [...items, ...get().items] });
      return items.map((i) => i.id);
    },

    updateItem: (id, patch) => {
      const items = get().items.map((i) =>
        i.id === id ? { ...i, ...patch, id, updatedAt: new Date().toISOString() } : i,
      );
      const outfits = Object.fromEntries(
        Object.entries(get().outfits).map(([oid, o]) => [
          oid,
          o.pieces.some((p) => p.itemId === id) ? rescoreOutfit(o, items) : o,
        ]),
      );
      set({ items, outfits });
    },

    deleteItem: (id) => {
      const s = get();
      // Cascade: outfits that used the item can no longer be worn as-is.
      const removed = new Set(
        Object.values(s.outfits)
          .filter((o) => o.pieces.some((p) => p.itemId === id))
          .map((o) => o.id),
      );
      const outfits = Object.fromEntries(Object.entries(s.outfits).filter(([oid]) => !removed.has(oid)));
      const sessions = s.sessions.map((ses) => ({
        ...ses,
        outfitIds: ses.outfitIds.filter((oid) => !removed.has(oid)),
        request: { ...ses.request, excludedItemIds: ses.request.excludedItemIds.filter((x) => x !== id) },
      }));
      const learnedItem = { ...s.profile.learned.item };
      delete learnedItem[id];
      set({
        items: s.items.filter((i) => i.id !== id),
        outfits,
        sessions,
        profile: { ...s.profile, learned: { ...s.profile.learned, item: learnedItem } },
        // Wear history keeps item snapshots, so past entries stay readable.
      });
    },

    generate: (request) => runSession(request),

    regenerate: (sessionId) => {
      const prev = get().sessions.find((x) => x.id === sessionId);
      if (!prev) return null;
      return runSession(prev.request, prev);
    },

    upsertGenerated: (g) => {
      const existing = get().outfits[g.id];
      if (existing) return;
      set({
        outfits: { ...get().outfits, [g.id]: { ...g, saved: false, liked: false, rejected: false } },
        interactions: log(interaction("suggested", g.id)),
      });
    },

    markViewed: (outfitId) => {
      const recent = get().interactions.find((i) => i.outfitId === outfitId && i.type === "viewed");
      if (recent && Date.now() - new Date(recent.at).getTime() < 10 * 60 * 1000) return;
      set({ interactions: log(interaction("viewed", outfitId)) });
    },

    toggleLike: (outfitId) => {
      const o = get().outfits[outfitId];
      if (!o) return;
      const liked = !o.liked;
      set({
        outfits: { ...get().outfits, [outfitId]: { ...o, liked, rejected: liked ? false : o.rejected } },
        profile: learn(itemsOf(o), liked ? "liked" : "unliked"),
        interactions: log(interaction(liked ? "liked" : "unliked", outfitId)),
      });
    },

    toggleSave: (outfitId) => {
      const o = get().outfits[outfitId];
      if (!o) return;
      const saved = !o.saved;
      set({
        outfits: { ...get().outfits, [outfitId]: { ...o, saved, rejected: saved ? false : o.rejected } },
        profile: learn(itemsOf(o), saved ? "saved" : "unsaved"),
        interactions: log(interaction(saved ? "saved" : "unsaved", outfitId)),
      });
    },

    reject: (outfitId) => {
      const o = get().outfits[outfitId];
      if (!o) return;
      set({
        outfits: { ...get().outfits, [outfitId]: { ...o, rejected: true, saved: false, liked: false } },
        profile: learn(itemsOf(o), "rejected"),
        interactions: log(interaction("rejected", outfitId)),
      });
    },

    restore: (outfitId) => {
      const o = get().outfits[outfitId];
      if (!o) return;
      // Undo of a reject: reverse the learned penalty.
      set({
        outfits: { ...get().outfits, [outfitId]: { ...o, rejected: false } },
        profile: learn(itemsOf(o), "liked"),
        interactions: get().interactions.filter(
          (i, idx, arr) => !(i.type === "rejected" && i.outfitId === outfitId && arr.findIndex((x) => x.type === "rejected" && x.outfitId === outfitId) === idx),
        ),
      });
    },

    wear: (outfitId, date = todayKey(), occasion) => {
      const o = get().outfits[outfitId];
      if (!o) return null;
      const items = itemsOf(o);
      if (items.length !== o.pieces.length) {
        toast({ title: "Can't log this outfit", description: "One of its pieces is no longer in your wardrobe.", tone: "error" });
        return null;
      }
      const dup = get().wearLog.find((w) => w.outfitId === outfitId && w.date === date);
      if (dup) {
        toast({ title: "Already logged", description: "This outfit is already in your history for that day." });
        return dup;
      }
      const entry: WearEntry = {
        id: uid("wear"),
        outfitId,
        date,
        occasion: occasion ?? o.occasion,
        outfitName: o.name,
        itemIds: items.map((i) => i.id),
        itemSnapshots: items.map((i) => ({ id: i.id, name: i.name, category: i.category, mainColor: i.mainColor })),
      };
      const wearLog = [entry, ...get().wearLog].sort((a, b) => b.date.localeCompare(a.date));
      set({
        wearLog,
        outfits: { ...get().outfits, [outfitId]: { ...o, rejected: false } },
        profile: learn(items, "worn"),
        interactions: log(interaction("worn", outfitId)),
      });
      return entry;
    },

    removeWear: (entryId) => {
      set({ wearLog: get().wearLog.filter((w) => w.id !== entryId) });
    },

    replaceItem: (outfitId, slot, newItemId) => {
      const o = get().outfits[outfitId];
      if (!o) return;
      const byId = new Map(get().items.map((i) => [i.id, i]));
      const oldId = o.pieces.find((p) => p.slot === slot)?.itemId;
      const newItem = byId.get(newItemId);
      if (!newItem) return;
      const pieces: OutfitPiece[] = oldId
        ? o.pieces.map((p) => (p.slot === slot ? { slot, itemId: newItemId } : p))
        : [...o.pieces, { slot, itemId: newItemId }];
      let profile = get().profile;
      const oldItem = oldId ? byId.get(oldId) : undefined;
      if (oldItem) profile = { ...profile, learned: applyFeedback(profile.learned, [oldItem], "replaced_out") };
      profile = { ...profile, learned: applyFeedback(profile.learned, [newItem], "replaced_in") };
      set({ profile });
      set({
        outfits: { ...get().outfits, [outfitId]: rescoreOutfit({ ...o, pieces }) },
        interactions: log(interaction("item_replaced", outfitId, { itemId: oldId, replacedWithId: newItemId })),
      });
    },

    removePiece: (outfitId, slot) => {
      const o = get().outfits[outfitId];
      if (!o || !["layer", "outerwear", "accessory"].includes(slot)) return;
      const oldId = o.pieces.find((p) => p.slot === slot)?.itemId;
      set({
        outfits: { ...get().outfits, [outfitId]: rescoreOutfit({ ...o, pieces: o.pieces.filter((p) => p.slot !== slot) }) },
        interactions: log(interaction("item_replaced", outfitId, { itemId: oldId })),
      });
    },

    updateProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),
    resetLearned: () => set({ profile: { ...get().profile, learned: EMPTY_LEARNED } }),
    setVisualMode: (visualMode) => set({ visualMode }),

    resetDemo: () => {
      services.persistence.clear();
      set({ ...seedState(), hydrated: true });
    },
  };
});

/* ─────────────── persistence: debounced save after hydration ─────────────── */

if (typeof window !== "undefined") {
  let timer: number | undefined;
  let lastError = "";
  useWardrobe.subscribe((state) => {
    if (!state.hydrated) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const res = services.persistence.save(snapshot(useWardrobe.getState()));
      if (!res.ok && res.message !== lastError) {
        lastError = res.message;
        toast({ title: "Not saved", description: res.message, tone: "error", duration: 6000 });
      } else if (res.ok) lastError = "";
    }, 200);
  });
}
