/** Small framework-agnostic helpers. */

let counter = 0;
/** Unique id for user-created records (not used by the deterministic engine). */
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;

/** FNV-1a 32-bit hash — deterministic, used for stable ids and tie-breaking. */
export const hash = (input: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

export const hashId = (prefix: string, input: string) => `${prefix}_${hash(input).toString(36)}`;

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const round = (v: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

/** Local YYYY-MM-DD. */
export const toDateKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

export const daysBetween = (a: Date, b: Date) =>
  Math.round((fromDateKey(toDateKey(b)).getTime() - fromDateKey(toDateKey(a)).getTime()) / 86400000);

export const formatDate = (key: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) =>
  fromDateKey(key).toLocaleDateString("en-GB", opts);

export const pluralize = (n: number, word: string, plural = `${word}s`) => `${n} ${n === 1 ? word : plural}`;

export const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
