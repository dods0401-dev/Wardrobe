"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Home, Shirt, Sparkles, UserRound, RotateCcw } from "lucide-react";
import { useWardrobe } from "@/store/useWardrobe";
import { Toaster } from "../ui/Toaster";
import { ConfirmDialog } from "../ui/Modal";
import { cn } from "../ui/cn";
import { Wordmark } from "./Wordmark";
import { toast } from "@/store/toast";

const NAV = [
  { href: "/", label: "Today", icon: Home, n: "01" },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt, n: "02" },
  { href: "/stylist", label: "The Stylist", short: "Stylist", icon: Sparkles, n: "03" },
  { href: "/lookbook", label: "Lookbook", icon: BookOpen, n: "04" },
  { href: "/profile", label: "Style Profile", short: "Profile", icon: UserRound, n: "05" },
  { href: "/stats", label: "Style Stats", short: "Stats", icon: BarChart3, n: "06" },
];

const isActive = (path: string, href: string) =>
  href === "/" ? path === "/" : path === href || path.startsWith(href + "/") || (href === "/stylist" && path.startsWith("/outfits"));

export function AppShell({ children }: { children: ReactNode }) {
  const hydrated = useWardrobe((s) => s.hydrated);
  const init = useWardrobe((s) => s.init);
  const profile = useWardrobe((s) => s.profile);
  const itemCount = useWardrobe((s) => s.items.length);
  const resetDemo = useWardrobe((s) => s.resetDemo);
  const path = usePathname();
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    init();
  }, [init]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex sticky top-0 h-dvh flex-col justify-between border-r border-ink bg-paper px-6 py-7">
        <div>
          <Link href="/" aria-label="Home">
            <Wordmark className="text-[1.65rem]" />
          </Link>
          <p className="mt-2 text-xs leading-relaxed text-ink-3">New ways to wear what you already own.</p>
          <nav className="mt-10 flex flex-col" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(path, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-baseline gap-3 border-b border-line py-3 transition-colors",
                    active ? "text-ink" : "text-ink-3 hover:text-ink",
                  )}
                >
                  <span className={cn("label w-5", active ? "text-accent" : "text-ink-4")}>{item.n}</span>
                  <span className="display text-[1.15rem] tracking-[-0.02em]">{item.label}</span>
                  {active && <span className="ml-auto block size-1.5 self-center rounded-full bg-accent" />}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/profile" className="flex items-center gap-3 rounded-sm p-1 -m-1 hover:bg-ink/5">
            <span className="display flex size-9 items-center justify-center rounded-full bg-ink text-paper text-sm">
              {profile.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{profile.name}</span>
              <span className="block truncate text-xs text-ink-3">
                @{profile.handle} · {itemCount} pieces
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="label inline-flex items-center gap-2 text-ink-3 hover:text-accent"
          >
            <RotateCcw className="size-3.5" /> Reset demo data
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-ink bg-paper/92 px-4 backdrop-blur">
        <Link href="/" aria-label="Home">
          <Wordmark className="text-xl" compact />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/stats"
            aria-label="Style stats"
            className={cn("inline-flex size-10 items-center justify-center rounded-sm", isActive(path, "/stats") ? "bg-ink text-paper" : "hover:bg-ink/6")}
          >
            <BarChart3 className="size-5" />
          </Link>
        </div>
      </header>

      <main className="min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {hydrated ? (
          children
        ) : (
          <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4" aria-busy="true">
            <Wordmark className="text-3xl animate-pulse" compact />
            <p className="label text-ink-3">Opening your wardrobe…</p>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-ink bg-paper pb-[env(safe-area-inset-bottom)]"
      >
        {NAV.filter((n) => n.href !== "/stats").map((item) => {
          const active = isActive(path, item.href);
          const Icon = item.icon;
          const stylist = item.href === "/stylist";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn("flex h-16 flex-col items-center justify-center gap-1", active ? "text-ink" : "text-ink-3")}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-sm transition-colors",
                  stylist ? "size-9 -mt-1 bg-accent text-white" : "size-6",
                  stylist && active && "bg-ink",
                )}
              >
                <Icon className={stylist ? "size-[18px]" : "size-5"} strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span className={cn("text-[10px] font-semibold uppercase tracking-[0.08em]", stylist && "-mt-0.5")}>
                {item.short ?? item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Toaster />
      <ConfirmDialog
        open={confirmReset}
        title="Reset demo data?"
        body="This restores the original demo wardrobe, profile and history. Items you added, outfits you saved and every logged wear will be removed from this browser."
        confirmLabel="Reset everything"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          setConfirmReset(false);
          toast({ title: "Demo data restored", tone: "success" });
        }}
      />
    </div>
  );
}
