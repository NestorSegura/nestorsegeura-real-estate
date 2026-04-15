# Phase 10: Production Deployment - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the Astro site to Cloudflare Workers on the custom domain (realestatestrategy.eu), with env vars and secrets configured, a Sanity webhook triggering automatic rebuilds on content publish, and Cloudflare dashboard settings tuned so HTML output is preserved untouched. Feature work (AnalyseForm, scroll reveals) is deferred to v2.1 and is NOT part of Phase 10.

</domain>

<decisions>
## Implementation Decisions

### Domain & DNS
- **Production domain:** realestatestrategy.eu (apex canonical, www redirects to apex)
- **Old domain:** nestorsegura.com stays live alongside realestatestrategy.eu — both serve the same site (user accepts duplicate-content risk for now)
- **Preview deployments:** every branch/PR gets a `*.workers.dev` preview URL for review before merge

### Build & deploy pipeline
- **Trigger mechanism:** Cloudflare Workers Git integration — push to `main` builds & deploys automatically, no GitHub Actions YAML
- **Local deploys:** `wrangler deploy` stays available but is not the default flow

### Secrets & env vars
- **Sanity token scope:** Viewer (read-only) — build only reads published content
- **Split:** public vars (PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SITE_URL) as plain dashboard vars; SANITY_TOKEN as encrypted `wrangler secret`
- **Dataset:** preview deployments read the production Sanity dataset — no separate preview dataset
- **Claude's discretion:** exactly which PUBLIC_* vars live in the dashboard vs `wrangler.jsonc` — default to what `@astrojs/cloudflare` expects; goal is build succeeds with zero local `.env`

### Sanity → rebuild hook
- **Trigger scope:** all document types, all mutation events (create / update / delete / publish / unpublish) — simplest, noisy builds are acceptable
- **Debounce:** none — rely on Sanity webhook default firing behavior; Cloudflare queues builds
- **Claude's discretion:** deploy hook mechanism — recommend Cloudflare deploy hook URL (Sanity webhook → CF rebuild endpoint) since we're on CF Git integration, not GitHub Actions

### Pre-launch verification
- **Required smoke checks before DNS cutover:**
  1. All 3 locale homepages render (/, /en, /es) with correct content + fonts
  2. sitemap.xml, robots.txt, og-default.png all return 200 with expected content
  3. Lighthouse mobile performance ≥ 90
- **Launch gate:** BOTH automated smoke checks AND Nestor's manual walkthrough of the preview URL must pass before DNS flip

### Cloudflare dashboard settings
- **Auto Minify HTML:** OFF (confirmed, roadmap requirement)
- **Claude's discretion:** whether to also disable Rocket Loader, Email Obfuscation, and other HTML-rewriting features — default to disabling anything that mutates Astro's server-rendered HTML

### Rollback
- **Strategy:** Cloudflare Workers built-in "Rollback to previous deployment" in the dashboard if a prod deploy breaks the site — no custom tooling needed

</decisions>

<specifics>
## Specific Ideas

- User explicitly chose CF Git integration over GitHub Actions — keep the pipeline "no YAML, no custom CI"
- Preview URLs per branch matter to user — must work out of the box via CF Git integration
- User accepts dual-domain live (realestatestrategy.eu + nestorsegura.com) — do NOT add a redirect from nestorsegura.com to realestatestrategy.eu in this phase

</specifics>

<deferred>
## Deferred Ideas

- 301 redirect from nestorsegura.com → realestatestrategy.eu (future SEO cleanup; user wants both live for now)
- Separate preview Sanity dataset (not needed until draft content workflow matures)
- GitHub Actions-based deploy pipeline (only revisit if CF Git integration becomes limiting)
- Sanity webhook debouncing / projection filters (only if build volume becomes a problem)
- 09-04 AnalyseForm React island and 09-05 scroll reveals (already deferred to v2.1 — out of scope for Phase 10)

</deferred>

---

*Phase: 10-production-deployment*
*Context gathered: 2026-04-15*
