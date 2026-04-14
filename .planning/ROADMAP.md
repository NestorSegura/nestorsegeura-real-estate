# Roadmap: nestorsegura.com

## Milestones

- ✅ **v1.0 Initial Launch (Next.js)** - Phases 1-5 (shipped 2026-03-16)
- 🚧 **v2.0 Astro + Cloudflare Migration** - Phases 6-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 Initial Launch (Phases 1–5) — SHIPPED 2026-03-16</summary>

### Phase 1: Foundation
**Goal**: A developer can run `npm run dev` against a correctly configured Next.js 15 + next-intl + Sanity skeleton where i18n routing works, `/studio` is accessible without locale interference, and all environment variables are documented.
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06
**Plans:** 3 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 15 with Tailwind v4, shadcn/ui, brand tokens, and directory skeleton
- [x] 01-02-PLAN.md — Configure next-intl v4 with 3 locales, middleware exclusions, and translation files
- [x] 01-03-PLAN.md — Bootstrap Sanity Studio at /studio and document all environment variables

### Phase 2: CMS and Page Builder
**Goal**: All eight Page Builder block schemas exist in Sanity Studio, TypeGen produces typed interfaces, and each block renders a React component from live Sanity data dispatched through PageBuilder.tsx.
**Depends on**: Phase 1
**Requirements**: CMS-01, CMS-02, CMS-03, CMS-04, CMS-05, CMS-06, CMS-07, BLCK-01, BLCK-02, BLCK-03, BLCK-04, BLCK-05, BLCK-06, BLCK-07, BLCK-08, BLCK-09, BLCK-10
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
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Build navbar with sticky scroll, mobile drawer, locale switcher, and add section anchor IDs to block components
- [x] 03-02-PLAN.md — Build /api/analyze POST endpoint and /analyse page with score gauges
- [x] 03-03-PLAN.md — Seed Sanity content for all 3 locales and verify complete landing page

### Phase 4: Blog and SEO
**Goal**: The blog is navigable and readable, every page has correct metadata pulled from Sanity, the sitemap covers all locales with hreflang, and Google can crawl the site without indexing `/studio`.
**Depends on**: Phase 2
**Requirements**: BLOG-01, BLOG-02, BLOG-03, SEO-01, SEO-02, SEO-03, SEO-04, SEO-05
**Plans:** 3 plans

Plans:
- [x] 04-01-PLAN.md — Update Sanity schemas (author, post, siteSettings), create image builder, extend GROQ queries, blog utilities
- [x] 04-02-PLAN.md — Build blog listing and post detail pages with portable text, TOC sidebar, and author card
- [x] 04-03-PLAN.md — Add generateMetadata, sitemap with hreflang, robots.txt, JSON-LD structured data, and OG tags

### Phase 5: Deployment
**Goal**: The site is running in production on the Hostinger VPS behind PM2, static assets are served correctly, and the Sanity revalidation webhook clears Next.js cache when content changes.
**Depends on**: Phase 3, Phase 4
**Requirements**: OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07
**Plans:** 3 plans

Plans:
- [x] 05-01-PLAN.md — Configure next.config.ts standalone output and write deploy.sh with Nginx config
- [x] 05-02-PLAN.md — Create PM2 ecosystem.config.js and document production environment variables
- [x] 05-03-PLAN.md — Implement /api/revalidate webhook handler with HMAC verification and tag-based revalidation

</details>

---

### 🚧 v2.0 Astro + Cloudflare Migration (In Progress)

**Milestone Goal:** Rewrite the site in Astro with zero-JS static blocks, React islands for interactive components, and deploy on Cloudflare Workers. Same content model, same 3 locales, better performance, free hosting.

- [ ] **Phase 6: Infrastructure** - Astro project scaffolded, Cloudflare adapter configured, Sanity client wired, dev environment working
- [x] **Phase 7: i18n and Content Layer** - Built-in Astro i18n routing live, GROQ queries locale-filtered, BaseLayout with Clash Display and Chivo fonts
- [ ] **Phase 8: Static Blocks and Blog** - All 9 block components as .astro (zero JS), PageBuilder dispatcher, blog pages, sitemap, all SEO metadata
- [ ] **Phase 9: Interactive Islands** - NavbarClient, AnalysePageClient, /api/analyze Worker function, scroll animations
- [ ] **Phase 10: Production Deployment** - Cloudflare project live, custom domain, env vars, deploy hook, Auto Minify disabled

## Phase Details

### Phase 6: Infrastructure
**Goal**: A developer can run `astro dev` against a working Astro 6 + Cloudflare adapter scaffold where the Sanity client fetches data at build time, wrangler.jsonc is valid, and the project compiles without errors.
**Depends on**: Nothing (first phase of milestone)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04
**Success Criteria** (what must be TRUE):
  1. `astro dev` starts without errors and serves a placeholder homepage
  2. `astro build` completes and outputs a Cloudflare Workers-compatible bundle (dist/_worker.js present)
  3. The Sanity client fetches data from the existing project using `@sanity/astro` with `useCdn: false`
  4. `wrangler dev` serves the built output locally without errors
**Plans**: 2 plans

Plans:
- [ ] 06-01: Scaffold Astro 6 with @astrojs/cloudflare adapter, wrangler.jsonc, nodejs_compat flag, and project skeleton
- [ ] 06-02: Configure Sanity client via @sanity/astro, wire build-time fetch, document environment variables

