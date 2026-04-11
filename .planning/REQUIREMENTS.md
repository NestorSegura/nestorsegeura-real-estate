# Requirements: nestorsegura.com

**Defined:** 2026-04-11
**Core Value:** Real estate agents land on the site, immediately feel "this is for me," and book an appointment

## v1 Requirements (Milestone v1.0 — Complete)

### Foundation (FOUN)

- [x] **FOUN-01**: Next.js 15 App Router project with TypeScript strict mode, Tailwind v4, shadcn/ui
- [x] **FOUN-02**: src/ directory structure matching specified layout (app/, components/, sanity/, i18n/)
- [x] **FOUN-03**: next-intl v4 configured with 3 locales (en default, es, de), localePrefix 'as-needed'
- [x] **FOUN-04**: Middleware excludes /studio and /api routes from i18n processing
- [x] **FOUN-05**: All translation keys exist in en.json, es.json, and de.json
- [x] **FOUN-06**: Environment variables configured (.env.local template with all required vars)

### Sanity CMS (CMS)

- [x] **CMS-01**: Sanity Studio v3 embedded and accessible at /studio
- [x] **CMS-02**: Page document schema with Page Builder pattern (title, slug, seo, sections array)
- [x] **CMS-03**: Post document schema (title, slug, publishedAt, mainImage, excerpt, body, author, seo)
- [x] **CMS-04**: SiteSettings singleton schema (siteName, tagline i18n, navigation i18n, footer social links)
- [x] **CMS-05**: Sanity TypeGen configured for type-safe schema access
- [x] **CMS-06**: Sanity client with separate CDN (read) and non-CDN (revalidation) configurations
- [x] **CMS-07**: Internationalized fields using @sanity/document-internationalization plugin

### Page Builder Blocks (BLCK)

- [x] **BLCK-01**: heroSection block schema
- [x] **BLCK-02**: featureStrip block schema
- [x] **BLCK-03**: testimonialsBlock schema
- [x] **BLCK-04**: ctaBlock schema
- [x] **BLCK-05**: problemSolutionBlock schema
- [x] **BLCK-06**: servicesBlock schema
- [x] **BLCK-07**: faqBlock schema
- [x] **BLCK-08**: referencesBlock schema
- [x] **BLCK-09**: PageBuilder.tsx component mapping _type to React components
- [x] **BLCK-10**: All block components use minimal CSS animations

### Landing Page (LAND)

- [x] **LAND-01**: Homepage renders via PageBuilder with all block types functional
- [x] **LAND-02**: German (/de) page is the primary conversion page with full content
- [x] **LAND-03**: English (/) and Spanish (/es) pages render with translated content
- [x] **LAND-04**: Single clear CTA per screen section
- [x] **LAND-05**: Mobile-first responsive design across all breakpoints
- [x] **LAND-06**: Navigation bar with logo, menu items, and CTA button

### Blog (BLOG)

- [x] **BLOG-01**: Blog listing page at /[locale]/blog
- [x] **BLOG-02**: Blog post page at /[locale]/blog/[slug] with portable text
- [x] **BLOG-03**: Blog posts pulled from Sanity with locale-aware content

### Lead Generation (LEAD)

- [x] **LEAD-01**: /api/analyze POST endpoint with input validation
- [x] **LEAD-02**: Stub response returning mock scores
- [x] **LEAD-03**: CORS headers for same-origin only
- [x] **LEAD-04**: TODO comments for PageSpeed API integration
- [x] **LEAD-05**: Appointment booking CTAs throughout

### SEO (SEO)

- [x] **SEO-01**: generateMetadata() pulling from Sanity siteSettings
- [x] **SEO-02**: sitemap.ts with hreflang
- [x] **SEO-03**: robots.ts blocking /studio
- [x] **SEO-04**: OpenGraph tags with Sanity image URLs
- [x] **SEO-05**: Person JSON-LD structured data on homepage

### Operations (OPS)

- [x] **OPS-01**: /api/revalidate POST endpoint with HMAC verification
- [x] **OPS-02**: Revalidation via revalidateTag
- [x] **OPS-03**: next.config.ts with output: 'standalone'
- [x] **OPS-04**: deploy.sh script
- [x] **OPS-05**: ecosystem.config.js for PM2
- [x] **OPS-06**: npm run dev starts without errors
- [x] **OPS-07**: npm run build completes without errors

## v2 Requirements (Milestone v2.0 — Astro Migration)

### Infrastructure (INFR)

- [ ] **INFR-01**: Astro 6 project scaffolded with `@astrojs/cloudflare` adapter targeting Workers
- [ ] **INFR-02**: `wrangler.jsonc` configured with `nodejs_compat` flag and correct build settings
- [ ] **INFR-03**: `astro.config.mjs` with i18n config (defaultLocale: "de", prefixDefaultLocale: false)
- [ ] **INFR-04**: Sanity client configured via `@sanity/astro` with useCdn: false for build-time fetches
- [ ] **INFR-05**: Environment variables configured in Cloudflare Workers dashboard
- [ ] **INFR-06**: Sanity webhook triggers Cloudflare deploy hook on content publish
- [ ] **INFR-07**: Custom domain (nestorsegura.com) pointing to Cloudflare Workers
- [ ] **INFR-08**: Cloudflare Auto Minify for HTML disabled

