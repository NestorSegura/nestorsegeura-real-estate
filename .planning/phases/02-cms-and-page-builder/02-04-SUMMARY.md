---
phase: 02-cms-and-page-builder
plan: 04
subsystem: api
tags: [sanity, groq, typegen, next-sanity, defineLive, defineQuery, cdn]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Sanity client (createClient) and sanityFetch<T> at src/sanity/lib/fetch.ts
provides:
  - Live-aware sanityFetch + SanityLive via defineLive from next-sanity/live
  - GROQ queries for pages, posts, siteSettings wrapped in defineQuery for TypeGen
  - Sanity CLI TypeGen config generating src/types/sanity.types.ts
  - CDN client (useCdn: true) with non-CDN override for generateStaticParams
affects: [02-cms-and-page-builder plans 05+, 03-landing-page, 04-blog]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "defineLive pattern: export { sanityFetch, SanityLive } from live.ts — use sanityFetch for all data fetching"
    - "defineQuery wraps every GROQ string for TypeGen compatibility"
    - "CDN-by-default: client uses useCdn: true, clientWithoutCdn for build-time params"

key-files:
  created:
    - src/sanity/lib/live.ts
    - src/sanity/lib/queries.ts
    - sanity.cli.ts
  modified:
    - src/sanity/lib/client.ts
    - src/sanity/lib/fetch.ts
    - src/app/[locale]/layout.tsx

key-decisions:
  - "defineLive from next-sanity/live (subpath import) — confirmed available in next-sanity@^11"
  - "defineQuery from next-sanity root — NOT groq package — for TypeGen compatibility"
  - "SanityLive placed inside ThemeProvider in locale layout so it covers all locale pages"
  - "sanity.cli.ts typegen.generates targets src/types/sanity.types.ts with overloadClientMethods: true"

patterns-established:
  - "live.ts is the single data-fetching entrypoint: import { sanityFetch } from @/sanity/lib/live"
  - "queries.ts centralizes all GROQ: import named query constants from @/sanity/lib/queries"

# Metrics
duration: 2min
completed: 2026-03-15
---

# Phase 02 Plan 04: Data Fetching Layer Summary

**defineLive-based sanityFetch + SanityLive in layout, CDN client split, and 5 GROQ queries with defineQuery for TypeGen**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-15T18:21:07Z
- **Completed:** 2026-03-15T18:22:30Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Upgraded data-fetching to defineLive pattern: sanityFetch now uses next-sanity/live for live content updates
- Created queries.ts with 5 GROQ queries (pages, allPages, siteSettings, allPosts, postBySlug) all wrapped in defineQuery
- Configured sanity.cli.ts TypeGen to generate src/types/sanity.types.ts from all src/**/*.{ts,tsx} files
- SanityLive component added to locale layout enabling real-time content updates across all routes
- CDN split: useCdn: true by default, clientWithoutCdn exported for generateStaticParams

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade client, create live.ts, and define GROQ queries** - `e7fbe86` (feat)
2. **Task 2: Configure TypeGen and add SanityLive to layout** - `ff7a48d` (feat)

## Files Created/Modified

- `src/sanity/lib/client.ts` - useCdn: true + clientWithoutCdn export
- `src/sanity/lib/live.ts` - defineLive exports: sanityFetch and SanityLive
- `src/sanity/lib/queries.ts` - 5 GROQ queries with defineQuery for TypeGen
- `src/sanity/lib/fetch.ts` - Marked deprecated with comment
- `sanity.cli.ts` - TypeGen config: generates src/types/sanity.types.ts
- `src/app/[locale]/layout.tsx` - SanityLive component added

## Decisions Made

- `defineLive` imported from `next-sanity/live` subpath (not root) — confirmed available in next-sanity@^11
- `defineQuery` imported from `next-sanity` (not `groq`) — this is the TypeGen-compatible wrapper API
- `SanityLive` placed inside `ThemeProvider` in locale layout so it applies to all locale pages
- TypeGen `overloadClientMethods: true` enables type inference on `client.fetch()` calls
- `SANITY_API_READ_TOKEN` check throws at module load time to catch missing env early

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required beyond existing environment variables from Phase 1.

## Next Phase Readiness

- Data pipeline ready: all page/post rendering can now use `sanityFetch` + typed GROQ queries
- TypeGen config ready but cannot be run until block schemas are registered (Plan 02 task)
- `src/types/sanity.types.ts` will not exist until `npx sanity typegen generate` is run
- Block components in subsequent plans should import from `@/sanity/lib/live` and `@/sanity/lib/queries`

---
*Phase: 02-cms-and-page-builder*
*Completed: 2026-03-15*

## Self-Check: PASSED
