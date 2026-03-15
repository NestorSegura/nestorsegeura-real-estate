---
phase: 02-cms-and-page-builder
plan: 01
subsystem: cms
tags: [sanity, document-internationalization, i18n, studio, presentation-tool, draft-mode, singleton]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Sanity v4 + next-sanity v11 installed, src/sanity/config.ts with structureTool, src/sanity/schemas/index.ts empty array, sanityFetch<T> wrapper
provides:
  - Page document schema with i18n language field and sections array (page builder ready)
  - Post document schema with i18n language field and orderings
  - SiteSettings singleton schema with navigation and footer social links
  - @sanity/document-internationalization@3.3.3 plugin configured with es/de/en
  - SiteSettings singleton enforcement via action and template filters
  - Presentation tool configured with draft mode enable/disable endpoints
  - Structure tool with SiteSettings pinned at top of content list
  - /api/draft-mode/enable and /api/draft-mode/disable routes
affects:
  - 02-cms-and-page-builder (Plan 02 populates sections array with block types)
  - 03-frontend (page/post queries, SiteSettings queries, draft mode reads)
  - 04-integrations (SiteSettings.defaultCtaHref used by CTA blocks)

# Tech tracking
tech-stack:
  added: ["@sanity/document-internationalization@3.3.3"]
  patterns:
    - "Singleton enforcement: singletonActions Set + singletonTypes Set filters in document.actions and schema.templates"
    - "i18n plugin: language field (readOnly, hidden) added to page and post — NOT siteSettings"
    - "Draft mode: defineEnableDraftMode from next-sanity/draft-mode for enable route"

key-files:
  created:
    - src/sanity/schemas/documents/page.ts
    - src/sanity/schemas/documents/post.ts
    - src/sanity/schemas/documents/siteSettings.ts
    - src/app/api/draft-mode/enable/route.ts
    - src/app/api/draft-mode/disable/route.ts
  modified:
    - src/sanity/schemas/index.ts
    - src/sanity/config.ts
    - package.json

key-decisions:
  - "Use @sanity/document-internationalization@3.3.3 (not 5.x/6.x) — latest versions require React 19.2 but project has React 19.1"
  - "Spanish (es) is first in supportedLanguages — source language per user decision"
  - "siteSettings is NOT in i18n schemaTypes — it is a global singleton, one document for all locales"
  - "sections array left empty (of: []) — Plan 02 will add defineArrayMember block references"
  - "defaultCtaHref is a url type on SiteSettings — global booking URL that individual blocks can override"

patterns-established:
  - "Singleton pattern: define singletonTypes Set, filter document.actions and schema.templates"
  - "i18n documents: add language field (string, readOnly, hidden) — plugin manages values automatically"
  - "Draft mode enable uses defineEnableDraftMode helper from next-sanity/draft-mode"

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 2 Plan 1: Document Schemas and Studio Config Summary

**Three Sanity document schemas (Page, Post, SiteSettings) with @sanity/document-internationalization@3.3.3 plugin, singleton enforcement, Presentation tool, and draft mode API routes**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T18:20:13Z
- **Completed:** 2026-03-15T18:23:01Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Page, Post, and SiteSettings document schemas defined and registered in Studio
- document-internationalization plugin configured with es (source), de, en languages applied to page and post
- SiteSettings singleton enforced — cannot be duplicated or have "new document" templates
- Presentation tool configured with draft mode enable/disable endpoints at /api/draft-mode/*
- Structure tool shows SiteSettings pinned at top, all other document types listed below

## Task Commits

Each task was committed atomically:

1. **Task 1: Install i18n plugin and create document schemas** - `bbfb2f9` (feat)
2. **Task 2: Configure Studio with i18n, singleton enforcement, Presentation tool** - `5e1fc9a` (feat)

## Files Created/Modified
- `src/sanity/schemas/documents/page.ts` - Page document with language, title, slug, seo, sections (empty array)
- `src/sanity/schemas/documents/post.ts` - Post document with language, title, slug, publishedAt, mainImage, excerpt, body, author, seo, orderings
- `src/sanity/schemas/documents/siteSettings.ts` - SiteSettings singleton with siteName, tagline, defaultCtaHref, navigation, footer.socialLinks
- `src/sanity/schemas/index.ts` - Registers all three schema types
- `src/sanity/config.ts` - Full Studio config with i18n plugin, structureTool (custom structure), presentationTool, singleton enforcement
- `src/app/api/draft-mode/enable/route.ts` - Enable draft mode via next-sanity/draft-mode
- `src/app/api/draft-mode/disable/route.ts` - Disable draft mode and redirect to /
- `package.json` - Added @sanity/document-internationalization@3.3.3

## Decisions Made
- **@sanity/document-internationalization version pinned to 3.3.3**: v5+ and v6+ require React 19.2 (peer dependency); project has React 19.1. Version 3.3.3 supports React ^18 || ^19 and Sanity ^3.40 || ^4.
- **Spanish is first in supportedLanguages**: es is the source language per Phase 1 decision; ordering matters for default selection in Studio.
- **siteSettings excluded from i18n**: It is a global singleton — one document serves all locales.
- **sections array starts empty**: Plan 02 will populate with defineArrayMember block types. The field exists so the page builder is wired up.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pinned @sanity/document-internationalization to 3.3.3 instead of latest**
- **Found during:** Task 1 (npm install)
- **Issue:** Latest version 6.0.1 requires `react@^19.2` as peer dependency; project has React 19.1. `npm install` failed with ERESOLVE.
- **Fix:** Installed `@sanity/document-internationalization@3.3.3` which supports `react@^18 || ^19` and `sanity@^3.40 || ^4`. Same API for the configuration we need.
- **Files modified:** package.json, package-lock.json
- **Verification:** npm install succeeded; TypeScript compiles; plugin registers correctly.
- **Committed in:** bbfb2f9 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Version pin resolves npm conflict without API changes. Plugin functionality (language field injection, i18n document management) is identical across v3.x–v5.x.

## Issues Encountered
None beyond the npm peer dependency version pin documented in deviations.

## User Setup Required
None - no external service configuration required beyond what was already set up in Phase 1.

## Next Phase Readiness
- Three document schemas registered — Plan 02 can now add block schemas to the `sections` array on Page
- i18n plugin active — creating Page or Post documents will show language selector
- SiteSettings singleton enforced — ready to author global site settings
- Draft mode routes exist — Presentation tool can enable/disable draft mode for live preview
- TypeScript compiles clean — no blocking issues for Phase 2 continuation

---
*Phase: 02-cms-and-page-builder*
*Completed: 2026-03-15*

## Self-Check: PASSED
