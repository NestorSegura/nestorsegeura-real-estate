# Roadmap: nestorsegura.com

## Overview

A multilingual B2B landing page that converts German real estate agents (Immobilienmakler) into booked appointments. The build starts by locking in the technical foundation and Sanity content model — both are expensive to change later — then assembles the German conversion page with all its blocks, adds blog and SEO infrastructure, and finally hardens the VPS deployment. Five phases, each delivering a coherent and independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Working Next.js 15 + next-intl + Sanity skeleton with correct i18n routing and dev environment
- [x] **Phase 2: CMS and Page Builder** - Sanity schemas locked in and all block components rendering from typed data
- [x] **Phase 3: Landing Page** - German conversion page live with all sections, CTAs, and analysis API stub
- [ ] **Phase 4: Blog and SEO** - Blog routes functional and all SEO metadata, sitemap, and structured data in place
- [ ] **Phase 5: Deployment** - Production VPS deployment working with PM2, standalone output, and revalidation webhook

## Phase Details

### Phase 1: Foundation
**Goal**: A developer can run `npm run dev` against a correctly configured Next.js 15 + next-intl + Sanity skeleton where i18n routing works, `/studio` is accessible without locale interference, and all environment variables are documented.
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts without errors and the default locale page (`/`) renders
  2. Visiting `/de` and `/es` renders the correct locale; visiting `/` does not redirect (as-needed prefix)
  3. Visiting `/studio` loads Sanity Studio without locale middleware interference
  4. All three translation files (en.json, es.json, de.json) contain the same key set with no missing keys
  5. `.env.local.template` exists with every required variable documented and typed
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 15 with Tailwind v4, shadcn/ui, brand tokens, and directory skeleton
- [x] 01-02-PLAN.md — Configure next-intl v4 with 3 locales, middleware exclusions, and translation files
- [x] 01-03-PLAN.md — Bootstrap Sanity Studio at /studio and document all environment variables

### Phase 2: CMS and Page Builder
**Goal**: All eight Page Builder block schemas exist in Sanity Studio, TypeGen produces typed interfaces, and each block renders a React component from live Sanity data dispatched through PageBuilder.tsx.
**Depends on**: Phase 1
**Requirements**: CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06, CMS-07, BLCK-01, BLCK-02, BLCK-03, BLCK-04, BLCK-05, BLCK-06, BLCK-07, BLCK-08, BLCK-09, BLCK-10
**Success Criteria** (what must be TRUE):
  1. Sanity Studio at `/studio` shows Page, Post, and SiteSettings document types with all required fields
  2. Running `npx sanity typegen generate` produces `.d.ts` types that TypeScript accepts without errors
  3. Creating a Page document in Studio with every block type results in those blocks rendering on the corresponding locale route
  4. PageBuilder.tsx logs a warning (not error) for any unknown block `_type` rather than crashing
  5. All block components use only CSS transitions — no heavy motion library calls visible in the network tab
**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Define Sanity document schemas (Page, Post, SiteSettings) with i18n plugin, singleton enforcement, and Presentation tool
- [x] 02-02-PLAN.md — Define all eight Page Builder block schemas with style fields and run TypeGen
- [x] 02-03-PLAN.md — Build PageBuilder dispatcher, eight block React components with CSS animations, and wire homepage
- [x] 02-04-PLAN.md — Wire sanityFetch with defineLive, CDN split, GROQ queries, and TypeGen config

### Phase 3: Landing Page
**Goal**: A visitor reaching `/de` immediately sees the full German conversion page — hero through FAQ — with working appointment CTAs, a functional website analysis form returning mock scores, and a fully responsive layout.
**Depends on**: Phase 2
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05
**Success Criteria** (what must be TRUE):
  1. Visiting `/de` renders all eight block sections (hero, features, problem/solution, services, testimonials, references, FAQ, CTA) with German content from Sanity
  2. Visiting `/` and `/es` renders the corresponding locale pages with translated content from Sanity
  3. Every screen section contains exactly one appointment CTA that links to the external calendar
  4. Submitting a URL to the website analysis form returns a JSON response with mock scores (performance, seo, mobile, conversion) within 2 seconds
  5. The layout is usable on a 375px viewport without horizontal overflow or broken components
  6. The navigation bar renders with logo, menu items, and a CTA button on all locales
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Build navbar with sticky scroll, mobile drawer, locale switcher, and add section anchor IDs to block components
- [x] 03-02-PLAN.md — Build /api/analyze POST endpoint and /analyse page with score gauges
- [x] 03-03-PLAN.md — Seed Sanity content for all 3 locales and verify complete landing page

### Phase 4: Blog and SEO
**Goal**: The blog is navigable and readable, every page has correct metadata pulled from Sanity, the sitemap covers all locales with hreflang, and Google can crawl the site without indexing `/studio`.
**Depends on**: Phase 2
**Requirements**: BLOG-01, BLOG-02, BLOG-03, SEO-01, SEO-02, SEO-03, SEO-04, SEO-05
**Success Criteria** (what must be TRUE):
  1. Visiting `/de/blog` shows a list of published German posts fetched from Sanity
  2. Visiting `/de/blog/[slug]` renders the full post with portable text correctly formatted
  3. Every locale page (`/`, `/de`, `/es`) has a `<title>` and `<meta name="description">` pulled from Sanity siteSettings
  4. `GET /sitemap.xml` returns entries for all three locales including correct `xhtml:link` hreflang self-references
  5. `GET /robots.txt` disallows `/studio` and allows all other paths
  6. The homepage `<head>` contains a `<script type="application/ld+json">` with Person structured data for Nestor Segura
**Plans**: TBD

Plans:
- [ ] 04-01: Build blog listing and post pages with Sanity portable text rendering
- [ ] 04-02: Implement generateMetadata in all locale pages pulling from Sanity siteSettings
- [ ] 04-03: Generate sitemap with hreflang, robots.txt blocking /studio, OpenGraph tags, and Person JSON-LD

### Phase 5: Deployment
**Goal**: The site is running in production on the Hostinger VPS behind PM2, static assets are served correctly, and the Sanity revalidation webhook clears Next.js cache when content changes.
**Depends on**: Phase 3, Phase 4
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07
**Success Criteria** (what must be TRUE):
  1. `npm run build` completes without TypeScript errors
  2. Running `deploy.sh` on the VPS results in the site serving correctly at `nestorsegura.com` including static assets and images
  3. PM2 shows the process as `online` with the correct working directory after a server restart
  4. Updating a Page document in Sanity Studio and clicking "Publish" causes the live site to reflect the change within 60 seconds
  5. `GET /studio` returns the Studio UI and `GET /api/revalidate` with a wrong secret returns 401
**Plans**: TBD

Plans:
- [ ] 05-01: Configure next.config.ts standalone output and write deploy.sh with static asset copy steps
- [ ] 05-02: Write PM2 ecosystem.config.js and document production environment variable setup
- [ ] 05-03: Implement /api/revalidate webhook handler with HMAC verification and revalidateTag calls, then end-to-end test

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5
Note: Phase 4 depends on Phase 2 (not Phase 3), so Phases 3 and 4 can be worked in parallel if needed.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-03-15 |
| 2. CMS and Page Builder | 4/4 | Complete | 2026-03-15 |
| 3. Landing Page | 3/3 | Complete | 2026-03-15 |
| 4. Blog and SEO | 0/3 | Not started | - |
| 5. Deployment | 0/3 | Not started | - |
