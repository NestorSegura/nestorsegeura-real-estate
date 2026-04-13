---
phase: 07-i18n-and-content-layer
plan: 01
subsystem: i18n
tags: [astro, i18n, typescript, cloudflare, redirects, messages, localization, routing]

# Dependency graph
requires:
  - phase: 06-infrastructure
    provides: Astro 6 scaffold with i18n config (defaultLocale: 'de', locales: ['de','en','es'], prefixDefaultLocale: false) and messages/*.json files
provides:
  - src/i18n/utils.ts: useTranslations(locale), useTranslationArray(locale, key), LOCALES, DEFAULT_LOCALE, Locale type
  - src/i18n/routes.ts: ROUTE_SEGMENTS map and localizeRoute(routeKey, targetLocale) helper
  - Per-locale page files: DE at /, EN at /en, ES at /es (index + analyse/analyze/analizar stubs)
  - public/_redirects: /de and /de/* 301 redirects to root-no-prefix
  - scripts/check-i18n-keys.mjs: build-time missing-key audit
affects:
  - 07-02-base-layout (uses useTranslations, Locale type, font preloads in BaseLayout)
  - 07-03-sanity-locale (uses Locale type and i18n utils in GROQ helpers)
  - 08-page-builder (all locale pages receive translated content blocks)
  - 09-interactive-islands (NavbarClient consumes Locale and localizeRoute for switcher)

# Tech tracking
tech-stack:
  added:
    - "@sanity/document-internationalization@^6.1.0 (installed; was referenced in sanity/config.ts but missing from package.json)"
  patterns:
    - "useTranslations(locale) returns (key: string) => string with dot-notation lookup and DE fallback"
    - "useTranslationArray(locale, key) returns T[] for arrays in messages/*.json"
    - "Per-locale file routing for translated route segments (file-based, not middleware-based)"
    - "DE gets no URL prefix; EN/ES get /${locale} prefix (Astro i18n prefixDefaultLocale: false)"
    - "public/_redirects for zero-runtime Cloudflare edge redirects"

key-files:
  created:
    - src/i18n/utils.ts
    - src/i18n/routes.ts
    - src/pages/en/index.astro
    - src/pages/es/index.astro
    - src/pages/analyse.astro
    - src/pages/en/analyze.astro
    - src/pages/es/analizar.astro
    - public/_redirects
    - scripts/check-i18n-keys.mjs
  modified:
    - src/pages/index.astro (replaced Phase 6 Sanity scaffold with translation-driven DE homepage)
    - package.json (added check:i18n script, prepended audit to build script)

key-decisions:
  - "File-based routing for translated segments (/analyse vs /en/analyze) — simpler and more reliable for static output than middleware rewrite"
  - "useTranslations returns key itself (not empty string) for missing keys — makes missing translations visible in dev"
  - "check-i18n-keys.mjs exits 0 (warnings only, not build blocker) — visibility over enforcement for now"
  - "/de/* redirect in public/_redirects not middleware — zero-runtime, Cloudflare edge handles it"
  - "[Rule 3 - Blocking] Installed @sanity/document-internationalization — referenced in sanity/config.ts but missing from package.json, causing tsc error"

patterns-established:
  - "Translation pattern: import { useTranslations } from '../i18n/utils'; const t = useTranslations('de'); then t('key.subkey')"
  - "Locale file structure: src/pages/{locale}/page.astro for EN/ES, src/pages/page.astro for DE (no prefix)"
  - "Route localization: localizeRoute('analyse', 'en') → '/en/analyze'"

# Metrics
duration: 3min
completed: 2026-04-13
---

# Phase 7 Plan 01: i18n Routing and Translation Utilities Summary

**Astro built-in i18n routing for de/en/es with translated route segments (/analyse, /en/analyze, /es/analizar), useTranslations() utility with DE fallback, and Cloudflare _redirects for /de/* canonicalization**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-13T20:27:13Z
- **Completed:** 2026-04-13T20:30:23Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Created `src/i18n/utils.ts` with `useTranslations(locale)`, `useTranslationArray(locale, key)`, DE fallback logic, and strict TypeScript typing
- Created `src/i18n/routes.ts` with `ROUTE_SEGMENTS` map and `localizeRoute(routeKey, targetLocale)` helper for translated URL segments
- Built six locale-routed pages (3 index + 3 analyse-route stubs) that render locale-correct strings from messages/*.json
- Added `public/_redirects` with /de and /de/* 301 redirects for canonical URL enforcement
- Wired `scripts/check-i18n-keys.mjs` into `npm run build` as a pre-step; both en and es have 0 missing keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Create i18n utilities and route segment map** - `1175117` (feat)
2. **Task 2: Create per-locale page files with translated route segments** - `e528945` (feat)
3. **Task 3: Add _redirects for /de canonicalization and build-time key audit** - `ce9c766` (feat)

## Files Created/Modified

- `src/i18n/utils.ts` - LOCALES, Locale type, DEFAULT_LOCALE, useTranslations(), useTranslationArray(), getNestedValue()
- `src/i18n/routes.ts` - ROUTE_SEGMENTS map, localizeRoute() helper
- `src/pages/index.astro` - DE homepage (replaced Phase 6 Sanity scaffold with translation-driven content)
- `src/pages/en/index.astro` - EN homepage at /en with English strings
- `src/pages/es/index.astro` - ES homepage at /es with Spanish strings
- `src/pages/analyse.astro` - DE analysis page stub at /analyse
- `src/pages/en/analyze.astro` - EN analysis page stub at /en/analyze
- `src/pages/es/analizar.astro` - ES analysis page stub at /es/analizar
- `public/_redirects` - /de and /de/* 301 redirects to no-prefix canonical URLs
- `scripts/check-i18n-keys.mjs` - Build-time audit comparing en/es keys against de
- `package.json` - Added check:i18n script, build now runs key audit first

## Decisions Made

- **File-based routing for translated segments:** Astro's i18n system doesn't natively support translated route segments; the per-locale `.astro` file approach (separate files per locale, separate paths) is simpler and more reliable for static output than middleware rewrites.
- **useTranslations returns key itself for missing translations:** Returning the key (e.g. `"nav.home"`) rather than empty string makes missing keys visibly obvious in dev/staging.
- **check-i18n-keys.mjs exits 0:** Warnings only, not a blocker — both en and es are currently complete. Can be changed to exit(1) when enforcement is desired.
- **`_redirects` not middleware:** Zero-runtime approach; Cloudflare edge handles the redirect before the Worker even starts.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed @sanity/document-internationalization missing dependency**

- **Found during:** Task 1 (tsc --noEmit verification)
- **Issue:** `src/sanity/config.ts` imports from `@sanity/document-internationalization` but the package was missing from `package.json` and `node_modules`, causing a tsc error (`TS2307: Cannot find module`). The research document had flagged this as a Critical Finding.
- **Fix:** `npm install @sanity/document-internationalization --legacy-peer-deps` — version 6.1.0 installed (peer conflict with sanity@4.22 required legacy flag).
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npx tsc --noEmit` passed with zero errors after install.
- **Committed in:** `1175117` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking dependency)
**Impact on plan:** Required fix — tsc was failing before this. No scope creep.

## Issues Encountered

- `npm install @sanity/document-internationalization` failed without `--legacy-peer-deps` due to peer dependency conflict between `@sanity/document-internationalization@6.x` and `sanity@4.22`. Fixed with `--legacy-peer-deps` flag.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useTranslations(locale)` and `useTranslationArray(locale, key)` are ready for Plan 07-02 (BaseLayout)
- `Locale` type and `DEFAULT_LOCALE` are exported and ready for all downstream plans
- `localizeRoute()` is ready for Phase 9 NavbarClient locale switcher
- All six locale pages build and serve correct HTML — foundation for Phase 8 page-builder blocks
- `@sanity/document-internationalization` is now installed — unblocks Phase 7 Plan 03 (Sanity locale wiring)

## Self-Check: PASSED

---
*Phase: 07-i18n-and-content-layer*
*Completed: 2026-04-13*
