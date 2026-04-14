---
phase: 08-static-blocks-and-blog
plan: 03
subsystem: ui
tags: [astro, portable-text, sanity, shiki, blog, i18n, tailwind-v4, typescript]

# Dependency graph
requires:
  - phase: 08-01
    provides: "extractToc()/slugifyHeading() in tocFromPT.ts, readingTime(), urlFor(), getFullPostForLocale(), getAllPostsForLocale(), getAllPostSlugsForLocale(), blockContent custom marks (callout/highlight)"
  - phase: 07-i18n-and-content-layer
    provides: "BaseLayout.astro, Locale type, useTranslations(), i18n message files"
provides:
  - "PTRenderer.astro: astro-portabletext wrapper with custom components map (5 components)"
  - "PTImage.astro: inline image with webp srcset (640/960/1280)"
  - "PTCode.astro: Shiki code blocks (github-dark-dimmed theme, zero runtime JS)"
  - "PTCallout.astro: info/warning/tip callout marks with primary-50/yellow/green backgrounds"
  - "PTHighlight.astro: <mark> with primary-200 or yellow-200 highlight marks"
  - "PTHeading.astro: h2/h3 with anchor IDs via shared slugifyHeading() from tocFromPT.ts"
  - "PostCard.astro: blog card with thumbnail, category label, line-clamp excerpt, hover lift"
  - "FeaturedPost.astro: 2-col lg hero with 16:9 image + content right"
  - "BlogTOC.astro: sticky right-hand TOC nav (lg+), hides when items < 2"
  - "BlogPagination.astro: prev/next pagination with page counter"
  - "6 paginated blog index routes: /blog, /en/blog, /es/blog (page size 10, featured on page 1)"
  - "6 blog post detail routes: /blog/[slug], /en/blog/[slug], /es/blog/[slug]"
  - "i18n keys: blog.toc.title (de/en/es), blog.empty (de/en/es)"
affects:
  - "08-04 (SEO): post detail pages have title/description/og ready for meta injection"

# Tech tracking
tech-stack:
  added:
    - "astro-portabletext@0.12.0 (downgraded from 0.13.0 — see deviations)"
  patterns:
    - "Portable Text renderer: astro-portabletext PortableText component + components map object passed as prop"
    - "TOC anchor sync: slugifyHeading() exported from src/lib/tocFromPT.ts and imported in PTHeading.astro — single source of truth for anchor IDs"
    - "Paginated blog index: [...page].astro rest param so page 1 resolves to /blog not /blog/1"
    - "Featured post pattern: isFirstPage && page.data[0] promoted to FeaturedPost hero; rest go to grid"
    - "getStaticPaths locale: locale literal hardcoded inside each route file (Astro hoisted scope prevents const access)"

key-files:
  created:
    - src/components/portabletext/PTRenderer.astro
    - src/components/portabletext/PTImage.astro
    - src/components/portabletext/PTCode.astro
    - src/components/portabletext/PTCallout.astro
    - src/components/portabletext/PTHighlight.astro
    - src/components/portabletext/PTHeading.astro
    - src/components/blog/PostCard.astro
    - src/components/blog/FeaturedPost.astro
    - src/components/blog/BlogTOC.astro
    - src/components/blog/BlogPagination.astro
    - src/pages/blog/[...page].astro
    - src/pages/blog/[slug].astro
    - src/pages/en/blog/[...page].astro
    - src/pages/en/blog/[slug].astro
    - src/pages/es/blog/[...page].astro
    - src/pages/es/blog/[slug].astro
  modified:
    - package.json
    - src/lib/tocFromPT.ts
    - src/i18n/messages/de.json
    - src/i18n/messages/en.json
    - src/i18n/messages/es.json

key-decisions:
  - "astro-portabletext pinned to 0.12.0 — 0.13.0 incompatible with Astro 6 (html: loader bug causes crash on sibling .astro imports)"
  - "slugifyHeading() extracted as named export from tocFromPT.ts and reused in PTHeading.astro to guarantee TOC anchor IDs match heading IDs"
  - "Blog pagination page size: 10 (within CONTEXT.md 9-12 range)"
  - "Shiki theme: github-dark-dimmed (code blocks rendered at build time, zero runtime JS)"
  - "TOC hides when items.length < 2 (no point showing a TOC for single-heading posts)"

