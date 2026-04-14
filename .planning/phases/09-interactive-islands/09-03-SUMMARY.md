---
phase: 09-interactive-islands
plan: "03"
subsystem: api
tags: [astro, react, cloudflare-workers, typescript, cors, api-endpoint]

# Dependency graph
requires:
  - phase: 06-infrastructure
    provides: Cloudflare adapter with prerender=false hybrid mode support
  - phase: 07-routing-i18n
    provides: locale types (de/en/es) used by endpoint validation
provides:
  - "@astrojs/react integration registered — unlocks React .tsx island hydration for 09-04"
  - "POST /api/analyze endpoint as Cloudflare Worker (prerender=false) with mock PageSpeed scores"
  - "OPTIONS /api/analyze CORS preflight handler"
  - "Input validation: url (URL constructor), locale (de/en/es allow-list), 400 on invalid"
affects: [09-04-analyse-react-island, LEAD-V2-01]

# Tech tracking
tech-stack:
  added: ["@astrojs/react@5.0.3"]
  patterns:
    - "prerender=false on a single route opts it into Cloudflare Worker on-demand mode while rest of site stays static"
    - "CORS headers shared as a const object, spread into both OPTIONS (204) and POST/error responses"
    - "json() helper centralizes Response construction with Content-Type + CORS headers"
    - "TODO LEAD-V2-01 comment convention marks PageSpeed Insights integration deferral point"

key-files:
  created:
    - src/pages/api/analyze.ts
  modified:
    - astro.config.mjs
    - tsconfig.json
    - package.json
    - package-lock.json

key-decisions:
  - "@astrojs/react added before sanity() in integrations array — framework integrations first"
  - "jsx: react-jsx + jsxImportSource: react in tsconfig compilerOptions (merged, not replaced)"
  - "Locale validated against ALLOWED_LOCALES as-const tuple — type-safe and runtime-safe"
  - "Mock scores use Math.random() banded ranges (performance 50-90, seo 60-90, etc.) — intentionally non-deterministic for demo realism"
  - "CORS Allow-Origin: * in V1 — comment instructs to tighten to site origin via env in production"

patterns-established:
  - "API endpoint pattern: prerender=false + named export POST/OPTIONS + shared corsHeaders const"
  - "React integration order: react() before other integrations in astro.config.mjs"

# Metrics
duration: 3min
completed: 2026-04-14
---

# Phase 9 Plan 03: Analyze API Endpoint Summary

**@astrojs/react integration wired and /api/analyze Cloudflare Worker endpoint created with POST validation, mock PageSpeed scores, and CORS preflight — unblocking the React island in plan 09-04**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-14T11:31:02Z
- **Completed:** 2026-04-14T11:33:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Installed `@astrojs/react@5.0.3` and registered `react()` in astro.config.mjs integrations; added `jsx: react-jsx` and `jsxImportSource: react` to tsconfig.json — plan 09-04 can now use `.tsx` React islands with `client:visible`
- Created `src/pages/api/analyze.ts` as a Cloudflare Worker endpoint (`prerender = false`): POST validates URL + locale, returns 200 with mock scores; OPTIONS returns 204 with CORS headers; invalid input returns 400 with JSON error
- Verified build passes after both changes; curl-tested all three scenarios (valid POST 200, invalid body 400, OPTIONS 204)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @astrojs/react and register integration** - `0640e22` (chore)
2. **Task 2: Create /api/analyze Cloudflare Worker endpoint** - `57f025d` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified
- `src/pages/api/analyze.ts` - POST + OPTIONS handlers, prerender=false, mock score generator, CORS headers, input validation
- `astro.config.mjs` - Added `import react from '@astrojs/react'` and `react()` in integrations array
- `tsconfig.json` - Added `"jsx": "react-jsx"` and `"jsxImportSource": "react"` to compilerOptions
- `package.json` - Added `@astrojs/react@5.0.3` dependency
- `package-lock.json` - Lockfile updated

## Decisions Made
- `react()` placed before `sanity()` in the integrations array — framework integrations conventionally come first
- `--legacy-peer-deps` was NOT needed for this install (clean install, no conflicts — different from the [07-01] pattern in STATE.md which required it for `@sanity/document-internationalization`)
- Locale validation uses `ALLOWED_LOCALES.includes(body.locale)` against a `as const` tuple — both runtime-safe and TypeScript-typed
- `json()` helper function centralizes `Content-Type: application/json` + CORS header spreading to avoid duplication across POST success, POST error, and future additions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- The `astro dev` dev server started on port 4322 instead of 4321 (4321 was still occupied by a previous dev server process from the build verification step). Endpoint testing still succeeded on 4322. Non-issue.
- Vite dependency scan emits non-fatal `[ERROR]` lines about `PTRenderer.astro` importing `.astro` files as default exports — this pre-existed this plan (confirmed: build completes successfully despite the scan warning). Not a regression from this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 09-04 (AnalyseForm React island) is fully unblocked: `@astrojs/react` is registered, `.tsx` islands with `client:visible` will hydrate, and `/api/analyze` is ready to receive POST requests
- The endpoint is mock-only — real PageSpeed Insights integration is deferred to LEAD-V2-01 per plan
- CORS `Allow-Origin: *` is intentional for V1; tighten to `process.env.PUBLIC_SITE_URL` in production when LEAD-V2-01 lands

---
*Phase: 09-interactive-islands*
*Completed: 2026-04-14*

## Self-Check: PASSED
