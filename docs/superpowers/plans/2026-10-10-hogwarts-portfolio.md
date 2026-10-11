# Hogwarts-Inspired Developer Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-quality, single-page cinematic portfolio for Kumar Shreyash — a working Next.js site whose visual foundation is the eight artwork panels extracted from his supplied design board, and whose content is 100% verified against his résumé and repositories.

**Architecture:** Next.js 15+ App Router, Server Components by default; client islands only for the nav, motion layers, and the contact form. All content lives in typed data modules (`src/config`, `src/data`) so sections are pure renderers. Artwork is extracted once by a committed Python script into `public/images/portfolio/`, then used strictly as painted backdrops under CSS overlays — every word, button, and form control stays real HTML.

**Tech Stack:** Next.js (App Router) · TypeScript · Tailwind CSS v4 (`@theme` tokens) · GSAP 3.13 + `@gsap/react` (hero timeline, ScrollTrigger route-draw, parallax) · `motion` (presence-only: drawer, letter unfold, skill expand, send confirmation) · lucide-react · Vitest + Testing Library · Pillow (build-time asset extraction)

**Spec:** The master prompt in this conversation (sections 1–22), plus `design-references/harry-potter-portfolio-board.png` and `public/resume/Kumar-Shreyash-Resume.pdf`.

---

## Global Constraints

- Name renders exactly as **Kumar Shreyash**. Headline exactly **Software Developer & AI Systems Builder**.
- Page title exactly: `Kumar Shreyash | Software Developer & AI Systems Builder`.
- Section ids exactly: `#home` `#about` `#projects` `#skills` `#experience` `#achievements` `#contact`.
- Asset filenames exactly: `hogwarts-hero.webp`, `enchanted-lake-footer.webp`, `acceptance-letter.webp`, `spellbook-projects.webp`, `house-banners-skills.webp`, `marauders-map-experience.webp`, `daily-prophet-achievements.webp`, `owl-post-contact.webp` — all under `public/images/portfolio/`.
- Colour tokens are fixed by the spec: obsidian `#080B11`, midnight navy `#101C2B`, deep blue `#172B3B`, teal mist `#23434A`, antique gold `#C69A55`, light gold `#E5C58B`, parchment `#E7D4AF`, warm white `#F4EBDD`, muted `#B7BCC5`. Only *derived* tokens may be added (sepia ink for text on parchment, wax-seal red), and they must be named as derived.
- Typefaces: Cinzel (display), Cormorant Garamond (editorial prose), Inter (UI/body), JetBrains Mono (technical metadata). Loaded via `next/font/google` with `display: "swap"` and CSS-variable binding.
- **Zero invented content.** Every project, date, employer, metric, skill and URL must trace to the résumé, a local repository, or the GitHub profile README. Anything unverified is either omitted or exposed as a commented config field.
- Verified external URLs — the only ones permitted to appear:
  - `https://github.com/KSShreyash`
  - `https://www.linkedin.com/in/kumarshreyash25`
  - `mailto:kumarshreyash2504@gmail.com`
  - `https://github.com/KSShreyash/AI-Relationship-Manager`
  - `https://github.com/KSShreyash/AI-Agent-Deployed`
  - `https://ai-relationship-manager.pages.dev` (live, pending a reachability check in Task 15)
- Phone number from the résumé (`+91 7970406579`) must **not** render. It lives in `site.ts` commented out, with a note.
- No canonical URL and no `metadataBase` host until a production domain is known; use a relative-safe metadata config.
- The whole reference board is never used as a background. No official Hogwarts crest, Harry Potter wordmark, or "Daily Prophet" masthead appears as site branding.
- `prefers-reduced-motion: reduce` must leave every piece of content visible and every control functional.
- No horizontal overflow at any width from 320px to 2560px.

## Review Focus

Five failure modes the spec implies but which no section's own happy path exercises. Each has a named test in the task that owns the code.

1. **Deep-link on first paint.** Someone opens `/#projects` directly, or hits a nav link before hydration. The anchor must land below the fixed header, not under it, and must not fight a GSAP scroll animation. → test in Task 5.
2. **Reveal animations that hide content forever.** If scroll-reveal starts elements at `opacity: 0` in CSS and the JS never runs (reduced motion, GSAP chunk fails, JS disabled), the page is blank prose. Content must be visible by default; only JS that has already run may hide it. → test in Task 4.
3. **Reduced motion leaves a half-built page.** The map route draws via `strokeDashoffset`, the hero masks text, the letter unfolds from `scaleY(0)`. Each needs a defined *end state* applied immediately when motion is reduced — not a skipped animation that leaves the initial state on screen. → test in Task 13.
4. **Extreme viewports.** 21:9 ultrawide (2560×1080) and short landscape phone (740×360) both break full-viewport heroes: text collides with the castle, or the hero exceeds the screen and the scroll cue is unreachable. → verified in Task 6 and Task 15.
5. **mailto payloads.** A message with newlines, `&`, `#`, or emoji must survive encoding; a message over the ~1800-character practical mailto ceiling must be caught and reported rather than silently truncated by the OS. → tests in Task 12.

---

## Design Plan

Reviewed against the brief before any code. Where the brief pins an axis (palette, typefaces, eyebrow copy, section names) the brief wins verbatim. Where it leaves an axis free, the choice below is justified by the subject — a developer who hand-derives LSTM backprop in C++ and builds LLM agents, whose own GitHub profile is already an illuminated-manuscript joke.

### Concept: **the folio**

The site is a bound volume, and each section is a *different kind of page* in it. This is the single decision that keeps the build off the identical-rounded-cards template: no two sections share a layout primitive.

| Section | Page type | Ground | Structural device |
|---|---|---|---|
| Home | Frontispiece plate | Night artwork, full bleed | A single hairline gold rule under the name |
| About | Tipped-in letter | Parchment sheet floating on dark | Wax-seal medallion, ruled margin, drop cap |
| Projects | Grimoire entries | Dark, candlelit | Folio numbers (a real sequence), marginal mono incantation |
| Skills | Hanging pennants | Gothic hall, darkened | Four tapered `clip-path` banners — not cards |
| Experience | Route map | Parchment texture, full bleed | SVG dotted route drawn through the real entries |
| Achievements | Broadsheet | Clippings artwork, darkened | Multi-column rules, no cards |
| Contact | Despatch desk | Moonlit owl scene | Dark panel, form set as a letter |
| Footer | Colophon | Lake artwork | One thin gold divider |

### Colour

Spec tokens are fixed. Three *materials*, not one accent on black:

- **Midnight** (`#080B11` → `#101C2B` → `#172B3B` → `#23434A`) — the default ground.
- **Parchment** (`#E7D4AF`, shadow `#D8C094`) — used only where the content genuinely is a document: the letter, the map, the clippings.
- **Candlelight** (`#C69A55`, `#E5C58B`) — treated as *light*, not trim. Gold appears where something is lit: the rule beneath a heading, a focus ring, the candle-facing edge of a card. Never as a border on all four sides of everything.

Derived tokens (named as derived, not substitutes for spec values):

- `--ink: #2A2118` — sepia ink for body text on parchment. Obsidian on parchment reads cold and wrong for the material; `#2A2118` on `#E7D4AF` is ~11:1.
- `--ink-soft: #4A3C2C` — secondary text on parchment, ~7:1.
- `--parchment-deep: #D8C094` — shadowed parchment, rules, ruled lines.
- `--seal: #7E1416` — the wax seal and nothing else. One use, one meaning.

Contrast floor: `--muted #B7BCC5` on `--obsidian` = 11.4:1. `--gold #C69A55` on `--obsidian` = 7.3:1. `--parchment` on `--obsidian` = 13.6:1. All pass AA for normal text.

### Type

Four faces, each with one job — the brief names them, so the work here is the scale and the restraint.

