# CLAUDE.md — PROJECT WARDROBE

Context for any Claude session working on this repository. Read `docs/handover/HANDOVER.md` for the full state of the project before starting new work.

## What this is
An interactive web prototype of a consumer AI personal stylist. Its core promise: "Discover new ways to wear what you already own." It covers:
- digital wardrobe with full create/edit/delete
- rule-based outfit engine
- two visualization modes (real-piece collage and a "DEMO" AI look)
- lookbook, style profile and stats

All state is client-side (localStorage).

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Vitest · Playwright.

## Commands
```bash
npm install
npm run dev            # http://localhost:3000
npm run lint           # tsc --noEmit
npm test               # engine unit tests (Vitest)
npm run build          # production build
npm run build:html     # single-file HTML build → artifact/wardrobe.html
npm run build:mobile   # + mobile shell (phone frame / full screen) → artifact/wardrobe-mobile.html
node e2e/acceptance.cjs http://localhost:3000 e2e/screenshots   # 47 end-to-end checks (server must be running)
```
Before pushing UI changes, run `npm run lint`, `npm test` and the acceptance suite. All must pass.

## Architecture rules
- `src/domain/` holds pure types and rules. Do not import React or browser APIs there.
- `src/services/` holds the business logic behind interfaces. Every mock is wired in `src/services/index.ts`. Replace an adapter there; never inside UI code.
- `src/store/useWardrobe.ts` is the single source of truth. Item usage is **derived** from the wear log, never stored twice.
- Outfits reference items by ID. Deleting an item cascades to its outfits; wear history keeps snapshots.
- The recommendation engine must stay **deterministic**: no `Math.random`. Inject `today`.
- Never invent wardrobe items in recommendations.
- Never present simulated AI as real. Recognition, the "On model" look and brief parsing are labelled DEMO in the UI.

## Design direction (current)
Soft, modern and glossy:
- warm off-white background, sage accent (`--color-accent`) with gloss gradients (`.gloss-accent`, `.gloss-ink`)
- frosted glass bars (`.glass`), white surface cards with `--shadow-soft` / `--shadow-lift`
- DM Sans for display, Inter for body, sentence-case labels, pill buttons and chips
- red (`--color-danger`) is reserved for errors and destructive actions

All tokens live in `src/app/globals.css`.

## Images
- 32 of the 47 demo items use Unsplash product photos. They are hotlinked, credited, and defined in `src/data/seedPhotos.ts`. Fifteen items use generated SVG cutouts (`src/components/garment/GarmentArt.tsx`).
- `ItemImage` falls back to the cutout if a photo fails to load.
- **Never commit the Unsplash API key.**

## Git
- Start from `main` and work on a `claude/<topic>` branch. Open a PR only when the user asks.
- Commit messages describe the change.
- No model names go in commits or code.
