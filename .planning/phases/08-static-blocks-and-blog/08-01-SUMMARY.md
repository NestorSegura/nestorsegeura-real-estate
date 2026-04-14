---
phase: 08-static-blocks-and-blog
plan: 01
subsystem: ui
tags: [tailwind-v4, oklch, sanity, portable-text, groq, typescript]

# Dependency graph
requires:
  - phase: 07-i18n-and-content-layer
    provides: "BaseLayout.astro, sanityClient from sanity:client, Locale type, getPageWithFallback pattern"
  - phase: 06-infrastructure
    provides: "@sanity/astro integration, sanity virtual module, Cloudflare adapter"
provides:
  - "Jibemates purple @theme tokens (--color-primary-50 through --color-primary-950, hue 290 OKLCH)"
  - "Brand neutrals (--color-brand-dark, --color-brand-cream, --color-brand-warm-50/100)"
  - "blockContent Sanity schema with callout + highlight annotations; post.body wired to it"
  - "urlFor() image URL builder (src/lib/imageUrl.ts)"
  - "extractToc() Portable Text heading extractor (src/lib/tocFromPT.ts)"
  - "readingTime() locale-aware estimator (src/lib/readingTime.ts)"
  - "getFullPostForLocale(), getAllPostsForLocale(), getSiteSettings(), getHomepageWithSections() GROQ helpers"
affects:
  - "08-02 (block components): color tokens + getHomepageWithSections + urlFor"
  - "08-03 (blog): all post helpers + tocFromPT + readingTime + blockContent custom marks"
  - "08-04 (SEO): getSiteSettings.seo.ogImage + FullPost.seo"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "OKLCH hue-290 purple scale as Tailwind v4 @theme tokens"
    - "Named blockContent schema type (object with array) rather than inline type:block in post.ts"
    - "Parameterised GROQ — locale never string-interpolated"
    - "urlFor() null-safe image URL builder pattern"
    - "Inline readingTime/extractToc utilities — no extra dependency"

key-files:
  created:
    - src/sanity/schemas/objects/blockContent.ts
    - src/lib/imageUrl.ts
    - src/lib/tocFromPT.ts
    - src/lib/readingTime.ts
  modified:
    - src/styles/global.css
    - src/sanity/schemas/documents/post.ts
    - src/sanity/schemas/index.ts
    - src/lib/sanity.ts

key-decisions:
  - "OKLCH hue 290 scale: primary-50 (0.97/0.02) through primary-950 (0.17/0.07) as proposed in RESEARCH.md"
  - "blockContent schema: callout and highlight as annotations (not decorators) — required for markDef access in astro-portabletext"
  - "@sanity/image-url already transitively installed via sanity@4.22.0 — no separate install needed"
  - "TypeGen not run — no typegen script in package.json; Astro build (Vite/TypeScript) validates types at build time"
  - "getSiteSettings has no language filter — siteSettings is a singleton document (confirmed in STATE.md from 06-02)"
  - "getPostWithTranslations left untouched — Phase 9 locale-switcher contract depends on its exact signature"

patterns-established:
  - "Pattern: urlFor(source)?.width(W).format('webp').url() — null guard prevents crash on missing image"
  - "Pattern: extractToc(body) returns TocItem[] with id slugs matching rendered heading ids in PTRenderer"
  - "Pattern: Deep GROQ projection for nested images — asset->{ _ref, _id } inside testimonials and guide blocks"

# Metrics
duration: 3min
completed: 2026-04-14
---

# Phase 8 Plan 01: Foundation Summary

**Jibemates purple OKLCH palette wired as Tailwind v4 @theme tokens, blockContent schema created with callout/highlight marks, and five GROQ helpers + three lib utilities added for Plans 02 and 03 to consume**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T08:09:16Z
- **Completed:** 2026-04-14T08:11:47Z
- **Tasks:** 4
- **Files modified:** 8

## Accomplishments

- Jibemates purple primary scale (50–950, OKLCH hue 290) and brand neutrals live in `src/styles/global.css` as `@theme` tokens — `bg-primary-700`, `text-primary-300`, `bg-brand-dark` now resolve in any block component
- Named `blockContent` Sanity schema created with callout (info|warning|tip) and highlight (yellow|purple) annotations; `post.body` wired to it; registered in schema index — custom marks are ready for `astro-portabletext` component map
- Five GROQ helpers added to `src/lib/sanity.ts` (getFullPostForLocale, getAllPostsForLocale, getSiteSettings, getHomepageWithSections + pre-existing getAllPostSlugsForLocale now confirmed); three lib utilities created (urlFor, extractToc, readingTime)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Jibemates purple palette + brand neutrals to global.css** - `6f61f60` (feat)
2. **Task 2: Create blockContent schema with callout + highlight marks; wire post.body** - `43fe448` (feat)
3. **Task 3: Add imageUrl, tocFromPT, and readingTime lib helpers** - `76c5899` (feat)
4. **Task 4: Add five GROQ helpers to src/lib/sanity.ts** - `7003d2c` (feat)

**Plan metadata:** (docs: complete foundation plan — added below)

## Files Created/Modified

