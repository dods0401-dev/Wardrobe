# PROJECT WARDROBE — Interactive Prototype

> *Discover new ways to wear what you already own.*

A working, navigable prototype of a consumer AI personal stylist: digitise a wardrobe, generate outfits only from pieces you own, save and log what you actually wear, and understand your style through live statistics.

The working name is PROJECT WARDROBE; final naming is postponed. This is **not** a landing page or a static mock-up. Every primary action works, all screens share one state, and that state persists in the browser.

---

## 1. Setup

Requirements: **Node 20+** (developed on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build and server |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) |
| `npm test` | Unit tests for the recommendation engine (Vitest) |
| `npm run e2e` | End-to-end acceptance run (Playwright, needs a running server, see below) |

End-to-end acceptance (47 checks across desktop and iPhone 13 viewports):

```bash
npm run build && npm start &          # or npm run dev
node e2e/acceptance.cjs http://localhost:3000 e2e/screenshots
```

**Reset demo data:** use *Reset demo data* in the sidebar (desktop), or clear the `project-wardrobe:v1` key in localStorage.

The design-system reference lives at **`/design`**. It is not linked from the navigation.

iPad Pro 11" (landscape) screenshots of the main screens are in [`docs/screenshots/ipad`](docs/screenshots/ipad).

---

## 2. Tech & architecture

**Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Vitest · Playwright.**
Fonts (Space Grotesk, Inter) are self-hosted through Fontsource, so the build needs no network access.

```
src/
├─ domain/            Pure types and rules. No React, no browser APIs.
│  ├─ types.ts        WardrobeItem, Outfit, Interaction, WearEntry, UserProfile, StylistRequest…
│  ├─ taxonomy.ts     categories, colours (hex/hue/neutral), styles, occasions, seasons, fits
│  └─ garments.ts     garment shapes → outfit slots and layering rules
├─ data/              Demo dataset: 47 items, profile, seeded history, mood presets
├─ services/          Business logic behind interfaces (swappable adapters)
│  ├─ index.ts        ← service registry: the one place mocks are wired in
│  ├─ recommendation/ rule-based engine, scoring, brief parser, explanations (+ tests)
│  ├─ persistence/    PersistenceAdapter + versioned localStorage implementation
│  ├─ images/         ImageService (resize, colour sampling) + RecognitionService (DEMO)
│  ├─ visualization/  LookVisualizer (simulated AI look)
│  ├─ personalization/ feedback → learned affinities
│  ├─ stats/          wardrobe statistics, Style DNA
│  └─ wardrobe/       search / filter / sort
├─ store/             Zustand store (single source of truth) + toasts
├─ hooks/             Derived selectors (items by id, usage, resolved outfit pieces)
├─ components/
│  ├─ ui/             Design system: Button, Field, Chip, Badge, Modal, Toaster, States, Section…
│  ├─ garment/        Generated SVG product cutouts
│  ├─ wardrobe/       ItemImage, ItemForm, Add / Edit / Bulk dialogs
│  ├─ outfit/         Collage (mode A), AiLook (mode B), cards, Replace and Wear dialogs, score
│  └─ layout/         App shell, navigation
└─ app/               Routes: / · /wardrobe · /wardrobe/[id] · /stylist · /stylist/results ·
                      /outfits/[id] · /lookbook · /profile · /stats · /design
```

**Design principles**
- **Business logic never lives in components.** The engine, stats, filters and personalisation are pure functions that take state and return values. They can run on a server unchanged.
- **Each mock sits behind an interface** in `services/index.ts`:
  - `RecommendationEngine`: `generate`, `alternatives`, `rescore`
  - `PersistenceAdapter`: `load`, `save`, `clear`
  - `RecognitionService`: `analyze(file)`
  - `ImageService`
  - `LookVisualizer`: `render(outfit)`, returning either `{kind:"simulated"}` or `{kind:"image", url}`

  To replace a mock, swap the implementation in the registry.
- **One source of truth.** Item usage counters are derived from the wear log, never stored twice. Outfits reference items by ID, and every render resolves them against the live wardrobe.
- **Referential integrity.** Deleting an item removes every outfit that used it and cleans session references and learned weights. Wear entries keep a small snapshot (name, category, colour), so history and stats stay correct after a deletion.

---

## 3. Implemented features

**Home / Today**
- Greeting with date, city and season.
- Deterministic *outfit of the day*, generated from the real wardrobe; it becomes "Today's look — logged" once worn.
- Main *Build an outfit* call to action.
- Quick access to wardrobe categories.
- Recently worn and saved looks.
- Stats strip (pieces, wears in the last 30 days, utilisation, saved looks).
- Mood presets that pre-fill the Stylist.
- *Rediscover*: least-worn pieces.

**My Wardrobe**
- Grid view with search across name, brand, colour, subcategory and material.
- Filters for category, colour (main or secondary), style, season and availability. They show as a panel on desktop and a bottom sheet on mobile.
- Sort, active-filter chips, and filter state kept in the URL.
- Item detail page with usage counters and the looks that feature the item.
- Availability switch: laundry, repair or stored items are skipped by the stylist.
- Favourites.
- Edit, including replacing the photo.
- Delete with a cascade warning.
- Add an item from a photo, or without one.
- Bulk upload of up to 12 photos, with a review step. A sample batch can be simulated.

