---
phase: 03-landing-page
plan: 01
subsystem: ui
tags: [navbar, next-intl, base-ui, drawer, sanity, i18n, anchor-scroll, sticky-nav]

# Dependency graph
requires:
  - phase: 02-cms-and-page-builder
    provides: sanityFetch/SanityLive live layer, SITE_SETTINGS_QUERY, block components, PageBuilder
provides:
  - Navbar server component (Sanity siteSettings fetch -> navLinks, ctaHref, siteName)
  - NavbarClient interactive component (sticky scroll, mobile Drawer, locale switcher)
  - Section anchor IDs on all block components
  - External CTA link behavior (target=_blank) on HeroSection and CtaBlock
  - scroll-margin-top CSS rule for anchor link clearance
  - nav.cta, nav.menuOpen, nav.menuClose translations in de/en/es
affects:
  - 03-landing-page (all remaining plans - navbar present on every page)
  - 04-web-analysis-tool (same layout.tsx, navbar renders on analysis pages too)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Navbar split: server shell (Navbar.tsx) fetches Sanity data, passes to client interactive component (NavbarClient.tsx)"
    - "@base-ui/react/drawer subpath import for mobile Drawer component"
    - "IntersectionObserver sentinel pattern for sticky nav scroll detection (no scroll listener)"
    - "sectionId prop with deterministic fallback ID on all block <section> elements"

key-files:
  created:
    - src/components/Navbar.tsx
    - src/components/NavbarClient.tsx
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/globals.css
    - src/i18n/messages/de.json
    - src/i18n/messages/en.json
    - src/i18n/messages/es.json
    - src/blocks/FeatureStrip.tsx
    - src/blocks/ProblemSolutionBlock.tsx
    - src/blocks/ServicesBlock.tsx
    - src/blocks/TestimonialsBlock.tsx
    - src/blocks/ReferencesBlock.tsx
    - src/blocks/FaqBlock.tsx
    - src/blocks/CtaBlock.tsx
    - src/blocks/HeroSection.tsx
    - src/blocks/PageBuilder.tsx

key-decisions:
  - "@base-ui/react subpath import is @base-ui/react/drawer (not @base-ui-components/react/drawer)"
  - "Navbar.tsx renders before <main> in layout — sentinel div inside NavbarClient gives correct intersection behavior"
  - "HeroSection has no sectionId since it's always at top of page; all other blocks get deterministic IDs"
  - "locale switcher uses useRouter.replace({ pathname, params }, { locale }) from @/i18n/navigation"

patterns-established:
  - "Block sectionId prop: optional override, falls back to deterministic string matching navbar href"
  - "External link detection: ctaHref.startsWith('http') -> target=_blank rel=noopener noreferrer"

# Metrics
duration: 11min
completed: 2026-03-15
---

# Phase 3 Plan 1: Navbar and Section Anchors Summary

**Sticky navbar server/client split with @base-ui/react Drawer mobile menu, IntersectionObserver scroll detection, and anchor section IDs on all block components**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-15T19:33:47Z
- **Completed:** 2026-03-15T19:44:31Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Navbar.tsx fetches siteSettings from Sanity and passes navLinks/ctaHref/siteName to NavbarClient
- NavbarClient renders sticky nav with backdrop-blur on scroll (IntersectionObserver sentinel), desktop layout with locale switcher, and mobile @base-ui/react Drawer slide-in from right
- All block components (FeatureStrip, ProblemSolutionBlock, ServicesBlock, TestimonialsBlock, ReferencesBlock, FaqBlock, CtaBlock) have `id` attributes matching navbar anchor hrefs
- HeroSection and CtaBlock CTA links automatically open in new tab when href is external (starts with `http`)

## Task Commits

Each task was committed atomically:

1. **Task 1: Build Navbar server/client components with drawer, scroll, and locale switcher** - `c92d289` (feat)
2. **Task 2: Add section IDs to block components and external link behavior to CTAs** - `900add2` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/components/Navbar.tsx` - Server component: fetches siteSettings, renders NavbarClient with data
- `src/components/NavbarClient.tsx` - Client component: sticky nav, IntersectionObserver scroll, Drawer mobile menu, locale switcher
- `src/app/[locale]/layout.tsx` - Added Navbar import above main, wrapped children in `<main>`
- `src/app/globals.css` - Added `section[id] { scroll-margin-top: 80px }` rule
- `src/i18n/messages/de.json` - nav.cta "Erstgespräch vereinbaren", nav.menuOpen/menuClose
- `src/i18n/messages/en.json` - nav.cta "Book Consultation", nav.menuOpen/menuClose
- `src/i18n/messages/es.json` - nav.cta "Agendar consulta", nav.menuOpen/menuClose
- `src/blocks/FeatureStrip.tsx` - Added sectionId prop, id="features" on section
- `src/blocks/ProblemSolutionBlock.tsx` - Added sectionId prop, id="problem" on section
- `src/blocks/ServicesBlock.tsx` - Added sectionId prop, id="leistungen" on section
- `src/blocks/TestimonialsBlock.tsx` - Added sectionId prop, id="referenzen" on section
- `src/blocks/ReferencesBlock.tsx` - Added sectionId prop, id="projekte" on section
- `src/blocks/FaqBlock.tsx` - Added sectionId prop, id="faq" on section
- `src/blocks/CtaBlock.tsx` - Added sectionId prop, id="kontakt" on section; external link detection
- `src/blocks/HeroSection.tsx` - External link detection on CTA anchor
- `src/blocks/PageBuilder.tsx` - PageSection type includes sectionId; passes to block renderers

## Decisions Made
- `@base-ui/react/drawer` subpath import is the correct package path (installed as `@base-ui/react`, not `@base-ui-components/react`)
- Navbar server component rendered before `<main>` wrapper in layout so the IntersectionObserver sentinel inside NavbarClient correctly detects scroll past the header area
- HeroSection intentionally has no `id` — it's always the top of the page, no anchor needed
- Locale switcher uses `router.replace({ pathname, params }, { locale })` from `@/i18n/navigation` (the only place using `useRouter` in Navbar, per project navigation constraints)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- Webstorm's linter was auto-fixing the `@base-ui/react/drawer` import to `@base-ui-components/react/drawer` (which doesn't exist). Fixed by re-writing with correct path; build confirmed `@base-ui/react/drawer` is valid.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Navbar is live on every locale page; navLinks are driven by Sanity siteSettings.navigation — populate in Studio for links to appear
- All block sections have matching anchor IDs for navbar links to scroll to
- Ready for Phase 3 Plan 2 (footer or remaining landing page components)

## Self-Check: PASSED

---
*Phase: 03-landing-page*
*Completed: 2026-03-15*
