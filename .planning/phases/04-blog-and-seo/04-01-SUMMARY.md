---
phase: 04-blog-and-seo
plan: 01
subsystem: cms
tags: [sanity, typegen, groq, image-url, portabletext, blog, seo]

# Dependency graph
requires:
  - phase: 02-cms-and-page-builder
    provides: Sanity schemas, TypeGen workflow, defineQuery pattern, next-sanity live setup

provides:
  - Author document type (name, bio, image)
  - Post schema with reference author, category (tipps/fallstudien), tags, body images
  - SiteSettings seo object (title, description, ogImage)
  - urlFor image URL builder from @sanity/image-url
  - GROQ queries: ALL_POSTS_QUERY, POST_BY_SLUG_QUERY (updated), SITE_SETTINGS_SEO_QUERY, ALL_POSTS_FOR_SITEMAP_QUERY
  - extractHeadings utility for blog TOC generation
  - Regenerated TypeGen types (26 schema types, 7 GROQ queries)

affects:
  - 04-02-blog-pages
  - 04-03-seo-metadata
  - 04-04-sitemap

# Tech tracking
tech-stack:
  added:
    - "@sanity/image-url (already in package.json, now actively used)"
    - "@portabletext/react (already in package.json, now actively used)"
  patterns:
    - "GROQ pt::text() for server-side reading time: round(length(pt::text(body)) / 5 / 180)"
    - "Author dereference in GROQ: author->{ name, bio, image }"
    - "SanityImageSource from @sanity/image-url (not subpath import)"
    - "PortableTextBlock type from @portabletext/react for blog utilities"

key-files:
  created:
    - src/sanity/schemas/documents/author.ts
    - src/sanity/lib/image.ts
    - src/lib/blog.ts
  modified:
    - src/sanity/schemas/documents/post.ts
    - src/sanity/schemas/documents/siteSettings.ts
    - src/sanity/schemas/index.ts
    - src/sanity/lib/queries.ts
    - src/types/sanity.types.ts

key-decisions:
  - "SanityImageSource imported from @sanity/image-url (not subpath @sanity/image-url/lib/types/types — path doesn't exist in this package version)"
  - "Author is locale-neutral — not added to documentInternationalization schemaTypes"
  - "Reading time computed in GROQ via pt::text(), not in JavaScript"

patterns-established:
  - "urlFor pattern: import urlFor from @/sanity/lib/image, call urlFor(source).url() or chain methods"
  - "Blog TOC: extractHeadings(blocks) returns TocItem[] with id, text, level for client-side rendering"

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 4 Plan 1: Blog and SEO Foundation Summary

**Sanity author schema + post category/tags/reference-author + siteSettings SEO object + urlFor builder + GROQ blog/sitemap queries + extractHeadings utility, all TypeGen-typed**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T21:12:22Z
- **Completed:** 2026-03-15T21:15:30Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Created Author document type and registered it in schemaTypes (locale-neutral, no i18n)
- Updated Post schema: author reference replaces string, category radio (tipps/fallstudien), tags array, body images with alt/caption
- Added SEO object to SiteSettings with title, description, ogImage
- Created urlFor image builder and all blog-facing GROQ queries including estimatedReadingTime via pt::text()
- Regenerated TypeGen types: 26 schema types, 7 GROQ queries fully typed

## Task Commits

Each task was committed atomically:

1. **Task 1: Create author schema, update post and siteSettings schemas, run TypeGen** - `6d55d08` (feat)
2. **Task 2: Install dependencies, create image URL builder, extend GROQ queries, create blog utilities** - `6aa4496` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/sanity/schemas/documents/author.ts` - New Author document type (name, bio, image with hotspot, preview)
- `src/sanity/schemas/documents/post.ts` - Updated: author reference, category, tags, body images
- `src/sanity/schemas/documents/siteSettings.ts` - Added seo object field (title, description, ogImage)
- `src/sanity/schemas/index.ts` - Registered authorType
- `src/sanity/lib/image.ts` - urlFor builder using @sanity/image-url
- `src/sanity/lib/queries.ts` - Updated blog queries + SITE_SETTINGS_SEO_QUERY + ALL_POSTS_FOR_SITEMAP_QUERY
- `src/lib/blog.ts` - extractHeadings(PortableTextBlock[]) returning TocItem[]
- `src/types/sanity.types.ts` - Regenerated TypeGen types

## Decisions Made

- `SanityImageSource` imported from `@sanity/image-url` directly — the subpath `@sanity/image-url/lib/types/types` does not exist in the installed package version
- Author is locale-neutral and not added to `documentInternationalization` schemaTypes
- Reading time computed in GROQ server-side (`pt::text()`) rather than in JavaScript client-side

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed SanityImageSource import path**

- **Found during:** Task 2 (create image URL builder)
- **Issue:** Plan specified importing `SanityImageSource` from `@sanity/image-url/lib/types/types` but that subpath does not exist in the installed package — `tsc --noEmit` reported TS2307
- **Fix:** Import from `@sanity/image-url` directly (the type is exported at the package root)
- **Files modified:** `src/sanity/lib/image.ts`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `6aa4496` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Import path correction only. No scope creep, no behavior change.

## Issues Encountered

None beyond the import path deviation above, which was auto-fixed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All schema types, queries, and utilities downstream plans depend on are in place
- Blog pages (04-02) can import `ALL_POSTS_QUERY`, `POST_BY_SLUG_QUERY`, `urlFor`, `extractHeadings`
- SEO metadata (04-03) can import `SITE_SETTINGS_SEO_QUERY` and `urlFor`
- Sitemap (04-04) can import `ALL_POSTS_FOR_SITEMAP_QUERY`
- TypeGen types are current — downstream code gets full type safety

---
*Phase: 04-blog-and-seo*
*Completed: 2026-03-15*

## Self-Check: PASSED
