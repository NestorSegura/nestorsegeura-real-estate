---
phase: 09-interactive-islands
plan: "01"
subsystem: api
tags: [sanity, groq, typescript, siteSettings, i18n, nav]

requires:
  - phase: 08-static-blocks-and-blog
    provides: getSiteSettings() helper, SiteSettings interface, siteSettings Sanity singleton

provides:
  - siteSettings schema extended with navItems[] (key, labelDe, labelEn, labelEs)
  - siteSettings schema extended with ctaLabel { de, en, es } and ctaHref url field
  - getSiteSettings() GROQ projection includes navItems, ctaLabel, ctaHref
  - SiteSettings TypeScript interface typed for all three new fields

affects:
  - 09-02 (MegaNav component — consumes navItems and ctaLabel/ctaHref from getSiteSettings)
  - Any future phase using getSiteSettings (fields are optional, no breaking change)

tech-stack:
  added: []
  patterns:
    - "Sanity schema groups (general/nav/seo/footer) for editor UX clarity"
    - "defineArrayMember with typed preview for array-of-object Sanity fields"
    - "GROQ field projection pattern: navItems[]{ key, labelDe, labelEn, labelEs }"

key-files:
  created: []
  modified:
    - src/sanity/schemas/documents/siteSettings.ts
    - src/lib/sanity.ts

key-decisions:
  - "Legacy navigation[] preserved untouched — additive new fields only (navItems, ctaLabel, ctaHref)"
  - "navItems uses flat labelDe/labelEn/labelEs fields — NOT a nested locale object — matching RESEARCH.md pattern"
  - "ctaHref validates https-only via Sanity url field validation (warning, not error)"
  - "SiteSettings interface fields are all optional — existing consumers (Phase 8 SEO) unaffected"

patterns-established:
  - "Pattern: Sanity schema editor groups for multi-section singletons"
  - "Pattern: Per-locale label fields (labelDe/labelEn/labelEs) on nav item objects"

duration: 2min
completed: 2026-04-14
---

# Phase 9 Plan 01: Sanity Nav Schema Summary

**Sanity siteSettings extended with per-locale navItems[] and CTA fields; getSiteSettings() GROQ and SiteSettings TypeScript interface updated for Phase 9 MegaNav consumption**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-14T11:30:57Z
- **Completed:** 2026-04-14T11:32:53Z
- **Tasks:** 2/2
- **Files modified:** 2

## Accomplishments

- Extended siteSettings Sanity schema with `navItems[]` array (per-item: key, labelDe, labelEn, labelEs) under a new "Navigation" group
- Added `ctaLabel { de, en, es }` object and `ctaHref` url field with https validation for the primary nav CTA button
- Updated `getSiteSettings()` GROQ projection to fetch all three new fields
- Extended `SiteSettings` TypeScript interface with typed optional fields — `astro build` passes cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend siteSettings schema with navItems and CTA fields** - `2270823` (feat)
2. **Task 2: Extend getSiteSettings GROQ and SiteSettings TypeScript interface** - `f0e8598` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified

- `src/sanity/schemas/documents/siteSettings.ts` — Added navItems[], ctaLabel, ctaHref fields; organized existing fields into editor groups (general/nav/seo/footer); legacy navigation[] preserved
- `src/lib/sanity.ts` — Extended SiteSettings interface; updated getSiteSettings() GROQ projection

## Decisions Made

- **Legacy navigation[] preserved** — The old single-label navigation[] array remains for any Phase 8 code that might reference it. New navItems[] is strictly additive.
- **Flat label fields (not nested locale object)** — Used `labelDe`/`labelEn`/`labelEs` sibling strings rather than a nested `{ de, en, es }` object, matching the RESEARCH.md recommended pattern and keeping the preview simpler.
- **ctaHref as https-only warning** — Validation uses `.warning()` not `.error()` so editors aren't blocked if they paste a link without the scheme; they still see the warning.
- **All SiteSettings fields optional** — Phase 8 pages (SEO, blog) call getSiteSettings() without expecting nav fields; making them optional ensures no runtime breakage before the editor populates the data.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

After this plan, the Sanity Studio editor should populate the new fields for the site:

1. Open Sanity Studio → Site Settings → Navigation tab
2. Add nav items (key: "blog", labelDe: "Blog", labelEn: "Blog", labelEs: "Blog")
3. Add nav items (key: "analyse", labelDe: "Analyse", labelEn: "Analyse", labelEs: "Analizar")
4. Add nav items (key: "kontakt", labelDe: "Kontakt", labelEn: "Contact", labelEs: "Contacto")
5. Set CTA Label: de="Termin buchen", en="Book appointment", es="Reservar cita"
6. Set CTA URL: your Calendly link (https://calendly.com/...)

These values are needed before 09-02 (MegaNav) can render real content. The build still passes without them (fields are optional).

## Next Phase Readiness

- `getSiteSettings()` now returns `navItems`, `ctaLabel`, and `ctaHref` typed correctly
- Phase 09-02 (MegaNav) can consume these fields directly — no further data-layer work needed
- No blockers

## Self-Check: PASSED

---
*Phase: 09-interactive-islands*
*Completed: 2026-04-14*