- `src/styles/global.css` — Added `@theme` block with --color-primary-50 through --color-primary-950 (OKLCH hue 290) and brand neutrals; existing font tokens preserved
- `src/sanity/schemas/objects/blockContent.ts` — New named blockContent array type: decorators (strong/em/code/underline/strike-through), annotations (link, callout, highlight), styles (normal/h2/h3/blockquote), image member with hotspot
- `src/sanity/schemas/documents/post.ts` — body field changed from inline array to `type: 'blockContent'`
- `src/sanity/schemas/index.ts` — blockContentType imported and registered at top of schemaTypes array
- `src/lib/imageUrl.ts` — urlFor(source) wrapping @sanity/image-url builder; null-safe
- `src/lib/tocFromPT.ts` — extractToc(body): filters h2/h3 blocks, produces TocItem[] with slug ids (max 60 chars)
- `src/lib/readingTime.ts` — readingTime(body, locale): 200 wpm for DE, 225 for EN/ES; min 1 min
- `src/lib/sanity.ts` — Added FullPost, PostCard, SiteSettings, PageWithSections interfaces; five new async GROQ helpers appended

## Final OKLCH Values Used

Hue 290 (blue-violet, confirmed from v1 codebase):

| Token | OKLCH | Approximate hex | Usage |
|-------|-------|-----------------|-------|
| `--color-primary-50` | `oklch(0.97 0.02 290)` | #f5f0ff | Lightest tint |
| `--color-primary-100` | `oklch(0.93 0.05 290)` | #ede5ff | Light bg |
| `--color-primary-200` | `oklch(0.87 0.08 290)` | #ddd0ff | Highlight bg |
| `--color-primary-300` | `oklch(0.78 0.12 290)` | #c4adff | Accent text on dark |
| `--color-primary-400` | `oklch(0.68 0.16 290)` | #a884ff | Medium accent |
| `--color-primary-500` | `oklch(0.58 0.20 290)` | #8c5ef5 | Bright brand purple |
| `--color-primary-600` | `oklch(0.50 0.20 290)` | #7448d8 | CTA hover |
| `--color-primary-700` | `oklch(0.42 0.18 290)` | #5c36b2 | Solid CTA background |
| `--color-primary-800` | `oklch(0.33 0.14 290)` | #3d2280 | Dark accent |
| `--color-primary-900` | `oklch(0.25 0.10 290)` | #241552 | Dark section bg |
| `--color-primary-950` | `oklch(0.17 0.07 290)` | #140b30 | Darkest |

## blockContent Schema Location + TypeGen

- Location: `src/sanity/schemas/objects/blockContent.ts` — exports `blockContentType`
- TypeGen: **Not run** — no `typegen` script in package.json. Astro build validates TypeScript at build time. TypeGen is a Sanity Studio concern (external, hosted at studio.nestorsegura.com).

## Five GROQ Helpers — Return Shapes

| Helper | Parameters | Return type | Notes |
|--------|-----------|-------------|-------|
| `getFullPostForLocale` | slug: string, locale: Locale | `Promise<FullPost \| null>` | Full body[], author->, seo, _translations |
| `getAllPostsForLocale` | locale: Locale | `Promise<PostCard[]>` | Cards for index; ordered publishedAt desc |
| `getAllPostSlugsForLocale` | locale: Locale | `Promise<Array<{slug: string}>>` | Pre-existing; for getStaticPaths |
| `getSiteSettings` | — | `Promise<SiteSettings \| null>` | Singleton; no language filter; deep seo.ogImage |
| `getHomepageWithSections` | locale: Locale | `Promise<PageWithSections \| null>` | Deep image projection for guide + testimonials blocks |

## Three Lib Utilities — Signatures

```typescript
// src/lib/imageUrl.ts
export function urlFor(
  source: { asset: { _ref: string } } | null | undefined
): ImageUrlBuilder | null

// src/lib/tocFromPT.ts
export interface TocItem { text: string; id: string; level: 2 | 3 }
export function extractToc(body: unknown[]): TocItem[]

// src/lib/readingTime.ts
export function readingTime(body: unknown[], locale: 'de' | 'en' | 'es'): number
```

## Decisions Made

- OKLCH hue 290 confirmed from v1 codebase; full 11-step scale proposed by Claude and executed as specified in RESEARCH.md
- `blockContent` uses annotations (not decorators) for callout and highlight so `markDef` is available in astro-portabletext component props
- `@sanity/image-url` was already installed transitively via `sanity@4.22.0` — no additional install needed
- `getSiteSettings` deliberately omits language filter — siteSettings is a Sanity singleton document (no `language` field)
- `getPostWithTranslations` left completely untouched — Phase 9 locale-switcher contract requires its exact current signature

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — build passed clean on all four tasks.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- **Plan 08-02 (blocks):** Can import `getHomepageWithSections` from `src/lib/sanity` and `urlFor` from `src/lib/imageUrl` immediately. Color tokens `bg-primary-700`, `text-primary-300`, `bg-brand-dark` resolve.
- **Plan 08-03 (blog):** Can import `getFullPostForLocale`, `getAllPostsForLocale`, `getAllPostSlugsForLocale` from `src/lib/sanity`; `extractToc` from `src/lib/tocFromPT`; `readingTime` from `src/lib/readingTime`. blockContent callout + highlight marks are defined and ready for astro-portabletext component map.
- **Plan 08-04 (SEO):** `getSiteSettings` returns `seo.ogImage.asset._ref` for the OG image fallback chain.
- No blockers for any Wave 2 plan.

## Self-Check: PASSED

---
*Phase: 08-static-blocks-and-blog*
*Completed: 2026-04-14*