patterns-established:
  - "Portable Text custom components: define components map in PTRenderer.astro, import individual .astro components per block/mark type"
  - "TOC anchor sync: single slugifyHeading() export shared between extractor and renderer"
  - "Paginated routes: use [...page].astro rest param, not [page].astro, to avoid /blog/1 on first page"
  - "Locale in getStaticPaths: hardcode literal string — Astro hoists getStaticPaths and outer const is not in scope"

# Metrics
duration: approx 45min
completed: 2026-04-14
---

# Phase 8 Plan 03: Blog Summary

**Paginated blog index + post detail pages for de/en/es with astro-portabletext 0.12.0, Shiki code highlighting, sticky TOC synced via shared slugifyHeading(), and 10 custom components**

## Performance

- **Duration:** approx 45 min
- **Started:** 2026-04-14
- **Completed:** 2026-04-14
- **Tasks:** 4 auto + 1 human-verify (checkpoint)
- **Files modified:** 21

## Accomplishments

- 6 paginated blog routes (3 locales × index + detail) generating static HTML via Astro paginate() and getStaticPaths
- Portable Text renderer (PTRenderer.astro) with 5 custom components: inline images with webp srcset, Shiki code blocks (zero JS), callout marks, highlight marks, anchor-linked headings
- Sticky TOC sidebar (lg+) with anchor IDs guaranteed to match heading IDs through shared slugifyHeading() helper; correctly hides when fewer than 2 items
- Verified live via Playwright: /es/blog/test-post renders header, body, and correct TOC hide behavior

## Task Commits

Each task was committed atomically:

1. **Task 1: Install astro-portabletext + build PTRenderer with 5 custom components** - `1c06d06` (feat)
2. **Task 2: Build 4 blog UI components + i18n keys** - `ad8a05c` (feat)
3. **Task 3: Paginated blog index for 3 locales** - `d3fc018` (feat)
4. **Task 4: Blog post detail with sticky TOC for 3 locales** - `5c029cd` (feat)
5. **Deviation fix: downgrade astro-portabletext** - `07aa3c8` (fix)

**Plan metadata:** _(this commit)_ (docs: complete blog plan)

## Files Created/Modified

- `src/components/portabletext/PTRenderer.astro` - PortableText wrapper; defines components map with 5 custom handlers
- `src/components/portabletext/PTImage.astro` - Inline image with webp srcset 640/960/1280 and optional figcaption
- `src/components/portabletext/PTCode.astro` - Shiki Code component (github-dark-dimmed theme, zero runtime JS)
- `src/components/portabletext/PTCallout.astro` - info/warning/tip callout mark with colored bordered backgrounds
- `src/components/portabletext/PTHighlight.astro` - `<mark>` with primary-200 or yellow-200 per variant
- `src/components/portabletext/PTHeading.astro` - h2/h3 with slug id using imported slugifyHeading()
- `src/components/blog/PostCard.astro` - Blog card with thumbnail, excerpt, author, hover lift
- `src/components/blog/FeaturedPost.astro` - 2-col lg hero layout with bg-brand-cream
- `src/components/blog/BlogTOC.astro` - Sticky right TOC nav; hidden lg:block; hides when items < 2
- `src/components/blog/BlogPagination.astro` - prev/next pagination with page N/total counter
- `src/pages/blog/[...page].astro` - DE paginated blog index (featured + grid, page size 10)
- `src/pages/blog/[slug].astro` - DE post detail (author, date, reading time, tags, PT body, TOC)
- `src/pages/en/blog/[...page].astro` - EN paginated blog index
- `src/pages/en/blog/[slug].astro` - EN post detail
- `src/pages/es/blog/[...page].astro` - ES paginated blog index
- `src/pages/es/blog/[slug].astro` - ES post detail
- `src/lib/tocFromPT.ts` - Added `slugifyHeading()` as named export (was inline)
- `package.json` - astro-portabletext@0.12.0 added
- `src/i18n/messages/de.json` - blog.toc.title ("Inhalt"), blog.empty ("Noch keine Artikel.")
- `src/i18n/messages/en.json` - blog.toc.title ("Contents"), blog.empty ("No posts yet.")
- `src/i18n/messages/es.json` - blog.toc.title ("Contenido"), blog.empty ("Aún no hay artículos.")