| Role | Face | Setting |
|---|---|---|
| Display | Cinzel 400/600 | `clamp(3rem, 8vw, 6.5rem)`, tracking `.06em`. Roman inscriptional capitals — the right register for a carved name over a castle. |
| Editorial prose | Cormorant Garamond 400/500i | `1.25rem / 1.65`, max `62ch`. Narrative only: the letter, the broadsheet. |
| UI + technical body | Inter 400/500/600 | `1.0625rem / 1.7`, max `68ch`. Every project description, every form label. |
| Metadata | JetBrains Mono 400/500 | `.75rem`, tracking `.08em`. Only genuine technical metadata: stack chips, folio numbers, date ranges, architecture-glyph labels. |

Line length stays under 68ch for sans, 62ch for the serif, which gets extra leading per the brief's own typographic guidance.

### Layout wireframes

Hero (≥1280px) — content block 580–650px, castle kept clear on the right:

```
┌──────────────────────────────────────────────────────────────┐
│ ◇KS      about projects skills experience …   [ Résumé ]     │  transparent
│                                                              │
│                                               ☾              │
│   SOFTWARE DEVELOPER · AI ENTHUSIAST                         │
│                                            ▲▲                │
│   Kumar Shreyash                          ▲██▲   castle      │
│   ───────────────                        ▲████▲  stays       │
│   Building intelligent things.          ▲██████▲ visible     │
│                                        ▲████████▲            │
│   I build software, explore AI …      ▲██████████▲           │
│                                                              │
│   [ Explore my work ]  [ Download résumé ]   ⌁ ⌁             │
│                                                              │
│                         ⌄  scroll                            │
└──────────────────────────────────────────────────────────────┘
      ← dark gradient ──────────────→ lighter toward castle
```

Projects — featured entry as a two-page spread, then a grid of smaller entries. Folio numbers in the margin, because this *is* a numbered sequence of entries:

```
  SELECTED WORK
  The Spellbook
  ─────────────
┌─────────────────────────────┬──────────────────────────────┐
│ ❧ i.                        │  AI Workspace Assistant      │
│  ┌───────────────────────┐  │  AI · Productivity · Full-…  │
│  │  architecture glyph   │  │                              │
│  │  browser→api→postgres │  │  Reads Outlook, Calendar and │
│  └───────────────────────┘  │  Teams, extracts commitments…│
│                             │  ┌next.js┐┌fastapi┐┌supabase┐│
│                             │  Read the case study · GitHub│
└─────────────────────────────┴──────────────────────────────┘
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ❧ ii.            │ │ ❧ iii.           │ │ ❧ iv.            │
│ Problem Tracking │ │ LSTM in pure C++ │ │ Treasure Hunt    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

Skills — four tapered pennants (`clip-path`), echoing the banners in the artwork behind them but carrying original emblems:

```
      Houses of Knowledge
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│  ⚒  │  │  ◉  │  │  ✶  │  │  ▤  │
│Forge│  │Think│  │Obs. │  │Arch.│
│ C   │  │ ML  │  │React│  │ Git │
│ C++ │  │ LLM │  │Next │  │ SQL │
│  ▼  │  │  ▼  │  │  ▼  │  │  ▼  │   ← tapered point, not a card
└─────┘  └─────┘  └─────┘  └─────┘
```

Experience — the route is the layout. An SVG path threads the real entries; markers sit on it:

```
   ●━━━━━━━━●━━━━━━━━━━●━━━━━━━━━━━━●
   │        │          │            │
 Yolex   Samsung    Sangam         VIT
 Labs     PRISM      Club        2023–27
```

### Principles

1. **Spend boldness once per section.** The hero's bold move is the castle at full bleed with a single hairline rule. Projects' bold move is the folio spread. Skills' is the pennant silhouette. Everything adjacent stays quiet.
2. **Structure carries information.** Folio numerals appear on projects and experience because both are genuine sequences; they appear nowhere else. The four skill collections get emblems, not numbers.
3. **The artwork is a painted matte.** It is 561px wide at source. Treat it as a backdrop behind glass: soft by design, under gradients, with all crisp detail — text, rules, particles, route, glyphs — rendered as HTML/SVG/canvas on top.
4. **Gold is light.** It marks what is illuminated or interactive, never decorates a perimeter.
5. **Parchment is a material, not a theme.** It appears only on things that are documents.

### Self-review against generic defaults

- *Near-black + one bright accent* — avoided by making this a three-material palette; parchment sections genuinely invert to a light ground with sepia ink, which the single-accent look never does.
- *SaaS card kit* — avoided by the folio concept: pennants, a letter sheet, a grimoire spread, a route, and newspaper columns are five different primitives. Border radius is 0–2px on paper (paper has no rounded corners) and 4px on dark panels; not one radius everywhere.
- *Broadsheet with hairline rules* — deliberately used, but confined to Achievements, because the brief names that section "The Daily Prophet." One section, not the site.
- *Template chrome* — the ALL-CAPS eyebrow and `A · B · C` category strings are **required verbatim by the brief**, so they stay. Not adopted: `→` appended to buttons, tinted near-black stand-ins (the spec's exact `#080B11` is used), mono for non-technical labels.
- *Fade-and-slide-up on every section* — the entrance is one orchestrated hero timeline. Below the fold, reveals are a short opacity+2px lift on headings only; cards appear with the section, not each on its own trigger.

---

## Asset Extraction — verified crop geometry

Source: `Hogwarts-Inspired Portfolio Design Board.png`, **1536 × 1024**, RGB. The board is a 4-row × 2-column contact sheet with a left sidebar (x 0–200, the structure list), a right sidebar of thumbnails (x ≥ 1340), gold panel borders, and a caption band under every panel. Boundaries below were measured by luminance profiling, not guessed, and every crop was rendered to a contact sheet and visually confirmed to contain exactly one artwork with no border, caption, or neighbour.

Column bands (inset 2px inside the gold rule): **A = x 212…772**, **B = x 789…1326**
Row bands: **R1 = y 3…236**, **R2 = y 279…499**, **R3 = y 542…744**, **R4 = y 785…983**

| Output file | Box (L,T,R,B) | Native size | Section |
|---|---|---|---|
| `hogwarts-hero.webp` | 212, 3, 773, 237 | 561×234 | Home |
| `enchanted-lake-footer.webp` | 789, 3, 1327, 237 | 538×234 | Footer |
| `acceptance-letter.webp` | 212, 279, 773, 500 | 561×221 | About |
| `spellbook-projects.webp` | 789, 279, 1327, 500 | 538×221 | Projects |
| `house-banners-skills.webp` | 212, 542, 773, 745 | 561×203 | Skills |
| `marauders-map-experience.webp` | 789, 542, 1327, 745 | 538×203 | Experience |
| `daily-prophet-achievements.webp` | 212, 785, 773, 984 | 561×199 | Achievements |
| `owl-post-contact.webp` | 789, 785, 1327, 984 | 538×199 | Contact |

**Two crops need a second pass**, decided from visual inspection:

- `marauders-map-experience` carries a small Hogwarts "H" crest in its top-right corner. Sub-crop to `(0, 24) → (448, 203)` of the panel before upscaling, which removes the crest and keeps the parchment, the castle line-art, and the compass rose. The dotted route in the artwork is *not* used as the timeline — an original SVG route is drawn through the real entries instead.
- `daily-prophet-achievements` has the words "The Daily Prophet" baked into the artwork at top-left. Sub-crop to `(0, 46) → (561, 199)` of the panel, which drops the masthead and keeps all three clippings, the lantern and the quill. The section's own masthead is set in HTML.

**Resolution verdict — stated plainly.** 538–561px sources are 2.5–3.6× short of full-bleed desktop use. Mitigation, in order of effect:

1. Lanczos upscale to a single master per asset (sizes in Task 2), then a *mild* unsharp mask (radius 1.2, percent 55, threshold 3). No AI upscaling, no invented detail.
2. Art-direct so sharpness is not expected: every backdrop sits under a gradient overlay at 55–80% effective darkness, and all crisp elements are HTML/SVG/canvas on top.
3. Film grain is applied as **one global SVG `feTurbulence` overlay in CSS**, never baked into the files — baked noise would wreck WebP compression and look different per section.
4. The hero image occupies the upper ~78% of the viewport and dissolves into `--obsidian` below, so the required upscale is ~2.9× rather than ~3.9×.

If any asset still reads as mush at 1440px after Task 15's visual check, that asset — and only that one — gets a hand-built CSS/SVG supplemental backdrop in the same palette, recorded in the final report. No silent substitution of unrelated images.

---

## File Structure

```
Portfolio Website/
├─ design-references/
│  └─ harry-potter-portfolio-board.png      provenance copy of the source board
├─ scripts/
│  └─ extract_assets.py                     the only thing that writes public/images/portfolio
├─ public/
│  ├─ images/portfolio/*.webp               8 masters, committed
│  ├─ resume/Kumar-Shreyash-Resume.pdf      real file, drives the Résumé buttons
│  └─ icon.svg                              original KS monogram → favicon
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                         fonts, metadata, <body> chrome, skip link
│  │  ├─ page.tsx                           server component: composes the 7 sections
│  │  ├─ globals.css                        @theme tokens, base type, ornament utilities
│  │  ├─ not-found.tsx
│  │  ├─ opengraph-image.tsx                next/og card from the monogram + headline
│  │  └─ projects/[slug]/page.tsx           case-study route, static params from data
│  ├─ components/
│  │  ├─ layout/Navigation.tsx              client: scroll state, active section, drawer
│  │  ├─ layout/Footer.tsx                  server
│  │  ├─ layout/SkipLink.tsx                server
│  │  ├─ sections/HeroSection.tsx           server shell + <HeroMotion> client island
│  │  ├─ sections/AboutSection.tsx
│  │  ├─ sections/ProjectsSection.tsx
│  │  ├─ sections/SkillsSection.tsx
│  │  ├─ sections/ExperienceSection.tsx
│  │  ├─ sections/AchievementsSection.tsx
│  │  ├─ sections/ContactSection.tsx
│  │  ├─ motion/HeroMotion.tsx              client: the one entrance timeline + parallax
│  │  ├─ motion/Reveal.tsx                  client: JS-only reveal wrapper (never CSS-hidden)
│  │  ├─ motion/ParticleField.tsx           client: canvas, ≤60 particles, DPR-aware
│  │  └─ ui/{MagicalButton,SectionHeading,Monogram,Ornament,TechChip,
│  │         ProjectCard,ProjectPlate,SkillBanner,ExperienceRoute,
│  │         ClippingCard,ContactForm}.tsx
│  ├─ config/site.ts                        name, headline, links, nav, résumé path
│  ├─ data/{projects,skills,experience,achievements}.ts
│  └─ lib/{types.ts,mailto.ts,validation.ts,motion.ts,cn.ts,blur.ts}
└─ src/test/{setup.ts, tokens.test.ts, assets.test.ts, data.test.ts,
             reveal.test.tsx, navigation.test.tsx, mailto.test.ts,
             validation.test.ts, reduced-motion.test.tsx}
```

Each file has one responsibility; sections are renderers over data and hold no content strings beyond their own headings, which the brief fixes verbatim.

---

## Verified content inventory

Everything below traces to the résumé PDF, a local repo, or the GitHub profile README. Nothing else may appear on the site.

**Identity** — Kumar Shreyash · Delhi, India · `kumarshreyash2504@gmail.com` · `github.com/KSShreyash` · `linkedin.com/in/kumarshreyash25`.

**Education** — Vellore Institute of Technology, B.Tech Computer Science, Aug 2023 – Jul 2027, CGPA 8.79. (Campus: VIT Chennai, per the Sangam Club entry.)

**Experience** — most recent first:

1. **Yolex Labs** · Software Development Intern · Singapore (Remote) · Jun 2026 – Oct 2026. AI agents for organizational workflow analysis and task automation with context-aware detection of operational bottlenecks; worked with a distributed remote team, owning assigned tasks from implementation through testing; shipped bulk résumé upload that parses CVs into structured candidate profiles for assessment invitations; resolved a duplicate-record bug that created a new position instead of updating the existing one when navigating back from a generated brief; built the interview-round configuration admin panel for Candoor, an anonymous interview platform, and redesigned its UI/UX.
2. **Samsung PRISM** (Samsung R&D Institute India – Bangalore) · Research Intern · Bangalore (Remote) · Aug 2025 – May 2026. C/C++ forward and backward propagation layers for deep learning models targeting resource-constrained embedded devices where standard ML frameworks are not viable; validated numerical accuracy of model outputs and trained weights against TensorFlow reference implementations within defined precision benchmarks; built a modular, reusable C++ class framework abstracting low-level operations into higher-level ML primitives, benchmarked for latency and code size against TensorFlow baselines.
3. **Sangam Club, VIT Chennai** · Technical Lead · Chennai, India · Apr 2024 – May 2026. Built a React–Supabase treasure-hunt application with real-time QR verification for 300+ users; led a 15+ member team in delivering technology-driven club events.

**Projects**

1. *AI Workspace Assistant* — featured. Repo `KSShreyash/AI-Relationship-Manager`; live `ai-relationship-manager.pages.dev`. Stack per its README: Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Vitest; FastAPI (async Python), pytest/respx; Postgres on Supabase; Supabase Auth + Azure AD; Microsoft Graph; OpenAI `gpt-4o-mini` with strict JSON Schema; MSAL token refresh; Fernet encryption at rest; GitHub Actions cron every 15 min; Cloudflare Pages + Render. Case study may cite its documented known limitations.
2. *Problem Tracking Agent* — repo `KSShreyash/AI-Agent-Deployed`. Python 3.11, FastAPI, Uvicorn, MongoDB + Motor, GPT-4o + Whisper + TTS, JWT HS256, Google OAuth 2.0, Google Calendar API v3, vanilla HTML/CSS/JS, tldraw, httpx. Built at Yolex Labs; no public demo URL verified → no live link rendered.
3. *LSTM in pure C++* — from the GitHub profile README: gates, cell state and backpropagation through time derived and implemented by hand, no autograd. No repository URL verified → card renders with no link buttons.
4. *Treasure Hunt* — React + Supabase, real-time QR verification, 300+ users, Sangam Club. No repository URL verified → no link buttons.

**Skills** — résumé verbatim, plus items corroborated by repositories:
C · C++ · Java · Python · React · HTML · CSS · JavaScript · TypeScript¹ · Next.js¹ · Tailwind¹ · GSAP² · SQL · PostgreSQL · Supabase · MongoDB · REST APIs · FastAPI · Node.js² · Express² · Docker² · Linux² · Git · GitHub · VS Code · Claude Code · OpenAI/GPT-4o¹ · Microsoft Graph¹ · Vitest¹ · pytest¹ · DSA · Computer Networks · Operating Systems · Machine Learning · OOP · AI Agents.

¹ verified in a local repository. ² listed on the GitHub profile README. Anything with neither mark came straight off the résumé.

**Achievements** — the résumé has no awards or certifications section, so nothing may be invented. The Daily Prophet section runs verified highlights drawn from the record above, written as dispatches: CGPA 8.79 at VIT; selection to Samsung PRISM with SRI-B; C++ ML primitives validated against TensorFlow within precision benchmarks; Technical Lead of a 15+ member team; treasure-hunt platform serving 300+ users; AI Workspace Assistant shipped to a live deployment. `src/data/achievements.ts` carries a commented template block so real certificates, publications or hackathon results can be added later without touching components.

---

