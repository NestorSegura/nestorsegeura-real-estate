---
phase: 01-foundation
plan: 02
subsystem: i18n
tags: [next-intl, i18n, routing, middleware, typescript, translations, de, en, es]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 15 scaffold with next-intl already installed as dependency
provides:
  - next-intl v4 locale routing: / = de, /en = en, /es = es (as-needed prefix)
  - Middleware with /studio and /api exclusions (critical for Plan 01-03 Sanity Studio)
  - Three complete translation files with 14 sections and identical key structure
  - Type-safe translation key autocomplete via AppConfig augmentation
  - Locale-aware layout with NextIntlClientProvider + ThemeProvider
affects:
  - 01-03 (Sanity Studio depends on /studio middleware exclusion)
  - All future phases (must import from @/i18n/navigation, never from next/link or next/navigation)
  - Phase 2 (UI components will consume translation keys defined here)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Locale routing with as-needed prefix: / = default (de), /en, /es"
    - "Middleware matcher excludes api|studio|_next|_vercel and static files"
    - "AppConfig augmentation typed from de.json (source language)"
    - "All navigation via @/i18n/navigation exports (Link, redirect, usePathname, useRouter)"
    - "setRequestLocale called before any next-intl API in both layout and page"
    - "params awaited as Promise<{ locale: string }> per Next.js 15 async params API"

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/request.ts
    - src/i18n/navigation.ts
    - src/i18n/messages/de.json
    - src/i18n/messages/en.json
    - src/i18n/messages/es.json
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
  modified:
    - src/types/index.ts
    - src/app/layout.tsx
    - next.config.ts

key-decisions:
  - "German (de) is defaultLocale — / serves German without prefix"
  - "localePrefix: as-needed — only non-default locales get a prefix (/en, /es)"
  - "Middleware matcher: /((?!api|studio|_next|_vercel|.*\\..*) — /studio and /api excluded"
  - "de.json is the TypeScript source for AppConfig.Messages type (German is source language)"
  - "ThemeProvider and NextIntlClientProvider live in locale layout, not root layout"

patterns-established:
  - "routing.ts: single source of truth — import routing everywhere locale config is needed"
  - "navigation.ts: app code always imports Link/redirect/useRouter from @/i18n/navigation"
  - "Translation structure: 14 top-level sections (nav, hero, features, problem, solution, services, testimonials, references, faq, cta, contact, footer, analysis, common)"

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 1 Plan 02: i18n Setup Summary

**next-intl v4 locale routing with de/en/es, as-needed prefix, middleware excluding /studio and /api, three translation files with 14 sections each, and TypeScript AppConfig augmentation**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T15:44:24Z
- **Completed:** 2026-03-15T15:48:14Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Locale routing: / renders German, /en English, /es Spanish — verified with curl
- Middleware exclusions confirmed: /studio and /api not redirected (critical for Plan 01-03)
- Three translation files with identical 14-section structure and real copy in all three languages
- Type-safe translation keys via AppConfig augmentation from de.json source
- Root layout slimmed to bare html/body; ThemeProvider + NextIntlClientProvider in locale layout

## Task Commits

Each task was committed atomically:

1. **Task 1: i18n config, middleware, and next-intl plugin wiring** - `b3c92d9` (feat)
2. **Task 2: Translation files and locale-aware layout/page** - `917b8e4` (feat)

**Plan metadata:** `[pending docs commit]` (docs: complete plan)

## Files Created/Modified
- `src/i18n/routing.ts` - defineRouting with de/en/es, defaultLocale de, as-needed prefix
- `src/i18n/request.ts` - getRequestConfig with hasLocale validation and dynamic message import
- `src/i18n/navigation.ts` - createNavigation exports for app-wide locale-aware navigation
- `src/middleware.ts` - createMiddleware with matcher excluding api|studio|_next|_vercel
- `src/types/index.ts` - AppConfig augmentation: Messages typed from de.json, Locale union type
- `next.config.ts` - wrapped with createNextIntlPlugin('./src/i18n/request.ts')
- `src/i18n/messages/de.json` - German source translations (14 sections, 50+ keys, real copy)
- `src/i18n/messages/en.json` - English translations (identical key structure)
- `src/i18n/messages/es.json` - Spanish translations (identical key structure)
- `src/app/layout.tsx` - slimmed to bare root layout (html/body + fonts only, no providers)
- `src/app/[locale]/layout.tsx` - locale layout with setRequestLocale, NextIntlClientProvider, ThemeProvider
- `src/app/[locale]/page.tsx` - hero translations rendered per locale
- `src/app/page.tsx` - deleted (replaced by [locale]/page.tsx)

## Decisions Made
- `de` is `defaultLocale` — reflects German primary market, / serves German without any prefix
- `localePrefix: 'as-needed'` — cleaner URLs, only non-default locales prefixed
- Middleware matcher regex excludes `studio` before `/de/studio` redirect can occur — this was the highest-risk line in the plan and is confirmed working
- `de.json` used as TypeScript source type for `AppConfig.Messages` since German is the source language

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added hasLocale check in [locale]/page.tsx to fix TypeScript type error**
- **Found during:** Task 2 verification (`npx tsc --noEmit`)
- **Issue:** `setRequestLocale(locale)` expected `"de" | "en" | "es"` but `locale` from params was typed as `string`
- **Fix:** Added `hasLocale(routing.locales, locale)` guard before `setRequestLocale` call (same pattern as locale layout already used)
- **Files modified:** `src/app/[locale]/page.tsx`
- **Verification:** `npx tsc --noEmit` passed with zero errors after fix
- **Committed in:** `917b8e4` (Task 2 commit)

**2. [Rule 3 - Blocking] Cleared stale .next cache after deleting src/app/page.tsx**
- **Found during:** Task 2 verification (`npx tsc --noEmit`)
- **Issue:** `.next/types/validator.ts` referenced deleted `src/app/page.js`, causing TS error
- **Fix:** `rm -rf .next` to clear stale generated types
- **Files modified:** None (cache artifact removal)
- **Verification:** `npx tsc --noEmit` passed clean after cache clear

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes required for TypeScript correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed TypeScript issues above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- i18n routing fully operational: / = de, /en = en, /es = es
- /studio middleware exclusion confirmed — Plan 01-03 (Sanity Studio) can proceed safely
- /api middleware exclusion confirmed — Plan 03 API routes will not be intercepted
- Translation structure with 14 sections establishes the content contract for all Phase 2 UI components
- All future navigation must use `@/i18n/navigation` exports (never `next/link` or `next/navigation` directly)

---
*Phase: 01-foundation*
*Completed: 2026-03-15*

## Self-Check: PASSED
