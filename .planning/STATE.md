# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Real estate agents land on the site, immediately feel "this is for me," and book an appointment
**Current focus:** Phase 9 — Interactive Islands

## Current Position

Phase: 9 of 10 (Interactive Islands)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-04-14 — Completed 09-03 (@astrojs/react integration + /api/analyze Cloudflare Worker endpoint)

Progress: [###############░░░░░] Phase 9 underway — 09-01, 09-02, 09-03 complete

## Performance Metrics

**Velocity:**
- Total plans completed: 17 (16 v1.0 + 1 v2.0)
- Average duration: unknown
- Total execution time: unknown

**By Phase:**

| Phase | Plans | Milestone |
|-------|-------|-----------|
| 1–5 | 16/16 | v1.0 Complete |
| 6 | 2/2 | v2.0 Phase complete |
| 7–10 | 0/10 | v2.0 Not started |

## Accumulated Context

### Decisions

- [v2-init]: Astro replaces Next.js — less complexity, better suited for content site
- [v2-init]: Cloudflare Workers replaces Hostinger VPS — free hosting, zero server management
- [v2-init]: Sanity Studio moves to Sanity-hosted (studio.nestorsegura.com) — no /studio route in Astro project
- [v2-init]: Same Sanity content model preserved — schemas unchanged, only frontend changes
- [v2-init]: Fonts switch to Clash Display (headings) + Chivo (body)
- [v2-init]: React only for interactive islands (NavbarClient, AnalysePageClient) — all blocks are .astro (zero JS)
- [06-01]: @cloudflare/vite-plugin pinned to 1.25.6 — 1.31.2 has Rolldown/workerd CJS runtime bug (require_dist is not a function in pre-bundled Astro modules)
- [06-01]: @sanity/astro version is ^3.x (not ^1.x) — @sanity/astro@3.3.1 is the Astro 6 compatible version; requires react/react-dom/react-is as peer deps
- [06-01]: wrangler.jsonc has no main field — @cloudflare/vite-plugin validates main path at startup before dist/ exists; adapter provides entry point automatically
- [06-01]: Build output is dist/server/entry.mjs + dist/client/ — NOT dist/_worker.js/index.js (changed in @astrojs/cloudflare@13); wrangler:dev uses dist/server/wrangler.json (adapter-generated)
- [06-01]: compatibility_date=2026-03-05 — installed workerd (via @cloudflare/vite-plugin@1.25.6) max supported date
- [06-01]: env vars renamed NEXT_PUBLIC_ -> PUBLIC_ in .env.local; sanity.config.ts updated with PUBLIC_ prefix + fallback hardcoded values
- [06-02]: import { sanityClient } from 'sanity:client' — named export from @sanity/astro virtual module; works in .astro frontmatter at build time
- [06-02]: Sanity fetch runs at prerender time (output=static); data is baked into HTML during astro build — no runtime Worker fetch needed
- [06-02]: siteSettings document confirmed populated in production: siteName="nestorsegura.com", tagline="Web Design für Immobilienmakler"
- [07-01]: File-based routing for translated segments (/analyse vs /en/analyze) — simpler than middleware rewrite for static output
- [07-01]: useTranslations(locale) returns the key itself for missing keys (not empty string) — makes missing translations visible in dev
- [07-01]: check-i18n-keys.mjs exits 0 (warnings only, not build blocker) — change to exit(1) when enforcement desired
- [07-01]: /de/* redirect in public/_redirects, not Astro middleware — zero-runtime, Cloudflare edge handles it
- [07-01]: @sanity/document-internationalization@^6.1.0 installed — was referenced in sanity/config.ts but missing from package.json (required --legacy-peer-deps)
- [07-02]: Two-query GROQ fallback pattern — order(language == $locale desc) is invalid GROQ syntax; use two sequential fetches (exact locale, then 'de' fallback) in getPageWithFallback
- [07-02]: Font subsetting via pip3 fonttools + brotli — @web-alchemy/fonttools npx approach fails (WASM pyodide error); pip3 pyftsubset works; one-time step, not in package.json
- [07-02]: BaseLayout.astro is the single HTML shell for all locale pages — owns doctype, meta, font preloads (crossorigin), lang attribute, global.css import
- [07-02]: getPageWithFallback returns { page, isFallback } tuple — isFallback drives translation-pending banner; DE root never shows banner (source-of-truth locale)
- [08-01]: OKLCH hue 290 confirmed for Jibemates purple primary scale (11 steps, 50-950); brand neutrals #131313 and #efeeec
- [08-01]: blockContent uses annotations (not decorators) for callout/highlight — required for markDef access in astro-portabletext
- [08-01]: @sanity/image-url already transitively installed via sanity@4.22.0 — no extra install needed
- [08-01]: getSiteSettings has no language filter — siteSettings is a Sanity singleton without a language field
- [08-01]: getPostWithTranslations preserved untouched — Phase 9 locale-switcher contract requires exact current signature
- [08-02]: Real Sanity v1 _type names are heroSection/featureStrip/problemSolutionBlock/servicesBlock/testimonialsBlock/referencesBlock/faqBlock/ctaBlock — NOT landingHero/etc; components renamed to match; testimonialsBlock uses `author` (not `name`); problemSolutionBlock uses `headline` per problem (not `title`); ctaBlock uses `subtext` (not `copy`)
- [08-02]: Dual-schema dispatch — DE/EN homepages use v1 _types (heroSection etc.), ES uses landing* _types (landingHero etc.); PageBuilder dispatches all 16 cases; getHomepageWithSections prefers *-landing slug documents when both exist
- [08-02]: StackingCards.astro — reusable GSAP/ScrollTrigger pin+scrub wrapper; applied to LandingProblem, LandingPlan, ProblemSolutionBlock; Phase 9 scroll interactions should extend this pattern
- [08-02]: Lenis smooth scroll added globally in BaseLayout.astro with GSAP ScrollTrigger RAF sync; Phase 9 navbar scroll logic should use Lenis API (not raw window.scrollY)
- [08-04]: Site URL: process.env.PUBLIC_SITE_URL ?? 'https://realestatestrategy.eu' — env-overridable with hardcoded production fallback
- [08-04]: hreflang for blog posts is sparse — only locales with a post._translations document emit alternate links; /analyse pages intentionally have NO hreflang (single-locale slugs by design)
- [08-04]: Person JSON-LD uses siteSettings.siteName — currently "nestorsegura.com"; update to "Nestor Segura" in Sanity Studio before launch
- [08-04]: og-default.png is a brand-purple (#241552) placeholder at 1200x630; replace with real brand asset before launch
- [09-01]: siteSettings extended with navItems[] (key, labelDe, labelEn, labelEs), ctaLabel{ de, en, es }, ctaHref — Phase 9 data layer complete; editors must populate in Studio before MegaNav shows real content
- [09-01]: Legacy navigation[] preserved alongside new navItems[] — additive, no Phase 8 breakage
- [09-01]: SiteSettings navItems uses flat labelDe/labelEn/labelEs sibling fields (not nested locale object)
- [09-03]: @astrojs/react@5.0.3 installed — react() placed before sanity() in integrations array; tsx islands with client:visible now supported
- [09-03]: /api/analyze uses prerender=false — single route opted into Cloudflare Worker on-demand while rest of site stays static; build correctly excludes it from prerendered routes list
- [09-03]: CORS Allow-Origin: * in V1 API endpoint — tighten to PUBLIC_SITE_URL env var in LEAD-V2-01 when real PageSpeed integration lands
- [09-03]: Locale validation in /api/analyze uses ALLOWED_LOCALES as const tuple — both runtime allow-list check and TypeScript type narrowing

### Pending Todos

None.

### Blockers/Concerns

- **WATCH:** @cloudflare/vite-plugin@1.25.6 pinned. Monitor for upstream fix in newer versions. When fixed, can unpin.
- **WATCH:** compatibility_date=2026-03-05 falls behind. When @cloudflare/vite-plugin is unpinned (or updated), update compatibility_date to current.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Update domain to realestatestrategy.eu | 2026-04-13 | 79a12de | [001-update-domain-to-realestatestrategy-eu](./quick/001-update-domain-to-realestatestrategy-eu/) |
| 002 | Rename project slugs to realestatestrategy-eu | 2026-04-13 | c4d830f | [002-rename-project-slugs-to-realestatestrategy-eu](./quick/002-rename-project-slugs-to-realestatestrategy-eu/) |

## Session Continuity

Last session: 2026-04-14T11:33:49Z
Stopped at: Completed 09-03-PLAN.md — @astrojs/react integration + /api/analyze Cloudflare Worker endpoint
Resume file: None
