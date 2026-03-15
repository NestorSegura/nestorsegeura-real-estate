---
phase: 01-foundation
plan: 03
subsystem: cms
tags: [sanity, next-sanity, nextjs, studio, environment-variables]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js scaffold, directory skeleton, sanity@4/next-sanity@11 installed"
provides:
  - "Sanity Studio embedded at /studio via NextStudio component"
  - "Sanity client (createClient) ready for Phase 2 data fetching"
  - "sanityFetch<T> wrapper stub for Phase 2 queries"
  - "Empty schemaTypes aggregator ready for Phase 2 schema additions"
  - ".env.local.template documenting all 5 required env vars with source instructions"
affects: [02-content-schema, 02-data-fetching, 02-groq-queries]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sanityFetch<T> generic wrapper for typed GROQ queries"
    - "Sanity Studio at /studio outside [locale]/ routing (no locale middleware)"
    - ".env.local.template as canonical env var documentation"

key-files:
  created:
    - src/sanity/config.ts
    - src/sanity/lib/client.ts
    - src/sanity/lib/fetch.ts
    - src/sanity/schemas/index.ts
    - src/app/studio/[[...tool]]/page.tsx
    - .env.local.template
  modified:
    - .gitignore

key-decisions:
  - "Studio route at src/app/studio/[[...tool]]/ sits outside [locale]/ so i18n middleware does not intercept it"
  - "sanity/structure subpath confirmed available in sanity@4.22.0 via package exports"
  - ".gitignore negation rule !.env.local.template added to allow committing the template while keeping .env.local secret"

patterns-established:
  - "Sanity env vars pattern: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET read from process.env"
  - "schemaTypes array in src/sanity/schemas/index.ts is the single registration point for all Sanity schemas"

# Metrics
duration: 8min
completed: 2026-03-15
---

# Phase 1 Plan 03: Sanity CMS Bootstrap Summary

**Sanity Studio embedded at /studio via NextStudio using next-sanity@11, with typed sanityFetch wrapper and complete env var documentation in .env.local.template**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-15T15:45:15Z
- **Completed:** 2026-03-15T15:47:13Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Sanity Studio route at /studio renders NextStudio component (outside i18n [locale]/ routing)
- Sanity client and sanityFetch<T> wrapper ready for Phase 2 GROQ queries
- .env.local.template documents all 5 env vars across phases with "where to get it" comments
- .gitignore updated with negation rule to commit template while keeping secrets excluded

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Sanity config, client, and embedded Studio route** - `ce4cfae` (feat)
2. **Task 2: Create env template and configure .gitignore** - `75fd69c` (feat)

**Plan metadata:** `99bd547` (docs: complete plan)

## Files Created/Modified

- `src/sanity/config.ts` - defineConfig with structureTool, reads NEXT_PUBLIC_SANITY_* env vars, basePath /studio
- `src/sanity/lib/client.ts` - createClient with projectId/dataset/apiVersion/useCdn
- `src/sanity/lib/fetch.ts` - sanityFetch<T> generic wrapper around client.fetch
- `src/sanity/schemas/index.ts` - empty SchemaTypeDefinition[] aggregator for Phase 2
- `src/app/studio/[[...tool]]/page.tsx` - NextStudio component, 'use client', imports @/sanity/config
- `.env.local.template` - 5 env vars: PROJECT_ID, DATASET, READ_TOKEN, WEBHOOK_SECRET, SITE_URL
- `.gitignore` - added !.env.local.template negation rule

## Decisions Made

- Studio route placed at `src/app/studio/[[...tool]]/` outside `[locale]/` so next-intl middleware does not intercept Sanity Studio requests — avoids redirect loops and locale prefix on studio URLs.
- `sanity/structure` subpath verified available via package.json exports in sanity@4.22.0 before use.
- `.gitignore` negation `!.env.local.template` added after discovering the existing `.env*` catch-all would have excluded the template file.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

To load Sanity Studio at /studio, the developer must provide a valid Sanity project:

1. Create a Sanity project at [sanity.io/manage](https://sanity.io/manage) (free tier is sufficient)
2. Copy `.env.local.template` to `.env.local`
3. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` to the project ID from Project > Settings
4. `NEXT_PUBLIC_SANITY_DATASET` defaults to `production` (already set in template)
5. Run `npm run dev` — visit http://localhost:3000/studio

The dev server starts and compiles without errors even with empty credentials (env vars are `!` non-null assertions in TypeScript but Next.js does not validate at startup).

## Next Phase Readiness

- Sanity client ready — Phase 2 can immediately use `sanityFetch` for GROQ queries
- schemaTypes array at `src/sanity/schemas/index.ts` is the schema registration point — Phase 2 adds types there
- Studio accessible at /studio once credentials are configured
- All Phase 1 success criteria met: scaffold, brand tokens (01-01), i18n (01-02), and CMS bootstrap (01-03)

---
*Phase: 01-foundation*
*Completed: 2026-03-15*

## Self-Check: PASSED
