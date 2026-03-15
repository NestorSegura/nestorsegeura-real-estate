---
phase: 02-cms-and-page-builder
plan: 02
subsystem: cms
tags: [sanity, typegen, page-builder, schema, groq, typescript]

# Dependency graph
requires:
  - phase: 02-01
    provides: Page document schema with empty sections array, Sanity Studio configured with document schemas
  - phase: 02-04
    provides: defineQuery from next-sanity for TypeGen compatibility, queries.ts with GROQ definitions
provides:
  - Eight page builder block schemas as registered Sanity object types
  - Page.sections array wired with all 8 block types
  - sanity.config.ts root re-export enabling Sanity CLI schema extraction
  - TypeGen-generated src/types/sanity.types.ts with 25 schema types and 5 GROQ query results
affects: [03-frontend-pages, 04-components, phase3, phase4]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Block schemas defined as separate files with defineType({ type: 'object' }) — NOT inline in page array, required for TypeGen"
    - "Root sanity.config.ts re-exports from src/sanity/config.ts — enables Sanity CLI while keeping config colocated"
    - "GROQ coalesce() function instead of ?? operator for TypeGen compatibility"
    - "All blocks share enabled/colorScheme/spacing style fields in 'style' field group"
    - "content+style field groups on every block, content is default"

key-files:
  created:
    - src/sanity/schemas/blocks/heroSection.ts
    - src/sanity/schemas/blocks/featureStrip.ts
    - src/sanity/schemas/blocks/testimonialsBlock.ts
    - src/sanity/schemas/blocks/ctaBlock.ts
    - src/sanity/schemas/blocks/problemSolutionBlock.ts
    - src/sanity/schemas/blocks/servicesBlock.ts
    - src/sanity/schemas/blocks/faqBlock.ts
    - src/sanity/schemas/blocks/referencesBlock.ts
    - sanity.config.ts
    - src/types/sanity.types.ts
    - schema.json
  modified:
    - src/sanity/schemas/index.ts
    - src/sanity/schemas/documents/page.ts
    - src/sanity/lib/queries.ts

key-decisions:
  - "Root sanity.config.ts re-export required: Sanity CLI only finds sanity.config.(js|ts) at project root, not src/sanity/config.ts"
  - "GROQ ?? operator not supported by TypeGen parser — rewrote to coalesce() function which TypeGen handles correctly"
  - "Block schemas must be in schemaTypes (not just referenced by page.sections) for TypeGen to generate typed interfaces"

patterns-established:
  - "Block schema pattern: defineType object with content+style groups, enabled/colorScheme/spacing in style group"
  - "TypeGen workflow: sanity schema extract → sanity typegen generate → src/types/sanity.types.ts"
  - "Array validation: defineArrayMember with min/max on array field validation rule"

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 02 Plan 02: Page Builder Block Schemas Summary

**Eight Sanity object block schemas with TypeGen-generated typed interfaces — heroSection, featureStrip, testimonialsBlock, ctaBlock, problemSolutionBlock, servicesBlock, faqBlock, referencesBlock all wired into Page.sections**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T18:26:39Z
- **Completed:** 2026-03-15T18:30:24Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Eight block schemas defined as standalone registered object types, each with enabled/colorScheme/spacing style fields and content+style field groups
- Page.sections array wired with all 8 block types via defineArrayMember references
- TypeGen ran successfully producing typed interfaces for 25 schema types and 5 GROQ query results in src/types/sanity.types.ts
- Fixed GROQ query syntax issue (Rule 1) enabling all 5 queries to produce typed results

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all eight block schemas** - `2e3f3e7` (feat)
2. **Task 2: Register blocks in schemaTypes, wire Page sections, and run TypeGen** - `c5ce2bb` (feat)

**Plan metadata:** (see final commit below)

## Files Created/Modified

- `src/sanity/schemas/blocks/heroSection.ts` - Hero block with variant (svgPath/backgroundImage/textOnly), dark colorScheme default
- `src/sanity/schemas/blocks/featureStrip.ts` - Feature strip with 3-6 features array
- `src/sanity/schemas/blocks/testimonialsBlock.ts` - Testimonials with 2-6 items
- `src/sanity/schemas/blocks/ctaBlock.ts` - CTA block with primary/secondary variant
- `src/sanity/schemas/blocks/problemSolutionBlock.ts` - Problem/solution with 3-5 items
- `src/sanity/schemas/blocks/servicesBlock.ts` - Services with 2-4 items including features array
- `src/sanity/schemas/blocks/faqBlock.ts` - FAQ with 4-10 question/answer pairs
- `src/sanity/schemas/blocks/referencesBlock.ts` - References with 3-8 items
- `sanity.config.ts` - Root-level re-export for Sanity CLI schema extraction
- `src/types/sanity.types.ts` - TypeGen output: 25 schema types + 5 query result types
- `schema.json` - Extracted schema artifact for TypeGen
- `src/sanity/schemas/index.ts` - Updated with all 8 block imports and registrations (11 types total)
- `src/sanity/schemas/documents/page.ts` - sections.of wired with all 8 block types
- `src/sanity/lib/queries.ts` - Fixed GROQ coalesce syntax for TypeGen compatibility

## Decisions Made

- **Root sanity.config.ts re-export:** The Sanity CLI only resolves `sanity.config.(js|ts)` at the project root. Since the actual config lives at `src/sanity/config.ts` (colocated with schemas), a root re-export was needed. This is the standard pattern for Next.js + Sanity colocated setups.
- **GROQ coalesce() vs ?? operator:** TypeGen's GROQ parser does not support the `??` null-coalescing operator. Rewrote both slug queries to use `coalesce()` function which TypeGen handles correctly. Runtime behavior is identical.
- **Block schemas in schemaTypes (not inline):** TypeGen only generates interfaces for types registered in `schemaTypes`. Block schemas must be imported and registered there, not just referenced by `page.sections`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added root sanity.config.ts re-export for Sanity CLI**
- **Found during:** Task 2 (schema extraction)
- **Issue:** `npx sanity schema extract` failed with "Failed to resolve sanity.config.(js|ts)" because actual config is at `src/sanity/config.ts`
- **Fix:** Created `sanity.config.ts` at project root that re-exports the default from `./src/sanity/config`
- **Files modified:** sanity.config.ts (created)
- **Verification:** Schema extraction succeeded after adding this file
- **Committed in:** c5ce2bb (Task 2 commit)

**2. [Rule 1 - Bug] Fixed GROQ ?? operator incompatibility with TypeGen parser**
- **Found during:** Task 2 (TypeGen generation)
- **Issue:** TypeGen produced "Syntax error in GROQ query at position 71: Unexpected end of query" for PAGE_BY_SLUG_QUERY and POST_BY_SLUG_QUERY using `??` coalesce operator
- **Fix:** Rewrote queries to use `coalesce(expr1, expr2)` function which TypeGen's GROQ parser handles correctly
- **Files modified:** src/sanity/lib/queries.ts
- **Verification:** TypeGen now generates all 5 query result types without errors
- **Committed in:** c5ce2bb (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for correct TypeGen operation. No scope creep. Behavior is identical.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required for this plan.

## Next Phase Readiness

- All block schemas are defined and typed — Phase 3 frontend components can import types from `src/types/sanity.types.ts`
- TypeGen workflow established: run `npx sanity schema extract && npx sanity typegen generate` after schema changes
- Page builder fully functional in Studio: editors can add any of the 8 block types to Page.sections
- schema.json artifact generated and committed — TypeGen can re-run without credentials

---
*Phase: 02-cms-and-page-builder*
*Completed: 2026-03-15*

## Self-Check: PASSED
