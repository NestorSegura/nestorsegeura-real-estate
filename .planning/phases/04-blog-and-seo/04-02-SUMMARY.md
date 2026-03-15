---
phase: 04-blog-and-seo
plan: 02
subsystem: ui
tags: [sanity, portabletext, next-intl, blog, seo, json-ld, intersection-observer, tailwind]

# Dependency graph
requires:
  - phase: 04-blog-and-seo
    plan: 01
    provides: ALL_POSTS_QUERY, POST_BY_SLUG_QUERY, ALL_POSTS_FOR_SITEMAP_QUERY, urlFor, extractHeadings, TocItem

provides:
  - Blog listing route at /[locale]/blog (featured hero + 3-col card grid)
  - Blog post detail route at /[locale]/blog/[slug] (article + sticky sidebar)
  - PortableTextRenderer with custom h2/h3/blockquote/image/link/marks renderers
  - TableOfContents client component with IntersectionObserver active heading tracking
  - AuthorCard server component with avatar, name, bio
  - Article JSON-LD structured data (headline, author, datePublished, dateModified, image)
  - generateStaticParams using client.fetch for build-time static generation

affects:
  - 04-03-seo-metadata (blog post page exists to add per-page metadata to)
  - 04-04-sitemap (blog post routes now exist, sitemap can reference them)

# Tech tracking
tech-stack:
  added:
    - "@portabletext/react (now actively used in PortableTextRenderer)"
  patterns:
    - "PortableText custom components: types.image, block.h2/h3/blockquote/normal, list, listItem, marks.link"
    - "Heading IDs: h2-{_key} / h3-{_key} format shared between PortableTextRenderer and extractHeadings"
    - "Client/server split for TOC: PortableTextRenderer (server) writes IDs, TableOfContents (client) reads them via IntersectionObserver"
    - "generateStaticParams uses client.fetch (not sanityFetch) for build-time data fetching"
    - "Article JSON-LD: inline <script type=application/ld+json> dangerouslySetInnerHTML in page component"
    - "as unknown as PortableTextBlock[] cast for TypeGen body type to PortableText library type"

key-files:
  created:
    - src/app/[locale]/blog/page.tsx
    - src/app/[locale]/blog/[slug]/page.tsx
    - src/components/blog/BlogListing.tsx
    - src/components/blog/PostCard.tsx
    - src/components/blog/FeaturedPostCard.tsx
    - src/components/blog/PortableTextRenderer.tsx
    - src/components/blog/TableOfContents.tsx
    - src/components/blog/AuthorCard.tsx
  modified: []

key-decisions:
  - "No @tailwindcss/typography — manual typography classes used in PortableTextRenderer (prose plugin not installed)"
  - "Body type cast as unknown as PortableTextBlock[] — TypeGen body type and @portabletext/react PortableTextBlock are structurally incompatible at the children array level (children?: vs children:), cast is safe since the runtime shape is compatible"
  - "Layout main wraps <article> not the other way — locale layout wraps content in <main>, blog post page uses <main> directly for proper semantic hierarchy"

patterns-established:
  - "Blog image sizing: FeaturedPostCard uses width=1200/height=675 (aspect-video), PostCard uses 600/338, AuthorCard uses 64/64"
  - "Sidebar sticky pattern: lg:sticky lg:top-24 lg:self-start space-y-6 on <aside>"
  - "scroll-mt-24 on h2/h3 headings ensures content is not hidden under sticky navbar after TOC scroll"

# Metrics
duration: 3min
completed: 2026-03-15
---

# Phase 4 Plan 2: Blog Pages Summary

