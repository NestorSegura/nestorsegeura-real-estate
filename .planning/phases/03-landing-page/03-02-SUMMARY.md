---
phase: 03-landing-page
plan: 02
subsystem: api, ui
tags: [nextjs, zod, svg, animations, oklch, next-intl, sanity]

# Dependency graph
requires:
  - phase: 02-cms-and-page-builder
    provides: sanityFetch from @/sanity/lib/live, SITE_SETTINGS_QUERY, OKLCH style patterns
  - phase: 03-01
    provides: i18n message files with analysis namespace, locale routing
provides:
  - POST /api/analyze endpoint with Zod URL validation and mock scores (5 categories)
  - /de/analyse, /en/analyse, /es/analyse pages with URL form and SVG gauge visualization
  - Animated circular score gauges using CSS stroke-dashoffset transition
affects:
  - 03-03 (landing page sections that link to /analyse tool)
  - 04-seo (analyse page metadata and canonical URL)
  - future: real PageSpeed API integration replacing mock scores

# Tech tracking
tech-stack:
  added: [zod (transitive dep, now explicitly used)]
  patterns:
    - Server component wrapper fetches Sanity data (ctaHref), passes to 'use client' child component
    - SVG gauge animation: CSS stroke-dashoffset transition triggered by useEffect after mount
    - Score color coding via OKLCH hue shift (red/amber/green) based on score range
    - Locale-aware hardcoded domain labels (Performance/SEO/Mobile/Conversion/Positionierung)

key-files:
  created:
    - src/app/api/analyze/route.ts
    - src/app/[locale]/analyse/page.tsx
    - src/app/[locale]/analyse/AnalysePageClient.tsx
  modified:
    - src/components/NavbarClient.tsx
    - src/i18n/messages/de.json
    - src/i18n/messages/en.json
    - src/i18n/messages/es.json

key-decisions:
  - "Mock scores use mediocre-but-realistic ranges (35-84) to motivate improvement without being obviously fake"
  - "No framer-motion: CSS stroke-dashoffset transition with 1s ease 0.2s delay handles gauge animation"
  - "Server component fetches ctaHref, falls back to #kontakt if Sanity CMS has no URL set"
  - "TODO comments placed for PageSpeed API and Positioning score logic (v2 scope)"

patterns-established:
  - "API route pattern: try/catch JSON parse → safeParse Zod → business logic → NextResponse.json()"
  - "Score gauge component: SVG with CIRCUMFERENCE constant, strokeDashoffset animation, OKLCH color coding"

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 3 Plan 02: Website Analysis Tool Summary

**POST /api/analyze with Zod validation + mock scores, plus /de|en|es/analyse pages with SVG circular gauge animation using CSS stroke-dashoffset**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-15T19:35:00Z
- **Completed:** 2026-03-15T19:40:11Z
- **Tasks:** 2 completed
- **Files modified:** 7

## Accomplishments
- POST /api/analyze endpoint validates URLs with Zod, returns mediocre mock scores for 5 categories (performance 55-84, seo 60-84, mobile 50-84, conversion 40-79, positioning 35-79), returns 400 on invalid JSON and 422 on invalid URL
- /de/analyse, /en/analyse, /es/analyse pages with URL input form and 5 animated SVG circular score gauges
- Score gauges animate from 0 to final value via CSS stroke-dashoffset transition (1s ease 0.2s delay), color-coded red/amber/green via OKLCH
- CTA button below scores links to Sanity siteSettings defaultCtaHref with #kontakt fallback

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /api/analyze POST endpoint with Zod validation** - `c0857be` (feat)
2. **Task 2: Build analyse page with URL form and animated SVG score gauges** - `620e253` (feat)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `src/app/api/analyze/route.ts` - POST endpoint with Zod validation and mock scores, OPTIONS preflight handler
- `src/app/[locale]/analyse/page.tsx` - Server component fetching ctaHref from Sanity, renders AnalysePageClient
- `src/app/[locale]/analyse/AnalysePageClient.tsx` - 'use client' URL form, fetch call, SVG score gauges with animation
- `src/components/NavbarClient.tsx` - Fixed @base-ui/react/drawer import and logo Link component (bug fixes)
- `src/i18n/messages/de.json` - menuOpen/menuClose translations already present from 03-01; analysis namespace was pre-existing
- `src/i18n/messages/en.json` - Same as de.json
- `src/i18n/messages/es.json` - Same as de.json

## Decisions Made
- Mock score ranges chosen to be "mediocre but realistic" (35-84) so results look credible and motivate hiring
- CSS-only animation enforced per [02-03] locked decision — useEffect setTimeout delay triggers strokeDashoffset transition
- Server/client split: page.tsx (server) fetches CMS data, AnalysePageClient.tsx (client) handles form state
- No CORS headers on /api/analyze — same-origin enforcement by omission per plan spec

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed NavbarClient import: @base-ui-components/react/drawer was wrong package name**
- **Found during:** Build verification (npm run build)
- **Issue:** NavbarClient.tsx imported from `@base-ui-components/react/drawer` but package is `@base-ui/react/drawer`
- **Fix:** Corrected import path to `@base-ui/react/drawer`
- **Files modified:** src/components/NavbarClient.tsx
- **Verification:** tsc --noEmit passes, build succeeds
- **Committed in:** 620e253 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed NavbarClient logo: <a href="/"> causing ESLint build failure**
- **Found during:** Build verification (npm run build)
- **Issue:** ESLint rule `@next/next/no-html-link-for-pages` blocked build — logo used bare `<a href="/">`
- **Fix:** Replaced with `Link` from `@/i18n/navigation` (locale-aware next-intl Link)
- **Files modified:** src/components/NavbarClient.tsx
- **Verification:** Build passes without ESLint error
- **Committed in:** 620e253 (Task 2 commit)

**Note:** The menuOpen/menuClose translation keys and the import fixes were already committed in 03-01 (c92d289). The build errors encountered during 03-02 verification were pre-existing from 03-01 work that had not yet been verified with a build.

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both fixes were pre-existing issues in NavbarClient introduced in 03-01. No scope creep — all fixes directly enabled the build verification step.

## Issues Encountered
- Pre-existing NavbarClient had wrong `@base-ui-components` package name (should be `@base-ui`) causing TS error
- Pre-existing NavbarClient used `<a href="/">` instead of `<Link>` causing ESLint build failure
- Both fixed inline per Rule 1 (auto-fix bugs)

## User Setup Required
None - no external service configuration required. Mock scores require no API keys.

## Next Phase Readiness
- /api/analyze endpoint ready for real PageSpeed API integration (TODO comment in place)
- /de/analyse, /en/analyse, /es/analyse pages fully functional with mock scores
- CTA flow complete: analyze → see scores → book consultation
- Ready for 03-03 landing page content sections (hero, features, etc.)

---
*Phase: 03-landing-page*
*Completed: 2026-03-15*

## Self-Check: PASSED
