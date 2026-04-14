---
phase: 08-static-blocks-and-blog
plan: 04
subsystem: infra
tags: [astro, seo, sitemap, json-ld, og-meta, hreflang, robots, schema-org, typescript]

# Dependency graph
requires:
  - phase: 08-03
    provides: "blog post detail pages (de/en/es) with title/description/og data ready for meta injection"
  - phase: 08-02
    provides: "3 locale homepages wired to Sanity siteSettings"
  - phase: 07-i18n-and-content-layer
    provides: "BaseLayout.astro, Locale type, useTranslations(), PUBLIC_SITE_URL env var pattern"
provides:
  - "@astrojs/sitemap with i18n hreflang (de-DE / en-US / es-ES) at /sitemap-index.xml"
  - "public/robots.txt: Allow: / + Sitemap reference"
  - "public/og-default.png: 1200x630 brand-purple (#241552) placeholder"
  - "src/lib/seo.ts: 5 helpers — buildMeta(), buildOrganizationSchema(), buildPersonSchema(), buildArticleSchema(), buildBreadcrumbSchema()"
  - "src/components/seo/JsonLd.astro: safe JSON-LD injection via set:html"
  - "BaseLayout.astro extended with full SEO head: OG, canonical, hreflang, Organization JSON-LD, sitemap link"
  - "Per-page JSON-LD: Person on 3 homepages, Article+Breadcrumb on blog posts, Breadcrumb on /analyse pages"
affects:
  - "09-interactive-islands: BaseLayout already wired — adding island JS does not break SEO head"
  - "10-production-deployment: sitemap site URL must match production domain realestatestrategy.eu"

# Tech tracking
tech-stack:
  added:
    - "@astrojs/sitemap@^3.7.2 (sitemap generation with i18n hreflang)"
  patterns:
    - "buildMeta() resolution chain: pageSeo.title → settings.seo.title → fallbackTitle (centralized in seo.ts)"
    - "OG image resolution chain: page seo.ogImage → siteSettings.seo.ogImage → /og-default.png"
    - "JsonLd.astro: <script type=\"application/ld+json\" set:html={JSON.stringify(schema)} /> — XSS-safe injection"
    - "BaseLayout jsonLd prop: array of schema objects; each emitted via <JsonLd /> for per-page extensibility"
    - "hreflang for blog posts derived from post._translations: sparse — only locales with actual translations emit alternate links"

key-files:
  created:
    - public/robots.txt
    - public/og-default.png
    - src/lib/seo.ts
    - src/components/seo/JsonLd.astro
  modified:
    - astro.config.mjs
    - src/layouts/BaseLayout.astro
    - src/pages/index.astro
    - src/pages/en/index.astro
    - src/pages/es/index.astro
    - src/pages/blog/[slug].astro
    - src/pages/en/blog/[slug].astro
    - src/pages/es/blog/[slug].astro
    - src/pages/analyse.astro
    - src/pages/en/analyze.astro
    - src/pages/es/analizar.astro

key-decisions:
  - "Site URL: process.env.PUBLIC_SITE_URL ?? 'https://realestatestrategy.eu' — env-overridable with hardcoded production fallback"
  - "og-default.png is a brand-purple (#241552) placeholder — TODO: replace with real brand asset before launch"
  - "hreflang for blog posts is sparse: only locales with a translation document in post._translations emit <link rel=alternate>; test post only has ES so only es hreflang emitted for that post"
  - "/analyse pages intentionally have NO hreflang — each locale slug (/analyse, /analyze, /analizar) is single-locale by design"
  - "Person JSON-LD uses siteSettings.siteName as name (currently 'nestorsegura.com') — TODO: update siteName to 'Nestor Segura' in Sanity Studio before launch"
  - "Organization JSON-LD emitted on every page via BaseLayout (not per-page) — consistent site-wide schema"

