import type {
  Interaction,
  Outfit,
  StylistSession,
  UserProfile,
  WardrobeItem,
  WearEntry,
} from "@/domain/types";

/** Everything the app persists. Bump SCHEMA_VERSION on breaking changes. */
export interface PersistedState {
  version: number;
  seededAt: string;
  items: WardrobeItem[];
  profile: UserProfile;
  outfits: Record<string, Outfit>;
  wearLog: WearEntry[];
  interactions: Interaction[];
  sessions: StylistSession[];
  currentSessionId: string | null;
  visualMode: "collage" | "ai";
}

export const SCHEMA_VERSION = 1;

export type SaveResult = { ok: true } | { ok: false; reason: "quota" | "unavailable" | "unknown"; message: string };

/**
 * Persistence contract. The prototype uses localStorage; a backend implementation
 * (REST / GraphQL / Supabase…) can implement the same interface.
 */
export interface PersistenceAdapter {
  load(): { state: PersistedState | null; error?: string };
  save(state: PersistedState): SaveResult;
  clear(): void;
}
