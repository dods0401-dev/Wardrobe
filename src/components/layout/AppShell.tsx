"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Home, Shirt, Layers, UserRound, RotateCcw } from "lucide-react";
import { useWardrobe } from "@/store/useWardrobe";
import { Toaster } from "../ui/Toaster";
import { ConfirmDialog } from "../ui/Modal";
import { cn } from "../ui/cn";
import { Wordmark } from "./Wordmark";
import { toast } from "@/store/toast";

const NAV = [
  { href: "/", label: "Today", icon: Home, n: "01" },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt, n: "02" },
  { href: "/stylist", label: "Stylist", short: "Stylist", icon: Layers, n: "03" },
  { href: "/lookbook", label: "Lookbook", icon: BookOpen, n: "04" },
  { href: "/profile", label: "Style profile", short: "Profile", icon: UserRound, n: "05" },
  { href: "/stats", label: "Stats", short: "Stats", icon: BarChart3, n: "06" },
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
      <aside className="hidden lg:flex sticky top-0 h-dvh flex-col justify-between border-r border-line bg-surface px-5 py-7">
        <div>
          <Link href="/" aria-label="Home">
            <Wordmark className="text-[1.35rem]" />
          </Link>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3">New ways to wear what you already own.</p>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = isActive(path, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-full px-3.5 py-2.5 text-[15px] font-medium transition-colors",
                    active ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-paper hover:text-ink",
                  )}
                >
                  <item.icon className="size-[18px]" strokeWidth={active ? 2.1 : 1.7} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col gap-4">
          <Link href="/profile" className="flex items-center gap-3 rounded-full p-1.5 -m-1.5 hover:bg-paper">
            <span className="display flex size-9 items-center justify-center rounded-full bg-sage text-sage-ink text-sm">
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
            className="label inline-flex items-center gap-2 px-1 text-ink-3 hover:text-danger"
          >
            <RotateCcw className="size-3.5" /> Reset demo data
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur">
        <Link href="/" aria-label="Home">
          <Wordmark className="text-lg" compact />
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/stats"
            aria-label="Style stats"
            className={cn("inline-flex size-10 items-center justify-center rounded-full", isActive(path, "/stats") ? "bg-accent-soft text-accent-ink" : "text-ink-2 hover:bg-ink/6")}
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
            <Wordmark className="text-2xl animate-pulse" compact />
            <p className="label text-ink-3">Opening your wardrobe…</p>
          </div>
        )}
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 rounded-t-[22px] border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgba(43,42,40,0.18)]"
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
              className={cn("flex h-16 flex-col items-center justify-center gap-1", active ? "text-accent-ink" : "text-ink-3")}
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  stylist ? "size-9 -mt-1 bg-accent text-white" : "size-6",
                  stylist && active && "bg-accent-ink",
                )}
              >
                <Icon className={stylist ? "size-[18px]" : "size-5"} strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span className={cn("text-[11px] font-medium", stylist && "-mt-0.5")}>
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
