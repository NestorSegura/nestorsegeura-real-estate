# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Real estate agents land on the site, immediately feel "this is for me," and book an appointment
**Current focus:** Phase 4 in progress — blog listing and post detail routes complete

## Current Position

Phase: 4 of 5 (Blog and SEO) — In progress
Plan: 2 of 4 in current phase
Status: In progress
Last activity: 2026-03-15 — Completed 04-02-PLAN.md

Progress: [███████░░░] 75% (12/16 plans total)

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 5 min
- Total execution time: 0.83 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 3/3 | 21 min | 7 min |
| 02-cms-and-page-builder | 4/4 | 13 min | 3 min |
| 03-landing-page | 3/3 | 24 min | 8 min |
| 04-blog-and-seo | 2/4 | 6 min | 3 min |

**Recent Trend:**
- Last 5 plans: 4 min, 4 min, 3 min, 5 min, 3 min
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: shadcn/ui + Tailwind v4 replaces the referenced "Google Stitch" design system (dead URL — confirmed substitute)
- [Init]: Phases 3 and 4 have independent dependencies on Phase 2, meaning they can be planned/executed in parallel if desired
- [Init]: Website analysis tool (/api/analyze) ships as a stub in Phase 3; real PageSpeed API integration is v2 scope
- [01-01]: Use sanity@^4 + next-sanity@^11 — next-sanity@12 requires Next.js 16 (not yet released). Same Sanity Studio v3 generation, identical APIs.
- [01-01]: HTML lang="de" — German market target
- [01-01]: OKLCH primary light oklch(0.45 0.18 290), dark oklch(0.72 0.14 290) — jibemates purple
- [01-02]: defaultLocale: 'de', localePrefix: 'as-needed' — / serves German without prefix, /en and /es get prefixes
- [01-02]: Middleware matcher excludes api|studio|_next|_vercel — /studio exclusion critical for Sanity Studio
- [01-02]: de.json is AppConfig.Messages type source (German is source language)
- [01-02]: All app navigation must use @/i18n/navigation exports, never next/link or next/navigation directly
- [01-03]: Studio route at src/app/studio/[[...tool]]/ is outside [locale]/ so i18n middleware does not intercept it
- [01-03]: .gitignore negation !.env.local.template allows committing the template while .env.local stays secret
- [01-03]: sanityFetch<T> at src/sanity/lib/fetch.ts is DEPRECATED — use live.ts
- [02-04]: defineLive from next-sanity/live (subpath import) confirmed available in next-sanity@^11
- [02-04]: defineQuery from next-sanity (not groq) is the TypeGen-compatible GROQ wrapper
- [02-04]: SanityLive in locale layout; data-fetching entrypoint is now @/sanity/lib/live (sanityFetch + SanityLive)
- [02-04]: TypeGen generates src/types/sanity.types.ts
- [02-01]: @sanity/document-internationalization pinned to 3.3.3 (not 6.x) — v5+/v6+ require React 19.2, project has React 19.1
- [02-01]: siteSettings excluded from i18n schemaTypes — global singleton, one document for all locales
- [02-01]: defaultCtaHref on SiteSettings is a url field — global booking URL individual blocks can override
- [02-02]: Root sanity.config.ts re-export required — Sanity CLI only resolves sanity.config.(js|ts) at project root
- [02-02]: GROQ ?? operator unsupported by TypeGen parser — use coalesce() function instead for typed query results
- [02-02]: Block schemas must be registered in schemaTypes (not just page.sections) for TypeGen
- [02-02]: TypeGen workflow: npx sanity schema extract && npx sanity typegen generate
- [02-03]: CSS-only animations enforced — Intersection Observer + CSS transitions, no framer-motion/GSAP/@motionone
- [02-03]: PageBuilder uses local PageSection type (not TypeGen union) to avoid discriminated union spreading issues
- [02-03]: Block color styling uses inline OKLCH styles (not Tailwind dark: variants) so each block controls its own scheme
- [02-03]: Image rendering in Testimonials/References uses placeholders — Sanity image URL builder needed when real images are added
- [03-02]: Mock score ranges (35-84) chosen to be mediocre but realistic — motivates improvement without looking fake
- [03-02]: Server/client split for analyse page — page.tsx (server) fetches ctaHref from Sanity, AnalysePageClient.tsx (client) handles form/animation state
- [03-02]: SVG gauge animation uses CSS stroke-dashoffset transition (1s ease 0.2s) triggered by useEffect setTimeout — no framer-motion
- [03-02]: @base-ui/react is correct package name (not @base-ui-components/react) for drawer component
- [03-01]: @base-ui/react subpath import for Drawer is @base-ui/react/drawer (not @base-ui-components/react/drawer)
- [03-01]: Navbar server/client split — Navbar.tsx (server) fetches Sanity, NavbarClient.tsx (client) handles interaction
- [03-01]: IntersectionObserver sentinel pattern for sticky scroll detection — sentinel div in NavbarClient, no scroll event listener
- [03-01]: sectionId prop pattern on block components — optional override, falls back to deterministic ID matching navbar hrefs
- [03-03]: Cal.com URL used as default CTA href: https://cal.com/nestorsegura/erstgespraech — all CTAs across all locales link here
- [03-03]: Navigation includes /analyse link (not anchor) alongside anchor links — navbar handles both patterns via href value
- [03-03]: Fictional testimonials/references used as placeholder content — flagged for replacement before launch
- [03-03]: Seed script uses createOrReplace for full idempotency — safe to re-run after schema changes
- [04-01]: SanityImageSource imported from @sanity/image-url directly (not subpath /lib/types/types — path doesn't exist in installed package)
- [04-01]: Author is locale-neutral — not in documentInternationalization schemaTypes
- [04-01]: Blog reading time computed in GROQ via pt::text() not in JavaScript
- [04-02]: @tailwindcss/typography not installed — manual Tailwind classes used in PortableTextRenderer (no prose utility)
- [04-02]: TypeGen body type cast as unknown as PortableTextBlock[] — children is optional in TypeGen, required in @portabletext/react; runtime shape is compatible
- [04-02]: generateStaticParams uses client.fetch (not sanityFetch) — sanityFetch is runtime live client, client.fetch is for build-time static generation

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-Phase 3 - RESOLVED]: Website analysis tool ships as mock scores stub. Real PageSpeed API integration is v2 scope. TODO comments placed in route.ts.
- [Pre-Phase 5]: PDF generation approach for the v2 paid report is unresolved — not blocking v1 but should be decided before Phase 5 ships to avoid architectural rework.

## Session Continuity

Last session: 2026-03-15
Stopped at: Completed 04-02-PLAN.md (Blog listing page + blog post detail page)
Resume file: None
