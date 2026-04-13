---
phase: 07-i18n-and-content-layer
plan: "02"
subsystem: ui
tags: [sanity, groq, fonts, clash-display, chivo, baselayout, astro, i18n, pyftsubset, fonttools]

requires:
  - phase: 07-01
    provides: i18n routing, useTranslations, locale pages, @sanity/document-internationalization installed
  - phase: 06-02
    provides: sanityClient from 'sanity:client' virtual module, Sanity fetches at build time

provides:
  - src/lib/sanity.ts with five locale-filtered GROQ helpers (getPageForLocale, getPageWithFallback, getHomepageForLocale, getAllPostSlugsForLocale, getPostWithTranslations)
  - src/layouts/BaseLayout.astro with HTML shell, lang attribute, font preloads, global.css import
  - Clash Display and Chivo Variable fonts self-hosted in public/fonts/ (source + subset variants)
  - Font @font-face rules and Tailwind v4 theme tokens in global.css
  - All six locale pages wrapped in BaseLayout with Sanity fetches and DE-fallback banner logic
  - Cookie-based locale redirect script scoped to DE root only

affects:
  - 07-03 (any remaining phase 7 plans)
  - 08-page-builder (block rendering builds on top of getPageWithFallback/sections)
  - 09-interactive-islands (locale switcher uses getPostWithTranslations)

tech-stack:
  added:
    - "@fontsource-variable/chivo (installed as devDep to copy font file, then removed)"
    - "@astrojs/check (installed as devDep for astro check command)"
    - "fonttools + brotli (pip3, one-time subsetting; not in package.json)"
  patterns:
    - "Two-step GROQ fallback: fetch exact locale first, then fetch DE — avoids invalid order() syntax"
    - "getPageWithFallback returns { page, isFallback } tuple — isFallback drives translation-pending banner"
    - "BaseLayout owns all HTML boilerplate (doctype, meta, font preloads, lang) — pages provide only body content via <slot>"
    - "Locale-specific content in sanity.ts — locale values are always GROQ params, never interpolated"

key-files:
  created:
    - src/lib/sanity.ts
    - src/layouts/BaseLayout.astro
    - public/fonts/Chivo-Variable.woff2
    - public/fonts/Chivo-Variable-subset.woff2
    - public/fonts/ClashDisplay-Variable-subset.woff2
  modified:
    - src/styles/global.css
    - src/pages/index.astro
    - src/pages/analyse.astro
    - src/pages/en/index.astro
    - src/pages/en/analyze.astro
    - src/pages/es/index.astro
    - src/pages/es/analizar.astro

key-decisions:
  - "Two-query GROQ fallback pattern: getPageWithFallback makes two sequential fetches (exact locale, then 'de') instead of one query with order() — order(language == $locale desc) is invalid GROQ syntax"
  - "Font subsetting via pip3 fonttools + brotli: @web-alchemy/fonttools npx approach failed (WASM runtime error); pip3 pyftsubset worked immediately"
  - "DE root index: isFallback is always false, so it is not destructured (avoids TS hint about unused variable)"

patterns-established:
  - "BaseLayout pattern: every locale page imports BaseLayout and passes title + locale prop; layout owns all HTML shell including preload links"
  - "Sanity locale query pattern: two-step fetch (exact locale then DE fallback) — applicable to all future locale-filtered queries in Phase 8"
  - "Translation-pending banner: isFallback drives locale-specific banner text; DE never shows banner (it is the source)"

duration: 4min
completed: 2026-04-13
---

# Phase 7 Plan 02: Fonts, BaseLayout, and Locale Sanity Fetches Summary

**Self-hosted Clash Display + Chivo Variable fonts with pyftsubset subsetting, BaseLayout.astro with font preloads, and all six locale pages fetching Sanity content via two-step DE-fallback GROQ pattern**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-13T20:32:56Z
- **Completed:** 2026-04-13T20:37:21Z
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments

- Built five typed Sanity GROQ helpers in `src/lib/sanity.ts` filtering by language field, with `getPageWithFallback` returning `{ page, isFallback }` tuple for banner logic
- Subsetted ClashDisplay Variable (29432 → 22612 bytes, -24%) and Chivo Variable (33220 → 26772 bytes, -19%) to Latin + Latin Extended Unicode ranges covering German (ä ö ü ß) and Spanish (ñ á é í ó ú) glyphs
- Created `src/layouts/BaseLayout.astro` with `lang` attribute, `crossorigin` font preloads for both subsets, and `<slot />` for page body
- Registered `--font-heading` (Clash Display) and `--font-body` (Chivo) Tailwind v4 theme tokens in `global.css` with `@font-face` rules using `font-display: swap`
- Updated all six locale pages to wrap content in BaseLayout; EN and ES index pages show locale-appropriate fallback banner when Sanity doc missing; cookie redirect script scoped only to DE root

## Task Commits

1. **Task 1: Install document-internationalization and build Sanity locale query helpers** - `068e305` (feat)
2. **Task 2: Subset fonts, author BaseLayout.astro, and register fonts in global.css** - `0eef88a` (feat)
3. **Task 3: Apply BaseLayout and locale-filtered Sanity fetches to all six locale pages** - `4c1e104` (feat)

