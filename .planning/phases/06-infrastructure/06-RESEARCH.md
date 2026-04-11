# Phase 6: Infrastructure - Research

**Researched:** 2026-04-11
**Domain:** Astro 6, @astrojs/cloudflare, @sanity/astro, Wrangler
**Confidence:** HIGH (most findings verified against official docs and Astro/Cloudflare release notes)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace in-place: remove Next.js files, install Astro in the same repo. Git history preserved.
- Delete all Next.js source files upfront (src/app/, next.config.ts, middleware.ts, etc.), reference old code via git history.
- Preserve Sanity schema files (src/sanity/schemas/) — they are framework-agnostic and define the content model.
- Preserve translation files (messages/*.json) — they work with Astro's i18n approach.
- Keep: Sanity schemas, messages/*.json, .env files, .planning/, public/ assets, sanity.config.ts, sanity.cli.ts, package.json (will be rewritten).
- `output: 'static'` — all pages prerendered at build time. Only /api/analyze will be marked `prerender = false`.
- Fallback: if hybrid mode bug (#15237) blocks static + one server endpoint on Cloudflare, switch to `output: 'server'` with `prerender = true` on content pages.
- Daily driver: `astro dev` — fast, HMR, standard DX.
- Validation: manual `wrangler dev` check before important commits to test Worker compatibility.
- Use `@sanity/astro` official integration — provides sanityClient, handles config in astro.config.mjs.
- `useCdn: false` for all build-time fetches.
- Reuse existing environment variables (NEXT_PUBLIC_SANITY_PROJECT_ID, etc.) — rename to PUBLIC_ prefix for Astro if needed.
- `nodejs_compat` flag in wrangler.jsonc is mandatory — Sanity SDK crashes without it.
- Target Cloudflare Workers (not Pages) — use `wrangler deploy`.

### Claude's Discretion
- Exact files to delete vs. preserve during Next.js cleanup
- Package.json dependency cleanup strategy
- wrangler.jsonc structure and naming conventions
- TypeScript config (tsconfig.json) setup for Astro

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 6 is a clean-room scaffold: remove the Next.js project from the existing repo, install Astro 6 with the Cloudflare Workers adapter, wire up the Sanity client via `@sanity/astro`, and verify `astro dev`, `astro build`, and `wrangler dev` all succeed. No routing, pages, or components are built — just the foundation that compiles and can fetch data.

Astro 6 (released March 10, 2026) introduces workerd as the default dev runtime for the Cloudflare adapter, which means `astro dev` runs the same Workers runtime as production. This is the headline feature that justifies Astro 6 specifically. The critical risk is that Sanity's SDKs have CommonJS internals; if `@sanity/astro` causes failures in workerd during prerendering, setting `prerenderEnvironment: 'node'` in the adapter config is the established escape hatch.

The hybrid-output bug (#15237) referenced in CONTEXT.md was resolved and closed March 16, 2026. `output: 'static'` with a single `prerender = false` endpoint works in current Astro 6. The fallback to `output: 'server'` is available but likely unnecessary.

**Primary recommendation:** Scaffold from scratch in-place — rewrite package.json, create a minimal Astro 6 project structure, configure the Cloudflare adapter with `prerenderEnvironment: 'node'` as a safety net, wire `@sanity/astro` with a test fetch in `src/pages/index.astro`, and validate with `astro dev` + `astro build` + `wrangler dev`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^6.x | Framework | Locked decision; workerd dev support |
| @astrojs/cloudflare | ^13.x | Cloudflare Workers adapter | Official adapter, generates dist/_worker.js |
| @sanity/astro | ^1.x | Sanity client integration | Official integration; provides `sanity:client` virtual module |
| wrangler | ^4.x | Local Workers dev + deploy CLI | Only CLI for Workers deployment |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tailwindcss/vite | ^4.x | Tailwind v4 Vite plugin | Already used in project; replaces @astrojs/tailwind |
| typescript | ^5.x | Type safety | Keep from existing project |
| @sanity/client | ^6.x | Peer dep of @sanity/astro | Pulled in automatically; do not install separately |

### Not Needed at This Phase
- `@astrojs/react` — not needed until Phase 7+ (interactive islands)
- `@portabletext/react` — deferred to component phases
- `next-intl`, `next-sanity`, `next-themes`, `eslint-config-next` — delete entirely

**Installation (new packages):**
```bash
npm install astro @astrojs/cloudflare @sanity/astro
npm install -D wrangler @tailwindcss/vite
```

---

## Architecture Patterns

### Minimal Astro 6 Project Structure (post-migration)

```
nestorsegura-real-estate/
├── .planning/              # Preserved — planning docs
├── messages/               # Preserved — de.json, en.json, es.json
├── public/                 # Preserved — static assets unchanged
├── src/
│   ├── env.d.ts            # New — triple-slash refs for Astro + @sanity/astro types
│   ├── pages/
│   │   └── index.astro     # New — placeholder homepage with test Sanity fetch
│   ├── sanity/
│   │   └── schemas/        # Preserved — ALL schema files untouched
│   └── styles/
│       └── global.css      # New — @import "tailwindcss"
├── .env.local              # Preserved — rename NEXT_PUBLIC_ vars to PUBLIC_
├── astro.config.mjs        # New — Astro + Cloudflare + Sanity + Tailwind config
├── package.json            # Rewritten — remove Next.js, add Astro deps
├── sanity.cli.ts           # Preserved — CLI uses it for schema extraction
├── sanity.config.ts        # Preserved — Studio config (references schemas)
├── tsconfig.json           # Rewritten — extends astro/tsconfigs/strict
└── wrangler.jsonc          # New — Workers config with nodejs_compat
```

### Pattern 1: astro.config.mjs for Static + Single Server Endpoint

**What:** `output: 'static'` with Cloudflare adapter. All pages prerender by default. One endpoint (`/api/analyze`) opts out with `export const prerender = false`.

**When to use:** Content sites where almost all pages are static. This is the locked decision.

```javascript
// Source: https://docs.astro.build/en/guides/integrations-guide/cloudflare/
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    // Safety net: use Node.js to prerender pages if Sanity SDK has workerd issues.
    // Remove this if prerendering works fine in workerd (test first without it).
    prerenderEnvironment: 'node',
  }),
  integrations: [
    sanity({
      projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
      dataset: import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
      useCdn: false,
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**Note on `prerenderEnvironment: 'node'`:** Astro 6 defaults prerendering to workerd. The Sanity SDK (`@sanity/client` internals) has CommonJS components that may fail in workerd. Setting this to `'node'` uses Node.js for the prerender/build step — on-demand SSR pages still run in workerd. If prerendering works without it, remove it for full parity with production.

### Pattern 2: wrangler.jsonc for Static + Worker

**What:** The config Cloudflare needs to deploy the Worker.

```jsonc
// Source: https://developers.cloudflare.com/workers/wrangler/configuration/
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "nestorsegura-real-estate",
  "compatibility_date": "2026-04-11",
  "compatibility_flags": ["nodejs_compat"],
  "main": "dist/_worker.js/index.js",
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  "observability": {
    "enabled": true
  }
}
```

**Key facts:**
- `nodejs_compat` with compatibility_date >= 2024-09-23 automatically enables `nodejs_compat_v2` (improved, selective polyfills). No need to specify v2 separately.
- `main` points to `dist/_worker.js/index.js` — this is where `@astrojs/cloudflare` places the Worker entry point for on-demand rendering.
- `assets.directory: "./dist"` covers prerendered static files.
- `$schema` path enables IDE validation/autocomplete.
- `wrangler.jsonc` (not `.toml`) is the Cloudflare-recommended format for new projects.

### Pattern 3: sanityClient in .astro pages

```astro
---
// Source: https://www.sanity.io/plugins/sanity-astro
import { sanityClient } from "sanity:client";

const settings = await sanityClient.fetch(
  `*[_type == "siteSettings"][0]{ siteName, tagline }`
);
---
<html>
  <head><title>{settings?.siteName}</title></head>
  <body>
    <h1>{settings?.tagline ?? 'Astro scaffold working'}</h1>
  </body>
</html>
```

### Pattern 4: tsconfig.json for Astro 6

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["@sanity/astro/module"]
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "node_modules"]
}
```

**Note:** `types: ["@sanity/astro/module"]` is equivalent to the `/// <reference types="@sanity/astro/module" />` in `env.d.ts`. Pick one approach. `tsconfig.json` is cleaner.

### Pattern 5: env.d.ts

```typescript
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />
```

### Pattern 6: Environment Variable Rename

Current `.env.local` uses `NEXT_PUBLIC_` prefix. Astro uses `PUBLIC_`.

| Current (Next.js) | Rename to (Astro) | Access in Astro |
|-------------------|-------------------|-----------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `PUBLIC_SANITY_PROJECT_ID` | `import.meta.env.PUBLIC_SANITY_PROJECT_ID` |
| `NEXT_PUBLIC_SANITY_DATASET` | `PUBLIC_SANITY_DATASET` | `import.meta.env.PUBLIC_SANITY_DATASET` |
| `SANITY_API_READ_TOKEN` | `SANITY_API_READ_TOKEN` (no change) | `import.meta.env.SANITY_API_READ_TOKEN` (server only) |
| `SANITY_API_TOKEN` | `SANITY_API_TOKEN` (no change) | `import.meta.env.SANITY_API_TOKEN` (server only) |
| `NEXT_PUBLIC_SITE_URL` | `PUBLIC_SITE_URL` | `import.meta.env.PUBLIC_SITE_URL` |

Server-side-only variables (no `PUBLIC_` prefix) are accessible in `.astro` frontmatter and API endpoints but are never exposed to the browser.

### Anti-Patterns to Avoid

- **Installing `@astrojs/react` now:** Not needed for this phase. React support is for interactive islands in later phases.
- **Keeping `next-sanity`:** Its `defineQuery` helper is Next.js specific. Existing GROQ query strings in `src/sanity/lib/queries.ts` are reusable but the `import { defineQuery } from 'next-sanity'` wrapper must be removed or replaced with plain strings.
- **Using `wrangler.toml` instead of `wrangler.jsonc`:** Cloudflare recommends `.jsonc` for new projects; some new Wrangler features only work with JSON config.
- **Setting `output: 'server'` by default:** The locked decision is `output: 'static'` — only switch as fallback.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sanity client config | Custom `createClient` setup | `@sanity/astro` integration | Provides virtual module `sanity:client`, handles config scoping |
| Cloudflare Workers entry | Custom worker wrapper | `@astrojs/cloudflare` adapter | Generates `dist/_worker.js`, manages static assets binding |
| Tailwind v4 setup | Manual PostCSS config | `@tailwindcss/vite` Vite plugin | `@astrojs/tailwind` is deprecated for Tailwind v4 |
| TypeScript path aliases | Manual `vite.resolve.alias` | `tsconfig.json` `paths` | Astro reads `tsconfig.json` paths automatically; no Vite config needed |
| `.env` parsing | `dotenv` or custom loader | Astro built-in `import.meta.env` | Astro auto-loads `.env.local`, `.env.development`, `.env.production` |

**Key insight:** The `@astrojs/cloudflare` adapter is doing significant work — it bundles the Worker, sets up the assets binding, and generates the entry point. Replacing any of it is months of work.

---

## Files to Delete (Next.js Cleanup)

### Delete entire directories
```
src/app/           — App Router pages, layouts, API routes
src/components/    — React components (port later in Phase 7+)
src/hooks/         — React hooks
src/i18n/          — next-intl config (messages/*.json kept; i18n/ deleted)
src/lib/           — Next.js-specific utilities (audit before deleting)
src/blocks/        — React block components (port later)
src/assets/        — Next.js asset imports (public/ is kept)
src/types/         — May have Next.js-specific types; audit before deleting
```

### Delete individual files
```
next.config.ts       — Next.js config
src/middleware.ts    — next-intl middleware
next-env.d.ts        — Next.js type declarations
postcss.config.mjs   — Next.js PostCSS (Tailwind v4 uses Vite plugin instead)
ecosystem.config.js  — PM2 config for old VPS deployment
deploy.sh            — Old VPS deploy script
components.json      — shadcn/ui config (no shadcn in Astro initially)
schema.json          — Next.js / Sanity generated schema extract (regenerate later)
tsconfig.tsbuildinfo — Stale build cache
```

### Preserve
```
.planning/           — Planning docs
messages/            — de.json, en.json, es.json
public/              — Static assets
sanity.config.ts     — Studio config (used by Sanity CLI + sanity.io hosted studio)
sanity.cli.ts        — CLI config (required for `sanity extract`, `sanity deploy`)
src/sanity/schemas/  — ALL schema files (framework-agnostic)
.env.local           — Rename NEXT_PUBLIC_ vars to PUBLIC_
package.json         — Will be rewritten but not deleted
```

### Audit before deciding
```
src/sanity/lib/      — client.ts uses next-sanity; queries.ts has reusable GROQ;
                       fetch.ts and live.ts are Next.js specific.
                       Keep queries.ts (just GROQ strings), delete rest.
src/sanity/config.ts — Imported by sanity.config.ts root re-export. Keep.
nginx/               — Irrelevant for Workers deploy. Delete.
```

---

## Common Pitfalls

### Pitfall 1: Sanity SDK in workerd (prerendering)
**What goes wrong:** `astro build` fails with "require is not defined" or similar CJS errors when Sanity fetches run in workerd during prerender.
**Why it happens:** `@sanity/client` and related packages have CommonJS internals. Astro 6's default prerender environment is workerd, which doesn't support `require()`.
**How to avoid:** Set `prerenderEnvironment: 'node'` in the Cloudflare adapter config. This uses Node.js for the build/prerender step while keeping on-demand routes in workerd.
**Warning signs:** Build fails at "rendering pages" step with CJS/require errors, not at "building" step.

### Pitfall 2: Missing `nodejs_compat` in wrangler.jsonc
**What goes wrong:** `wrangler dev` or deployed Worker crashes when Sanity client code tries to use Node.js APIs.
**Why it happens:** Sanity SDK uses Node.js built-ins internally. Cloudflare Workers block these unless `nodejs_compat` flag is set.
**How to avoid:** Always include `"compatibility_flags": ["nodejs_compat"]` in wrangler.jsonc. This is a locked decision from CONTEXT.md.
**Warning signs:** Worker crashes immediately on first Sanity API call with module resolution errors.

### Pitfall 3: NEXT_PUBLIC_ variables not resolving
**What goes wrong:** Sanity client gets `undefined` for projectId and dataset at build time.
**Why it happens:** Astro reads `PUBLIC_` prefix, not `NEXT_PUBLIC_`. The existing `.env.local` has `NEXT_PUBLIC_SANITY_PROJECT_ID`.
**How to avoid:** Rename variables in `.env.local` before wiring the Sanity client. Check both the `.env.local` file AND `astro.config.mjs` use the same names.
**Warning signs:** Build succeeds but Sanity fetch returns empty results; `import.meta.env.PUBLIC_SANITY_PROJECT_ID` is `undefined` in dev.

### Pitfall 4: `defineQuery` import from `next-sanity`
**What goes wrong:** Compilation fails on existing GROQ query files because `next-sanity` is deleted.
**Why it happens:** `src/sanity/lib/queries.ts` uses `import { defineQuery } from 'next-sanity'`. The function only adds TypeScript types, not runtime behavior.
**How to avoid:** When preserving queries.ts, replace `defineQuery(...)` with plain string template literals (or install `groq` package for typed GROQ). The GROQ string itself is unchanged.
**Warning signs:** TypeScript errors on `defineQuery` import after removing next-sanity.

### Pitfall 5: `wrangler dev` vs `astro dev` environment gap
**What goes wrong:** `astro dev` works but `wrangler dev` fails because `wrangler.jsonc` is wrong or `dist/` doesn't exist.
**Why it happens:** `wrangler dev` requires a prior `astro build`. The `main` path in wrangler.jsonc must match exactly what the Cloudflare adapter outputs.
**How to avoid:** Always run `astro build` before `wrangler dev`. The adapter outputs `dist/_worker.js/index.js` — verify this path matches `main` in wrangler.jsonc.
**Warning signs:** `wrangler dev` says "could not resolve main" or "no such file".

### Pitfall 6: Static output requires adapter for `prerender = false`
**What goes wrong:** Setting `export const prerender = false` on an API route fails with "adapter required" error even though `output: 'static'` is set.
**Why it happens:** Any on-demand rendered route (even a single endpoint) requires an adapter. This is expected and correct behavior.
**How to avoid:** Always install `@astrojs/cloudflare` and configure `adapter: cloudflare()` in `astro.config.mjs` even for primarily static sites that have one dynamic endpoint.
**Warning signs:** Build error stating "No adapter configured for on-demand rendering".

### Pitfall 7: Node.js version below 22
**What goes wrong:** `astro dev` or `astro build` fails with Node.js version errors.
**Why it happens:** Astro 6 requires Node.js v22.12.0 or later.
**Current environment:** `node --version` reports v25.2.1 — this is fine.
**Warning signs:** "engines" version mismatch error on `npm install`.

---

## Code Examples

### Minimal placeholder index.astro with Sanity fetch verification
```astro
---
// src/pages/index.astro
// Source: https://www.sanity.io/plugins/sanity-astro
import { sanityClient } from "sanity:client";

let sanityOk = false;
let siteName = "";
try {
  const settings = await sanityClient.fetch(
    `*[_type == "siteSettings"][0]{ siteName }`
  );
  sanityOk = !!settings;
  siteName = settings?.siteName ?? "";
} catch (e) {
  console.error("Sanity fetch failed:", e);
}
---
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Astro scaffold</title>
  </head>
  <body>
    <h1>Astro 6 + Cloudflare Workers scaffold</h1>
    <p>Sanity: {sanityOk ? `OK — ${siteName}` : "FAILED — check console"}</p>
  </body>
</html>
```

### Minimal placeholder API endpoint (tests prerender=false)
```typescript
// src/pages/api/health.ts
export const prerender = false;

export async function GET() {
  return new Response(JSON.stringify({ status: "ok", runtime: "cloudflare" }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### package.json scripts after rewrite
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "wrangler:dev": "astro build && wrangler dev"
  }
}
```

### Tailwind v4 global.css (no tailwind.config.js needed)
```css
/* src/styles/global.css */
@import "tailwindcss";
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Astro 5.2 / Tailwind v4 | `@astrojs/tailwind` is deprecated for v4; use Vite plugin |
| `wrangler.toml` | `wrangler.jsonc` recommended | Wrangler v3.91.0 | Some new Wrangler features only work with JSON config |
| `nodejs_compat` alone | `nodejs_compat` auto-enables v2 when date >= 2024-09-23 | Cloudflare 2024-09-23 | v2 does smarter selective polyfilling; no explicit v2 flag needed |
| Astro 5 dev server (Node.js simulated) | Astro 6 dev server (actual workerd) | March 2026 | Dev/prod parity; CJS incompatibilities surface earlier |
| Cloudflare Pages | Cloudflare Workers | Cloudflare 2025 | Pages is being sunset; Workers is the target platform |
| Hybrid mode bug #15237 | Fixed in March 2026 | March 16, 2026 | `output: 'static'` + `prerender=false` works; fallback unlikely needed |

**Deprecated/outdated:**
- `@astrojs/tailwind`: Do not install. Use `@tailwindcss/vite`.
- `next-sanity`: Delete. `@sanity/astro` replaces it entirely for content fetching.
- `next-intl`: Delete. i18n routing is out of scope for this phase; messages/*.json are kept.
- `output: 'hybrid'`: This was an Astro 4 term. In Astro 5/6 it's just `output: 'server'` with `prerender = true` per page, or `output: 'static'` with `prerender = false` per page.

---

## Open Questions

1. **`prerenderEnvironment: 'node'` necessity**
   - What we know: Sanity SDK has CJS internals; workerd doesn't support `require()`.
   - What's unclear: Whether current `@sanity/astro` version has resolved ESM bundling for workerd prerender.
   - Recommendation: Start with `prerenderEnvironment: 'node'` as safety net. Try removing it after first successful build to test if workerd prerendering works natively. Document the result.

2. **sanity.config.ts compatibility**
   - What we know: `sanity.config.ts` references `presentationTool` with preview URL pointing to `localhost:3000`. Studio is moving to Sanity-hosted.
   - What's unclear: Whether `presentationTool` config needs updating for Sanity-hosted Studio pointing to the new Astro/Workers URL.
   - Recommendation: Leave `sanity.config.ts` unchanged during this phase. It's Studio config, not Astro config. The preview URL can be updated when deploying to Workers.

3. **`src/sanity/lib/queries.ts` with `defineQuery`**
   - What we know: File uses `import { defineQuery } from 'next-sanity'`. The GROQ strings themselves are valid and reusable.
   - What's unclear: Whether to keep the file with a stub replacement or just delete it for Phase 6 (no pages need it yet).
   - Recommendation: Delete the entire `src/sanity/lib/` directory during cleanup. Phase 6 only needs a single test fetch in `index.astro` using raw GROQ. Queries can be reintroduced in Phase 7+ as plain strings or with the `groq` package.

---

## Sources

### Primary (HIGH confidence)
- Astro Cloudflare adapter docs — https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Astro deploy to Cloudflare — https://docs.astro.build/en/guides/deploy/cloudflare/
- Astro on-demand rendering — https://docs.astro.build/en/guides/on-demand-rendering/
- Astro install and setup — https://docs.astro.build/en/install-and-setup/
- Astro TypeScript — https://docs.astro.build/en/guides/typescript/
- Astro environment variables — https://docs.astro.build/en/guides/environment-variables/
- Astro 6.0 release post — https://astro.build/blog/astro-6/
- @sanity/astro GitHub README — https://github.com/sanity-io/sanity-astro
- Sanity Astro plugin page — https://www.sanity.io/plugins/sanity-astro
- Cloudflare Wrangler configuration — https://developers.cloudflare.com/workers/wrangler/configuration/
- Cloudflare nodejs_compat flags — https://developers.cloudflare.com/workers/configuration/compatibility-flags/

### Secondary (MEDIUM confidence)
- Astro 6 beta announcement (InfoQ) — https://www.infoq.com/news/2026/02/astro-v6-beta-cloudflare/ — Confirmed by Astro 6.0 release post
- GitHub issue #15237 resolution — https://github.com/withastro/astro/issues/15237 — Closed March 16, 2026

### Tertiary (LOW confidence)
- nodejs_compat_v2 auto-enable behavior — Based on WebSearch results citing Cloudflare docs; compatible with official docs language but not directly verified via WebFetch

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified via official Astro docs and Sanity plugin page
- Architecture patterns: HIGH — verified via official docs; wrangler.jsonc structure from Cloudflare docs
- File deletion list: MEDIUM — derived from project inspection + migration guide; some lib files need human audit
- Pitfalls: HIGH for documented issues (workerd/CJS, nodejs_compat); MEDIUM for env var rename (derived from Astro PUBLIC_ rule)
- Code examples: HIGH — derived from official documentation sources

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (Astro 6 is stable; Cloudflare adapter is stable; 30-day window)