**The Stylist**
- Inputs:
  - occasion (7 options)
  - style direction
  - season
  - free-text brief
  - preferred colours
  - excluded items (picker)
  - *build around a piece* (anchor)
  - number of looks (3–5)
  - accessory toggle
- Recent briefs can be reopened.

**Outfit results**
- 3–5 looks per brief. Each shows every piece, a description, a styling rationale and a 0–100 score.
- Actions: save, like, *not for me* (with undo), wear it, and swap any single piece using engine-ranked alternatives with score deltas.
- Optional slots (layer, outerwear, accessory) can be added or removed.
- *Regenerate* never repeats a look already shown in the session.

**Outfit detail**
- Large visualisation; tapping a piece in the collage swaps it.
- Pieces with their attributes and usage.
- Rationale and the full score breakdown (6 weighted factors).
- Save or unsave, like, reject or restore, and wear it with a date and occasion.
- Wear history for the outfit.

**Visualisation modes**, switchable everywhere outfits appear (the choice persists):
- **A — Real wardrobe collage.** An editorial flat-lay built from each item's own image (a generated cutout or the user's photo). Numbered markers map each piece to the list, and every element carries `data-item-id`.
- **B — AI look (demo).** See *Simulated features* below.

**Lookbook**
- Views: Saved, Worn, History (grouped by month) and Calendar (month grid).
- Filters by occasion and date range.
- Backfill a day ("Log an outfit").
- Remove a wear, with confirmation.

**Style profile**
- Editable fields: name, handle, city, default occasion, styles, preferred and avoided colours (mutually exclusive), fits and favourite categories.
- Changes go through an explicit save / discard bar.
- **Style DNA:** a blend of what you own, what you wear and learned feedback.
- **Learned from your feedback** panel, with a reset.

**Style stats**
- Totals: outfits worn, utilisation (last 90 days), average item usage, never-worn pieces, saved looks and the logging streak.
- Wears per week (with hover tooltips).
- Utilisation per category.
- Most-worn and least-worn items.
- Share by colour, category and occasion.
- Counts for every tracked interaction.

**Interaction tracking:** `suggested`, `viewed`, `liked` / `unliked`, `saved` / `unsaved`, `worn`, `rejected` and `item_replaced` are all recorded.
- Saved and worn are tracked separately.
- *Wear it* records the date, updates history, recalculates usage and refreshes statistics.

**Progressive personalisation:** each signal nudges learned affinities for the fits, colours, styles and items involved:
- like +0.12
- save +0.08
- wear +0.15
- reject −0.12
- swap out −0.10 / swap in +0.10

Values are clamped to ±1. The engine's *personal preference* score reads these values. For example, repeatedly wearing relaxed-fit looks raises the score of relaxed-fit items, and a unit test covers this case.

**Persistence and robustness**
- Versioned localStorage schema with validation.
- Demo data is seeded on first run.
- Saves are debounced; storage-quota errors appear as a toast.
- Corrupt or old data is reset safely, with a notice.
- *Reset demo data* is protected by a confirmation.
- Uploaded photos are downscaled to 640px JPEG before storing.

**Design system**
- Tailwind v4 tokens for colour, type, radii and motion.
- Reusable components with empty, loading, error and confirmation states and toasts.
- Bottom-sheet modals on mobile, with a focus trap and Escape to close.
- `prefers-reduced-motion` is respected.

---

## 4. Recommendation engine

`src/services/recommendation/` is a **deterministic, rule-based** engine. It contains no `Math.random`. The same inputs and wardrobe state always produce the same results, and it never invents items.

1. **Eligibility.** Only *available*, non-excluded items that suit the season are considered, and brief "no X" rules apply.
   - Occasions set formality bounds: no hoodies or joggers for work, and no shorts for work, evening or special occasions.
   - Shorts, outerwear, warm pieces and accessories must match the season exactly.
2. **Pools.** Items are ranked per slot (base, layer, outerwear, bottom, shoes, accessory) by preference, occasion affinity, season and style alignment.
3. **Enumeration.** Every valid base × layer × outerwear × bottom × shoes combination is built, using layering rules from `domain/garments.ts`:
   - an open shirt over a tee-like base
   - a knit over a collared shirt
   - no tank top under outerwear, no warm layers with shorts, no boots with shorts
4. **Scoring** (weights are configurable in `config.ts` via `createRuleBasedEngine(weights)`):

   | Factor | Weight | How it is scored |
   |---|---|---|
   | Colour harmony | 25% | Accent count (neutral / one accent / earthy pair / analogous / complementary), light–dark contrast, clashing secondaries, more than one loud pattern penalised, tonal/pop briefs |
   | Style consistency | 25% | Pairwise style-compatibility matrix + alignment to requested (or occasion) styles |
   | Personal preference | 20% | Profile colours, fits, categories, styles, favourites, avoided colours, brief keywords, **learned affinities** |
   | Occasion | 15% | Average formality against the occasion target + occasion style affinity |
   | Season / weather | 10% | Item seasons + total warmth against the season target (outerwear in winter, warmer/lighter brief) |
   | Rotation | 5% | Favours rarely and less recently worn pieces |

