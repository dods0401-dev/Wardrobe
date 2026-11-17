/**
 * Minimal in-memory router that stands in for next/link and next/navigation
 * in the single-file build (artifact hosts don't allow path routing).
 */
import { createElement, useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";

type Listener = () => void;
const listeners = new Set<Listener>();
const NAMED: Record<string, string> = {
  wardrobe: "/wardrobe",
  stylist: "/stylist",
  lookbook: "/lookbook",
  profile: "/profile",
  stats: "/stats",
  design: "/design",
};
const initial = () => {
  const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#/, "");
  return NAMED[h] ?? "/";
};
let stack: string[] = [initial()];
const current = () => stack[stack.length - 1];
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const router = {
  push(href: string) {
    if (href === current()) return;
    stack = [...stack, href].slice(-50);
    emit();
  },
  replace(href: string) {
    stack = [...stack.slice(0, -1), href];
    emit();
  },
  back() {
    if (stack.length > 1) stack = stack.slice(0, -1);
    else stack = ["/"];
    emit();
  },
};

export const useLocation = () => useSyncExternalStore(subscribe, current, current);

const split = (href: string) => {
  const [path, query = ""] = href.split("?");
  return { path: path || "/", query };
};

/* ── next/navigation ── */
export const useRouter = () => ({ push: router.push, replace: (h: string) => router.replace(h), back: router.back, prefetch: () => {} });
export const usePathname = () => split(useLocation()).path;
export const useSearchParams = () => new URLSearchParams(split(useLocation()).query);
export const useParams = <T extends Record<string, string>>() => {
  const path = usePathname();
  const parts = path.split("/").filter(Boolean);
  return (parts.length === 2 ? { id: decodeURIComponent(parts[1]) } : {}) as unknown as T;
};

/* ── next/link ── */
export default function Link({
  href,
  children,
  onClick,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode; scroll?: boolean; prefetch?: boolean }) {
  const { scroll: _s, prefetch: _p, ...anchor } = rest as Record<string, unknown>;
  return createElement(
    "a",
    {
      ...anchor,
      href: "#",
      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        router.push(href);
      },
    },
    children,
  );
}