### Task 1: Scaffold, toolchain, and the design-token smoke test

**Files:**

- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `src/test/setup.ts`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/test/tokens.test.ts`

**Interfaces:**

- Produces: a running `npm run dev`, and `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` all green on an empty page.

- [ ] **Step 1:** Move the board PNG to `design-references/harry-potter-portfolio-board.png` so the generator sees a clean tree, then run `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --yes`.

- [ ] **Step 2:** Install runtime deps: `npm i gsap @gsap/react motion lucide-react`. Install dev deps: `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`.

- [ ] **Step 3:** Add `vitest.config.ts` (jsdom environment, `setupFiles: ['src/test/setup.ts']`, alias `@` → `src`) and `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`. Add `"test": "vitest run"` and `"typecheck": "tsc --noEmit"` scripts.

- [ ] **Step 4: Write the failing test** — `src/test/tokens.test.ts` asserts `globals.css` declares all nine spec colour tokens with exactly the spec hex values:

```ts
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const SPEC = {
  "--color-obsidian": "#080B11", "--color-midnight": "#101C2B",
  "--color-deep-blue": "#172B3B", "--color-teal-mist": "#23434A",
  "--color-gold": "#C69A55", "--color-gold-light": "#E5C58B",
  "--color-parchment": "#E7D4AF", "--color-warm-white": "#F4EBDD",
  "--color-muted": "#B7BCC5",
};

describe("design tokens", () => {
  it.each(Object.entries(SPEC))("declares %s as %s", (token, hex) => {
    expect(css).toMatch(new RegExp(`${token}\\s*:\\s*${hex}`, "i"));
  });
});
```

- [ ] **Step 5:** Run `npm test` — expect FAIL, tokens absent.

- [ ] **Step 6:** Write `globals.css`: `@import "tailwindcss";` then an `@theme` block with the nine spec tokens plus the four derived tokens (`--color-ink: #2A2118`, `--color-ink-soft: #4A3C2C`, `--color-parchment-deep: #D8C094`, `--color-seal: #7E1416`), each derived one carrying a comment saying it is derived and why.

- [ ] **Step 7:** Run `npm test` — expect PASS. Then `npm run lint`, `npm run typecheck`, `npm run build` — all must succeed before moving on.

---

### Task 2: Asset extraction pipeline

**Files:**

- Create: `scripts/extract_assets.py`, `public/images/portfolio/*.webp`, `src/lib/blur.ts`
- Create: `src/test/assets.test.ts`

**Interfaces:**

- Produces: eight WebP masters at the sizes below, and `src/lib/blur.ts` exporting `BLUR: Record<AssetName, string>` of base64 LQIP strings for `next/image` `blurDataURL`.

Master sizes (Lanczos, then unsharp 1.2/55/3, WebP quality 82):

| File | Master | Factor |
|---|---|---|
| `hogwarts-hero.webp` | 2000 × 834 | 3.56× |
| `enchanted-lake-footer.webp` | 1920 × 835 | 3.57× |
| `acceptance-letter.webp` | 1400 × 552 | 2.50× |
| `spellbook-projects.webp` | 1600 × 657 | 2.97× |
| `house-banners-skills.webp` | 1800 × 651 | 3.21× |
| `marauders-map-experience.webp` | 1600 × 639 | 3.57× (from the de-crested sub-crop) |
| `daily-prophet-achievements.webp` | 1500 × 409 | 2.67× (from the de-mastheaded sub-crop) |
| `owl-post-contact.webp` | 1800 × 666 | 3.35× |

- [ ] **Step 1: Write the failing test** — `src/test/assets.test.ts` asserts all eight files exist, are non-trivial, and match the expected master dimensions:

```ts
import { readFileSync, existsSync } from "node:fs";
import { describe, it, expect } from "vitest";

const EXPECTED: Record<string, [number, number]> = {
  "hogwarts-hero": [2000, 834], "enchanted-lake-footer": [1920, 835],
  "acceptance-letter": [1400, 551], "spellbook-projects": [1600, 657],
  "house-banners-skills": [1800, 651], "marauders-map-experience": [1600, 554],
  "daily-prophet-achievements": [1500, 629], "owl-post-contact": [1800, 666],
};

/** Minimal VP8X/VP8L/VP8 dimension reader — avoids adding an image dep for one test. */
function webpSize(buf: Buffer): [number, number] {
  expect(buf.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(buf.subarray(8, 12).toString("ascii")).toBe("WEBP");
  const fourcc = buf.subarray(12, 16).toString("ascii");
  if (fourcc === "VP8X") return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1];
  }
  return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
}

describe("extracted portfolio artwork", () => {
  it.each(Object.entries(EXPECTED))("%s is present at the expected master size", (name, [w, h]) => {
    const p = `public/images/portfolio/${name}.webp`;
    expect(existsSync(p)).toBe(true);
    const buf = readFileSync(p);
    expect(buf.byteLength).toBeGreaterThan(20_000);
    expect(webpSize(buf)).toEqual([w, h]);
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL, files absent.

- [ ] **Step 3:** Write `scripts/extract_assets.py`. It must: read the board from `design-references/`, assert the source is 1536×1024 and abort loudly otherwise, carry the crop table and the two sub-crops as named constants with comments explaining the crest and masthead removals, upscale with `Image.LANCZOS`, apply `ImageFilter.UnsharpMask(radius=1.2, percent=55, threshold=3)`, save WebP `quality=82, method=6`, and emit `src/lib/blur.ts` with a 16px-wide base64 LQIP per asset. It prints a one-line report per file.

- [ ] **Step 4:** Run `python scripts/extract_assets.py`, then `npm test` — expect PASS.

- [ ] **Step 5:** Build a contact sheet of the eight masters downscaled to 480px and **look at it**. Confirm: no gold border fragments, no caption text, no neighbouring panel, no "Daily Prophet" masthead, no "H" crest, no stretching. Re-crop and re-run if any check fails.

- [ ] **Step 6:** Copy the résumé to `public/resume/Kumar-Shreyash-Resume.pdf`.

---

### Task 3: Config and data layer

**Files:**

- Create: `src/lib/types.ts`, `src/config/site.ts`, `src/data/projects.ts`, `src/data/skills.ts`, `src/data/experience.ts`, `src/data/achievements.ts`
- Create: `src/test/data.test.ts`

**Interfaces:**

- Produces, consumed by every section:
  - `siteConfig: { name; headline; supportingHeadline; intro; location; email; githubUrl; linkedinUrl; resumePath; nav: NavItem[] }`
  - `NavItem = { id: SectionId; label: string }`, `SectionId = "home"|"about"|"projects"|"skills"|"experience"|"achievements"|"contact"`
  - `Project = { id; slug; title; category; description; technologies: string[]; glyph: GlyphKind; githubUrl?; liveUrl?; featured: boolean; status: "live"|"active"|"archived"; caseStudy?: CaseStudy }`
  - `CaseStudy = { overview; problem?; architecture?: string[]; decisions?: {title;body}[]; implementation?: string[]; challenges?: string[]; results?: string[]; limitations?: string[] }`
  - `SkillCollection = { id; name; tagline; emblem: EmblemKind; accent; primary: string[]; more: string[]; relatedProjectSlugs: string[] }`
  - `ExperienceEntry = { id; organisation; role; location; start; end; summary; responsibilities: string[]; technologies: string[]; kind: "work"|"education"|"leadership" }`
  - `Achievement = { id; headline; year; body; issuer?; evidenceUrl? }`

- [ ] **Step 1: Write the failing test** — `src/test/data.test.ts`. This is the file that enforces "no invented content" mechanically:

```ts
import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { experience } from "@/data/experience";
import { achievements } from "@/data/achievements";

