# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-11)

**Core value:** Real estate agents land on the site, immediately feel "this is for me," and book an appointment
**Current focus:** Phase 6 — Infrastructure (Astro scaffold + Cloudflare adapter)

## Current Position

Phase: 6 of 10 (Infrastructure)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-04-13 — Completed 06-01-PLAN.md (Astro scaffold)

Progress: [##########░░░░░░░░░░] 50%+ (06-01 complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 17 (16 v1.0 + 1 v2.0)
- Average duration: unknown
- Total execution time: unknown

**By Phase:**

| Phase | Plans | Milestone |
|-------|-------|-----------|
| 1–5 | 16/16 | v1.0 Complete |
| 6 | 1/2 | v2.0 In progress |
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

### Pending Todos

None.

### Blockers/Concerns

- **WATCH:** @cloudflare/vite-plugin@1.25.6 pinned. Monitor for upstream fix in newer versions. When fixed, can unpin.
- **WATCH:** compatibility_date=2026-03-05 falls behind. When @cloudflare/vite-plugin is unpinned (or updated), update compatibility_date to current.

## Session Continuity

Last session: 2026-04-13
Stopped at: Completed 06-01-PLAN.md — Astro scaffold working
Resume file: None
