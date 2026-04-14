---
phase: 09-interactive-islands
plan: "02"
subsystem: ui
tags: [astro, gsap, mega-nav, osmo, i18n, locale-switcher, mobile-drawer, sanity]

# Dependency graph
requires:
  - phase: 09-01
    provides: siteSettings navItems[], ctaLabel, ctaHref in Sanity schema + getSiteSettings() query
  - phase: 08-01
    provides: Jibemates purple OKLCH token scale, Clash Display/Chivo font setup, global.css @theme tokens
  - phase: 07-01
    provides: localizeRoute(), ROUTE_SEGMENTS, Locale type, DEFAULT_LOCALE
provides:
  - "MegaNav.astro — osmo mega-nav as Astro component with inline GSAP-guarded script"
  - "BaseLayout.astro wired with MegaNav on every page (all 3 locales)"
  - "Locale switcher navigates to equivalent localized page (build-time data-href)"
  - "Mobile GSAP slide-over drawer with burger, ESC/backdrop close"
  - "data-dropdown-toggle DOM hooks preserved for future mega-dropdown re-enable"
  - "localizeRoute('home') added to ROUTE_SEGMENTS → /, /en/, /es/"
affects:
  - 09-05 (will also modify BaseLayout — additive, navLocaleUrls prop enables page-specific locale URLs)
  - future mega-dropdown plan (data-dropdown-toggle hooks in place)
  - blog post pages (should pass navLocaleUrls with translation slug map)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "GSAP lazy CDN load in is:inline script with guard if !window.gsap (established by StackingCards, extended to MegaNav)"
    - "Build-time locale URL serialization: localizeRoute() in Astro frontmatter → data-href on buttons → inline script reads btn.dataset.href"
    - "navLocaleUrls prop pattern: BaseLayout accepts optional page-specific locale URL map; defaults to homepages"

key-files:
  created:
    - src/components/nav/MegaNav.astro
  modified:
    - src/layouts/BaseLayout.astro
    - src/i18n/routes.ts

key-decisions:
  - "MegaNav implemented as .astro + <script is:inline> (NOT React island) — per CONTEXT.md locked decision"
  - "GSAP lazy-loaded from CDN in MegaNav inline script if !window.gsap — consistent with StackingCards.astro pattern; no GSAP on initial page load"
  - "Locale switcher hrefs pre-computed at build time via localizeRoute(), serialized as data-href; zero client-side routing logic"
  - "home route added to ROUTE_SEGMENTS with empty segments → /, /en/, /es/ (fixes localizeRoute('home', locale))"
  - "navLocaleUrls prop added to BaseLayout: optional override for blog posts / analyse pages to point switcher to equivalent translated page"
  - "Kontakt: resolved via Sanity navItems key; kontakt key falls back to /${locale}/kontakt; add id='kontakt' to LandingCtaFinal as follow-up"
  - "desktop drawer hidden via CSS display:none on 992px+; GSAP animates translateX on mobile only"

patterns-established:
  - "Pattern: MegaNav receives all data as props from BaseLayout — no Sanity fetch in the nav component itself"
  - "Pattern: is:global style block for mega-nav__ classes — allows drawer + backdrop to escape component scope"
  - "Pattern: data-menu-open attribute on [data-menu-wrap] drives burger X animation via CSS attribute selector"

# Metrics
duration: 25min
completed: 2026-04-14
---

# Phase 9 Plan 02: Mega-Nav Component Summary

**Osmo mega-nav as .astro + inline GSAP script wired into BaseLayout — sticky branded nav with locale switcher, mobile drawer, and preserved dropdown hooks across all 3 locales**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-14T13:30:00Z
- **Completed:** 2026-04-14T13:55:00Z
- **Tasks:** 2 (checkpoint is task 3 — awaiting human verify)
- **Files modified:** 3

## Accomplishments

- Built `MegaNav.astro` (284 lines) — full osmo mega-nav structure with brand restyling, scoped styles, and GSAP-guarded inline controller
- Wired into `BaseLayout.astro` — every page across all 3 locales now receives the nav with correctly resolved labels, CTA, and locale switcher hrefs
- `astro build` succeeds — all 10 static routes prerendered, no TypeScript errors

## Task Commits

1. **Task 1: Build MegaNav.astro with osmo HTML, brand styles, GSAP-guarded inline script** — `cd13b0a` (feat)
2. **Task 2: Wire MegaNav into BaseLayout with computed localeUrls and nav prop resolution** — `80ef8d8` (feat)

## Files Created/Modified

- `src/components/nav/MegaNav.astro` — Full osmo mega-nav: props interface, bar HTML (logo/links/locale/CTA/burger), mobile drawer, backdrop, is:global styles, is:inline GSAP controller
- `src/layouts/BaseLayout.astro` — Added MegaNav import, navLocaleUrls prop, nav data resolution (navItems/ctaLabel/ctaHref/localeUrls), `<MegaNav />` render before `<slot />`
- `src/i18n/routes.ts` — Added `home` entry to ROUTE_SEGMENTS with empty segments; `localizeRoute('home', locale)` now returns `/`, `/en/`, `/es/`

## Decisions Made

- **GSAP lazy-load in MegaNav**: GSAP is NOT globally loaded by BaseLayout (only by StackingCards). MegaNav loads it from CDN if `!window.gsap`, same CDN URL pattern as StackingCards. This ensures GSAP is available for drawer animation without adding it to the global bundle.
- **Build-time locale URL serialization**: `localizeRoute()` runs in Astro frontmatter, result serialized as `data-href` attributes. The `is:inline` script does `btn.getAttribute('data-href')`. Zero client-side routing logic — avoids TypeScript module import restrictions in inline scripts.
- **`navLocaleUrls` prop**: Added to BaseLayout so blog posts and /analyse pages can pass their specific cross-locale URLs. Default is homepage fallback, consistent with Phase 7 `getPageWithFallback` pattern.
- **`home` in ROUTE_SEGMENTS**: Added with empty string segments; `localizeRoute('home', 'de')` = `/`, `localizeRoute('home', 'en')` = `/en/`. Empty segment + prefix produces trailing slash correctly.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Build passed on first attempt. The esbuild dependency scan warning about PTRenderer.astro imports is pre-existing (from Phase 8) and does not affect build output — Vite recovers and completes the build successfully.

## User Setup Required

None — no external service configuration required.

Editors should populate Sanity `siteSettings.navItems`, `ctaLabel`, and `ctaHref` in Studio (nestorsegura.com) for the nav to show real content. Until populated, nav will render with empty nav items and fallback CTA text.

## Next Phase Readiness

- MegaNav is live on every page — checkpoint verification needed before proceeding to 09-04 or 09-05
- `navLocaleUrls` prop is in place: blog post pages can pass their `_translations` slug map; analyse pages can pass `localizeRoute('analyse', l)`
- Future mega-dropdown re-enable: `data-dropdown-toggle` hooks present on all link wrappers, directional-hover logic running; add `[data-nav-panel]` panels and update CSS to re-enable

---
*Phase: 09-interactive-islands*
*Completed: 2026-04-14*
