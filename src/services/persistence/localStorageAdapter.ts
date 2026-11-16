import { SCHEMA_VERSION, type PersistedState, type PersistenceAdapter } from "./adapter";

const KEY = "project-wardrobe:v1";

const isValid = (s: unknown): s is PersistedState => {
  if (!s || typeof s !== "object") return false;
  const o = s as Partial<PersistedState>;
  return (
    o.version === SCHEMA_VERSION &&
    Array.isArray(o.items) &&
    !!o.profile &&
    typeof o.outfits === "object" &&
    Array.isArray(o.wearLog) &&
    Array.isArray(o.interactions) &&
    Array.isArray(o.sessions)
  );
};

export const localStorageAdapter: PersistenceAdapter = {
  load() {
    if (typeof window === "undefined") return { state: null };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return { state: null };
      const parsed = JSON.parse(raw);
      if (!isValid(parsed)) return { state: null, error: "Saved data was from an older version and has been reset." };
      return { state: parsed };
    } catch {
      return { state: null, error: "Saved data could not be read and has been reset." };
    }
  },
  save(state) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      return { ok: true };
    } catch (e) {
      const quota = e instanceof DOMException && (e.name === "QuotaExceededError" || e.code === 22);
      return quota
        ? { ok: false, reason: "quota", message: "Browser storage is full. Remove some uploaded photos or reset the demo." }
        : { ok: false, reason: "unknown", message: "Changes could not be saved in this browser." };
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
