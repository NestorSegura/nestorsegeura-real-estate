---
phase: 03-landing-page
plan: 03
subsystem: cms
tags: [sanity, content-migration, seed-script, tsx, i18n, de, en, es]

# Dependency graph
requires:
  - phase: 02-cms-and-page-builder
    provides: block schemas (heroSection, featureStrip, problemSolutionBlock, servicesBlock, testimonialsBlock, referencesBlock, faqBlock, ctaBlock), siteSettings document, Sanity client
  - phase: 03-landing-page/03-01
    provides: section IDs (#leistungen, #projekte, #referenzen, #faq, #kontakt) that navigation hrefs must match
provides:
  - Idempotent Sanity content seed script (scripts/seed-content.ts) for all 3 locales
  - siteSettings document with navigation links and Cal.com CTA URL
  - German homepage Page document (page-home-de) with all 8 block sections seeded
  - English homepage Page document (page-home-en) with all 8 block sections seeded
  - Spanish homepage Page document (page-home-es) with all 8 block sections seeded
  - Full landing page visually verified end-to-end including drawer slide animation fix
affects:
  - 03-04 (remaining landing page plans, if any)
  - 04-analysis-tool (can now rely on siteSettings.defaultCtaHref being present in Sanity)

# Tech tracking
tech-stack:
  added: [tsx (via npx tsx for script execution)]
  patterns: [createOrReplace idempotent mutation pattern for seed scripts, _key conventions for Sanity array items]

key-files:
  created: [scripts/seed-content.ts]
  modified: [src/components/NavbarClient.tsx (drawer z-index and slide animation fix)]

key-decisions:
  - "Cal.com URL used as default CTA href: https://cal.com/nestorsegura/erstgespraech"
  - "Navigation includes /analyse link (not anchor) for the analysis tool page alongside anchor links"
  - "Fictional testimonials, client names, and project references used as placeholder content — to be replaced before launch"
  - "Seed script uses createOrReplace for full idempotency — safe to re-run at any time"

patterns-established:
  - "Seed scripts: scripts/*.ts executed with npx tsx, use createOrReplace for idempotency, log progress per document"
  - "_key conventions: descriptive keys (hero-1, features-1, nav-1) over random strings for debuggability"

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 3 Plan 03: Seed Content and Verify Landing Page Summary

**Idempotent Sanity seed script populating siteSettings and German/English/Spanish homepage Page documents with all 8 block sections, plus drawer animation fix, verified end-to-end**

## Performance

- **Duration:** ~8 min (including checkpoint wait)
- **Started:** 2026-03-15
- **Completed:** 2026-03-15
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify)
- **Files modified:** 2

## Accomplishments

- Created `scripts/seed-content.ts` — idempotent migration script seeding siteSettings (nav links, Cal.com CTA URL, social links) and 3 homepage Page documents (DE/EN/ES), each with all 8 ordered block sections and professional copy
- German copy uses Sie-form, warm conversational tone targeting Immobilienmakler, with realistic fictional testimonials and project references as placeholders
- Orchestrator fixed drawer slide animation and z-index stacking in NavbarClient.tsx during checkpoint review, ensuring mobile drawer renders correctly on top of page content

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Sanity content migration script** - `5b596a6` (feat)
2. **Orchestrator fix: Drawer slide animation and z-index stacking** - `205d253` (fix)
3. **Task 2: Checkpoint — full landing page visual verification** — approved by user, no additional commit needed

**Plan metadata:** (this docs commit)

## Files Created/Modified

- `scripts/seed-content.ts` — Sanity seed script; createOrReplace mutations for siteSettings and page-home-{de,en,es}; all 8 block types per page; idempotent; run with `npx tsx scripts/seed-content.ts`
- `src/components/NavbarClient.tsx` — Drawer slide animation keyframes and z-index stacking corrected so mobile drawer overlays page content properly

## Decisions Made

- **Cal.com CTA URL:** `https://cal.com/nestorsegura/erstgespraech` used as `defaultCtaHref` on siteSettings — all CTAs across all locales link here
- **Navigation includes `/analyse`:** Mixed navigation array with 5 anchor links + 1 page link (`/analyse`) — navbar must handle both patterns (already does via `href` value)
- **Fictional placeholder content:** Testimonials, references, and project descriptions are fictional and realistic-looking; flagged for replacement before launch
- **Seed script idempotency:** `createOrReplace` chosen over `create` — safe to re-run after schema changes without manual cleanup

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Drawer slide animation and z-index stacking in NavbarClient.tsx**

- **Found during:** Task 2 (checkpoint human-verify — visual review)
- **Issue:** Mobile drawer slide-in animation was not rendering correctly; z-index stacking caused drawer to appear behind page sections
- **Fix:** Fixed CSS keyframe animation for slide-in and corrected z-index values so drawer stacks above all page content
- **Files modified:** `src/components/NavbarClient.tsx`
- **Verification:** Verified visually — drawer slides in from right and overlays page correctly on 375px viewport
- **Committed in:** `205d253` (orchestrator fix during checkpoint)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Fix essential for mobile UX correctness. No scope creep.

## Issues Encountered

None beyond the drawer animation bug documented above.

## User Setup Required

**Seed script requires a Sanity write token to run.**

Before executing `npx tsx scripts/seed-content.ts`:

1. Go to [manage.sanity.io](https://manage.sanity.io) → your project → API → Tokens
2. Create a token with **Editor** or **Deploy Studio** permissions
3. Add to `.env.local`: `SANITY_API_TOKEN=your_token_here`

The script reads `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_API_TOKEN` from environment variables.

## Next Phase Readiness

- All 8 landing page sections render with real content in DE, EN, and ES
- siteSettings.defaultCtaHref populated — future blocks can reference it via GROQ query
- Navigation links match section IDs established in plan 03-01
- Placeholder content (testimonials, references) should be replaced with real content before launch
- No blockers for remaining phase 3 or phase 4 plans

---
*Phase: 03-landing-page*
*Completed: 2026-03-15*

## Self-Check: PASSED
