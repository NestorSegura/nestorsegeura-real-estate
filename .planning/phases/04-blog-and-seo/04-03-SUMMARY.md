---
phase: 04-blog-and-seo
plan: "03"
subsystem: seo
tags: [next.js, metadata, json-ld, sitemap, robots, open-graph, next-intl, sanity]

# Dependency graph
requires:
  - phase: 04-02
    provides: Blog listing and post detail pages that receive generateMetadata
  - phase: 04-01
    provides: Sanity blog schema with SITE_SETTINGS_SEO_QUERY and ALL_POSTS_FOR_SITEMAP_QUERY
  - phase: 01-02
    provides: next-intl routing with localePrefix as-needed and getPathname

provides:
  - generateMetadata on locale layout pulling siteSettings from Sanity
  - Person and ProfessionalService JSON-LD structured data on homepage
  - JsonLd reusable component at src/components/seo/JsonLd.tsx
  - robots.ts blocking /studio and /api, referencing sitemap
  - sitemap.ts with hreflang alternates for all 3 locales (de/en/es) and all published posts
  - generateMetadata with OG image on blog listing and blog post pages

affects:
  - 04-04
  - 05-lead-capture

# Tech tracking
tech-stack:
  added: []
  patterns:
    - generateMetadata async function pattern for all locale pages
    - JsonLd component for declarative JSON-LD injection
    - client.fetch for build-time sitemap generation (not sanityFetch)
    - buildAlternates helper using getPathname for locale-aware hreflang

key-files:
  created:
    - src/components/seo/JsonLd.tsx
    - src/app/robots.ts
    - src/app/sitemap.ts
  modified:
    - src/app/[locale]/layout.tsx
    - src/app/[locale]/page.tsx
    - src/app/[locale]/blog/page.tsx
    - src/app/[locale]/blog/[slug]/page.tsx

key-decisions:
  - "JsonLd component uses dangerouslySetInnerHTML — acceptable for serialized JSON, no user input injected"
  - "sitemap.ts uses client.fetch not sanityFetch — sitemap is build-time, not runtime live data"
  - "getPathname from @/i18n/navigation handles localePrefix: as-needed — no manual prefix logic needed"
  - "Blog post inline script tag refactored to use JsonLd component for consistency"

patterns-established:
  - "generateMetadata pattern: async function accepting params: Promise<{ locale }>, awaiting it, fetching from Sanity"
  - "OG image fallback: urlFor(sanityImage).width(1200).height(630).url() or /og-default.png"
  - "Hreflang alternates: hardcoded de/en/es URLs for static pages, getPathname for sitemap"

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 4 Plan 03: SEO Metadata Summary

**generateMetadata on all locale pages pulling from Sanity siteSettings, Person + ProfessionalService JSON-LD on homepage, locale-aware sitemap.xml with hreflang, and robots.txt blocking /studio and /api**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T21:26:47Z
- **Completed:** 2026-03-15T21:30:32Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Replace static metadata export in locale layout with `generateMetadata` fetching Sanity siteSettings for title template, description, and OG image
- Add Person and ProfessionalService JSON-LD structured data to homepage using reusable `JsonLd` component
- Create `robots.ts` disallowing `/studio` and `/api` (no trailing slash) and referencing sitemap
- Create `sitemap.ts` with locale-aware entries for homepage, /analyse, /blog, and all published posts with hreflang alternates via `getPathname`
- Add `generateMetadata` with OG tags to blog listing and blog post pages; refactor inline `<script>` to `JsonLd` component

## Task Commits

Each task was committed atomically:

1. **Task 1: generateMetadata, JsonLd component, and structured data** - `889ea96` (feat)
2. **Task 2: robots.ts, sitemap.ts, blog generateMetadata, JsonLd refactor** - `eb15cbe` (feat)

## Files Created/Modified
- `src/components/seo/JsonLd.tsx` - Reusable JSON-LD injection component
- `src/app/robots.ts` - robots.txt: disallow /studio and /api, sitemap reference
- `src/app/sitemap.ts` - Dynamic sitemap with hreflang alternates for de/en/es
- `src/app/[locale]/layout.tsx` - Replaced static metadata with generateMetadata fetching Sanity siteSettings
- `src/app/[locale]/page.tsx` - Added generateMetadata + Person and ProfessionalService JSON-LD
- `src/app/[locale]/blog/page.tsx` - Added generateMetadata with hreflang alternates
- `src/app/[locale]/blog/[slug]/page.tsx` - Added generateMetadata with OG article tags; refactored to JsonLd component

## Decisions Made
- Used `client.fetch` (not `sanityFetch`) in `sitemap.ts` — sitemap is build-time generation, not a live runtime route
- `getPathname` from `@/i18n/navigation` used in sitemap for locale-aware URL generation — handles `localePrefix: 'as-needed'` correctly without manual prefix logic
- `JsonLd` component refactored from inline `<script>` tag in blog post page — ensures consistent pattern across all pages
- `/og-default.png` referenced in code as fallback; actual image left for user to place in `/public`

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
- TypeScript error in first `sitemap.ts` attempt: complex cast of `slugHref` to `Parameters<typeof getPathname>[0]['href']` union type caused type mismatch when passed to `buildAlternates(string)`. Fixed by simplifying — since `getPathname` accepts `string` href when `AppPathnames` is unconfigured, no cast needed. Both function parameter and call sites use plain `string`.

## User Setup Required
- Place a `1200x630` image at `public/og-default.png` to serve as fallback OG image for pages without a Sanity-hosted image (layout, homepage without seo.ogImage set, blog listing page)

## Next Phase Readiness
- SEO foundation complete: sitemap, robots, structured data, generateMetadata on all pages
- Plan 04-04 (final SEO plan) can proceed — all prerequisite routes and metadata infrastructure in place
- No blockers for Phase 5

---
*Phase: 04-blog-and-seo*
*Completed: 2026-03-15*

## Self-Check: PASSED