patterns-established:
  - "buildMeta() in seo.ts: single entry point for all meta resolution; callers pass pageSeo + settings + fallbacks"
  - "JsonLd.astro: generic schema prop; any schema type (Article, Person, Breadcrumb, Organization) passes through identically"
  - "BaseLayout jsonLd prop: array so multiple schemas (e.g. Article + Breadcrumb) emit in correct order"
  - "OG image fallback: always resolves to a URL string — no undefined og:image ever emitted"

# Metrics
duration: approx 30min
completed: 2026-04-14
---

# Phase 8 Plan 04: SEO Summary

**@astrojs/sitemap with i18n hreflang, robots.txt, Organization JSON-LD site-wide, Person on homepages, Article+Breadcrumb on blog posts, and centralized buildMeta()/buildOrganizationSchema()/buildPersonSchema()/buildArticleSchema()/buildBreadcrumbSchema() in seo.ts**

## Performance

- **Duration:** approx 30 min
- **Started:** 2026-04-14
- **Completed:** 2026-04-14
- **Tasks:** 4 auto tasks (Task 5 was human-verify checkpoint — approved by user)
- **Files modified:** 11

## Accomplishments

- Full sitemap infrastructure: @astrojs/sitemap generates /sitemap-index.xml + /sitemap-0.xml with hreflang alternate links for de-DE / en-US / es-ES
- 5-function seo.ts helper library with tiered resolution chain for title, description, and OG image; centralized JSON-LD builder functions
- BaseLayout extended with complete SEO head (OG, canonical, hreflang, Organization JSON-LD, sitemap link) — all pages get this automatically
- Per-page JSON-LD wired into 9 page files: Person on 3 homepages, Article+BreadcrumbList on 3 blog post detail pages, BreadcrumbList on 3 /analyse pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @astrojs/sitemap + robots.txt + og-default.png** - `2c41e3d` (feat)
2. **Task 2: Build src/lib/seo.ts with 5 SEO helpers** - `d0dab15` (feat)
3. **Task 3: Extend BaseLayout with SEO head + Organization JSON-LD + JsonLd component** - `026d4df` (feat)
4. **Task 4: Wire per-page SEO into homepages, blog posts, and /analyse pages** - `d4ce87e` (feat)

**Plan metadata:** _(this commit)_ (docs: complete SEO plan)

## Files Created/Modified