5. **Accessories.** A look gets an accessory only if it does not lower the score, and the engine prefers accessories not already used in the batch.
6. **Diversity.** Selection is greedy with progressively relaxed overlap limits: unique base and bottom first, then at most two shared core pieces. Rejected looks and looks already shown in the session are excluded.
7. **Explanations.** Each look gets an editorial name, a one-line description and rationale bullets built from the actual scoring factors.

Additional engine calls:
- `alternatives()` ranks swap candidates for a slot.
- `rescore()` refreshes an outfit after a swap or an item edit.

Unit tests (`npm test`, 13) cover:
- determinism
- every occasion
- availability and exclusions
- structural validity in all seasons
- the shorts rules
- diversity
- non-repeating regeneration
- brief parsing
- shortfall reporting
- learned-fit influence
- alternatives
- anchors

---

## 5. Simulated features (clearly labelled DEMO in the UI)

| Feature | What actually happens | Labelling |
|---|---|---|
| **Garment recognition** on upload | Category and type are guessed from **keywords in the file name**. The main colour is **really sampled** from the photo's central pixels and matched to the palette. Confidence values are illustrative. | "DEMO RECOGNITION" badge and copy saying no vision model runs; every field stays editable |
| **Bulk upload "sample batch"** | Adds 4 predefined items with generated cutouts, through a simulated processing queue | DEMO note in the dialog |
| **AI generated look (mode B)** | An illustrative figure dressed in stylised versions of the outfit's garments (shape and colour only). **No image generation runs.** | Permanent "AI VISUALIZATION — DEMO" label and the caption *"Not an image of your actual garments"* |
| **Brief understanding** | Deterministic keyword and negation parsing (e.g. "no sneakers", "tonal", "cold", "relaxed") | "Brief understood as" chips with a DEMO badge, so the user sees exactly what was parsed |
| **"AI stylist"** | A transparent rule-based engine (above), not a machine-learning model | The UI says "scored from your wardrobe" and shows the score breakdown |
| **Product photography** | The 47 demo items use **generated SVG product cutouts** (34 garment shapes with colour and pattern treatments), not photos. This keeps the visual treatment consistent, needs no licences and gives the clean cut-outs the collage needs. Uploaded user photos replace them per item. | Item detail notes "Generated product cutout" |

There is no virtual try-on, and nothing claims that real image generation or vision is running.

---

## 6. Known limitations

- **Single device, single browser.** State lives in localStorage (about 5 MB), so it is not synced and has no accounts. Large photo libraries will hit the quota; the app shows an error toast when that happens.
- **Uploaded photos are stored as data URLs.** There is no background removal, so uploaded photos appear as framed tiles in the collage rather than cut-outs.
- The **brief parser** only understands keyword-level English. It does not understand complex phrasing.
- The **engine enumerates** bounded candidate pools (≈1–5k combinations, under 150 ms). Very large wardrobes would need a smarter search.
- **Weather** is approximated by season; there is no live forecast.
- **Fit and body data** are not modelled beyond each item's fit attribute.
- The calendar and stats use the device's local date and time zone.
- No internationalisation: the UI is English, with en-GB date formats.

## 7. Recommended next steps

1. **Backend and accounts.** Implement `PersistenceAdapter` against an API (for example Postgres or Supabase), add authentication, and move photos to object storage.
2. **Real vision.** Implement `RecognitionService` with a vision model for category, colour, pattern and material, and add background removal for true cut-outs in the collage.
3. **Engine v2.** Learn the scoring weights from logged interactions. Add weather from a forecast API and an LLM brief parser that outputs the same `ParsedInstructions` shape.
4. **Real look generation.** Implement `LookVisualizer` with an image model conditioned on the user's own item photos, keeping explicit AI labelling.
5. **Onboarding.** Add a style quiz to seed the profile, and guided wardrobe capture.
6. **Analytics and testing.** Add product analytics on the existing interaction log and run the Playwright suite in CI.
7. **PWA.** Make the app installable, add offline support and a daily outfit notification.

---

## 8. Demo data

- **47 items:** 9 tops and tees, 6 shirts, 5 sweats and hoodies, 5 outerwear, 8 trousers and jeans, 3 shorts, 6 shoes and 5 accessories.
  - Every item has an ID, name, category, subcategory, type, main and secondary colours, styles, seasons, pattern, availability, image, brand, material, fit, formality and creation date.
  - Two items start *in laundry* to show how availability works.
- **Demo profile:** Noa, Milan.
  - Styles: streetwear, minimal, vintage.
  - Preferred colours: black, white, olive, denim, ecru. Avoided colours: pink, yellow.
  - Preferred fits: relaxed, regular.
- **History:** 8 seeded looks (7 saved) and 18 wear entries spread over the past 5 weeks, relative to the date of first launch.
- **Unisex by design.** Categories are garment-based, never gendered.