const ALLOWED_HOSTS = ["github.com", "www.linkedin.com", "ai-relationship-manager.pages.dev"];
const urls = (s: unknown) => JSON.stringify(s).match(/https?:\/\/[^"'\s)]+/g) ?? [];

describe("site config", () => {
  it("uses the exact brand strings the spec fixes", () => {
    expect(siteConfig.name).toBe("Kumar Shreyash");
    expect(siteConfig.headline).toBe("Software Developer & AI Systems Builder");
  });
  it("ships a résumé that actually exists", () => {
    expect(existsSync(`public${siteConfig.resumePath}`)).toBe(true);
  });
  it("navigates to exactly the spec's section ids", () => {
    expect(siteConfig.nav.map(n => n.id)).toEqual(
      ["about", "projects", "skills", "experience", "achievements", "contact"]);
  });
  it("never exposes the phone number", () => {
    expect(JSON.stringify(siteConfig)).not.toMatch(/7970406579/);
  });
});

describe("no invented or placeholder content", () => {
  const all = [siteConfig, projects, skills, experience, achievements];
  it.each(all.map((d, i) => [i, d] as const))("dataset %i contains no placeholder markers", (_i, d) => {
    expect(JSON.stringify(d)).not.toMatch(/lorem|ipsum|example\.com|TODO|TBD|FIXME|your-|placeholder/i);
  });
  it("only links to verified hosts", () => {
    for (const u of all.flatMap(urls)) {
      expect(ALLOWED_HOSTS).toContain(new URL(u).host);
    }
  });
});

describe("projects", () => {
  it("has exactly one featured project", () => {
    expect(projects.filter(p => p.featured)).toHaveLength(1);
  });
  it("has unique slugs", () => {
    expect(new Set(projects.map(p => p.slug)).size).toBe(projects.length);
  });
  it("omits optional URLs rather than emptying them", () => {
    for (const p of projects) {
      if ("githubUrl" in p) expect(p.githubUrl).toMatch(/^https:\/\//);
      if ("liveUrl" in p) expect(p.liveUrl).toMatch(/^https:\/\//);
    }
  });
});

describe("experience", () => {
  it("is ordered most recent first", () => {
    const t = experience.map(e => Date.parse(`${e.start} 1`));
    expect([...t].sort((a, b) => b - a)).toEqual(t);
  });
});

describe("skills", () => {
  it("has the four collections the spec names", () => {
    expect(skills.map(s => s.name)).toEqual(
      ["The Forge", "The Thinkery", "The Observatory", "The Archives"]);
  });
  it("only references projects that exist", () => {
    const slugs = new Set(projects.map(p => p.slug));
    for (const c of skills) for (const s of c.relatedProjectSlugs) expect(slugs).toContain(s);
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL, modules absent.

- [ ] **Step 3:** Write `src/lib/types.ts` with the interfaces above, then the five data modules populated **only** from the verified content inventory in this plan. `site.ts` carries the commented-out phone field with a note explaining it is deliberately unpublished, and a commented `canonicalUrl` field to fill in once a domain exists.

- [ ] **Step 4:** Run `npm test` — expect PASS. Run `npm run typecheck`.

---

### Task 4: Design-system primitives and the JS-only reveal

**Files:**

- Modify: `src/app/globals.css`
- Create: `src/components/ui/{SectionHeading,MagicalButton,TechChip,Ornament,Monogram}.tsx`, `src/components/motion/Reveal.tsx`, `src/lib/{cn.ts,motion.ts}`, `public/icon.svg`
- Create: `src/test/reveal.test.tsx`

**Interfaces:**

- Produces: `<SectionHeading eyebrow? title subtitle? tone="dark"|"parchment" />`, `<MagicalButton as="a"|"button" variant="primary"|"ghost" />`, `<TechChip label />`, `<Ornament variant="rule"|"corner"|"folio" />`, `<Monogram size />`, `<Reveal as? delay?>`, `useReducedMotion(): boolean`.

> **Review Focus #2 lives here.** `Reveal` must render children fully visible in the server HTML. Only an effect that has already run may add the hiding class, and that effect is skipped entirely under reduced motion.

- [ ] **Step 1: Write the failing test** — `src/test/reveal.test.tsx`:

```tsx
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect } from "vitest";
import { Reveal } from "@/components/motion/Reveal";

describe("Reveal", () => {
  it("renders its children visible in server HTML", () => {
    const html = renderToStaticMarkup(<Reveal><p>Ancient runes</p></Reveal>);
    expect(html).toContain("Ancient runes");
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toMatch(/class="[^"]*\bis-hidden\b/);
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL.

- [ ] **Step 3:** Implement `Reveal` as a client component that renders a plain wrapper, and in a layout effect — guarded by `useReducedMotion()` — adds the hiding class and registers a single `ScrollTrigger` that removes it. Implement `useReducedMotion` in `src/lib/motion.ts` over `matchMedia("(prefers-reduced-motion: reduce)")` with a change listener.

- [ ] **Step 4:** Run `npm test` — expect PASS.

- [ ] **Step 5:** Build the remaining primitives. Focus ring is a 2px `--color-gold-light` outline at 2px offset, declared once in `globals.css` on `:focus-visible` and never removed. `Monogram` is an original SVG: a lozenge shield, a double hairline rule, interlocked K and S, one four-point star. Save the same artwork to `public/icon.svg`.

- [ ] **Step 6:** Add the global grain overlay to `globals.css`: a fixed, `pointer-events: none`, low-opacity layer driven by an inline SVG `feTurbulence` data URI. It is static, so it needs no reduced-motion guard.

- [ ] **Step 7:** `npm run lint && npm run typecheck && npm test`.

---

### Task 5: Layout shell — navigation, skip link, footer, section scaffolding

**Files:**

- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/components/layout/{Navigation,Footer,SkipLink}.tsx`
- Create: `src/test/navigation.test.tsx`

**Interfaces:**

- Consumes: `siteConfig.nav`, `Monogram`, `MagicalButton`.
- Produces: a page with all seven section landmarks, correct ids, and `scroll-margin-top` honouring the header height.

> **Review Focus #1 lives here.**

- [ ] **Step 1: Write the failing test** — `src/test/navigation.test.tsx`: every nav href matches `^#(about|projects|skills|experience|achievements|contact)$`; rendering the page shell produces one element with each of the seven spec ids; the mobile trigger exposes `aria-expanded` and `aria-controls` pointing at a panel that exists; and `globals.css` declares a non-zero `scroll-margin-top` for `section[id]` plus `scroll-behavior: smooth` guarded inside `@media (prefers-reduced-motion: no-preference)`.

- [ ] **Step 2:** Run `npm test` — expect FAIL.

- [ ] **Step 3:** Build `Navigation`: transparent over the hero, switching to `--color-obsidian/80` with `backdrop-filter: blur(12px)` past 80px of scroll; active section tracked with a single `IntersectionObserver` (not scroll maths), marked with a gold underline and `aria-current="true"`; desktop links in Inter with comfortable tracking; a `motion` `AnimatePresence` drawer on mobile with focus trap, `Escape` to close, body-scroll lock, and restoration of focus to the trigger.

- [ ] **Step 4:** Build `SkipLink` (visually hidden until focused, targets `#main`) and a `Footer` stub.

- [ ] **Step 5:** `page.tsx` renders `<main id="main">` containing seven `<section>` stubs with the exact spec ids and provisional headings.

- [ ] **Step 6:** Run `npm test` — expect PASS. Load `/#projects` directly in the browser and confirm the heading clears the fixed header.

---

### Task 6: Hero — The Great Hall

**Files:**

- Create: `src/components/sections/HeroSection.tsx`, `src/components/motion/HeroMotion.tsx`, `src/components/motion/ParticleField.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**

- Consumes: `siteConfig`, `BLUR`, `MagicalButton`, `Monogram`.
- Produces: the one orchestrated entrance timeline on the page; no other section may add a page-load timeline.

> **Review Focus #4 is verified here.**

- [ ] **Step 1:** Static layout only, no motion. `next/image` with `priority`, `fill`, `sizes="100vw"`, `placeholder="blur"`, `object-fit: cover`, `object-position: 72% 50%` on desktop and `62% 38%` under 768px. Three stacked overlay layers as separate elements: a left-to-right navy gradient, a soft lift toward the castle, and a bottom fade into `--color-obsidian` covering the lower ~22%.

- [ ] **Step 2:** Hero copy verbatim from the spec — eyebrow `SOFTWARE DEVELOPER · AI ENTHUSIAST`, `<h1>Kumar Shreyash</h1>`, `Building intelligent things.`, the body line, `Explore My Work` → `#projects`, `Download Resume` → `siteConfig.resumePath` with `download`. GitHub and LinkedIn as icon links with `rel="noopener noreferrer"` and accessible names. Content column `clamp(320px, 46vw, 620px)`.

- [ ] **Step 3:** Verify at 2560×1080, 1440×900, 1280×800, 820×1180, 390×844 and 740×360 that the castle stays visible, text never overlaps the castle's bright mass, the scroll cue is reachable, and nothing overflows horizontally. Fix with `object-position` and `min-height: 100svh` (not `vh`) before adding motion.

- [ ] **Step 4:** `HeroMotion` — one `useGSAP` timeline, total 1.8–2.2s: background `scale 1.06 → 1`, fog fade, particles fade, monogram, eyebrow, `h1` masked line reveal, supporting line, body, buttons, scroll cue. Everything starts visible in the DOM; the timeline sets its own `from` state inside `useGSAP`, which never runs under reduced motion.

- [ ] **Step 5:** `ParticleField` — canvas, DPR-aware, ≤60 particles desktop / ≤24 mobile, `requestAnimationFrame` paused by an `IntersectionObserver` when off-screen and by `visibilitychange`, and never started under reduced motion. No DOM particles.

- [ ] **Step 6:** Pointer parallax — max ±6px translation on the background and ±2px on the fog, `quickTo`-driven, desktop pointer only (`matchMedia("(pointer: fine)")`), disabled under reduced motion. Text layers do not move.

- [ ] **Step 7:** Re-run the viewport sweep from Step 3 with motion on, and once with reduced motion forced.

---

### Task 7: Projects — The Spellbook

**Files:**

- Create: `src/components/sections/ProjectsSection.tsx`, `src/components/ui/{ProjectCard,ProjectPlate}.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**

- Consumes: `projects`, `TechChip`, `SectionHeading`, `Reveal`.
- Produces: `<ProjectPlate kind={GlyphKind} />` — an original inline SVG architecture glyph, gold on dark, with JetBrains Mono node labels taken from the project's real architecture.

- [ ] **Step 1:** Section backdrop: `spellbook-projects.webp` at low luminance behind a `--color-obsidian` wash, candle warmth left and right kept visible at the edges. Content sits on dark translucent panels, never directly on the lit page area.

- [ ] **Step 2:** Section intro verbatim: eyebrow `SELECTED WORK`, `<h2>The Spellbook</h2>`, subtitle `A collection of systems, experiments, and ideas brought to life through code.`

- [ ] **Step 3:** Featured entry as the two-page spread — plate left, content right, folio numeral `i.` in the margin. Then a responsive grid of the remaining three (3-up ≥1280px, 2-up ≥768px, 1-up below).

- [ ] **Step 4:** `ProjectCard` renders title, one-to-two-sentence description, tech chips, folio numeral, and *only the links that exist in data* — GitHub, live demo, and "Read the case study" when `caseStudy` is present. Hover: 2px lift, a gold edge-light on the candle-facing side, image zoom confined to the plate's `overflow: hidden` container. No card rotation. All hover effects wrapped in `@media (hover: hover) and (prefers-reduced-motion: no-preference)`.

- [ ] **Step 5:** Four glyphs in `ProjectPlate`: `graph` (browser → FastAPI → Postgres with Graph/OpenAI satellites), `agent` (interview loop → report), `matrix` (LSTM gate diagram), `route` (QR scan → verify → score). Each is hand-authored SVG with `aria-hidden` and a text alternative in the card.

- [ ] **Step 6:** Verify the grid at all four breakpoints; confirm no link renders for projects without URLs.

---

### Task 8: Project case-study route

**Files:**

- Create: `src/app/projects/[slug]/page.tsx`, `src/app/projects/[slug]/not-found.tsx`
- Modify: `src/data/projects.ts` (populate `caseStudy` for the two repo-backed projects)

- [ ] **Step 1:** `generateStaticParams` from `projects.filter(p => p.caseStudy)`; `generateMetadata` per project.

- [ ] **Step 2:** Render only the case-study fields that hold content — overview, problem, architecture, decisions, implementation, challenges, results, limitations, technologies, links. An absent field renders nothing, not an empty heading.

- [ ] **Step 3:** Write the two case studies in plain technical English. The theme does not enter the prose; the only themed element is the page's ornamental frame. AI Workspace Assistant's `limitations` come from its README's own "Known limitations" list.

- [ ] **Step 4:** A back link to `/#projects`. Confirm it lands on the Projects heading, not under the header.

- [ ] **Step 5:** `npm run build` must statically generate both routes.

---

### Task 9: About — The Acceptance Letter

**Files:** Create `src/components/sections/AboutSection.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1:** Two columns ≥1024px: left a framed KS medallion built from `Monogram` (no invented portrait), right the parchment letter. Below 1024px the medallion sits above the letter.

- [ ] **Step 2:** The letter is a parchment *sheet* — `acceptance-letter.webp` as the sheet's own background with generous padding, sepia `--color-ink` body text, a drop cap, a ruled left margin, and the wax-seal medallion in `--color-seal`. The surrounding section stays midnight, so the sheet reads as tipped into the book.

- [ ] **Step 3:** Copy verbatim — `<h2>The Story Behind the Code</h2>`, `Hello, I'm Kumar Shreyash.`, the body line — then four editable subsections from data: Education (VIT, B.Tech CS, Aug 2023 – Jul 2027, CGPA 8.79), Areas of interest, How I approach engineering, Current learning goals. Prose set in Cormorant at 62ch; no technical list is set in the serif.

- [ ] **Step 4:** `Open My Letter` — a real `<button>` with `aria-expanded`, revealing the subsections via a `motion` height/mask transition. Below 768px or under reduced motion the content renders expanded with no button-gated content, so nothing essential is behind an interaction.

---

### Task 10: Skills — Houses of Knowledge

**Files:** Create `src/components/sections/SkillsSection.tsx`, `src/components/ui/SkillBanner.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1:** Backdrop `house-banners-skills.webp` darkened to ~30% luminance so the hall reads as architecture, not as four franchise crests. Content sits clear of the banner emblems.

- [ ] **Step 2:** `<h2>Houses of Knowledge</h2>`, subtitle `The tools, languages, and ideas I use to build software.`

- [ ] **Step 3:** Four `SkillBanner` pennants via `clip-path: polygon(0 0, 100% 0, 100% 86%, 50% 100%, 0 86%)`, each with an original SVG emblem, a name, a one-line tagline, and its primary chips. Accents are four restrained tints of the same navy/gold system, not four saturated house colours.

- [ ] **Step 4:** Each pennant's expander is a `<button aria-expanded aria-controls>` revealing `more` chips and related-project links. All *primary* skills are visible without interacting.

- [ ] **Step 5:** Stacked single column below 768px with every pennant expanded and no expander button.

- [ ] **Step 6:** Confirm no percentages, no progress bars, and that every chip traces to the verified skills inventory.

---

### Task 11: Experience — The Marauder's Map

**Files:** Create `src/components/sections/ExperienceSection.tsx`, `src/components/ui/ExperienceRoute.tsx`; modify `src/app/page.tsx`.

- [ ] **Step 1:** Parchment ground from the de-crested `marauders-map-experience.webp`, full bleed, with a soft vignette. Body text in `--color-ink` — real, selectable HTML, never baked into the image.

- [ ] **Step 2:** `<h2>The Journey So Far</h2>`, subtitle `Every milestone leads to a new challenge.`

- [ ] **Step 3:** `ExperienceRoute` draws an original SVG route: horizontal with four markers ≥1024px, vertical below. Markers carry roman folio numerals because this is a genuine sequence.

- [ ] **Step 4:** Entries from `experience` in verified order: Yolex Labs (Jun 2026 – Oct 2026), Samsung PRISM (Aug 2025 – May 2026), Sangam Club (Apr 2024 – May 2026), VIT (Aug 2023 – Jul 2027). Each card shows organisation, role, location, date range, summary, responsibilities, technologies.

- [ ] **Step 5:** One `ScrollTrigger` with `once: true` draws the route by animating `strokeDashoffset` to 0, then lights markers in sequence, then reveals cards with ≤120ms stagger. It must not re-run on small scrolls and must not scrub.

- [ ] **Step 6:** Under reduced motion the route renders fully drawn and markers lit immediately — verified in Task 13.

---

### Task 12: Achievements, Contact, and Footer

**Files:**

- Create: `src/components/sections/{AchievementsSection,ContactSection}.tsx`, `src/components/ui/{ClippingCard,ContactForm}.tsx`, `src/lib/{mailto.ts,validation.ts}`
- Modify: `src/components/layout/Footer.tsx`, `src/app/page.tsx`
- Create: `src/test/{mailto.test.ts,validation.test.ts}`

**Interfaces:**

- Produces: `validateContact(values): Record<Field, string> | null` and `buildMailto({to, subject, body}): { href: string; tooLong: boolean }`, plus `MAILTO_LIMIT = 1800`.

> **Review Focus #5 lives here.**

- [ ] **Step 1: Write the failing tests** — `src/test/mailto.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { buildMailto, MAILTO_LIMIT } from "@/lib/mailto";

describe("buildMailto", () => {
  it("percent-encodes newlines, ampersands, hashes and emoji", () => {
    const { href } = buildMailto({
      to: "a@b.com", subject: "Re: hooks & co #1", body: "line one\nline two ✨",
    });
    expect(href.startsWith("mailto:a@b.com?")).toBe(true);
    expect(href).toContain("%0A");
    expect(href).toContain("%26");
    expect(href).toContain("%23");
    expect(href).not.toMatch(/[\n\r]/);
    expect(decodeURIComponent(new URL(href).searchParams.get("body")!)).toContain("✨");
  });
  it("flags payloads past the practical mailto ceiling instead of truncating", () => {
    const { tooLong, href } = buildMailto({
      to: "a@b.com", subject: "s", body: "x".repeat(MAILTO_LIMIT + 1),
    });
    expect(tooLong).toBe(true);
    expect(href).toContain("x".repeat(50)); // nothing silently dropped
  });
});
```

  and `src/test/validation.test.ts`: required fields produce messages; a malformed address is rejected and `a+b@sub.domain.co.in` accepted; whitespace-only input is rejected; a valid payload returns `null`.

- [ ] **Step 2:** Run `npm test` — expect FAIL.

- [ ] **Step 3:** Implement `validation.ts` and `mailto.ts`. Run `npm test` — expect PASS.

- [ ] **Step 4: Achievements.** Backdrop from the de-mastheaded clippings crop. `<h2>The Highlights</h2>`, subtitle `Milestones, recognition, and work worth sharing.` Broadsheet treatment: a rule-separated multi-column grid of `ClippingCard`s in Cormorant, each with headline, year, body and optional issuer. Entries come only from the verified inventory. Hover is a 1px gold rule brightening — no rotation, no jitter. Everything is readable without interacting.

- [ ] **Step 5: Contact.** `owl-post-contact.webp` full bleed with the owl kept visible at the left; the form on a dark panel at the right (stacked below 1024px, owl cropped to stay in frame). `<h2>Let's Build Something Meaningful</h2>` plus the spec subtitle. Fields Name, Email, Subject, Message, each with a real `<label>`, `aria-invalid` and `aria-describedby` on error.

- [ ] **Step 6:** Submission opens the composed `mailto:` — the only mechanism that genuinely works with no backend. The UI says exactly that: the button reads `Send via email` and a line under the form explains it opens the visitor's mail client, with `kumarshreyash2504@gmail.com` also shown as a plain copyable link. Never claim a message was delivered. If `tooLong`, show an inline error asking them to shorten it and keep every entered value.

- [ ] **Step 7:** Add a commented block at the top of `ContactForm.tsx` documenting the exact swap to real delivery: a `POST /api/contact` route, `RESEND_API_KEY` and `CONTACT_TO_EMAIL` env vars, and the two lines to change. Status region is `role="status" aria-live="polite"`; the envelope/owl confirmation animation plays only after the handler resolves.

- [ ] **Step 8: Footer.** `enchanted-lake-footer.webp` with a bottom navy gradient, the KS monogram, the tagline `Built with curiosity, precision, and a little magic.`, nav links, GitHub/LinkedIn/email, a thin gold divider, and `© {new Date().getFullYear()} Kumar Shreyash` computed at render.

---

### Task 13: Section transitions, motion audit, reduced-motion end states

**Files:** Modify `src/app/globals.css`, all section components, `src/components/motion/*`; create `src/test/reduced-motion.test.tsx`.

> **Review Focus #3 lives here.**

- [ ] **Step 1: Write the failing test** — `src/test/reduced-motion.test.tsx` stubs `matchMedia` to report `reduce`, renders `ExperienceRoute` and `AboutSection`, and asserts the end state is present immediately: the route path has `stroke-dashoffset` of `0`, every marker carries the lit class, and the About subsections are in the document without clicking.

- [ ] **Step 2:** Run `npm test` — expect FAIL.

- [ ] **Step 3:** Give every motion component an explicit `applyEndState()` used when `useReducedMotion()` is true. Run `npm test` — expect PASS.

- [ ] **Step 4:** Implement the seven inter-section transitions as CSS gradient bleeds and short scroll-linked opacity changes on backdrop layers only — castle→parchment, parchment edge→spellbook, spellbook→hall, hall→map, map→clippings, clippings→moonlight, moonlight→lake. No pinning, no scroll hijacking, no full-screen overlays; anchor navigation must still land exactly.

- [ ] **Step 5:** Audit every `ScrollTrigger`: created inside `useGSAP` with a scope, `once: true` where the animation is an entrance, and torn down on unmount. Confirm no duplicates after client-side navigation to `/projects/[slug]` and back.

- [ ] **Step 6:** Full reduced-motion pass in the browser: every section complete and legible, particles absent, no parallax, no residual transforms.

---

### Task 14: Metadata, favicon, social card, performance pass

**Files:** Modify `src/app/layout.tsx`, `next.config.ts`; create `src/app/opengraph-image.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`.

- [ ] **Step 1:** Metadata: title exactly `Kumar Shreyash | Software Developer & AI Systems Builder`; a concise description naming AI systems, full-stack work and the C/C++ embedded ML; Open Graph and Twitter card; `lang="en"`. No `metadataBase` or canonical until a domain is supplied — leave both as commented fields with instructions.

- [ ] **Step 2:** Favicon from the original `Monogram` SVG. No franchise marks.

- [ ] **Step 3:** `opengraph-image.tsx` via `next/og` — monogram, name, headline, on `--color-obsidian` with a gold rule.

- [ ] **Step 4:** Perf: `priority` on the hero image only; everything else lazy. Explicit `sizes` on every `next/image`. Reserve aspect ratios so CLS stays ~0. Confirm no section imports GSAP where CSS already does the job, and that `motion` is only pulled into the four components that need presence.

- [ ] **Step 5:** `npm run build` and read the route report — flag any first-load JS over ~200kB and trim.

---

### Task 15: Verification

- [ ] **Step 1:** `npm run lint` — must pass clean.
- [ ] **Step 2:** `npx tsc --noEmit` — must pass clean.
- [ ] **Step 3:** `npm test` — every suite green.
- [ ] **Step 4:** `npm run build` — must succeed; record the route table.
- [ ] **Step 5:** Browser sweep at 1440, 1280, 820, 390 and the two extremes from Review Focus #4. For each: no horizontal overflow, readable text over every backdrop, correct background framing, working nav and CTAs.
- [ ] **Step 6:** Click every link. Confirm the résumé downloads the real PDF, the three verified external URLs open correctly, and `https://ai-relationship-manager.pages.dev` actually responds — if it does not, demote it from `liveUrl` to nothing and say so in the report.
- [ ] **Step 7:** Keyboard-only pass: skip link, nav, drawer (open, trap, `Escape`, focus restored), every expander, the whole form. Visible focus everywhere.
- [ ] **Step 8:** Reduced-motion pass and a console check — zero errors, zero warnings.
- [ ] **Step 9:** Write the Phase 7 final report: what was built, files created, crop provenance, commands actually run with their real output, how to start the dev server, what still needs the owner's real information, and every remaining limitation.

---

## Self-review

**Spec coverage.** Sections 1–22 of the master prompt map to tasks as follows: §2 asset procedure → Task 2; §3 stack → Task 1; §4 brand → Tasks 1, 4; §5 architecture → Task 5; §6 hero → Task 6; §7 about → Task 9; §8 projects → Tasks 7, 8; §9 skills → Task 10; §10 experience → Task 11; §11 achievements → Task 12; §12 contact → Task 12; §13 footer → Task 12; §14 transitions → Task 13; §15 motion → Tasks 4, 6, 13; §16 responsive → Tasks 6, 15; §17 accessibility → Tasks 4, 5, 10, 12, 15; §18 performance and SEO → Task 14; §19 configuration → Task 3; §20 architecture → File Structure; §21 workflow → task order; §22 strict rules → Global Constraints and the data tests. No gaps.

**Placeholders.** None. Every test step carries runnable code; every data value traces to the verified inventory; crop coordinates are measured, not described.

**Type consistency.** `SectionId`, `Project`, `CaseStudy`, `SkillCollection`, `ExperienceEntry`, `Achievement`, `buildMailto`, `MAILTO_LIMIT`, `validateContact`, `useReducedMotion` and `Reveal` are each defined once in Task 3 or Task 4 and referenced with identical names and shapes thereafter.

**Review Focus.** All five have an owning task and a named test or browser check: #1 Task 5, #2 Task 4, #3 Task 13, #4 Tasks 6 and 15, #5 Task 12.

**Deviation from strict TDD, stated openly.** Test-first is applied where behaviour is assertable: tokens, extracted-asset geometry, data integrity and the no-invented-content rule, reveal visibility, navigation contracts, reduced-motion end states, mailto encoding, form validation. Layout, colour and choreography are verified by build, lint, type checks and recorded browser inspection, because a unit test cannot tell you whether a castle is legible behind a headline.

## Open items needing the owner's input (non-blocking)

These are recorded as configuration, not guesses. The build proceeds without them.

1. **Email address.** The résumé and the GitHub profile both say `kumarshreyash2504@gmail.com`; the Claude account on this machine is `kumarshreyash2004@gmail.com`. The résumé address is used. Change one line in `src/config/site.ts` if that is wrong.
2. **Phone number.** Present on the résumé, deliberately not published. Uncomment the field in `site.ts` to show it.
3. **Production domain.** Unknown, so no canonical URL and no `metadataBase`. Fill in `site.ts` before deploying.
4. **Contact delivery.** No backend exists, so the form composes a `mailto:` and says so. Task 12 Step 7 documents the exact Resend swap.
5. **Live demo for Problem Tracking Agent.** The repo is named `AI-Agent-Deployed` but no public URL is recorded anywhere locally. If one exists, add `liveUrl` to that project.
6. **Repository links for LSTM in pure C++ and Treasure Hunt.** Both are real work described on the résumé or GitHub profile, but no repository URL is verifiable locally, so their cards render without link buttons.
7. **Version control.** The directory is not a git repository and no git commands have been run. Say the word and the project gets `git init` plus a commit per task.


---

## Build log — corrections made during implementation

Recorded here so the plan matches what was actually shipped.

1. **Sub-crop coordinates were wrong on the first pass.** Both franchise marks
   survived the crops I first estimated. Measured against a marked-up render
   instead: the map crest needed `x < 448` (not 500), and the newspaper
   masthead needed `y > 46` rather than a horizontal crop, which preserved all
   three clippings instead of losing two.
2. **Master heights corrected** to preserve aspect exactly: letter 552, map
   639, newspaper 409.
3. **Section backdrops are bands, not covers.** `object-cover` over a tall
   section crops an image to its middle and magnifies it — it threw away both
   candles in the spellbook, and blew the map up roughly 3×, which advertised
   the upscale. Projects, Skills, Achievements and the Footer now show their
   artwork once at its own aspect; Experience uses flat parchment with the map
   as a band along its foot.
4. **`useGSAP` dependencies replayed the hero.** `usePrecisePointer()` reports
   its server value during hydration and its real value immediately after, so
   a dependency on it reverted and restarted the entrance mid-flight. The
   entrance now runs once with an empty dependency list and reads reduced
   motion straight from `matchMedia`; parallax is a separate effect.
5. **Fonts were silently falling back.** `--font-display` is declared on
   `:root` by Tailwind, but `next/font` was putting `--font-cinzel` on
   `<body>`; a `var()` resolves in the scope of the element that declares it,
   so the reference was invalid. Font variables moved to `<html>`.
6. **A negative z-index child paints behind its parent's own background** when
   the parent creates no stacking context — which is why the About letter's
   artwork was invisible. The layers now sit at the default level with the
   text lifted above them.
7. **Short landscape needed more than smaller type.** The first fix reduced the
   scale but left 168px of top padding in a 360px-tall viewport. Header height,
   hero padding and the internal margins are all compressed there now.
8. **`new Date()` is rejected during prerender** by Next 16 Cache Components.
   The footer year is read through `useSyncExternalStore` with a `null` server
   snapshot.
9. **lucide-react v1 dropped brand icons**, so the GitHub and LinkedIn marks
   are drawn in `src/components/ui/BrandIcons.tsx`.
10. **The footer seam.** The lake band is taller than the footer, so
    `overflow-hidden` clipped its own top fade and left a hard edge. A scrim
    measured against the footer box covers the join at any height.

11. **Five backdrops were replaced with full-resolution artwork.** Kumar
    supplied 1672×941 standalone scenes for Home, Projects, Skills, Contact and
    the Footer — roughly three times the linear resolution of the board panels.
    They are used at native size with no upscale and no sharpening, and the
    bands moved from their old 2.4–2.76:1 crops to 16:9 with `max-h` caps so
    the extra height does not push content down. The resolution verdict in the
    Asset Extraction section above now applies only to the three remaining
    board-derived assets: the letter, the map and the newspaper.
12. **Next's image optimiser served stale bytes** after the files were
    replaced. Its cache is keyed on the request URL, so an identical path with
    new content kept returning the old variant — the hero was still being
    served at the previous 2.4:1 aspect. `.next/cache/images` has to be cleared
    when an image is replaced in place.
13. **The brighter artwork needed darker scrims.** The new banners washed out
    the Skills heading, so that section gained a radial pool behind the type;
    and the footer's ship sits below centre in its painting, so the band's
    framing moved from `object-center` to `50% 62%` to keep it in view.