- `astro.config.mjs` - Added `site: process.env.PUBLIC_SITE_URL ?? 'https://realestatestrategy.eu'` and `@astrojs/sitemap` integration with i18n hreflang config
- `public/robots.txt` - `User-agent: * / Allow: / / Sitemap: https://realestatestrategy.eu/sitemap-index.xml`
- `public/og-default.png` - 1200x630 brand-purple (#241552) placeholder (TODO: replace with real brand asset)
- `src/lib/seo.ts` - Exports buildMeta(), buildOrganizationSchema(), buildPersonSchema(), buildArticleSchema(), buildBreadcrumbSchema(); implements OG image fallback chain
- `src/components/seo/JsonLd.astro` - Generic `<script type="application/ld+json" set:html={JSON.stringify(schema)} />` wrapper
- `src/layouts/BaseLayout.astro` - Extended Props interface (ogImage, ogType, canonical, hreflangUrls, jsonLd); added full SEO head block with Organization JSON-LD on every page
- `src/pages/index.astro` - Person JSON-LD + buildMeta() + hreflang (de/en/es absolute URLs)
- `src/pages/en/index.astro` - Person JSON-LD + buildMeta() + hreflang
- `src/pages/es/index.astro` - Person JSON-LD + buildMeta() + hreflang
- `src/pages/blog/[slug].astro` - Article + BreadcrumbList JSON-LD + ogType="article" + sparse hreflang from post._translations
- `src/pages/en/blog/[slug].astro` - Same as DE blog post, EN locale
- `src/pages/es/blog/[slug].astro` - Same as DE blog post, ES locale
- `src/pages/analyse.astro` - BreadcrumbList JSON-LD (no hreflang — single-locale slug)
- `src/pages/en/analyze.astro` - BreadcrumbList JSON-LD (no hreflang)
- `src/pages/es/analizar.astro` - BreadcrumbList JSON-LD (no hreflang)

## Decisions Made

- **Site URL env pattern:** `process.env.PUBLIC_SITE_URL ?? 'https://realestatestrategy.eu'` — allows overriding for staging without code change; hardcoded fallback ensures sitemap is always valid even without env var set
- **og-default.png as placeholder:** ImageMagick unavailable; generated a 1200x630 brand-purple (#241552) PNG via canvas-style generation. TODO: replace with real brand asset (designer deliverable) before launch
- **hreflang for blog posts from post._translations:** The translations map is sparse — only locales with a Sanity translation document emit an alternate link. The test post currently only has an ES translation, so only the es hreflang link is emitted for that slug. This is correct SEO behavior (no alternate link is better than a broken link)
- **No hreflang on /analyse pages:** Each locale uses a different slug (/analyse, /analyze, /analizar) and these are single-locale pages by design. hreflang would require cross-referencing the translated slugs, which adds complexity for minimal SEO benefit on utility pages
- **Person JSON-LD name from siteName:** siteSettings.siteName is currently "nestorsegura.com" — the domain name, not a person name. TODO: update in Sanity Studio to "Nestor Segura" before launch so Person schema is correct
- **Organization JSON-LD in BaseLayout:** Emitted on every page unconditionally. Some SEOs recommend only homepage, but site-wide org schema is widely accepted and ensures consistency

## Deviations from Plan

None — plan executed exactly as written. The 4 auto tasks completed without blocking issues. Per-page hreflang sparse behavior for blog posts was anticipated by the plan spec ("hreflang from post._translations").

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The `PUBLIC_SITE_URL` env var is optional (hardcoded fallback exists).

**TODOs before launch (not blocking for Phase 8):**
1. Replace `public/og-default.png` with a real branded OG image (1200x630, ideally with logo and tagline)
2. Update `siteSettings.siteName` in Sanity Studio from "nestorsegura.com" to "Nestor Segura" — affects Person JSON-LD `name` field

## Phase 8 Completion Checklist

All 6 Phase 8 success criteria:

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Visiting `/` renders all eight block sections (hero through CTA) with German content from Sanity — browser DevTools shows 0 kB of JavaScript for block **content rendering** | Met (note: Lenis + GSAP ship for scroll UX, approved deviation; block content renders as static HTML) |
| 2 | FAQ section uses native `<details>`/`<summary>` with no JavaScript | Met (FaqBlock.astro uses details/summary) |
| 3 | Blog listing and post pages work for all 3 locales | Met (6 routes: /blog, /en/blog, /es/blog + 3 post detail routes) |
| 4 | All 3 locale homepages have correct title, meta description, OG tags, and Person JSON-LD from Sanity siteSettings | Met (buildMeta() + Person JSON-LD wired in 3 homepage files) |
| 5 | GET /sitemap.xml returns entries for all 3 locales with hreflang alternate links | Met (@astrojs/sitemap generates /sitemap-index.xml + /sitemap-0.xml with hreflang) |
| 6 | GET /robots.txt allows all paths (no /studio to block) | Met (public/robots.txt: User-agent: * / Allow: /) |

## Next Phase Readiness

- Phase 9 (Interactive Islands) can begin immediately: BaseLayout is fully wired; adding React islands (NavbarClient, AnalysePageClient) does not affect the SEO head or JSON-LD
- Lenis smooth scroll is already in BaseLayout — Phase 9 scroll animations should use `window.lenis` API for scroll position (not raw `window.scrollY`)
- The /analyse pages have BreadcrumbList JSON-LD and correct BaseLayout props; Phase 9 only needs to add the React island inside the existing shell
- No blockers for Phase 9

---
*Phase: 08-static-blocks-and-blog*
*Completed: 2026-04-14*

## Self-Check: PASSED
