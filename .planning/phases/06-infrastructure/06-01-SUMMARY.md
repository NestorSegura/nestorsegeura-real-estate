---
phase: 06-infrastructure
plan: 01
subsystem: infra
tags: [astro, cloudflare, workers, sanity, tailwind, wrangler, typescript]

# Dependency graph
requires:
  - phase: 05-content
    provides: Sanity schemas and content model preserved intact
provides:
  - Astro 6 project scaffold in place (next.js fully removed)
  - astro build producing dist/server/entry.mjs + dist/client/
  - astro dev running on localhost:4321 via workerd
  - wrangler dev serving built site on localhost:8787
  - All config files: astro.config.mjs, wrangler.jsonc, tsconfig.json
affects:
  - 06-02 (Sanity fetch wiring)
  - 06-03+ (all Astro pages and components)

# Tech tracking
tech-stack:
  added:
    - astro@6.1.5
    - "@astrojs/cloudflare@13.1.8"
    - "@sanity/astro@3.3.1"
    - "@cloudflare/vite-plugin@1.25.6 (PINNED)"
    - "@tailwindcss/vite@4.x"
    - wrangler@4.81.1
    - react@19, react-dom@19, react-is@19 (peer deps for @sanity/astro)
  patterns:
    - output=static with prerenderEnvironment=node (Sanity SDK CJS safety net)
    - wrangler.jsonc without main field (adapter provides entry via @astrojs/cloudflare/entrypoints/server)
    - wrangler:dev uses dist/server/wrangler.json (adapter-generated config with correct paths)
    - PUBLIC_ prefix for client-exposed env vars (Astro convention)

key-files:
  created:
    - astro.config.mjs
    - wrangler.jsonc
    - src/env.d.ts
    - src/styles/global.css
    - src/pages/index.astro
  modified:
    - package.json (full rewrite: Next.js -> Astro deps)
    - tsconfig.json (extends astro/tsconfigs/strict)
    - src/sanity/config.ts (NEXT_PUBLIC_ -> PUBLIC_ env vars)
    - .env.local (NEXT_PUBLIC_ -> PUBLIC_ vars, not committed)

key-decisions:
  - "@cloudflare/vite-plugin pinned to 1.25.6 — 1.31.2 has Rolldown/workerd CJS runtime bug (require_dist is not a function)"
  - "wrangler.jsonc has no main field — @cloudflare/vite-plugin validates main existence at startup, dist/server/entry.mjs only exists post-build"
  - "wrangler:dev script uses dist/server/wrangler.json — adapter generates complete wrangler config with correct entry and assets paths"
  - "Build output is dist/server/entry.mjs + dist/client/ — not dist/_worker.js/index.js (changed in @astrojs/cloudflare@13)"
  - "compatibility_date=2026-03-05 — @cloudflare/vite-plugin@1.25.6 workerd only supports up to 2026-03-05"
  - "@sanity/astro actual Astro 6 compatible version is ^3.x (not ^1.x as documented in research)"

patterns-established:
  - "Pattern: Never set main in wrangler.jsonc before first build — use dist/server/wrangler.json for wrangler dev/deploy"
  - "Pattern: Sanity public values hardcoded in astro.config.mjs (import.meta.env not available at config eval time)"
  - "Pattern: eslint.config.mjs preserved (already framework-agnostic)"

# Metrics
duration: 16min
completed: 2026-04-13
---

# Phase 6 Plan 01: Infrastructure Scaffold Summary

**Astro 6 + Cloudflare Workers scaffold: Next.js fully removed, astro dev/build/wrangler dev all working with @sanity/astro@3, Tailwind v4, and i18n routing**

## Performance

- **Duration:** 16 min
- **Started:** 2026-04-13T07:13:22Z
- **Completed:** 2026-04-13T07:29:29Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Removed all Next.js source files (src/app/, components/, hooks/, i18n/, lib/, blocks/, assets/, types/, sanity/lib/) and config files (next.config.ts, middleware.ts, postcss.config.mjs, ecosystem.config.js, deploy.sh, components.json, nginx/)
- Created complete Astro 6 scaffold: astro.config.mjs (output=static, Cloudflare adapter, @sanity/astro, Tailwind v4, i18n de/en/es), wrangler.jsonc (nodejs_compat), tsconfig.json (astro strict), placeholder index.astro
- All three pipeline stages verified: `astro dev` on :4321, `astro build` producing dist/server/entry.mjs, `wrangler dev` on :8787

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete Next.js files and install Astro dependencies** - `957b0b9` (feat)
2. **Task 2: Create Astro config files and placeholder page** - `54c85b3` (feat)

**Plan metadata:** (pending docs commit)

## Files Created/Modified