**Sanity-powered blog listing (featured hero + card grid) and post detail (portable text + sticky TOC sidebar + Article JSON-LD) with locale-aware routing across de/en/es**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-15T21:19:51Z
- **Completed:** 2026-03-15T21:23:03Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Blog listing page at `/[locale]/blog` — fetches ALL_POSTS_QUERY by locale, renders first post as full-width hero (FeaturedPostCard) and remaining posts in responsive 3-column grid (PostCard)
- Blog post detail page at `/[locale]/blog/[slug]` — article with PortableText (custom h2/h3/blockquote/image renderers), sticky sidebar with auto-generated TOC, Cal.com CTA card, and AuthorCard
- Article JSON-LD structured data embedded inline as `<script type="application/ld+json">` with headline, author, datePublished, dateModified, and image
- generateStaticParams uses `client.fetch(ALL_POSTS_FOR_SITEMAP_QUERY)` (static client, not sanityFetch) for build-time route generation
- TableOfContents client component tracks active heading via IntersectionObserver, smooth-scrolls on link click, h3 items are visually indented

## Task Commits

Each task was committed atomically:

1. **Task 1: Blog listing page with featured post and card grid** - `aaedbdb` (feat)
2. **Task 2: Blog post detail page with portable text, TOC sidebar, and Article JSON-LD** - `f11bb27` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/[locale]/blog/page.tsx` — Blog listing route, sanityFetch ALL_POSTS_QUERY, locale validation
- `src/app/[locale]/blog/[slug]/page.tsx` — Blog post route, POST_BY_SLUG_QUERY, Article JSON-LD, generateStaticParams
- `src/components/blog/BlogListing.tsx` — Layout component: FeaturedPostCard + post grid
- `src/components/blog/FeaturedPostCard.tsx` — Hero card with large image, title, excerpt, date, reading time, category badge
- `src/components/blog/PostCard.tsx` — Grid card with aspect-video image, title (line-clamp-2 title), excerpt, date, reading time, category badge
- `src/components/blog/PortableTextRenderer.tsx` — PortableText with custom block/mark/list components, scroll-mt-24 on h2/h3
- `src/components/blog/TableOfContents.tsx` — Client component, IntersectionObserver active heading, smooth scroll on click
- `src/components/blog/AuthorCard.tsx` — Avatar (64x64), name, bio card with border

## Decisions Made

- `@tailwindcss/typography` not installed — used manual spacing/font-size/color Tailwind classes in PortableTextRenderer instead of `prose` utility classes
- `body` from TypeGen (`POST_BY_SLUG_QUERYResult`) cast via `as unknown as PortableTextBlock[]` to resolve structural incompatibility with `@portabletext/react` types at the `children` array level. Runtime shape is compatible; the incompatibility is TypeScript-only (TypeGen emits `children?: ...` optional, library expects required array)
- Appointment CTA in sidebar links directly to `https://cal.com/nestorsegura/erstgespraech` (consistent with Cal.com URL decision from Phase 3)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type incompatibility for extractHeadings body argument**

- **Found during:** Task 2 (blog post detail page)
- **Issue:** `post.body` from TypeGen has `children?: ...` (optional array) but `PortableTextBlock` from `@portabletext/react` requires `children: ...` (non-optional). TypeScript TS2345 error on `extractHeadings(post.body)` call.
- **Fix:** Cast via `(post.body ?? []) as unknown as PortableTextBlock[]`. The runtime shape is identical; TypeGen just emits more permissive optional types.
- **Files modified:** `src/app/[locale]/blog/[slug]/page.tsx`
- **Verification:** `npx tsc --noEmit` exits 0
- **Committed in:** `f11bb27` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 type bug)
**Impact on plan:** Type-only fix. No behavior change, no scope creep.

## Issues Encountered

None beyond the type cast deviation above, which was auto-fixed in-task.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Blog listing route `/[locale]/blog` and post route `/[locale]/blog/[slug]` are fully functional
- Article JSON-LD is embedded in each post page — SEO metadata plan (04-03) can add `<title>` / `<meta>` without collision
- generateStaticParams produces all locale/slug combinations for static generation
- Heading IDs (`h2-{_key}`, `h3-{_key}`) match between PortableTextRenderer output and extractHeadings — TOC links scroll correctly
- Sitemap plan (04-04) can import ALL_POSTS_FOR_SITEMAP_QUERY independently

---
*Phase: 04-blog-and-seo*
*Completed: 2026-03-15*

## Self-Check: PASSED