## Font Size Reduction

| Font | Original | Subset | Reduction |
|------|----------|--------|-----------|
| ClashDisplay-Variable.woff2 | 29,432 bytes | 22,612 bytes | -24% |
| Chivo-Variable.woff2 | 33,220 bytes | 26,772 bytes | -19% |

## Files Created/Modified

- `src/lib/sanity.ts` — Five locale-filtered GROQ helpers: getPageForLocale, getPageWithFallback, getHomepageForLocale, getAllPostSlugsForLocale, getPostWithTranslations
- `src/layouts/BaseLayout.astro` — HTML shell with lang attribute, font preloads (crossorigin), global.css import, slot
- `src/styles/global.css` — @font-face rules for Clash Display and Chivo, Tailwind v4 @theme inline tokens, body/heading font assignments
- `public/fonts/Chivo-Variable.woff2` — Chivo Variable source (latin, normal weight, from @fontsource-variable/chivo)
- `public/fonts/Chivo-Variable-subset.woff2` — Subset Chivo Variable covering U+0020-007F,U+00A0-00FF,U+0100-017F
- `public/fonts/ClashDisplay-Variable-subset.woff2` — Subset Clash Display Variable (same unicode range)
- `src/pages/index.astro` — Wraps BaseLayout, fetches DE homepage, adds cookie locale redirect script
- `src/pages/analyse.astro` — Wraps BaseLayout (stub, no Sanity fetch needed)
- `src/pages/en/index.astro` — Wraps BaseLayout, fetches EN homepage with DE fallback + banner
- `src/pages/en/analyze.astro` — Wraps BaseLayout (stub)
- `src/pages/es/index.astro` — Wraps BaseLayout, fetches ES homepage with DE fallback + Spanish banner
- `src/pages/es/analizar.astro` — Wraps BaseLayout (stub)

## Decisions Made

- **Two-query GROQ fallback:** `order(language == $locale desc)` is invalid GROQ syntax (throws parse error from Sanity API). Fixed by making two sequential parameterized queries: first exact locale match, then DE fallback. This is clearer and avoids any GROQ edge cases with boolean ordering.
- **Font acquisition:** Used `@fontsource-variable/chivo` (installed as devDep, file copied, then uninstalled) to get the Chivo Variable woff2 — no runtime dependency, font lives in `public/fonts/`.
- **Font subsetting tool:** `@web-alchemy/fonttools` npx approach failed with a WASM runtime error (pyodide unable to initialize). Fell back to `pip3 install fonttools brotli` which worked immediately. Not a project dependency — one-time build step, not in `package.json`.
- **@astrojs/check:** Installed as devDep for `npx astro check` verification — 0 errors, 0 warnings, 0 hints after cleanup.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed invalid GROQ query in getPageWithFallback**
- **Found during:** Task 3 (first build attempt)
- **Issue:** The GROQ query `| order(language == $locale desc)` is not valid GROQ syntax. Sanity API returned: `GROQ query parse error: unexpected postfix operator "desc"`. The plan's suggested query was functionally correct in intent but syntactically invalid.
- **Fix:** Rewrote `getPageWithFallback` to make two sequential Sanity fetches: (1) exact locale match via `language == $locale`, (2) if null and locale is not 'de', fetch `language == "de"`. Both queries are properly parameterized.
- **Files modified:** `src/lib/sanity.ts`
- **Verification:** Build completed, all six pages prerendered successfully
- **Committed in:** `4c1e104` (Task 3 commit)

**2. [Rule 3 - Blocking] Used pip3 fonttools instead of @web-alchemy/fonttools**
- **Found during:** Task 2 (font subsetting step)
- **Issue:** `npx --package=@web-alchemy/fonttools -- pyftsubset` failed with a WASM runtime error (pyodide JS module initialization failure). The tool could not run in the Node.js environment.
- **Fix:** Installed `fonttools` and `brotli` via `pip3 install fonttools brotli`. The `pyftsubset` binary installed to `/Users/nestorsegura/Library/Python/3.9/bin/` and ran successfully.
- **Files modified:** None (no project files changed; pip3 installs are system-level)
- **Verification:** Both subset files created and verified smaller than originals
- **Committed in:** `0eef88a` (Task 2 commit, font files are the artifact)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for build to succeed. No scope creep.

## Sanity Content Note

During build, Sanity queries executed against the live production dataset. The build completed without errors — any pages lacking a matching Sanity document rendered the graceful "sections: 0" placeholder (with `console.warn` during build). No Sanity documents were found to be missing a `language` field during this execution; all queries ran without schema errors.

## Issues Encountered

None beyond the two auto-fixed deviations above.

## Next Phase Readiness

- `src/lib/sanity.ts` is ready for Phase 8's block rendering — `getPageWithFallback` returns `sections` array; Phase 8 iterates over it
- `getPostWithTranslations` is ready for Phase 9's locale switcher — returns `_translations` array with sibling slugs per locale
- `getAllPostSlugsForLocale` is ready for Phase 8's `getStaticPaths` in the blog route
- BaseLayout is the shared shell — Phase 8 blocks render inside `<slot />`

---
*Phase: 07-i18n-and-content-layer*
*Completed: 2026-04-13*

## Self-Check: PASSED