- `astro.config.mjs` — Astro 6 config: output=static, Cloudflare adapter with prerenderEnvironment=node, @sanity/astro@3 integration, Tailwind v4 Vite plugin, i18n de/en/es
- `wrangler.jsonc` — Cloudflare Workers config: nodejs_compat, compatibility_date=2026-03-05, no main field, assets in dist/client
- `tsconfig.json` — Rewrote to extend astro/tsconfigs/strict with @/* path alias
- `src/env.d.ts` — Triple-slash refs for astro/client and @sanity/astro/module
- `src/styles/global.css` — Tailwind v4 entry: `@import "tailwindcss"`
- `src/pages/index.astro` — Placeholder page with Tailwind classes, no Sanity fetch
- `package.json` — Full rewrite: Next.js removed, Astro 6 stack added, @cloudflare/vite-plugin@1.25.6 pinned
- `src/sanity/config.ts` — Bug fix: NEXT_PUBLIC_ env var refs updated to PUBLIC_
- `.env.local` — NEXT_PUBLIC_ vars renamed to PUBLIC_ (gitignored, not committed)

## Decisions Made

1. **Pinned @cloudflare/vite-plugin to 1.25.6.** v1.31.2 (latest) has a Rolldown/workerd CJS runtime bug: `require_dist is not a function` in pre-bundled Astro cookie module. Pinning to 1.25.6 (what @astrojs/cloudflare@13 originally required) fixes this. Root cause: Vite 7 uses Rollup 4's `__commonJSMin` runtime helper for CJS deps; workerd's module runner fails to execute re-exported factory functions from these chunks.

2. **No main in wrangler.jsonc.** The @cloudflare/vite-plugin validates the main field path at startup — even during `astro build` before dist/ exists. The adapter provides `@astrojs/cloudflare/entrypoints/server` as the default entry automatically. The generated `dist/server/wrangler.json` contains the correct `main: "entry.mjs"` for deployment.

3. **wrangler:dev uses dist/server/wrangler.json.** @astrojs/cloudflare@13 changed the build output from `dist/_worker.js/index.js` to `dist/server/entry.mjs` + `dist/client/`. The adapter generates a complete `dist/server/wrangler.json` with correct relative paths for assets and entry.

4. **@sanity/astro version is ^3.x not ^1.x.** Research cited @sanity/astro@^1.x but npm shows the Astro 6 compatible version is 3.3.1. Also requires react, react-dom, react-is as peer deps.

5. **compatibility_date=2026-03-05.** The installed workerd runtime in @cloudflare/vite-plugin@1.25.6 only supports up to 2026-03-05. Using 2026-04-11 causes a warning and fallback. Updated to match the workerd maximum.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated src/sanity/config.ts env var references**
- **Found during:** Task 2 (renaming .env.local vars)
- **Issue:** sanity.config.ts uses `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID` which would be undefined after renaming env vars in .env.local
- **Fix:** Updated to `process.env.PUBLIC_SANITY_PROJECT_ID ?? '0cn4widw'` with fallback
- **Files modified:** src/sanity/config.ts
- **Verification:** Sanity CLI would receive non-undefined projectId
- **Committed in:** 54c85b3 (Task 2 commit)

**2. [Rule 3 - Blocking] Pinned @cloudflare/vite-plugin to 1.25.6**
- **Found during:** Task 2 (first astro build attempt)
- **Issue:** @cloudflare/vite-plugin@1.31.2 (auto-resolved by npm) crashes with `require_dist is not a function` in workerd module runner — Rollup 4/Vite 7's CJS wrapper functions are not executed correctly in workerd's inlined module system
- **Fix:** Pinned @cloudflare/vite-plugin@1.25.6 in devDependencies
- **Files modified:** package.json, package-lock.json
- **Verification:** astro build succeeded, astro dev started, wrangler dev served site
- **Committed in:** 54c85b3 (Task 2 commit)

**3. [Rule 3 - Blocking] Removed main field from wrangler.jsonc**
- **Found during:** Task 2 (configuring wrangler.jsonc per plan)
- **Issue:** Plan specified `main: "dist/_worker.js/index.js"` but @cloudflare/vite-plugin validates the main path exists at startup, before dist/ is created
- **Fix:** Removed main from wrangler.jsonc; updated wrangler:dev script to use dist/server/wrangler.json instead
- **Files modified:** wrangler.jsonc, package.json
- **Verification:** astro build and astro dev both succeed without main field
- **Committed in:** 54c85b3 (Task 2 commit)

**4. [Rule 3 - Blocking] Used @sanity/astro@^3.x (not ^1.x)**
- **Found during:** Task 1 (npm install)
- **Issue:** npm install failed with peer dep error: `@sanity/astro@1.3.0` declares `peer astro@"^2.0.0 || ^3.0.0"` — not Astro 6
- **Fix:** Checked npm for Astro 6 compatible version — found @sanity/astro@3.3.1 supports astro `^2.0.0 || ... || ^6.0.0`. Also requires react/react-dom/react-is as peer deps.
- **Files modified:** package.json
- **Verification:** npm install succeeded, build passed
- **Committed in:** 957b0b9 (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking)
**Impact on plan:** All fixes essential for compilation. Discovery of @sanity/astro version mismatch and cloudflare plugin Rolldown bug are important findings for future phases.

## Issues Encountered

- **Rolldown/workerd CJS bug in @cloudflare/vite-plugin@1.31.2:** The `__commonJSMin` factory pattern (Rollup 4's CJS-to-ESM transform used by Vite 7 dep optimizer) fails in workerd's inlined module system. The issue is that pre-bundled deps export `require_dist` as a function but when imported into workerd, the factory isn't callable. Fixed by pinning to 1.25.6.
- **Build output structure changed in @astrojs/cloudflare@13:** `dist/_worker.js/index.js` is no longer the output. The adapter now produces `dist/server/entry.mjs` + `dist/client/` and generates its own `dist/server/wrangler.json` with complete configuration. The manual wrangler.jsonc is only needed for top-level project metadata.

## User Setup Required

None — no external service configuration required beyond what's already in .env.local.

## Next Phase Readiness

- Astro scaffold is working: `astro dev`, `astro build`, `wrangler dev` all succeed
- @sanity/astro integration is registered in astro.config.mjs with projectId and dataset
- Plan 06-02 can wire the sanityClient import and fetch from Sanity
- Known constraint: @cloudflare/vite-plugin must stay pinned to 1.25.6 until upstream fix releases. Monitor for @cloudflare/vite-plugin releases that fix the CJS module runner issue.

---
*Phase: 06-infrastructure*
*Completed: 2026-04-13*

## Self-Check: PASSED