### i18n (I18N)

- [ ] **I18N-01**: Built-in Astro i18n routing with de (no prefix), /en, /es
- [ ] **I18N-02**: `src/i18n/utils.ts` helper loading UI strings from messages/*.json
- [ ] **I18N-03**: Locale threaded as prop from page to layout to components (no runtime hooks)
- [ ] **I18N-04**: GROQ queries filter by language field for correct locale content

### Block Components (BLCK)

- [ ] **BLCK-11**: HeroSection as .astro component (zero JS)
- [ ] **BLCK-12**: FeatureStrip as .astro component (zero JS)
- [ ] **BLCK-13**: TestimonialsBlock as .astro component (zero JS)
- [ ] **BLCK-14**: CtaBlock as .astro component (zero JS)
- [ ] **BLCK-15**: ProblemSolutionBlock as .astro component (zero JS)
- [ ] **BLCK-16**: ServicesBlock as .astro component (zero JS)
- [ ] **BLCK-17**: FaqBlock as CSS-only details/summary (zero JS)
- [ ] **BLCK-18**: ReferencesBlock as .astro component (zero JS)
- [ ] **BLCK-19**: PageBuilder.astro dispatcher mapping _type to block components

### Interactive (INTR)

- [ ] **INTR-01**: NavbarClient as React island (client:load) with mobile drawer and locale switcher
- [ ] **INTR-02**: AnalysePageClient rewritten without next-intl hooks (locale + labels as props)
- [ ] **INTR-03**: /api/analyze POST endpoint as Cloudflare Worker function
- [ ] **INTR-04**: Scroll animations as vanilla JS script block (Intersection Observer)

### Blog (BLOG)

- [ ] **BLOG-04**: Blog listing page per locale using astro-portabletext
- [ ] **BLOG-05**: Blog post detail page with portable text, TOC sidebar
- [ ] **BLOG-06**: Blog routes use getStaticPaths with Sanity data

### SEO (SEO)

- [ ] **SEO-06**: @astrojs/sitemap with hreflang for all 3 locales
- [ ] **SEO-07**: robots.txt (Studio is external — no /studio to block)
- [ ] **SEO-08**: JSON-LD structured data (Person) on homepage
- [ ] **SEO-09**: OG meta tags on all pages from Sanity siteSettings
- [ ] **SEO-10**: title and meta description on all locale pages

### Design (DSGN)

- [ ] **DSGN-01**: Clash Display font for headings
- [ ] **DSGN-02**: Chivo font for body text
- [ ] **DSGN-03**: BaseLayout.astro with font loading and global styles

## Future Requirements

### Lead Generation (Paid)

- **LEAD-V2-01**: Actual PageSpeed Insights API integration
- **LEAD-V2-02**: Payment flow (€49) for detailed analysis report via Stripe
- **LEAD-V2-03**: Automated PDF report generation and delivery

### Marketing

- **MKTG-V2-01**: Email capture with DSGVO-compliant consent
- **MKTG-V2-02**: Newsletter integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sanity Studio in Astro project | Studio hosted externally at studio.nestorsegura.com |
| React for static blocks | .astro components ship zero JS — React only for interactive islands |
| ISR / tag-based revalidation | Not available in Astro on Cloudflare — deploy hook rebuilds are sufficient |
| PM2 / VPS deployment | Replaced by Cloudflare Workers |
| next-intl / middleware-based i18n | Replaced by Astro built-in i18n + simple utils |
| Sanity live preview / draft mode | Deferred — adds complexity, low value at current editorial cadence |
| Preact optimization | Deferred — optimize after migration is stable |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFR-01 | — | Pending |
| INFR-02 | — | Pending |
| INFR-03 | — | Pending |
| INFR-04 | — | Pending |
| INFR-05 | — | Pending |
| INFR-06 | — | Pending |
| INFR-07 | — | Pending |
| INFR-08 | — | Pending |
| I18N-01 | — | Pending |
| I18N-02 | — | Pending |
| I18N-03 | — | Pending |
| I18N-04 | — | Pending |
| BLCK-11 | — | Pending |
| BLCK-12 | — | Pending |
| BLCK-13 | — | Pending |
| BLCK-14 | — | Pending |
| BLCK-15 | — | Pending |
| BLCK-16 | — | Pending |
| BLCK-17 | — | Pending |
| BLCK-18 | — | Pending |
| BLCK-19 | — | Pending |
| INTR-01 | — | Pending |
| INTR-02 | — | Pending |
| INTR-03 | — | Pending |
| INTR-04 | — | Pending |
| BLOG-04 | — | Pending |
| BLOG-05 | — | Pending |
| BLOG-06 | — | Pending |
| SEO-06 | — | Pending |
| SEO-07 | — | Pending |
| SEO-08 | — | Pending |
| SEO-09 | — | Pending |
| SEO-10 | — | Pending |
| DSGN-01 | — | Pending |
| DSGN-02 | — | Pending |
| DSGN-03 | — | Pending |

**Coverage:**
- v2 requirements: 36 total
- Mapped to phases: 0
- Unmapped: 36 (awaiting roadmap)

---
*Requirements defined: 2026-04-11*
*Last updated: 2026-04-11 after milestone v2.0 definition*