### Phase 7: i18n and Content Layer
**Goal**: Astro's built-in i18n routes German content at `/` (no prefix), English at `/en`, and Spanish at `/es`, all content strings load from messages/*.json, GROQ queries return locale-correct data, and BaseLayout applies Clash Display and Chivo fonts globally.
**Depends on**: Phase 6
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04, DSGN-01, DSGN-02, DSGN-03
**Success Criteria** (what must be TRUE):
  1. Visiting `/` renders German content with no locale prefix in the URL
  2. Visiting `/en` and `/es` renders the correct locale content with translated UI strings
  3. UI strings (nav labels, button text) load from messages/de.json, messages/en.json, messages/es.json via src/i18n/utils.ts
  4. GROQ queries return only the document matching the current locale's language field
  5. Headings render in Clash Display and body text renders in Chivo across all locale pages
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Stand up Astro i18n routing, src/i18n/utils.ts + routes.ts, per-locale page files (including translated /analyse segments), public/_redirects for /de/* canonicalization, and build-time missing-key audit
- [x] 07-02-PLAN.md — Install @sanity/document-internationalization, build locale-filtered GROQ helpers, subset and self-host Clash Display + Chivo fonts, author BaseLayout.astro with preloads, apply BaseLayout to all locale pages with DE fallback banner

### Phase 8: Static Blocks and Blog
**Goal**: Visiting the German homepage renders all eight content blocks from Sanity as server-rendered HTML with zero JavaScript shipped. The blog listing and post pages work for all locales. Sitemap, robots.txt, and all SEO metadata are in place.
**Depends on**: Phase 7
**Requirements**: BLCK-11, BLCK-12, BLCK-13, BLCK-14, BLCK-15, BLCK-16, BLCK-17, BLCK-18, BLCK-19, BLOG-04, BLOG-05, BLOG-06, SEO-06, SEO-07, SEO-08, SEO-09, SEO-10
**Success Criteria** (what must be TRUE):
  1. Visiting `/` renders all eight block sections (hero through CTA) with German content from Sanity — browser DevTools shows 0 kB of JavaScript for block rendering
  2. The FAQ section uses native `<details>`/`<summary>` with no JavaScript
  3. Visiting `/de/blog` (or `/blog` under German default) lists published posts and `/de/blog/[slug]` renders the full post with portable text
  4. All three locale homepages have correct `<title>`, `<meta description>`, OG tags, and Person JSON-LD pulled from Sanity siteSettings
  5. GET /sitemap.xml returns entries for all three locales with hreflang alternate links
  6. GET /robots.txt allows all paths (no /studio to block)
**Plans**: 2 plans

Plans:
- [ ] 08-01: Build all 8 block .astro components and PageBuilder.astro dispatcher
- [ ] 08-02: Build blog listing and post detail pages with astro-portabletext and getStaticPaths
- [ ] 08-03: Add @astrojs/sitemap, robots.txt, JSON-LD, OG tags, and per-page SEO metadata

### Phase 9: Interactive Islands
**Goal**: The navbar is interactive (mobile drawer, locale switcher), the /analyse page submits URLs and shows scores, and page sections animate into view as the user scrolls — all with minimal JavaScript footprint.
**Depends on**: Phase 8
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04
**Success Criteria** (what must be TRUE):
  1. On mobile, tapping the hamburger icon opens the navigation drawer without a page reload
  2. The locale switcher in the navbar navigates to the equivalent page in the target locale
  3. Submitting a URL on the /analyse page returns a JSON response with scores and displays them — the React island receives locale and labels as props, not via hooks
  4. Scrolling down the page causes sections to animate into view using Intersection Observer (no third-party animation library)
**Plans**: 2 plans

Plans:
- [ ] 09-01: Build NavbarClient React island (client:load) with mobile drawer and locale switcher
- [ ] 09-02: Rewrite AnalysePageClient as locale-prop-driven React island and implement /api/analyze as Cloudflare Worker function
- [ ] 09-03: Add vanilla JS Intersection Observer scroll animation script block

### Phase 10: Production Deployment
**Goal**: nestorsegura.com is served from Cloudflare Workers with the custom domain, environment variables configured in the dashboard, the Sanity deploy hook triggers a rebuild on content publish, and Auto Minify is disabled to preserve HTML integrity.
**Depends on**: Phase 9
**Requirements**: INFR-05, INFR-06, INFR-07, INFR-08
**Success Criteria** (what must be TRUE):
  1. nestorsegura.com serves the Astro site with HTTPS from Cloudflare Workers (verified in browser)
  2. Publishing a document in Sanity Studio triggers a Cloudflare deploy hook that rebuilds and redeploys the site within 3 minutes
  3. All environment variables (Sanity token, project ID, dataset) are set in the Cloudflare Workers dashboard and the build succeeds without a local .env file
  4. Cloudflare Auto Minify for HTML is disabled in the dashboard
**Plans**: 2 plans

Plans:
- [ ] 10-01: Create Cloudflare Pages/Workers project, configure custom domain, set env vars in dashboard
- [ ] 10-02: Wire Sanity webhook to Cloudflare deploy hook, disable Auto Minify, verify end-to-end

## Progress

**Execution Order:**
Phases execute in dependency order: 6 → 7 → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-03-15 |
| 2. CMS and Page Builder | v1.0 | 4/4 | Complete | 2026-03-15 |
| 3. Landing Page | v1.0 | 3/3 | Complete | 2026-03-15 |
| 4. Blog and SEO | v1.0 | 3/3 | Complete | 2026-03-15 |
| 5. Deployment | v1.0 | 3/3 | Complete | 2026-03-16 |
| 6. Infrastructure | v2.0 | 0/2 | Not started | - |
| 7. i18n and Content Layer | v2.0 | 2/2 | Complete | 2026-04-14 |
| 8. Static Blocks and Blog | v2.0 | 0/3 | Not started | - |
| 9. Interactive Islands | v2.0 | 0/3 | Not started | - |
| 10. Production Deployment | v2.0 | 0/2 | Not started | - |