## Decisions Made

- **astro-portabletext@0.12.0:** Pinned to 0.12.0 rather than latest 0.13.0. The 0.13.0 release introduced a breaking change (html: loader) incompatible with Astro 6 — it crashes when a sibling .astro file is imported alongside an astro-portabletext component. The component API is identical between versions.
- **slugifyHeading() as shared export:** The plan explicitly recommended extracting this helper from tocFromPT.ts and reusing it in PTHeading.astro. This ensures TOC anchor links and heading IDs are computed identically, preventing broken in-page navigation.
- **Page size 10:** Within the 9-12 range specified in CONTEXT.md; chose 10 as a round number.
- **Shiki theme github-dark-dimmed:** Consistent with developer-facing aesthetics; renders at build time with no client JS shipped.
- **TOC hide threshold = 2:** A single heading does not warrant a navigation sidebar; hide renders the aside empty rather than showing a one-item list.
- **locale literal in getStaticPaths:** Astro hoists getStaticPaths out of the module scope; the `locale` const defined in the frontmatter body is not accessible inside it. Each of the 6 route files hardcodes the locale string literal inside both the getStaticPaths call and the getAllPostsForLocale/getAllPostSlugsForLocale call.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] astro-portabletext@0.13.0 incompatible with Astro 6**
- **Found during:** Task 1 (PTRenderer compilation)
- **Issue:** `npm install astro-portabletext@^0.13.0` succeeded but build crashed with an error in the html: loader when PTRenderer.astro was imported alongside sibling .astro components. Root cause: 0.13.0 changed internal loading behavior incompatible with Astro 6.
- **Fix:** Downgraded to `astro-portabletext@0.12.0` (component API unchanged — `PortableText`, `components` prop, `onMissingComponent` all identical).
- **Files modified:** package.json
- **Verification:** `npm run build` passes; PTRenderer renders correctly in all 6 routes.
- **Committed in:** `07aa3c8` (standalone fix commit after Task 4)

**2. [Rule 1 - Bug] `locale` const not accessible inside Astro's hoisted getStaticPaths**
- **Found during:** Task 3 (paginated blog index routes)
- **Issue:** Astro hoists `export const getStaticPaths` at compile time; the `locale` const declared in the same frontmatter block is not in scope inside getStaticPaths. Referencing it would cause a compile-time "locale is not defined" error.
- **Fix:** Hardcoded the locale string literal directly inside each route's getStaticPaths function (e.g., `getAllPostsForLocale('de')`). Applied consistently to all 6 route files.
- **Files modified:** All 6 route files
- **Verification:** Build succeeds; locale-specific content loads correctly per route.
- **Committed in:** `d3fc018` and `5c029cd` (part of Task 3 and Task 4 commits)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes required for correctness. No scope creep — no new features added. The slugifyHeading() extraction was planned in the task spec; it is documented as a pattern, not a deviation.

## Issues Encountered

- BlogTOC showed empty (0 items) during Playwright verification on the test post. This is correct behavior — the test post has no h2/h3 headings, so `items.length < 2` triggers the hide condition. TOC hides cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 6 blog routes ready; 08-04 (SEO) can inject `<meta>` tags into BaseLayout using the post.seo.title/description fields already fetched in each route's frontmatter.
- PTRenderer is generic — any future content type using portable text body can reuse it by importing and passing a `value` prop.
- No blockers for 08-04.

---
*Phase: 08-static-blocks-and-blog*
*Completed: 2026-04-14*

## Self-Check: PASSED
