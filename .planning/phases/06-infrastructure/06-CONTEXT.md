# Phase 6: Infrastructure - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold an Astro 6 project with Cloudflare Workers adapter, Sanity client integration, and working dev environment. This replaces the Next.js project in-place while preserving Sanity schemas and translation files. No pages, no components, no i18n routing — just the foundation that compiles and fetches data.

</domain>

<decisions>
## Implementation Decisions

### Project structure
- Replace in-place: remove Next.js files, install Astro in the same repo. Git history preserved.
- Delete all Next.js source files upfront (src/app/, next.config.ts, middleware.ts, etc.), reference old code via git history.
- Preserve Sanity schema files (src/sanity/schemas/) — they are framework-agnostic and define the content model.
- Preserve translation files (messages/*.json) — they work with Astro's i18n approach.
- Keep: Sanity schemas, messages/*.json, .env files, .planning/, public/ assets, sanity.config.ts, sanity.cli.ts, package.json (will be rewritten).

### Rendering mode
- `output: 'static'` — all pages prerendered at build time. Only /api/analyze will be marked `prerender = false`.
- Fallback: if hybrid mode bug (#15237) blocks static + one server endpoint on Cloudflare, switch to `output: 'server'` with `prerender = true` on content pages.

### Dev workflow
- Daily driver: `astro dev` — fast, HMR, standard DX.
- Validation: manual `wrangler dev` check before important commits to test Worker compatibility.
- No automated pre-commit Cloudflare validation — keep it lightweight.

### Sanity client
- Use `@sanity/astro` official integration — provides sanityClient, handles config in astro.config.mjs.
- `useCdn: false` for all build-time fetches — always fresh data since builds are triggered by deploy hooks.
- Reuse existing environment variables (NEXT_PUBLIC_SANITY_PROJECT_ID, etc.) — rename to PUBLIC_ prefix for Astro if needed.

### Claude's Discretion
- Exact files to delete vs. preserve during Next.js cleanup
- Package.json dependency cleanup strategy
- wrangler.jsonc structure and naming conventions
- TypeScript config (tsconfig.json) setup for Astro

</decisions>

<specifics>
## Specific Ideas

- Sanity schemas live at src/sanity/schemas/ — these are the source of truth for the content model and must not be modified during infrastructure setup.
- The `nodejs_compat` flag in wrangler.jsonc is mandatory — Sanity SDK crashes without it.
- Research flagged targeting Cloudflare Workers (not Pages, which is being sunset) — use `wrangler deploy`, not `wrangler pages deploy`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-infrastructure*
*Context gathered: 2026-04-11*
